#!/usr/bin/env node
/*
 * Regenerates the SDK's embedded accounts WASM artifacts:
 *   - wasmBase64.js        (gzip-then-base64 WASM, exported via getBase64Wasm())
 *   - wasm_exec.js         (only in --local mode: synced from the building Go toolchain's GOROOT)
 *   - EXPECTED_WASM_SHA256 (patched into index.js; sha256 of the RAW wasm)
 *
 * The raw WASM can come from one of three explicitly selected sources:
 *   --local                Build ../quantum-coin-go (GOOS=js GOARCH=wasm). Requires Go; also syncs wasm_exec.js.
 *   --base64-file <path>   Decode a local libgodp.wasm.base64 file. Go-free; leaves wasm_exec.js untouched.
 *   --base64-url <url>     Fetch + decode a base64 release asset. Go-free; leaves wasm_exec.js untouched.
 *
 * Running with no source (or -h/--help) prints usage help; no mode is implicit.
 * The multi-MB base64 blob is generated here and must NOT be opened/edited by hand.
 *
 * Usage:
 *   node scripts/build-wasm.js --local
 *   node scripts/build-wasm.js --base64-file ./libgodp.wasm.base64
 *   node scripts/build-wasm.js --base64-url https://github.com/.../libgodp.wasm.base64
 *   QC_GO_DIR=/path/to/quantum-coin-go node scripts/build-wasm.js --local
 *   QC_WASM_BASE64_FILE=./libgodp.wasm.base64 node scripts/build-wasm.js
 *   QC_WASM_BASE64_URL=https://.../libgodp.wasm.base64 node scripts/build-wasm.js
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const sdkDir = path.resolve(__dirname, '..');

function run(cmd, args, opts) {
    return execFileSync(cmd, args, { encoding: 'utf8', ...opts }).trim();
}

// Usage help. Kept in sync with the header comment above. Prints to stderr when
// `toStderr` is set (usage errors) so stdout stays clean for tooling.
function printHelp(toStderr) {
    const log = toStderr ? console.error : console.log;
    log([
        'Usage: node scripts/build-wasm.js <mode>',
        '',
        'Modes (exactly one required):',
        '  --local                 Build ../quantum-coin-go (GOOS=js GOARCH=wasm) and sync wasm_exec.js.',
        '  --base64-file <path>    Decode a local libgodp.wasm.base64 file (Go-free).',
        '  --base64-url <url>      Fetch + decode a base64 release asset (Go-free).',
        '  -h, --help              Show this help.',
        '',
        'Env equivalents: QC_WASM_BASE64_FILE, QC_WASM_BASE64_URL, QC_GO_DIR (for --local).',
    ].join('\n'));
}

// Minimal flag parser. Flags take the following argv token, or an inline =value.
// Env vars (QC_WASM_BASE64_FILE / QC_WASM_BASE64_URL) act as fallbacks for the
// two artifact modes. Unknown args throw so typos are caught early.
function parseArgs(argv) {
    const opts = { help: false, local: false, base64File: null, base64Url: null };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '-h' || a === '--help') {
            opts.help = true;
        } else if (a === '--local') {
            opts.local = true;
        } else if (a === '--base64-file') {
            opts.base64File = argv[++i];
        } else if (a.startsWith('--base64-file=')) {
            opts.base64File = a.slice('--base64-file='.length);
        } else if (a === '--base64-url') {
            opts.base64Url = argv[++i];
        } else if (a.startsWith('--base64-url=')) {
            opts.base64Url = a.slice('--base64-url='.length);
        } else {
            throw new Error(`Unknown argument: ${a}`);
        }
    }
    if (!opts.base64File && process.env.QC_WASM_BASE64_FILE) {
        opts.base64File = process.env.QC_WASM_BASE64_FILE;
    }
    if (!opts.base64Url && process.env.QC_WASM_BASE64_URL) {
        opts.base64Url = process.env.QC_WASM_BASE64_URL;
    }
    return opts;
}

// --local mode: build the wasm from quantum-coin-go and (only here) sync wasm_exec.js
// from the same toolchain's GOROOT so the shim matches the module. Returns { wasmBytes, source }.
function buildWasmLocally() {
    const goDir = process.env.QC_GO_DIR
        ? path.resolve(process.env.QC_GO_DIR)
        : path.resolve(sdkDir, '..', 'quantum-coin-go');
    if (!fs.existsSync(goDir)) {
        throw new Error(`quantum-coin-go not found at ${goDir} (set QC_GO_DIR)`);
    }

    const goroot = run('go', ['env', 'GOROOT']);
    const wasmExecSrc = path.join(goroot, 'lib', 'wasm', 'wasm_exec.js');
    if (!fs.existsSync(wasmExecSrc)) {
        throw new Error(`wasm_exec.js not found at ${wasmExecSrc}`);
    }

    const outWasm = path.join(os.tmpdir(), `libgodp.${process.pid}.wasm`);
    console.log(`Building WASM from ${goDir} ...`);
    // -ldflags "-s -w" strips the symbol table + DWARF debug info; -trimpath removes
    // embedded filesystem paths. The module stays functionally identical (no import/export
    // or runtime-feature change) - it is just smaller. execFileSync bypasses the shell, so
    // the ldflags value is passed as a single argv token.
    run('go', ['build', '-trimpath', '-ldflags=-s -w', '-o', outWasm, './wasm/web'], {
        cwd: goDir,
        env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' },
    });

    const wasmBytes = fs.readFileSync(outWasm);
    // Sync the Go runtime shim so it matches the toolchain that built the WASM.
    // Only done in --local mode; artifact modes leave the committed wasm_exec.js untouched.
    fs.copyFileSync(wasmExecSrc, path.join(sdkDir, 'wasm_exec.js'));
    fs.rmSync(outWasm, { force: true });

    return { wasmBytes, source: `local go build (${goDir})` };
}

// Decode plain base64 (single-line or wrapped) into raw wasm bytes, then sanity-check
// the "\0asm" magic so a wrong file/URL (e.g. a 404 HTML page) fails loudly instead of
// getting embedded as a broken blob. This is a mistake guard, not an authenticity check.
function decodeBase64Wasm(text) {
    const bytes = Buffer.from(text.replace(/\s+/g, ''), 'base64');
    if (bytes.length < 8 || bytes[0] !== 0x00 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d) {
        throw new Error('decoded data is not a WASM module (bad \\0asm magic) - wrong file/URL?');
    }
    return bytes;
}

// Resolve the raw wasm bytes for the selected mode. Returns { wasmBytes, source }.
async function loadWasmBytes(opts) {
    if (opts.base64Url) {
        const res = await fetch(opts.base64Url); // Node 18+ global fetch; follows GitHub CDN redirect
        if (!res.ok) {
            throw new Error(`fetch ${opts.base64Url} -> HTTP ${res.status}`);
        }
        return { wasmBytes: decodeBase64Wasm(await res.text()), source: `base64 url (${opts.base64Url})` };
    }
    if (opts.base64File) {
        return {
            wasmBytes: decodeBase64Wasm(fs.readFileSync(opts.base64File, 'utf8')),
            source: `base64 file (${opts.base64File})`,
        };
    }
    return buildWasmLocally();
}

async function main() {
    let opts;
    try {
        opts = parseArgs(process.argv.slice(2));
    } catch (e) {
        console.error(`Error: ${e.message}\n`);
        printHelp(true);
        process.exit(1);
    }

    // -h/--help prints to stdout and exits 0.
    if (opts.help) {
        printHelp(false);
        process.exit(0);
    }

    // No mode is implicit: a bare invocation prints help to stderr and exits non-zero
    // so CI catches a missing mode. Exactly one source must be selected.
    const sources = [opts.local && 'local', opts.base64File && 'file', opts.base64Url && 'url'].filter(Boolean);
    if (sources.length === 0) {
        printHelp(true);
        process.exit(1);
    }
    if (sources.length > 1) {
        console.error('Error: choose exactly one source (--local, --base64-file, --base64-url)\n');
        printHelp(true);
        process.exit(1);
    }

    const { wasmBytes, source } = await loadWasmBytes(opts);

    // Integrity hash is over the RAW (decompressed) wasm, so it keeps describing the
    // real module regardless of how it is stored/compressed.
    const sha256 = crypto.createHash('sha256').update(wasmBytes).digest('hex');
    // Gzip before base64: wasm compresses well, shrinking the embedded JS blob ~3-4x.
    const gzipped = zlib.gzipSync(wasmBytes, { level: 9 });
    const base64 = gzipped.toString('base64');

    // Write wasmBase64.js (whole-file write; never hand-edited).
    const wasmBase64Js =
        '// AUTO-GENERATED by scripts/build-wasm.js - do not edit by hand.\n' +
        '// gzip-then-base64 quantum-coin-go accounts WASM (GOOS=js GOARCH=wasm).\n' +
        '// Decompressed + integrity-checked at init in index.js (InitAccountsWebAssembly).\n' +
        'function getBase64Wasm() {\n' +
        '    return "' + base64 + '";\n' +
        '}\n' +
        'module.exports = { getBase64Wasm };\n';
    fs.writeFileSync(path.join(sdkDir, 'wasmBase64.js'), wasmBase64Js);

    // Patch EXPECTED_WASM_SHA256 in index.js.
    const indexPath = path.join(sdkDir, 'index.js');
    let indexSrc = fs.readFileSync(indexPath, 'utf8');
    const constRe = /const EXPECTED_WASM_SHA256 = "[0-9a-fA-F]*";/;
    if (!constRe.test(indexSrc)) {
        throw new Error('Could not find EXPECTED_WASM_SHA256 constant in index.js');
    }
    indexSrc = indexSrc.replace(constRe, `const EXPECTED_WASM_SHA256 = "${sha256}";`);
    fs.writeFileSync(indexPath, indexSrc);

    console.log(`source          : ${source}`);
    console.log(`wasm bytes      : ${wasmBytes.length}`);
    console.log(`gzip bytes      : ${gzipped.length}`);
    console.log(`base64 length   : ${base64.length}`);
    console.log(`sha256          : ${sha256}`);
    const updated = opts.local
        ? 'wasmBase64.js, wasm_exec.js, index.js (EXPECTED_WASM_SHA256)'
        : 'wasmBase64.js, index.js (EXPECTED_WASM_SHA256)';
    console.log(`Updated: ${updated}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
