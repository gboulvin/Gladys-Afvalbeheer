import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addressKey, configProblem, DEFAULT_CONFIG, normalizeConfig } from '../src/config.js';

test('normalizeConfig returns the defaults when called with no argument', () => {
  assert.deepEqual(normalizeConfig(), DEFAULT_CONFIG);
});

test('normalizeConfig cleans the address and coerces the numbers', () => {
  const config = normalizeConfig({
    collector: 'hvc',
    postcode: ' 1811 jl ',
    house_number: ' 97 ',
    morning_reminder_hour: '6',
    evening_reminder_hour: 40,
    refresh_interval_hours: 'x',
    language: 'xx',
  });
  assert.equal(config.postcode, '1811JL');
  assert.equal(config.house_number, '97');
  assert.equal(config.morning_reminder_hour, 6);
  assert.equal(config.evening_reminder_hour, 23);
  assert.equal(config.refresh_interval_hours, 12);
  assert.equal(config.language, DEFAULT_CONFIG.language);
});

test('configProblem asks for what the chosen collector needs', () => {
  assert.equal(configProblem(normalizeConfig({ collector: 'nope' })).en.includes('Unknown'), true);
  assert.match(configProblem(normalizeConfig({})).en, /postcode/);
  assert.match(configProblem(normalizeConfig({ postcode: '6000' })).en, /house number/);
  assert.match(
    configProblem(normalizeConfig({ postcode: '6000', house_number: '1' })).en,
    /street/,
  );
  assert.match(
    configProblem(
      normalizeConfig({
        collector: 'limburg.net',
        postcode: '3500',
        house_number: '1',
        street_name: 'Grote Markt',
      }),
    ).en,
    /municipality/,
  );
  assert.equal(
    configProblem(normalizeConfig({ collector: 'hvc', postcode: '1811JL', house_number: '97' })),
    null,
  );
});

test('addressKey is stable and safe for an external id', () => {
  const key = addressKey(
    normalizeConfig({
      collector: 'limburg.net',
      postcode: '3500',
      house_number: '12',
      house_number_suffix: 'B 2',
    }),
  );
  assert.equal(key, 'limburg.net-3500-12-b-2');
});
