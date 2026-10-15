import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSchedule, normalizeCollections } from '../src/schedule.js';
import { createStore } from '../src/store.js';
import { fakeClock, tempDataDir } from './helpers.js';

test('normalizeCollections drops past, invalid and duplicate entries and sorts', () => {
  const collections = normalizeCollections(
    [
      { date: '2026-10-20', name: 'PMC' },
      { date: '2026-10-14', name: 'PMC' },
      { date: 'tomorrow', name: 'PMC' },
      { date: '2026-10-16', name: '' },
      { date: '2026-10-16T00:00:00.000Z', name: 'Papiers-cartons' },
      { date: '2026-10-16', name: 'Papier' },
      { date: '2026-10-18', name: 'Frituurvet' },
      { date: '2026-10-18', name: 'Bulky?', names: { nl: 'Grofvuil' } },
    ],
    '2026-10-15',
  );
  assert.deepEqual(collections, [
    { date: '2026-10-16', type: 'paper', name: 'Papiers-cartons', id: 'paper' },
    { date: '2026-10-18', type: 'bulky', name: 'Bulky?', id: 'bulky' },
    { date: '2026-10-18', type: 'other', name: 'Frituurvet', id: 'other-frituurvet' },
    { date: '2026-10-20', type: 'pmd', name: 'PMC', id: 'pmd' },
  ]);
});

test('a fraction past the fetched horizon keeps its device, without a date', async () => {
  const store = createStore(await tempDataDir());
  await store.save({
    addressKey: 'k',
    fetchedAt: '2026-10-01T00:00:00Z',
    firedReminders: {},
    collectorCache: {},
    collections: [
      { date: '2026-10-10', type: 'christmas_tree', name: 'Sapins', id: 'christmas_tree' },
      { date: '2026-10-20', type: 'pmd', name: 'PMC', id: 'pmd' },
    ],
  });
  const schedule = createSchedule({ store, clock: fakeClock('2026-10-15T10:00:00Z') });
  await schedule.init();
  assert.deepEqual(
    schedule.fractions().map(({ id, date, days }) => [id, date, days]),
    [
      ['pmd', '2026-10-20', 5],
      ['christmas_tree', null, null],
    ],
  );
  assert.equal(schedule.next('pmd').days, 5);
  assert.equal(schedule.next('glass'), null);
});

test('a missing or corrupt state file starts empty', async () => {
  const dir = await tempDataDir();
  const store = createStore(dir);
  assert.deepEqual((await store.load()).collections, []);
});
