// -----------------------------------------------------------------------------
// Persistent state, in /data (the one writable volume of the container): the
// last schedule fetched (shown again right after a restart, even if the
// provider is down), the reminders already fired (a restart never fires the
// same reminder twice) and the address/session ids the collectors cache.
//
// A write that fails is logged and ignored: the state only saves work.
// -----------------------------------------------------------------------------

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLogger } from '@gladysassistant/integration-sdk';

const logger = createLogger({ name: 'store' });

export const EMPTY_STATE = {
  addressKey: null,
  collections: [],
  fetchedAt: null,
  firedReminders: {},
  collectorCache: {},
};

export function createStore(dataDir = process.env.DATA_DIR ?? '/data') {
  const file = join(dataDir, 'state.json');
  return {
    async load() {
      try {
        const raw = JSON.parse(await readFile(file, 'utf8'));
        return { ...structuredClone(EMPTY_STATE), ...raw };
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.warn(`Unreadable state file, starting fresh: ${err.message}`);
        }
        return structuredClone(EMPTY_STATE);
      }
    },
    async save(state) {
      try {
        await mkdir(dataDir, { recursive: true });
        // Write then rename: a crash mid-write never leaves a truncated file.
        await writeFile(`${file}.tmp`, JSON.stringify(state));
        await rename(`${file}.tmp`, file);
      } catch (err) {
        logger.warn(`Could not save the state: ${err.message}`);
      }
    },
  };
}
