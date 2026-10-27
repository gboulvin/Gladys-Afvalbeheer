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
  // Selector of the Gladys house whose address is used (src/address.js).
  house: '',
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
 * Dutch postcodes are written '1234 AB' or '1234ab': keep the canonical
 * '1234AB' every Dutch API accepts. A Belgian postcode is 4 digits.
 */
export const normalizePostcode = (value) => text(value).replace(/\s+/g, '').toUpperCase();

/**
 * Merge the user config with the defaults.
 * @param {Record<string, unknown>} raw config returned by the SDK
 */
export function normalizeConfig(raw = {}) {
  const language = LANGUAGES.includes(raw.language) ? raw.language : DEFAULT_CONFIG.language;
  return {
    ...DEFAULT_CONFIG,
    collector: text(raw.collector) || DEFAULT_CONFIG.collector,
    house: text(raw.house),
    postcode: normalizePostcode(raw.postcode),
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
    en: 'Pick your house in the configuration, or enter your postcode.',
    fr: 'Choisissez votre maison dans la configuration, ou renseignez votre code postal.',
    de: 'Wählen Sie Ihr Haus in der Konfiguration oder geben Sie Ihre Postleitzahl ein.',
    es: 'Elija su casa en la configuración o introduzca su código postal.',
  },
  house_number: {
    en: 'No house number found: enter it in the configuration.',
    fr: 'Aucun numéro trouvé : renseignez-le dans la configuration.',
    de: 'Keine Hausnummer gefunden: Geben Sie sie in der Konfiguration ein.',
    es: 'No se encontró el número: introdúzcalo en la configuración.',
  },
  [ADDRESS_FIELDS.STREET_NAME]: {
    en: 'This collector needs your street name: pick your house or enter it.',
    fr: 'Ce collecteur a besoin du nom de votre rue : choisissez votre maison ou saisissez-le.',
    de: 'Dieser Entsorger benötigt Ihren Straßennamen: Wählen Sie Ihr Haus oder geben Sie ihn ein.',
    es: 'Este recolector necesita el nombre de su calle: elija su casa o introdúzcalo.',
  },
  [ADDRESS_FIELDS.CITY_NAME]: {
    en: 'This collector needs your municipality: pick your house or enter it.',
    fr: 'Ce collecteur a besoin de votre commune : choisissez votre maison ou saisissez-la.',
    de: 'Dieser Entsorger benötigt Ihre Gemeinde: Wählen Sie Ihr Haus oder geben Sie sie ein.',
    es: 'Este recolector necesita su municipio: elija su casa o introdúzcalo.',
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
