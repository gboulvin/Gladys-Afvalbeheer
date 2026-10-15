// -----------------------------------------------------------------------------
// Devices: one per waste fraction collected at the configured address
// ("Collection – Paper & cardboard"...), discovered after the first fetch.
//
// Features (read-only sensors):
//   - days: days until the next collection (0 = today), integer, in days —
//     what scenes compare ("days = 1 → put the bin out");
//   - next: the date of the next collection as text, in the configured
//     language ('vendredi 16 octobre').
//
// The external id is built from the address and the fraction: a new address
// gives new devices (the old ones are left for the user to delete).
// -----------------------------------------------------------------------------

import {
  DEVICE_FEATURE_CATEGORIES,
  DEVICE_FEATURE_TYPES,
  DEVICE_FEATURE_UNITS,
} from '@gladysassistant/integration-sdk';
import { addressKey } from '../config.js';
import { formatDate } from '../dates.js';
import { pick, wasteLabel } from '../wasteTypes.js';

const DEVICE_TYPE = 'waste';

export const FEATURE = { DAYS: 'days', NEXT: 'next' };

const DEVICE_PREFIX = {
  en: 'Collection',
  fr: 'Collecte',
  de: 'Abholung',
  es: 'Recogida',
  nl: 'Ophaling',
};

const FEATURE_NAMES = {
  [FEATURE.DAYS]: {
    en: 'Days until collection',
    fr: 'Jours avant la collecte',
    de: 'Tage bis zur Abholung',
    es: 'Días hasta la recogida',
    nl: 'Dagen tot ophaling',
  },
  [FEATURE.NEXT]: {
    en: 'Next collection',
    fr: 'Prochaine collecte',
    de: 'Nächste Abholung',
    es: 'Próxima recogida',
    nl: 'Volgende ophaling',
  },
};

export function fractionIds(gladys, config, fraction) {
  return gladys.externalIds(DEVICE_TYPE, `${addressKey(config)}-${fraction.id}`);
}

/** Discovery payload of one fraction. */
export function buildDevice(gladys, config, fraction) {
  const ids = fractionIds(gladys, config, fraction);
  const language = config.language;
  return {
    name: `${pick(DEVICE_PREFIX, language)} – ${wasteLabel(fraction.type, fraction.name, language)}`,
    external_id: ids.device,
    features: [
      {
        name: pick(FEATURE_NAMES[FEATURE.DAYS], language),
        external_id: ids.feature(FEATURE.DAYS),
        category: DEVICE_FEATURE_CATEGORIES.DURATION,
        type: DEVICE_FEATURE_TYPES.DURATION.INTEGER,
        unit: DEVICE_FEATURE_UNITS.DAYS,
        min: 0,
        max: 400,
        read_only: true,
        has_feedback: false,
        keep_history: false,
      },
      {
        name: pick(FEATURE_NAMES[FEATURE.NEXT], language),
        external_id: ids.feature(FEATURE.NEXT),
        category: DEVICE_FEATURE_CATEGORIES.TEXT,
        type: DEVICE_FEATURE_TYPES.TEXT.TEXT,
        read_only: true,
        has_feedback: false,
        keep_history: false,
      },
    ],
  };
}

/** Discovery payload of every fraction known at the address. */
export function buildDevices(gladys, config, schedule) {
  return schedule.fractions().map((fraction) => buildDevice(gladys, config, fraction));
}

/** The states of every fraction with an upcoming collection. */
export function buildStates(gladys, config, schedule) {
  return schedule
    .fractions()
    .filter((fraction) => fraction.date !== null)
    .flatMap((fraction) => {
      const ids = fractionIds(gladys, config, fraction);
      return [
        { device_feature_external_id: ids.feature(FEATURE.DAYS), state: fraction.days },
        {
          device_feature_external_id: ids.feature(FEATURE.NEXT),
          text: formatDate(fraction.date, config.language),
        },
      ];
    });
}
