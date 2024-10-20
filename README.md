<a name="module_qc-sdk Quantum Coin SDK"></a>

## qc-sdk Quantum Coin SDK
Quantum Coin SDK provides functionality to interact with the Quantum Coin Blockchain using the Relay APIs.[Example Project: https://github.com/DogeProtocol/qc-sdk/example](https://github.com/DogeProtocol/qc-sdk/example)

**Example**  
```js
Installation:npm install qc-sdk --saveAdding reference:var qcsdk = require('qc-sdk');
```

* [qc-sdk Quantum Coin SDK](#module_qc-sdk Quantum Coin SDK)
    * [~Config](#module_qc-sdk Quantum Coin SDK..Config)
        * [new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)](#new_module_qc-sdk Quantum Coin SDK..Config_new)
        * [.readUrl](#module_qc-sdk Quantum Coin SDK..Config+readUrl) : <code>string</code>
        * [.writeUrl](#module_qc-sdk Quantum Coin SDK..Config+writeUrl) : <code>string</code>
        * [.chainId](#module_qc-sdk Quantum Coin SDK..Config+chainId) : <code>number</code>
        * [.readApiKey](#module_qc-sdk Quantum Coin SDK..Config+readApiKey) : <code>string</code>
        * [.writeApiKey](#module_qc-sdk Quantum Coin SDK..Config+writeApiKey) : <code>string</code>
    * [~Wallet](#module_qc-sdk Quantum Coin SDK..Wallet)
        * [new Wallet(address, privateKey, publicKey)](#new_module_qc-sdk Quantum Coin SDK..Wallet_new)
        * [.address](#module_qc-sdk Quantum Coin SDK..Wallet+address) : <code>string</code>
        * [.privateKey](#module_qc-sdk Quantum Coin SDK..Wallet+privateKey)
        * [.publicKey](#module_qc-sdk Quantum Coin SDK..Wallet+publicKey)
    * [~BlockDetails](#module_qc-sdk Quantum Coin SDK..BlockDetails)
        * [.blockNumber](#module_qc-sdk Quantum Coin SDK..BlockDetails+blockNumber) : <code>number</code>
    * [~LatestBlockDetailsResult](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult)
        * [.resultCode](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+resultCode) : <code>number</code>
        * [.blockDetails](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+blockDetails) : <code>BlockDetails</code>
        * [.response](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+response) : <code>Object</code>
    * [~AccountDetails](#module_qc-sdk Quantum Coin SDK..AccountDetails)
        * [.address](#module_qc-sdk Quantum Coin SDK..AccountDetails+address) : <code>string</code>
        * [.balance](#module_qc-sdk Quantum Coin SDK..AccountDetails+balance) : <code>string</code>
        * [.nonce](#module_qc-sdk Quantum Coin SDK..AccountDetails+nonce) : <code>number</code>
        * [.blockNumber](#module_qc-sdk Quantum Coin SDK..AccountDetails+blockNumber) : <code>number</code>
    * [~AccountDetailsResult](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult)
        * [.resultCode](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+resultCode) : <code>number</code>
        * [.accountDetails](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+accountDetails) : <code>AccountDetails</code>
        * [.response](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+response) : <code>Object</code>
    * [~SendResult](#module_qc-sdk Quantum Coin SDK..SendResult)
        * [.resultCode](#module_qc-sdk Quantum Coin SDK..SendResult+resultCode) : <code>number</code>
        * [.txnHash](#module_qc-sdk Quantum Coin SDK..SendResult+txnHash) : <code>string</code>
        * [.response](#module_qc-sdk Quantum Coin SDK..SendResult+response) : <code>Object</code>
    * [~TransactionReceipt](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)
        * [.cumulativeGasUsed](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+cumulativeGasUsed) : <code>string</code>
        * [.effectiveGasPrice](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+effectiveGasPrice) : <code>string</code>
        * [.gasUsed](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+gasUsed) : <code>string</code>
        * [.status](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+status) : <code>string</code>
        * [.hash](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+hash) : <code>string</code>
        * [.type](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+type) : <code>string</code>
    * [~TransactionDetails](#module_qc-sdk Quantum Coin SDK..TransactionDetails)
        * [.blockHash](#module_qc-sdk Quantum Coin SDK..TransactionDetails+blockHash) : <code>string</code>
        * [.blockNumber](#module_qc-sdk Quantum Coin SDK..TransactionDetails+blockNumber) : <code>number</code>
        * [.from](#module_qc-sdk Quantum Coin SDK..TransactionDetails+from) : <code>string</code>
        * [.gas](#module_qc-sdk Quantum Coin SDK..TransactionDetails+gas) : <code>string</code>
        * [.gasPrice](#module_qc-sdk Quantum Coin SDK..TransactionDetails+gasPrice) : <code>string</code>
        * [.hash](#module_qc-sdk Quantum Coin SDK..TransactionDetails+hash) : <code>string</code>
        * [.input](#module_qc-sdk Quantum Coin SDK..TransactionDetails+input) : <code>string</code>
        * [.nonce](#module_qc-sdk Quantum Coin SDK..TransactionDetails+nonce) : <code>number</code>
        * [.to](#module_qc-sdk Quantum Coin SDK..TransactionDetails+to) : <code>string</code>
        * [.value](#module_qc-sdk Quantum Coin SDK..TransactionDetails+value) : <code>string</code>
        * [.receipt](#module_qc-sdk Quantum Coin SDK..TransactionDetails+receipt) : <code>TransactionReceipt</code>
    * [~TransactionDetailsResult](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult)
        * [.resultCode](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+resultCode) : <code>number</code>
        * [.transactionDetails](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+transactionDetails) : <code>TransactionDetails</code>
        * [.response](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+response) : <code>Object</code>
    * [~initialize(clientConfig)](#module_qc-sdk Quantum Coin SDK..initialize) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [~isAddressValid(address)](#module_qc-sdk Quantum Coin SDK..isAddressValid) ⇒ <code>boolean</code>
    * [~newWallet()](#module_qc-sdk Quantum Coin SDK..newWallet) ⇒ <code>Wallet</code>
    * [~verifyWallet(wallet)](#module_qc-sdk Quantum Coin SDK..verifyWallet) ⇒ <code>boolean</code>
    * [~serializeWallet(wallet)](#module_qc-sdk Quantum Coin SDK..serializeWallet) ⇒ <code>string</code>
    * [~deserializeWallet(walletJson)](#module_qc-sdk Quantum Coin SDK..deserializeWallet) ⇒ <code>Wallet</code>
    * [~getLatestBlockDetails()](#module_qc-sdk Quantum Coin SDK..getLatestBlockDetails) ⇒ <code>Promise.&lt;BlockDetailsResult&gt;</code>
    * [~getAccountDetails(address)](#module_qc-sdk Quantum Coin SDK..getAccountDetails) ⇒ <code>Promise.&lt;AccountDetailsResult&gt;</code>
    * [~getTransactionDetails(txnHash)](#module_qc-sdk Quantum Coin SDK..getTransactionDetails) ⇒ <code>Promise.&lt;TransactionDetailsResult&gt;</code>
    * [~sendCoins(wallet, toAddress, coinsInWei, nonce)](#module_qc-sdk Quantum Coin SDK..sendCoins) ⇒ <code>Promise.&lt;SendResult&gt;</code>

<a name="module_qc-sdk Quantum Coin SDK..Config"></a>

### qc-sdk Quantum Coin SDK~Config
This is the configuration class required to initialize and interact with Quantum Coin blockchain

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~Config](#module_qc-sdk Quantum Coin SDK..Config)
    * [new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)](#new_module_qc-sdk Quantum Coin SDK..Config_new)
    * [.readUrl](#module_qc-sdk Quantum Coin SDK..Config+readUrl) : <code>string</code>
    * [.writeUrl](#module_qc-sdk Quantum Coin SDK..Config+writeUrl) : <code>string</code>
    * [.chainId](#module_qc-sdk Quantum Coin SDK..Config+chainId) : <code>number</code>
    * [.readApiKey](#module_qc-sdk Quantum Coin SDK..Config+readApiKey) : <code>string</code>
    * [.writeApiKey](#module_qc-sdk Quantum Coin SDK..Config+writeApiKey) : <code>string</code>

<a name="new_module_qc-sdk Quantum Coin SDK..Config_new"></a>

#### new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)
Creates a config class


| Param | Type | Description |
| --- | --- | --- |
| readUrl | <code>string</code> | The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay. The following URLs are community maintained. Please use your own relay service. Mainnet: https://relayread.dpapi.org Testnet T4: https://t4-relayread.dpapi.org |
| writeUrl | <code>string</code> | The Write API URL pointing to a write relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay. The following URLs are community maintained. Please use your own relay service. Mainnet: https://relaywrite.dpapi.org Testnet T4: https://t4-relaywrite.dpapi.org |
| chainId | <code>number</code> | The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. |
| readApiKey | <code>string</code> | Optional parameter if authorization is enabled for the relay service. API Key for authorization. Defaults to null which indicates no authorization. |
| writeApiKey | <code>string</code> | Optional parameter if authorization is enabled for the relay service. API Key for authorization. Defaults to null which indicates no authorization. |

<a name="module_qc-sdk Quantum Coin SDK..Config+readUrl"></a>

#### config.readUrl : <code>string</code>
The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk Quantum Coin SDK..Config)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Config+writeUrl"></a>

#### config.writeUrl : <code>string</code>
The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk Quantum Coin SDK..Config)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Config+chainId"></a>

#### config.chainId : <code>number</code>
The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk Quantum Coin SDK..Config)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Config+readApiKey"></a>

#### config.readApiKey : <code>string</code>
API Key for authorization if authorization is enabled for the relay service. Defaults to null which indicates no authorization.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk Quantum Coin SDK..Config)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Config+writeApiKey"></a>

#### config.writeApiKey : <code>string</code>
API Key for authorization if authorization is enabled for the relay service. Defaults to null which indicates no authorization.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk Quantum Coin SDK..Config)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Wallet"></a>

### qc-sdk Quantum Coin SDK~Wallet
This class represents a Wallet. Use the verifyWallet function to verify if a wallet is valid. Verifying the wallet is highly recommended, especially if it comes from an untrusted source. For more details on the underlying cryptography of the Wallet, see https://github.com/DogeProtocol/hybrid-pqc

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~Wallet](#module_qc-sdk Quantum Coin SDK..Wallet)
    * [new Wallet(address, privateKey, publicKey)](#new_module_qc-sdk Quantum Coin SDK..Wallet_new)
    * [.address](#module_qc-sdk Quantum Coin SDK..Wallet+address) : <code>string</code>
    * [.privateKey](#module_qc-sdk Quantum Coin SDK..Wallet+privateKey)
    * [.publicKey](#module_qc-sdk Quantum Coin SDK..Wallet+publicKey)

<a name="new_module_qc-sdk Quantum Coin SDK..Wallet_new"></a>

#### new Wallet(address, privateKey, publicKey)
Creates a Wallet class. The constructor does not verify the wallet. To verify a wallet, call the verifyWallet function explicitly.


| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | Address of the wallet |
| privateKey | <code>Array.&lt;byte&gt;</code> | Private Key byte array of the wallet |
| publicKey | <code>Array.&lt;byte&gt;</code> | The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. |

<a name="module_qc-sdk Quantum Coin SDK..Wallet+address"></a>

#### wallet.address : <code>string</code>
Address of the wallet. Is 66 bytes in length including 0x (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_qc-sdk Quantum Coin SDK..Wallet)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Wallet+privateKey"></a>

#### wallet.privateKey
Private Key byte array of the wallet. Is 4064 bytes in length (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_qc-sdk Quantum Coin SDK..Wallet)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..Wallet+publicKey"></a>

#### wallet.publicKey
Public Key byte array of the wallet. Is 1408 bytes in length (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_qc-sdk Quantum Coin SDK..Wallet)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..BlockDetails"></a>

### qc-sdk Quantum Coin SDK~BlockDetails
This class represents a Block.

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..BlockDetails+blockNumber"></a>

#### blockDetails.blockNumber : <code>number</code>
Block Number of the block

**Kind**: instance property of [<code>BlockDetails</code>](#module_qc-sdk Quantum Coin SDK..BlockDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult"></a>

### qc-sdk Quantum Coin SDK~LatestBlockDetailsResult
This class represents a result from invoking the getLatestBlock function.

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~LatestBlockDetailsResult](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult)
    * [.resultCode](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+resultCode) : <code>number</code>
    * [.blockDetails](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+blockDetails) : <code>BlockDetails</code>
    * [.response](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+response) : <code>Object</code>

<a name="module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+resultCode"></a>

#### latestBlockDetailsResult.resultCode : <code>number</code>
Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.

**Kind**: instance property of [<code>LatestBlockDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+blockDetails"></a>

#### latestBlockDetailsResult.blockDetails : <code>BlockDetails</code>
An object of type BlockDetails representing the block. This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>LatestBlockDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult+response"></a>

#### latestBlockDetailsResult.response : <code>Object</code>
An object of representing the raw Response returned by the service. For details, see https://developer.mozilla.org/en-US/docs/Web/API/Response. This value can be null if the value of resultCode is not 0.

**Kind**: instance property of [<code>LatestBlockDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..LatestBlockDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetails"></a>

### qc-sdk Quantum Coin SDK~AccountDetails
This class represents an Account.

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~AccountDetails](#module_qc-sdk Quantum Coin SDK..AccountDetails)
    * [.address](#module_qc-sdk Quantum Coin SDK..AccountDetails+address) : <code>string</code>
    * [.balance](#module_qc-sdk Quantum Coin SDK..AccountDetails+balance) : <code>string</code>
    * [.nonce](#module_qc-sdk Quantum Coin SDK..AccountDetails+nonce) : <code>number</code>
    * [.blockNumber](#module_qc-sdk Quantum Coin SDK..AccountDetails+blockNumber) : <code>number</code>

<a name="module_qc-sdk Quantum Coin SDK..AccountDetails+address"></a>

#### accountDetails.address : <code>string</code>
Address of the wallet. Is 66 bytes in length including 0x.

**Kind**: instance property of [<code>AccountDetails</code>](#module_qc-sdk Quantum Coin SDK..AccountDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetails+balance"></a>

#### accountDetails.balance : <code>string</code>
Balance of the account in wei. To convert this to ethers, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei

**Kind**: instance property of [<code>AccountDetails</code>](#module_qc-sdk Quantum Coin SDK..AccountDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetails+nonce"></a>

#### accountDetails.nonce : <code>number</code>
A monotonically increasing number representing the nonce of the account. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1.

**Kind**: instance property of [<code>AccountDetails</code>](#module_qc-sdk Quantum Coin SDK..AccountDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetails+blockNumber"></a>

#### accountDetails.blockNumber : <code>number</code>
The block number as of which the Account details was retrieved.

**Kind**: instance property of [<code>AccountDetails</code>](#module_qc-sdk Quantum Coin SDK..AccountDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetailsResult"></a>

### qc-sdk Quantum Coin SDK~AccountDetailsResult
This class represents a result from invoking the getAccountDetails function.

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~AccountDetailsResult](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult)
    * [.resultCode](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+resultCode) : <code>number</code>
    * [.accountDetails](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+accountDetails) : <code>AccountDetails</code>
    * [.response](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult+response) : <code>Object</code>

<a name="module_qc-sdk Quantum Coin SDK..AccountDetailsResult+resultCode"></a>

#### accountDetailsResult.resultCode : <code>number</code>
Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.

**Kind**: instance property of [<code>AccountDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetailsResult+accountDetails"></a>

#### accountDetailsResult.accountDetails : <code>AccountDetails</code>
An object of type AccountDetails representing the block. This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>AccountDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..AccountDetailsResult+response"></a>

#### accountDetailsResult.response : <code>Object</code>
An object of representing the raw Response returned by the service. For details, see https://developer.mozilla.org/en-US/docs/Web/API/Response. This value can be null if the value of resultCode is not 0.

**Kind**: instance property of [<code>AccountDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..AccountDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..SendResult"></a>

### qc-sdk Quantum Coin SDK~SendResult
This class represents a result from invoking the sendCoins function.

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~SendResult](#module_qc-sdk Quantum Coin SDK..SendResult)
    * [.resultCode](#module_qc-sdk Quantum Coin SDK..SendResult+resultCode) : <code>number</code>
    * [.txnHash](#module_qc-sdk Quantum Coin SDK..SendResult+txnHash) : <code>string</code>
    * [.response](#module_qc-sdk Quantum Coin SDK..SendResult+response) : <code>Object</code>

<a name="module_qc-sdk Quantum Coin SDK..SendResult+resultCode"></a>

#### sendResult.resultCode : <code>number</code>
Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.

**Kind**: instance property of [<code>SendResult</code>](#module_qc-sdk Quantum Coin SDK..SendResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..SendResult+txnHash"></a>

#### sendResult.txnHash : <code>string</code>
Hash of the Transaction, to uniquely identify it. Is 66 bytes in length including 0x. This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>SendResult</code>](#module_qc-sdk Quantum Coin SDK..SendResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..SendResult+response"></a>

#### sendResult.response : <code>Object</code>
An object of representing the raw Response returned by the service. For details, see https://developer.mozilla.org/en-US/docs/Web/API/Response. This value can be null if the value of resultCode is not 0.

**Kind**: instance property of [<code>SendResult</code>](#module_qc-sdk Quantum Coin SDK..SendResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt"></a>

### qc-sdk Quantum Coin SDK~TransactionReceipt
This class represents a Receipt of a transaction that was registered in the blockchain. The transactionReceipt field can be null unless the transaction is registered with the blockchain. While the transaction is pending, this field will be null. You should consider the transaction as succeeded only if the status field's value is 0x1 (success).

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~TransactionReceipt](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)
    * [.cumulativeGasUsed](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+cumulativeGasUsed) : <code>string</code>
    * [.effectiveGasPrice](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+effectiveGasPrice) : <code>string</code>
    * [.gasUsed](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+gasUsed) : <code>string</code>
    * [.status](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+status) : <code>string</code>
    * [.hash](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+hash) : <code>string</code>
    * [.type](#module_qc-sdk Quantum Coin SDK..TransactionReceipt+type) : <code>string</code>

<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+cumulativeGasUsed"></a>

#### transactionReceipt.cumulativeGasUsed : <code>string</code>
A hexadecimal string representing the total amount of gas used when this transaction was executed in the block.

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+effectiveGasPrice"></a>

#### transactionReceipt.effectiveGasPrice : <code>string</code>
A hexadecimal string representing the sum of the base fee and tip paid per unit of gas.

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+gasUsed"></a>

#### transactionReceipt.gasUsed : <code>string</code>
A hexadecimal string representing the amount of gas used by this specific transaction alone.

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+status"></a>

#### transactionReceipt.status : <code>string</code>
A hexadecimal string representing either 0x1 (success) or 0x0 (failure). Failed transactions can also incur gas fee. You should consider the transaction as succeeded only if the status value is 0x1 (success).

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+hash"></a>

#### transactionReceipt.hash : <code>string</code>
Hash of the Transaction, to uniquely identify it. Is 66 bytes in length including 0x.

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionReceipt+type"></a>

#### transactionReceipt.type : <code>string</code>
A hexadecimal string representing the transaction type. 0x0 is DefaultFeeTxType.

**Kind**: instance property of [<code>TransactionReceipt</code>](#module_qc-sdk Quantum Coin SDK..TransactionReceipt)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails"></a>

### qc-sdk Quantum Coin SDK~TransactionDetails
This class represents a result from invoking the getTransactionDetails function. You should consider the transaction as succeeded only if the status field of the receipt object is 0x1 (success).

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~TransactionDetails](#module_qc-sdk Quantum Coin SDK..TransactionDetails)
    * [.blockHash](#module_qc-sdk Quantum Coin SDK..TransactionDetails+blockHash) : <code>string</code>
    * [.blockNumber](#module_qc-sdk Quantum Coin SDK..TransactionDetails+blockNumber) : <code>number</code>
    * [.from](#module_qc-sdk Quantum Coin SDK..TransactionDetails+from) : <code>string</code>
    * [.gas](#module_qc-sdk Quantum Coin SDK..TransactionDetails+gas) : <code>string</code>
    * [.gasPrice](#module_qc-sdk Quantum Coin SDK..TransactionDetails+gasPrice) : <code>string</code>
    * [.hash](#module_qc-sdk Quantum Coin SDK..TransactionDetails+hash) : <code>string</code>
    * [.input](#module_qc-sdk Quantum Coin SDK..TransactionDetails+input) : <code>string</code>
    * [.nonce](#module_qc-sdk Quantum Coin SDK..TransactionDetails+nonce) : <code>number</code>
    * [.to](#module_qc-sdk Quantum Coin SDK..TransactionDetails+to) : <code>string</code>
    * [.value](#module_qc-sdk Quantum Coin SDK..TransactionDetails+value) : <code>string</code>
    * [.receipt](#module_qc-sdk Quantum Coin SDK..TransactionDetails+receipt) : <code>TransactionReceipt</code>

<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+blockHash"></a>

#### transactionDetails.blockHash : <code>string</code>
A hexadecimal string representing the hash of the block that registered the transaction. This field can be null if the transaction was not registered in the blockchain.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+blockNumber"></a>

#### transactionDetails.blockNumber : <code>number</code>
The number of the block that registered the transaction. This field can be null if the transaction was not registered in the blockchain.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+from"></a>

#### transactionDetails.from : <code>string</code>
A 66 character hexadecimal string representing the address the transaction is sent from.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+gas"></a>

#### transactionDetails.gas : <code>string</code>
A hexadecimal string representing the gas provided for the transaction execution.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+gasPrice"></a>

#### transactionDetails.gasPrice : <code>string</code>
A hexadecimal string representing the gasPrice used for each paid gas, in Wei.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+hash"></a>

#### transactionDetails.hash : <code>string</code>
A hexadecimal string representing the hash of the transaction.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+input"></a>

#### transactionDetails.input : <code>string</code>
A hexadecimal string representing the compiled code of a contract OR the hash of the invoked method signature and encoded parameters.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+nonce"></a>

#### transactionDetails.nonce : <code>number</code>
A monotonically increasing number representing the nonce of the account. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+to"></a>

#### transactionDetails.to : <code>string</code>
A 66 character hexadecimal string representing address the transaction is directed to.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+value"></a>

#### transactionDetails.value : <code>string</code>
A hexadecimal string representing the value sent with this transaction. The value can be 0 for smart contract transactions, since it only represents the number of coins sent.

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetails+receipt"></a>

#### transactionDetails.receipt : <code>TransactionReceipt</code>
The receipt of the transaction. This field will be null while the transaction is pending (not yet registered in the blockchain).

**Kind**: instance property of [<code>TransactionDetails</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetails)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetailsResult"></a>

### qc-sdk Quantum Coin SDK~TransactionDetailsResult
This class represents a result from invoking the getTransactionDetails function. If transactions get discarded by the blockchain, for reasons such as due to lower than minimum gas fees or invalid nonce, the resultCode will always contain a non-zero value (failure).

**Kind**: inner class of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Access**: public  

* [~TransactionDetailsResult](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult)
    * [.resultCode](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+resultCode) : <code>number</code>
    * [.transactionDetails](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+transactionDetails) : <code>TransactionDetails</code>
    * [.response](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+response) : <code>Object</code>

<a name="module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+resultCode"></a>

#### transactionDetailsResult.resultCode : <code>number</code>
Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.

**Kind**: instance property of [<code>TransactionDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+transactionDetails"></a>

#### transactionDetailsResult.transactionDetails : <code>TransactionDetails</code>
An object of type TransactionDetails representing the block. This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>TransactionDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..TransactionDetailsResult+response"></a>

#### transactionDetailsResult.response : <code>Object</code>
An object of representing the raw Response returned by the service. For details, see https://developer.mozilla.org/en-US/docs/Web/API/Response. This value can be null if the value of resultCode is not 0.

**Kind**: instance property of [<code>TransactionDetailsResult</code>](#module_qc-sdk Quantum Coin SDK..TransactionDetailsResult)  
**Access**: public  
<a name="module_qc-sdk Quantum Coin SDK..initialize"></a>

### qc-sdk Quantum Coin SDK~initialize(clientConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
The initialize function has to be called before attempting to invoke any other function. This function should be called only once.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Returns a promise of type boolean; true if the initialization succeeded, else false.  

| Param | Type | Description |
| --- | --- | --- |
| clientConfig | <code>Config</code> | A configuration represented by the Config class |

<a name="module_qc-sdk Quantum Coin SDK..isAddressValid"></a>

### qc-sdk Quantum Coin SDK~isAddressValid(address) ⇒ <code>boolean</code>
The isAddressValid function validates whether an address is valid or not. An address is of length 66 characters including 0x.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>boolean</code> - Returns true if the address validation succeeded, else returns false.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | A string representing the address to validate. |

<a name="module_qc-sdk Quantum Coin SDK..newWallet"></a>

### qc-sdk Quantum Coin SDK~newWallet() ⇒ <code>Wallet</code>
The newWallet function creates a new Wallet.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Wallet</code> - Returns a Wallet object.  
<a name="module_qc-sdk Quantum Coin SDK..verifyWallet"></a>

### qc-sdk Quantum Coin SDK~verifyWallet(wallet) ⇒ <code>boolean</code>
The verifyWallet function verifies whether a Wallet is valid or not. To mitigate spoofing and other attachs, it is highly recommended to verify a wallet, especially if it is from an untrusted source.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>boolean</code> - Returns true if the Wallet verification succeeded, else returns false.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object representing the wallet to verify. |

<a name="module_qc-sdk Quantum Coin SDK..serializeWallet"></a>

### qc-sdk Quantum Coin SDK~serializeWallet(wallet) ⇒ <code>string</code>
The serializeWallet function serializes a Wallet object to a JSON string. You should encrypt the string before saving it to disk or a database.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>string</code> - Returns the Wallet in JSON string format. If the wallet is invalid, null is returned.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object representing the wallet to serialize. |

<a name="module_qc-sdk Quantum Coin SDK..deserializeWallet"></a>

### qc-sdk Quantum Coin SDK~deserializeWallet(walletJson) ⇒ <code>Wallet</code>
The deserializeWallet function creates a Wallet object from a JSON string.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Wallet</code> - Returns the Wallet corresponding to the walletJson. If the wallet is invalid, null is returned.  

| Param | Type | Description |
| --- | --- | --- |
| walletJson | <code>string</code> | A Wallet object representing the wallet to deserialize. |

<a name="module_qc-sdk Quantum Coin SDK..getLatestBlockDetails"></a>

### qc-sdk Quantum Coin SDK~getLatestBlockDetails() ⇒ <code>Promise.&lt;BlockDetailsResult&gt;</code>
The getLatestBlockDetails function returns details of the latest block of the blockchain.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Promise.&lt;BlockDetailsResult&gt;</code> - Returns a promise of an object of type BlockDetailsResult.  
<a name="module_qc-sdk Quantum Coin SDK..getAccountDetails"></a>

### qc-sdk Quantum Coin SDK~getAccountDetails(address) ⇒ <code>Promise.&lt;AccountDetailsResult&gt;</code>
The getAccountDetails function returns details of an account corresponding to the address.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Promise.&lt;AccountDetailsResult&gt;</code> - Returns a probmise of type AccountDetailsResult.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The address of the account of which the details have to be retrieved. |

<a name="module_qc-sdk Quantum Coin SDK..getTransactionDetails"></a>

### qc-sdk Quantum Coin SDK~getTransactionDetails(txnHash) ⇒ <code>Promise.&lt;TransactionDetailsResult&gt;</code>
The getTransactionDetails function returns details of a transaction posted to the blockchain. Transactions may take a while to get registered in the blockchain. Some transactions that have lower balance than the minimum required for gas fees may be discarded. In these cases, the transactions may not be returned when invoking the getTransactionDetails function. You should consider the transaction as succeeded only if the status field of the transactionReceipt object is 0x1 (success). The transactionReceipt field can be null unless the transaction is registered with the blockchain.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Promise.&lt;TransactionDetailsResult&gt;</code> - Returns a probmise of type type TransactionDetailsResult.  

| Param | Type | Description |
| --- | --- | --- |
| txnHash | <code>string</code> | The hash of the transaction to retrieve. |

<a name="module_qc-sdk Quantum Coin SDK..sendCoins"></a>

### qc-sdk Quantum Coin SDK~sendCoins(wallet, toAddress, coinsInWei, nonce) ⇒ <code>Promise.&lt;SendResult&gt;</code>
The sendCoins function posts a send-coin transaction to the blockchain.

**Kind**: inner method of [<code>qc-sdk Quantum Coin SDK</code>](#module_qc-sdk Quantum Coin SDK)  
**Returns**: <code>Promise.&lt;SendResult&gt;</code> - Returns a probmise of type SendResult.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object from which the transaction has to be sent. The address corresponding to the Wallet should have enough coins to cover gas fees as well. A minimum of 1000 coins (1000000000000000000000 wei) are required for gas fees. |
| toAddress | <code>string</code> | The address to which the coins should be sent. |
| coinsInWei | <code>string</code> | The string representing the number of coins (in wei) to send. To convert between ethers and wei, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei |
| nonce | <code>number</code> | The nonce of the account retrieved by invoking the getAccountDetails function. You have to carefully manage state of the nonce to avoid sending the coins multiple times, such as when retrying sendCoins after a network error. |

