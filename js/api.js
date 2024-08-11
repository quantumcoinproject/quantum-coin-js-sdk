const HTTPS = "https://";

//Call back (Read and write api callback) 
var callback = function (error, data, response) {
	if (error) {
		console.error(error);
	} else {
		console.log('API called successfully. Returned data: ' + data);
	}
};


//Read Api
var QcReadApi = require('qc-read-js-sdk');

async function getAccountDetails(scanApiDomain, address) {

	var url = HTTPS + scanApiDomain

	var apiClient = new QcReadApi.ApiClient(url);

	var api = new QcReadApi.ReadApiApi(apiClient)

	let accountDetails = api.getAccountDetails(address, callback);

	return accountDetails;
}


async function getTransaction(scanApiDomain, hash) {

	var url = HTTPS + scanApiDomain

	var apiClient = new QcReadApi.ApiClient(url);

	var api = new QcReadApi.ReadApiApi(apiClient)

	let transactionDetails = api.getTransaction(hash, callback);

	return transactionDetails;
}


//Write Api
var QcWriteApi = require('qc-write-js-sdk');

async function postTransaction(txnApiDomain, txnData) {

	var url = HTTPS + txnApiDomain

	let txnDataJson = JSON.stringify({ txnData: txnData });

	var apiClient = new QcWriteApi.ApiClient(url);

	var opts = {
		'sendTransactionRequest': txnDataJson
	};

	var api = new QcWriteApi.WriteApiApi(apiClient)

	let result = api.sendTransaction(opts, callback);

	return result;
}
