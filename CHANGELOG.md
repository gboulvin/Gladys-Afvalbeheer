# Changelog

All notable changes to this integration are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [semantic versioning](https://semver.org/).

Describe each change under `## [Unreleased]` as you make it. The Release
workflow moves that section under the version it ships, and the section becomes
the notes of the version's GitHub Release.

## [Unreleased]

### Added

- Pick your Gladys house in the configuration: its address is found from its
  location on the map (OpenStreetMap). The address fields become optional
  corrections (e.g. the house number when the house is pinned next door).

### Changed

- Gladys 5.2.0 or later is required (house selection), and the integration
  asks for the house location on the install screen.

### Fixed

- Adding the devices failed with "HTTP 422 — t_device_feature.min cannot be
  null": the "Next collection" text feature now declares its min and max.
- Recycle!: a street written with other accents than in the app ("Rue
  Basslé" / "Rue Bassle") is now found.

## [1.0.0] - 2026-10-15

### Added

- First release: waste collection schedules in Belgium and the Netherlands.
- Belgium: every municipality of the Recycle! app (Fost Plus) — Wallonia
  (Tibi, Ipalle, Intradel, BEP, Hygea, inBW, IDELUX, ICDI...), Flanders and
  Brussels — and Limburg.net.
- Netherlands: about 60 collectors and municipalities — Mijn Afvalwijzer, the
  Ximmio platform (Twente Milieu, ACV, Avalex, Meerlanden...), Burgerportaal
  (Tilburg, Breda, Groningen...), the Opzet platform (HVC, Cyclus, Dar, GAD,
  Den Haag, PreZero...), ROVA, RD4, Circulus, Irado, Reinis, Drimmelen,
  Maassluis and Oude IJsselstreek.
- One device per waste type collected at the address, with the days until the
  next collection and its date.
- Scene triggers "Waste collection tomorrow" (evening) and "Waste collection
  today" (morning), filterable by waste type.
- Scene actions "Get the next waste collection" and "Refresh the waste
  schedule".
- Dashboard widgets "Next waste collection" and "Upcoming waste collections".
- English, French, German and Spanish everywhere (configuration, scenes,
  widgets, documentation); device names and scene texts also in Dutch.

[Unreleased]: https://github.com/gboulvin/Gladys-Afvalbeheer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gboulvin/Gladys-Afvalbeheer/releases/tag/v1.0.0
