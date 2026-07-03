/**
 * Tests for scryptDeriveKey(secret, salt, N, r, p, dkLen).
 *
 * Only the fixed scrypt parameter set N=262144, r=8, p=1, dkLen=32 is supported currently,
 * so the derived key is always 32 bytes and any other parameter values return null.
 */
const { describe, test, before } = require('node:test');
const assert = require('node:assert/strict');

const qcsdk = require('..');

const MAINNET_CHAIN_ID = 123123;
const READ_RELAY_URL = 'https://sdk.readrelay.quantumcoinapi.com';
const WRITE_RELAY_URL = 'https://sdk.writerelay.quantumcoinapi.com';

const SALT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

// Supported scrypt parameters.
const N = 262144;
const R = 8;
const P = 1;
const DKLEN = 32;

function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

// This block intentionally runs before initialize() is called.
describe('scryptDeriveKey (pre-init)', () => {
  test('returns -1000 before initialize', () => {
    assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN), -1000);
  });
});

describe('scryptDeriveKey', () => {
  before(async () => {
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const initResult = await qcsdk.initialize(cfg);
    assert.equal(initResult, true, 'SDK initialize should succeed');
  });

  test('derives a 32-byte key for a valid secret and salt', () => {
    const key = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    assert.ok(Array.isArray(key), 'result should be a byte array');
    assert.equal(key.length, 32, 'derived key must be 32 bytes');
  });

  test('is deterministic for the same secret and salt', () => {
    const key1 = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    const key2 = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    assert.deepEqual(key1, key2, 'same inputs must produce the same key');
  });

  test('produces a different key for a different salt', () => {
    const otherSalt = new Uint8Array(SALT);
    otherSalt[0] = (otherSalt[0] + 1) & 0xff;
    const key1 = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    const key2 = qcsdk.scryptDeriveKey('test-passphrase-123', otherSalt, N, R, P, DKLEN);
    assert.notDeepEqual(key1, key2, 'different salt must produce a different key');
  });

  test('produces a different key for a different secret', () => {
    const key1 = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    const key2 = qcsdk.scryptDeriveKey('test-passphrase-124', SALT, N, R, P, DKLEN);
    assert.notDeepEqual(key1, key2, 'different secret must produce a different key');
  });

  test('accepts a plain number[] salt (equivalent to Uint8Array)', () => {
    const key1 = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    const key2 = qcsdk.scryptDeriveKey('test-passphrase-123', Array.from(SALT), N, R, P, DKLEN);
    assert.deepEqual(key1, key2, 'number[] and Uint8Array salt must match');
  });

  test('matches known-answer vector', () => {
    const key = qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, DKLEN);
    assert.equal(
      toBase64(key),
      'YCJuvOP0hUtJpNfmRp7PMP5Evkr4gXFUXPKl4zaXnHo=',
      'derived key must match the hardcoded vector'
    );
  });

  test('returns null for a null secret', () => {
    assert.equal(qcsdk.scryptDeriveKey(null, SALT, N, R, P, DKLEN), null);
  });

  test('returns null for a non-string secret', () => {
    assert.equal(qcsdk.scryptDeriveKey(12345, SALT, N, R, P, DKLEN), null);
  });

  test('returns null for a null salt', () => {
    assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', null, N, R, P, DKLEN), null);
  });

  test('returns null for a non-array salt', () => {
    assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', {}, N, R, P, DKLEN), null);
  });

  describe('unsupported parameters return null', () => {
    test('returns null for an unsupported N', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, 16384, R, P, DKLEN), null);
    });

    test('returns null for an unsupported r', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, 16, P, DKLEN), null);
    });

    test('returns null for an unsupported p', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, 2, DKLEN), null);
    });

    test('returns null for an unsupported dkLen', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, N, R, P, 64), null);
    });

    test('returns null for a non-number N (null)', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, null, R, P, DKLEN), null);
    });

    test('returns null for a non-number N (string)', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT, '262144', R, P, DKLEN), null);
    });

    test('returns null when parameters are omitted', () => {
      assert.equal(qcsdk.scryptDeriveKey('test-passphrase-123', SALT), null);
    });
  });
});
