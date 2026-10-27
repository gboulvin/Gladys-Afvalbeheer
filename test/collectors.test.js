// -----------------------------------------------------------------------------
// Collector drivers, against canned answers shaped like the real APIs (the
// Recycle! ones were captured from the live API for Charleroi and Tournai).
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTORS, findCollector } from '../src/collectors/index.js';
import { normalizeCollections } from '../src/schedule.js';
import { mockFetch, recycleRoutes } from './helpers.js';

const TODAY = '2026-10-15';
const NL_ADDRESS = {
  postcode: '1811JL',
  houseNumber: '97',
  suffix: '',
  streetName: '',
  cityName: '',
};

async function run(key, address, auth = {}) {
  const raw = await findCollector(key).driver.fetch(address, { auth, today: TODAY });
  return normalizeCollections(raw, TODAY);
}

test('every collector has a unique key, a country among BE/NL and an area', () => {
  const keys = COLLECTORS.map((collector) => collector.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const collector of COLLECTORS) {
    assert.ok(['BE', 'NL'].includes(collector.country), collector.key);
    assert.ok(collector.area.length > 0, collector.key);
    assert.equal(typeof collector.driver.fetch, 'function', collector.key);
  }
});

test('Recycle! resolves the street, drops cancelled dates and events, caches the ids', async (t) => {
  const calls = mockFetch(
    t,
    recycleRoutes([
      ['2026-10-16', 'Déchets résiduels'],
      ['2026-10-16', 'Déchets organiques'],
      ['2026-10-19', 'PMC'],
      ['2026-10-20', 'Déchets résiduels', { exception: { replacedBy: { timestamp: 'x' } } }],
      ['2026-10-21', 'Déchets résiduels', { type: 'event' }],
      ['2026-10-26', 'Papiers-cartons'],
    ]),
  );
  const auth = {};
  const address = {
    postcode: '6000',
    houseNumber: '1',
    suffix: '',
    streetName: 'Rue de la Montagne',
  };
  const collections = await run('recycleapp', address, auth);

  assert.deepEqual(
    collections.map(({ date, type }) => [date, type]),
    [
      ['2026-10-16', 'organic'],
      ['2026-10-16', 'residual'],
      ['2026-10-19', 'pmd'],
      ['2026-10-26', 'paper'],
    ],
  );
  assert.equal(calls[0].headers['x-consumer'], 'recycleapp.be');
  const collectionsUrl = new URL(calls.find((call) => call.url.includes('/collections')).url);
  assert.equal(collectionsUrl.searchParams.get('zipcodeId'), '6000-52011');
  assert.equal(collectionsUrl.searchParams.get('houseNumber'), '1');
  assert.equal(collectionsUrl.searchParams.get('fromDate'), TODAY);

  // Second fetch: the cached ids skip the address lookup.
  calls.length = 0;
  await run('recycleapp', address, auth);
  assert.deepEqual(
    calls.map((call) => new URL(call.url).pathname.split('/').pop()),
    ['collections'],
  );
});

test('Recycle! says which street it could not find', async (t) => {
  mockFetch(t, [
    [/\/zipcodes\?/, { items: [{ id: '6000-52011', code: '6000' }] }],
    [/\/streets\?/, { items: [] }],
  ]);
  await assert.rejects(
    run('recycleapp', { postcode: '6000', houseNumber: '1', suffix: '', streetName: 'Nowhere' }),
    /street "Nowhere" not found in 6000/,
  );
});

test('Ximmio looks the address up then reads the calendar', async (t) => {
  const calls = mockFetch(t, [
    [/FetchAdress/, { dataList: [{ UniqueId: 'abc', Community: 'Enschede' }] }],
    [
      /GetCalendar/,
      {
        dataList: [
          { _pickupTypeText: 'GREY', pickupDates: ['2026-10-20T00:00:00', '2026-11-03T00:00:00'] },
          { _pickupTypeText: 'PAPER', pickupDates: ['2026-10-22T00:00:00'] },
        ],
      },
    ],
  ]);
  const collections = await run('twentemilieu', NL_ADDRESS);
  assert.deepEqual(
    collections.map(({ date, type }) => [date, type]),
    [
      ['2026-10-20', 'residual'],
      ['2026-10-22', 'paper'],
      ['2026-11-03', 'residual'],
    ],
  );
  assert.match(calls[0].url, /^https:\/\/wasteapi\.ximmio\.com/);
  assert.match(calls[1].body, /uniqueAddressID=abc/);
  assert.match(calls[1].body, /community=Enschede/);
});

test('Ximmio says when the address is unknown', async (t) => {
  mockFetch(t, [[/FetchAdress/, { dataList: [] }]]);
  await assert.rejects(run('meerlanden', NL_ADDRESS), /address not found/);
});

test('Opzet picks the suffix among the addresses of the house number', async (t) => {
  const calls = mockFetch(t, [
    [
      /\/rest\/adressen\/1811JL-97$/,
      [
        { bagId: '111', huisletter: '', huisnummerToevoeging: '' },
        { bagId: '222', huisletter: 'A', huisnummerToevoeging: '' },
      ],
    ],
    [
      /\/afvalstromen$/,
      [
        { menu_title: 'GFT', ophaaldatum: '2026-10-17' },
        { menu_title: 'Restafval', ophaaldatum: '2026-10-24' },
        { menu_title: 'Grofvuil', ophaaldatum: null },
      ],
    ],
  ]);
  const collections = await run('hvc', { ...NL_ADDRESS, suffix: 'a' });
  assert.match(calls[1].url, /\/rest\/adressen\/222\/afvalstromen$/);
  assert.deepEqual(
    collections.map(({ type }) => type),
    ['organic', 'residual'],
  );
});

test('Mijn Afvalwijzer merges this year and next year', async (t) => {
  mockFetch(t, [
    [
      /mijnafvalwijzer/,
      {
        ophaaldagen: {
          response: 'OK',
          data: [
            { date: '2026-10-01', type: 'gft' },
            { date: '2026-12-29', type: 'restafval', nameType: 'restafval' },
          ],
        },
        ophaaldagenNext: { response: 'OK', data: [{ date: '2027-01-05', type: 'papier' }] },
      },
    ],
  ]);
  const collections = await run('mijnafvalwijzer', NL_ADDRESS);
  assert.deepEqual(
    collections.map(({ date, type }) => [date, type]),
    [
      ['2026-12-29', 'residual'],
      ['2027-01-05', 'paper'],
    ],
  );
});

test('Burgerportaal signs in anonymously once and keeps the refresh token', async (t) => {
  const calls = mockFetch(t, [
    [/signupNewUser/, { refreshToken: 'refresh-1', idToken: 'id-1' }],
    [/securetoken/, { id_token: 'id-2' }],
    [/\/address\?/, [{ addressId: 'A1', addition: '' }]],
    [
      /\/calendar$/,
      [
        { collectionDate: '2026-10-20T00:00:00.000Z', fraction: 'GFT' },
        { collectionDate: '2026-10-27T00:00:00.000Z', fraction: 'PAPIER' },
      ],
    ],
  ]);
  const auth = {};
  const collections = await run('tilburg', NL_ADDRESS, auth);
  assert.deepEqual(
    collections.map(({ type }) => type),
    ['organic', 'paper'],
  );
  assert.equal(auth.refreshToken, 'refresh-1');
  assert.equal(calls.find((call) => call.url.endsWith('/calendar')).headers.authorization, 'id-1');

  calls.length = 0;
  await run('tilburg', NL_ADDRESS, auth);
  assert.ok(calls.some((call) => /securetoken/.test(call.url)));
  assert.ok(!calls.some((call) => /signupNewUser/.test(call.url)));
});

test('ROVA, Irado, RD4 and Limburg.net read their own formats', async (t) => {
  mockFetch(t, [
    [/rova\.nl/, [{ date: '2026-10-19T00:00:00Z', wasteType: { title: 'Los papier' } }]],
    [/irado\.nl/, { data: [{ date: '21/10/2026', type: 'Restafval' }] }],
    [
      /rd4\.nl/,
      (url) =>
        url.includes('year=2026')
          ? { success: true, data: { items: [[{ date: '2026-10-22', type: 'pmd' }]] } }
          : new Response('not found', { status: 404 }),
    ],
    [/gemeenten\/search/, [{ nisCode: '71022' }]],
    [/straten\/search/, [{ nummer: '42' }]],
    [
      /\/kalender\/71022\/2026-10/,
      { events: [{ date: '2026-10-23T00:00:00+0200', title: 'GFT' }] },
    ],
    [/\/kalender\/71022\//, { events: [] }],
  ]);
  assert.deepEqual(
    (await run('rova', NL_ADDRESS)).map(({ type }) => type),
    ['paper'],
  );
  assert.deepEqual(
    (await run('irado', NL_ADDRESS)).map(({ date }) => date),
    ['2026-10-21'],
  );
  assert.deepEqual(
    (await run('rd4', { ...NL_ADDRESS, postcode: '6411AB' })).map(({ type }) => type),
    ['pmd'],
  );
  const limburg = await run('limburg.net', {
    postcode: '3500',
    houseNumber: '1',
    suffix: '',
    streetName: 'Grote Markt',
    cityName: 'Hasselt',
  });
  assert.deepEqual(
    limburg.map(({ date, type }) => [date, type]),
    [['2026-10-23', 'organic']],
  );
});

test('a provider error surfaces with its status and host', async (t) => {
  mockFetch(t, [[/rova\.nl/, new Response('boom', { status: 503 })]]);
  await assert.rejects(run('rova', NL_ADDRESS), /HTTP 503 from www\.rova\.nl/);
});

test('Recycle! finds a street written with other accents (OpenStreetMap vs Recycle!)', async (t) => {
  const calls = mockFetch(t, [
    [/\/zipcodes\?/, { items: [{ id: '6000-52011', code: '6000' }] }],
    [
      /\/streets\?/,
      (url) =>
        new URL(url).searchParams.get('q') === 'rue bassle'
          ? { items: [{ id: 'street-bassle', name: 'Rue Bassle', names: {} }] }
          : { items: [] },
    ],
    [/\/collections\?/, { items: [], pages: 1 }],
  ]);
  const auth = {};
  await findCollector('recycleapp').driver.fetch(
    { postcode: '6000', houseNumber: '10', suffix: '', streetName: 'Rue Basslé' },
    { auth, today: TODAY },
  );
  assert.equal(auth.ids.streetId, 'street-bassle');
  assert.deepEqual(
    calls
      .filter((call) => call.url.includes('/streets'))
      .map((call) => new URL(call.url).searchParams.get('q')),
    ['Rue Basslé', 'rue bassle'],
  );
});
