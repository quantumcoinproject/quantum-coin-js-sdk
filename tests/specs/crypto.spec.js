'use strict';

// Environment-agnostic deterministic tests for the WASM crypto primitives:
// the five hashes (sha256/sha512/ripemd160/computeHmac/pbkdf2) and the
// parameterized scrypt. Requires the SDK to be initialized. Runs identically
// in Node and the browser.

const { hexToBytes, bytesToHex, utf8ToBytes } = require('./hex');

// Known-answer vectors (hex).
const SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA512_ABC =
    'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a' +
    '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f';
// Ethereum-style Keccak-256 (legacy padding), not SHA3-256.
const KECCAK_ABC = '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45';
const KECCAK_EMPTY = 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
const RIPEMD_ABC = '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc';
const RIPEMD_EMPTY = '9c1185a5c5e9fc54612808977ee8f548b2258d31';
const HMAC256 = '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843';
const HMAC512 =
    '164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea250554' +
    '9758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737';
const PBKDF2_256 = '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b';
const SCRYPT_RFC7914 =
    '77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442' +
    'fcd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906';

async function run(qcsdk, assert) {
    // ---- SHA-256 ----
    assert.equal(bytesToHex(qcsdk.sha256('abc')), SHA256_ABC, 'sha256(abc)');
    assert.equal(bytesToHex(qcsdk.sha256('')), SHA256_EMPTY, 'sha256("")');
    assert.deepEqual(qcsdk.sha256('abc'), qcsdk.sha256('abc'), 'sha256 deterministic');
    // string and equivalent byte input agree
    assert.deepEqual(qcsdk.sha256('abc'), qcsdk.sha256(utf8ToBytes('abc')), 'sha256 string==bytes');
    assert.deepEqual(qcsdk.sha256(new Uint8Array(utf8ToBytes('abc'))), qcsdk.sha256('abc'), 'sha256 Uint8Array==string');
    assert.equal(qcsdk.sha256(12345), null, 'sha256 rejects non-bytes');

    // ---- SHA-512 ----
    assert.equal(bytesToHex(qcsdk.sha512('abc')), SHA512_ABC, 'sha512(abc)');
    assert.equal(qcsdk.sha512(null), null, 'sha512 rejects null');

    // ---- Keccak-256 ----
    assert.equal(bytesToHex(qcsdk.keccak256('abc')), KECCAK_ABC, 'keccak256(abc)');
    assert.equal(bytesToHex(qcsdk.keccak256('')), KECCAK_EMPTY, 'keccak256("")');
    assert.deepEqual(qcsdk.keccak256('abc'), qcsdk.keccak256('abc'), 'keccak256 deterministic');
    assert.deepEqual(qcsdk.keccak256('abc'), qcsdk.keccak256(utf8ToBytes('abc')), 'keccak256 string==bytes');
    assert.deepEqual(qcsdk.keccak256(new Uint8Array(utf8ToBytes('abc'))), qcsdk.keccak256('abc'), 'keccak256 Uint8Array==string');
    assert.equal(qcsdk.keccak256('abc').length, 32, 'keccak256 is 32 bytes');
    assert.equal(qcsdk.keccak256(12345), null, 'keccak256 rejects non-bytes');

    // ---- RIPEMD-160 ----
    assert.equal(bytesToHex(qcsdk.ripemd160('abc')), RIPEMD_ABC, 'ripemd160(abc)');
    assert.equal(bytesToHex(qcsdk.ripemd160('')), RIPEMD_EMPTY, 'ripemd160("")');
    assert.equal(qcsdk.ripemd160({}), null, 'ripemd160 rejects object');

    // ---- HMAC ----
    assert.equal(
        bytesToHex(qcsdk.computeHmac('sha256', 'Jefe', 'what do ya want for nothing?')),
        HMAC256,
        'hmac-sha256 RFC4231',
    );
    assert.equal(
        bytesToHex(qcsdk.computeHmac('sha512', 'Jefe', 'what do ya want for nothing?')),
        HMAC512,
        'hmac-sha512 RFC4231',
    );
    assert.equal(qcsdk.computeHmac('md5', 'k', 'd'), null, 'hmac rejects unsupported alg');
    assert.equal(qcsdk.computeHmac('sha256', 12345, 'd'), null, 'hmac rejects non-bytes key');
    assert.equal(qcsdk.computeHmac(123, 'k', 'd'), null, 'hmac rejects non-string alg');

    // ---- PBKDF2 ----
    assert.equal(
        bytesToHex(qcsdk.pbkdf2('password', utf8ToBytes('salt'), 1, 32, 'sha256')),
        PBKDF2_256,
        'pbkdf2-sha256 known vector',
    );
    assert.equal(qcsdk.pbkdf2('password', utf8ToBytes('salt'), 0, 32, 'sha256'), null, 'pbkdf2 rejects 0 iterations');
    assert.equal(qcsdk.pbkdf2('password', utf8ToBytes('salt'), 1, 32, 'md5'), null, 'pbkdf2 rejects unsupported alg');
    assert.equal(qcsdk.pbkdf2('password', 12345, 1, 32, 'sha256'), null, 'pbkdf2 rejects non-array salt');
    assert.equal(qcsdk.pbkdf2('password', utf8ToBytes('salt'), '1', 32, 'sha256'), null, 'pbkdf2 rejects non-number iterations');

    // ---- Scrypt (parameterized) ----
    // RFC 7914 exact vector: scrypt("", [], N=16, r=1, p=1, dkLen=64).
    const rfc = qcsdk.scryptDeriveKey('', [], 16, 1, 1, 64);
    assert.equal(bytesToHex(rfc), SCRYPT_RFC7914, 'scrypt RFC7914 vector');
    assert.equal(rfc.length, 64, 'scrypt honors dkLen');

    // Determinism.
    assert.deepEqual(
        qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), 16, 8, 1, 32),
        qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), 16, 8, 1, 32),
        'scrypt deterministic',
    );

    // Relaxed params: values that previously returned null now derive a key.
    const relaxed = qcsdk.scryptDeriveKey('test-passphrase-123', hexToBytes('0102030405060708090a0b0c0d0e0f10'), 16384, 8, 1, 32);
    assert.ok(Array.isArray(relaxed) && relaxed.length === 32, 'relaxed scrypt params derive a 32-byte key');

    // Bytes secret is accepted and equals the UTF-8 string form.
    assert.deepEqual(
        qcsdk.scryptDeriveKey(utf8ToBytes('pw'), utf8ToBytes('salt'), 16, 8, 1, 32),
        qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), 16, 8, 1, 32),
        'scrypt bytes-secret == string-secret',
    );

    // Negatives.
    assert.equal(qcsdk.scryptDeriveKey(null, utf8ToBytes('salt'), 16, 8, 1, 32), null, 'scrypt rejects null secret');
    assert.equal(qcsdk.scryptDeriveKey('pw', null, 16, 8, 1, 32), null, 'scrypt rejects null salt');
    assert.equal(qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), '16', 8, 1, 32), null, 'scrypt rejects non-number N');
    assert.equal(qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), 0, 8, 1, 32), null, 'scrypt rejects N=0');
    assert.equal(qcsdk.scryptDeriveKey('pw', utf8ToBytes('salt'), 3, 8, 1, 32), null, 'scrypt rejects N not a power of two');
}

module.exports = { name: 'crypto (scrypt + hashes)', needsInit: true, run };
