// -----------------------------------------------------------------------------
// Consistency checks between `gladys-assistant-integration.json` and the code.
// The manifest is validated by the store indexer, but nothing there can know
// which handlers the code registers — these tests keep both in sync.
// -----------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COLLECTORS } from '../src/collectors/index.js';
import { DEFAULT_CONFIG } from '../src/config.js';
import { SCENE_ACTIONS, SCENE_TRIGGER_KEYS } from '../src/scenes.js';
import { WASTE_TYPE_KEYS } from '../src/wasteTypes.js';
import { WIDGET_KEYS } from '../src/widgets.js';

const manifest = JSON.parse(
  await readFile(new URL('../gladys-assistant-integration.json', import.meta.url), 'utf8'),
);
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const indexJs = await readFile(new URL('../index.js', import.meta.url), 'utf8');

// The languages of the Gladys UI: every user-facing text speaks all four.
const UI_LANGUAGES = ['en', 'fr', 'de', 'es'];

const keysOf = (list) => (list ?? []).map((entry) => entry.key);

const allFields = [
  ...manifest.config_schema,
  ...[...manifest.actions, ...manifest.scene_triggers, ...manifest.scene_actions].flatMap(
    (item) => item.fields ?? [],
  ),
  ...manifest.widgets.flatMap((widget) => widget.settings ?? []),
];

// Every multi-language object of the manifest, with its path.
function multiLanguageTexts(node, path = '') {
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => multiLanguageTexts(item, `${path}[${i}]`));
  }
  if (node && typeof node === 'object') {
    if (typeof node.en === 'string') {
      return [[path, node]];
    }
    return Object.entries(node).flatMap(([key, value]) =>
      multiLanguageTexts(value, `${path}.${key}`),
    );
  }
  return [];
}

test('every text of the manifest exists in English, French, German and Spanish', () => {
  const texts = multiLanguageTexts(manifest);
  assert.ok(texts.length > 50);
  for (const [path, text] of texts) {
    for (const lang of UI_LANGUAGES) {
      assert.ok(text[lang], `${path} has no "${lang}" text`);
    }
  }
});

test('the integration is cloud-only, reads the house location, needs Gladys 5.3+', () => {
  assert.deepEqual(manifest.transports, ['cloud']);
  // 5.3.0: catalog keywords and countries (5.2.0 already covers the
  // `source: "houses"` select); getHouses() needs `location: true`.
  assert.match(manifest.gladys_version, /^>=5\.3\.0$/);
  assert.equal(manifest.location, true);
  const house = manifest.config_schema.find((f) => f.key === 'house');
  assert.equal(house.source, 'houses');
  assert.equal(house.options, undefined);
  assert.ok(manifest.name.length >= 3 && manifest.name.length <= 30);
  assert.ok(manifest.categories.length >= 1 && manifest.categories.length <= 3);
});

test('the collector select lists exactly the registered collectors', () => {
  const field = manifest.config_schema.find((f) => f.key === 'collector');
  assert.deepEqual(
    field.options.map((option) => option.value),
    COLLECTORS.map((collector) => collector.key),
  );
});

test('the waste type options list exactly the canonical waste types', () => {
  const selects = allFields.filter((f) => f.key === 'waste_type');
  assert.equal(selects.length, 3);
  for (const field of selects) {
    assert.deepEqual(
      field.options.map((option) => option.value),
      WASTE_TYPE_KEYS,
    );
  }
});

test('the manifest action is registered in index.js', () => {
  for (const key of keysOf(manifest.actions)) {
    assert.ok(indexJs.includes(`onAction('${key}'`), `action "${key}" has no handler`);
  }
});

test('scene actions, scene triggers and widgets match the code, both ways', () => {
  assert.deepEqual(keysOf(manifest.scene_actions).sort(), Object.keys(SCENE_ACTIONS).sort());
  assert.deepEqual(keysOf(manifest.scene_triggers).sort(), [...SCENE_TRIGGER_KEYS].sort());
  assert.deepEqual(keysOf(manifest.widgets).sort(), [...WIDGET_KEYS].sort());
});

test('scene trigger variables are the keys the reminder events carry', () => {
  for (const trigger of manifest.scene_triggers) {
    assert.deepEqual(keysOf(trigger.variables), [
      'waste_type',
      'waste_name',
      'date',
      'date_text',
      'all_waste_names',
    ]);
  }
});

test('config_schema defaults stay consistent with DEFAULT_CONFIG', () => {
  for (const field of manifest.config_schema) {
    if (field.type === 'section') {
      assert.ok(!(field.key in DEFAULT_CONFIG));
      continue;
    }
    assert.ok(field.key in DEFAULT_CONFIG, `"${field.key}" is missing from DEFAULT_CONFIG`);
    if (field.default !== undefined) {
      assert.equal(DEFAULT_CONFIG[field.key], field.default, `default of "${field.key}"`);
    }
  }
});

test('the manifest version is the package version, and the image is tagged with it', () => {
  assert.equal(manifest.version, pkg.version);
  assert.ok(manifest.docker_image.endsWith(`:${manifest.version}`));
});

test('the catalog description holds 10 to 100 characters per language', () => {
  for (const [lang, text] of Object.entries(manifest.description)) {
    assert.ok(text.length >= 10 && text.length <= 100, `description.${lang}: ${text.length}`);
  }
});

test('placeholders are multi-language objects, on text fields only', () => {
  for (const field of allFields.filter((f) => f.placeholder !== undefined)) {
    assert.equal(typeof field.placeholder, 'object', field.key);
    assert.ok(['string', 'number', 'secret'].includes(field.type), field.key);
  }
});

test('section texts stay under 1000 characters and links are https', () => {
  for (const section of manifest.config_schema.filter((f) => f.type === 'section')) {
    for (const text of Object.values(section.description)) {
      assert.ok(text.length <= 1000);
    }
    for (const link of section.links ?? []) {
      assert.match(link.url, /^https:\/\//);
    }
  }
});
