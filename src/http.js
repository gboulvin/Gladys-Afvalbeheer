// -----------------------------------------------------------------------------
// Minimal HTTP helpers on top of the global `fetch` (Node 22+): one timeout,
// one User-Agent, and errors that say which provider answered what. Every
// collector goes through them, so the tests mock a single function.
// -----------------------------------------------------------------------------

export const REQUEST_TIMEOUT_MS = 30_000;
export const USER_AGENT = 'Gladys-Afvalbeheer (+https://github.com/gboulvin/Gladys-Afvalbeheer)';

export class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} from ${new URL(url).host}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Build a URL with query parameters (undefined values are left out).
 * @param {string} base
 * @param {Record<string, string | number | boolean | undefined>} [params]
 */
export function buildUrl(base, params = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Send a request and return the raw Response, throwing on a non-2xx status
 * unless `allowStatus` lists it.
 */
export async function request(
  url,
  { method = 'GET', headers = {}, body, allowStatus = [], redirect = 'follow' } = {},
) {
  const response = await fetch(url, {
    method,
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...headers },
    body,
    redirect,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok && !allowStatus.includes(response.status)) {
    throw new HttpError(response.status, url);
  }
  return response;
}

/** GET/POST and parse JSON. An empty body (204, empty text) resolves `null`. */
export async function requestJson(url, options) {
  const response = await request(url, options);
  const text = await response.text();
  // An allowed error status (`allowStatus`) means "nothing there".
  if (!response.ok || !text.trim()) {
    return null;
  }
  return JSON.parse(text);
}

/** application/x-www-form-urlencoded body. */
export function formBody(fields) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  return {
    body: params.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };
}
