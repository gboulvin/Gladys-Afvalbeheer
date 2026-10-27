// -----------------------------------------------------------------------------
// Recycle! (Fost Plus) — Belgium.
//
// The official Belgian sorting app, fed by the inter-municipal waste
// companies of Wallonia, Flanders and Brussels: Tibi, Ipalle, Intradel, BEP,
// Hygea, inBW, IDELUX, Intercommunale ICDI, Bruxelles-Propreté, IVAGO, IVBO,
// Fost Plus municipalities... The address is resolved from the postcode and
// the street name (a postcode covers several streets, unlike in the
// Netherlands).
// -----------------------------------------------------------------------------

import { addDays } from '../dates.js';
import { buildUrl, HttpError, requestJson } from '../http.js';
import { normalizeName } from '../wasteTypes.js';

const API = 'https://api.fostplus.be/recyclecms/public/v1';
const HEADERS = { 'x-consumer': 'recycleapp.be' };
// The API pages by 100; 120 days of a weekly schedule fit in two pages.
const HORIZON_DAYS = 120;
const PAGE_SIZE = 100;

// Street names differ in accents and spelling between sources (OpenStreetMap
// writes "Rue Basslé", Recycle! "Rue Bassle"): compare them accent-free.
const simplify = (name) =>
  normalizeName(name)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function sameStreet(item, streetName) {
  const wanted = simplify(streetName);
  const names = [item.name, ...Object.values(item.names ?? {})];
  return names.some((name) => typeof name === 'string' && simplify(name) === wanted);
}

// The searches tried for a street, most precise first: as written, then
// without accents (the search is accent-sensitive), then its longest word
// alone ("Montagne" finds "Rue de la Montagne" written differently).
function streetQueries(streetName) {
  const plain = streetName.trim();
  const accentFree = simplify(plain);
  const longestWord = accentFree.split(' ').sort((a, b) => b.length - a.length)[0] ?? '';
  return [...new Set([plain, accentFree, longestWord])].filter((query) => query.length >= 3);
}

async function resolveAddress({ postcode, streetName }) {
  const zipcodes = await requestJson(buildUrl(`${API}/zipcodes`, { q: postcode.trim() }), {
    headers: HEADERS,
  });
  const candidates = (zipcodes?.items ?? []).filter((zip) => zip.code === postcode.trim());
  const queries = streetQueries(streetName);
  for (const zip of candidates.length > 0 ? candidates : (zipcodes?.items ?? [])) {
    let fallback = null;
    for (const [index, q] of queries.entries()) {
      const streets = await requestJson(buildUrl(`${API}/streets`, { q, zipcodes: zip.id }), {
        headers: HEADERS,
      });
      const items = streets?.items ?? [];
      const exact = items.find((item) => sameStreet(item, streetName));
      if (exact) {
        return { zipcodeId: zip.id, streetId: exact.id };
      }
      // Without an exact name, trust the search on the full name only: a
      // single word can match another street.
      if (!fallback && index < 2 && items.length > 0) {
        fallback = items[0];
      }
    }
    if (fallback) {
      return { zipcodeId: zip.id, streetId: fallback.id };
    }
  }
  return null;
}

async function fetchCollections(ids, houseNumber, today) {
  const items = [];
  for (let page = 1; page <= 5; page += 1) {
    const body = await requestJson(
      buildUrl(`${API}/collections`, {
        zipcodeId: ids.zipcodeId,
        streetId: ids.streetId,
        houseNumber,
        fromDate: today,
        untilDate: addDays(today, HORIZON_DAYS),
        size: PAGE_SIZE,
        page,
      }),
      { headers: HEADERS },
    );
    items.push(...(body?.items ?? []));
    if (!body?.pages || page >= body.pages) {
      break;
    }
  }
  return items;
}

export const recycleApp = {
  async fetch(address, { auth, today }) {
    const cacheKey = `${address.postcode}|${address.streetName}`.toLowerCase();
    let ids = auth.key === cacheKey ? auth.ids : null;
    if (!ids) {
      ids = await resolveAddress(address);
      if (!ids) {
        throw new Error(
          `Recycle!: street "${address.streetName}" not found in ${address.postcode}`,
        );
      }
      Object.assign(auth, { key: cacheKey, ids });
    }

    let items;
    try {
      items = await fetchCollections(ids, address.houseNumber, today);
    } catch (err) {
      // Street ids are re-issued now and then: resolve again once.
      if (!(err instanceof HttpError) || ![400, 404].includes(err.status)) {
        throw err;
      }
      ids = await resolveAddress(address);
      if (!ids) {
        throw err;
      }
      Object.assign(auth, { key: cacheKey, ids });
      items = await fetchCollections(ids, address.houseNumber, today);
    }

    return (
      items
        // `event` entries are announcements (container park closed...), and a
        // collection moved by a holiday comes twice: the cancelled date
        // carries `exception.replacedBy`, the new one is a plain entry.
        .filter((item) => item.type === 'collection' && item.timestamp)
        .filter((item) => !item.exception?.replacedBy)
        .map((item) => ({
          date: item.timestamp,
          name: item.fraction?.name?.fr ?? item.fraction?.name?.nl ?? item.fraction?.name?.en,
          names: item.fraction?.name,
        }))
    );
  },
};
