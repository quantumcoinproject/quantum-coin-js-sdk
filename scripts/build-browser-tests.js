#!/usr/bin/env node
// Bundles the browser test entry (SDK + wasm_exec + base64 WASM + seed-words +
// shared specs) into tests/browser/bundle.js via esbuild. platform:'browser'
// fails the build if any Node-only builtin sneaks into the runtime graph - a
// useful guard for browser compatibility.
'use strict';

const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

esbuild
    .build({
        entryPoints: [path.join(root, 'tests', 'browser', 'entry.js')],
        bundle: true,
        outfile: path.join(root, 'tests', 'browser', 'bundle.js'),
        platform: 'browser',
        format: 'iife',
        loader: { '.json': 'json' },
        logLevel: 'info',
    })
    .then(() => {
        console.log('Built tests/browser/bundle.js');
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
