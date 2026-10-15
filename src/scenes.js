// -----------------------------------------------------------------------------
// Scenes (Gladys 5.1+).
//
// Triggers — fired by the integration itself (publishSceneEvent), once a day
// per fraction, at the hours set in the configuration:
//   - collection_tomorrow: in the evening, for every fraction collected
//     tomorrow ("put the paper bin out");
//   - collection_today: in the morning, for every fraction collected today.
// The scene author filters on the waste types and reads
// {{triggerEvent.data.waste_name}}, {{triggerEvent.data.date_text}} and
// {{triggerEvent.data.all_waste_names}} in the following actions.
//
// Actions — operations a scene runs:
//   - get_next_collection: the next collection (of a waste type, or any);
//   - refresh_schedule: fetch the schedule from the collector now.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';
import { formatDate } from './dates.js';
import { REMINDERS } from './schedule.js';
import { wasteLabel } from './wasteTypes.js';

const logger = createLogger({ name: 'scenes' });

export const SCENE_TRIGGER_KEYS = [REMINDERS.TOMORROW, REMINDERS.TODAY];

/** Event data of one collection reminder (flat, declared keys only). */
export function reminderEventData(collection, collections, config) {
  const language = config.language;
  return {
    waste_type: collection.type,
    waste_name: wasteLabel(collection.type, collection.name, language),
    date: collection.date,
    date_text: formatDate(collection.date, language),
    all_waste_names: collections
      .map((item) => wasteLabel(item.type, item.name, language))
      .join(', '),
  };
}

/**
 * Fire the reminders due now (one event per fraction collected that day).
 * Resolves the number of events published.
 */
export async function fireDueReminders(gladys, { schedule, config }) {
  let count = 0;
  for (const { trigger, collections } of await schedule.takeDueReminders(config)) {
    for (const collection of collections) {
      logger.info(`Scene trigger ${trigger} <- ${collection.type} (${collection.date})`);
      await gladys.publishSceneEvent(trigger, reminderEventData(collection, collections, config));
      count += 1;
    }
  }
  return count;
}

export const SCENE_ACTIONS = {
  async get_next_collection(_gladys, { fields, config, schedule }) {
    const type = fields.waste_type || undefined;
    const next = schedule.next(type);
    logger.info(`Scene action get_next_collection <- ${type ?? 'any'}`);
    if (!next) {
      return {
        found: false,
        waste_type: '',
        waste_name: '',
        date: '',
        date_text: '',
        days_until: -1,
      };
    }
    return {
      found: true,
      waste_type: next.type,
      waste_name: wasteLabel(next.type, next.name, config.language),
      date: next.date,
      date_text: formatDate(next.date, config.language),
      days_until: next.days,
    };
  },

  async refresh_schedule(_gladys, { refreshNow }) {
    logger.info('Scene action refresh_schedule');
    const collections = await refreshNow();
    return { collections_count: collections.length };
  },
};
