# Afvalbeheer – Müllabfuhr

Wissen, wann Ihre Tonnen geleert werden, direkt in Gladys: Die Integration
liest den Abfuhrkalender Ihrer Adresse beim öffentlichen Dienst Ihres
Entsorgers und stellt Geräte, Szenenauslöser, Szenenaktionen und
Dashboard-Widgets bereit.

## Wo funktioniert es?

Nur in **Belgien** und in den **Niederlanden**, für die unten aufgeführten
Entsorger. Es wird nur das Internet (Cloud) genutzt: Der Kalender wird über
die API der Website oder App des Entsorgers gelesen. Kein Konto nötig.

### Belgien

| Entsorger                | Gebiet                                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Recycle!** (Fost Plus) | Ganz Belgien, soweit von der Recycle!-App abgedeckt: **Wallonien** (Tibi – Region Charleroi, Ipalle – Wallonie picarde, Intradel – Lüttich, BEP – Namur, Hygea – Mons, inBW – Wallonisch-Brabant, IDELUX – Luxemburg, ICDI...), **Flandern** und **Brüssel** |
| **Limburg.net**          | Provinz Limburg (Hasselt, Genk, Sint-Truiden, Tongeren...)                                                                                                                                                                                                   |

### Niederlande

| Entsorger              | Gebiet                                             |
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

Ihr Entsorger fehlt? Eröffnen Sie ein Issue im
[GitHub-Repository](https://github.com/gboulvin/Gladys-Afvalbeheer/issues).

## Konfiguration

1. Öffnen Sie den Reiter **Konfiguration** der Integration.
2. Wählen Sie Ihren **Entsorger**. In Belgien ist es fast überall
   **Recycle!** (**Limburg.net** in der Provinz Limburg).
3. Wählen Sie Ihr **Haus**: Seine Adresse wird über OpenStreetMap aus
   seinem Standort auf der Karte ermittelt (Gladys-Einstellungen → Häuser).
   Mehr brauchen die meisten Nutzer nicht.
4. Die **Adressfelder** sind optional: Leer lassen, um die Adresse des Hauses
   zu verwenden, oder nur ausfüllen, was korrigiert werden muss — meist die
   **Hausnummer** (und der **Zusatz**, z. B. `A`), wenn das Haus beim Nachbarn
   gesetzt ist, oder der **Straßenname**, wenn er anders als in der
   Recycle!-App geschrieben ist. Ohne Haus geben Sie Postleitzahl und
   Hausnummer ein (dazu den Straßennamen für Recycle! und Limburg.net und die
   Gemeinde für Limburg.net).
5. Wählen Sie die **Sprache** der Gerätenamen und Szenentexte (Englisch,
   Französisch, Deutsch, Spanisch oder Niederländisch) sowie die **Uhrzeiten**
   der Abend- und Morgenerinnerung (standardmäßig 19 und 7 Uhr).
6. Speichern Sie und klicken Sie auf **Kalender jetzt abrufen**: Die Meldung
   unter der Schaltfläche nennt die Anzahl der gefundenen Abholungen und die
   nächste.
7. Öffnen Sie den Reiter **Erkennung** und fügen Sie die gewünschten Geräte
   hinzu: eines pro an Ihrer Adresse abgeholter Abfallart.

Der Kalender wird alle 12 Stunden neu abgerufen (einstellbar). Ist der
Entsorger nicht erreichbar, wird der letzte bekannte Kalender weiter genutzt,
der Verbindungsstatus zeigt es an und die Integration versucht es 15 Minuten
später erneut.

## Geräte

Ein Gerät pro Abfallart („Abholung – Papier & Pappe"...) mit zwei Funktionen:

- **Tage bis zur Abholung** — `0` am Abholtag, `1` am Vortag…
- **Nächste Abholung** — das ausgeschriebene Datum („Freitag, 16. Oktober").

Abfallarten: Restmüll, Biomüll, Verpackungen, Papier & Pappe, Glas,
Textilien, Grünschnitt, Sperrmüll, Sondermüll, Weihnachtsbäume, Weichplastik;
eine unbekannte Fraktion behält ihren eigenen Namen.

## Szenen

**Auslöser** (Gladys 5.3 oder neuer, Kategorie **Integrationen**):

- **Müllabfuhr morgen** — zur Abenderinnerung ausgelöst, einmal pro am
  nächsten Tag abgeholter Abfallart.
- **Müllabfuhr heute** — zur Morgenerinnerung ausgelöst, einmal pro am selben
  Tag abgeholter Abfallart.

Optional wählen Sie die Abfallarten, auf die die Szene reagiert; leer passt
jede. Folgende Aktionen können `{{triggerEvent.data.waste_name}}`,
`{{triggerEvent.data.date_text}}`, `{{triggerEvent.data.date}}`,
`{{triggerEvent.data.waste_type}}` und `{{triggerEvent.data.all_waste_names}}`
(alles, was an dem Tag abgeholt wird) verwenden.

Eine Erinnerung wird nie zweimal ausgelöst, auch nicht nach einem Neustart.
Startet Gladys mehr als 3 Stunden nach der Erinnerungszeit, entfällt die
Erinnerung des Tages.

**Aktionen:**

- **Nächste Abholung ermitteln** — einer Abfallart oder beliebig. Ausgaben:
  `found`, `waste_type`, `waste_name`, `date`, `date_text`, `days_until`.
- **Abfuhrkalender aktualisieren** — ruft den Kalender sofort ab. Ausgabe:
  `collections_count`.

## Dashboard

- **Nächste Müllabfuhr** — was als Nächstes abgeholt wird, wann und in wie
  vielen Tagen, mit einer Schaltfläche **Aktualisieren**.
- **Kommende Abholungen** — die Liste der nächsten Abholungen (1 bis 8,
  standardmäßig 5) mit einem Hinweis „Heute / Morgen / In N Tagen".

## Fehlerbehebung

- _„street … not found"_: Schreiben Sie den Straßennamen genau wie in der
  Recycle!-App, mit Akzenten.
- _„returned no collection for this address"_: Prüfen Sie Entsorger,
  Postleitzahl und Hausnummer auf der Website des Entsorgers.
- Logs: Öffnen Sie die Logs der Integration in Gladys (`LOG_LEVEL=debug` für
  mehr Details). Entfernen Sie Ihre Adresse, bevor Sie sie teilen.

Die Daten stammen von den öffentlichen Diensten der Entsorger; die
Integration ist nicht mit ihnen verbunden.
