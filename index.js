// -----------------------------------------------------------------------------
// Entry point of the Afvalbeheer Gladys external integration.
//
// SDK wiring only: every behaviour lives in src/app.js. This file registers
// the handlers BEFORE connect(), then connects.
//
// Environment variables provided by the Gladys supervisor to the container
// (read by the SDK): GLADYS_HOST_API_URL, GLADYS_INTEGRATION_TOKEN,
// GLADYS_INTEGRATION_SELECTOR.
// -----------------------------------------------------------------------------

import { GladysIntegration, logger } from '@gladysassistant/integration-sdk';
import { createApp } from './src/app.js';
import { SCENE_ACTIONS } from './src/scenes.js';

const gladys = new GladysIntegration();
const app = createApp(gladys);

// --- Discovery: Gladys asks for the list of devices --------------------------
gladys.onScanRequest(() => app.onScanRequest());

// --- Manifest action: button of the Configuration screen ---------------------
gladys.onAction('fetch_schedule', () => app.fetchScheduleAction());

// --- Scene actions -----------------------------------------------------------
for (const key of Object.keys(SCENE_ACTIONS)) {
  gladys.onSceneAction(key, (fields) => app.sceneAction(key, fields));
}

// --- Dashboard widgets -------------------------------------------------------
for (const [key, widget] of Object.entries(app.widgets)) {
  gladys.onWidgetGet(key, (request) => widget.get(gladys, request));
  if (typeof widget.action === 'function') {
    gladys.onWidgetAction(key, (actionKey, params, { settings }) =>
      widget.action(gladys, { actionKey, params, settings }),
    );
  }
}

// --- Configuration updated by the user ---------------------------------------
gladys.onConfigUpdated((newConfig) => app.onConfigUpdated(newConfig));

// --- Connection lifecycle ----------------------------------------------------
gladys.on('connected', async () => {
  try {
    await app.onConnected();
    app.start();
  } catch (err) {
    logger.error('Post-connection initialization failed', err);
    await gladys
      .setConnectionStatus(false, {
        en: 'Initialization failed, check the integration logs.',
        fr: "L'initialisation a échoué, consultez les logs de l'intégration.",
        de: 'Initialisierung fehlgeschlagen, prüfen Sie die Logs der Integration.',
        es: 'La inicialización falló, revise los registros de la integración.',
      })
      .catch(() => {});
  }
});

gladys.on('disconnected', () => app.stop());

// --- Graceful shutdown -------------------------------------------------------
gladys.handleShutdown((signal) => {
  logger.info(`Received ${signal} -> graceful shutdown`);
  app.stop();
});

// --- Startup -----------------------------------------------------------------
logger.info('Starting the Afvalbeheer integration...');
gladys.connect().catch((err) => {
  logger.error('Initial connection failed', err);
  process.exit(1);
});
