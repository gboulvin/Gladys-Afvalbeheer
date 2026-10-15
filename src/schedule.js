// -----------------------------------------------------------------------------
// The waste schedule of the configured address: fetched from the collector,
// normalized, kept in memory and in /data, and queried by the devices, the
// widgets, the scene triggers and the scene actions.
//
// A collection is `{ date: 'YYYY-MM-DD', type, name, id }`:
//   - type: canonical waste type (src/wasteTypes.js), e.g. 'paper';
//   - name: the provider's own name of the fraction ('Papiers-cartons');
//   - id:   the fraction identifier at this address (the type, or
//           'other-<slug>' for an unmapped fraction) — one device per id.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';
import { findCollector } from './collectors/index.js';
import { addressKey, addressOf } from './config.js';
import { addDays, daysBetween, localNow, parseDate } from './dates.js';
import { fractionId, mapWasteType, OTHER } from './wasteTypes.js';

const logger = createLogger({ name: 'schedule' });

// A reminder fires within this many hours after its configured hour: a
// container (re)started at 23:00 does not announce this morning's collection.
export const REMINDER_WINDOW_HOURS = 3;

export const REMINDERS = {
  TODAY: 'collection_today',
  TOMORROW: 'collection_tomorrow',
};

/**
 * Normalize the raw `{ date, name, names? }` entries of a collector: valid
 * dates only, from `today` on, mapped, de-duplicated, sorted by date then name.
 */
export function normalizeCollections(raw, today) {
  const seen = new Set();
  const collections = [];
  for (const item of raw ?? []) {
    const date = parseDate(item?.date);
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    if (!date || !name || date < today) {
      continue;
    }
    // A multilingual fraction (Recycle!) is mapped from any of its names.
    let type = mapWasteType(name);
    for (const other of Object.values(item.names ?? {})) {
      if (type !== OTHER) {
        break;
      }
      type = mapWasteType(other);
    }
    const id = fractionId(type, name);
    const dedupKey = `${date}|${id}`;
    if (seen.has(dedupKey)) {
      continue;
    }
    seen.add(dedupKey);
    collections.push({ date, type, name, id });
  }
  return collections.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function createSchedule({ store, clock = () => new Date() }) {
  let state = null;
  let lastError = null;
  let refreshing = null;

  const today = () => localNow(clock()).date;

  async function persist() {
    await store.save(state);
  }

  const schedule = {
    async init() {
      state = await store.load();
    },

    /** Today's date in the covered countries ('YYYY-MM-DD'). */
    today,

    /** The future collections (today included), sorted. */
    upcoming(from = today()) {
      return (state?.collections ?? []).filter((collection) => collection.date >= from);
    },

    /** The collections of one day. */
    on(date) {
      return this.upcoming(date).filter((collection) => collection.date === date);
    },

    /**
     * The next collection of every fraction known at the address, with the
     * days left: `[{ id, type, name, date, days }]`, soonest first. A
     * fraction stays listed (date null) once it ran past the fetched horizon,
     * so its device is not lost between two fetches.
     */
    fractions(from = today()) {
      const next = new Map();
      for (const collection of state?.collections ?? []) {
        if (!next.has(collection.id)) {
          next.set(collection.id, { ...collection, date: null, days: null });
        }
        const entry = next.get(collection.id);
        if (collection.date >= from && entry.date === null) {
          Object.assign(entry, {
            date: collection.date,
            name: collection.name,
            days: daysBetween(from, collection.date),
          });
        }
      }
      return [...next.values()].sort(
        (a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || a.id.localeCompare(b.id),
      );
    },

    /** The next collection, optionally of one waste type, or null. */
    next(type, from = today()) {
      const found = this.upcoming(from).find((collection) => !type || collection.type === type);
      return found ? { ...found, days: daysBetween(from, found.date) } : null;
    },

    get fetchedAt() {
      return state?.fetchedAt ?? null;
    },

    get lastError() {
      return lastError;
    },

    /** Was the schedule fetched for this configuration and recently enough? */
    isRefreshDue(config) {
      if (!state || state.addressKey !== addressKey(config) || !state.fetchedAt) {
        return true;
      }
      const age = clock().getTime() - new Date(state.fetchedAt).getTime();
      return age >= config.refresh_interval_hours * 3_600_000;
    },

    /**
     * Fetch the schedule from the collector. Concurrent calls share one
     * request. Throws when the collector fails; the previous schedule is kept.
     */
    async refresh(config) {
      if (!refreshing) {
        refreshing = (async () => {
          const collector = findCollector(config.collector);
          if (!collector) {
            throw new Error(`Unknown collector "${config.collector}"`);
          }
          const key = addressKey(config);
          if (state.addressKey !== key) {
            // Another address: forget the old schedule and caches.
            Object.assign(state, {
              addressKey: key,
              collections: [],
              fetchedAt: null,
              collectorCache: {},
            });
          }
          const cache = (state.collectorCache[collector.key] ??= {});
          const day = today();
          try {
            const raw = await collector.driver.fetch(addressOf(config), {
              auth: cache,
              today: day,
            });
            const collections = normalizeCollections(raw, day);
            if (collections.length === 0) {
              throw new Error('The collector answered but returned no collection for this address');
            }
            Object.assign(state, { collections, fetchedAt: clock().toISOString() });
            lastError = null;
            logger.info(`${collections.length} collections fetched from ${collector.key}`);
            return collections;
          } catch (err) {
            lastError = err;
            throw err;
          } finally {
            await persist();
          }
        })().finally(() => {
          refreshing = null;
        });
      }
      return refreshing;
    },

    /**
     * The reminders due now and not fired yet, marked as fired:
     * `[{ trigger, date, collections }]`. `collections` may be empty (nothing
     * collected that day): the reminder is still consumed for the day.
     */
    async takeDueReminders(config) {
      const { date, hour } = localNow(clock());
      const inWindow = (start) => hour >= start && hour < start + REMINDER_WINDOW_HOURS;
      const due = [];
      const candidates = [
        { trigger: REMINDERS.TODAY, start: config.morning_reminder_hour, day: date },
        { trigger: REMINDERS.TOMORROW, start: config.evening_reminder_hour, day: addDays(date, 1) },
      ];
      for (const { trigger, start, day } of candidates) {
        const firedKey = `${trigger}:${date}`;
        if (!inWindow(start) || state.firedReminders[firedKey]) {
          continue;
        }
        // No schedule yet: wait for it rather than consume the reminder.
        if (!state.fetchedAt || state.addressKey !== addressKey(config)) {
          continue;
        }
        state.firedReminders[firedKey] = true;
        due.push({ trigger, date: day, collections: this.on(day) });
      }
      if (due.length > 0) {
        // Forget the reminders of more than a week ago.
        const limit = addDays(date, -7);
        for (const key of Object.keys(state.firedReminders)) {
          if (key.split(':')[1] < limit) {
            delete state.firedReminders[key];
          }
        }
        await persist();
      }
      return due;
    },
  };
  return schedule;
}
