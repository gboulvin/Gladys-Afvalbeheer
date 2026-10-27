# Afvalbeheer – Waste collection

Know when your bins are collected, straight in Gladys: the integration reads
the waste collection calendar of your address from your collector's public
service, and gives you devices, scene triggers, scene actions and dashboard
widgets.

## Where does it work?

Only in **Belgium** and in the **Netherlands**, for the collectors below. It
uses the internet (cloud) only: the schedule is read from the collector's
website or app API. No account is needed.

### Belgium

| Collector                | Area                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recycle!** (Fost Plus) | All of Belgium covered by the Recycle! app: **Wallonia** (Tibi – Charleroi region, Ipalle – Wallonie picarde, Intradel – Liège, BEP – Namur, Hygea – Mons, inBW – Walloon Brabant, IDELUX – Luxembourg, ICDI...), **Flanders** and **Brussels** |
| **Limburg.net**          | Province of Limburg (Hasselt, Genk, Sint-Truiden, Tongeren...)                                                                                                                                                                                  |

### Netherlands

| Collector              | Area                                               |
| ---------------------- | -------------------------------------------------- |
| Mijn Afvalwijzer       | ~100 municipalities using mijnafvalwijzer.nl       |
| ACV                    | Ede, Renkum, Wageningen, Veenendaal                |
| Almere                 | Almere                                             |
| Area Reiniging         | Emmen, Coevorden, Borger-Odoorn                    |
| Avalex                 | Delft, Rijswijk, Leidschendam-Voorburg...          |
| Avri                   | Rivierenland (Tiel, Culemborg...)                  |
| Blink                  | Helmond, Deurne, Gemert-Bakel...                   |
| Hellendoorn            | Hellendoorn                                        |
| Meerlanden             | Haarlemmermeer, Aalsmeer, Heemstede...             |
| Oostzaan               | Oostzaan                                           |
| RAD Hoeksche Waard     | Hoeksche Waard                                     |
| Twente Milieu          | Enschede, Hengelo, Almelo...                       |
| Venlo                  | Venlo                                              |
| Waardlanden            | Gorinchem, Molenlanden, Vijfheerenlanden           |
| Westland               | Westland                                           |
| Woerden                | Woerden                                            |
| Assen                  | Assen                                              |
| BAR-Afvalbeheer        | Barendrecht, Albrandswaard, Ridderkerk             |
| Breda                  | Breda                                              |
| Groningen              | Groningen                                          |
| Nijkerk                | Nijkerk                                            |
| RMN (Midden-Nederland) | Midden-Nederland (Baarn, Soest, Zeist...)          |
| Tilburg                | Tilburg                                            |
| Afval3xBeter           | Municipalities using afval3xbeter.nl               |
| Afvalstoffendienst     | 's-Hertogenbosch, Heusden, Vught                   |
| Alphen aan den Rijn    | Alphen aan den Rijn                                |
| Berkelland             | Berkelland                                         |
| Cranendonck            | Cranendonck                                        |
| Cyclus                 | Gouda region, Montfoort, Uithoorn...               |
| Dar                    | Nijmegen, Berg en Dal, Beuningen...                |
| De Fryske Marren       | De Fryske Marren                                   |
| Den Haag               | Den Haag                                           |
| GAD                    | Gooi en Vechtstreek (Hilversum, Huizen...)         |
| HVC                    | Alkmaar, Dordrecht, Flevoland, Noord-Holland...    |
| Lingewaard             | Lingewaard                                         |
| Middelburg-Vlissingen  | Middelburg, Vlissingen                             |
| Mijn Afvalzaken        | Municipalities using mijnafvalzaken.nl             |
| Ôffalkalinder          | Frisian municipalities using offalkalinder.nl      |
| Peel en Maas           | Peel en Maas                                       |
| PreZero                | PreZero (ex-Suez) municipalities                   |
| Purmerend              | Purmerend                                          |
| RWM                    | Roerdalen, Roermond, Maasgouw...                   |
| Saver                  | Roosendaal, Bergen op Zoom, Woensdrecht...         |
| Schouwen-Duiveland     | Schouwen-Duiveland                                 |
| Sliedrecht             | Sliedrecht                                         |
| Spaarnelanden          | Haarlem, Zandvoort                                 |
| Súdwest-Fryslân        | Súdwest-Fryslân                                    |
| Venray                 | Venray                                             |
| Voorschoten            | Voorschoten                                        |
| Waalre                 | Waalre                                             |
| ZRD                    | Zeeland municipalities using zrd.nl                |
| Circulus               | Apeldoorn, Deventer, Zutphen, Epe...               |
| Drimmelen              | Drimmelen                                          |
| Irado                  | Schiedam, Vlaardingen, Capelle aan den IJssel      |
| Maassluis              | Maassluis                                          |
| Oude IJsselstreek      | Oude IJsselstreek                                  |
| RD4                    | Parkstad Limburg (Heerlen, Kerkrade, Landgraaf...) |
| Reinis                 | Municipalities using reinis.nl                     |
| ROVA                   | Zwolle, Amersfoort, Kampen...                      |

Your collector is not listed? Open an issue on the
[GitHub repository](https://github.com/gboulvin/Gladys-Afvalbeheer/issues).

## Configuration

1. Open the **Configuration** tab of the integration.
2. Pick your **waste collector**. In Belgium, it is **Recycle!** almost
   everywhere (**Limburg.net** in the province of Limburg).
3. Pick your **house**: its address is found from its location on the map
   (Gladys settings → Houses), through OpenStreetMap. That is all most users
   need.
4. The **address** fields are optional: leave them empty to use the address
   of the house, or fill in only what needs correcting — typically the
   **house number** (and its **suffix**, e.g. `A`) when the house is pinned
   next door, or the **street name** when it is not written as in the
   Recycle! app (e.g. `Rue de la Montagne`). Without a house, fill in the
   postcode and house number (plus the street name for Recycle! and
   Limburg.net, and the municipality for Limburg.net).
5. Choose the **language** of the device names and scene texts (English,
   French, German, Spanish or Dutch), and the **hours** of the evening and
   morning reminders (19:00 and 07:00 by default).
6. Save, then press **Fetch the schedule now**: the message under the button
   tells you how many collections were found and which one is next.
7. Open the **Discovery** tab and add the devices you want: one per waste
   type collected at your address.

The schedule is fetched again every 12 hours (configurable). If the
collector is unreachable, the last known schedule keeps being used, the
connection status says so and the integration retries 15 minutes later.

## Devices

One device per waste type ("Collection – Paper & cardboard"...), with two
features:

- **Days until collection** — `0` on the collection day, `1` the day before…
- **Next collection** — the date, written in full ("Friday, October 16").

Waste types: residual waste, organic waste, PMD/PMC, paper & cardboard,
glass, textile, garden waste, bulky waste, hazardous waste, Christmas trees,
soft plastics; a fraction the integration does not know keeps its own name.

## Scenes

**Triggers** (Gladys 5.3 or later, category **Integrations**):

- **Waste collection tomorrow** — fired at the evening reminder hour, once
  for every waste type collected the next day.
- **Waste collection today** — fired at the morning reminder hour, once for
  every waste type collected that day.

Optionally pick the waste types the scene reacts to; left empty, any matches.
The following actions can use `{{triggerEvent.data.waste_name}}`,
`{{triggerEvent.data.date_text}}`, `{{triggerEvent.data.date}}`,
`{{triggerEvent.data.waste_type}}` and `{{triggerEvent.data.all_waste_names}}`
(everything collected that day). Example: _"Tomorrow: put out the
{{triggerEvent.data.waste_name}} bin"_ sent by Telegram.

A reminder is never fired twice, even after a restart. If Gladys starts more
than 3 hours after the reminder hour, the reminder of the day is skipped.

**Actions:**

- **Get the next waste collection** — of one waste type, or of any. Outputs:
  `found`, `waste_type`, `waste_name`, `date`, `date_text`, `days_until`.
- **Refresh the waste schedule** — fetches the schedule now. Output:
  `collections_count`.

## Dashboard

- **Next waste collection** — what is collected next, when, and in how many
  days, with a **Refresh** button.
- **Upcoming waste collections** — the list of the next collections (1 to 8,
  5 by default) with a "Today / Tomorrow / In N days" badge.

## Troubleshooting

- _"street … not found"_: write the street name exactly as the Recycle! app
  shows it, with its accents.
- _"returned no collection for this address"_: check the collector, the
  postcode and the house number on the collector's own website.
- Logs: open the integration logs in Gladys (set `LOG_LEVEL=debug` for more
  detail). Remove your address before sharing them.

Data comes from the collectors' public services; the integration is not
affiliated with them.
