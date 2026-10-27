// -----------------------------------------------------------------------------
// The whole integration against the SDK's fake Gladys (which refuses what
// Gladys refuses), a fake clock and canned collector answers.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateWidgetContent } from '@gladysassistant/integration-sdk';
import { createFakeGladys } from '@gladysassistant/integration-sdk/testing';
import { createApp, RETRY_AFTER_FAILURE_MS } from '../src/app.js';
import { createStore } from '../src/store.js';
import { NEXT_COLLECTION_WIDGET, UPCOMING_COLLECTIONS_WIDGET } from '../src/widgets.js';
import { fakeClock, mockFetch, RECYCLE_CONFIG, recycleRoutes, tempDataDir } from './helpers.js';

const SCHEDULE = [
  ['2026-10-16', 'Déchets résiduels'],
  ['2026-10-16', 'Déchets organiques'],
  ['2026-10-19', 'PMC'],
  ['2026-10-23', 'Déchets résiduels'],
  ['2026-10-26', 'Papiers-cartons'],
];

async function setup(t, { config = RECYCLE_CONFIG, now = '2026-10-15T08:00:00Z', routes } = {}) {
  const calls = mockFetch(t, routes ?? recycleRoutes(SCHEDULE));
  const dataDir = await tempDataDir();
  const clock = fakeClock(now);
  const gladys = createFakeGladys({ config });
  const app = createApp(gladys, { store: createStore(dataDir), clock });
  await gladys.connect();
  return { gladys, app, clock, calls, dataDir };
}

test('on connection, the schedule is fetched and one device per fraction published', async (t) => {
  const { gladys, app } = await setup(t);
  await app.onConnected();

  const devices = gladys.fake.discoveredDevices;
  assert.deepEqual(
    devices.map((device) => device.name),
    [
      'Collecte – Déchets organiques',
      'Collecte – Ordures ménagères',
      'Collecte – PMC / emballages',
      'Collecte – Papiers-cartons',
    ],
  );
  const paper = devices.find((device) => device.name.endsWith('Papiers-cartons'));
  assert.equal(paper.external_id, 'ext:test-integration:waste:recycleapp-6000-1-paper');
  assert.deepEqual(
    paper.features.map((feature) => [feature.category, feature.type, feature.unit]),
    [
      ['duration', 'integer', 'days'],
      ['text', 'text', undefined],
    ],
  );

  // Gladys stores min/max as NOT NULL: a feature without them is a 422.
  for (const feature of devices.flatMap((device) => device.features)) {
    assert.equal(typeof feature.min, 'number', `${feature.external_id}: min`);
    assert.equal(typeof feature.max, 'number', `${feature.external_id}: max`);
  }

  assert.equal(gladys.fake.lastState(`${paper.external_id}:days`), 11);
  assert.equal(gladys.fake.lastState(`${paper.external_id}:next`), 'lundi 26 octobre');
  assert.equal(gladys.fake.connectionStatus.connected, true);
});

test('the day count moves at midnight without fetching again', async (t) => {
  const { gladys, app, clock, calls } = await setup(t, {
    config: { ...RECYCLE_CONFIG, refresh_interval_hours: 24 },
  });
  await app.onConnected();
  const fetches = calls.length;
  const residual = 'ext:test-integration:waste:recycleapp-6000-1-residual';
  assert.equal(gladys.fake.lastState(`${residual}:days`), 1);

  clock.set('2026-10-16T05:00:00Z'); // 07:00 in Brussels
  await app.tick();
  assert.equal(calls.length, fetches);
  assert.equal(gladys.fake.lastState(`${residual}:days`), 0);
  assert.equal(gladys.fake.lastState(`${residual}:next`), 'vendredi 16 octobre');
});

test('the evening reminder fires once per fraction collected tomorrow, never twice', async (t) => {
  const { gladys, app, clock, dataDir } = await setup(t, { now: '2026-10-15T16:30:00Z' });
  await app.onConnected(); // 18:30 in Brussels: before the 19:00 reminder
  assert.equal(gladys.fake.sceneEvents.length, 0);

  clock.set('2026-10-15T17:05:00Z'); // 19:05
  await app.tick();
  const events = gladys.fake.sceneEvents;
  assert.deepEqual(
    events.map((event) => [event.key ?? event.trigger, event.data.waste_type]),
    [
      ['collection_tomorrow', 'organic'],
      ['collection_tomorrow', 'residual'],
    ],
  );
  assert.deepEqual(events[1].data, {
    waste_type: 'residual',
    waste_name: 'Ordures ménagères',
    date: '2026-10-16',
    date_text: 'vendredi 16 octobre',
    all_waste_names: 'Déchets organiques, Ordures ménagères',
  });

  await app.tick();
  assert.equal(gladys.fake.sceneEvents.length, 2);

  // A restart (new app, same /data) does not fire the reminder again.
  const restarted = createApp(gladys, { store: createStore(dataDir), clock });
  await restarted.onConnected();
  assert.equal(gladys.fake.sceneEvents.length, 2);

  // The next morning, the "today" reminder fires.
  clock.set('2026-10-16T05:10:00Z'); // 07:10
  await restarted.tick();
  assert.deepEqual(
    gladys.fake.sceneEvents.slice(2).map((event) => event.data.waste_type),
    ['organic', 'residual'],
  );
  const state = JSON.parse(await readFile(join(dataDir, 'state.json'), 'utf8'));
  assert.ok(state.firedReminders['collection_today:2026-10-16']);
});

test('a reminder hour long past does not fire after a late start', async (t) => {
  const { gladys, app } = await setup(t, { now: '2026-10-15T21:30:00Z' }); // 23:30
  await app.onConnected();
  // 23:30 is within 3 hours of 19:00? No: 19 + 3 = 22.
  assert.equal(gladys.fake.sceneEvents.length, 0);
});

test('a failing collector keeps the last schedule and retries 15 minutes later', async (t) => {
  let down = false;
  const routes = recycleRoutes(SCHEDULE).map(([pattern, answer]) => [
    pattern,
    () => (down ? new Response('down', { status: 503 }) : answer),
  ]);
  const { gladys, app, clock, calls } = await setup(t, { routes });
  await app.onConnected();

  down = true;
  clock.set('2026-10-17T08:00:00Z'); // past the 12 h refresh interval
  await app.tick();
  assert.equal(gladys.fake.connectionStatus.connected, false);
  assert.match(gladys.fake.connectionStatus.message.fr, /injoignable/);
  assert.equal(app.schedule.upcoming().length, 3); // 2026-10-16 is past now
  assert.equal(gladys.fake.transports.at(-1).degraded, true);

  const attempts = calls.length;
  clock.advance(60_000);
  await app.tick();
  assert.equal(calls.length, attempts, 'no retry within 15 minutes');

  down = false;
  clock.advance(RETRY_AFTER_FAILURE_MS);
  await app.tick();
  assert.equal(gladys.fake.connectionStatus.connected, true);
});

test('an incomplete configuration is reported, nothing is fetched', async (t) => {
  const { gladys, app, calls } = await setup(t, {
    config: { collector: 'recycleapp', postcode: '6000', house_number: '1' },
  });
  await app.onConnected();
  assert.equal(calls.length, 0);
  assert.equal(gladys.fake.connectionStatus.connected, false);
  assert.match(gladys.fake.connectionStatus.message.en, /street/);
  await assert.rejects(app.fetchScheduleAction(), /street/);
});

test('the manifest action fetches now and says what comes next', async (t) => {
  const { gladys, app } = await setup(t);
  await app.onConnected();
  const message = await app.fetchScheduleAction();
  assert.equal(
    message.fr,
    '5 collectes trouvées. Prochaine : Déchets organiques — vendredi 16 octobre.',
  );
  assert.ok(gladys.fake.widgetRefreshes.length > 0);
});

test('scene actions return the next collection and refresh the schedule', async (t) => {
  const { app } = await setup(t);
  await app.onConnected();
  assert.deepEqual(await app.sceneAction('get_next_collection', { waste_type: 'paper' }), {
    found: true,
    waste_type: 'paper',
    waste_name: 'Papiers-cartons',
    date: '2026-10-26',
    date_text: 'lundi 26 octobre',
    days_until: 11,
  });
  assert.equal((await app.sceneAction('get_next_collection', {})).waste_type, 'organic');
  assert.equal(
    (await app.sceneAction('get_next_collection', { waste_type: 'glass' })).found,
    false,
  );
  assert.deepEqual(await app.sceneAction('refresh_schedule', {}), { collections_count: 5 });
});

test('the widgets render exactly as sent, in the viewer language', async (t) => {
  const { gladys, app } = await setup(t);
  await app.onConnected();

  const next = await app.widgets[NEXT_COLLECTION_WIDGET].get(gladys, { language: 'en' });
  assert.deepEqual(validateWidgetContent(next), []);
  assert.equal(next.components[0].text, 'Organic waste, Residual waste');
  assert.equal(next.components[1].value, 1);
  assert.match(next.components[2].text, /^Tomorrow · Friday, October 16/);

  const list = await app.widgets[UPCOMING_COLLECTIONS_WIDGET].get(gladys, {
    language: 'de',
    settings: { max_items: 3 },
  });
  assert.deepEqual(validateWidgetContent(list), []);
  assert.deepEqual(
    list.components[0].items.map((item) => [item.title, item.badge.text]),
    [
      ['Biomüll', 'Morgen'],
      ['Restmüll', 'Morgen'],
      ['Verpackungen', 'In 4 Tagen'],
    ],
  );

  const toast = await app.widgets[NEXT_COLLECTION_WIDGET].action(gladys, { actionKey: 'refresh' });
  assert.equal(toast.es, 'Calendario actualizado');
});

test('the widgets show an empty state before the first fetch', async (t) => {
  const { gladys, app } = await setup(t, { config: {} });
  await app.onConnected();
  for (const widget of Object.values(app.widgets)) {
    const content = await widget.get(gladys, { language: 'es', settings: {} });
    assert.deepEqual(validateWidgetContent(content), []);
    assert.match(content.components[0].text, /Aún no hay recogidas/);
  }
});

test('a new address forgets the old schedule', async (t) => {
  const { gladys, app } = await setup(t);
  await app.onConnected();
  await app.onConfigUpdated({ ...RECYCLE_CONFIG, house_number: '3', language: 'en' });
  assert.ok(
    gladys.fake.discoveredDevices.every((device) =>
      device.external_id.includes('recycleapp-6000-3-'),
    ),
  );
  assert.equal(gladys.fake.discoveredDevices[0].name, 'Collection – Organic waste');
});

const NOMINATIM_CHARLEROI = {
  address: {
    house_number: '1',
    road: 'Rue de la Montagne',
    city: 'Charleroi',
    postcode: '6000',
    country_code: 'be',
  },
};
const HOUSE = { id: 'h1', name: 'Maison', selector: 'maison', latitude: 50.41, longitude: 4.44 };

async function setupHouse(
  t,
  { config, houses = [HOUSE], geocode = NOMINATIM_CHARLEROI, extraRoutes = [] } = {},
) {
  const calls = mockFetch(t, [[/nominatim/, geocode], ...extraRoutes, ...recycleRoutes(SCHEDULE)]);
  const gladys = createFakeGladys({ config, houses });
  const app = createApp(gladys, {
    store: createStore(await tempDataDir()),
    clock: fakeClock('2026-10-15T08:00:00Z'),
  });
  await gladys.connect();
  return { gladys, app, calls };
}

test('picking a house is enough: its address comes from its location', async (t) => {
  const { gladys, app, calls } = await setupHouse(t, {
    config: { collector: 'recycleapp', house: 'maison', language: 'fr' },
  });
  await app.onConnected();

  const geocode = new URL(calls.find((call) => call.url.includes('nominatim')).url);
  assert.equal(geocode.searchParams.get('lat'), '50.41');
  assert.equal(geocode.searchParams.get('lon'), '4.44');
  const streets = new URL(calls.find((call) => call.url.includes('/streets')).url);
  assert.equal(streets.searchParams.get('q'), 'Rue de la Montagne');
  assert.equal(gladys.fake.connectionStatus.connected, true);
  assert.equal(gladys.fake.discoveredDevices.length, 4);
  // Same ids as with the address typed in: nothing to re-create.
  assert.ok(
    gladys.fake.discoveredDevices.every((device) =>
      device.external_id.includes('recycleapp-6000-1-'),
    ),
  );

  // Geocoded once: a refresh does not ask OpenStreetMap again.
  await app.refreshNow();
  assert.equal(calls.filter((call) => call.url.includes('nominatim')).length, 1);
});

test('a typed address field overrides the geocoded one', async (t) => {
  const { gladys, app } = await setupHouse(t, {
    config: { collector: 'recycleapp', house: 'maison', house_number: '3', language: 'fr' },
  });
  await app.onConnected();
  assert.ok(
    gladys.fake.discoveredDevices.every((device) =>
      device.external_id.includes('recycleapp-6000-3-'),
    ),
  );
});

test('a complete typed address does not read the house at all', async (t) => {
  const { app, calls } = await setupHouse(t, {
    config: { ...RECYCLE_CONFIG, house: 'maison' },
  });
  await app.onConnected();
  assert.ok(!calls.some((call) => call.url.includes('nominatim')));
});

test('an unlocated, unknown or foreign house says what to do', async (t) => {
  const cases = [
    [{ houses: [{ ...HOUSE, latitude: null, longitude: null }] }, /no location/],
    [{ houses: [] }, /no longer exists/],
    [
      { geocode: { address: { postcode: '75001', country_code: 'fr', house_number: '1' } } },
      /neither in Belgium nor in the Netherlands/,
    ],
    [
      { geocode: { address: { postcode: '6000', road: 'Rue X', country_code: 'be' } } },
      /house number/,
    ],
  ];
  for (const [options, message] of cases) {
    const { gladys, app } = await setupHouse(t, {
      ...options,
      config: { collector: 'recycleapp', house: 'maison' },
    });
    await app.onConnected();
    assert.equal(gladys.fake.connectionStatus.connected, false);
    assert.match(gladys.fake.connectionStatus.message.en, message);
    assert.equal(gladys.fake.discoveredDevices?.length ?? 0, 0);
    t.mock.restoreAll();
  }
});

test('the fetch button retries a house placed on the map since', async (t) => {
  const houses = [{ ...HOUSE, latitude: null, longitude: null }];
  const { gladys, app } = await setupHouse(t, {
    houses,
    config: { collector: 'recycleapp', house: 'maison', language: 'fr' },
  });
  await app.onConnected();
  assert.match(gladys.fake.connectionStatus.message.en, /no location/);

  gladys.fake.houses = [HOUSE];
  const message = await app.fetchScheduleAction();
  assert.match(message.fr, /^5 collectes trouvées/);
  assert.equal(gladys.fake.connectionStatus.connected, true);
});

test('an unreachable geocoder is retried 15 minutes later', async (t) => {
  let down = true;
  mockFetch(t, [
    [/nominatim/, () => (down ? new Response('busy', { status: 503 }) : NOMINATIM_CHARLEROI)],
    ...recycleRoutes(SCHEDULE),
  ]);
  const clock = fakeClock('2026-10-15T08:00:00Z');
  const gladys = createFakeGladys({
    config: { collector: 'recycleapp', house: 'maison' },
    houses: [HOUSE],
  });
  const app = createApp(gladys, { store: createStore(await tempDataDir()), clock });
  await gladys.connect();
  await app.onConnected();
  assert.match(gladys.fake.connectionStatus.message.en, /could not be reached/);

  down = false;
  clock.advance(RETRY_AFTER_FAILURE_MS);
  await app.tick();
  assert.equal(gladys.fake.connectionStatus.connected, true);
});

test('when Nominatim refuses (rate limit), Photon gives the address', async (t) => {
  const photon = {
    features: [
      {
        properties: {
          housenumber: '1',
          street: 'Rue de la Montagne',
          postcode: '6000',
          city: 'Charleroi',
          countrycode: 'BE',
        },
      },
    ],
  };
  const { gladys, app } = await setupHouse(t, {
    config: { collector: 'recycleapp', house: 'maison' },
    geocode: new Response('slow down', { status: 429 }),
    extraRoutes: [[/photon/, photon]],
  });
  await app.onConnected();
  assert.equal(gladys.fake.connectionStatus.connected, true);
  assert.equal(gladys.fake.discoveredDevices.length, 4);
});
