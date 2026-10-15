// -----------------------------------------------------------------------------
// Single-collector APIs of the Netherlands: one waste company, one API.
// Each `fetch` resolves the raw `{ date, name }` entries; mapping, sorting and
// de-duplication happen once for all in src/schedule.js.
// -----------------------------------------------------------------------------

import { addDays } from '../dates.js';
import { buildUrl, formBody, request, requestJson } from '../http.js';

// Mijn Afvalwijzer: about a hundred municipalities (Cure, Meppel, Súdwest...).
const AFVALWIJZER_KEY = '5ef443e778f41c4f75c69459eea6e6ae0c2d92de729aa0fc61653815fbd6a8ca';

export const afvalwijzer = {
  async fetch(address, { today }) {
    const body = await requestJson(
      buildUrl('https://api.mijnafvalwijzer.nl/webservices/appsinput/', {
        apikey: AFVALWIJZER_KEY,
        method: 'postcodecheck',
        postcode: address.postcode,
        street: '',
        huisnummer: address.houseNumber,
        toevoeging: address.suffix,
        app_name: 'afvalwijzer',
        platform: 'web',
        afvaldata: today,
        langs: 'nl',
      }),
    );
    // Two answer layouts exist: the lists at the root, or under `data`.
    const root = body?.data?.ophaaldagen ? body.data : body;
    const list = (key) => (Array.isArray(root?.[key]?.data) ? root[key].data : []);
    return [...list('ophaaldagen'), ...list('ophaaldagenNext')].map((item) => ({
      date: item.date,
      name: item.nameType ?? item.type,
    }));
  },
};

// Klikogroep container manager: Oude IJsselstreek, Maassluis.
export const KLIKOGROEP = {
  oudeijsselstreek: { id: '454', host: 'cp-oudeijsselstreek.klikocontainermanager.com' },
  maassluis: { id: '505', host: 'cp-maassluis.klikocontainermanager.com' },
};

export function klikogroep(collectorKey) {
  const { id, host } = KLIKOGROEP[collectorKey];
  return {
    async fetch(address) {
      const body = await requestJson(
        `https://${host}/MyKliko/wasteCalendarJSON/${id}/${encodeURIComponent(address.postcode)}/${encodeURIComponent(address.houseNumber)}`,
      );
      return Object.entries(body?.calendar ?? {}).flatMap(([date, types]) =>
        Object.keys(types ?? {}).map((name) => ({ date, name })),
      );
    },
  };
}

// RD4: Parkstad and the south of Limburg (Heerlen, Kerkrade, Landgraaf...).
export const rd4 = {
  async fetch(address, { today }) {
    const match = /^(\d{4})\s*([a-z]{2})$/i.exec(address.postcode);
    if (!match) {
      throw new Error('RD4: invalid postcode');
    }
    const year = Number(today.slice(0, 4));
    const items = [];
    for (const y of [year, year + 1]) {
      const body = await requestJson(
        buildUrl('https://data.rd4.nl/api/v1/waste-calendar', {
          postal_code: `${match[1]} ${match[2].toUpperCase()}`,
          house_number: address.houseNumber,
          house_number_extension: address.suffix,
          year: y,
        }),
        { allowStatus: [404] },
      );
      if (body?.success) {
        items.push(...(body.data?.items?.[0] ?? []));
      }
    }
    return items.map((item) => ({ date: item.date, name: item.type }));
  },
};

// ROVA: Zwolle, Amersfoort and the surrounding municipalities.
export const rova = {
  async fetch(address) {
    const body = await requestJson(
      buildUrl('https://www.rova.nl/api/waste-calendar/upcoming', {
        houseNumber: address.houseNumber,
        addition: address.suffix,
        postalcode: address.postcode,
        take: 30,
      }),
    );
    return (body ?? []).map((item) => ({ date: item.date, name: item.wasteType?.title }));
  },
};

// Irado: Schiedam, Vlaardingen, Capelle aan den IJssel.
export const irado = {
  async fetch(address) {
    const body = await requestJson(
      buildUrl('https://irado.nl/wp-json/wsa/v1/location/address/calendar/pickups', {
        zipcode: address.postcode,
        number: address.houseNumber,
        extention: address.suffix || undefined,
      }),
    );
    return (body?.data ?? []).map((item) => ({ date: item.date, name: item.type }));
  },
};

// Reinis: Nissewaard, Hoeksche Waard, Voorne aan Zee.
export const reinis = {
  async fetch(address, { auth, today }) {
    const base = 'https://reinis.nl';
    const cacheKey = `${address.postcode}|${address.houseNumber}|${address.suffix}`;
    if (auth.key !== cacheKey) {
      const found = await requestJson(
        `${base}/adressen/${encodeURIComponent(`${address.postcode}:${address.houseNumber}${address.suffix}`)}`,
      );
      if (!found?.[0]?.bagid) {
        throw new Error('Reinis: address not found');
      }
      Object.assign(auth, { key: cacheKey, bagId: found[0].bagid });
    }
    const streams = (await requestJson(`${base}/rest/adressen/${auth.bagId}/afvalstromen/`)) ?? [];
    const names = new Map(streams.map((stream) => [stream.id, stream.title]));
    const year = Number(today.slice(0, 4));
    const entries = [];
    for (const y of [year, year + 1]) {
      entries.push(
        ...((await requestJson(`${base}/rest/adressen/${auth.bagId}/kalender/${y}`, {
          allowStatus: [404],
        })) ?? []),
      );
    }
    return entries.map((entry) => ({
      date: entry.ophaaldatum,
      name: names.get(entry.afvalstroom_id) ?? String(entry.afvalstroom_id),
    }));
  },
};

// Straatbeeld: Drimmelen.
export const drimmelen = {
  async fetch(address) {
    const body = await requestJson('https://drimmelen.api.straatbeeld.online/v1/waste-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postal_code: address.postcode,
        house_number: address.houseNumber,
        house_letter: address.suffix,
      }),
    });
    const entries = [];
    for (const months of Object.values(body?.collections ?? {})) {
      for (const days of Object.values(months ?? {})) {
        for (const day of days ?? []) {
          for (const item of day.data ?? []) {
            entries.push({ date: day.date?.formatted, name: item.name });
          }
        }
      }
    }
    return entries;
  },
};

// Circulus: Apeldoorn, Deventer, Zutphen and around. The calendar sits behind
// a session cookie obtained by registering the address on the web portal.
function cookieHeader(response, jar = {}) {
  for (const line of response.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(';');
    const index = pair.indexOf('=');
    if (index > 0) {
      jar[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
    }
  }
  return jar;
}

const serializeCookies = (jar) =>
  Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

export const circulus = {
  async fetch(address, { today }) {
    const base = 'https://mijn.circulus.nl';
    // Manual redirects: the session cookie is set on the redirect itself.
    const manual = { redirect: 'manual', allowStatus: [301, 302, 303] };
    const first = await request(base, { headers: { Accept: 'text/html' }, ...manual });
    const jar = cookieHeader(first);
    const token = /__AT=(.*?)&___TS=/.exec(decodeURIComponent(jar.CB_SESSION ?? ''))?.[1];
    if (!token) {
      throw new Error('Circulus: no session');
    }
    const registered = await request(`${base}/register/zipcode.json`, {
      method: 'POST',
      ...formBody({
        authenticityToken: token,
        zipCode: address.postcode,
        number: address.houseNumber,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: serializeCookies(jar),
      },
    });
    cookieHeader(registered, jar);
    const json = await registered.json();
    const addresses = json?.customData?.addresses;
    if (Array.isArray(addresses) && addresses.length > 0) {
      const wanted = address.suffix
        ? addresses.find((item) =>
            String(item.address)
              .toLowerCase()
              .includes(` ${address.houseNumber} ${address.suffix.toLowerCase()}`),
          )
        : addresses[0];
      if (wanted?.authenticationUrl) {
        const authenticated = await request(`${base}${wanted.authenticationUrl}`, {
          headers: { Accept: 'text/html', Cookie: serializeCookies(jar) },
          ...manual,
        });
        cookieHeader(authenticated, jar);
      }
    }
    const body = await requestJson(
      buildUrl(`${base}/afvalkalender.json`, {
        from: addDays(today, -1),
        till: addDays(today, 90),
      }),
      { headers: { Cookie: serializeCookies(jar) } },
    );
    return (body?.customData?.response?.garbage ?? []).flatMap((item) =>
      (item.dates ?? []).map((date) => ({ date, name: item.code })),
    );
  },
};
