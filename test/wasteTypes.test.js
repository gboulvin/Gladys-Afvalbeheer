import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fractionId,
  LANGUAGES,
  mapWasteType,
  WASTE_TYPE_KEYS,
  WASTE_TYPES,
  wasteLabel,
} from '../src/wasteTypes.js';

test('Belgian (Recycle!) fraction names map onto canonical types', () => {
  assert.equal(mapWasteType('Déchets résiduels'), 'residual');
  assert.equal(mapWasteType('Ordures ménagères'), 'residual');
  assert.equal(mapWasteType('Déchets organiques'), 'organic');
  assert.equal(mapWasteType('PMC'), 'pmd');
  assert.equal(mapWasteType('Papiers-cartons'), 'paper');
  assert.equal(mapWasteType('Restafval'), 'residual');
  assert.equal(mapWasteType('GFT'), 'organic');
  assert.equal(mapWasteType('Zachte plastics'), 'soft_plastic');
  assert.equal(mapWasteType('Snoeihout'), 'garden');
  assert.equal(mapWasteType('Grof huisvuil'), 'bulky');
  assert.equal(mapWasteType('Verre'), 'glass');
});

test('Dutch provider codes and names map onto canonical types', () => {
  assert.equal(mapWasteType('GREY'), 'residual');
  assert.equal(mapWasteType('GREEN'), 'organic');
  assert.equal(mapWasteType('PACKAGES'), 'pmd');
  assert.equal(mapWasteType('PAPER'), 'paper');
  assert.equal(mapWasteType('BULKYGARDENWASTE'), 'garden');
  assert.equal(mapWasteType('TREE'), 'christmas_tree');
  assert.equal(mapWasteType('Kerstbomen'), 'christmas_tree');
  assert.equal(mapWasteType('KCA'), 'hazardous');
  assert.equal(mapWasteType('Los papier'), 'paper');
  assert.equal(mapWasteType('Plastic, blik & drinkpakken'), 'pmd');
  assert.equal(mapWasteType('Textiel'), 'textile');
  assert.equal(mapWasteType('gft'), 'organic');
});

test('an unknown fraction becomes `other` and keeps its own id and name', () => {
  assert.equal(mapWasteType('Frituurvet'), 'other');
  assert.equal(mapWasteType(''), 'other');
  assert.equal(fractionId('other', 'Frituur vet!'), 'other-frituur-vet');
  assert.equal(fractionId('paper', 'Papier'), 'paper');
  assert.equal(wasteLabel('other', 'Frituurvet', 'fr'), 'Frituurvet');
});

test('every waste type is labelled in every supported language', () => {
  for (const key of WASTE_TYPE_KEYS) {
    for (const lang of LANGUAGES) {
      assert.ok(WASTE_TYPES[key].label[lang], `${key} has no ${lang} label`);
    }
    assert.match(key, /^[a-z_]+$/);
  }
  assert.equal(wasteLabel('paper', 'Papier', 'es'), 'Papel y cartón');
  assert.equal(wasteLabel('paper', 'Papier', 'xx'), 'Paper & cardboard');
});
