# Afvalbeheer – Recogida de residuos

Sepa cuándo se recogen sus contenedores, directamente en Gladys: la
integración lee el calendario de recogida de su dirección en el servicio
público de su recolector y le ofrece dispositivos, disparadores y acciones de
escena, y widgets para el panel.

## ¿Dónde funciona?

Solo en **Bélgica** y en los **Países Bajos**, para los recolectores de la
lista. Usa únicamente internet (nube): el calendario se lee en la API del sitio
web o de la aplicación del recolector. No se necesita cuenta.

### Bélgica

| Recolector               | Zona                                                                                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recycle!** (Fost Plus) | Toda Bélgica cubierta por la aplicación Recycle!: **Valonia** (Tibi – región de Charleroi, Ipalle – Wallonie picarde, Intradel – Lieja, BEP – Namur, Hygea – Mons, inBW – Brabante Valón, IDELUX – Luxemburgo, ICDI...), **Flandes** y **Bruselas** |
| **Limburg.net**          | Provincia de Limburgo (Hasselt, Genk, Sint-Truiden, Tongeren...)                                                                                                                                                                                    |

### Países Bajos

| Recolector             | Zona                                               |
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

¿Su recolector no aparece? Abra una issue en el
[repositorio de GitHub](https://github.com/gboulvin/Gladys-Afvalbeheer/issues).

## Configuración

1. Abra la pestaña **Configuración** de la integración.
2. Elija su **recolector de residuos**. En Bélgica es **Recycle!** casi en
   todas partes (**Limburg.net** en la provincia de Limburgo).
3. Elija su **casa**: su dirección se obtiene de su ubicación en el mapa
   (ajustes de Gladys → Casas) mediante OpenStreetMap. Es todo lo que necesita
   la mayoría de los usuarios.
4. Los campos de **dirección** son opcionales: déjelos vacíos para usar la
   dirección de la casa, o rellene solo lo que haya que corregir —
   normalmente el **número** (y su **complemento**, p. ej. `A`) si la casa
   está situada en la del vecino, o el **nombre de la calle** si no está
   escrito como en la aplicación Recycle!. Sin casa, introduzca el código
   postal y el número (y el nombre de la calle para Recycle! y Limburg.net, y
   el municipio para Limburg.net).
5. Elija el **idioma** de los nombres de dispositivos y textos de escena
   (inglés, francés, alemán, español o neerlandés) y las **horas** de los
   recordatorios de la tarde y de la mañana (19:00 y 07:00 por defecto).
6. Guarde y pulse **Leer el calendario ahora**: el mensaje bajo el botón
   indica cuántas recogidas se encontraron y cuál es la próxima.
7. Abra la pestaña **Descubrimiento** y añada los dispositivos que quiera: uno
   por tipo de residuo recogido en su dirección.

El calendario se vuelve a leer cada 12 horas (configurable). Si no se puede
contactar con el recolector, se sigue usando el último calendario conocido, el
estado de conexión lo indica y la integración lo reintenta 15 minutos después.

## Dispositivos

Un dispositivo por tipo de residuo («Recogida – Papel y cartón»...), con dos
funciones:

- **Días hasta la recogida** — `0` el día de la recogida, `1` la víspera…
- **Próxima recogida** — la fecha escrita («viernes, 16 de octubre»).

Tipos de residuos: residuos generales, orgánicos, envases, papel y cartón,
vidrio, textil, restos de jardín, voluminosos, peligrosos, árboles de Navidad,
plásticos blandos; una fracción desconocida conserva su propio nombre.

## Escenas

**Disparadores** (Gladys 5.3 o posterior, categoría **Integraciones**):

- **Recogida de residuos mañana** — se activa a la hora del recordatorio de
  la tarde, una vez por cada tipo de residuo recogido al día siguiente.
- **Recogida de residuos hoy** — se activa a la hora del recordatorio de la
  mañana, una vez por cada tipo de residuo recogido ese día.

Puede elegir los tipos de residuos a los que reacciona la escena; vacío,
sirve cualquiera. Las acciones siguientes pueden usar
`{{triggerEvent.data.waste_name}}`, `{{triggerEvent.data.date_text}}`,
`{{triggerEvent.data.date}}`, `{{triggerEvent.data.waste_type}}` y
`{{triggerEvent.data.all_waste_names}}` (todo lo que se recoge ese día).

Un recordatorio nunca se envía dos veces, ni siquiera tras un reinicio. Si
Gladys arranca más de 3 horas después de la hora del recordatorio, se omite
el del día.

**Acciones:**

- **Obtener la próxima recogida** — de un tipo de residuo o de cualquiera.
  Salidas: `found`, `waste_type`, `waste_name`, `date`, `date_text`,
  `days_until`.
- **Actualizar el calendario de recogidas** — lee el calendario ahora.
  Salida: `collections_count`.

## Panel

- **Próxima recogida** — qué se recoge después, cuándo y en cuántos días, con
  un botón **Actualizar**.
- **Próximas recogidas** — la lista de las próximas recogidas (de 1 a 8, 5
  por defecto) con una etiqueta «Hoy / Mañana / En N días».

## Solución de problemas

- _«street … not found»_: escriba el nombre de la calle exactamente como lo
  muestra la aplicación Recycle!, con sus acentos.
- _«returned no collection for this address»_: compruebe el recolector, el
  código postal y el número en el sitio web del recolector.
- Registros: abra los registros de la integración en Gladys
  (`LOG_LEVEL=debug` para más detalle). Elimine su dirección antes de
  compartirlos.

Los datos proceden de los servicios públicos de los recolectores; la
integración no está afiliada a ellos.
