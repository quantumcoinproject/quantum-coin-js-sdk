console.log = function (e) { document.write(e) }


//Step - 0 initApp       
initApp()


//Step - 1 Create
var passphrase = "Test1234567890$$"
var newQuantumWallet = async function createNewQuantumWallet(passphrase) {
    return walletCreateNewWallet(passphrase);
}
console.log(newQuantumWallet)

//Step - 2 Save
var file = saveQuantumWallet(newQuantumWallet);
console.log(file)

//Step - 3 Load
var filename = path + file
var quantumWallet = quantumWalletFileOpen(filename, passphrase)
console.log(quantumWallet)

// get api
var scanApiDomain = "scan.dpapi.org"
var address = quantumWallet.address
var accountDetails = getAccountDetails(scanApiDomain, address)
console.log(accountDetails)


var hash = "0x"
var transactionDetails = getTransaction(scanApiDomain, hash)
console.log(transactionDetails)


//Sent Transaction  api
async function sendCoins(quantumWallet, sendAddress, sendQuantity) {
    try {

        //get account balance
        let accountDetails = await getAccountDetails(currentBlockchainNetwork.scanApiDomain, quantumWallet.address);

        const gas = 21000;
        const chainId = currentBlockchainNetwork.networkId;
        const nonce = accountDetails.nonce;
        const contractData = null;

        var txSigningHash = transactionGetSigningHash(quantumWallet.address, nonce, sendAddress, sendQuantity, gas, chainId, contractData)
        if (txSigningHash == null) {
            alert(langJson.errors.unexpectedError);
            return;
        }

        var quantumSig = walletSign(quantumWallet, txSigningHash);

        var verifyResult = cryptoVerify(txSigningHash, quantumSig, base64ToBytes(quantumWallet.publicKey));
        if (verifyResult == false) {
            return;
        }

        var txHashHex = transactionGetTransactionHash(quantumWallet.address, nonce, sendAddress, sendQuantity, gas, chainId, contractData,
            base64ToBytes(quantumWallet.publicKey), quantumSig);
        if (txHashHex == null) {
            showWarnAlert(langJson.errors.unexpectedError);
            return;
        }

        //account txn data
        let currentDate = new Date();
        var txData = transactionGetData(quantumWallet.address, nonce, sendAddress, sendQuantity, gas, chainId, contractData, base64ToBytes(quantumWallet.publicKey), quantumSig);
        if (txData == null) {
            hideWaitingBox();
            showWarnAlert(langJson.errors.unexpectedError);
            return;
        }

        let result = await postTransaction(currentBlockchainNetwork.txnApiDomain, txData);
        if (result == true) {
            let pendingTxn = new TransactionDetails(txHashHex, currentDate, quantumWallet.address, sendAddress, sendQuantity, true);
            pendingTransactionsMap.set(quantumWallet.address.toLowerCase() + currentBlockchainNetwork.index.toString(), pendingTxn);

            setTimeout(() => {

            }, 1000);
        } else {
            alert(langJson.errors.invalidApiResponse);
        }
    }
    catch (error) {
        if (isNetworkError(error)) {
            alert(langJson.errors.internetDisconnected);
        } else {
            alert(langJson.errors.invalidApiResponse);
        }
    }
}
