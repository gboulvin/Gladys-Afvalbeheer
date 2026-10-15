// -----------------------------------------------------------------------------
// The integration's behaviour, independent from the process wiring (index.js)
// so the tests drive it with the SDK's fake Gladys and a fake clock.
//
// One minute tick drives everything:
//   1. fetch the schedule when due (first start, new address, every
//      `refresh_interval_hours`; after a failure, retry in 15 minutes);
//   2. publish the states that changed (the day count moves at midnight);
//   3. fire the scene reminders due (morning / evening hours of the config).
// -----------------------------------------------------------------------------

import { createLogger, DEVICE_TRANSPORTS } from '@gladysassistant/integration-sdk';
import { configProblem, normalizeConfig } from './config.js';
import { formatDate } from './dates.js';
import { buildDevices, buildStates } from './devices/wasteDevices.js';
import { createSchedule } from './schedule.js';
import { fireDueReminders, SCENE_ACTIONS } from './scenes.js';
import { createStore } from './store.js';
import { createWidgets } from './widgets.js';
import { wasteLabel } from './wasteTypes.js';

const logger = createLogger({ name: 'app' });

export const TICK_MS = 60_000;
export const RETRY_AFTER_FAILURE_MS = 15 * 60_000;
// Re-send unchanged states now and then, so they stay recently dated.
const STATE_HEARTBEAT_MS = 6 * 3_600_000;

const MESSAGES = {
  unreachable: (err) => ({
    en: `The waste collector could not be reached: ${err.message}`,
    fr: `Le collecteur de déchets est injoignable : ${err.message}`,
    de: `Der Entsorger ist nicht erreichbar: ${err.message}`,
    es: `No se pudo contactar con el recolector: ${err.message}`,
  }),
  fetched: (count, next, language) => {
    const when = next
      ? ` ${wasteLabel(next.type, next.name, language)} — ${formatDate(next.date, language)}.`
      : '';
    return {
      en: `${count} collections found. Next:${when}`,
      fr: `${count} collectes trouvées. Prochaine :${when}`,
      de: `${count} Abholungen gefunden. Nächste:${when}`,
      es: `${count} recogidas encontradas. Próxima:${when}`,
    };
  },
};

export function createApp(gladys, { store = createStore(), clock = () => new Date() } = {}) {
  let config = normalizeConfig();
  const schedule = createSchedule({ store, clock });
  let initialized = false;
  let retryAt = 0;
  let lastDay = null;
  let timer = null;
  let ticking = null;

  const widgets = createWidgets({ schedule, getConfig: () => config, refreshNow });

  function refreshWidgets() {
    for (const key of Object.keys(widgets)) {
      gladys.requestWidgetRefresh(key);
    }
  }

  async function publishDevices() {
    await gladys.publishDiscoveredDevices(buildDevices(gladys, config, schedule));
  }

  async function publishStates() {
    const states = buildStates(gladys, config, schedule);
    if (states.length > 0) {
      await gladys.publishChangedStates(states, { heartbeat: STATE_HEARTBEAT_MS });
    }
  }

  async function publishTransports(transport, message) {
    const entries = buildDevices(gladys, config, schedule).map((device) => ({
      external_id: device.external_id,
      transport,
      ...(message ? { degraded: true, message } : {}),
    }));
    if (entries.length > 0) {
      await gladys.publishTransports(entries);
    }
  }

  async function init() {
    if (!initialized) {
      await schedule.init();
      initialized = true;
    }
  }

  /** Fetch the schedule now and publish everything. Throws on failure. */
  async function refreshNow() {
    await init();
    const problem = configProblem(config);
    if (problem) {
      await gladys.setConnectionStatus(false, problem);
      throw new Error(problem.en);
    }
    try {
      await schedule.refresh(config);
    } catch (err) {
      retryAt = clock().getTime() + RETRY_AFTER_FAILURE_MS;
      logger.error(`Schedule fetch failed: ${err.message}`);
      await gladys.setConnectionStatus(false, MESSAGES.unreachable(err)).catch(() => {});
      // The last known schedule is still served, flagged as stale.
      await publishTransports(DEVICE_TRANSPORTS.CLOUD, MESSAGES.unreachable(err)).catch(() => {});
      throw err;
    }
    retryAt = 0;
    await publishDevices();
    await publishStates();
    await publishTransports(DEVICE_TRANSPORTS.CLOUD);
    await gladys.setConnectionStatus(true);
    refreshWidgets();
    return schedule.upcoming();
  }

  async function tickOnce() {
    await init();
    if (configProblem(config)) {
      return;
    }
    if (schedule.isRefreshDue(config) && clock().getTime() >= retryAt) {
      await refreshNow().catch(() => {});
    }
    const today = schedule.today();
    if (today !== lastDay) {
      // Midnight (or first tick): the day counts and the widgets move.
      lastDay = today;
      refreshWidgets();
    }
    await publishStates();
    await fireDueReminders(gladys, { schedule, config });
  }

  /** One tick; concurrent calls share the running one. */
  function tick() {
    if (!ticking) {
      ticking = tickOnce()
        .catch((err) => logger.error('Tick failed', err))
        .finally(() => {
          ticking = null;
        });
    }
    return ticking;
  }

  return {
    schedule,
    widgets,
    refreshNow,
    tick,
    get config() {
      return config;
    },

    /** (Re)connected: read the config, re-publish what is known, tick. */
    async onConnected() {
      await init();
      config = normalizeConfig(await gladys.getConfig());
      const problem = configProblem(config);
      await publishDevices();
      if (problem) {
        await gladys.setConnectionStatus(false, problem);
      } else if (!schedule.isRefreshDue(config)) {
        await gladys.setConnectionStatus(true);
        await publishTransports(DEVICE_TRANSPORTS.CLOUD);
      }
      // Nudges sent while disconnected were dropped, and SDK state memory
      // may be stale after a reconnection: re-send everything.
      gladys.forgetPublishedStates();
      refreshWidgets();
      await tick();
    },

    async onConfigUpdated(newConfig) {
      config = normalizeConfig(newConfig);
      retryAt = 0;
      const problem = configProblem(config);
      if (problem) {
        await gladys.setConnectionStatus(false, problem);
        return;
      }
      // Language or address changed: names and ids follow.
      await publishDevices();
      gladys.forgetPublishedStates();
      await tick();
    },

    async onScanRequest() {
      await publishDevices();
    },

    /** Manifest action `fetch_schedule` (Configuration screen). */
    async fetchScheduleAction() {
      const upcoming = await refreshNow();
      return MESSAGES.fetched(upcoming.length, schedule.next(), config.language);
    },

    /** Scene action handlers, bound to the app context. */
    sceneAction(key, fields) {
      return SCENE_ACTIONS[key](gladys, { fields, config, schedule, refreshNow });
    },

    start() {
      if (!timer) {
        timer = setInterval(() => tick(), TICK_MS);
      }
    },

    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
