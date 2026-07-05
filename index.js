//index.js

/**
 * Quantum Coin Blockchain SDK
 * @module quantum-coin-js-sdk
 * @description Quantum Coin JS SDK provides low level functionality to interact with the Quantum Coin Blockchain.
 * {@link https://github.com/quantumcoinproject/quantum-coin-js-sdk/tree/main/example|Example Project} 
 * @example
 * 
 * Requires Node.js version v20.18.1 or higher
 * 
 * Installation:
 * npm install quantum-coin-js-sdk --save
 * 
 * //Adding reference:
 * var qcsdk = require('quantum-coin-js-sdk');
 *
 * //Example initialization with defaults for mainnet
 * //Initialize the SDK first before invoking any other function
 * qcsdk.initialize(null).then((initResult) => {
 *   
 * }
 *
 * //Example initialization with specific values
 * //Initialize the SDK first before invoking any other function
 * var clientConfigVal = new qcsdk.Config(123123); //Initialization with Mainnet Config (Block Explorer: https://QuantumScan.com)
 * qcsdk.initialize(clientConfigVal).then((initResult) => {
 *
 * }
 * Example Project: https://github.com/quantumcoinproject/quantum-coin-js-sdk/tree/main/example
 * 
 */

var wasmexec = require('./wasm_exec');
var wasmBase64 = require('./wasmBase64');
var seedwords = require('seed-words');

var config = null;
var isInitialized = false;
/** CIRCL WASM namespace (set after InitAccountsWebAssembly). Use getCircl() for access. */
var circl = null;
const DEFAULT_GAS = 21000;

// Dynamic-fee gas pricing (mirrors quantum-coin-go core/types/dynamic_fee_tx.go).
// Base dynamic price = defaults.DEFAULT_PRICE / 10. BigInt is used because the
// level multipliers push the value above Number.MAX_SAFE_INTEGER.
const DEFAULT_PRICE_WEI = 47619047619047600n;
const DYNAMIC_BASE_GAS_PRICE_WEI = DEFAULT_PRICE_WEI / 10n;
const SIGNING_CONTEXT_LEVEL1_MULTIPLIER = 20n;
const SIGNING_CONTEXT_LEVEL2_MULTIPLIER = 30n;

// Key type and seed constants (CIRCL migration; see pqc-circl-migration.md)
const KEY_TYPE_HYBRIDEDMLDSASLHDSA = 3;
const KEY_TYPE_HYBRIDEDMLDSASLHDSA5 = 5;
const SEED_WORD_LIST_LENGTH_HYBRIDEDS = 48;
const SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA5 = 36;
const SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA = 32;
const BASE_SEED_BYTES_HYBRIDEDS = 96;
const BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA5 = 72;
const BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA = 64;
const MIN_PASSPHRASE_LENGTH = 12;
const SCRYPT_SUPPORTED_N = 262144;
const SCRYPT_SUPPORTED_R = 8;
const SCRYPT_SUPPORTED_P = 1;
const SCRYPT_SUPPORTED_DKLEN = 32;
const INVALID_KEY_TYPE = -1001;
const CIRCL_CRYPTO_FAILURE = -1002;
const EXPECTED_WASM_SHA256 = "8902a254d13930a8c82aa256468f7a72d613888b9032afb47e9430223886a052";

/**
 * @class
 * @constructor
 * @public
 * @classdesc This is the configuration class required to initialize the Quantum Coin SDK for offline operations such as wallet management and transaction signing.
 */
class Config {
    /**
     * Creates a config class
     * @param {number} chainId - The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324.
     */
    constructor(chainId) {
        /**
         * The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324.
         * @type {number}
         * @public
        */
        this.chainId = chainId;
    }
}

/**
 * @class
 * @constructor
 * @public
 * @classdesc This class represents a Wallet. Use the verifyWallet function to verify if a wallet is valid. Verifying the wallet is highly recommended, especially if it comes from an untrusted source. For more details on the underlying cryptography of the Wallet, see https://github.com/quantumcoinproject/circl
 */
class Wallet {
    /**
     * Creates a Wallet class. The constructor does not verify the wallet. To verify a wallet, call the verifyWallet function explicitly.
     * @param {string} address - Address of the wallet
     * @param {number[]} privateKey - Private Key byte array of the wallet
     * @param {number[]} publicKey - Public Key byte array of the wallet
     * @param {Uint8Array|number[]|null} [preExpansionSeed=null] - Optional pre-expansion seed bytes. Non-null only for seed-derived wallets.
     */
    constructor(address, privateKey, publicKey, preExpansionSeed) {

        /**
         * Address of the wallet. Is 66 bytes in length including 0x (if the wallet is valid).
         * @type {string}
         * @public
        */
        this.address = address;

        /**
         * Private Key byte array of the wallet. Is 4064 bytes in length (if the wallet is valid).
         * @type {number[]}
         * @public
        */
        this.privateKey = privateKey;

        /**
         * Public Key byte array of the wallet. Is 1408 bytes in length (if the wallet is valid).
         * @type {number[]}
         * @public
        */
        this.publicKey = publicKey;

        /**
         * Pre-expansion seed bytes. Can be null if the wallet was not created from a seed.
         * @type {Uint8Array|number[]|null}
         * @public
        */
        this.preExpansionSeed = preExpansionSeed || null;
    }
}

/**
 * @class
 * @constructor
 * @public
 * @classdesc This class represents a result from invoking the signSendCoinTransaction function.
 */
class SignResult {
    constructor(resultCode, txnHash, txnData) {
        /**
         * Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.
         * @type {number}
         * @public
        */
        this.resultCode = resultCode;

        /**
         * Hash of the Transaction, to uniquely identify it. Is 66 bytes in length including 0x. This value is null if the value of resultCode is not 0.
         * @type {string}
         * @public
        */
        this.txnHash = txnHash;

        /**
         * A payload representing the signed transaction. 
         * To actually send a transaction, this payload can then be broadcast to the blockchain from a connected device (for example, via a relay or RPC endpoint). 
         * This value is null if the value of resultCode is not 0.
         * @type {string}
         * @public
        */
        this.txnData = txnData;
    }
}

/**
 * @class
 * @constructor
 * @public
 * @classdesc This class represents a signing request that can be passed to signTransaction.
 */
class TransactionSigningRequest {
    /**
     * Creates a TransactionSigningRequest class.
     * @param {Wallet} wallet - The wallet with which the transaction has to be signed. The constructor does not verify the wallet. To verify a wallet, call the verifyWallet function explicitly.
     * @param {string} toAddress - The address to which the transaction request is made. Can be null (for example, for contract creation).
     * @param {string|BigInt} valueInWei - The value in wei-units. Can be provided as either a hex string (including 0x prefix) or a BigInt. For example, to represent 1 coin, which is 1000000000000000000 in wei-units, set the value to "0xDE0B6B3A7640000" or BigInt("1000000000000000000"). {@link /example/conversion-example.js|Conversion Examples}
     * @param {number} nonce - A monotonically increasing number representing the nonce of the account signing the transaction. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1.
     * @param {string} data - An optional hex string (including 0x) that represents the contract data. Can be null if not invoking or creating a contract.
     * @param {number} gasLimit - A limit of gas to be used. Set 21000 for basic non smart contract transactions.
     * @param {string} remarks - An optional hex string (including 0x) that represents a remark (such as a comment). Maximum 32 bytes length (in bytes). Warning, do not store any sensitive information in this field.
     * @param {number|null} chainId - The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. If null, the chainId specified in the initialize() function will be used.
    * @param {number|null} signingContext - It is recommended that you pass null for this parameter, unless the context needs to be set explicitly. Signing context determines the cryptographic scheme used to sign. The wallet key type should compatible with the signing context. Applicable values are 0,1,2. Default value if not specified will be determined dynamically from the wallet key type. Signing context 1,2 will incur additional gas fee. For information on the schemes, see https://github.com/quantumcoinproject/circl?tab=readme-ov-file#hybrid-schemes
     * Signing context 0: Scheme used is hybrid-ed-mldsa-slhdsa compact (scheme id 3)
     * Signing context 1: Scheme used is hybrid-ed-mldsa-slhdsa-5 (scheme id 5 : 20x the gas fee of scheme 0)
     * Signing context 2: hybrid-ed-mldsa-slhdsa full (scheme id 4 : 30x the gas fee of scheme 0)
     */
    constructor(wallet, toAddress, valueInWei, nonce, data, gasLimit, remarks, chainId, signingContext) {
        /**
         * The wallet that should be used to sign the transaction.
         * @type {Wallet}
         * @public
         */
        this.wallet = wallet;

        /**
         * The address to which the transaction request is made. Can be null (for example, for contract creation).
         * @type {string|null}
         * @public
         */
        this.toAddress = toAddress;

        /**
         * The value in wei-units. Can be provided as either a hex string (including 0x prefix) or a BigInt. For example, to represent 1 coin, which is 1000000000000000000 in wei-units, set the value to "0xDE0B6B3A7640000" or BigInt("1000000000000000000"). {@link /example/conversion-example.js|Conversion Examples}
         * @type {string|BigInt|null}
         * @public
         */
        this.valueInWei = valueInWei;

        /**
         * A monotonically increasing number representing the nonce of the account signing the transaction. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1.
         * @type {number}
         * @public
         */
        this.nonce = nonce;

        /**
         * An optional hex string (including 0x) that represents the contract data. Can be null if not invoking or creating a contract.
         * @type {string|null}
         * @public
         */
        this.data = data;

        /**
         * A limit of gas to be used. Set 21000 for basic non smart contract transactions.
         * @type {number}
         * @public
         */
        this.gasLimit = gasLimit;

        /**
         * An optional hex string (including 0x) that represents a remark (such as a comment). Maximum 32 bytes length (in bytes). Warning, do not store any sensitive information in this field.
         * @type {string|null}
         * @public
         */
        this.remarks = remarks;

        /**
         * The chain id of the blockchain. Mainnet chainId is 123123. If null, the chainId specified in the initialize() function will be used.
         * @type {number|null}
         * @public
         */
        this.chainId = chainId;

        /**
         * It is recommended that you pass null for this parameter, unless the context needs to be set explicitly. Signing context determines the cryptographic scheme used to sign. Gas fee varies by context.
         * @type {number|null}
         * @public
         */
        this.signingContext = signingContext;
    }
}

/**
 * @class
 * @constructor
 * @public
 * @classdesc This class represents a result from invoking the packMethodData or unpackMethodData functions.
 */
class PackUnpackResult {
    /**
     * Creates a PackUnpackResult class.
     * @param {string} error - Error message if any. Empty string if no error.
     * @param {string} result - The actual result as a string. Empty string if there was an error.
     */
    constructor(error, result) {
        /**
         * Error message if any. Empty string if no error.
         * @type {string}
         * @public
         */
        this.error = error;

        /**
         * The actual result as a string. Empty string if there was an error.
         * @type {string}
         * @public
         */
        this.result = result;
    }
}

/**
 * @class EventLogEncodeResult
 * @classdesc This class represents a result from invoking the encodeEventLog function.
 */
class EventLogEncodeResult {
    /**
     * Creates an EventLogEncodeResult class.
     * @param {string} error - Error message if any. Empty string if no error.
     * @param {Object|null} result - The actual result object with topics and data. Null if there was an error.
     * @param {string[]} result.topics - Array of topic hex strings (with 0x prefix)
     * @param {string} result.data - Hex-encoded data string (with 0x prefix)
     */
    constructor(error, result) {
        /**
         * Error message if any. Empty string if no error.
         * @type {string}
         * @public
         */
        this.error = error;

        /**
         * The actual result object with topics and data. Null if there was an error.
         * @type {Object|null}
         * @property {string[]} topics - Array of topic hex strings (with 0x prefix)
         * @property {string} data - Hex-encoded data string (with 0x prefix)
         * @public
         */
        this.result = result;
    }
}

function isLargeNumber(val) {
    if (val === null) { 
        return false;
    }
    if (typeof val === 'string' || val instanceof String) {
        var rgx = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/;
        return Boolean(val.match(rgx));
    }
    return false;
}

function getGlobalObject() {
    return (typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);
}

async function InitAccountsWebAssembly() {
    const GoCtor = getGlobalObject().Go;
    if (typeof GoCtor !== 'function') {
        throw new Error("Go WASM runtime not found (wasm_exec.js not loaded)");
    }
    const go = new GoCtor();
    let mod, inst;
    var base64wasm = wasmBase64.getBase64Wasm();

    const base64bytes = atob(base64wasm);
    if (base64bytes === null || base64bytes === undefined || base64bytes.length === 0) {
        throw new Error("Error parsing base64");
    }
    const wasmBytes = Uint8Array.from(atob(base64wasm), c => c.charCodeAt(0));

    // Platform-agnostic integrity check via the Web Crypto API (available in
    // browsers and Node 16+ as globalThis.crypto.subtle). Runs before the WASM
    // is initialized, so it cannot use the WASM's own Sha256.
    const digest = await getGlobalObject().crypto.subtle.digest('SHA-256', wasmBytes);
    const hashHex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex !== EXPECTED_WASM_SHA256) {
        throw new Error("WASM integrity check failed");
    }

    const g = getGlobalObject();
    if (g) {
        delete g.circl;
    }

    let result = await WebAssembly.instantiate(wasmBytes, go.importObject);
    mod = result.module;
    inst = result.instance;
    go.run(inst);

    if (g && g.circl) {
        circl = g.circl;
        delete g.circl;
        if (circl.hybridedmldsaslhdsa) Object.freeze(circl.hybridedmldsaslhdsa);
        if (circl.hybridedmldsaslhdsa5) Object.freeze(circl.hybridedmldsaslhdsa5);
        if (circl.hybridedmldsaslhdsa5) Object.freeze(circl.hybridedmldsaslhdsa5);
        if (circl.hybrideds) Object.freeze(circl.hybrideds);
        Object.freeze(circl);
    }
}

function validateCryptoRandom() {
    if (!circl || !circl.cryptoRandom) {
        return false;
    }

    const sampleSize = 64;
    const res1 = circl.cryptoRandom(sampleSize);
    const res2 = circl.cryptoRandom(sampleSize);

    if (!res1 || res1.error || !res1.result || res1.result.length !== sampleSize) {
        return false;
    }
    if (!res2 || res2.error || !res2.result || res2.result.length !== sampleSize) {
        return false;
    }

    const a = res1.result instanceof Uint8Array ? res1.result : new Uint8Array(res1.result);
    const b = res2.result instanceof Uint8Array ? res2.result : new Uint8Array(res2.result);

    let identical = true;
    for (let i = 0; i < sampleSize; i++) {
        if (a[i] !== b[i]) { identical = false; break; }
    }
    if (identical) {
        return false;
    }

    let aAllZero = true, bAllZero = true;
    for (let i = 0; i < sampleSize; i++) {
        if (a[i] !== 0) aAllZero = false;
        if (b[i] !== 0) bAllZero = false;
    }
    if (aAllZero || bAllZero) {
        return false;
    }

    const seen = new Set(a);
    if (seen.size < 48) {
        return false;
    }

    return true;
}

/**
 * The initialize function has to be called before attempting to invoke any other function. This function should be called only once.
 *
 * @async
 * @function initialize
 * @param {Config|undefined} clientConfig - A configuration represented by the Config class. A default configuration is used, if not specified.
 * @return {Promise<boolean>} Returns a promise of type boolean; true if the initialization succeeded, else false.
 */
async function initialize(clientConfig) {
    if (isInitialized === true) {
        return false;
    }
    if (clientConfig === null || clientConfig === undefined) {
        clientConfig = new Config(123123); //default
    }
    if (clientConfig.chainId === null || clientConfig.chainId === undefined) {
        return false;
    }
    await InitAccountsWebAssembly();
    if (!validateCryptoRandom()) {
        throw new Error("CSPRNG validation failed");
    }
    config = clientConfig;
    isInitialized = await seedwords.initialize();

    return isInitialized;
}

/**
 * The isAddressValid function validates whether an address is valid or not. An address is of length 66 characters including 0x.
 *
 * @function isAddressValid
 * @param {string} address - A string representing the address to validate.
 * @return {boolean} Returns true if the address validation succeeded, else returns false.
 */
function isAddressValid(address) {
    if (isInitialized === false) {
        return -1000;
    }

    if (address === null) {
        return false;
    }

    if (address.length !== 66) {
        return false;
    }

    if (typeof address === 'string' || address instanceof String) {
        return IsValidAddress(address);
    }

    return false;
}

/**
 * Internal: get key type (KEY_TYPE_HYBRIDEDMLDSASLHDSA or KEY_TYPE_HYBRIDEDMLDSASLHDSA5) from private key length.
 * @param {number[]|Uint8Array} privateKey - Wallet private key bytes.
 * @returns {number|null} KEY_TYPE_HYBRIDEDMLDSASLHDSA (3), KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5), or null on error.
 */
function getKeyTypeFromPrivateKey(privateKey) {
    if (circl == null || !privateKey || typeof privateKey.length !== 'number') {
        return null;
    }
    const len = privateKey.length;
    const hybridNs = circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5;
    if (hybridNs && len === hybridNs.PrivateKeySize) {
        return KEY_TYPE_HYBRIDEDMLDSASLHDSA;
    }
    if (hybrid5Ns && len === hybrid5Ns.PrivateKeySize) {
        return KEY_TYPE_HYBRIDEDMLDSASLHDSA5;
    }
    return null;
}

/**
 * Internal: get key type (KEY_TYPE_HYBRIDEDMLDSASLHDSA or KEY_TYPE_HYBRIDEDMLDSASLHDSA5) from public key length.
 * @param {number[]|Uint8Array} publicKey - Public key bytes.
 * @returns {number|null} KEY_TYPE_HYBRIDEDMLDSASLHDSA (3), KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5), or null on error.
 */
function getKeyTypeFromPublicKey(publicKey) {
    if (circl == null || !publicKey || typeof publicKey.length !== 'number') {
        return null;
    }
    const len = publicKey.byteLength !== undefined ? publicKey.byteLength : publicKey.length;
    const hybridNs = circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5;
    if (hybridNs && typeof hybridNs.PublicKeySize === 'number' && len === hybridNs.PublicKeySize) {
        return KEY_TYPE_HYBRIDEDMLDSASLHDSA;
    }
    if (hybrid5Ns && typeof hybrid5Ns.PublicKeySize === 'number' && len === hybrid5Ns.PublicKeySize) {
        return KEY_TYPE_HYBRIDEDMLDSASLHDSA5;
    }
    return null;
}

/**
 * Convert key (number[] or Uint8Array) to Uint8Array for CIRCL.
 * @param {number[]|Uint8Array} key - Key bytes.
 * @returns {Uint8Array}
 */
function toUint8Array(key) {
    if (key instanceof Uint8Array) return key;
    return new Uint8Array(key);
}

/**
 * The newWallet function creates a new Wallet.
 * @function newWallet
 * @param {number|null} keyType - Optional. KEY_TYPE_HYBRIDEDMLDSASLHDSA (3) or KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5). null/undefined defaults to 3.
 * @return {Wallet|number} Returns a Wallet object, or -1000 (not initialized), -1001 (invalid key type), -1002 (crypto failure).
 */
function newWallet(keyType) {
    if (isInitialized === false) {
        return -1000;
    }
    if (circl == null) {
        return CIRCL_CRYPTO_FAILURE;
    }
    if (keyType === null || keyType === undefined) {
        keyType = KEY_TYPE_HYBRIDEDMLDSASLHDSA;
    }
    const hybridNs = circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5;
    let res;
    if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA && hybridNs) {
        res = hybridNs.generateKey();
    } else if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 && hybrid5Ns) {
        res = hybrid5Ns.generateKey();
    } else {
        return INVALID_KEY_TYPE;
    }
    if (res && res.error) {
        return CIRCL_CRYPTO_FAILURE;
    }
    if (!res || !res.result || !res.result.publicKey || !res.result.privateKey) {
        return CIRCL_CRYPTO_FAILURE;
    }
    const publicKey = res.result.publicKey instanceof Uint8Array ? Array.from(res.result.publicKey) : res.result.publicKey;
    const privateKey = res.result.privateKey instanceof Uint8Array ? Array.from(res.result.privateKey) : res.result.privateKey;
    const address = PublicKeyToAddress(publicKey);
    return new Wallet(address, privateKey, publicKey);
}

/**
 * The newWalletSeedWords function creates a new wallet seed word list. The returned array can then be passed to the openWalletFromSeedWords function to create a new wallet.
 *
 * @function newWalletSeedWords
 * @param {number|null} keyType - Optional. KEY_TYPE_HYBRIDEDMLDSASLHDSA (3) or KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5). null/undefined defaults to 3.
 * @return {string[]|number|null} Returns an array of seed words (32 or 36 words depending on keyType). Returns -1000 if not initialized, null on failure.
 */
function newWalletSeedWords(keyType) {
    if (isInitialized === false) {
        return -1000;
    }
    if (circl == null || !circl.cryptoRandom) {
        return null;
    }
    if (keyType === null || keyType === undefined) {
        keyType = KEY_TYPE_HYBRIDEDMLDSASLHDSA;
    }
    if (keyType !== KEY_TYPE_HYBRIDEDMLDSASLHDSA && keyType !== KEY_TYPE_HYBRIDEDMLDSASLHDSA5) {
        return null;
    }
    const baseSeedLen = keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 ? BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA5 : BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA;
    const res = circl.cryptoRandom(baseSeedLen);
    if (res && res.error) {
        return null;
    }
    if (!res || !res.result || res.result.length !== baseSeedLen) {
        return null;
    }
    const seedArray = res.result instanceof Uint8Array ? res.result : new Uint8Array(res.result);
    const wordList = seedwords.getWordListFromSeedArray(seedArray);
    const expectedLen = keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 ? SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA5 : SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA;
    if (wordList == null || wordList.length !== expectedLen) {
        return null;
    }
    return wordList;
}

/**
 * The openWalletFromSeed function creates a wallet from a raw seed byte array.
 * Determines the key scheme from the array length: 96 bytes (hybrideds), 72 bytes (hybrid5), or 64 bytes (hybrid).
 *
 * @function openWalletFromSeed
 * @param {Array<number>|Uint8Array} seedArray - The raw seed bytes. Length 96, 72, or 64 depending on scheme.
 * @return {Wallet|number|null} Returns a Wallet object. Returns -1000 if not initialized, null if the operation failed.
 */
function openWalletFromSeed(seedArray) {
    if (isInitialized === false) {
        return -1000;
    }
    if (seedArray == null || typeof seedArray.length !== 'number') {
        return null;
    }
    const len = seedArray.length;
    if (len !== BASE_SEED_BYTES_HYBRIDEDS && len !== BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA5 && len !== BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA) {
        return null;
    }
    if (circl == null) {
        return null;
    }
    let expandedRes;
    let keyPairRes;
    const seedU8 = seedArray instanceof Uint8Array ? seedArray : new Uint8Array(seedArray);
    if (len === BASE_SEED_BYTES_HYBRIDEDS) {
        const ns = circl.hybrideds;
        if (!ns) return null;
        expandedRes = ns.expandSeed(seedU8);
        if (expandedRes && expandedRes.error) return null;
        if (!expandedRes || !expandedRes.result) return null;
        keyPairRes = ns.newKeyFromSeed(expandedRes.result);
    } else if (len === BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA5) {
        const ns = circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5;
        if (!ns) return null;
        expandedRes = ns.expandSeed(seedU8);
        if (expandedRes && expandedRes.error) return null;
        if (!expandedRes || !expandedRes.result) return null;
        keyPairRes = ns.newKeyFromSeed(expandedRes.result);
    } else {
        const ns = circl.hybridedmldsaslhdsa;
        if (!ns) return null;
        expandedRes = ns.expandSeed(seedU8);
        if (expandedRes && expandedRes.error) return null;
        if (!expandedRes || !expandedRes.result) return null;
        keyPairRes = ns.newKeyFromSeed(expandedRes.result);
    }
    if (keyPairRes && keyPairRes.error) return null;
    if (!keyPairRes || !keyPairRes.result || !keyPairRes.result.publicKey || !keyPairRes.result.privateKey) return null;
    const publicKey = keyPairRes.result.publicKey instanceof Uint8Array ? Array.from(keyPairRes.result.publicKey) : keyPairRes.result.publicKey;
    const privateKey = keyPairRes.result.privateKey instanceof Uint8Array ? Array.from(keyPairRes.result.privateKey) : keyPairRes.result.privateKey;
    const address = PublicKeyToAddress(publicKey);
    return new Wallet(address, privateKey, publicKey, seedU8);
}

/**
 * The openWalletFromSeedWords function creates a wallet from a seed word list. The seed word list is available for wallets created from Desktop/Web/Mobile wallets.
 * Supports 48 words (hybrideds), 36 words (hybrid5), or 32 words (hybrid) per seed length.
 *
 * @function openWalletFromSeedWords
 * @param {string[]} seedWordList - An array of seed words. Length 48, 36, or 32 depending on scheme.
 * @return {Wallet|number|null} Returns a Wallet object. Returns -1000 if not initialized, null if the operation failed.
 */
function openWalletFromSeedWords(seedWordList) {
    if (isInitialized === false) {
        return -1000;
    }
    if (seedWordList == null || typeof seedWordList.length !== 'number') {
        return null;
    }
    const len = seedWordList.length;
    if (len !== SEED_WORD_LIST_LENGTH_HYBRIDEDS && len !== SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA5 && len !== SEED_WORD_LIST_LENGTH_HYBRIDEDMLDSASLHDSA) {
        return null;
    }
    const seedArray = seedwords.getSeedArrayFromWordList(seedWordList);
    if (seedArray == null || seedArray.length === undefined) {
        return null;
    }
    return openWalletFromSeed(seedArray);
}

/**
 * The deserializeEncryptedWallet function opens a wallet backed-up using an application such as the Desktop/Mobile/CLI/Web wallet. This function can take upto a minute or so to execute. You should open wallets only from trusted sources.
 *
 * @function deserializeEncryptedWallet
 * @param {string} walletJsonString - The json string from a wallet file.
 * @param {string} passphrase - The passphrase used to encrypt the wallet.
 * @return {Wallet} Returns a Wallet object. Returns null if opening the wallet fails.
 */
function deserializeEncryptedWallet(walletJsonString, passphrase) {
    if (isInitialized === false) {
        return -1000;
    }

    if (walletJsonString == null || passphrase == null) {
        return null;
    }

    if (typeof walletJsonString === 'string' || walletJsonString instanceof String) {

    } else {
        return null;
    }

    if (typeof passphrase === 'string' || passphrase instanceof String) {

    } else {
        return null;
    }

    let walletJsonObj;
    try {
        walletJsonObj = JSON.parse(walletJsonString);
    } catch (e) {
        return null;
    }

    if (walletJsonObj == null) {
        return null;
    }

    if (walletJsonObj.address == null) {
        return null;
    }

    let keyPairString = JsonToWalletKeyPair(walletJsonString, passphrase);
    if (keyPairString == null) {
        return null;
    }

    let keyPairSplit = keyPairString.split(",");
    if (keyPairSplit.length < 2) {
        return null;
    }

    let privateKeyArray = base64ToBytes(keyPairSplit[0]);
    let publicKeyArray = base64ToBytes(keyPairSplit[1]);
    let preExpansionSeed = null;
    if (keyPairSplit.length >= 3 && keyPairSplit[2].length > 0) {
        preExpansionSeed = base64ToBytes(keyPairSplit[2]);
    }
    let address = PublicKeyToAddress(publicKeyArray);
    if (address == null) {
        return null;
    }

    if (typeof address === 'string' || address instanceof String) {

    } else {
        return null;
    }

    let addressCheck = "0x" + walletJsonObj.address.toLowerCase();
    if (addressCheck !== address.toLowerCase()) {
        return null;
    }

    let wallet = new Wallet(address, privateKeyArray, publicKeyArray, preExpansionSeed);

    return wallet;
}

/**
 * The serializeEncryptedWallet function encrypts and serializes a Wallet object to a JSON string readable by the Desktop/Mobile/Web/CLI wallet applications. You can save this string to a file and open the file in one of these wallet applications. You may also open this string using the deserializeEncryptedWallet function. If you loose the passphrase, you will be unable to open the wallet. This function can take upto a minute or so to execute.
 *
 * @function serializeEncryptedWallet
 * @param {Wallet} wallet - A Wallet object representing the wallet to serialize.
 * @param {string} passphrase - A passphrase used to encrypt the wallet. It should atleast be 12 characters long.
 * @return {string} Returns the Wallet in JSON string format. If the wallet is invalid, null is returned.
 */
function serializeEncryptedWallet(wallet, passphrase) {
    if(verifyWallet(wallet) === false) {
        return null;
    }

    if (passphrase == null) {
        return null;
    }

    if (typeof passphrase === 'string' || passphrase instanceof String) {

    } else {
        return null;
    }

    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
        return null;
    }

    let walletJsonString;
    if (wallet.preExpansionSeed != null && wallet.preExpansionSeed.length > 0) {
        const seedU8 = wallet.preExpansionSeed instanceof Uint8Array ? wallet.preExpansionSeed : new Uint8Array(wallet.preExpansionSeed);
        const result = EncryptPreExpansionSeed(seedU8, passphrase);
        if (result == null || result instanceof Error) {
            return null;
        }
        walletJsonString = result;
    } else {
        walletJsonString = KeyPairToWalletJson(wallet.privateKey, wallet.publicKey, passphrase);
    }

    let walletJson = JSON.parse(walletJsonString);
    let addressCheck = "0x" + walletJson.address;
    if (addressCheck.toLowerCase() !== wallet.address.toLowerCase()) {
        return null;
    }

    return walletJsonString;
}

/**
 * The serializeSeedAsEncryptedWallet function encrypts a raw seed byte array into a wallet JSON string
 * that can be opened with deserializeEncryptedWallet or Desktop/Mobile/Web/CLI wallet applications.
 * The seed is stored in its pre-expansion form (version 5 wallet format). This function can take
 * up to a minute or so to execute due to key derivation.
 *
 * @function serializeSeedAsEncryptedWallet
 * @param {Array<number>|Uint8Array} seedArray - The raw seed bytes. Length must be 96, 72, or 64 depending on scheme.
 * @param {string} passphrase - A passphrase used to encrypt the wallet. Must be at least 12 characters long.
 * @return {string|number|null} Returns the encrypted wallet JSON string. Returns -1000 if not initialized, null if the operation failed.
 */
function serializeSeedAsEncryptedWallet(seedArray, passphrase) {
    if (isInitialized === false) {
        return -1000;
    }
    if (seedArray == null || typeof seedArray.length !== 'number') {
        return null;
    }
    const len = seedArray.length;
    if (len !== BASE_SEED_BYTES_HYBRIDEDS && len !== BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA5 && len !== BASE_SEED_BYTES_HYBRIDEDMLDSASLHDSA) {
        return null;
    }
    if (passphrase == null) {
        return null;
    }
    if (typeof passphrase !== 'string' && !(passphrase instanceof String)) {
        return null;
    }
    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
        return null;
    }
    const seedU8 = seedArray instanceof Uint8Array ? seedArray : new Uint8Array(seedArray);
    const result = EncryptPreExpansionSeed(seedU8, passphrase);
    if (result == null || result instanceof Error) {
        return null;
    }
    return result;
}

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

function isByteArray(array) {
    if (!array) return false;
    if (array.byteLength !== undefined) return true;
    if (typeof array.length === 'number' && array.length >= 0) return true;
    return false;
}

// Normalizes a bytes-like value (Uint8Array or number[]) to a Uint8Array.
// Returns null for unsupported inputs.
function toU8Bytes(value) {
    if (value instanceof Uint8Array) {
        return value;
    }
    if (Array.isArray(value)) {
        return Uint8Array.from(value);
    }
    return null;
}

// Normalizes a secret-like value (string -> UTF-8 bytes, or bytes-like) to a
// Uint8Array. Returns null for unsupported inputs.
function toU8Secret(value) {
    if (typeof value === 'string' || value instanceof String) {
        return new TextEncoder().encode(String(value));
    }
    return toU8Bytes(value);
}

/**
 * The verifyWallet function verifies whether a Wallet is valid or not. To mitigate spoofing and other attachs, it is highly recommended to verify a wallet, especially if it is from an untrusted source.
 *
 * @function verifyWallet
 * @param {Wallet} wallet - A Wallet object representing the wallet to verify.
 * @return {boolean} Returns true if the Wallet verification succeeded, else returns false.
 */
function verifyWallet(wallet) {
    if (isInitialized === false) {
        return -1000;
    }
    if (wallet === null || wallet.address === null || wallet.privateKey === null || wallet.publicKey === null) {
        return false;
    }
    if (isAddressValid(wallet.address) === false) {
        return false;
    }
    if (isByteArray(wallet.privateKey) === false) {
        return false;
    }
    if (isByteArray(wallet.publicKey) === false) {
        return false;
    }
    const keyType = getKeyTypeFromPrivateKey(wallet.privateKey);
    if (keyType == null) {
        return false;
    }
    const hybridNs = circl && circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl && (circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5);
    if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA && hybridNs && wallet.privateKey.length !== hybridNs.PrivateKeySize) {
        return false;
    }
    if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 && hybrid5Ns && wallet.privateKey.length !== hybrid5Ns.PrivateKeySize) {
        return false;
    }
    const address = PublicKeyToAddress(wallet.publicKey);
    if (address !== wallet.address) {
        return false;
    }
    const message = new TextEncoder().encode("verifyverifyverifyverifyverifyok");
    const privU8 = toUint8Array(wallet.privateKey);
    const pubU8 = toUint8Array(wallet.publicKey);
    let sigRes;
    let verRes;
    if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA && hybridNs) {
        sigRes = hybridNs.sign(privU8, message);
        if (sigRes && sigRes.error) {
            return false;
        }
        verRes = hybridNs.verify(pubU8, message, sigRes.result);
    } else if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 && hybrid5Ns) {
        sigRes = hybrid5Ns.sign(privU8, message);
        if (sigRes && sigRes.error) {
            return false;
        }
        verRes = hybrid5Ns.verify(pubU8, message, sigRes.result);
    } else {
        return false;
    }
    if (verRes && verRes.error) {
        return false;
    }
    if (!(verRes && verRes.result === true)) {
        return false;
    }
    return true;
}

/**
 * The serializeWallet function serializes a Wallet object to a JSON string. You should encrypt the string before saving it to disk or a database.
 *
 * @function serializeWallet
 * @param {Wallet} wallet - A Wallet object representing the wallet to serialize.
 * @return {string} Returns the Wallet in JSON string format. If the wallet is invalid, null is returned.
 */
function serializeWallet(wallet) {
    if (isInitialized === false) {
        return -1000;
    }

    if(verifyWallet(wallet) === false) {
        return null;
    }

    var walletJson = {
        "address": wallet.address,
        "privateKey": bytesToBase64(wallet.privateKey),
        "publicKey": bytesToBase64(wallet.publicKey),
    }

    if (wallet.preExpansionSeed != null && wallet.preExpansionSeed.length > 0) {
        walletJson.preExpansionSeed = bytesToBase64(wallet.preExpansionSeed);
    }

    return JSON.stringify(walletJson);
}

/**
 * The deserializeWallet function creates a Wallet object from a JSON string. 
 *
 * @function deserializeWallet
 * @param {string} walletJson - A JSON string representing the wallet to deserialize.
 * @return {Wallet|null} Returns the Wallet corresponding to the walletJson. If the wallet is invalid or the JSON is malformed, null is returned.
 */
function deserializeWallet(walletJson) {
    if (isInitialized === false) {
        return -1000;
    }

    try {
        var tempWallet = JSON.parse(walletJson);
        if (tempWallet == null || typeof tempWallet !== 'object') {
            return null;
        }

        var preExpansionSeed = null;
        if (tempWallet.preExpansionSeed != null && tempWallet.preExpansionSeed.length > 0) {
            preExpansionSeed = base64ToBytes(tempWallet.preExpansionSeed);
        }

        var wallet = new Wallet(tempWallet.address, base64ToBytes(tempWallet.privateKey), base64ToBytes(tempWallet.publicKey), preExpansionSeed);

        if (verifyWallet(wallet) === false) {
            return null;
        }

        return wallet;
    } catch (e) {
        return null;
    }
}

function transactionGetSigningHash(fromaddress, nonce, toaddress, amount, gas, chainid, data) {
    let messageData = TxnSigningHash(fromaddress, nonce, toaddress, amount, gas, chainid, data);
    var messageBytes = [];
    for (var i = 0; i < messageData.length; ++i) {
        messageBytes.push(messageData.charCodeAt(i));
    }
    return messageBytes;
}

function transactionGetTransactionHash(fromaddress, nonce, toaddress, amount, gas, chainid, data, pkkey, sig) {
    const arrayPkDataToPass = pkkey.toString().split(",");
    const typedPkArray = new Uint8Array(arrayPkDataToPass.length);
    for (let i = 0; i < arrayPkDataToPass.length; i++) {
        typedPkArray[i] = arrayPkDataToPass[i];
    }
    const arraySigDataToPass = sig.toString().split(",");
    const typedSigArray = new Uint8Array(arraySigDataToPass.length);
    for (let i = 0; i < arraySigDataToPass.length; i++) {
        typedSigArray[i] = arraySigDataToPass[i];
    }
    var txnHash = TxnHash(fromaddress, nonce, toaddress, amount, gas, chainid, data, typedPkArray, typedSigArray)
    return txnHash;
}

function transactionGetData(fromaddress, nonce, toaddress, amount, gas, chainid, data, pkkey, sig) {
    const arrayPkDataToPass = pkkey.toString().split(",");
    const typedPkArray = new Uint8Array(arrayPkDataToPass.length);
    for (let i = 0; i < arrayPkDataToPass.length; i++) {
        typedPkArray[i] = arrayPkDataToPass[i];
    }
    const arraySigDataToPass = sig.toString().split(",");
    const typedSigArray = new Uint8Array(arraySigDataToPass.length);
    for (let i = 0; i < arraySigDataToPass.length; i++) {
        typedSigArray[i] = arraySigDataToPass[i];
    }
    var txnData = TxnData(fromaddress, nonce, toaddress, amount, gas, chainid, data, typedPkArray, typedSigArray)
    return txnData;
}

function transactionGetSigningHash2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext) {
    let messageDataReturn = TxnSigningHash2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext);
    if (messageDataReturn && messageDataReturn.error) {
        return null;
    }
    var messageData = messageDataReturn.result;
    var messageBytes = [];
    for (var i = 0; i < messageData.length; ++i) {
        messageBytes.push(messageData.charCodeAt(i));
    }
    return messageBytes;
}

function transactionGetTransactionHash2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext, pkkey, sig) {
    const arrayPkDataToPass = pkkey.toString().split(",");
    const typedPkArray = new Uint8Array(arrayPkDataToPass.length);
    for (let i = 0; i < arrayPkDataToPass.length; i++) {
        typedPkArray[i] = arrayPkDataToPass[i];
    }
    const arraySigDataToPass = sig.toString().split(",");
    const typedSigArray = new Uint8Array(arraySigDataToPass.length);
    for (let i = 0; i < arraySigDataToPass.length; i++) {
        typedSigArray[i] = arraySigDataToPass[i];
    }
    var txnHashReturn = TxnHash2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext, typedPkArray, typedSigArray)
    if (txnHashReturn && txnHashReturn.error) {
        return null;
    }
    return txnHashReturn.result;
}

function transactionGetData2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext, pkkey, sig) {
    const arrayPkDataToPass = pkkey.toString().split(",");
    const typedPkArray = new Uint8Array(arrayPkDataToPass.length);
    for (let i = 0; i < arrayPkDataToPass.length; i++) {
        typedPkArray[i] = arrayPkDataToPass[i];
    }
    const arraySigDataToPass = sig.toString().split(",");
    const typedSigArray = new Uint8Array(arraySigDataToPass.length);
    for (let i = 0; i < arraySigDataToPass.length; i++) {
        typedSigArray[i] = arraySigDataToPass[i];
    }
    var txnDataReturn = TxnData2(fromaddress, nonce, toaddress, valueInWeiHex, gas, chainid, data, remarks, signingContext, typedPkArray, typedSigArray)
    if (txnDataReturn && txnDataReturn.error) {
        return null;
    }
    return txnDataReturn.result;
}

/**
 * The signSendCoinTransaction function returns a signed transaction. The chainId used for signing should be provided in the initialize() function.
 * Since the gas fee for sending coins is fixed at 1000 coins, there is no option to set the gas fee explicitly.
 * This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
 * Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.
 *
 * @deprecated Use signRawTransaction instead.
 * @function signSendCoinTransaction
 * @param {Wallet} wallet - A Wallet object from which the transaction has to be sent. The address corresponding to the Wallet should have enough coins to cover gas fees as well. A minimum of 1000 coins (1000000000000000000000 wei) are required for gas fees.
 * @param {string} toAddress - The address to which the coins should be sent. 
 * @param {string} coins - The string representing the number of coins (in ether) to send. To convert between ethers and wei, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei
 * @param {number} nonce - A monotonically increasing number representing the nonce of the account. You have to carefully manage the state of the nonce to avoid sending the coins multiple times, such as when retrying after an error.
 * @return {Promise<SignResult>}  Returns a promise of type SignResult.
 */
async function signSendCoinTransaction(wallet, toAddress, coins, nonce) {
    if (isInitialized === false) {
        return -1000;
    }

    if (wallet == null || toAddress == null || coins == null || nonce == null) {
        return new SignResult(-500, null, null);
    }

    if (isAddressValid(toAddress) === false) {
        return new SignResult(-501, null, null);
    }

    if (verifyWallet(wallet) === false) {
        return new SignResult(-502, null, null);
    }

    if (isLargeNumber(coins) === false) {
        return new SignResult(-503, null, null);
    }

    let tempNonce = parseInt(nonce);
    if (Number.isInteger(tempNonce) === false) {
        return new SignResult(-504, null, null);
    }
    nonce = tempNonce;
    if (nonce < 0) {
        return new SignResult(-505, null, null);
    }

    const contractData = null;

    var txSigningHash = transactionGetSigningHash(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData);
    if (txSigningHash == null) {
        return new SignResult(-506, null, null);
    }
    const txSigningHashU8 = toUint8Array(txSigningHash);
    const hybridedsNs = circl && circl.hybrideds;
    if (!hybridedsNs) {
        return new SignResult(-507, null, null);
    }
    const sigRes = hybridedsNs.signCompact(toUint8Array(wallet.privateKey), txSigningHashU8);
    if (sigRes && sigRes.error) {
        return new SignResult(-507, null, null);
    }
    const verRes = hybridedsNs.verifyCompact(toUint8Array(wallet.publicKey), txSigningHashU8, sigRes.result);
    if (verRes && verRes.error) {
        return new SignResult(-507, null, null);
    }
    if (verRes.result !== true) {
        return new SignResult(-507, null, null);
    }
    const quantumSig = sigRes.result instanceof Uint8Array ? Array.from(sigRes.result) : sigRes.result;

    var txHashHex = transactionGetTransactionHash(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData, wallet.publicKey, quantumSig);
    if (txHashHex == null) {
        return new SignResult(-508, null, null);
    }

    var txnData = transactionGetData(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData, wallet.publicKey, quantumSig);
    if (txnData == null) {
        return new SignResult(-509, null, null);
    }

    return new SignResult(0, txHashHex, txnData);
}

/**
 * The signTransaction function returns a signed transaction. The chainId used for signing should be provided in the initialize() function.
 * Since the gas fee for sending coins is fixed at 1000 coins, there is no option to set the gas fee explicitly.
 * This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
 * Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.
 *
 * @deprecated Use signRawTransaction instead.
 * @function signTransaction
 * @param {Wallet} wallet - A Wallet object from which the transaction has to be sent. The address corresponding to the Wallet should have enough coins to cover gas fees as well. A minimum of 1000 coins (1000000000000000000000 wei) are required for gas fees.
 * @param {string} toAddress - The address to which the coins should be sent.
 * @param {string} coins - The string representing the number of coins (in ether) to send. To convert between ethers and wei, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei
 * @param {number} nonce - A monotonically increasing number representing the nonce of the account. You have to carefully manage the state of the nonce to avoid sending the coins multiple times, such as when retrying after an error.
 * @param {string} data - Ignored. This parameter is accepted but not used. Use signRawTransaction to pass contract data.
 * @return {Promise<SignResult>}  Returns a promise of type SignResult.
 */
async function signTransaction(wallet, toAddress, coins, nonce, data) {
    if (isInitialized === false) {
        return -1000;
    }

    if (wallet == null || toAddress == null || coins == null || nonce == null) {
        return new SignResult(-500, null, null);
    }

    if (isAddressValid(toAddress) === false) {
        return new SignResult(-501, null, null);
    }

    if (verifyWallet(wallet) === false) {
        return new SignResult(-502, null, null);
    }

    if (isLargeNumber(coins) === false) {
        return new SignResult(-503, null, null);
    }

    let tempNonce = parseInt(nonce);
    if (Number.isInteger(tempNonce) === false) {
        return new SignResult(-504, null, null);
    }
    nonce = tempNonce;
    if (nonce < 0) {
        return new SignResult(-505, null, null);
    }

    const contractData = null;

    var txSigningHash = transactionGetSigningHash(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData);
    if (txSigningHash == null) {
        return new SignResult(-506, null, null);
    }
    const txSigningHashU8 = toUint8Array(txSigningHash);
    const hybridedsNs = circl && circl.hybrideds;
    if (!hybridedsNs) {
        return new SignResult(-507, null, null);
    }
    const sigRes = hybridedsNs.signCompact(toUint8Array(wallet.privateKey), txSigningHashU8);
    if (sigRes && sigRes.error) {
        return new SignResult(-507, null, null);
    }
    const verRes = hybridedsNs.verifyCompact(toUint8Array(wallet.publicKey), txSigningHashU8, sigRes.result);
    if (verRes && verRes.error) {
        return new SignResult(-507, null, null);
    }
    if (verRes.result !== true) {
        return new SignResult(-507, null, null);
    }
    const quantumSig = sigRes.result instanceof Uint8Array ? Array.from(sigRes.result) : sigRes.result;

    var txHashHex = transactionGetTransactionHash(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData, wallet.publicKey, quantumSig);
    if (txHashHex == null) {
        return new SignResult(-508, null, null);
    }

    var txnData = transactionGetData(wallet.address, nonce, toAddress, coins, DEFAULT_GAS, config.chainId, contractData, wallet.publicKey, quantumSig);
    if (txnData == null) {
        return new SignResult(-509, null, null);
    }

    return new SignResult(0, txHashHex, txnData);
}

/**
 * Helper function to convert a hex string to Uint8Array
 * @param {string} hex - Hex string with or without 0x prefix
 * @return {Uint8Array} Uint8Array representation of the hex string, or empty array if null/undefined
 */
function hexStringToUint8Array(hex) {
    // Return empty array if null or undefined
    if (hex === null || hex === undefined) {
        return new Uint8Array(0);
    }

    // Remove 0x prefix if present
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }

    if (/[^0-9a-fA-F]/.test(hex)) {
        return new Uint8Array(0);
    }

    // Ensure even length (pad with leading zero if needed)
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }

    // Convert hex string to Uint8Array
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    return bytes;
}

/**
 * The signRawTransaction function returns a signed transaction. The chainId used for signing can be provided in the TransactionSigningRequest, or if null, the chainId specified in the initialize() function will be used.
 * With this function, you can set the gasLimit explicitly compared to signTransaction.
 * You can also pass data to be signed, such as when creating or invoking a smart contract.
 * Since the gas fee is fixed at 1000 coins for 21000 units of gas, there is no option to set the gas fee explicitly.
 * This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
 * Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.
 *
 * @function signRawTransaction
 * @param {TransactionSigningRequest} transactionSigningRequest - An object of type TransactionSigningRequest with the transaction signing details.
 * @return {SignResult}  Returns a promise of type SignResult.
 */
function signRawTransaction(transactionSigningRequest) {
    if (isInitialized === false) {
        return -1000;
    }

    if (transactionSigningRequest.wallet == null || transactionSigningRequest.nonce == null || transactionSigningRequest.gasLimit == null) {
        return new SignResult(-900, null, null);
    }

    if (transactionSigningRequest.toAddress !== null && isAddressValid(transactionSigningRequest.toAddress) === false) {
        return new SignResult(-901, null, null);
    }

    if (verifyWallet(transactionSigningRequest.wallet) === false) {
        return new SignResult(-902, null, null);
    }

    // Convert valueInWei to hex if needed
    let valueInWeiHex = null;
    if (transactionSigningRequest.valueInWei !== null) {
        if (typeof transactionSigningRequest.valueInWei === 'bigint') {
            // Convert BigInt to hex string
            valueInWeiHex = '0x' + transactionSigningRequest.valueInWei.toString(16);
        } else if (typeof transactionSigningRequest.valueInWei === 'string') {
            if (transactionSigningRequest.valueInWei.startsWith('0x') === false || /[^0-9a-fA-F]/.test(transactionSigningRequest.valueInWei.slice(2))) {
                return new SignResult(-903, null, null);
            }
            valueInWeiHex = transactionSigningRequest.valueInWei;
        } else {
            return new SignResult(-923, null, null);
        }
    }

    let tempNonce = parseInt(transactionSigningRequest.nonce);
    if (Number.isInteger(tempNonce) === false) {
        return new SignResult(-904, null, null);
    }
    let nonce = tempNonce;
    if (nonce < 0) {
        return new SignResult(-905, null, null);
    }

    let data = null;
    if (transactionSigningRequest.data !== null) {
        if (typeof transactionSigningRequest.data !== 'string' || transactionSigningRequest.data.startsWith('0x') === false || /[^0-9a-fA-F]/.test(transactionSigningRequest.data.slice(2))) {
            return new SignResult(-906, null, null);
        }
        data = hexStringToUint8Array(transactionSigningRequest.data);
    }

    let tempGasLimit = parseInt(transactionSigningRequest.gasLimit);
    if (Number.isInteger(tempGasLimit) === false) {
        return new SignResult(-907, null, null);
    }
    let gasLimit = tempGasLimit;
    if (gasLimit < 0) {
        return new SignResult(-908, null, null);
    }

    let remarks = null;
    if (transactionSigningRequest.remarks !== null) {
        if (typeof transactionSigningRequest.remarks !== 'string' || transactionSigningRequest.remarks.startsWith('0x') === false || /[^0-9a-fA-F]/.test(transactionSigningRequest.remarks.slice(2))) {
            return new SignResult(-909, null, null);
        }
        remarks = hexStringToUint8Array(transactionSigningRequest.remarks);
        if (remarks.length > 32) {
            return new SignResult(-910, null, null);
        }
    }

    // Use chainId from request if provided, otherwise use the one from initialize()
    let chainId;
    if (transactionSigningRequest.chainId !== null && transactionSigningRequest.chainId !== undefined) {
        // Validate chainId if provided
        let tempChainId = parseInt(transactionSigningRequest.chainId);
        if (Number.isInteger(tempChainId) === false) {
            return new SignResult(-911, null, null);
        }
        chainId = tempChainId;
        if (chainId < 0) {
            return new SignResult(-912, null, null);
        }
    } else {
        // Use chainId from initialize()
        chainId = config.chainId;
    }

    let signingContext = transactionSigningRequest.signingContext;
    const keyTypeForContext = getKeyTypeFromPrivateKey(transactionSigningRequest.wallet.privateKey);
    if (signingContext === null || signingContext === undefined) {
        if (keyTypeForContext === KEY_TYPE_HYBRIDEDMLDSASLHDSA) {
            signingContext = 0;
        } else if (keyTypeForContext === KEY_TYPE_HYBRIDEDMLDSASLHDSA5) {
            signingContext = 1;
        } else {
            return new SignResult(-913, null, null);
        }
    }

    let txSigningHash = transactionGetSigningHash2(transactionSigningRequest.wallet.address, nonce, transactionSigningRequest.toAddress, valueInWeiHex, gasLimit, chainId, data, remarks, signingContext);
    if (txSigningHash == null) {
        return new SignResult(-914, null, null);
    }
    const txSigningHashU8 = toUint8Array(txSigningHash);
    const wallet = transactionSigningRequest.wallet;
    const privU8 = toUint8Array(wallet.privateKey);
    const pubU8 = toUint8Array(wallet.publicKey);
    let sigRes;
    let verRes;
    const hybridNs = circl && circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl && (circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5);
    if (signingContext === 0 && hybridNs) {
        sigRes = hybridNs.signCompact(privU8, txSigningHashU8);
        if (sigRes && sigRes.error) return new SignResult(-915, null, null);
        verRes = hybridNs.verifyCompact(pubU8, txSigningHashU8, sigRes.result);
    } else if (signingContext === 1 && hybrid5Ns) {
        sigRes = hybrid5Ns.sign(privU8, txSigningHashU8);
        if (sigRes && sigRes.error) return new SignResult(-916, null, null);
        verRes = hybrid5Ns.verify(pubU8, txSigningHashU8, sigRes.result);
    } else if (signingContext === 2 && hybridNs) {
        sigRes = hybridNs.sign(privU8, txSigningHashU8);
        if (sigRes && sigRes.error) return new SignResult(-917, null, null);
        verRes = hybridNs.verify(pubU8, txSigningHashU8, sigRes.result);
    } else {
        return new SignResult(-918, null, null);
    }
    if (verRes && verRes.error) return new SignResult(-919, null, null);
    if (verRes.result !== true) return new SignResult(-920, null, null);
    const quantumSig = sigRes.result instanceof Uint8Array ? Array.from(sigRes.result) : sigRes.result;

    let txHashHex = transactionGetTransactionHash2(transactionSigningRequest.wallet.address, nonce, transactionSigningRequest.toAddress, valueInWeiHex, gasLimit, chainId, data, remarks, signingContext, transactionSigningRequest.wallet.publicKey, quantumSig);
    if (txHashHex == null) {
        return new SignResult(-921, null, null);
    }

    let txnData = transactionGetData2(transactionSigningRequest.wallet.address, nonce, transactionSigningRequest.toAddress, valueInWeiHex, gasLimit, chainId, data, remarks, signingContext, transactionSigningRequest.wallet.publicKey, quantumSig);
    if (txnData == null) {
        return new SignResult(-922, null, null);
    }

    return new SignResult(0, txHashHex, txnData);
}

/**
 * Returns the gas price per unit of gas (per-gas-unit), in wei, for the signing context implied by keyType and fullSign.
 * The returned value is the price PER UNIT OF GAS, NOT the total transaction fee (total fee = gasPrice * gasLimit).
 * This mirrors the dynamic-fee gas price logic in quantum-coin-go core/types/dynamic_fee_tx.go.
 *
 * fullSign is IGNORED for keyType 5 (KEY_TYPE_HYBRIDEDMLDSASLHDSA5), which always uses signing context 1.
 * For keyType 3 (KEY_TYPE_HYBRIDEDMLDSASLHDSA), fullSign selects the scheme: false = compact (context 0), true = full (context 2).
 *
 * @function getGasPrice
 * @param {number} keyType - 3 (KEY_TYPE_HYBRIDEDMLDSASLHDSA) or 5 (KEY_TYPE_HYBRIDEDMLDSASLHDSA5).
 * @param {boolean|null} [fullSign] - Optional. Use full (non-compact) signing for keyType 3. Ignored for keyType 5. Defaults to false.
 * @returns {{ resultCode: number, gasPrice: string|null }} resultCode 0 and gasPrice as a decimal wei string (per gas unit) on success; resultCode -940 with gasPrice null for an invalid keyType.
 */
function getGasPrice(keyType, fullSign) {
    const useFullSign = fullSign === true;
    let multiplier;
    if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA) {
        // signing context 0 (compact) or 2 (full)
        multiplier = useFullSign ? SIGNING_CONTEXT_LEVEL2_MULTIPLIER : 1n;
    } else if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5) {
        // signing context 1; fullSign is not applicable for this key type
        multiplier = SIGNING_CONTEXT_LEVEL1_MULTIPLIER;
    } else {
        return { resultCode: -940, gasPrice: null };
    }
    const price = DYNAMIC_BASE_GAS_PRICE_WEI * multiplier;
    return { resultCode: 0, gasPrice: price.toString() };
}

/**
 * Sign a message with a private key. Optional signingContext selects algorithm (same pattern as signRawTransaction); if null/omitted, derived from private key type.
 * @param {number[]|Uint8Array} privateKey - Private key bytes.
 * @param {number[]|Uint8Array} message - Message bytes (e.g. 32-byte hash).
 * @param {number|null} [signingContext] - Optional. 0 = hybridedmldsaslhdsa compact, 1 = hybridedmldsaslhdsa5, 2 = hybridedmldsaslhdsa full. If null/omitted, derived from private key type.
 * @returns {{ resultCode: number, signature: Uint8Array|null }} resultCode 0 on success, signature bytes; negative on error (e.g. -1000 not initialized, -700 invalid args, -701 unknown key type, -702/-703 CIRCL sign error, -704 unsupported key type or context).
 */
function sign(privateKey, message, signingContext) {
    if (isInitialized === false) {
        return { resultCode: -1000, signature: null };
    }
    if (!isByteArray(privateKey) || !isByteArray(message)) {
        return { resultCode: -700, signature: null };
    }
    const privU8 = toUint8Array(privateKey);
    const messageU8 = toUint8Array(message);
    const hybridNs = circl && circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl && (circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5);
    let sigRes;
    const ctx = signingContext === null || signingContext === undefined ? null : signingContext;
    if (ctx === null) {
        const keyType = getKeyTypeFromPrivateKey(privateKey);
        if (keyType == null) {
            return { resultCode: -701, signature: null };
        }
        if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA && hybridNs) {
            sigRes = hybridNs.signCompact(privU8, messageU8);
            if (sigRes && sigRes.error) return { resultCode: -702, signature: null };
        } else if (keyType === KEY_TYPE_HYBRIDEDMLDSASLHDSA5 && hybrid5Ns) {
            sigRes = hybrid5Ns.sign(privU8, messageU8);
            if (sigRes && sigRes.error) return { resultCode: -703, signature: null };
        } else {
            return { resultCode: -704, signature: null };
        }
    } else if (ctx === 0 && hybridNs) {
        sigRes = hybridNs.signCompact(privU8, messageU8);
        if (sigRes && sigRes.error) return { resultCode: -702, signature: null };
    } else if (ctx === 1 && hybrid5Ns) {
        sigRes = hybrid5Ns.sign(privU8, messageU8);
        if (sigRes && sigRes.error) return { resultCode: -703, signature: null };
    } else if (ctx === 2 && hybridNs) {
        sigRes = hybridNs.sign(privU8, messageU8);
        if (sigRes && sigRes.error) return { resultCode: -702, signature: null };
    } else {
        return { resultCode: -704, signature: null };
    }
    const sig = sigRes.result instanceof Uint8Array ? sigRes.result : new Uint8Array(sigRes.result);
    return { resultCode: 0, signature: sig };
}

/**
 * Verify a signature over a message with a public key. Algorithm is determined by the first byte of the signature: 1=hybrideds verifyCompact, 2=hybrideds verify, 3=hybridedmldsaslhdsa verifyCompact, 4=hybridedmldsaslhdsa verify, 5=hybridedmldsaslhdsa5 verify.
 * @param {number[]|Uint8Array} publicKey - Public key bytes.
 * @param {number[]|Uint8Array} signature - Signature bytes from sign(); first byte selects verify function (1-5).
 * @param {number[]|Uint8Array} message - Message bytes (same as passed to sign).
 * @returns {{ resultCode: number, valid: boolean }} resultCode 0 and valid true if signature is valid; negative on error (e.g. -1000 not initialized, -715 invalid args, -717 CIRCL verify error, -719 signature invalid, -718 unknown signature type).
 */
function verify(publicKey, signature, message) {
    if (isInitialized === false) {
        return { resultCode: -1000, valid: false };
    }
    if (!isByteArray(publicKey) || !isByteArray(signature) || !isByteArray(message)) {
        return { resultCode: -715, valid: false };
    }
    const sigLen = signature.byteLength !== undefined ? signature.byteLength : signature.length;
    if (sigLen < 1) {
        return { resultCode: -715, valid: false };
    }
    const sigType = signature[0];
    const pubU8 = toUint8Array(publicKey);
    const sigU8 = toUint8Array(signature);
    const messageU8 = toUint8Array(message);
    const hybridedsNs = circl && circl.hybrideds;
    const hybridNs = circl && circl.hybridedmldsaslhdsa;
    const hybrid5Ns = circl && (circl.hybridedmldsaslhdsa5 || circl.hybridedmldsaslhdsa5);
    let verRes;
    if (sigType === 1 && hybridedsNs) {
        verRes = hybridedsNs.verifyCompact(pubU8, messageU8, sigU8);
    } else if (sigType === 2 && hybridedsNs) {
        verRes = hybridedsNs.verify(pubU8, messageU8, sigU8);
    } else if (sigType === 3 && hybridNs) {
        verRes = hybridNs.verifyCompact(pubU8, messageU8, sigU8);
    } else if (sigType === 4 && hybridNs) {
        verRes = hybridNs.verify(pubU8, messageU8, sigU8);
    } else if (sigType === 5 && hybrid5Ns) {
        verRes = hybrid5Ns.verify(pubU8, messageU8, sigU8);
    } else {
        return { resultCode: -718, valid: false };
    }
    if (verRes && verRes.error) return { resultCode: -717, valid: false };
    if (verRes.result !== true) return { resultCode: -719, valid: false };
    return { resultCode: 0, valid: true };
}

/**
 * The publicKeyFromSignature extracts the public key from a signature.
 *
 * @function publicKeyFromSignature
 * @param {number[]} digest - An array of bytes containing the digestHash. Should be of length 32.
 * @param {number[]} signature - An array of bytes containing the signature.
 * @return {string} - Returns the public key as a hex string. Returns null if the operation failed.
 */
function publicKeyFromSignature(digest, signature) {
    if (isInitialized === false) {
        return -1000;
    }

    if (digest === undefined || digest === null || digest.length === undefined || digest.length === null || digest.length !== 32) {
        return null;
    }

    if (signature === undefined || signature === null || signature.length === undefined || signature.length === null) {
        return null;
    }

    let publicKeyHex = PublicKeyFromSignature(digest, signature);

    return publicKeyHex;
}

/**
 * The publicKeyFromPrivateKey extracts the public key from a private key.
 *
 * @function publicKeyFromPrivateKey
 * @param {number[]} privateKey - An array of bytes containing the privateKey.
 * @return {string} - Returns the public key as a hex string. Returns null if the operation failed.
 */
function publicKeyFromPrivateKey(privateKey) {
    if (isInitialized === false) {
        return -1000;
    }

    if (privateKey === undefined || privateKey === null || privateKey.length === undefined || privateKey.length === null) {
        return null;
    }

    let publicKeyHex = PublicKeyFromPrivateKey(privateKey);

    return publicKeyHex;
}

/**
 * The addressFromPublicKey returns the address corresponding to the public key.
 *
 * @function addressFromPublicKey
 * @param {number[]} publicKey - An array of bytes containing the public key.
 * @return {string} - Returns the address corresponding to the public key as a hex string. Returns null if the operation failed.
 */
function addressFromPublicKey(publicKey) {
    if (isInitialized === false) {
        return -1000;
    }

    if (publicKey === undefined || publicKey === null || publicKey.length === undefined || publicKey.length === null) {
        return null;
    }

    return PublicKeyToAddress(publicKey);
}

/**
 * The scryptDeriveKey function derives a key from a secret and salt using the scrypt KDF.
 *
 * Arbitrary scrypt parameters are supported. The classic set N=262144, r=8, p=1, dkLen=32
 * remains fully supported and byte-for-byte compatible with previous versions.
 *
 * @function scryptDeriveKey
 * @param {string|Uint8Array|number[]} secret - The secret/passphrase. A string is encoded as UTF-8 bytes.
 * @param {Uint8Array|number[]} salt - The salt as a byte array.
 * @param {number} N - The scrypt CPU/memory cost parameter (power of two, > 1).
 * @param {number} r - The scrypt block size parameter.
 * @param {number} p - The scrypt parallelization parameter.
 * @param {number} dkLen - The derived key length in bytes.
 * @return {number[]} - Returns the derived key as a byte array. Returns -1000 before initialize(), or null if the operation failed or the parameters are invalid.
 */
function scryptDeriveKey(secret, salt, N, r, p, dkLen) {
    if (isInitialized === false) {
        return -1000;
    }

    const secretU8 = toU8Secret(secret);
    if (secretU8 === null) {
        return null;
    }

    if (isByteArray(salt) === false) {
        return null;
    }

    if (typeof N !== 'number' || typeof r !== 'number' || typeof p !== 'number' || typeof dkLen !== 'number') {
        return null;
    }

    const saltU8 = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
    const secretBase64 = bytesToBase64(secretU8);
    const saltBase64 = bytesToBase64(saltU8);

    const derivedBase64 = Scrypt(secretBase64, saltBase64, N, r, p, dkLen);
    if (derivedBase64 == null || (typeof derivedBase64 !== 'string' && !(derivedBase64 instanceof String))) {
        return null;
    }

    return Array.from(base64ToBytes(derivedBase64));
}

/**
 * Computes a hash digest using the given WASM hash call.
 * @param {function(string): *} wasmCall - Thunk invoking the WASM global with a base64 string.
 *   Passed as a thunk so the (bare) WASM global is only referenced after the
 *   isInitialized guard - before WASM init the global does not exist.
 * @param {string|Uint8Array|number[]} data - Data to hash (string -> UTF-8 bytes).
 * @return {number[]|number|null} Byte array digest, -1000 before init, or null on invalid input.
 */
function _digest(wasmCall, data) {
    if (isInitialized === false) {
        return -1000;
    }
    const dataU8 = toU8Secret(data);
    if (dataU8 === null) {
        return null;
    }
    const outBase64 = wasmCall(bytesToBase64(dataU8));
    if (outBase64 == null || (typeof outBase64 !== 'string' && !(outBase64 instanceof String))) {
        return null;
    }
    return Array.from(base64ToBytes(outBase64));
}

/**
 * The sha256 function computes the SHA-256 digest of the input.
 *
 * @function sha256
 * @param {string|Uint8Array|number[]} data - The data to hash (string -> UTF-8 bytes).
 * @return {number[]} - The 32-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.
 */
function sha256(data) {
    return _digest((b64) => Sha256(b64), data);
}

/**
 * The sha512 function computes the SHA-512 digest of the input.
 *
 * @function sha512
 * @param {string|Uint8Array|number[]} data - The data to hash (string -> UTF-8 bytes).
 * @return {number[]} - The 64-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.
 */
function sha512(data) {
    return _digest((b64) => Sha512(b64), data);
}

/**
 * The ripemd160 function computes the RIPEMD-160 digest of the input.
 *
 * @function ripemd160
 * @param {string|Uint8Array|number[]} data - The data to hash (string -> UTF-8 bytes).
 * @return {number[]} - The 20-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.
 */
function ripemd160(data) {
    return _digest((b64) => Ripemd160(b64), data);
}

/**
 * The computeHmac function computes an HMAC over the data using the given key.
 *
 * @function computeHmac
 * @param {string} algorithm - The hash algorithm: "sha256" or "sha512".
 * @param {string|Uint8Array|number[]} key - The HMAC key (string -> UTF-8 bytes).
 * @param {string|Uint8Array|number[]} data - The data to authenticate (string -> UTF-8 bytes).
 * @return {number[]} - The HMAC as a byte array. Returns -1000 before initialize(), or null on invalid input.
 */
function computeHmac(algorithm, key, data) {
    if (isInitialized === false) {
        return -1000;
    }
    if (typeof algorithm !== 'string' && !(algorithm instanceof String)) {
        return null;
    }
    const keyU8 = toU8Secret(key);
    const dataU8 = toU8Secret(data);
    if (keyU8 === null || dataU8 === null) {
        return null;
    }
    const outBase64 = ComputeHmac(String(algorithm), bytesToBase64(keyU8), bytesToBase64(dataU8));
    if (outBase64 == null || (typeof outBase64 !== 'string' && !(outBase64 instanceof String))) {
        return null;
    }
    return Array.from(base64ToBytes(outBase64));
}

/**
 * The pbkdf2 function derives a key using PBKDF2.
 *
 * @function pbkdf2
 * @param {string|Uint8Array|number[]} password - The password (string -> UTF-8 bytes).
 * @param {Uint8Array|number[]} salt - The salt as a byte array.
 * @param {number} iterations - The iteration count (positive integer).
 * @param {number} keylen - The derived key length in bytes (positive integer).
 * @param {string} algorithm - The PRF hash algorithm: "sha256" or "sha512".
 * @return {number[]} - The derived key as a byte array. Returns -1000 before initialize(), or null on invalid input.
 */
function pbkdf2(password, salt, iterations, keylen, algorithm) {
    if (isInitialized === false) {
        return -1000;
    }
    const passwordU8 = toU8Secret(password);
    if (passwordU8 === null || isByteArray(salt) === false) {
        return null;
    }
    if (typeof iterations !== 'number' || typeof keylen !== 'number') {
        return null;
    }
    if (typeof algorithm !== 'string' && !(algorithm instanceof String)) {
        return null;
    }
    const saltU8 = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
    const outBase64 = Pbkdf2(bytesToBase64(passwordU8), bytesToBase64(saltU8), iterations, keylen, String(algorithm));
    if (outBase64 == null || (typeof outBase64 !== 'string' && !(outBase64 instanceof String))) {
        return null;
    }
    return Array.from(base64ToBytes(outBase64));
}

/**
 * The combinePublicKeySignature combines the public key and signature.
 *
 * @function combinePublicKeySignature
 * @param {number[]} publicKey - An array of bytes containing the public key.
 * @param {number[]} signature - An array of bytes containing the signature. 
 * @return {string} - Returns a hex string corresponding to combined signature. Returns null if the operation failed.
 */
function combinePublicKeySignature(publicKey, signature) {
    if (isInitialized === false) {
        return -1000;
    }

    if (publicKey === undefined || publicKey === null || publicKey.length === undefined || publicKey.length === null) {
        return null;
    }

    if (signature === undefined || signature === null || signature.length === undefined || signature.length === null) {
        return null;
    }

    return CombinePublicKeySignature(publicKey, signature);
}

/**
 * The packMethodData function packs a Solidity method call with the given ABI, method name, and arguments.
 * It returns the transaction data as a hex string that can be included in a transaction.
 *
 * @function packMethodData
 * @param {string} abiJSON - The Solidity ABI file content as a JSON string
 * @param {string} methodName - The name of the method to call
 * @param {...*} args - The parameters to pass to the method (variable arguments)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the packed transaction data as a hex string.
 */
function packMethodData(abiJSON, methodName, ...args) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    if (abiJSON === undefined || abiJSON === null || typeof abiJSON !== 'string') {
        return new PackUnpackResult('Invalid abiJSON parameter. Expected a string.', '');
    }

    if (methodName === undefined || methodName === null || typeof methodName !== 'string') {
        return new PackUnpackResult('Invalid methodName parameter. Expected a string.', '');
    }

    try {
        // Call WASM PackMethodData function
        // The WASM function expects: (abiJSON, methodName, ...args)
        const result = PackMethodData(abiJSON, methodName, ...args);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('PackMethodData returned null or undefined', '');
        }

        // The WASM returns a string where each character is a byte
        // Convert to hex string
        let hex = '0x';
        for (let i = 0; i < result.length; i++) {
            const byte = result.charCodeAt(i);
            const hexByte = byte.toString(16);
            hex += hexByte.length === 1 ? '0' + hexByte : hexByte;
        }

        return new PackUnpackResult('', hex);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The unpackMethodData function unpacks the return values of a Solidity method call.
 * It returns the unpacked values as a JavaScript array or object.
 *
 * @function unpackMethodData
 * @param {string} abiJSON - The Solidity ABI file content as a JSON string
 * @param {string} methodName - The name of the method whose return values to unpack
 * @param {string} hexData - The hex-encoded return data (with or without 0x prefix)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the unpacked return values as a JSON string.
 */
function unpackMethodData(abiJSON, methodName, hexData) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    if (abiJSON === undefined || abiJSON === null || typeof abiJSON !== 'string') {
        return new PackUnpackResult('Invalid abiJSON parameter. Expected a string.', '');
    }

    if (methodName === undefined || methodName === null || typeof methodName !== 'string') {
        return new PackUnpackResult('Invalid methodName parameter. Expected a string.', '');
    }

    if (hexData === undefined || hexData === null || typeof hexData !== 'string') {
        return new PackUnpackResult('Invalid hexData parameter. Expected a string.', '');
    }

    try {
        // Call WASM UnpackMethodData function
        const result = UnpackMethodData(abiJSON, methodName, hexData);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('UnpackMethodData returned null or undefined', '');
        }

        // Return the JSON string result directly
        return new PackUnpackResult('', result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The packCreateContractData function packs constructor data for contract creation.
 * It combines the contract bytecode with the ABI-encoded constructor parameters.
 * This matches the Go pattern: Pack("", params...) and append(bytecode, input...)
 *
 * @function packCreateContractData
 * @param {string} abiJSON - The Solidity ABI file content as a JSON string
 * @param {string} bytecode - The contract bytecode as a hex string (with or without 0x prefix)
 * @param {...*} args - The constructor parameters (variable arguments, can be 0 or more)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the packed contract creation data as a hex string.
 */
function packCreateContractData(abiJSON, bytecode, ...args) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    if (abiJSON === undefined || abiJSON === null || typeof abiJSON !== 'string') {
        return new PackUnpackResult('Invalid abiJSON parameter. Expected a string.', '');
    }

    if (bytecode === undefined || bytecode === null || typeof bytecode !== 'string') {
        return new PackUnpackResult('Invalid bytecode parameter. Expected a string.', '');
    }

    try {
        // Call WASM PackCreateContractData function
        // The WASM function expects: (abiJSON, bytecode, ...args)
        const result = PackCreateContractData(abiJSON, bytecode, ...args);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('PackCreateContractData returned null or undefined', '');
        }

        // The WASM returns a string where each character is a byte
        // Convert to hex string
        let hex = '0x';
        for (let i = 0; i < result.length; i++) {
            const byte = result.charCodeAt(i);
            const hexByte = byte.toString(16);
            hex += hexByte.length === 1 ? '0' + hexByte : hexByte;
        }

        return new PackUnpackResult('', hex);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The encodeEventLog function encodes event parameters into topics and data according to the ABI specification.
 * It returns the topics array and data hex string that can be used to create event logs.
 *
 * @function encodeEventLog
 * @param {string} abiJSON - The Solidity ABI file content as a JSON string
 * @param {string} eventName - The name of the event to encode
 * @param {...*} args - The event parameter values (variable arguments)
 * @return {EventLogEncodeResult} - Returns an EventLogEncodeResult object containing the error (if any) and the encoded event log with topics and data.
 */
function encodeEventLog(abiJSON, eventName, ...args) {
    if (isInitialized === false) {
        return new EventLogEncodeResult('SDK not initialized. Call initialize() first.', null);
    }

    if (abiJSON === undefined || abiJSON === null || typeof abiJSON !== 'string') {
        return new EventLogEncodeResult('Invalid abiJSON parameter. Expected a string.', null);
    }

    if (eventName === undefined || eventName === null || typeof eventName !== 'string') {
        return new EventLogEncodeResult('Invalid eventName parameter. Expected a string.', null);
    }

    try {
        // Call WASM EncodeEventLog function
        // The WASM function expects: (abiJSON, eventName, ...args)
        const result = EncodeEventLog(abiJSON, eventName, ...args);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new EventLogEncodeResult(result.message || 'Unknown error from WASM', null);
        }
        
        if (result === null || result === undefined) {
            return new EventLogEncodeResult('EncodeEventLog returned null or undefined', null);
        }

        // The WASM returns a JavaScript object with topics (array) and data (hex string)
        // Extract topics array and data
        const topics = result.topics || [];
        const data = result.data || '0x';

        // Ensure topics is an array and data is a string
        if (!Array.isArray(topics)) {
            return new EventLogEncodeResult('EncodeEventLog returned invalid topics (not an array)', null);
        }

        if (typeof data !== 'string') {
            return new EventLogEncodeResult('EncodeEventLog returned invalid data (not a string)', null);
        }

        return new EventLogEncodeResult('', { topics, data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new EventLogEncodeResult(errorMessage, null);
    }
}

/**
 * The decodeEventLog function decodes event log topics and data back into event parameters.
 * It returns the decoded values as a JavaScript object.
 *
 * @function decodeEventLog
 * @param {string} abiJSON - The Solidity ABI file content as a JSON string
 * @param {string} eventName - The name of the event to decode
 * @param {string[]} topics - Array of topic hex strings (with or without 0x prefix)
 * @param {string} data - Hex-encoded data string (with or without 0x prefix)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the decoded event parameters as a JSON string.
 */
function decodeEventLog(abiJSON, eventName, topics, data) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    if (abiJSON === undefined || abiJSON === null || typeof abiJSON !== 'string') {
        return new PackUnpackResult('Invalid abiJSON parameter. Expected a string.', '');
    }

    if (eventName === undefined || eventName === null || typeof eventName !== 'string') {
        return new PackUnpackResult('Invalid eventName parameter. Expected a string.', '');
    }

    if (topics === undefined || topics === null || !Array.isArray(topics)) {
        return new PackUnpackResult('Invalid topics parameter. Expected an array of strings.', '');
    }

    if (data === undefined || data === null || typeof data !== 'string') {
        return new PackUnpackResult('Invalid data parameter. Expected a string.', '');
    }

    try {
        // Call WASM DecodeEventLog function
        const result = DecodeEventLog(abiJSON, eventName, topics, data);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('DecodeEventLog returned null or undefined', '');
        }

        // The WASM returns a JSON string
        if (typeof result !== 'string') {
            return new PackUnpackResult('DecodeEventLog returned invalid result (not a string)', '');
        }

        return new PackUnpackResult('', result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The encodeRlp function encodes a JavaScript value to RLP (Recursive Length Prefix) format.
 * Supports: strings, numbers, booleans, arrays, objects (maps), and hex-encoded bytes.
 * Returns a hex-encoded string of the RLP-encoded data.
 *
 * @function encodeRlp
 * @param {*} value - The value to encode (can be string, number, boolean, array, object, etc.)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the RLP-encoded data as a hex string.
 */
function encodeRlp(value) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    // Note: null and undefined are valid inputs and will be encoded as empty bytes

    try {
        // Call WASM EncodeRlp function
        const result = EncodeRlp(value);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('EncodeRlp returned null or undefined', '');
        }

        // The WASM returns a hex string
        if (typeof result !== 'string') {
            return new PackUnpackResult('EncodeRlp returned invalid result (not a string)', '');
        }

        return new PackUnpackResult('', result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The decodeRlp function decodes RLP-encoded data back to a JavaScript-compatible value.
 * Takes a hex-encoded string and returns a JSON string representation of the decoded value.
 *
 * @function decodeRlp
 * @param {string} data - The hex-encoded RLP data (with or without 0x prefix)
 * @return {PackUnpackResult} - Returns a PackUnpackResult object containing the error (if any) and the decoded value as a JSON string.
 */
function decodeRlp(data) {
    if (isInitialized === false) {
        return new PackUnpackResult('SDK not initialized. Call initialize() first.', '');
    }

    if (data === undefined || data === null || typeof data !== 'string') {
        return new PackUnpackResult('Invalid data parameter. Expected a string.', '');
    }

    try {
        // Call WASM DecodeRlp function
        const result = DecodeRlp(data);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return new PackUnpackResult(result.message || 'Unknown error from WASM', '');
        }
        
        if (result === null || result === undefined) {
            return new PackUnpackResult('DecodeRlp returned null or undefined', '');
        }

        // The WASM returns a JSON string
        if (typeof result !== 'string') {
            return new PackUnpackResult('DecodeRlp returned invalid result (not a string)', '');
        }

        return new PackUnpackResult('', result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PackUnpackResult(errorMessage, '');
    }
}

/**
 * The createAddress function calculates the contract address that will be created by a transaction.
 * This uses the CREATE opcode address calculation: keccak256(RLP(sender, nonce))
 *
 * @function createAddress
 * @param {string} address - The address of the account that will create the contract (hex string with 0x prefix)
 * @param {number} nonce - The nonce of the account at the time of contract creation
 * @return {string|null} - Returns the contract address as a hex string, or null if an error occurred.
 */
function createAddress(address, nonce) {
    if (isInitialized === false) {
        return null;
    }

    if (address === undefined || address === null || typeof address !== 'string') {
        return null;
    }

    if (nonce === undefined || nonce === null || typeof nonce !== 'number') {
        return null;
    }

    try {
        // Call WASM CreateAddress function
        // The WASM function expects: (address, nonce as string)
        const result = CreateAddress(address, nonce.toString());
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return null;
        }
        
        if (result === null || result === undefined) {
            return null;
        }

        // Return the address string directly
        return result;
    } catch (error) {
        return null;
    }
}

/**
 * The createAddress2 function calculates the contract address using the CREATE2 opcode.
 * This allows deterministic contract address calculation: keccak256(0xff || sender || salt || keccak256(init_code))
 *
 * @function createAddress2
 * @param {string} address - The address of the account that will create the contract (hex string with 0x prefix)
 * @param {string} salt - A 32-byte salt value as a hex string (with 0x prefix)
 * @param {string} initHash - The keccak256 hash of the contract initialization code as a hex string (with 0x prefix)
 * @return {string|null} - Returns the contract address as a hex string, or null if an error occurred.
 */
function createAddress2(address, salt, initHash) {
    if (isInitialized === false) {
        return null;
    }

    if (address === undefined || address === null || typeof address !== 'string') {
        return null;
    }

    if (salt === undefined || salt === null || typeof salt !== 'string') {
        return null;
    }

    if (initHash === undefined || initHash === null || typeof initHash !== 'string') {
        return null;
    }

    try {
        // Call WASM CreateAddress2 function
        // The WASM function expects: (address, salt, initHash)
        const result = CreateAddress2(address, salt, initHash);
        
        // Check if WASM returned an Error object
        if (result instanceof Error) {
            return null;
        }
        
        if (result === null || result === undefined) {
            return null;
        }

        // Return the address string directly
        return result;
    } catch (error) {
        return null;
    }
}

module.exports = {
    initialize,
    serializeWallet,
    deserializeWallet,
    serializeEncryptedWallet,
    serializeSeedAsEncryptedWallet,
    deserializeEncryptedWallet,
    verifyWallet,
    newWallet,
    isAddressValid,
    signSendCoinTransaction,
    Config,
    Wallet, 
    newWalletSeedWords,
    openWalletFromSeed,
    openWalletFromSeedWords,
    publicKeyFromSignature,
    publicKeyFromPrivateKey,
    addressFromPublicKey,
    scryptDeriveKey,
    sha256,
    sha512,
    ripemd160,
    computeHmac,
    pbkdf2,
    combinePublicKeySignature,
    TransactionSigningRequest,
    signRawTransaction,
    getGasPrice,
    sign,
    verify,
    packMethodData,
    unpackMethodData,
    packCreateContractData,
    encodeEventLog,
    decodeEventLog,
    encodeRlp,
    decodeRlp,
    createAddress,
    createAddress2,
    PackUnpackResult,
    EventLogEncodeResult
};
