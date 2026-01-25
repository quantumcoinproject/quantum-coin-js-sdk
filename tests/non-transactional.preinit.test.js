const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

// Non-transactional, pre-initialize negative coverage.
// This file intentionally does NOT call `initialize()`.

const qcsdk = require('..');

describe('non-transactional (pre-init)', () => {
  test('core APIs return -1000 before initialize (where applicable)', async () => {
    const anyValidAddress =
      '0x6f605c4142f1cb037f967101a5b28ccd00b27cce4516190356baaf284d20e667';
    const anyTxHash =
      '0xe6fbabc178adaaab6b9dbda086de53deaced1d6fe40e7db9539fe9e85695d1be';

    assert.equal(qcsdk.isAddressValid(anyValidAddress), -1000);
    assert.equal(qcsdk.addressFromPublicKey([1, 2, 3]), -1000);
    assert.equal(qcsdk.publicKeyFromPrivateKey([1, 2, 3]), -1000);
    assert.equal(qcsdk.publicKeyFromSignature(new Array(32).fill(1), [1, 2, 3]), -1000);
    assert.equal(qcsdk.combinePublicKeySignature([1], [2]), -1000);
    assert.equal(qcsdk.verifyWallet({ address: '0x0', privateKey: [], publicKey: [] }), -1000);
    assert.equal(qcsdk.signRawTransaction({}), -1000);

    assert.equal(await qcsdk.getLatestBlockDetails(), -1000);
    assert.equal(await qcsdk.getAccountDetails(anyValidAddress), -1000);
    assert.equal(await qcsdk.listAccountTransactions(anyValidAddress, 0), -1000);
    assert.equal(await qcsdk.getTransactionDetails(anyTxHash), -1000);
    assert.equal(await qcsdk.postTransaction('0x00'), -1000);
  });

  test('RLP helpers return an explicit error before initialize', () => {
    const enc = qcsdk.encodeRlp('hello');
    assert.ok(enc);
    assert.notEqual(enc.error, '');

    const dec = qcsdk.decodeRlp('0x00');
    assert.ok(dec);
    assert.notEqual(dec.error, '');
  });
});

