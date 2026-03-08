const qcsdk = require('quantum-coin-js-sdk');
const ethers = require('ethers');

var clientConfigVal = new qcsdk.Config("https://sdk.readrelay.quantumcoinapi.com", "https://sdk.writerelay.quantumcoinapi.com", 123123, "", ""); //Mainnet

//Initialize the client configuration
//var clientConfigVal = new qcsdk.Config("https://t4-relayread.quantumcoin.org", "https://t4-relaywrite.quantumcoin.org", 310324, "", ""); //Testnet T4
//Testnet T4 Block Explorer: https://t4.scan.quantumcoin.org

//For mainnet, use the following configuration
//var clientConfigVal = new qcsdk.Config("https://sdk.readrelay.quantumcoinapi.com", "https://sdk.writerelay.quantumcoinapi.com", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org

//Local testing configuration
//var clientConfigVal = new qcsdk.Config("http://127.0.0.1:9090", "http://127.0.0.1:9091", 123123, "", ""); //local testing
//Mainnet Block Explorer: https://scan.quantumcoin.org

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then((initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }

    const digestHashBase64 = "aGkgdGhlcmVvY2tjaGFpbmJiYmJiYmJiYmJiYmJiYmI=";
    const signatureBase64 = "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";

    let digest = base64ToBytes(digestHashBase64);
    let signature = base64ToBytes(signatureBase64);

    let publicKey = qcsdk.publicKeyFromSignature(digest, signature);
    console.log("publicKeyFromSignature publicKey length: " + publicKey.length);

    // Wallet and signing demo: use CIRCL (newWallet + hybrideds) when available
    const g = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {};
    const circl = g.circl;
    const walletExample = qcsdk.newWallet();
    if (typeof walletExample === 'object' && walletExample != null && circl && circl.hybrideds) {
      console.log("walletExample.privateKey length " + walletExample.privateKey.length);
      let publicKey2 = qcsdk.publicKeyFromPrivateKey(walletExample.privateKey);
      console.log("publicKeyFromPrivateKey publicKey length: " + publicKey2.length);
      let publicKey2Bytes = hexToBytes(publicKey2);
      if (publicKey2Bytes.length !== walletExample.publicKey.length) {
        throw new Error("public key length compare failed S");
      }
      for (let i = 0; i < publicKey2Bytes.length; i++) {
        if (publicKey2Bytes[i] !== walletExample.publicKey[i]) {
          throw new Error("public key compare failed A");
        }
      }

      let utf8Encode = new TextEncoder();
      let message = utf8Encode.encode("verifyverifyverifyverifyverifyok");
      const privU8 = walletExample.privateKey instanceof Uint8Array ? walletExample.privateKey : new Uint8Array(walletExample.privateKey);
      const sigRes = circl.hybrideds.signCompact(privU8, message);
      if (sigRes && sigRes.error) throw new Error("CIRCL sign failed: " + sigRes.error);
      let quantumSig = sigRes.result instanceof Uint8Array ? Array.from(sigRes.result) : sigRes.result;

      let combinedSignatureHex = qcsdk.combinePublicKeySignature(walletExample.publicKey, quantumSig);
      if (combinedSignatureHex === null) {
        throw new Error("combinePublicKeySignature combine failed");
      }
      let combinedSignatureBytes = hexToBytes(combinedSignatureHex);
      let publicKeySigHex = qcsdk.publicKeyFromSignature(message, combinedSignatureBytes);
      let publicKeySigBytes = hexToBytes(publicKeySigHex);
      if (publicKeySigBytes.length !== walletExample.publicKey.length) {
        throw new Error("public key length compare failed B");
      }
      for (let i = 0; i < publicKeySigBytes.length; i++) {
        if (publicKeySigBytes[i] !== walletExample.publicKey[i]) {
          throw new Error("public key compare failed B");
        }
      }
    } else {
      console.log("CIRCL not loaded or newWallet failed; skipping wallet/signing demo.");
    }
});

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

// Convert a hex string to a byte array
function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
        let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}