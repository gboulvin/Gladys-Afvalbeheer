// -----------------------------------------------------------------------------
// Collector registry: every waste collector the user can pick in the
// configuration, with its country, the area it serves and the address fields
// it needs. The `key` is the stored config value: KEYS ARE FOREVER.
//
// The manifest `collector` select lists the same keys (test/manifest.test.js
// keeps both in sync).
// -----------------------------------------------------------------------------

import { burgerportaal } from './burgerportaal.js';
import { limburgNet } from './limburgnet.js';
import { afvalwijzer, circulus, drimmelen, irado, klikogroep, rd4, reinis, rova } from './misc.js';
import { opzet } from './opzet.js';
import { recycleApp } from './recycleapp.js';
import { ximmio } from './ximmio.js';

export const ADDRESS_FIELDS = {
  STREET_NAME: 'street_name',
  CITY_NAME: 'city_name',
};

const entry = (key, label, country, area, driver, requires = []) => ({
  key,
  label,
  country,
  area,
  driver,
  requires,
});

export const COLLECTORS = [
  // --- Belgium -----------------------------------------------------------------
  entry(
    'recycleapp',
    'Recycle! (Fost Plus) — Belgique / België',
    'BE',
    'All of Belgium: Wallonia (Tibi, Ipalle, Intradel, BEP, Hygea, inBW, IDELUX, ICDI...), Flanders, Brussels',
    recycleApp,
    [ADDRESS_FIELDS.STREET_NAME],
  ),
  entry(
    'limburg.net',
    'Limburg.net',
    'BE',
    'Province of Limburg (Hasselt, Genk, Sint-Truiden, Tongeren...)',
    limburgNet,
    [ADDRESS_FIELDS.STREET_NAME, ADDRESS_FIELDS.CITY_NAME],
  ),
  // --- Netherlands: Mijn Afvalwijzer -------------------------------------------
  entry(
    'mijnafvalwijzer',
    'Mijn Afvalwijzer',
    'NL',
    '~100 municipalities using mijnafvalwijzer.nl',
    afvalwijzer,
  ),
  // --- Netherlands: Ximmio -------------------------------------------------------
  entry('acv', 'ACV', 'NL', 'Ede, Renkum, Wageningen, Veenendaal', ximmio('acv')),
  entry('almere', 'Almere', 'NL', 'Almere', ximmio('almere')),
  entry(
    'areareiniging',
    'Area Reiniging',
    'NL',
    'Emmen, Coevorden, Borger-Odoorn',
    ximmio('areareiniging'),
  ),
  entry('avalex', 'Avalex', 'NL', 'Delft, Rijswijk, Leidschendam-Voorburg...', ximmio('avalex')),
  entry('avri', 'Avri', 'NL', 'Rivierenland (Tiel, Culemborg...)', ximmio('avri')),
  entry('blink', 'Blink', 'NL', 'Helmond, Deurne, Gemert-Bakel...', ximmio('blink')),
  entry('hellendoorn', 'Hellendoorn', 'NL', 'Hellendoorn', ximmio('hellendoorn')),
  entry(
    'meerlanden',
    'Meerlanden',
    'NL',
    'Haarlemmermeer, Aalsmeer, Heemstede...',
    ximmio('meerlanden'),
  ),
  entry('oostzaan', 'Oostzaan', 'NL', 'Oostzaan', ximmio('oostzaan')),
  entry('rad', 'RAD Hoeksche Waard', 'NL', 'Hoeksche Waard', ximmio('rad')),
  entry(
    'twentemilieu',
    'Twente Milieu',
    'NL',
    'Enschede, Hengelo, Almelo...',
    ximmio('twentemilieu'),
  ),
  entry('venlo', 'Venlo', 'NL', 'Venlo', ximmio('venlo')),
  entry(
    'waardlanden',
    'Waardlanden',
    'NL',
    'Gorinchem, Molenlanden, Vijfheerenlanden',
    ximmio('waardlanden'),
  ),
  entry('westland', 'Westland', 'NL', 'Westland', ximmio('westland')),
  entry('woerden', 'Woerden', 'NL', 'Woerden', ximmio('woerden')),
  // --- Netherlands: Burgerportaal --------------------------------------------
  entry('assen', 'Assen', 'NL', 'Assen', burgerportaal('assen')),
  entry(
    'bar',
    'BAR-Afvalbeheer',
    'NL',
    'Barendrecht, Albrandswaard, Ridderkerk',
    burgerportaal('bar'),
  ),
  entry('breda', 'Breda', 'NL', 'Breda', burgerportaal('breda')),
  entry('groningen', 'Groningen', 'NL', 'Groningen', burgerportaal('groningen')),
  entry('nijkerk', 'Nijkerk', 'NL', 'Nijkerk', burgerportaal('nijkerk')),
  entry(
    'rmn',
    'RMN (Midden-Nederland)',
    'NL',
    'Midden-Nederland (Baarn, Soest, Zeist...)',
    burgerportaal('rmn'),
  ),
  entry('tilburg', 'Tilburg', 'NL', 'Tilburg', burgerportaal('tilburg')),
  // --- Netherlands: Opzet -----------------------------------------------------
  entry(
    'afval3xbeter',
    'Afval3xBeter',
    'NL',
    'Municipalities using afval3xbeter.nl',
    opzet('afval3xbeter'),
  ),
  entry(
    'afvalstoffendienstkalender',
    'Afvalstoffendienst',
    'NL',
    "'s-Hertogenbosch, Heusden, Vught",
    opzet('afvalstoffendienstkalender'),
  ),
  entry(
    'alphenaandenrijn',
    'Alphen aan den Rijn',
    'NL',
    'Alphen aan den Rijn',
    opzet('alphenaandenrijn'),
  ),
  entry('berkelland', 'Berkelland', 'NL', 'Berkelland', opzet('berkelland')),
  entry('cranendonck', 'Cranendonck', 'NL', 'Cranendonck', opzet('cranendonck')),
  entry('cyclus', 'Cyclus', 'NL', 'Gouda region, Montfoort, Uithoorn...', opzet('cyclus')),
  entry('dar', 'Dar', 'NL', 'Nijmegen, Berg en Dal, Beuningen...', opzet('dar')),
  entry('defryskemarren', 'De Fryske Marren', 'NL', 'De Fryske Marren', opzet('defryskemarren')),
  entry('denhaag', 'Den Haag', 'NL', 'Den Haag', opzet('denhaag')),
  entry('gad', 'GAD', 'NL', 'Gooi en Vechtstreek (Hilversum, Huizen...)', opzet('gad')),
  entry('hvc', 'HVC', 'NL', 'Alkmaar, Dordrecht, Flevoland, Noord-Holland...', opzet('hvc')),
  entry('lingewaard', 'Lingewaard', 'NL', 'Lingewaard', opzet('lingewaard')),
  entry(
    'middelburg-vlissingen',
    'Middelburg-Vlissingen',
    'NL',
    'Middelburg, Vlissingen',
    opzet('middelburg-vlissingen'),
  ),
  entry(
    'mijnafvalzaken',
    'Mijn Afvalzaken',
    'NL',
    'Municipalities using mijnafvalzaken.nl',
    opzet('mijnafvalzaken'),
  ),
  entry(
    'offalkalinder',
    'Ôffalkalinder',
    'NL',
    'Frisian municipalities using offalkalinder.nl',
    opzet('offalkalinder'),
  ),
  entry('peelenmaas', 'Peel en Maas', 'NL', 'Peel en Maas', opzet('peelenmaas')),
  entry('prezero', 'PreZero', 'NL', 'PreZero (ex-Suez) municipalities', opzet('prezero')),
  entry('purmerend', 'Purmerend', 'NL', 'Purmerend', opzet('purmerend')),
  entry('rwm', 'RWM', 'NL', 'Roerdalen, Roermond, Maasgouw...', opzet('rwm')),
  entry('saver', 'Saver', 'NL', 'Roosendaal, Bergen op Zoom, Woensdrecht...', opzet('saver')),
  entry(
    'schouwen-duiveland',
    'Schouwen-Duiveland',
    'NL',
    'Schouwen-Duiveland',
    opzet('schouwen-duiveland'),
  ),
  entry('sliedrecht', 'Sliedrecht', 'NL', 'Sliedrecht', opzet('sliedrecht')),
  entry('spaarnelanden', 'Spaarnelanden', 'NL', 'Haarlem, Zandvoort', opzet('spaarnelanden')),
  entry('sudwestfryslan', 'Súdwest-Fryslân', 'NL', 'Súdwest-Fryslân', opzet('sudwestfryslan')),
  entry('venray', 'Venray', 'NL', 'Venray', opzet('venray')),
  entry('voorschoten', 'Voorschoten', 'NL', 'Voorschoten', opzet('voorschoten')),
  entry('waalre', 'Waalre', 'NL', 'Waalre', opzet('waalre')),
  entry('zrd', 'ZRD', 'NL', 'Zeeland municipalities using zrd.nl', opzet('zrd')),
  // --- Netherlands: other platforms ---------------------------------------------
  entry('circulus', 'Circulus', 'NL', 'Apeldoorn, Deventer, Zutphen, Epe...', circulus),
  entry('drimmelen', 'Drimmelen', 'NL', 'Drimmelen', drimmelen),
  entry('irado', 'Irado', 'NL', 'Schiedam, Vlaardingen, Capelle aan den IJssel', irado),
  entry('maassluis', 'Maassluis', 'NL', 'Maassluis', klikogroep('maassluis')),
  entry(
    'oudeijsselstreek',
    'Oude IJsselstreek',
    'NL',
    'Oude IJsselstreek',
    klikogroep('oudeijsselstreek'),
  ),
  entry('rd4', 'RD4', 'NL', 'Parkstad Limburg (Heerlen, Kerkrade, Landgraaf...)', rd4),
  entry('reinis', 'Reinis', 'NL', 'Municipalities using reinis.nl', reinis),
  entry('rova', 'ROVA', 'NL', 'Zwolle, Amersfoort, Kampen...', rova),
];

const BY_KEY = new Map(COLLECTORS.map((collector) => [collector.key, collector]));

export function findCollector(key) {
  return BY_KEY.get(key);
}
