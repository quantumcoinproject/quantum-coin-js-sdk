const qcsdk = require('qc-sdk');
const ethers = require('ethers');

//Initialize the client configuration
var clientConfigVal = new qcsdk.Config("https://t4-relayread.quantumcoin.org", "https://t4-relaywrite.quantumcoin.org", 310324, "", ""); //Testnet T4
//Testnet T4 Block Explorer: https://t4.scan.quantumcoin.org

//For mainnet, use the following configuration
//var clientConfigVal = new qcsdk.Config("https://relayread.quantumcoin.org", "https://relaywrite.quantumcoin.org", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then((initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }
    console.log("Initialize succeeded");


    //Get the account details
    let address = "0x0000000000000000000000000000000000000000000000000000000000001000"; //Just an example address https://t4.scan.quantumcoin.org/account/0x0000000000000000000000000000000000000000000000000000000000001000

    console.log("getAccountDetails " + address);
    qcsdk.getAccountDetails(address).then((accountDetailsResult) => {
        if (accountDetailsResult === null) {
            console.error("getAccountDetails failed : accountDetailsResult is null");
            return;
        }

        if (accountDetailsResult.resultCode !== 0) {
            console.log("getAccountDetails failed. resultCode is " + accountDetailsResult.resultCode);
            return;
        }

        if (accountDetailsResult.accountDetails === null) {
            console.error("getAccountDetails failed : accountDetails is null");
            return;
        }

        console.log("getAccountDetails succeeded:");

        console.log("     address: " + accountDetailsResult.accountDetails.address);

        console.log("     balance (wei): " + accountDetailsResult.accountDetails.balance);
        var etherValue = ethers.formatEther(accountDetailsResult.accountDetails.balance)
        console.log("     balance coins: " + etherValue);

        console.log("     nonce: " + accountDetailsResult.accountDetails.nonce);

        console.log("     as of blockNumber: " + accountDetailsResult.accountDetails.blockNumber);
    });

    //Get the transaction details
    let txnHash = "0x710cc145eea254c3db9857b42f0b576f4159ac48a23bfc0c480c341e90a40376"; //Just an example transaction hash https://t4.scan.quantumcoin.org/txn/0x710cc145eea254c3db9857b42f0b576f4159ac48a23bfc0c480c341e90a40376

    console.log("getTransactionDetails " + txnHash);
    qcsdk.getTransactionDetails(txnHash).then((transactionDetailsResult) => {
        if (transactionDetailsResult === null) {
            console.error("getTransactionDetails failed : transactionDetailsResult is null");
            return;
        }

        if (transactionDetailsResult.resultCode !== 0) {
            console.log("getTransactionDetails failed. resultCode is " + transactionDetailsResult.resultCode);
            if (transactionDetailsResult.response !== null && transactionDetailsResult.response.status === 404) {
                console.log("this transaction does not exist or has been discarded");
            }
            return;
        }

        if (transactionDetailsResult.transactionDetails === null) {
            console.error("getTransactionDetails failed : transactionDetails is null");
            return;
        }

        console.log("     blockHash " + transactionDetailsResult.transactionDetails.blockHash);
        console.log("     blockNumber " + transactionDetailsResult.transactionDetails.blockNumber);
        console.log("     from " + transactionDetailsResult.transactionDetails.from);
        console.log("     gas " + transactionDetailsResult.transactionDetails.gas);
        console.log("     gasPrice " + transactionDetailsResult.transactionDetails.gasPrice);
        console.log("     hash " + transactionDetailsResult.transactionDetails.hash);
        console.log("     input " + transactionDetailsResult.transactionDetails.input);
        console.log("     nonce " + transactionDetailsResult.transactionDetails.nonce);
        console.log("     to " + transactionDetailsResult.transactionDetails.to);
        console.log("     value " + transactionDetailsResult.transactionDetails.value);

        if (transactionDetailsResult.transactionDetails.receipt === null) {
            console.log("transaction receipt is null. This indiciates the transaction is not yet registered in the blockchain. This transaction may be pending.")
        } else {
            console.log("          cumulativeGasUsed " + transactionDetailsResult.transactionDetails.receipt.cumulativeGasUsed);
            console.log("          effectiveGasPrice " + transactionDetailsResult.transactionDetails.receipt.effectiveGasPrice);
            console.log("          gasUsed " + transactionDetailsResult.transactionDetails.receipt.gasUsed);
            console.log("          hash " + transactionDetailsResult.transactionDetails.receipt.hash);
            console.log("          type " + transactionDetailsResult.transactionDetails.receipt.type);
            console.log("          status " + transactionDetailsResult.transactionDetails.receipt.status);

            if (transactionDetailsResult.transactionDetails.receipt.status === "0x1") {
                console.log("          Transaction has succeeded!!!");
            } else {
                console.log("          Transaction has failed!!!");
            }           
       }
    });


    //Get the latest block details
    console.log("getLatestBlockDetails");
    qcsdk.getLatestBlockDetails(address).then((latestBlockDetailsResult) => {
        if (latestBlockDetailsResult === null) {
            console.error("     getLatestBlockDetails failed : latestBlockDetailsResult is null");
            return;
        }

        if (latestBlockDetailsResult.resultCode !== 0) {
            console.log("     getLatestBlockDetails failed. resultCode is " + latestBlockDetailsResult.resultCode);
            return;
        }

        if (latestBlockDetailsResult.blockDetails === null) {
            console.error("     getLatestBlockDetails failed : blockDetails is null");
            return;
        }

        console.log("     getLatestBlockDetails succeeded:");
        console.log("     latest block number: " + latestBlockDetailsResult.blockDetails.blockNumber);
    });


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

    //Send coins
    //First get account details nonce
    console.log("sendCoins getAccountDetails " + address);
    qcsdk.getAccountDetails(address).then((accountDetailsResult) => {
        if (accountDetailsResult === null) {
            console.error("     sendCoins getAccountDetails failed : accountDetailsResult is null");
            return;
        }

        if (accountDetailsResult.resultCode !== 0) {
            console.log("     sendCoins getAccountDetails failed. resultCode is " + accountDetailsResult.resultCode);
            return;
        }

        if (accountDetailsResult.accountDetails === null) {
            console.error("     sendCoins getAccountDetails failed : accountDetails is null");
            return;
        }

        var toAddress = "0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612";
        var nonce = accountDetailsResult.accountDetails.nonce;
        var coinsInWei = "1000";

        qcsdk.sendCoins(wallet2, toAddress, coinsInWei, nonce).then((sendResult) => {
            if (sendResult === null) {
                console.error("     sendCoins failed : sendResult is null");
                return;
            }

            if (sendResult.resultCode !== 0) {
                console.log("     sendCoins failed. resultCode is " + sendResult.resultCode);
                if (sendResult.response !== null) {
                    console.log("     sendCoin response statusText " + JSON.stringify(sendResult.response.statusText));
                    console.log("     ensure account has adequate gas and nonce is correct");
                }
                return;
            }

            console.log("     sendCoin succeeded. This does not necessarily mean that the transaction has succeded. txnHash " + sendResult.txnHash);
        });
    });
});

