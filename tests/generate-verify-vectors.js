/**
 * One-off: generate deterministic verify vectors for keyType 3 (verifyCompact + verify full) and keyType 5.
 * Run: node tests/generate-verify-vectors.js
 */
const qcsdk = require('..');
const fs = require('fs');
const path = require('path');

const MAINNET_CHAIN_ID = 123123;
const READ_RELAY_URL = 'https://sdk.readrelay.quantumcoinapi.com';
const WRITE_RELAY_URL = 'https://sdk.writerelay.quantumcoinapi.com';

const TEST_SEED_WORDS_32 = [
  'cylamidal', 'suculate', 'sealmate', 'radiploid', 'equifaxis', 'and', 'antipoise', 'stitchesy', 'perelade', 'lite',
  'gourtarel', 'thursat', 'overdrome', 'cogulate', 'nonviva', 'stewnut', 'floribund', 'enduivist', 'decatary', 'elvenwort',
  'indoucate', 'ravelent', 'vocalus', 'wetshirt', 'rutatory', 'percect', 'breaktout', 'corpation', 'myricorus', 'veofreat',
  'junkard', 'supercarp',
];

const TEST_SEED_WORDS_36 = [
  'cylamidal', 'suculate', 'sealmate', 'radiploid', 'equifaxis', 'and', 'antipoise', 'stitchesy', 'perelade', 'lite',
  'gourtarel', 'thursat', 'overdrome', 'cogulate', 'nonviva', 'stewnut', 'floribund', 'enduivist', 'decatary', 'elvenwort',
  'indoucate', 'ravelent', 'vocalus', 'wetshirt', 'rutatory', 'percect', 'breaktout', 'corpation', 'myricorus', 'veofreat',
  'junkard', 'supercarp', 'sukerus', 'tautang', 'facetype', 'shishkin',
];

const MESSAGE_32 = new Uint8Array(32);
for (let i = 0; i < 32; i++) MESSAGE_32[i] = (i + 1) & 0xff;

function toArray(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
}

async function main() {
  const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
  await qcsdk.initialize(cfg);

  const out = {};

  // keyType 3 verifyCompact: 32-word seed, sign with null or 0
  const wallet3 = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_32);
  if (!wallet3 || wallet3 === -1000) {
    console.error('openWalletFromSeedWords(32) failed');
    process.exit(1);
  }
  const sign3Compact = qcsdk.sign(wallet3.privateKey, MESSAGE_32, 0);
  if (sign3Compact.resultCode !== 0) {
    console.error('sign type3 compact failed', sign3Compact.resultCode);
    process.exit(1);
  }
  out.type3Compact = {
    publicKey: toArray(wallet3.publicKey),
    signature: toArray(sign3Compact.signature),
    message: Array.from(MESSAGE_32),
  };

  // keyType 3 verify (full): same wallet, sign with context 2
  const sign3Full = qcsdk.sign(wallet3.privateKey, MESSAGE_32, 2);
  if (sign3Full.resultCode !== 0) {
    console.error('sign type3 full failed', sign3Full.resultCode);
    process.exit(1);
  }
  out.type3Full = {
    publicKey: toArray(wallet3.publicKey),
    signature: toArray(sign3Full.signature),
    message: Array.from(MESSAGE_32),
  };

  // keyType 5: 36-word seed, sign with null or 1
  const wallet5 = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_36);
  if (!wallet5 || wallet5 === -1000) {
    console.error('openWalletFromSeedWords(36) failed');
    process.exit(1);
  }
  const sign5 = qcsdk.sign(wallet5.privateKey, MESSAGE_32, 1);
  if (sign5.resultCode !== 0) {
    console.error('sign type5 failed', sign5.resultCode);
    process.exit(1);
  }
  out.type5 = {
    publicKey: toArray(wallet5.publicKey),
    signature: toArray(sign5.signature),
    message: Array.from(MESSAGE_32),
  };

  const outPath = path.join(__dirname, 'verify-vectors.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
