# CLAUDE.md

Project rules for coding assistants (Claude Code reads this file) and for human
contributors.

## What this is

**Afvalbeheer** — a Gladys Assistant **external integration** giving the waste
collection days of an address in **Belgium** (Recycle! / Fost Plus: Tibi,
Ipalle, Intradel, BEP...; Limburg.net) and the **Netherlands** (about 60
collectors: Mijn Afvalwijzer, Ximmio, Burgerportaal, Opzet, ROVA, RD4...).
A Node.js service (Node 22+, ESM, no build step) running in its own sandboxed
Docker container, talking to Gladys through
[`@gladysassistant/integration-sdk`](https://github.com/GladysAssistant/integration-sdk-js),
its only runtime dependency. It started from the official
[JavaScript template](https://github.com/GladysAssistant/integration-template-js);
the collector drivers are ported from the Home Assistant
[Afvalbeheer](https://github.com/pippyn/Home-Assistant-Sensor-Afvalbeheer)
component (see `NOTICE`).

## Commands

```bash
npm install
npm test                                  # node --test, the built-in runner
node --test test/collectors.test.js       # one file
node --test --test-name-pattern "Ximmio"  # tests whose name matches
npm run lint                              # ESLint
npm run format:check                      # Prettier, as the CI runs it
npm run format                            # Prettier, fix in place
npx github:GladysAssistant/integration-store .   # store admission checks
```

The CI (`.github/workflows/ci.yml`) runs `format:check`, `lint` and `test` on
Node 22 and 24, and builds the Docker image: run the three commands before
pushing.

## Architecture

```
index.js                     SDK wiring only: handlers registered before connect()
src/app.js                   the behaviour: minute tick, fetch, publish, reminders
src/schedule.js              the schedule of the address: fetch, normalize, query, reminders due
src/collectors/index.js      collector registry (key, country, area, driver, required fields)
src/collectors/<platform>.js one driver per API: fetch(address, { auth, today }) -> [{ date, name }]
src/wasteTypes.js            canonical waste types, provider-name mapping, labels (en/fr/de/es/nl)
src/devices/wasteDevices.js  one device per fraction: days until + next date
src/scenes.js                scene triggers (reminders) and scene actions
src/widgets.js               dashboard widgets (next collection, upcoming list)
src/dates.js                 calendar dates in Europe/Brussels time
src/store.js                 /data/state.json: last schedule, fired reminders, collector caches
src/address.js               the address: chosen Gladys house -> reverse geocoding, typed fields override
src/config.js                DEFAULT_CONFIG (mirrors the manifest defaults), normalization, checks
gladys-assistant-integration.json  manifest
docs/{en,fr,de,es}.md        user documentation, re-hosted by Gladys (en + fr mandatory)
test/                        node --test, SDK fake Gladys, mocked fetch (never the network)
```

## Rules

- **Keys are forever.** Collector keys (stored in the config), canonical waste
  type keys (stored in scene filters and device ids), manifest keys
  (`config_schema`, actions, scene triggers/actions, widgets, their variables
  and outputs) and feature keys (`days`, `next`) are never renamed. Device
  external ids are `waste:<collector>-<postcode>-<number>[-suffix]-<fraction>`.
- **Adding a collector**: write or reuse a driver in `src/collectors/`, add its
  entry to `COLLECTORS` (country, area, required address fields) **and** the
  same key to the manifest `collector` options (`test/manifest.test.js` checks
  it), add a test with a canned answer to `test/collectors.test.js`, list it in
  the four docs and in `CHANGELOG.md`.
- **Dates are calendar days** (`'YYYY-MM-DD'` strings) in Europe/Brussels time,
  never instants: use `src/dates.js`.
- **The container rootfs is read-only.** Write only under `/data`. Never log
  tokens; the address only appears in lookup errors.
- **Versions belong to the Release workflow** (Actions → Release). Never edit
  `version` in `package.json` or in the manifest, nor the `docker_image` tag,
  by hand. `test/manifest.test.js` checks they agree.
- **Changelog.** Every user-visible change adds a line under `## [Unreleased]`
  in `CHANGELOG.md`. Never write a version heading: the Release workflow does.
- **Languages.** Every user-facing text exists in English, French, German and
  Spanish: manifest texts (checked by `test/manifest.test.js`), action and
  status messages, widget texts and `docs/{en,fr,de,es}.md`, kept in sync.
  Device names and scene event texts follow the configured `language`, which
  also offers Dutch.
- **Manifest.** `transports` is `["cloud"]`: every collector is a public web
  API. The catalog `description` holds 10 to 100 characters per language, the
  `name` at most 30. The `house` select (`source: "houses"`) requires
  `gladys_version >=5.2.0` (the catalog `keywords`/`countries` fields, 5.3.0),
  and reading its coordinates `location: true`.
- **Address.** The address comes from the chosen house (reverse geocoding,
  OpenStreetMap Nominatim, Photon as a fallback: one request per
  configuration, cached), each typed
  address field overriding the geocoded one. Code that depends on the address
  (device ids, the schedule) uses the resolved configuration of `src/app.js`
  (`effective`), never the raw one.
- **Device features** always carry numeric `min` and `max`, a text one too:
  Gladys stores them as NOT NULL columns and refuses the device with a 422
  (the SDK's fake Gladys does not check it, `test/app.test.js` does).
- **Style.** Prettier formats, ESLint catches mistakes. Comments explain why,
  in English. Tests never touch the network.
