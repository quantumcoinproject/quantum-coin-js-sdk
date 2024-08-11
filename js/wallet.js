var dppqc = require('./lib/dp/wasm_exec');


const MAX_WALLETS = 128;
const MAX_WALLET_INDEX_KEY = "MaxWalletIndex";
const WALLET_KEY_PREFIX = "WALLET_";

async function walletCreateNewWallet(passphrase) {
    let keyPair = cryptoKeyPair();
    let privateKey = keyPair.getPrivateKey();
    let publicKey = keyPair.getPublicKey();
    let privateKeyArray = base64ToBytes(privateKey);
    let publicKeyArray = base64ToBytes(publicKey);
    return walletGetAccountJson(privateKeyArray, publicKeyArray, passphrase);
}

async function quantumWalletFileOpen(fileName, passphrase) {
    var file_to_read = fileName;
    var fileread = new FileReader();
    fileread.onload = function (e) {
        var walletJson = e.target.result;

        try {
            let walletDetails = JSON.parse(walletJson);
            if (walletDetails == null) {
                alert(langJson.errors.walletFileOpenError);                
                return;
            }

            var walletPassword = passphrase;
            currentWallet = walletCreateNewWalletFromJson(walletJson, walletPassword);

            return;
        } catch (error) {
            alert(langJson.errors.walletFileOpenError);
            return;
        }
    };
    fileread.readAsText(file_to_read);
}




function walletCreateNewWalletFromJson(walletJsonString, passphrase) {
    let keyPairString = dppqc.JsonToWalletKeyPair(walletJsonString, passphrase);
    if (keyPairString == null) {
        throw new Error('walletCreateNewWalletFromJson JsonToWalletKeyPair failed');
    }
    let keyPairSplit = keyPairString.split(",");
    let privateKeyArray = base64ToBytes(keyPairSplit[0]);
    let publicKeyArray = base64ToBytes(keyPairSplit[1]);
    let walletJsonCheckString = walletGetAccountJson(privateKeyArray, publicKeyArray, passphrase);

    let walletJson1 = JSON.parse(walletJsonString);
    let walletJson2 = JSON.parse(walletJsonCheckString);

    if (walletJson1.address.toLowerCase() != walletJson2.address.toLowerCase()) {
        throw new Error('walletCreateNewWalletFromJson address check failed');
    }

    let wallet = {
        address: walletJson1.address,
        privateKey: bytesToBase64(skArray),
        publicKey: bytesToBase64(pkArray)
    };

    return wallet;
}

function walletGetAccountJson(privateKeyArray, publicKeyArray, passphrase) {
    const typedSkArray = new Uint8Array(privateKeyArray.length);
    for (let i = 0; i < privateKeyArray.length; i++) {
        typedSkArray[i] = privateKeyArray[i];
    }

    const typedPkArray = new Uint8Array(publicKeyArray.length);
    for (let i = 0; i < publicKeyArray.length; i++) {
        typedPkArray[i] = publicKeyArray[i];
    }

    let walletJsonString = dppqc.KeyPairToWalletJson(privateKeyArray, publicKeyArray, passphrase);

    let address = walletGetAccountAddress(publicKeyArray);

    let walletJson = JSON.parse(walletJsonString);
    let addressCheck = "0x" + walletJson.address;
    if (addressCheck.toLowerCase() != address.toLowerCase()) {
        return null;
    }
    return walletJsonString;
}

function walletGetAccountAddress(publicKeyArray) {
    const typedPkArray = new Uint8Array(publicKeyArray.length);
    for (let i = 0; i < publicKeyArray.length; i++) {
        typedPkArray[i] = publicKeyArray[i];
    }
    let address = dppqc.PublicKeyToAddress(typedPkArray);
    return address;
}

function walletSign(wallet, msgArray) {
    var signature = cryptoSign(msgArray, base64ToBytes(wallet.getPrivateKey()));
    return signature;
}
