# Afvalbeheer – Waste collection for Gladys Assistant

External integration for [Gladys Assistant](https://gladysassistant.com) that
gives the **waste collection days** of your address in **Belgium** and the
**Netherlands**: devices, scene triggers ("bin day tomorrow"), scene actions
and dashboard widgets.

- 🇧🇪 **Belgium** — every municipality of the **Recycle!** app (Fost Plus):
  Wallonia (**Tibi**, **Ipalle**, Intradel, BEP, Hygea, inBW, IDELUX, ICDI…),
  Flanders and Brussels; plus **Limburg.net**.
- 🇳🇱 **Netherlands** — about 60 collectors and municipalities: Mijn
  Afvalwijzer, Ximmio (Twente Milieu, ACV, Avalex, Meerlanden…), Burgerportaal
  (Tilburg, Breda, Groningen…), Opzet (HVC, Cyclus, Dar, GAD, Den Haag,
  PreZero…), ROVA, RD4, Circulus, Irado…

Cloud only (public web APIs of the collectors), no account needed. Requires
Gladys **5.3.0** or later. Available in English, French, German and Spanish.

📖 User documentation: [English](docs/en.md) · [Français](docs/fr.md) ·
[Deutsch](docs/de.md) · [Español](docs/es.md) — with the full list of
collectors and areas.

## What you get

| Surface              | What                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Devices              | One per waste type at your address: **days until collection** + **next collection** (date) |
| Scene triggers       | **Waste collection tomorrow** (evening) · **Waste collection today** (morning)             |
| Scene actions        | **Get the next waste collection** · **Refresh the waste schedule**                         |
| Dashboard widgets    | **Next waste collection** · **Upcoming waste collections**                                 |
| Configuration action | **Fetch the schedule now** (shows what was found)                                          |

## Development

```bash
npm install
npm test               # node --test, never touches the network
npm run lint
npm run format:check
```

Run it against a Gladys instance:

```bash
GLADYS_HOST_API_URL="http://localhost:1443" \
GLADYS_INTEGRATION_TOKEN="<token>" \
GLADYS_INTEGRATION_SELECTOR="afvalbeheer" \
DATA_DIR=./data LOG_LEVEL=debug \
npm start
```

See [CLAUDE.md](CLAUDE.md) for the architecture and the project rules (adding
a collector, languages, releases).

## Release

Describe the changes under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md),
then **Actions → Release → Run workflow** (patch / minor / major): the workflow
bumps the versions, tags, builds the multi-arch image to
`ghcr.io/gboulvin/gladys-afvalbeheer` and publishes the GitHub Release.

## Credits

Built from the official
[Gladys integration template](https://github.com/GladysAssistant/integration-template-js).
The collector drivers are ported from the Home Assistant
[Afvalbeheer](https://github.com/pippyn/Home-Assistant-Sensor-Afvalbeheer)
component by pippyn and contributors. Data comes from the collectors' public
services; this project is not affiliated with them.

## License

[Apache-2.0](LICENSE) — see also [NOTICE](NOTICE).
