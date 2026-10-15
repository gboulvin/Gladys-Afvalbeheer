import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, formatDate, localNow, parseDate } from '../src/dates.js';

test('parseDate keeps the calendar day the provider wrote', () => {
  assert.equal(parseDate('2026-10-16'), '2026-10-16');
  assert.equal(parseDate('2026-10-16T00:00:00'), '2026-10-16');
  assert.equal(parseDate('2026-10-16T00:00:00.000Z'), '2026-10-16');
  assert.equal(parseDate('2026-10-16T00:00:00+02:00'), '2026-10-16');
  assert.equal(parseDate('16-10-2026'), '2026-10-16');
  assert.equal(parseDate('6/1/2027'), '2027-01-06');
  assert.equal(parseDate('2026-02-30'), null);
  assert.equal(parseDate('soon'), null);
  assert.equal(parseDate(undefined), null);
});

test('localNow reads the Brussels time, not the container time zone', () => {
  // 22:30 UTC in summer is 00:30 the next day in Brussels.
  assert.deepEqual(localNow(new Date('2026-07-01T22:30:00Z')), { date: '2026-07-02', hour: 0 });
  // 17:00 UTC in winter is 18:00 in Brussels.
  assert.deepEqual(localNow(new Date('2026-12-01T17:00:00Z')), { date: '2026-12-01', hour: 18 });
});

test('day arithmetic crosses months, years and DST changes', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(daysBetween('2026-10-24', '2026-10-27'), 3);
  assert.equal(daysBetween('2026-10-16', '2026-10-16'), 0);
});

test('formatDate writes the date in the requested language', () => {
  assert.equal(formatDate('2026-10-16', 'fr'), 'vendredi 16 octobre');
  assert.equal(formatDate('2026-10-16', 'en'), 'Friday, October 16');
  assert.match(formatDate('2026-10-16', 'de'), /Freitag/);
  assert.match(formatDate('2026-10-16', 'es'), /viernes/);
});
