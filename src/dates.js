// -----------------------------------------------------------------------------
// Calendar dates.
//
// A collection happens on a calendar DAY, not at an instant: every date is
// kept as a 'YYYY-MM-DD' string, and "today" is read in the time zone of the
// covered countries (the Netherlands and Belgium share Europe/Brussels time),
// whatever the time zone of the container (UTC by default).
// -----------------------------------------------------------------------------

export const TIME_ZONE = 'Europe/Brussels';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local date and hour in TIME_ZONE: { date: 'YYYY-MM-DD', hour: 0-23 }. */
export function localNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

/** Is it a valid 'YYYY-MM-DD' date? */
export function isIsoDate(value) {
  const match = DATE_RE.exec(value ?? '');
  if (!match) {
    return false;
  }
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return date.toISOString().slice(0, 10) === value;
}

/** Add `days` to a 'YYYY-MM-DD' date. */
export function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both 'YYYY-MM-DD'). */
export function daysBetween(from, to) {
  const toUtc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

/**
 * Turn what a provider sends into a 'YYYY-MM-DD' date, or null:
 *   '2026-10-16', '2026-10-16T00:00:00', '2026-10-16T00:00:00.000Z',
 *   '2026-10-16T00:00:00+02:00' -> the date part as written (the provider
 *   means that calendar day, the offset is noise);
 *   '16-10-2026', '16/10/2026' -> day first (Dutch and Belgian notation).
 */
export function parseDate(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  const iso = /^(\d{4}-\d{2}-\d{2})(?:[T ].*)?$/.exec(trimmed);
  if (iso) {
    return isIsoDate(iso[1]) ? iso[1] : null;
  }
  const dayFirst = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(trimmed);
  if (dayFirst) {
    const candidate = `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`;
    return isIsoDate(candidate) ? candidate : null;
  }
  return null;
}

/** Long localized date: 'vendredi 16 octobre', 'Friday, October 16'. */
export function formatDate(isoDate, language) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Short localized date: 'ven. 16 oct.', 'Fri, Oct 16'. */
export function formatShortDate(isoDate, language) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
