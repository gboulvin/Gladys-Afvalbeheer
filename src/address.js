// -----------------------------------------------------------------------------
// The address of the schedule.
//
// The user picks one of the Gladys houses (config `house`, a `source: "houses"`
// select): its coordinates (getHouses(), manifest `location: true`) are turned
// into a postal address by reverse geocoding (OpenStreetMap: Nominatim, Photon
// as a fallback). The
// address fields of the configuration stay available, each one overriding
// the geocoded value: a house pinned next door is fixed by typing the right
// house number only.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';
import { findCollector } from './collectors/index.js';
import { configProblem, normalizePostcode } from './config.js';
import { buildUrl, requestJson } from './http.js';

const logger = createLogger({ name: 'address' });

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const PHOTON = 'https://photon.komoot.io/reverse';

export const ADDRESS_MESSAGES = {
  house_not_found: {
    en: 'The selected house no longer exists in Gladys: pick another one.',
    fr: "La maison choisie n'existe plus dans Gladys : choisissez-en une autre.",
    de: 'Das gewählte Haus existiert in Gladys nicht mehr: Wählen Sie ein anderes.',
    es: 'La casa elegida ya no existe en Gladys: elija otra.',
  },
  house_not_located: {
    en: 'The selected house has no location: place it on the map in the Gladys settings, or enter the address.',
    fr: "La maison choisie n'a pas de position : placez-la sur la carte dans les paramètres de Gladys, ou saisissez l'adresse.",
    de: 'Das gewählte Haus hat keinen Standort: Setzen Sie ihn in den Gladys-Einstellungen oder geben Sie die Adresse ein.',
    es: 'La casa elegida no tiene ubicación: sitúela en el mapa en los ajustes de Gladys o introduzca la dirección.',
  },
  outside_area: {
    en: 'The selected house is neither in Belgium nor in the Netherlands.',
    fr: "La maison choisie n'est ni en Belgique ni aux Pays-Bas.",
    de: 'Das gewählte Haus liegt weder in Belgien noch in den Niederlanden.',
    es: 'La casa elegida no está ni en Bélgica ni en los Países Bajos.',
  },
};

async function nominatim(latitude, longitude) {
  const body = await requestJson(
    buildUrl(NOMINATIM, {
      format: 'jsonv2',
      lat: latitude,
      lon: longitude,
      zoom: 18,
      addressdetails: 1,
      // Brussels streets are named "Rue X - X-straat": the French name is
      // the one Recycle! searches best; elsewhere the local name is kept.
      'accept-language': 'fr',
    }),
  );
  const address = body?.address ?? {};
  return {
    postcode: address.postcode ?? '',
    houseNumber: address.house_number ?? '',
    streetName: address.road ?? address.pedestrian ?? '',
    cityName: address.city ?? address.town ?? address.village ?? address.municipality ?? '',
    countryCode: (address.country_code ?? '').toLowerCase(),
  };
}

async function photon(latitude, longitude) {
  const body = await requestJson(buildUrl(PHOTON, { lat: latitude, lon: longitude, lang: 'fr' }));
  const properties = body?.features?.[0]?.properties ?? {};
  return {
    postcode: properties.postcode ?? '',
    houseNumber: properties.housenumber ?? '',
    streetName: properties.street ?? '',
    cityName: properties.city ?? properties.district ?? '',
    countryCode: (properties.countrycode ?? '').toLowerCase(),
  };
}

/**
 * Postal address at coordinates: { postcode, houseNumber, streetName,
 * cityName, countryCode }, each '' when unknown. Two OpenStreetMap
 * geocoders, the second one when the first is down or rate-limited.
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    return await nominatim(latitude, longitude);
  } catch (err) {
    logger.warn(`Nominatim failed (${err.message}), trying Photon`);
    return photon(latitude, longitude);
  }
}

/**
 * Turn the configuration into the effective one, the address filled from the
 * chosen house where the user left it empty.
 * Resolves `{ config, problem }`: `problem` is a multi-language message when
 * the configuration cannot be used (then `config` is null). Throws when
 * Gladys or the geocoder cannot be reached (to retry later).
 * @param {object} gladys
 * @param {object} config normalized configuration
 * @param {Map} cache geocoding results by coordinates
 */
export async function resolveConfig(gladys, config, cache = new Map()) {
  const collector = findCollector(config.collector);
  const needsHouse =
    collector &&
    (!config.postcode ||
      !config.house_number ||
      collector.requires.some((field) => !config[field]));
  if (!config.house || !needsHouse) {
    const problem = configProblem(config);
    return problem ? { config: null, problem } : { config, problem: null };
  }

  const house = (await gladys.getHouses()).find((item) => item.selector === config.house);
  if (!house) {
    return { config: null, problem: ADDRESS_MESSAGES.house_not_found };
  }
  if (house.latitude === null || house.longitude === null || house.latitude === undefined) {
    return { config: null, problem: ADDRESS_MESSAGES.house_not_located };
  }

  const key = `${house.latitude},${house.longitude}`;
  if (!cache.has(key)) {
    cache.set(key, await reverseGeocode(house.latitude, house.longitude));
  }
  const found = cache.get(key);
  if (found.countryCode && !['be', 'nl'].includes(found.countryCode)) {
    return { config: null, problem: ADDRESS_MESSAGES.outside_area };
  }
  logger.info(`Address of the house "${house.name}" found by geocoding`);

  const effective = {
    ...config,
    postcode: config.postcode || normalizePostcode(found.postcode),
    house_number: config.house_number || found.houseNumber,
    street_name: config.street_name || found.streetName,
    city_name: config.city_name || found.cityName,
  };
  const problem = configProblem(effective);
  return problem ? { config: null, problem } : { config: effective, problem: null };
}
