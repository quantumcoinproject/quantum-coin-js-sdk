const qcsdk = require('quantum-coin-js-sdk');

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

    let examplePassphrase = "helloworld123";

    //Save to an encrypted wallet that can then be restored into an external wallet application such as Desktop/Web/CLI/Mobile wallet
    let walletObj2 = qcsdk.newWallet();
    let walletEncryptedJson2 = qcsdk.serializeEncryptedWallet(walletObj2, examplePassphrase);
    if (walletEncryptedJson2 === null) {
        throw new Error("serializeEncryptedWallet failed");
    }
    let walletEncryptedJson3 = qcsdk.serializeEncryptedWallet(walletObj2, examplePassphrase);
    if (walletEncryptedJson3 === null) {
        throw new Error("serializeEncryptedWallet failed");
    }
    console.log("Serialized wallet A: " + walletEncryptedJson2); //just an example for demonstration, do not actually log to console
    console.log("Serialized wallet B: " + walletEncryptedJson3); //just an example for demonstration, do not actually log to console


});

