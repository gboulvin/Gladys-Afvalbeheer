# Changelog

All notable changes to this integration are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
uses [semantic versioning](https://semver.org/).

Describe each change under `## [Unreleased]` as you make it. The Release
workflow moves that section under the version it ships, and the section becomes
the notes of the version's GitHub Release.

## [Unreleased]

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
