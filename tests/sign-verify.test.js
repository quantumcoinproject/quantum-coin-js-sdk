/**
 * Tests for sign(privateKey, message) and verify(publicKey, signature, message).
 * Covers all 3 key types: default (null → type 3), 3, and 5.
 */
const { describe, test, before } = require('node:test');
const assert = require('node:assert/strict');

const qcsdk = require('..');

const MAINNET_CHAIN_ID = 123123;
const READ_RELAY_URL = 'https://sdk.readrelay.quantumcoinapi.com';
const WRITE_RELAY_URL = 'https://sdk.writerelay.quantumcoinapi.com';

// 32-byte message (CIRCL expects fixed length where applicable)
const MESSAGE_32 = new Uint8Array(32);
for (let i = 0; i < 32; i++) MESSAGE_32[i] = (i + 1) & 0xff;

function isCirclAvailable() {
  const w = qcsdk.newWallet();
  return (
    typeof w === 'object' &&
    w != null &&
    w.privateKey != null &&
    w.address != null &&
    qcsdk.verifyWallet(w) === true
  );
}

function toByteArray(buf) {
  return buf instanceof Uint8Array ? Array.from(buf) : buf;
}

describe('sign and verify', () => {
  before(async () => {
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const initResult = await qcsdk.initialize(cfg);
    assert.equal(initResult, true, 'SDK initialize should succeed');
  });

  test('CIRCL is available', () => {
    assert.ok(isCirclAvailable(), 'CIRCL must be loaded and verifyWallet(newWallet()) must pass');
  });

  test('keyType default (null): sign then verify with wallet bytes', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(null);
    assert.ok(wallet && typeof wallet === 'object');
    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    const message = toByteArray(MESSAGE_32);

    const signResult = qcsdk.sign(privateKey, message);
    assert.equal(signResult.resultCode, 0, `sign failed: resultCode ${signResult.resultCode}`);
    assert.ok(signResult.signature != null && signResult.signature.length > 0);

    const verifyResult = qcsdk.verify(publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0, `verify failed: resultCode ${verifyResult.resultCode}`);
    assert.equal(verifyResult.valid, true);
  });

  test('keyType 3: sign then verify with wallet bytes', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(3);
    assert.ok(wallet && typeof wallet === 'object');
    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    const message = toByteArray(MESSAGE_32);

    const signResult = qcsdk.sign(privateKey, message);
    assert.equal(signResult.resultCode, 0, `sign failed: resultCode ${signResult.resultCode}`);
    assert.ok(signResult.signature != null && signResult.signature.length > 0);

    const verifyResult = qcsdk.verify(publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0, `verify failed: resultCode ${verifyResult.resultCode}`);
    assert.equal(verifyResult.valid, true);
  });

  test('keyType 5: sign then verify with wallet bytes', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(5);
    assert.ok(wallet && typeof wallet === 'object');
    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    const message = toByteArray(MESSAGE_32);

    const signResult = qcsdk.sign(privateKey, message);
    assert.equal(signResult.resultCode, 0, `sign failed: resultCode ${signResult.resultCode}`);
    assert.ok(signResult.signature != null && signResult.signature.length > 0);

    const verifyResult = qcsdk.verify(publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0, `verify failed: resultCode ${verifyResult.resultCode}`);
    assert.equal(verifyResult.valid, true);
  });

  test('verify with wrong message returns valid: false', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(null);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message);
    assert.equal(signResult.resultCode, 0);

    const wrongMessage = new Uint8Array(32);
    wrongMessage[0] = 0xff;
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, wrongMessage);
    assert.equal(verifyResult.valid, false, 'valid must be false for wrong message');
    // resultCode may be -717 (CIRCL error) or -719 (signature invalid)
    assert.ok(verifyResult.resultCode === -717 || verifyResult.resultCode === -719);
  });

  test('sign with invalid privateKey returns error code', () => {
    const result = qcsdk.sign(null, MESSAGE_32);
    assert.notEqual(result.resultCode, 0);
    assert.equal(result.signature, null);
  });

  test('verify with invalid publicKey returns error code', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(null);
    const signResult = qcsdk.sign(wallet.privateKey, toByteArray(MESSAGE_32));
    assert.equal(signResult.resultCode, 0);

    const result = qcsdk.verify(null, signResult.signature, toByteArray(MESSAGE_32));
    assert.notEqual(result.resultCode, 0);
    assert.equal(result.valid, false);
  });

  test('sign with explicit signingContext 0 (keyType 3 wallet) then verify', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(3);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 0);
    assert.equal(signResult.resultCode, 0, `sign failed: ${signResult.resultCode}`);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('sign with explicit signingContext 1 (keyType 5 wallet) then verify', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(5);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 1);
    assert.equal(signResult.resultCode, 0, `sign failed: ${signResult.resultCode}`);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('sign with explicit signingContext 2 (keyType 3 wallet) then verify', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(3);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 2);
    assert.equal(signResult.resultCode, 0, `sign failed: ${signResult.resultCode}`);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('sign with invalid signingContext returns error code', () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(3);
    const result = qcsdk.sign(wallet.privateKey, toByteArray(MESSAGE_32), 99);
    assert.notEqual(result.resultCode, 0);
    assert.equal(result.signature, null);
  });
});

describe('verify by signature first byte (types 3, 4, 5)', () => {
  test('verify type 3 (signCompact): sign(..., 0) then verify', () => {
    const wallet = qcsdk.newWallet(3);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 0);
    assert.equal(signResult.resultCode, 0);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('verify type 4 (hybrid full): sign(..., 2) then verify', () => {
    const wallet = qcsdk.newWallet(3);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 2);
    assert.equal(signResult.resultCode, 0);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('verify type 5 (hybrid5): sign(..., 1) then verify', () => {
    const wallet = qcsdk.newWallet(5);
    const message = toByteArray(MESSAGE_32);
    const signResult = qcsdk.sign(wallet.privateKey, message, 1);
    assert.equal(signResult.resultCode, 0);
    const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, message);
    assert.equal(verifyResult.resultCode, 0);
    assert.equal(verifyResult.valid, true);
  });

  test('verify with invalid signature first byte returns -718', () => {
    const wallet = qcsdk.newWallet(3);
    const signResult = qcsdk.sign(wallet.privateKey, toByteArray(MESSAGE_32), 0);
    assert.equal(signResult.resultCode, 0);
    const sig = signResult.signature;
    const badSig = Array.isArray(sig) ? sig.slice() : Array.from(sig);
    badSig[0] = 0;
    const result = qcsdk.verify(wallet.publicKey, badSig, toByteArray(MESSAGE_32));
    assert.equal(result.resultCode, -718, 'first byte 0 is unknown type');
    assert.equal(result.valid, false);
  });

  test('verify type 1 (hybrideds verifyCompact): dispatch runs, wrong sig fails with -717 or -719', () => {
    const wallet = qcsdk.newWallet(3);
    const signResult = qcsdk.sign(wallet.privateKey, toByteArray(MESSAGE_32), 0);
    assert.equal(signResult.resultCode, 0);
    const sig = signResult.signature;
    const sigWithType1 = Array.isArray(sig) ? sig.slice() : Array.from(sig);
    sigWithType1[0] = 1;
    const result = qcsdk.verify(wallet.publicKey, sigWithType1, toByteArray(MESSAGE_32));
    assert.equal(result.valid, false);
    assert.ok(result.resultCode === -717 || result.resultCode === -719, 'type 1 dispatch should run and fail verify');
  });

  test('verify type 2 (hybrideds verify): dispatch runs, wrong sig fails with -717 or -719', () => {
    const wallet = qcsdk.newWallet(3);
    const signResult = qcsdk.sign(wallet.privateKey, toByteArray(MESSAGE_32), 0);
    assert.equal(signResult.resultCode, 0);
    const sig = signResult.signature;
    const sigWithType2 = Array.isArray(sig) ? sig.slice() : Array.from(sig);
    sigWithType2[0] = 2;
    const result = qcsdk.verify(wallet.publicKey, sigWithType2, toByteArray(MESSAGE_32));
    assert.equal(result.valid, false);
    assert.ok(result.resultCode === -717 || result.resultCode === -719, 'type 2 dispatch should run and fail verify');
  });
});

describe('verify hardcoded deterministic', () => {
  const vectors = require('./verify-vectors.json');

  describe('keyType 3 verifyCompact (32-word seed, sign context 0)', () => {
    const { publicKey: PUBLIC_KEY, signature: SIGNATURE, message: MESSAGE } = vectors.type3Compact;

    test('accepts hardcoded publicKey + signature + message', () => {
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, MESSAGE);
      assert.equal(result.resultCode, 0, `expected resultCode 0, got ${result.resultCode}`);
      assert.equal(result.valid, true, 'valid must be true for correct vector');
    });

    test('rejects hardcoded vector with wrong signature', () => {
      const wrongSignature = SIGNATURE.slice();
      wrongSignature[0] = (wrongSignature[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, wrongSignature, MESSAGE);
      assert.equal(result.valid, false, 'valid must be false for wrong signature');
    });

    test('rejects hardcoded vector with wrong message', () => {
      const wrongMessage = MESSAGE.slice();
      wrongMessage[0] = (wrongMessage[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, wrongMessage);
      assert.equal(result.valid, false, 'valid must be false for wrong message');
    });
  });

  describe('keyType 3 verify full (32-word seed, sign context 2)', () => {
    const { publicKey: PUBLIC_KEY, signature: SIGNATURE, message: MESSAGE } = vectors.type3Full;

    test('accepts hardcoded publicKey + signature + message', () => {
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, MESSAGE);
      assert.equal(result.resultCode, 0, `expected resultCode 0, got ${result.resultCode}`);
      assert.equal(result.valid, true, 'valid must be true for correct vector');
    });

    test('rejects hardcoded vector with wrong signature', () => {
      const wrongSignature = SIGNATURE.slice();
      wrongSignature[0] = (wrongSignature[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, wrongSignature, MESSAGE);
      assert.equal(result.valid, false, 'valid must be false for wrong signature');
    });

    test('rejects hardcoded vector with wrong message', () => {
      const wrongMessage = MESSAGE.slice();
      wrongMessage[0] = (wrongMessage[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, wrongMessage);
      assert.equal(result.valid, false, 'valid must be false for wrong message');
    });
  });

  describe('keyType 5 (36-word seed, sign context 1)', () => {
    const { publicKey: PUBLIC_KEY, signature: SIGNATURE, message: MESSAGE } = vectors.type5;

    test('accepts hardcoded publicKey + signature + message', () => {
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, MESSAGE);
      assert.equal(result.resultCode, 0, `expected resultCode 0, got ${result.resultCode}`);
      assert.equal(result.valid, true, 'valid must be true for correct vector');
    });

    test('rejects hardcoded vector with wrong signature', () => {
      const wrongSignature = SIGNATURE.slice();
      wrongSignature[0] = (wrongSignature[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, wrongSignature, MESSAGE);
      assert.equal(result.valid, false, 'valid must be false for wrong signature');
    });

    test('rejects hardcoded vector with wrong message', () => {
      const wrongMessage = MESSAGE.slice();
      wrongMessage[0] = (wrongMessage[0] + 1) % 256;
      const result = qcsdk.verify(PUBLIC_KEY, SIGNATURE, wrongMessage);
      assert.equal(result.valid, false, 'valid must be false for wrong message');
    });
  });
});
