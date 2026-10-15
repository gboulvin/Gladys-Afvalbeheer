// -----------------------------------------------------------------------------
// Opzet — the Netherlands. A shared "afvalkalender" platform: each
// municipality or waste company runs it on its own domain (HVC, Cyclus, DAR,
// GAD, Den Haag, PreZero, RWM, ZRD...). The address is the BAG id found from
// the postcode and the house number.
// -----------------------------------------------------------------------------

import { requestJson } from '../http.js';

export const OPZET_URLS = {
  afval3xbeter: 'https://afval3xbeter.nl',
  afvalstoffendienstkalender: 'https://afvalstoffendienst.nl',
  alphenaandenrijn: 'https://afvalkalender.alphenaandenrijn.nl',
  berkelland: 'https://afvalkalender.gemeenteberkelland.nl',
  cranendonck: 'https://afvalkalender.cranendonck.nl',
  cyclus: 'https://cyclusnv.nl',
  dar: 'https://afvalkalender.dar.nl',
  defryskemarren: 'https://afvalkalender.defryskemarren.nl',
  denhaag: 'https://huisvuilkalender.denhaag.nl',
  gad: 'https://inzamelkalender.gad.nl',
  hvc: 'https://inzamelkalender.hvcgroep.nl',
  lingewaard: 'https://afvalwijzer.lingewaard.nl',
  'middelburg-vlissingen': 'https://afvalwijzer.middelburgvlissingen.nl',
  mijnafvalzaken: 'https://mijnafvalzaken.nl',
  offalkalinder: 'https://www.offalkalinder.nl',
  peelenmaas: 'https://afvalkalender.peelenmaas.nl',
  prezero: 'https://inzamelwijzer.prezero.nl',
  purmerend: 'https://afvalkalender.purmerend.nl',
  rwm: 'https://rwm.nl',
  saver: 'https://saver.nl',
  'schouwen-duiveland': 'https://afvalkalender.schouwen-duiveland.nl',
  sliedrecht: 'https://afvalkalender.sliedrecht.nl',
  spaarnelanden: 'https://afvalwijzer.spaarnelanden.nl',
  sudwestfryslan: 'https://afvalkalender.sudwestfryslan.nl',
  venray: 'https://afvalkalender.venray.nl',
  voorschoten: 'https://afvalkalender.voorschoten.nl',
  waalre: 'https://afvalkalender.waalre.nl',
  zrd: 'https://www.zrd.nl',
};

export function opzet(collectorKey) {
  const base = OPZET_URLS[collectorKey];
  return {
    async fetch(address, { auth }) {
      const cacheKey = `${address.postcode}|${address.houseNumber}|${address.suffix}`;
      if (auth.key !== cacheKey) {
        const found =
          (await requestJson(
            `${base}/rest/adressen/${encodeURIComponent(`${address.postcode}-${address.houseNumber}`)}`,
          )) ?? [];
        const suffix = address.suffix.toUpperCase();
        const match =
          (suffix &&
            found.find(
              (item) =>
                String(item.huisletter ?? '').toUpperCase() === suffix ||
                String(item.huisnummerToevoeging ?? '').toUpperCase() === suffix,
            )) ||
          found[0];
        if (!match?.bagId) {
          throw new Error('Opzet: address not found');
        }
        Object.assign(auth, { key: cacheKey, bagId: match.bagId });
      }
      const streams = (await requestJson(`${base}/rest/adressen/${auth.bagId}/afvalstromen`)) ?? [];
      return streams
        .filter((item) => item.ophaaldatum)
        .map((item) => ({ date: item.ophaaldatum, name: item.menu_title ?? item.title }));
    },
  };
}
