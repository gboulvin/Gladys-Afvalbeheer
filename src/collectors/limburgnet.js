// -----------------------------------------------------------------------------
// Limburg.net — Belgium, province of Limburg (Hasselt, Genk, Sint-Truiden,
// Tongeren...). The address is resolved from the municipality and the street
// name; the calendar is served month by month.
// -----------------------------------------------------------------------------

import { buildUrl, requestJson } from '../http.js';

const API = 'https://limburg.net/api-proxy/public';
const MONTHS = 4;

async function resolveAddress({ cityName, streetName }) {
  const cities = await requestJson(
    buildUrl(`${API}/afval-kalender/gemeenten/search`, { query: cityName.trim() }),
  );
  const city = cities?.[0];
  if (!city?.nisCode) {
    throw new Error(`Limburg.net: municipality "${cityName}" not found`);
  }
  const streets = await requestJson(
    buildUrl(`${API}/afval-kalender/gemeente/${city.nisCode}/straten/search`, {
      query: streetName.trim(),
    }),
  );
  const street = streets?.[0];
  if (!street?.nummer) {
    throw new Error(`Limburg.net: street "${streetName}" not found in ${cityName}`);
  }
  return { cityId: city.nisCode, streetId: street.nummer };
}

export const limburgNet = {
  async fetch(address, { auth, today }) {
    const cacheKey = `${address.cityName}|${address.streetName}`.toLowerCase();
    if (auth.key !== cacheKey) {
      Object.assign(auth, { key: cacheKey, ids: await resolveAddress(address) });
    }
    const { cityId, streetId } = auth.ids;

    const [year, month] = today.split('-').map(Number);
    const events = [];
    for (let offset = 0; offset < MONTHS; offset += 1) {
      const date = new Date(Date.UTC(year, month - 1 + offset, 1));
      const body = await requestJson(
        buildUrl(`${API}/kalender/${cityId}/${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`, {
          straatNummer: streetId,
          huisNummer: address.houseNumber,
          toevoeging: address.suffix,
        }),
      );
      events.push(...(body?.events ?? []));
    }
    return events.map((event) => ({ date: event.date, name: event.title }));
  },
};
