'use strict';

// Browser test entry point. esbuild bundles this (+ the SDK, wasm_exec.js, the
// ~10MB base64 WASM, seed-words, and the shared specs) into a single IIFE. It
// runs the same environment-agnostic specs used by the Node runner and records
// results on window.__specResults. This is where the browser-only fixes are
// actually exercised: globalThis.Go (no `global`) and the subtle.digest
// integrity check, plus in-browser WASM instantiation.

const qcsdk = require('../../index.js');
const makeAssert = require('../specs/assert');

const preinitSpec = require('../specs/preinit.spec');
const cryptoSpec = require('../specs/crypto.spec');
const signSpec = require('../specs/sign.spec');
const walletSpec = require('../specs/wallet.spec');

const MAINNET_CHAIN_ID = 123123;

async function runSpec(spec, results) {
    const assert = makeAssert();
    const started = Date.now();
    try {
        await spec.run(qcsdk, assert);
        results.specs.push({ name: spec.name, ok: true, checks: assert.count, ms: Date.now() - started });
        results.passed++;
    } catch (e) {
        results.specs.push({ name: spec.name, ok: false, checks: assert.count, error: (e && e.message) || String(e), ms: Date.now() - started });
        results.failed++;
    }
}

async function main() {
    const results = { passed: 0, failed: 0, specs: [] };
    try {
        // Pre-init checks MUST run before initialize().
        await runSpec(preinitSpec, results);

        const ok = await qcsdk.initialize(new qcsdk.Config(MAINNET_CHAIN_ID));
        if (ok !== true) {
            results.failed++;
            results.specs.push({ name: 'initialize', ok: false, error: 'initialize returned ' + ok });
        } else {
            results.specs.push({ name: 'initialize', ok: true });
            await runSpec(cryptoSpec, results);
            await runSpec(signSpec, results);
            await runSpec(walletSpec, results);
        }
    } catch (e) {
        results.failed++;
        results.specs.push({ name: 'harness', ok: false, error: (e && e.stack) || String(e) });
    }
    results.done = true;
    (typeof window !== 'undefined' ? window : globalThis).__specResults = results;
}

main();
