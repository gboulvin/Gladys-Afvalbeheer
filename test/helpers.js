// -----------------------------------------------------------------------------
// Test helpers: tests never touch the network. `mockFetch` replaces the
// global fetch with a router of canned answers, and records every request.
// -----------------------------------------------------------------------------

import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * @param {import('node:test').TestContext} t
 * @param {Array<[RegExp, unknown | ((url: string, init: RequestInit) => unknown)]>} routes
 *   the first route whose RegExp matches the URL answers; a function answer
 *   receives the request, a `Response` is returned as is, anything else is
 *   served as JSON (200).
 */
export function mockFetch(t, routes) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    calls.push({ url: href, method: init.method ?? 'GET', body: init.body, headers: init.headers });
    const route = routes.find(([pattern]) => pattern.test(href));
    if (!route) {
      throw new Error(`Unexpected request in a test: ${href}`);
    }
    let answer = route[1];
    if (typeof answer === 'function') {
      answer = await answer(href, init);
    }
    if (answer instanceof Response) {
      return answer;
    }
    return new Response(JSON.stringify(answer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  return calls;
}

/** A fresh temporary /data directory. */
export function tempDataDir() {
  return mkdtemp(join(tmpdir(), 'afvalbeheer-test-'));
}

/** A clock that can be moved: `clock()` returns the current fake date. */
export function fakeClock(iso) {
  let now = new Date(iso);
  const clock = () => new Date(now);
  clock.set = (value) => {
    now = new Date(value);
  };
  clock.advance = (ms) => {
    now = new Date(now.getTime() + ms);
  };
  return clock;
}

/** A Recycle! collections answer, from `[date, frenchName, extra?]` entries. */
export function recycleCollections(entries) {
  return {
    items: entries.map(([date, fr, extra = {}]) => ({
      type: 'collection',
      timestamp: `${date}T00:00:00.000Z`,
      fraction: { name: { nl: fr, fr, en: fr, de: fr } },
      ...extra,
    })),
    pages: 1,
    page: 1,
  };
}

/** Routes answering a whole Recycle! fetch for Charleroi. */
export function recycleRoutes(collections) {
  return [
    [/\/zipcodes\?/, { items: [{ id: '6000-52011', code: '6000', available: true }], pages: 1 }],
    [
      /\/streets\?/,
      {
        items: [
          { id: 'geodata.wallonie.be/id/streetname-1', name: 'Rue de la Montagne', names: {} },
        ],
      },
    ],
    [/\/collections\?/, recycleCollections(collections)],
  ];
}

export const RECYCLE_CONFIG = {
  collector: 'recycleapp',
  postcode: '6000',
  house_number: '1',
  street_name: 'Rue de la Montagne',
  language: 'fr',
};
