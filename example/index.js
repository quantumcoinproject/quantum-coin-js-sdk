const qcsdk = require('qc-sdk');
const ethers = require('ethers');

//Initialize the client configuration
var clientConfigVal = new qcsdk.Config("https://t4-relayread.quantumcoin.org", "https://t4-relaywrite.quantumcoin.org", 310324, "", ""); //Testnet T4

//For mainnet, use the following configuration
//var clientConfigVal = new qcsdk.Config("https://relayread.quantumcoin.org", "https://relaywrite.quantumcoin.org", 123123, "", ""); //Mainnet


//Initialize the SDK
qcsdk.initialize(clientConfigVal).then((initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }
    console.log("Initialize succeeded");

    let address = "0x0000000000000000000000000000000000000000000000000000000000001000"; //Just an example address

    //Get the account details
    qcsdk.getAccountDetails(address).then((accountDetailsResult) => {
        if (accountDetailsResult == null) {
            console.error("getAccountDetails failed : accountDetailsResult is null");
            return;
        }
        
        if (accountDetailsResult.accountDetails == null) {
            console.error("getAccountDetails failed : accountDetails is null");
            return;
        }

        if (accountDetailsResult.resultCode !== 0) {
            console.log("getAccountDetails failed. resultCode is " + accountDetailsResult.resultCode);
            return;
        }

        console.log("getAccountDetails succeeded:");

        console.log("address: " + accountDetailsResult.accountDetails.address);

        console.log("balance (wei): " + accountDetailsResult.accountDetails.balance);
        var etherValue = ethers.utils.formatEther(accountDetailsResult.accountDetails.balance)
        console.log("balance coins: " + etherValue);

        console.log("nonce: " + accountDetailsResult.accountDetails.nonce);

        console.log("as of blockNumber: " + accountDetailsResult.accountDetails.blockNumber);
    });
});

