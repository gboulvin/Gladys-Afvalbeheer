// -----------------------------------------------------------------------------
// Waste types.
//
// Every provider names its fractions its own way ('Restafval', 'GREY',
// 'Ordures ménagères', 'Déchets résiduels'...). They are mapped onto a small
// canonical list, the keys scenes and devices store: KEYS ARE FOREVER (a
// renamed key orphans the devices and breaks the scene filters using it).
// A fraction that matches nothing becomes `other`, and keeps its own name.
// -----------------------------------------------------------------------------

export const LANGUAGES = ['en', 'fr', 'de', 'es', 'nl'];
export const DEFAULT_LANGUAGE = 'en';

export const OTHER = 'other';

// Canonical types, with their label in every supported language and the
// Feather icon used by the widgets.
export const WASTE_TYPES = {
  residual: {
    icon: 'trash-2',
    label: {
      en: 'Residual waste',
      fr: 'Ordures ménagères',
      de: 'Restmüll',
      es: 'Residuos generales',
      nl: 'Restafval',
    },
  },
  organic: {
    icon: 'feather',
    label: {
      en: 'Organic waste',
      fr: 'Déchets organiques',
      de: 'Biomüll',
      es: 'Residuos orgánicos',
      nl: 'GFT',
    },
  },
  pmd: {
    icon: 'package',
    label: {
      en: 'Plastic & cans (PMD)',
      fr: 'PMC / emballages',
      de: 'Verpackungen',
      es: 'Envases (PMD)',
      nl: 'PMD',
    },
  },
  paper: {
    icon: 'file-text',
    label: {
      en: 'Paper & cardboard',
      fr: 'Papiers-cartons',
      de: 'Papier & Pappe',
      es: 'Papel y cartón',
      nl: 'Papier',
    },
  },
  glass: {
    icon: 'droplet',
    label: { en: 'Glass', fr: 'Verre', de: 'Glas', es: 'Vidrio', nl: 'Glas' },
  },
  textile: {
    icon: 'shopping-bag',
    label: { en: 'Textile', fr: 'Textile', de: 'Textilien', es: 'Textil', nl: 'Textiel' },
  },
  garden: {
    icon: 'scissors',
    label: {
      en: 'Garden waste',
      fr: 'Déchets verts',
      de: 'Grünschnitt',
      es: 'Restos de jardín',
      nl: 'Snoeiafval',
    },
  },
  bulky: {
    icon: 'box',
    label: {
      en: 'Bulky waste',
      fr: 'Encombrants',
      de: 'Sperrmüll',
      es: 'Voluminosos',
      nl: 'Grofvuil',
    },
  },
  hazardous: {
    icon: 'alert-triangle',
    label: {
      en: 'Hazardous waste',
      fr: 'Déchets dangereux',
      de: 'Sondermüll',
      es: 'Residuos peligrosos',
      nl: 'KCA / chemisch',
    },
  },
  christmas_tree: {
    icon: 'gift',
    label: {
      en: 'Christmas trees',
      fr: 'Sapins de Noël',
      de: 'Weihnachtsbäume',
      es: 'Árboles de Navidad',
      nl: 'Kerstbomen',
    },
  },
  soft_plastic: {
    icon: 'layers',
    label: {
      en: 'Soft plastics',
      fr: 'Plastiques souples',
      de: 'Weichplastik',
      es: 'Plásticos blandos',
      nl: 'Zachte plastics',
    },
  },
  [OTHER]: {
    icon: 'calendar',
    label: { en: 'Other', fr: 'Autre', de: 'Sonstiges', es: 'Otros', nl: 'Overig' },
  },
};

export const WASTE_TYPE_KEYS = Object.keys(WASTE_TYPES);

// Provider codes matched as a whole (Ximmio, Afvalwijzer, Circulus, RD4...):
// too short or too generic to be searched inside a longer name.
const EXACT_CODES = {
  grey: 'residual',
  rest: 'residual',
  remainder: 'residual',
  greengrey: 'residual',
  bulkyrestwaste: 'residual',
  zrest: 'residual',
  omb: 'residual',
  green: 'organic',
  gft: 'organic',
  zgft: 'organic',
  pd: 'pmd',
  pmd: 'pmd',
  pbd: 'pmd',
  pmdrest: 'pmd',
  plastic: 'pmd',
  packages: 'pmd',
  paper: 'paper',
  papier: 'paper',
  glass: 'glass',
  glas: 'glass',
  textile: 'textile',
  textiel: 'textile',
  branches: 'garden',
  bulkygardenwaste: 'garden',
  bulklitter: 'bulky',
  kca: 'hazardous',
  tree: 'christmas_tree',
  best_bag: 'other',
};

// Keywords searched inside the (lower-cased, accent-free) name, IN ORDER:
// the first type whose keyword appears wins, so the specific names come
// before the generic ones ('zachte plastics' before 'plastic', 'grof tuin'
// before 'grof', 'déchets organiques' before 'déchets').
const KEYWORDS = [
  ['christmas_tree', ['kerstb', 'sapin', 'christmas', 'weihnacht']],
  ['soft_plastic', ['zachte plastic', 'roze zak', 'film', 'plastiques souples', 'soft plastic']],
  ['hazardous', ['kca', 'chemisch', 'gevaarlijk', 'dangereux', 'hazardous', 'klein chemisch']],
  [
    'garden',
    [
      'snoei',
      'tuin',
      'takken',
      'branche',
      'dechets verts',
      'groenafval',
      'bulkygarden',
      'garden',
      'jardin',
    ],
  ],
  ['bulky', ['grofvuil', 'grof', 'groot huisvuil', 'encombrant', 'bulky', 'sloop', 'volumineux']],
  ['textile', ['textiel', 'textile', 'kleding', 'vetement']],
  ['glass', ['glas', 'verre', 'glass']],
  ['pmd', ['pmd', 'pmc', 'pbd', 'plastic', 'plastique', 'package', 'verpakking', 'emballage']],
  ['paper', ['papier', 'paper', 'carton', 'karton']],
  [
    'organic',
    [
      'gft',
      'groente',
      'organi',
      'green',
      'biodechet',
      'dechets de cuisine',
      'etensresten',
      'groene container',
      'keukenafval',
      'compost',
    ],
  ],
  [
    'residual',
    [
      'rest',
      'huisvuil',
      'menager',
      'residu',
      'grey',
      'grijs',
      'grijze',
      'sortibak',
      'duobak',
      'tout-venant',
    ],
  ],
];

/** Lower-case, accent-free, single-spaced. */
export function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Map a provider fraction name onto a canonical waste type key. */
export function mapWasteType(name) {
  const normalized = normalizeName(name);
  if (!normalized) {
    return OTHER;
  }
  if (EXACT_CODES[normalized.replace(/[\s-]/g, '')] !== undefined) {
    return EXACT_CODES[normalized.replace(/[\s-]/g, '')];
  }
  for (const [type, keywords] of KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return type;
    }
  }
  return OTHER;
}

/**
 * Stable identifier of a fraction at an address: the canonical type, or for
 * an unmapped fraction `other-<slug of its name>` (two unknown fractions stay
 * two devices).
 */
export function fractionId(type, name) {
  if (type !== OTHER) {
    return type;
  }
  const slug = normalizeName(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${OTHER}-${slug || 'unknown'}`;
}

/** Pick a language from a multi-language object, English as fallback. */
export function pick(text, language) {
  if (typeof text === 'string') {
    return text;
  }
  return text?.[language] ?? text?.[DEFAULT_LANGUAGE] ?? '';
}

/**
 * Display name of a collection in a language: the canonical label, or the
 * provider's own name for an unmapped fraction.
 */
export function wasteLabel(type, name, language) {
  if (type === OTHER && name) {
    return name;
  }
  return pick((WASTE_TYPES[type] ?? WASTE_TYPES[OTHER]).label, language);
}

/** The label of a waste type in every language (manifest-style object). */
export function wasteLabels(type, name) {
  return Object.fromEntries(LANGUAGES.map((lang) => [lang, wasteLabel(type, name, lang)]));
}
