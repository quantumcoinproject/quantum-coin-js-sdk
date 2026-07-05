const qcsdk = require('quantum-coin-js-sdk');
const { formatEther, parseEther } = require('quantumcoin');

var clientConfigVal = new qcsdk.Config(123123); //Mainnet

//Initialize the client configuration
//var clientConfigVal = new qcsdk.Config(310324); //Testnet T4
//Testnet T4 Block Explorer: https://t4.scan.quantumcoin.org

//For mainnet, use the following configuration
//var clientConfigVal = new qcsdk.Config(123123); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org


//Conversion examples
let hexValue = "0x56BC75E2D63100000";
let weiValueExample = BigInt(hexValue).toString(); //convert hex to wei
console.log("hex to wei example: hex:" + hexValue + ", wei: " + weiValueExample);

let ethValueExample = formatEther(weiValueExample); //convert wei to eth
console.log("wei to eth example: wei:" + weiValueExample + ", eth (coins): " + ethValueExample);

let weiValueExample2 = parseEther(ethValueExample); //convert eth to wei
console.log("eth to wei example: eth (coins):" + ethValueExample + ", wei: " + weiValueExample2);

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then((initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }
    console.log("Initialize succeeded");

    console.log("isAddressValid (expected true)" + qcsdk.isAddressValid("0x6f605c4142f1cb037f967101a5b28ccd00b27cce4516190356baaf284d20e667")); //should print true
    console.log("isAddressValid (expected true)" + qcsdk.isAddressValid("0X6F605C4142F1CB037F967101A5B28CCD00B27CCE4516190356BAAF284D20E667")); //should print true

    //Create a new wallet
    var wallet1 = qcsdk.newWallet();
    if (wallet1 === null) {
        console.log("creating a new wallet failed");
        return;
    }
    console.log("New wallet address is: " + wallet1.address);

    //Serialize wallet to a string (You should encrypt the string before saving it to disk or a database.)
    var walletJson = qcsdk.serializeWallet(wallet1);
    if (walletJson === null) {
        console.log("serializeWallet failed");
        return;
    }

    //Deserialzie a wallet from the serialized wallet
    var wallet2 = qcsdk.deserializeWallet(walletJson);
    console.log("Deserialized wallet address is: " + wallet2.address);

    //Validate that a wallet address is correct
    console.log("isAddressValid (expected true)" + qcsdk.isAddressValid(wallet1.address)); //should print true
    console.log("isAddressValid (expected false)" + qcsdk.isAddressValid("asfasdfasdfs")); //should print false

    //Retrieve address from public key
    let addressTemp = qcsdk.addressFromPublicKey(wallet2.publicKey);
    console.log("addressFromPublicKey: " + addressTemp);
    if (addressTemp !== wallet2.address) {
        throw new Error("addressFromPublicKey doesn't match: " + addressTemp + " " + wallet2.publicKey);
    }

    //Offline sign a transaction from an existing wallet. This is typically called from an offline device hosting a cold storage wallet.
    //The resulting txnData can later be broadcast to the blockchain from a connected device (for example, via a relay or RPC endpoint).
    var toAddressExample = "0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612";
    var nonceExample = 0; //use the latest nonce for the address. If address does not exist, default to 0.
    var coinsExample = "10"; //in ethers and not in wei

    qcsdk.signSendCoinTransaction(wallet2, toAddressExample, coinsExample, nonceExample).then((signResult) => {
        console.log("signSendCoinTransaction resultCode: " + signResult.resultCode);
        console.log("signSendCoinTransaction hash: " + signResult.txnHash);
        console.log("signSendCoinTransaction txnData: " + signResult.txnData); //txnData can later be broadcast from a connected device
    });

    //Create a new seed word list
    let seedWords = qcsdk.newWalletSeedWords();
    if (seedWords === null) {
        console.error("newWalletSeedWords failed");
        return;
    }
    console.log("SeedWords: " + seedWords);

    //Open a wallet from seed words
    let seedWallet = qcsdk.openWalletFromSeedWords(seedWords);
    if (seedWallet === null) {
        console.error("openWalletFromSeedWords failed");
        return;
    }
    console.log("seedWallet address: " + seedWallet.address);

    //Open a wallet from seed words static
    let seedWordList = "servetize,redmation,suaveton,dreadtolk,rondial,pondicle,miscoil,teaguery,dylodecid,portnel,mantical,slapware,sluthike,tactise,crierial,tajluvki,pranicum,sockcup,stacksong,duerling,genogram,peasate,pulubly,skimpop,feldtail,saprostal,crabrock,radiment,dolocsin,strigemen,juryeuk,fextial,merunized,tangienti,stylocyte,plumvieve,bobstike,nosecrown,acudemy,gripstick,lacreous,marculade,sporculum,outslope,bioburden,trompong,sidelay,finchage";
    let seedWordArray = seedWordList.split(",");
    let seedWallet2 = qcsdk.openWalletFromSeedWords(seedWordArray);
    if (seedWallet2 === null) {
        console.error("openWalletFromSeedWords failed");
        return;
    }
    if (seedWallet2.address !== "0xc7C24aE0Db614F1638C5161e823A539a0293238366d4EaF29A63316D631e964F") {
        console.error("seedWallet2 check failed");
        return;
    }
    console.log("seedWallet2 address: " + seedWallet2.address);

    //Sign a transaction from a wallet created from seed words
    qcsdk.signSendCoinTransaction(seedWallet, toAddressExample, coinsExample, nonceExample).then((signResult) => {
        console.log("signSendCoinTransaction seedWallet resultCode: " + signResult.resultCode);
        console.log("signSendCoinTransaction seedWallet hash: " + signResult.txnHash);
        console.log("signSendCoinTransaction seedWallet txnData: " + signResult.txnData); //txnData can later be broadcast from a connected device
    });
});
