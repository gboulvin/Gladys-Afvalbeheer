// -----------------------------------------------------------------------------
// Ximmio — the Netherlands. A shared platform behind many waste companies
// (Twente Milieu, ACV, Avalex, Meerlanden, Area Reiniging, Blink, RAD...):
// one API, one company code per collector.
// -----------------------------------------------------------------------------

import { addDays } from '../dates.js';
import { formBody, requestJson } from '../http.js';

export const XIMMIO_COMPANIES = {
  acv: 'f8e2844a-095e-48f9-9f98-71fceb51d2c3',
  almere: '53d8db94-7945-42fd-9742-9bbc71dbe4c1',
  areareiniging: 'adc418da-d19b-11e5-ab30-625662870761',
  avalex: 'f7a74ad1-fdbf-4a43-9f91-44644f4d4222',
  avri: '78cd4156-394b-413d-8936-d407e334559a',
  blink: '252d30d0-2e74-469c-8f1e-c0e2e434eb58',
  hellendoorn: '24434f5b-7244-412b-9306-3a2bd1e22bc1',
  meerlanden: '800bf8d7-6dd1-4490-ba9d-b419d6dc8a45',
  oostzaan: '6eb81e8f-ca5a-4bad-af0a-667650325511',
  rad: '13a2cad9-36d0-4b01-b877-efcb421a864d',
  twentemilieu: '8d97bb56-5afd-4cbc-a651-b4f7314264b4',
  venlo: '280affe9-1428-443b-895a-b90431b8ca31',
  waardlanden: '942abcf6-3775-400d-ae5d-7380d728b23c',
  westland: '6fc75608-126a-4a50-9241-a002ce8c8a6c',
  woerden: '06856f74-6826-4c6a-aabf-69bc9d20b5a6',
};

// The collectors served by the second Ximmio production cluster.
const PROD2 = new Set(['avalex', 'meerlanden', 'oostzaan', 'rad', 'westland', 'woerden', 'blink']);

export function ximmio(collectorKey) {
  const companyCode = XIMMIO_COMPANIES[collectorKey];
  const api = PROD2.has(collectorKey)
    ? 'https://wasteprod2api.ximmio.com/api'
    : 'https://wasteapi.ximmio.com/api';

  return {
    async fetch(address, { auth, today }) {
      const cacheKey = `${address.postcode}|${address.houseNumber}|${address.suffix}`;
      if (auth.key !== cacheKey) {
        const found = await requestJson(`${api}/FetchAdress`, {
          method: 'POST',
          ...formBody({
            postCode: address.postcode,
            houseNumber: address.houseNumber,
            companyCode,
          }),
        });
        const list = found?.dataList ?? [];
        const match =
          list.find(
            (item) =>
              address.suffix &&
              String(item.HouseNumberAddition ?? item.HouseLetter ?? '').toUpperCase() ===
                address.suffix.toUpperCase(),
          ) ?? list[0];
        if (!match?.UniqueId) {
          throw new Error('Ximmio: address not found');
        }
        Object.assign(auth, {
          key: cacheKey,
          addressId: match.UniqueId,
          community: match.Community ?? '',
        });
      }

      const calendar = await requestJson(`${api}/GetCalendar`, {
        method: 'POST',
        ...formBody({
          uniqueAddressID: auth.addressId,
          startDate: today,
          endDate: addDays(today, 365),
          companyCode,
          community: auth.community,
        }),
      });
      return (calendar?.dataList ?? []).flatMap((item) =>
        (item.pickupDates ?? []).map((date) => ({
          date,
          name: item._pickupTypeText ?? item.description,
        })),
      );
    },
  };
}
