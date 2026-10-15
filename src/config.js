// -----------------------------------------------------------------------------
// Integration configuration: defaults (they MUST stay consistent with the
// `default` values of the manifest `config_schema`, see
// test/manifest.test.js) and normalization, so the rest of the code never
// deals with `undefined`, numbers sent as strings or stray spaces.
// -----------------------------------------------------------------------------

import { findCollector, ADDRESS_FIELDS } from './collectors/index.js';
import { LANGUAGES } from './wasteTypes.js';

export const DEFAULT_CONFIG = {
  collector: 'recycleapp',
  postcode: '',
  house_number: '',
  house_number_suffix: '',
  street_name: '',
  city_name: '',
  language: 'fr',
  morning_reminder_hour: 7,
  evening_reminder_hour: 19,
  refresh_interval_hours: 12,
};

const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(number)));
};

const text = (value) => (value === undefined || value === null ? '' : String(value).trim());

/**
 * Merge the user config with the defaults.
 * @param {Record<string, unknown>} raw config returned by the SDK
 */
export function normalizeConfig(raw = {}) {
  const language = LANGUAGES.includes(raw.language) ? raw.language : DEFAULT_CONFIG.language;
  return {
    ...DEFAULT_CONFIG,
    collector: text(raw.collector) || DEFAULT_CONFIG.collector,
    // Dutch postcodes are written '1234 AB' or '1234ab': keep the canonical
    // '1234AB' every Dutch API accepts. A Belgian postcode is 4 digits.
    postcode: text(raw.postcode).replace(/\s+/g, '').toUpperCase(),
    house_number: text(raw.house_number),
    house_number_suffix: text(raw.house_number_suffix),
    street_name: text(raw.street_name),
    city_name: text(raw.city_name),
    language,
    morning_reminder_hour: clamp(raw.morning_reminder_hour, 0, 23, 7),
    evening_reminder_hour: clamp(raw.evening_reminder_hour, 0, 23, 19),
    refresh_interval_hours: clamp(raw.refresh_interval_hours, 1, 72, 12),
  };
}

/** The address passed to the collectors. */
export function addressOf(config) {
  return {
    postcode: config.postcode,
    houseNumber: config.house_number,
    suffix: config.house_number_suffix,
    streetName: config.street_name,
    cityName: config.city_name,
  };
}

/** Stable identifier of the configured address (device ids, cache). */
export function addressKey(config) {
  const suffix = config.house_number_suffix ? `-${config.house_number_suffix}` : '';
  return `${config.collector}-${config.postcode}-${config.house_number}${suffix}`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-');
}

const MESSAGES = {
  unknown_collector: {
    en: 'Unknown waste collector: pick one in the configuration.',
    fr: 'Collecteur inconnu : choisissez-en un dans la configuration.',
    de: 'Unbekannter Entsorger: Wählen Sie einen in der Konfiguration.',
    es: 'Recolector desconocido: elija uno en la configuración.',
  },
  postcode: {
    en: 'Enter your postcode in the configuration.',
    fr: 'Renseignez votre code postal dans la configuration.',
    de: 'Geben Sie Ihre Postleitzahl in der Konfiguration ein.',
    es: 'Introduzca su código postal en la configuración.',
  },
  house_number: {
    en: 'Enter your house number in the configuration.',
    fr: 'Renseignez votre numéro de maison dans la configuration.',
    de: 'Geben Sie Ihre Hausnummer in der Konfiguration ein.',
    es: 'Introduzca su número de casa en la configuración.',
  },
  [ADDRESS_FIELDS.STREET_NAME]: {
    en: 'This collector needs your street name.',
    fr: 'Ce collecteur a besoin du nom de votre rue.',
    de: 'Dieser Entsorger benötigt Ihren Straßennamen.',
    es: 'Este recolector necesita el nombre de su calle.',
  },
  [ADDRESS_FIELDS.CITY_NAME]: {
    en: 'This collector needs your municipality.',
    fr: 'Ce collecteur a besoin de votre commune.',
    de: 'Dieser Entsorger benötigt Ihre Gemeinde.',
    es: 'Este recolector necesita su municipio.',
  },
};

/**
 * What is missing for the configured collector, as a multi-language message,
 * or null when the configuration is complete.
 */
export function configProblem(config) {
  const collector = findCollector(config.collector);
  if (!collector) {
    return MESSAGES.unknown_collector;
  }
  if (!config.postcode) {
    return MESSAGES.postcode;
  }
  if (!config.house_number) {
    return MESSAGES.house_number;
  }
  for (const field of collector.requires) {
    if (!config[field]) {
      return MESSAGES[field];
    }
  }
  return null;
}
