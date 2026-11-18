import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatAmount as corrected} from '../src/vendor/link-cli/fixed.ts';
import {formatAmount as original} from '../src/vendor/link-cli/before.ts';
import {applyMergePatch, brokenSerializer, fixedSerializer} from '../src/patch-lab.ts';
import type {Json} from '../src/patch-lab.ts';

// Replay contract: xorshift32-v1, unsigned seed 0x5345414d. Not cryptographic.
const SEED = 0x5345414d;
function generator(seed = SEED) {
  let state = seed >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
}
const digits = {USD: 2, EUR: 2, JPY: 0, KRW: 0, KWD: 3} as const;
// Reference deliberately does not import displayContract, makeProbes, numeric
// tolerance, Intl or production formatter helpers. Decimal units are exact.
function exactUnits(display: string, currency: keyof typeof digits): bigint {
  const match = display.match(/^(?:[A-Z]{2,3})?\s*([-−])?\s*(?:[$€¥₩]|[A-Z]{2,3})?\s*(\d[\d,]*)(?:\.(\d+))?(?:\s*[A-Z]{3})?$/u);
  assert(match, `Unsupported en-US display syntax: ${JSON.stringify(display)}`);
  const decimals = match[3] ?? '';
  assert(decimals.length <= digits[currency], 'Unexpected fractional precision');
  const magnitude = BigInt(match[2].replaceAll(',', '') + decimals.padEnd(digits[currency], '0'));
  return match[1] ? -magnitude : magnitude;
}
function amountCorpus() {
  const next = generator();
  const values = [0, 1, -1, 99, -99, 100, -100, 999, -999, 1000, -1000, 999999999, -999999999, 1000000000, -1000000000];
  for (let i = 0; i < 1000; i++) values.push((next() % 2000000001) - 1000000000);
  return values;
}
test('bounded exact unit conservation: 5 currencies x 1015 deterministic amounts', () => {
  for (const currency of Object.keys(digits) as (keyof typeof digits)[]) {
    for (const amount of amountCorpus()) {
      assert.equal(exactUnits(corrected(amount, currency), currency), BigInt(amount),
        `seed=${SEED} currency=${currency} amount=${amount}`);
    }
  }
});
test('money reference detects historical scale bug and intentional sign/rounding mutants', () => {
  assert.throws(() => exactUnits(original(1000, 'JPY'), 'JPY'), /fractional precision/);
  assert.notEqual(exactUnits(original(1000, 'KWD'), 'KWD'), 1000n);
  assert.notEqual(exactUnits(corrected(1, 'KWD').replace('0.001', '0.000'), 'KWD'), 1n);
  assert.notEqual(exactUnits(corrected(-101, 'USD').replace('-', ''), 'USD'), -101n);
});

function jsonCorpus() : Json[] {
  const next = generator();
  const atoms: Json[] = [null, false, true, 0, -1, '', 'a', 'ñ', '🧵'];
  function value(depth: number): Json {
    const kind = next() % (depth ? 5 : 3);
    if (kind === 0) return atoms[next() % atoms.length];
    if (kind === 1) return (next() % 2001) - 1000;
    if (kind === 2) return `note-${next() % 100}`;
    if (kind === 3) return Array.from({length: next() % 4}, () => value(depth - 1));
    return Object.fromEntries(Array.from({length: next() % 4}, (_, i) => [`k${i}`, value(depth - 1)]));
  }
  return [...atoms, [], {}, [0, false, ''], ...Array.from({length: 500}, () => value(3))];
}
test('bounded RFC7396 metamorphic laws, without production equality normalization', () => {
  const values = jsonCorpus();
  for (let index = 0; index < values.length; index++) {
    const target = values[index], patch = values[(index * 17 + 1) % values.length];
    const snapshots = structuredClone([target, patch]);
    const once = applyMergePatch(target, patch);
    assert.deepEqual(applyMergePatch(once, patch), once, `idempotence seed=${SEED} index=${index}`);
    // Empty object identity applies ONLY to object targets, never scalar/array.
    const object = {keep: target, other: 'unchanged'};
    assert.deepEqual(applyMergePatch(object, {}), object);
    assert.deepEqual(applyMergePatch(object, {other: null}), {keep: target});
    assert.deepEqual(applyMergePatch(object, {other: false}), {keep: target, other: false});
    assert.deepEqual(applyMergePatch(object, {other: 0}), {keep: target, other: 0});
    assert.deepEqual(applyMergePatch(object, {other: ''}), {keep: target, other: ''});
    assert.deepEqual(applyMergePatch(object, {keep: [patch]}), {keep: [patch], other: 'unchanged'});
    if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) assert.deepEqual(once, patch);
    assert.deepEqual([target, patch], snapshots, 'receiver must not mutate inputs');
  }
});
test('generated named-field serializer omission/clear/set uses independently authored expected states', () => {
  for (const previous of jsonCorpus()) {
    const target = {orderId: 'synthetic', deliveryNote: previous};
    assert.deepEqual(applyMergePatch(target, JSON.parse(fixedSerializer({}))), target);
    assert.deepEqual(applyMergePatch(target, JSON.parse(fixedSerializer({deliveryNote: null}))), {orderId: 'synthetic'});
    // Restrict assignment law to scalars/arrays: object patches recursively merge.
    for (const next of [false, 0, '', 'new', [0, false]] as Json[]) {
      assert.deepEqual(applyMergePatch(target, JSON.parse(fixedSerializer({deliveryNote: next}))), {...target, deliveryNote: next});
    }
  }
});
test('patch law negative controls detect omission-to-null and falsey-erasure mutants', () => {
  const target = {deliveryNote: 'keep', orderId: 'synthetic'};
  assert.notDeepEqual(applyMergePatch(target, JSON.parse(brokenSerializer({}))), target);
  const falseyMutant = (patch: Record<string, Json>) => JSON.stringify({deliveryNote: patch.deliveryNote || null});
  for (const next of [false, 0, '']) {
    assert.notDeepEqual(applyMergePatch(target, JSON.parse(falseyMutant({deliveryNote: next}))), {...target, deliveryNote: next});
  }
});
test('generator seed reproducibly regenerates the same ordered finite corpus', () => {
  assert.deepEqual(amountCorpus(), amountCorpus());
  assert.deepEqual(jsonCorpus(), jsonCorpus());
  const next = generator();
  assert.deepEqual([next(), next(), next()], [2533295003, 2802271101, 2725273065]);
});
