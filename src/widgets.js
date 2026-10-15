// -----------------------------------------------------------------------------
// Dashboard widgets (Gladys 5.1+), rendered by the core from a declarative
// content (no HTML), in the language of the user viewing the dashboard:
//   - next_collection: the next collection day — what, when, in how many
//     days — and a button to fetch the schedule again;
//   - upcoming_collections: the list of the next collections, with a
//     "today / tomorrow / in N days" badge.
// -----------------------------------------------------------------------------

import { createLogger, WIDGET_COLORS } from '@gladysassistant/integration-sdk';
import { daysBetween, formatDate, formatShortDate } from './dates.js';
import { LANGUAGES, pick, WASTE_TYPES, wasteLabel } from './wasteTypes.js';

const logger = createLogger({ name: 'widgets' });

export const NEXT_COLLECTION_WIDGET = 'next_collection';
export const UPCOMING_COLLECTIONS_WIDGET = 'upcoming_collections';
export const DEFAULT_MAX_ITEMS = 5;
export const MAX_ITEMS = 8;

const ACTIONS = { REFRESH: 'refresh' };

const TEXTS = {
  next: {
    en: 'Next collection',
    fr: 'Prochaine collecte',
    de: 'Nächste Abholung',
    es: 'Próxima recogida',
    nl: 'Volgende ophaling',
  },
  days: { en: 'days', fr: 'jours', de: 'Tage', es: 'días', nl: 'dagen' },
  empty: {
    en: 'No collection planned yet: check the address in the integration configuration.',
    fr: "Aucune collecte connue pour l'instant : vérifiez l'adresse dans la configuration de l'intégration.",
    de: 'Noch keine Abholung bekannt: Prüfen Sie die Adresse in der Konfiguration der Integration.',
    es: 'Aún no hay recogidas: compruebe la dirección en la configuración de la integración.',
    nl: 'Nog geen ophaling bekend: controleer het adres in de configuratie van de integratie.',
  },
  refresh: {
    en: 'Refresh',
    fr: 'Actualiser',
    de: 'Aktualisieren',
    es: 'Actualizar',
    nl: 'Vernieuwen',
  },
  refreshed: {
    en: 'Schedule updated',
    fr: 'Calendrier mis à jour',
    de: 'Kalender aktualisiert',
    es: 'Calendario actualizado',
    nl: 'Kalender bijgewerkt',
  },
  today: { en: 'Today', fr: "Aujourd'hui", de: 'Heute', es: 'Hoy', nl: 'Vandaag' },
  tomorrow: { en: 'Tomorrow', fr: 'Demain', de: 'Morgen', es: 'Mañana', nl: 'Morgen' },
};

const inDays = (days, language) =>
  ({
    en: `In ${days} days`,
    fr: `Dans ${days} j`,
    de: `In ${days} Tagen`,
    es: `En ${days} días`,
    nl: `Over ${days} dagen`,
  })[language] ?? `In ${days} days`;

/** 'Today', 'Tomorrow', 'In 3 days' (≤ 16 characters, a card-list badge). */
export function relativeDay(days, language) {
  if (days === 0) {
    return pick(TEXTS.today, language);
  }
  if (days === 1) {
    return pick(TEXTS.tomorrow, language);
  }
  return inDays(days, language);
}

function dayColor(days) {
  if (days === 0) {
    return WIDGET_COLORS.DANGER;
  }
  if (days === 1) {
    return WIDGET_COLORS.WARNING;
  }
  return WIDGET_COLORS.NEUTRAL;
}

const languageOf = (language, config) =>
  LANGUAGES.includes(language) ? language : config.language;

const emptyContent = (language) => ({
  ttl_seconds: 300,
  components: [{ type: 'text', variant: 'body', text: pick(TEXTS.empty, language) }],
});

export function nextCollectionContent(schedule, language) {
  const next = schedule.next();
  if (!next) {
    return emptyContent(language);
  }
  const sameDay = schedule.on(next.date);
  const names = sameDay.map((item) => wasteLabel(item.type, item.name, language)).join(', ');
  return {
    ttl_seconds: 900,
    components: [
      { type: 'text', variant: 'heading', text: names.slice(0, 40) },
      {
        type: 'value',
        label: pick(TEXTS.next, language),
        value: next.days,
        unit: pick(TEXTS.days, language),
        icon: (WASTE_TYPES[next.type] ?? WASTE_TYPES.other).icon,
        color: dayColor(next.days),
      },
      {
        type: 'text',
        variant: 'caption',
        text: `${relativeDay(next.days, language)} · ${formatDate(next.date, language)}`.slice(
          0,
          80,
        ),
      },
      {
        type: 'button',
        label: pick(TEXTS.refresh, language),
        icon: 'refresh-cw',
        style: 'secondary',
        action: { key: ACTIONS.REFRESH },
      },
    ],
  };
}

export function upcomingCollectionsContent(schedule, language, maxItems = DEFAULT_MAX_ITEMS) {
  const count = Math.min(MAX_ITEMS, Math.max(1, Math.round(Number(maxItems) || DEFAULT_MAX_ITEMS)));
  const today = schedule.today();
  const upcoming = schedule.upcoming(today).slice(0, count);
  if (upcoming.length === 0) {
    return emptyContent(language);
  }
  return {
    ttl_seconds: 900,
    components: [
      {
        type: 'card-list',
        display: 'list',
        items: upcoming.map((collection) => {
          const days = daysBetween(today, collection.date);
          return {
            title: wasteLabel(collection.type, collection.name, language).slice(0, 60),
            subtitle: formatShortDate(collection.date, language),
            badge: { text: relativeDay(days, language).slice(0, 16), color: dayColor(days) },
          };
        }),
      },
    ],
  };
}

export function createWidgets({ schedule, getConfig, refreshNow }) {
  return {
    [NEXT_COLLECTION_WIDGET]: {
      async get(_gladys, { language }) {
        logger.debug(`onWidgetGet <- ${NEXT_COLLECTION_WIDGET}`);
        return nextCollectionContent(schedule, languageOf(language, getConfig()));
      },
      async action(_gladys, { actionKey }) {
        logger.info(`onWidgetAction <- ${NEXT_COLLECTION_WIDGET}.${actionKey}`);
        if (actionKey !== ACTIONS.REFRESH) {
          throw new Error(`Unknown widget action: ${actionKey}`);
        }
        await refreshNow();
        return TEXTS.refreshed;
      },
    },
    [UPCOMING_COLLECTIONS_WIDGET]: {
      async get(_gladys, { language, settings }) {
        logger.debug(`onWidgetGet <- ${UPCOMING_COLLECTIONS_WIDGET}`);
        return upcomingCollectionsContent(
          schedule,
          languageOf(language, getConfig()),
          settings?.max_items,
        );
      },
    },
  };
}

export const WIDGET_KEYS = [NEXT_COLLECTION_WIDGET, UPCOMING_COLLECTIONS_WIDGET];
