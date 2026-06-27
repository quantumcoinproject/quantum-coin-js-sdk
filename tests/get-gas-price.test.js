/**
 * Tests for getGasPrice(keyType, fullSign).
 * Verifies per-gas-unit price (in wei) for each signing context implied by keyType/fullSign,
 * mirroring the dynamic-fee pricing in quantum-coin-go core/types/dynamic_fee_tx.go.
 */
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const qcsdk = require('..');

// Base dynamic-fee price = DEFAULT_PRICE (47619047619047600) / 10
const BASE = '4761904761904760';      // context 0 (x1)
const LEVEL1 = '95238095238095200';   // context 1 (x20)
const LEVEL2 = '142857142857142800';  // context 2 (x30)

describe('getGasPrice', () => {
  test('keyType 3, fullSign false -> base price (context 0)', () => {
    const result = qcsdk.getGasPrice(3, false);
    assert.equal(result.resultCode, 0);
    assert.equal(result.gasPrice, BASE);
  });

  test('keyType 3, fullSign true -> level2 price (context 2)', () => {
    const result = qcsdk.getGasPrice(3, true);
    assert.equal(result.resultCode, 0);
    assert.equal(result.gasPrice, LEVEL2);
  });

  test('keyType 5, fullSign false -> level1 price (context 1)', () => {
    const result = qcsdk.getGasPrice(5, false);
    assert.equal(result.resultCode, 0);
    assert.equal(result.gasPrice, LEVEL1);
  });

  test('keyType 5, fullSign true -> ignored, same as keyType 5 false', () => {
    const withFull = qcsdk.getGasPrice(5, true);
    assert.equal(withFull.resultCode, 0);
    assert.equal(withFull.gasPrice, LEVEL1);
    assert.equal(withFull.gasPrice, qcsdk.getGasPrice(5, false).gasPrice);
  });

  test('keyType 3 with omitted fullSign -> defaults to false (base price)', () => {
    const omitted = qcsdk.getGasPrice(3);
    assert.equal(omitted.resultCode, 0);
    assert.equal(omitted.gasPrice, BASE);

    const nullFull = qcsdk.getGasPrice(3, null);
    assert.equal(nullFull.resultCode, 0);
    assert.equal(nullFull.gasPrice, BASE);
  });

  test('invalid keyType -> negative resultCode and null gasPrice', () => {
    for (const invalid of [4, 0, null, undefined]) {
      const result = qcsdk.getGasPrice(invalid, false);
      assert.ok(result.resultCode < 0, `expected negative resultCode for keyType ${invalid}`);
      assert.equal(result.gasPrice, null);
    }
  });
});
