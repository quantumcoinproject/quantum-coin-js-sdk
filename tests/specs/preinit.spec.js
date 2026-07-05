'use strict';

// Environment-agnostic pre-initialization checks. MUST run before
// qcsdk.initialize(): every WASM-backed crypto function returns -1000 until the
// WASM is initialized.

const { utf8ToBytes } = require('./hex');

async function run(qcsdk, assert) {
    const SALT = utf8ToBytes('salt');
    assert.equal(qcsdk.scryptDeriveKey('secret', SALT, 16, 8, 1, 32), -1000, 'scrypt pre-init -1000');
    assert.equal(qcsdk.sha256('abc'), -1000, 'sha256 pre-init -1000');
    assert.equal(qcsdk.sha512('abc'), -1000, 'sha512 pre-init -1000');
    assert.equal(qcsdk.ripemd160('abc'), -1000, 'ripemd160 pre-init -1000');
    assert.equal(qcsdk.computeHmac('sha256', 'k', 'd'), -1000, 'computeHmac pre-init -1000');
    assert.equal(qcsdk.pbkdf2('password', SALT, 1, 32, 'sha256'), -1000, 'pbkdf2 pre-init -1000');
}

module.exports = { name: 'crypto pre-init (-1000)', needsInit: false, run };
