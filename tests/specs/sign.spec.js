'use strict';

// Environment-agnostic sign/verify tests (offline, deterministic). Exercises the
// CIRCL WASM signature scheme end-to-end. Requires the SDK to be initialized.

const vectors = require('../verify-vectors.json');

function message32() {
    const m = [];
    for (let i = 0; i < 32; i++) m.push((i + 1) & 0xff);
    return m;
}

function circlAvailable(qcsdk) {
    const w = qcsdk.newWallet();
    return w && w.privateKey != null && w.address != null && qcsdk.verifyWallet(w) === true;
}

async function run(qcsdk, assert) {
    assert.ok(circlAvailable(qcsdk), 'CIRCL WASM must be loaded');

    const MESSAGE = message32();

    // Sign/verify roundtrip for each key type.
    for (const keyType of [null, 3, 5]) {
        const wallet = qcsdk.newWallet(keyType);
        assert.ok(wallet && typeof wallet === 'object', `newWallet(${keyType})`);
        const signResult = qcsdk.sign(wallet.privateKey, MESSAGE);
        assert.equal(signResult.resultCode, 0, `sign keyType ${keyType}`);
        assert.ok(signResult.signature != null && signResult.signature.length > 0, `signature keyType ${keyType}`);
        const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, MESSAGE);
        assert.equal(verifyResult.resultCode, 0, `verify keyType ${keyType}`);
        assert.equal(verifyResult.valid, true, `valid keyType ${keyType}`);
    }

    // Wrong message must not verify.
    {
        const wallet = qcsdk.newWallet(null);
        const signResult = qcsdk.sign(wallet.privateKey, MESSAGE);
        assert.equal(signResult.resultCode, 0, 'sign for wrong-message test');
        const wrong = message32();
        wrong[0] = 0xff;
        const verifyResult = qcsdk.verify(wallet.publicKey, signResult.signature, wrong);
        assert.equal(verifyResult.valid, false, 'wrong message must be invalid');
    }

    // Explicit signing contexts.
    {
        const wallet3 = qcsdk.newWallet(3);
        for (const ctx of [0, 2]) {
            const s = qcsdk.sign(wallet3.privateKey, MESSAGE, ctx);
            assert.equal(s.resultCode, 0, `sign context ${ctx}`);
            const v = qcsdk.verify(wallet3.publicKey, s.signature, MESSAGE);
            assert.equal(v.valid, true, `verify context ${ctx}`);
        }
        const wallet5 = qcsdk.newWallet(5);
        const s1 = qcsdk.sign(wallet5.privateKey, MESSAGE, 1);
        assert.equal(s1.resultCode, 0, 'sign context 1');
        assert.equal(qcsdk.verify(wallet5.publicKey, s1.signature, MESSAGE).valid, true, 'verify context 1');
    }

    // Invalid inputs.
    {
        const bad = qcsdk.sign(null, MESSAGE);
        assert.notEqual(bad.resultCode, 0, 'sign null private key');
        assert.equal(bad.signature, null, 'null signature on bad sign');

        const wallet = qcsdk.newWallet(3);
        const badCtx = qcsdk.sign(wallet.privateKey, MESSAGE, 99);
        assert.notEqual(badCtx.resultCode, 0, 'sign invalid context');
    }

    // Hardcoded deterministic verify vectors.
    for (const key of ['type3Compact', 'type3Full', 'type5']) {
        const { publicKey, signature, message } = vectors[key];
        const ok = qcsdk.verify(publicKey, signature, message);
        assert.equal(ok.resultCode, 0, `vector ${key} resultCode`);
        assert.equal(ok.valid, true, `vector ${key} valid`);

        const wrongSig = signature.slice();
        wrongSig[0] = (wrongSig[0] + 1) % 256;
        assert.equal(qcsdk.verify(publicKey, wrongSig, message).valid, false, `vector ${key} wrong signature`);

        const wrongMsg = message.slice();
        wrongMsg[0] = (wrongMsg[0] + 1) % 256;
        assert.equal(qcsdk.verify(publicKey, signature, wrongMsg).valid, false, `vector ${key} wrong message`);
    }
}

module.exports = { name: 'sign/verify', needsInit: true, run };
