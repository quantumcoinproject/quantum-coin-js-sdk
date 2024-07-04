//Configure hybrid-pqc and godp
var hybridpqc = require('./lib/hybrid-pqc/hybrid-pqc');

const CRYPTO_OK = 0
const CRYPTO_SECRETKEY_BYTES = 4064
const CRYPTO_PUBLICKEY_BYTES = 1408
const CRYPTO_COMPACT_SIGNATURE_BYTES = 2558

async function cryptoKeyPair() {

    let pkPtr = hybridpqc._mem_alloc(CRYPTO_PUBLICKEY_BYTES * Uint8Array.BYTES_PER_ELEMENT);
    let skPtr = hybridpqc._mem_alloc(CRYPTO_SECRETKEY_BYTES * Uint8Array.BYTES_PER_ELEMENT);

    let ret = hybridpqc._dp_sign_keypair_seed(pkPtr, skPtr);

    if (ret != CRYPTO_OK) {
        hybridpqc._mem_free(skPtr);
        hybridpqc._mem_free(pkPtr);

        throw new Error("cryptoKeyPair failed");
    }

    const skBuf = new Uint8Array(hybridpqc.HEAPU8.buffer, skPtr, CRYPTO_SECRETKEY_BYTES);
    const pkBuf = new Uint8Array(hybridpqc.HEAPU8.buffer, pkPtr, CRYPTO_PUBLICKEY_BYTES);

    const skArray = new Uint8Array(CRYPTO_SECRETKEY_BYTES);
    const pkArray = new Uint8Array(CRYPTO_PUBLICKEY_BYTES);

    for (let i = 0; i < CRYPTO_SECRETKEY_BYTES; i++) {
        skArray[i] = skBuf[i];
    }

    for (let i = 0; i < CRYPTO_PUBLICKEY_BYTES; i++) {
        pkArray[i] = pkBuf[i];
    }

    hybridpqc._mem_free(skPtr);
    hybridpqc._mem_free(pkPtr);

    const keyPair = {
        privateKey: bytesToBase64(skArray),
        publicKey: bytesToBase64(pkArray)
    };
    return keyPair;

}

async function cryptoSign(messageArray, secretKeyArray) {
    if (messageArray == null || messageArray.length < 1 || messageArray.length > 64 || secretKeyArray.length == null || secretKeyArray.length != CRYPTO_SECRETKEY_BYTES) {
        throw new Error("cryptoSign basic checks failed");
    }

    let smPtr = hybridpqc._mem_alloc(CRYPTO_COMPACT_SIGNATURE_BYTES * Uint8Array.BYTES_PER_ELEMENT);
    let smlPtr = hybridpqc._mem_alloc_long_long(1 * BigUint64Array.BYTES_PER_ELEMENT);

    const typedMsgArray = new Uint8Array(messageArray.length);
    for (let i = 0; i < messageArray.length; i++) {
        typedMsgArray[i] = messageArray[i];
    }
    const msgPtr = hybridpqc._mem_alloc(typedMsgArray.length * typedMsgArray.BYTES_PER_ELEMENT);
    hybridpqc.HEAPU8.set(typedMsgArray, msgPtr);

    const typedSkArray = new Uint8Array(secretKeyArray.length);
    for (let i = 0; i < secretKeyArray.length; i++) {
        typedSkArray[i] = secretKeyArray[i];
    }
    const skyPtr = hybridpqc._mem_alloc(typedSkArray.length * typedSkArray.BYTES_PER_ELEMENT);
    hybridpqc.HEAPU8.set(typedSkArray, skyPtr);

    let ret = hybridpqc._dp_sign(smPtr, smlPtr, msgPtr, typedMsgArray.length, skyPtr);
    if (ret != CRYPTO_OK) {
        hybridpqc._mem_free(msgPtr);
        hybridpqc._mem_free(skyPtr);
        hybridpqc._mem_free(smlPtr);
        hybridpqc._mem_free(smPtr);

        throw new Error("cryptoSign failed " + ret);
    }

    const sigLenBuf = new BigUint64Array(hybridpqc.HEAPU8.buffer, smlPtr, 1);
    if (sigLenBuf != BigInt(CRYPTO_COMPACT_SIGNATURE_BYTES)) {
        throw new Error("cryptoSign failed. signture length " + sigLenBuf);
    }
    const sigBuf = new Uint8Array(hybridpqc.HEAPU8.buffer, smPtr, sigLenBuf);
    const sigArray = new Uint8Array(CRYPTO_COMPACT_SIGNATURE_BYTES);
    for (let i = 0; i < CRYPTO_COMPACT_SIGNATURE_BYTES; i++) {
        sigArray[i] = sigBuf[i];
    }

    hybridpqc._mem_free(msgPtr);
    hybridpqc._mem_free(skyPtr);
    hybridpqc._mem_free(smlPtr);
    hybridpqc._mem_free(smPtr);

    return sigArray;
}

async function cryptoVerify(messageArray, sigArray, publicKeyArray) {
    if (messageArray == null || messageArray.length < 1 || messageArray.length > 64 || sigArray.length == null || sigArray.length < 32 || publicKeyArray == null || publicKeyArray.length != CRYPTO_PUBLICKEY_BYTES) {
        throw new Error("cryptoVerify basic checks failed");
    }

    const typedMsgArray = new Uint8Array(messageArray.length);
    for (let i = 0; i < messageArray.length; i++) {
        typedMsgArray[i] = messageArray[i];
    }
    const msgPtr = hybridpqc._mem_alloc(typedMsgArray.length * typedMsgArray.BYTES_PER_ELEMENT);
    hybridpqc.HEAPU8.set(typedMsgArray, msgPtr);

    const typedSmArray = new Uint8Array(sigArray.length);
    for (let i = 0; i < sigArray.length; i++) {
        typedSmArray[i] = sigArray[i];
    }
    const smPtr = hybridpqc._mem_alloc(typedSmArray.length * typedSmArray.BYTES_PER_ELEMENT);
    hybridpqc.HEAPU8.set(typedSmArray, smPtr);

    const typedPkArray = new Uint8Array(publicKeyArray.length);
    for (let i = 0; i < publicKeyArray.length; i++) {
        typedPkArray[i] = publicKeyArray[i];
    }
    const pkyPtr = hybridpqc._mem_alloc(typedPkArray.length * typedPkArray.BYTES_PER_ELEMENT);
    hybridpqc.HEAPU8.set(typedPkArray, pkyPtr);

    let ret = hybridpqc._dp_sign_verify(msgPtr, typedMsgArray.length, smPtr, typedSmArray.length, pkyPtr);
    hybridpqc._mem_free(msgPtr);
    hybridpqc._mem_free(smPtr);
    hybridpqc._mem_free(pkyPtr);

    if (ret != CRYPTO_OK) {
        return false;
    }

    return true;
}

async function cryptoPublicKeyFromPrivateKey(secretKeyArray) {
    if (secretKeyArray.length == null || secretKeyArray.length != CRYPTO_SECRETKEY_BYTES) {
        throw new Error("cryptoSign basic checks failed");
    }

    var ecdcaSliced = secretKeyArray.slice(32, 64);
    var dilithiumSliced = secretKeyArray.slice((64 + 2560), (64 + 2560 + 1312));
    var sphincsSliced = secretKeyArray.slice(64 + 2560 + 1312 + 64);

    var pkArray = ecdcaSliced.concat(dilithiumSliced).concat(sphincsSliced);

    return bytesToBase64(pkArray);

}