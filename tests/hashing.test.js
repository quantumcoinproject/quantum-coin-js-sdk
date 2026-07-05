/**
 * Node runner for the environment-agnostic shared specs (tests/specs/*.spec.js).
 * These exact specs also run in a real headless browser via `npm run test:browser`,
 * so the crypto / sign / wallet surface is verified identically in both environments.
 *
 * Pre-init checks run first (WASM not initialized), then initialize(), then the
 * post-init specs. node:test runs top-level tests sequentially within a file.
 */
const { test } = require('node:test');

const makeAssert = require('./specs/assert');
const qcsdk = require('..');

const preinitSpec = require('./specs/preinit.spec');
const cryptoSpec = require('./specs/crypto.spec');
const signSpec = require('./specs/sign.spec');
const walletSpec = require('./specs/wallet.spec');

const MAINNET_CHAIN_ID = 123123;

test(preinitSpec.name, async () => {
    await preinitSpec.run(qcsdk, makeAssert());
});

test('initialize', async () => {
    const ok = await qcsdk.initialize(new qcsdk.Config(MAINNET_CHAIN_ID));
    if (ok !== true) throw new Error('SDK initialize should succeed, got ' + ok);
});

for (const spec of [cryptoSpec, signSpec, walletSpec]) {
    test(spec.name, async () => {
        await spec.run(qcsdk, makeAssert());
    });
}
