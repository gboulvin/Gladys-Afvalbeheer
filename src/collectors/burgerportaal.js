// -----------------------------------------------------------------------------
// Burgerportaal (Ximmio's successor platform of several municipalities) —
// the Netherlands: Assen, BAR, Breda, Groningen, Nijkerk, RMN, Tilburg.
//
// The API sits behind an anonymous Firebase account: one is created at the
// first fetch and its refresh token kept (in /data, see src/store.js), so a
// restart does not create a new account.
// -----------------------------------------------------------------------------

import { buildUrl, formBody, requestJson } from '../http.js';

export const BURGERPORTAAL_ORGANISATIONS = {
  assen: '138204213565303512',
  bar: '138204213564933497',
  breda: '452048812597352613',
  groningen: '452048812597326549',
  nijkerk: '138204213565304094',
  rmn: '138204213564933597',
  tilburg: '452048812597339353',
};

// Public web key of the Burgerportaal app (shipped in its web client).
const FIREBASE_KEY = 'AIzaSyA6NkRqJypTfP-cjWzrZNFJzPUbBaGjOdk';
const API =
  'https://europe-west3-burgerportaal-production.cloudfunctions.net/exposed/organisations';

async function signUp(auth) {
  const body = await requestJson(
    buildUrl('https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser', {
      key: FIREBASE_KEY,
    }),
    { method: 'POST' },
  );
  if (!body?.refreshToken) {
    throw new Error('Burgerportaal: anonymous sign-in refused');
  }
  auth.refreshToken = body.refreshToken;
  return body.idToken;
}

async function idToken(auth) {
  if (!auth.refreshToken) {
    return signUp(auth);
  }
  try {
    const body = await requestJson(
      buildUrl('https://securetoken.googleapis.com/v1/token', { key: FIREBASE_KEY }),
      {
        method: 'POST',
        ...formBody({ grant_type: 'refresh_token', refresh_token: auth.refreshToken }),
      },
    );
    if (body?.id_token) {
      return body.id_token;
    }
  } catch {
    // A revoked refresh token: start over with a new anonymous account.
  }
  return signUp(auth);
}

export function burgerportaal(collectorKey) {
  const organisation = BURGERPORTAAL_ORGANISATIONS[collectorKey];
  return {
    async fetch(address, { auth }) {
      const token = await idToken(auth);
      const headers = { authorization: token };
      const postcode = address.postcode.replace(/\s+/g, '').toUpperCase();

      const cacheKey = `${postcode}|${address.houseNumber}|${address.suffix}`;
      if (auth.key !== cacheKey) {
        const addresses =
          (await requestJson(
            buildUrl(`${API}/${organisation}/address`, {
              zipcode: postcode,
              housenumber: address.houseNumber,
            }),
            { headers },
          )) ?? [];
        const match =
          addresses.find(
            (item) =>
              address.suffix &&
              String(item.addition ?? '').toUpperCase() === address.suffix.toUpperCase(),
          ) ?? addresses[addresses.length - 1];
        if (!match?.addressId) {
          throw new Error('Burgerportaal: address not found');
        }
        Object.assign(auth, { key: cacheKey, addressId: match.addressId });
      }

      const calendar =
        (await requestJson(`${API}/${organisation}/address/${auth.addressId}/calendar`, {
          headers,
        })) ?? [];
      return calendar.map((item) => ({ date: item.collectionDate, name: item.fraction }));
    },
  };
}
