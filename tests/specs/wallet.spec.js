'use strict';

// Environment-agnostic wallet / keystore / seed tests (offline, deterministic).
// Requires the SDK to be initialized. No filesystem or network access, so it
// runs identically in Node and the browser.

const TEST_SEED_WORDS = [
    'cylamidal', 'suculate', 'sealmate', 'radiploid', 'equifaxis', 'and', 'antipoise', 'stitchesy', 'perelade', 'lite',
    'gourtarel', 'thursat', 'overdrome', 'cogulate', 'nonviva', 'stewnut', 'floribund', 'enduivist', 'decatary', 'elvenwort',
    'indoucate', 'ravelent', 'vocalus', 'wetshirt', 'rutatory', 'percect', 'breaktout', 'corpation', 'myricorus', 'veofreat',
    'junkard', 'supercarp', 'sukerus', 'tautang', 'facetype', 'shishkin', 'insulal', 'hobstone', 'stumbed', 'tecutonic',
    'jumplike', 'hegwirth', 'idea', 'bhagatpur', 'pavastava', 'kukuluan', 'mageiline', 'extranite',
];
const TEST_SEED_WORDS_32 = TEST_SEED_WORDS.slice(0, 32);
const TEST_SEED_WORDS_36 = TEST_SEED_WORDS.slice(0, 36);
const TEST_SEED_ADDRESS = '0x3ce22c0e2714196734e42b0d4d5ad11284260502a560e46c2cd857391564142f';
const TEST_SEED_ADDRESS_32 = '0x38b12df2d4762a04a183f936c47747a1f13d0b0ba72066b43b4b6d7f776e9e25';
const TEST_SEED_ADDRESS_36 = '0x030e264c853bd859c53fae3ad6ef0e011dc799685e2b05d5efa7ac50f10ca075';

const TEST_SEED_ARRAY_48 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139,218,249,224,255,76,150,203,7,108,119,101,70,217,112,225,190,112,169,98,168,104,223,14,235,161,192,118,167,128,203,76,59];
const TEST_SEED_ARRAY_32 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139];
const TEST_SEED_ARRAY_36 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139,218,249,224,255,76,150,203,7];

const PASSPHRASE = 'QuantumCoinExample123!';
const VALID_ADDRESS = '0x6f605c4142f1cb037f967101a5b28ccd00b27cce4516190356baaf284d20e667';

async function run(qcsdk, assert) {
    // isAddressValid.
    assert.equal(qcsdk.isAddressValid(VALID_ADDRESS), true, 'valid address accepted');
    assert.equal(qcsdk.isAddressValid(VALID_ADDRESS.toUpperCase()), true, 'valid 0X address accepted');
    assert.equal(qcsdk.isAddressValid('asfasdfasdfs'), false, 'garbage address rejected');
    assert.equal(qcsdk.isAddressValid(null), false, 'null address rejected');

    // newWallet + serialize/deserialize roundtrip.
    const w1 = qcsdk.newWallet();
    assert.ok(w1 && typeof w1.address === 'string', 'newWallet returns wallet');
    assert.equal(qcsdk.verifyWallet(w1), true, 'verifyWallet(newWallet())');
    const serialized = qcsdk.serializeWallet(w1);
    assert.ok(serialized && typeof serialized === 'string', 'serializeWallet returns string');
    const w2 = qcsdk.deserializeWallet(serialized);
    assert.equal(w2.address.toLowerCase(), w1.address.toLowerCase(), 'deserialize roundtrip address');
    assert.equal(qcsdk.verifyWallet(w2), true, 'verifyWallet(deserialized)');

    // Encrypted wallet roundtrip + wrong passphrase.
    const enc = qcsdk.serializeEncryptedWallet(w1, PASSPHRASE);
    assert.ok(enc && typeof enc === 'string', 'serializeEncryptedWallet');
    const dec = qcsdk.deserializeEncryptedWallet(enc, PASSPHRASE);
    assert.equal(dec.address.toLowerCase(), w1.address.toLowerCase(), 'encrypted roundtrip address');
    assert.equal(qcsdk.verifyWallet(dec), true, 'verifyWallet(encrypted-decrypted)');
    assert.equal(qcsdk.deserializeEncryptedWallet(enc, PASSPHRASE + 'x'), null, 'wrong passphrase returns null');

    // Deterministic seed-words -> address.
    const sw = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS);
    assert.equal(sw.address.toLowerCase(), TEST_SEED_ADDRESS, 'seed words 48 -> address');
    assert.equal(qcsdk.verifyWallet(sw), true, 'verifyWallet(seed words 48)');
    assert.equal(qcsdk.openWalletFromSeedWords(['not', 'enough']), null, 'invalid seed words -> null');

    // Deterministic raw seed -> address, for all three schemes.
    assert.equal(qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_48).address.toLowerCase(), TEST_SEED_ADDRESS, 'seed 96B -> address');
    assert.equal(qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32).address.toLowerCase(), TEST_SEED_ADDRESS_32, 'seed 64B -> address');
    assert.equal(qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36).address.toLowerCase(), TEST_SEED_ADDRESS_36, 'seed 72B -> address');
    assert.equal(qcsdk.openWalletFromSeed(new Uint8Array(TEST_SEED_ARRAY_48)).address.toLowerCase(), TEST_SEED_ADDRESS, 'seed Uint8Array -> address');

    // openWalletFromSeed matches openWalletFromSeedWords.
    assert.equal(
        qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32).address.toLowerCase(),
        qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_32).address.toLowerCase(),
        'seed==seedWords (32)',
    );
    assert.equal(
        qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36).address.toLowerCase(),
        qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_36).address.toLowerCase(),
        'seed==seedWords (36)',
    );

    // openWalletFromSeed negatives.
    assert.equal(qcsdk.openWalletFromSeed(null), null, 'openWalletFromSeed(null)');
    assert.equal(qcsdk.openWalletFromSeed([]), null, 'openWalletFromSeed([])');
    assert.equal(qcsdk.openWalletFromSeed([1, 2, 3, 4, 5]), null, 'openWalletFromSeed(wrong length)');
    assert.equal(qcsdk.openWalletFromSeed('not an array'), null, 'openWalletFromSeed(string)');

    // serializeSeedAsEncryptedWallet roundtrip (V5) preserves address + preExpansionSeed.
    const seedJson = qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, PASSPHRASE);
    assert.ok(seedJson && typeof seedJson === 'string', 'serializeSeedAsEncryptedWallet returns string');
    const seedWallet = qcsdk.deserializeEncryptedWallet(seedJson, PASSPHRASE);
    assert.equal(seedWallet.address.toLowerCase(), TEST_SEED_ADDRESS_32, 'seed-encrypted roundtrip address');
    assert.ok(seedWallet.preExpansionSeed != null && seedWallet.preExpansionSeed.length === 64, 'preExpansionSeed preserved');
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(null, PASSPHRASE), null, 'null seed -> null');
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, 'short'), null, 'short passphrase -> null');

    // publicKeyFromPrivateKey / addressFromPublicKey consistency.
    const w = qcsdk.newWallet();
    const pubHex = qcsdk.publicKeyFromPrivateKey(w.privateKey);
    assert.ok(pubHex && typeof pubHex === 'string', 'publicKeyFromPrivateKey returns hex');
    assert.equal(qcsdk.addressFromPublicKey(w.publicKey).toLowerCase(), w.address.toLowerCase(), 'addressFromPublicKey matches wallet');
}

module.exports = { name: 'wallet/keystore/seed', needsInit: true, run };
