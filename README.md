<a name="module_quantum-coin-js-sdk"></a>

## quantum-coin-js-sdk
Quantum Coin JS SDK provides low level functionality to interact with the Quantum Coin Blockchain.
[Example Project](https://github.com/quantumcoinproject/quantum-coin-js-sdk/tree/main/example)

**Example**  
```js
Requires Node.js version v20.18.1 or higher

Installation:
npm install quantum-coin-js-sdk --save

//Adding reference:
var qcsdk = require('quantum-coin-js-sdk');

//Example initialization with defaults for mainnet
//Initialize the SDK first before invoking any other function
qcsdk.initialize(null).then((initResult) => {
  
}

//Example initialization with specific values
//Initialize the SDK first before invoking any other function
var clientConfigVal = new qcsdk.Config(123123); //Initialization with Mainnet Config (Block Explorer: https://QuantumScan.com)
qcsdk.initialize(clientConfigVal).then((initResult) => {

}
Example Project: https://github.com/quantumcoinproject/quantum-coin-js-sdk/tree/main/example
```

## Browser usage

The SDK runs in modern browsers as well as Node.js (Node 16+ / a browser with WebAssembly and the Web Crypto API). Load `wasm_exec.js` before `index.js` (or bundle them together) and call `initialize()` as usual.

* [quantum-coin-js-sdk](#module_quantum-coin-js-sdk)
    * [~Config](#module_quantum-coin-js-sdk..Config)
        * [new Config(chainId)](#new_module_quantum-coin-js-sdk..Config_new)
        * [.chainId](#module_quantum-coin-js-sdk..Config+chainId) : <code>number</code>
    * [~Wallet](#module_quantum-coin-js-sdk..Wallet)
        * [new Wallet(address, privateKey, publicKey, [preExpansionSeed])](#new_module_quantum-coin-js-sdk..Wallet_new)
        * [.address](#module_quantum-coin-js-sdk..Wallet+address) : <code>string</code>
        * [.privateKey](#module_quantum-coin-js-sdk..Wallet+privateKey) : <code>Array.&lt;number&gt;</code>
        * [.publicKey](#module_quantum-coin-js-sdk..Wallet+publicKey) : <code>Array.&lt;number&gt;</code>
        * [.preExpansionSeed](#module_quantum-coin-js-sdk..Wallet+preExpansionSeed) : <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> \| <code>null</code>
    * [~SignResult](#module_quantum-coin-js-sdk..SignResult)
        * [.resultCode](#module_quantum-coin-js-sdk..SignResult+resultCode) : <code>number</code>
        * [.txnHash](#module_quantum-coin-js-sdk..SignResult+txnHash) : <code>string</code>
        * [.txnData](#module_quantum-coin-js-sdk..SignResult+txnData) : <code>string</code>
    * [~TransactionSigningRequest](#module_quantum-coin-js-sdk..TransactionSigningRequest)
        * [new TransactionSigningRequest(wallet, toAddress, valueInWei, nonce, data, gasLimit, remarks, chainId, signingContext)](#new_module_quantum-coin-js-sdk..TransactionSigningRequest_new)
        * [.wallet](#module_quantum-coin-js-sdk..TransactionSigningRequest+wallet) : <code>Wallet</code>
        * [.toAddress](#module_quantum-coin-js-sdk..TransactionSigningRequest+toAddress) : <code>string</code> \| <code>null</code>
        * [.valueInWei](#module_quantum-coin-js-sdk..TransactionSigningRequest+valueInWei) : <code>string</code> \| <code>BigInt</code> \| <code>null</code>
        * [.nonce](#module_quantum-coin-js-sdk..TransactionSigningRequest+nonce) : <code>number</code>
        * [.data](#module_quantum-coin-js-sdk..TransactionSigningRequest+data) : <code>string</code> \| <code>null</code>
        * [.gasLimit](#module_quantum-coin-js-sdk..TransactionSigningRequest+gasLimit) : <code>number</code>
        * [.remarks](#module_quantum-coin-js-sdk..TransactionSigningRequest+remarks) : <code>string</code> \| <code>null</code>
        * [.chainId](#module_quantum-coin-js-sdk..TransactionSigningRequest+chainId) : <code>number</code> \| <code>null</code>
        * [.signingContext](#module_quantum-coin-js-sdk..TransactionSigningRequest+signingContext) : <code>number</code> \| <code>null</code>
    * [~PackUnpackResult](#module_quantum-coin-js-sdk..PackUnpackResult)
        * [new PackUnpackResult(error, result)](#new_module_quantum-coin-js-sdk..PackUnpackResult_new)
        * [.error](#module_quantum-coin-js-sdk..PackUnpackResult+error) : <code>string</code>
        * [.result](#module_quantum-coin-js-sdk..PackUnpackResult+result) : <code>string</code>
    * [~EventLogEncodeResult](#module_quantum-coin-js-sdk..EventLogEncodeResult)
        * [new EventLogEncodeResult(error, result)](#new_module_quantum-coin-js-sdk..EventLogEncodeResult_new)
        * [.error](#module_quantum-coin-js-sdk..EventLogEncodeResult+error) : <code>string</code>
        * [.result](#module_quantum-coin-js-sdk..EventLogEncodeResult+result) : <code>Object</code> \| <code>null</code>
    * [~EventLogEncodeResult](#module_quantum-coin-js-sdk..EventLogEncodeResult)
        * [new EventLogEncodeResult(error, result)](#new_module_quantum-coin-js-sdk..EventLogEncodeResult_new)
        * [.error](#module_quantum-coin-js-sdk..EventLogEncodeResult+error) : <code>string</code>
        * [.result](#module_quantum-coin-js-sdk..EventLogEncodeResult+result) : <code>Object</code> \| <code>null</code>
    * [~circl](#module_quantum-coin-js-sdk..circl)
    * [~initialize(clientConfig)](#module_quantum-coin-js-sdk..initialize) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [~isAddressValid(address)](#module_quantum-coin-js-sdk..isAddressValid) ⇒ <code>boolean</code>
    * [~getKeyTypeFromPrivateKey(privateKey)](#module_quantum-coin-js-sdk..getKeyTypeFromPrivateKey) ⇒ <code>number</code> \| <code>null</code>
    * [~getKeyTypeFromPublicKey(publicKey)](#module_quantum-coin-js-sdk..getKeyTypeFromPublicKey) ⇒ <code>number</code> \| <code>null</code>
    * [~toUint8Array(key)](#module_quantum-coin-js-sdk..toUint8Array) ⇒ <code>Uint8Array</code>
    * [~newWallet(keyType)](#module_quantum-coin-js-sdk..newWallet) ⇒ <code>Wallet</code> \| <code>number</code>
    * [~newWalletSeedWords(keyType)](#module_quantum-coin-js-sdk..newWalletSeedWords) ⇒ <code>Array.&lt;string&gt;</code> \| <code>number</code> \| <code>null</code>
    * [~openWalletFromSeed(seedArray)](#module_quantum-coin-js-sdk..openWalletFromSeed) ⇒ <code>Wallet</code> \| <code>number</code> \| <code>null</code>
    * [~openWalletFromSeedWords(seedWordList)](#module_quantum-coin-js-sdk..openWalletFromSeedWords) ⇒ <code>Wallet</code> \| <code>number</code> \| <code>null</code>
    * [~deserializeEncryptedWallet(walletJsonString, passphrase)](#module_quantum-coin-js-sdk..deserializeEncryptedWallet) ⇒ <code>Wallet</code>
    * [~serializeEncryptedWallet(wallet, passphrase)](#module_quantum-coin-js-sdk..serializeEncryptedWallet) ⇒ <code>string</code>
    * [~serializeSeedAsEncryptedWallet(seedArray, passphrase)](#module_quantum-coin-js-sdk..serializeSeedAsEncryptedWallet) ⇒ <code>string</code> \| <code>number</code> \| <code>null</code>
    * [~verifyWallet(wallet)](#module_quantum-coin-js-sdk..verifyWallet) ⇒ <code>boolean</code>
    * [~serializeWallet(wallet)](#module_quantum-coin-js-sdk..serializeWallet) ⇒ <code>string</code>
    * [~deserializeWallet(walletJson)](#module_quantum-coin-js-sdk..deserializeWallet) ⇒ <code>Wallet</code> \| <code>null</code>
    * ~~[~signSendCoinTransaction(wallet, toAddress, coins, nonce)](#module_quantum-coin-js-sdk..signSendCoinTransaction) ⇒ <code>Promise.&lt;SignResult&gt;</code>~~
    * ~~[~signTransaction(wallet, toAddress, coins, nonce, data)](#module_quantum-coin-js-sdk..signTransaction) ⇒ <code>Promise.&lt;SignResult&gt;</code>~~
    * [~hexStringToUint8Array(hex)](#module_quantum-coin-js-sdk..hexStringToUint8Array) ⇒ <code>Uint8Array</code>
    * [~signRawTransaction(transactionSigningRequest)](#module_quantum-coin-js-sdk..signRawTransaction) ⇒ <code>SignResult</code>
    * [~getGasPrice(keyType, [fullSign])](#module_quantum-coin-js-sdk..getGasPrice) ⇒ <code>Object</code>
    * [~sign(privateKey, message, [signingContext])](#module_quantum-coin-js-sdk..sign) ⇒ <code>Object</code>
    * [~verify(publicKey, signature, message)](#module_quantum-coin-js-sdk..verify) ⇒ <code>Object</code>
    * [~publicKeyFromSignature(digest, signature)](#module_quantum-coin-js-sdk..publicKeyFromSignature) ⇒ <code>string</code>
    * [~publicKeyFromPrivateKey(privateKey)](#module_quantum-coin-js-sdk..publicKeyFromPrivateKey) ⇒ <code>string</code>
    * [~addressFromPublicKey(publicKey)](#module_quantum-coin-js-sdk..addressFromPublicKey) ⇒ <code>string</code>
    * [~scryptDeriveKey(secret, salt, N, r, p, dkLen)](#module_quantum-coin-js-sdk..scryptDeriveKey) ⇒ <code>Array.&lt;number&gt;</code>
    * [~sha256(data)](#module_quantum-coin-js-sdk..sha256) ⇒ <code>Array.&lt;number&gt;</code>
    * [~sha512(data)](#module_quantum-coin-js-sdk..sha512) ⇒ <code>Array.&lt;number&gt;</code>
    * [~ripemd160(data)](#module_quantum-coin-js-sdk..ripemd160) ⇒ <code>Array.&lt;number&gt;</code>
    * [~computeHmac(algorithm, key, data)](#module_quantum-coin-js-sdk..computeHmac) ⇒ <code>Array.&lt;number&gt;</code>
    * [~pbkdf2(password, salt, iterations, keylen, algorithm)](#module_quantum-coin-js-sdk..pbkdf2) ⇒ <code>Array.&lt;number&gt;</code>
    * [~combinePublicKeySignature(publicKey, signature)](#module_quantum-coin-js-sdk..combinePublicKeySignature) ⇒ <code>string</code>
    * [~packMethodData(abiJSON, methodName, ...args)](#module_quantum-coin-js-sdk..packMethodData) ⇒ <code>PackUnpackResult</code>
    * [~unpackMethodData(abiJSON, methodName, hexData)](#module_quantum-coin-js-sdk..unpackMethodData) ⇒ <code>PackUnpackResult</code>
    * [~packCreateContractData(abiJSON, bytecode, ...args)](#module_quantum-coin-js-sdk..packCreateContractData) ⇒ <code>PackUnpackResult</code>
    * [~encodeEventLog(abiJSON, eventName, ...args)](#module_quantum-coin-js-sdk..encodeEventLog) ⇒ <code>EventLogEncodeResult</code>
    * [~decodeEventLog(abiJSON, eventName, topics, data)](#module_quantum-coin-js-sdk..decodeEventLog) ⇒ <code>PackUnpackResult</code>
    * [~encodeRlp(value)](#module_quantum-coin-js-sdk..encodeRlp) ⇒ <code>PackUnpackResult</code>
    * [~decodeRlp(data)](#module_quantum-coin-js-sdk..decodeRlp) ⇒ <code>PackUnpackResult</code>
    * [~createAddress(address, nonce)](#module_quantum-coin-js-sdk..createAddress) ⇒ <code>string</code> \| <code>null</code>
    * [~createAddress2(address, salt, initHash)](#module_quantum-coin-js-sdk..createAddress2) ⇒ <code>string</code> \| <code>null</code>

<a name="module_quantum-coin-js-sdk..Config"></a>

### quantum-coin-js-sdk~Config
This is the configuration class required to initialize the Quantum Coin SDK for offline operations such as wallet management and transaction signing.

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Access**: public  

* [~Config](#module_quantum-coin-js-sdk..Config)
    * [new Config(chainId)](#new_module_quantum-coin-js-sdk..Config_new)
    * [.chainId](#module_quantum-coin-js-sdk..Config+chainId) : <code>number</code>

<a name="new_module_quantum-coin-js-sdk..Config_new"></a>

#### new Config(chainId)
Creates a config class


| Param | Type | Description |
| --- | --- | --- |
| chainId | <code>number</code> | The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. |

<a name="module_quantum-coin-js-sdk..Config+chainId"></a>

#### config.chainId : <code>number</code>
The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324.

**Kind**: instance property of [<code>Config</code>](#module_quantum-coin-js-sdk..Config)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..Wallet"></a>

### quantum-coin-js-sdk~Wallet
This class represents a Wallet. Use the verifyWallet function to verify if a wallet is valid. Verifying the wallet is highly recommended, especially if it comes from an untrusted source. For more details on the underlying cryptography of the Wallet, see https://github.com/quantumcoinproject/circl

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Access**: public  

* [~Wallet](#module_quantum-coin-js-sdk..Wallet)
    * [new Wallet(address, privateKey, publicKey, [preExpansionSeed])](#new_module_quantum-coin-js-sdk..Wallet_new)
    * [.address](#module_quantum-coin-js-sdk..Wallet+address) : <code>string</code>
    * [.privateKey](#module_quantum-coin-js-sdk..Wallet+privateKey) : <code>Array.&lt;number&gt;</code>
    * [.publicKey](#module_quantum-coin-js-sdk..Wallet+publicKey) : <code>Array.&lt;number&gt;</code>
    * [.preExpansionSeed](#module_quantum-coin-js-sdk..Wallet+preExpansionSeed) : <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> \| <code>null</code>

<a name="new_module_quantum-coin-js-sdk..Wallet_new"></a>

#### new Wallet(address, privateKey, publicKey, [preExpansionSeed])
Creates a Wallet class. The constructor does not verify the wallet. To verify a wallet, call the verifyWallet function explicitly.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| address | <code>string</code> |  | Address of the wallet |
| privateKey | <code>Array.&lt;number&gt;</code> |  | Private Key byte array of the wallet |
| publicKey | <code>Array.&lt;number&gt;</code> |  | Public Key byte array of the wallet |
| [preExpansionSeed] | <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> \| <code>null</code> | <code></code> | Optional pre-expansion seed bytes. Non-null only for seed-derived wallets. |

<a name="module_quantum-coin-js-sdk..Wallet+address"></a>

#### wallet.address : <code>string</code>
Address of the wallet. Is 66 bytes in length including 0x (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_quantum-coin-js-sdk..Wallet)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..Wallet+privateKey"></a>

#### wallet.privateKey : <code>Array.&lt;number&gt;</code>
Private Key byte array of the wallet. Is 4064 bytes in length (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_quantum-coin-js-sdk..Wallet)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..Wallet+publicKey"></a>

#### wallet.publicKey : <code>Array.&lt;number&gt;</code>
Public Key byte array of the wallet. Is 1408 bytes in length (if the wallet is valid).

**Kind**: instance property of [<code>Wallet</code>](#module_quantum-coin-js-sdk..Wallet)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..Wallet+preExpansionSeed"></a>

#### wallet.preExpansionSeed : <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> \| <code>null</code>
Pre-expansion seed bytes. Can be null if the wallet was not created from a seed.

**Kind**: instance property of [<code>Wallet</code>](#module_quantum-coin-js-sdk..Wallet)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..SignResult"></a>

### quantum-coin-js-sdk~SignResult
This class represents a result from invoking the signSendCoinTransaction function.

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Access**: public  

* [~SignResult](#module_quantum-coin-js-sdk..SignResult)
    * [.resultCode](#module_quantum-coin-js-sdk..SignResult+resultCode) : <code>number</code>
    * [.txnHash](#module_quantum-coin-js-sdk..SignResult+txnHash) : <code>string</code>
    * [.txnData](#module_quantum-coin-js-sdk..SignResult+txnData) : <code>string</code>

<a name="module_quantum-coin-js-sdk..SignResult+resultCode"></a>

#### signResult.resultCode : <code>number</code>
Represents the result of the operation. A value of 0 represents that the operation succeeded. Any other value indicates the operation failed. See the result code section for more details.

**Kind**: instance property of [<code>SignResult</code>](#module_quantum-coin-js-sdk..SignResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..SignResult+txnHash"></a>

#### signResult.txnHash : <code>string</code>
Hash of the Transaction, to uniquely identify it. Is 66 bytes in length including 0x. This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>SignResult</code>](#module_quantum-coin-js-sdk..SignResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..SignResult+txnData"></a>

#### signResult.txnData : <code>string</code>
A payload representing the signed transaction. 
To actually send a transaction, this payload can then be broadcast to the blockchain from a connected device (for example, via a relay or RPC endpoint). 
This value is null if the value of resultCode is not 0.

**Kind**: instance property of [<code>SignResult</code>](#module_quantum-coin-js-sdk..SignResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest"></a>

### quantum-coin-js-sdk~TransactionSigningRequest
This class represents a signing request that can be passed to signTransaction.

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Access**: public  

* [~TransactionSigningRequest](#module_quantum-coin-js-sdk..TransactionSigningRequest)
    * [new TransactionSigningRequest(wallet, toAddress, valueInWei, nonce, data, gasLimit, remarks, chainId, signingContext)](#new_module_quantum-coin-js-sdk..TransactionSigningRequest_new)
    * [.wallet](#module_quantum-coin-js-sdk..TransactionSigningRequest+wallet) : <code>Wallet</code>
    * [.toAddress](#module_quantum-coin-js-sdk..TransactionSigningRequest+toAddress) : <code>string</code> \| <code>null</code>
    * [.valueInWei](#module_quantum-coin-js-sdk..TransactionSigningRequest+valueInWei) : <code>string</code> \| <code>BigInt</code> \| <code>null</code>
    * [.nonce](#module_quantum-coin-js-sdk..TransactionSigningRequest+nonce) : <code>number</code>
    * [.data](#module_quantum-coin-js-sdk..TransactionSigningRequest+data) : <code>string</code> \| <code>null</code>
    * [.gasLimit](#module_quantum-coin-js-sdk..TransactionSigningRequest+gasLimit) : <code>number</code>
    * [.remarks](#module_quantum-coin-js-sdk..TransactionSigningRequest+remarks) : <code>string</code> \| <code>null</code>
    * [.chainId](#module_quantum-coin-js-sdk..TransactionSigningRequest+chainId) : <code>number</code> \| <code>null</code>
    * [.signingContext](#module_quantum-coin-js-sdk..TransactionSigningRequest+signingContext) : <code>number</code> \| <code>null</code>

<a name="new_module_quantum-coin-js-sdk..TransactionSigningRequest_new"></a>

#### new TransactionSigningRequest(wallet, toAddress, valueInWei, nonce, data, gasLimit, remarks, chainId, signingContext)
Creates a TransactionSigningRequest class.


| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | The wallet with which the transaction has to be signed. The constructor does not verify the wallet. To verify a wallet, call the verifyWallet function explicitly. |
| toAddress | <code>string</code> | The address to which the transaction request is made. Can be null (for example, for contract creation). |
| valueInWei | <code>string</code> \| <code>BigInt</code> | The value in wei-units. Can be provided as either a hex string (including 0x prefix) or a BigInt. For example, to represent 1 coin, which is 1000000000000000000 in wei-units, set the value to "0xDE0B6B3A7640000" or BigInt("1000000000000000000"). [Conversion Examples](/example/conversion-example.js) |
| nonce | <code>number</code> | A monotonically increasing number representing the nonce of the account signing the transaction. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1. |
| data | <code>string</code> | An optional hex string (including 0x) that represents the contract data. Can be null if not invoking or creating a contract. |
| gasLimit | <code>number</code> | A limit of gas to be used. Set 21000 for basic non smart contract transactions. |
| remarks | <code>string</code> | An optional hex string (including 0x) that represents a remark (such as a comment). Maximum 32 bytes length (in bytes). Warning, do not store any sensitive information in this field. |
| chainId | <code>number</code> \| <code>null</code> | The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. If null, the chainId specified in the initialize() function will be used. |
| signingContext | <code>number</code> \| <code>null</code> | It is recommended that you pass null for this parameter, unless the context needs to be set explicitly. Signing context determines the cryptographic scheme used to sign. The wallet key type should compatible with the signing context. Applicable values are 0,1,2. Default value if not specified will be determined dynamically from the wallet key type. Signing context 1,2 will incur additional gas fee. For information on the schemes, see https://github.com/quantumcoinproject/circl?tab=readme-ov-file#hybrid-schemes Signing context 0: Scheme used is hybrid-ed-mldsa-slhdsa compact (scheme id 3) Signing context 1: Scheme used is hybrid-ed-mldsa-slhdsa-5 (scheme id 5 : 20x the gas fee of scheme 0) Signing context 2: hybrid-ed-mldsa-slhdsa full (scheme id 4 : 30x the gas fee of scheme 0) |

<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+wallet"></a>

#### transactionSigningRequest.wallet : <code>Wallet</code>
The wallet that should be used to sign the transaction.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+toAddress"></a>

#### transactionSigningRequest.toAddress : <code>string</code> \| <code>null</code>
The address to which the transaction request is made. Can be null (for example, for contract creation).

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+valueInWei"></a>

#### transactionSigningRequest.valueInWei : <code>string</code> \| <code>BigInt</code> \| <code>null</code>
The value in wei-units. Can be provided as either a hex string (including 0x prefix) or a BigInt. For example, to represent 1 coin, which is 1000000000000000000 in wei-units, set the value to "0xDE0B6B3A7640000" or BigInt("1000000000000000000"). [Conversion Examples](/example/conversion-example.js)

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+nonce"></a>

#### transactionSigningRequest.nonce : <code>number</code>
A monotonically increasing number representing the nonce of the account signing the transaction. After each transaction from the account that gets registered in the blockchain, the nonce increases by 1.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+data"></a>

#### transactionSigningRequest.data : <code>string</code> \| <code>null</code>
An optional hex string (including 0x) that represents the contract data. Can be null if not invoking or creating a contract.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+gasLimit"></a>

#### transactionSigningRequest.gasLimit : <code>number</code>
A limit of gas to be used. Set 21000 for basic non smart contract transactions.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+remarks"></a>

#### transactionSigningRequest.remarks : <code>string</code> \| <code>null</code>
An optional hex string (including 0x) that represents a remark (such as a comment). Maximum 32 bytes length (in bytes). Warning, do not store any sensitive information in this field.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+chainId"></a>

#### transactionSigningRequest.chainId : <code>number</code> \| <code>null</code>
The chain id of the blockchain. Mainnet chainId is 123123. If null, the chainId specified in the initialize() function will be used.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..TransactionSigningRequest+signingContext"></a>

#### transactionSigningRequest.signingContext : <code>number</code> \| <code>null</code>
It is recommended that you pass null for this parameter, unless the context needs to be set explicitly. Signing context determines the cryptographic scheme used to sign. Gas fee varies by context.

**Kind**: instance property of [<code>TransactionSigningRequest</code>](#module_quantum-coin-js-sdk..TransactionSigningRequest)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..PackUnpackResult"></a>

### quantum-coin-js-sdk~PackUnpackResult
This class represents a result from invoking the packMethodData or unpackMethodData functions.

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Access**: public  

* [~PackUnpackResult](#module_quantum-coin-js-sdk..PackUnpackResult)
    * [new PackUnpackResult(error, result)](#new_module_quantum-coin-js-sdk..PackUnpackResult_new)
    * [.error](#module_quantum-coin-js-sdk..PackUnpackResult+error) : <code>string</code>
    * [.result](#module_quantum-coin-js-sdk..PackUnpackResult+result) : <code>string</code>

<a name="new_module_quantum-coin-js-sdk..PackUnpackResult_new"></a>

#### new PackUnpackResult(error, result)
Creates a PackUnpackResult class.


| Param | Type | Description |
| --- | --- | --- |
| error | <code>string</code> | Error message if any. Empty string if no error. |
| result | <code>string</code> | The actual result as a string. Empty string if there was an error. |

<a name="module_quantum-coin-js-sdk..PackUnpackResult+error"></a>

#### packUnpackResult.error : <code>string</code>
Error message if any. Empty string if no error.

**Kind**: instance property of [<code>PackUnpackResult</code>](#module_quantum-coin-js-sdk..PackUnpackResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..PackUnpackResult+result"></a>

#### packUnpackResult.result : <code>string</code>
The actual result as a string. Empty string if there was an error.

**Kind**: instance property of [<code>PackUnpackResult</code>](#module_quantum-coin-js-sdk..PackUnpackResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..EventLogEncodeResult"></a>

### quantum-coin-js-sdk~EventLogEncodeResult
This class represents a result from invoking the encodeEventLog function.

**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  

* [~EventLogEncodeResult](#module_quantum-coin-js-sdk..EventLogEncodeResult)
    * [new EventLogEncodeResult(error, result)](#new_module_quantum-coin-js-sdk..EventLogEncodeResult_new)
    * [.error](#module_quantum-coin-js-sdk..EventLogEncodeResult+error) : <code>string</code>
    * [.result](#module_quantum-coin-js-sdk..EventLogEncodeResult+result) : <code>Object</code> \| <code>null</code>

<a name="new_module_quantum-coin-js-sdk..EventLogEncodeResult_new"></a>

#### new EventLogEncodeResult(error, result)
Creates an EventLogEncodeResult class.


| Param | Type | Description |
| --- | --- | --- |
| error | <code>string</code> | Error message if any. Empty string if no error. |
| result | <code>Object</code> \| <code>null</code> | The actual result object with topics and data. Null if there was an error. |
| result.topics | <code>Array.&lt;string&gt;</code> | Array of topic hex strings (with 0x prefix) |
| result.data | <code>string</code> | Hex-encoded data string (with 0x prefix) |

<a name="module_quantum-coin-js-sdk..EventLogEncodeResult+error"></a>

#### eventLogEncodeResult.error : <code>string</code>
Error message if any. Empty string if no error.

**Kind**: instance property of [<code>EventLogEncodeResult</code>](#module_quantum-coin-js-sdk..EventLogEncodeResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..EventLogEncodeResult+result"></a>

#### eventLogEncodeResult.result : <code>Object</code> \| <code>null</code>
The actual result object with topics and data. Null if there was an error.

**Kind**: instance property of [<code>EventLogEncodeResult</code>](#module_quantum-coin-js-sdk..EventLogEncodeResult)  
**Access**: public  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| topics | <code>Array.&lt;string&gt;</code> | Array of topic hex strings (with 0x prefix) |
| data | <code>string</code> | Hex-encoded data string (with 0x prefix) |

<a name="module_quantum-coin-js-sdk..EventLogEncodeResult"></a>

### quantum-coin-js-sdk~EventLogEncodeResult
**Kind**: inner class of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  

* [~EventLogEncodeResult](#module_quantum-coin-js-sdk..EventLogEncodeResult)
    * [new EventLogEncodeResult(error, result)](#new_module_quantum-coin-js-sdk..EventLogEncodeResult_new)
    * [.error](#module_quantum-coin-js-sdk..EventLogEncodeResult+error) : <code>string</code>
    * [.result](#module_quantum-coin-js-sdk..EventLogEncodeResult+result) : <code>Object</code> \| <code>null</code>

<a name="new_module_quantum-coin-js-sdk..EventLogEncodeResult_new"></a>

#### new EventLogEncodeResult(error, result)
Creates an EventLogEncodeResult class.


| Param | Type | Description |
| --- | --- | --- |
| error | <code>string</code> | Error message if any. Empty string if no error. |
| result | <code>Object</code> \| <code>null</code> | The actual result object with topics and data. Null if there was an error. |
| result.topics | <code>Array.&lt;string&gt;</code> | Array of topic hex strings (with 0x prefix) |
| result.data | <code>string</code> | Hex-encoded data string (with 0x prefix) |

<a name="module_quantum-coin-js-sdk..EventLogEncodeResult+error"></a>

#### eventLogEncodeResult.error : <code>string</code>
Error message if any. Empty string if no error.

**Kind**: instance property of [<code>EventLogEncodeResult</code>](#module_quantum-coin-js-sdk..EventLogEncodeResult)  
**Access**: public  
<a name="module_quantum-coin-js-sdk..EventLogEncodeResult+result"></a>

#### eventLogEncodeResult.result : <code>Object</code> \| <code>null</code>
The actual result object with topics and data. Null if there was an error.

**Kind**: instance property of [<code>EventLogEncodeResult</code>](#module_quantum-coin-js-sdk..EventLogEncodeResult)  
**Access**: public  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| topics | <code>Array.&lt;string&gt;</code> | Array of topic hex strings (with 0x prefix) |
| data | <code>string</code> | Hex-encoded data string (with 0x prefix) |

<a name="module_quantum-coin-js-sdk..circl"></a>

### quantum-coin-js-sdk~circl
CIRCL WASM namespace (set after InitAccountsWebAssembly). Use getCircl() for access.

**Kind**: inner property of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
<a name="module_quantum-coin-js-sdk..initialize"></a>

### quantum-coin-js-sdk~initialize(clientConfig) ⇒ <code>Promise.&lt;boolean&gt;</code>
The initialize function has to be called before attempting to invoke any other function. This function should be called only once.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Returns a promise of type boolean; true if the initialization succeeded, else false.  

| Param | Type | Description |
| --- | --- | --- |
| clientConfig | <code>Config</code> \| <code>undefined</code> | A configuration represented by the Config class. A default configuration is used, if not specified. |

<a name="module_quantum-coin-js-sdk..isAddressValid"></a>

### quantum-coin-js-sdk~isAddressValid(address) ⇒ <code>boolean</code>
The isAddressValid function validates whether an address is valid or not. An address is of length 66 characters including 0x.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>boolean</code> - Returns true if the address validation succeeded, else returns false.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | A string representing the address to validate. |

<a name="module_quantum-coin-js-sdk..getKeyTypeFromPrivateKey"></a>

### quantum-coin-js-sdk~getKeyTypeFromPrivateKey(privateKey) ⇒ <code>number</code> \| <code>null</code>
Internal: get key type (KEY_TYPE_HYBRIDEDMLDSASLHDSA or KEY_TYPE_HYBRIDEDMLDSASLHDSA5) from private key length.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>number</code> \| <code>null</code> - KEY_TYPE_HYBRIDEDMLDSASLHDSA (3), KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5), or null on error.  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Wallet private key bytes. |

<a name="module_quantum-coin-js-sdk..getKeyTypeFromPublicKey"></a>

### quantum-coin-js-sdk~getKeyTypeFromPublicKey(publicKey) ⇒ <code>number</code> \| <code>null</code>
Internal: get key type (KEY_TYPE_HYBRIDEDMLDSASLHDSA or KEY_TYPE_HYBRIDEDMLDSASLHDSA5) from public key length.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>number</code> \| <code>null</code> - KEY_TYPE_HYBRIDEDMLDSASLHDSA (3), KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5), or null on error.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Public key bytes. |

<a name="module_quantum-coin-js-sdk..toUint8Array"></a>

### quantum-coin-js-sdk~toUint8Array(key) ⇒ <code>Uint8Array</code>
Convert key (number[] or Uint8Array) to Uint8Array for CIRCL.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Key bytes. |

<a name="module_quantum-coin-js-sdk..newWallet"></a>

### quantum-coin-js-sdk~newWallet(keyType) ⇒ <code>Wallet</code> \| <code>number</code>
The newWallet function creates a new Wallet.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Wallet</code> \| <code>number</code> - Returns a Wallet object, or -1000 (not initialized), -1001 (invalid key type), -1002 (crypto failure).  

| Param | Type | Description |
| --- | --- | --- |
| keyType | <code>number</code> \| <code>null</code> | Optional. KEY_TYPE_HYBRIDEDMLDSASLHDSA (3) or KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5). null/undefined defaults to 3. |

<a name="module_quantum-coin-js-sdk..newWalletSeedWords"></a>

### quantum-coin-js-sdk~newWalletSeedWords(keyType) ⇒ <code>Array.&lt;string&gt;</code> \| <code>number</code> \| <code>null</code>
The newWalletSeedWords function creates a new wallet seed word list. The returned array can then be passed to the openWalletFromSeedWords function to create a new wallet.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;string&gt;</code> \| <code>number</code> \| <code>null</code> - Returns an array of seed words (32 or 36 words depending on keyType). Returns -1000 if not initialized, null on failure.  

| Param | Type | Description |
| --- | --- | --- |
| keyType | <code>number</code> \| <code>null</code> | Optional. KEY_TYPE_HYBRIDEDMLDSASLHDSA (3) or KEY_TYPE_HYBRIDEDMLDSASLHDSA5 (5). null/undefined defaults to 3. |

<a name="module_quantum-coin-js-sdk..openWalletFromSeed"></a>

### quantum-coin-js-sdk~openWalletFromSeed(seedArray) ⇒ <code>Wallet</code> \| <code>number</code> \| <code>null</code>
The openWalletFromSeed function creates a wallet from a raw seed byte array.
Determines the key scheme from the array length: 96 bytes (hybrideds), 72 bytes (hybrid5), or 64 bytes (hybrid).

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Wallet</code> \| <code>number</code> \| <code>null</code> - Returns a Wallet object. Returns -1000 if not initialized, null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| seedArray | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | The raw seed bytes. Length 96, 72, or 64 depending on scheme. |

<a name="module_quantum-coin-js-sdk..openWalletFromSeedWords"></a>

### quantum-coin-js-sdk~openWalletFromSeedWords(seedWordList) ⇒ <code>Wallet</code> \| <code>number</code> \| <code>null</code>
The openWalletFromSeedWords function creates a wallet from a seed word list. The seed word list is available for wallets created from Desktop/Web/Mobile wallets.
Supports 48 words (hybrideds), 36 words (hybrid5), or 32 words (hybrid) per seed length.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Wallet</code> \| <code>number</code> \| <code>null</code> - Returns a Wallet object. Returns -1000 if not initialized, null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| seedWordList | <code>Array.&lt;string&gt;</code> | An array of seed words. Length 48, 36, or 32 depending on scheme. |

<a name="module_quantum-coin-js-sdk..deserializeEncryptedWallet"></a>

### quantum-coin-js-sdk~deserializeEncryptedWallet(walletJsonString, passphrase) ⇒ <code>Wallet</code>
The deserializeEncryptedWallet function opens a wallet backed-up using an application such as the Desktop/Mobile/CLI/Web wallet. This function can take upto a minute or so to execute. You should open wallets only from trusted sources.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Wallet</code> - Returns a Wallet object. Returns null if opening the wallet fails.  

| Param | Type | Description |
| --- | --- | --- |
| walletJsonString | <code>string</code> | The json string from a wallet file. |
| passphrase | <code>string</code> | The passphrase used to encrypt the wallet. |

<a name="module_quantum-coin-js-sdk..serializeEncryptedWallet"></a>

### quantum-coin-js-sdk~serializeEncryptedWallet(wallet, passphrase) ⇒ <code>string</code>
The serializeEncryptedWallet function encrypts and serializes a Wallet object to a JSON string readable by the Desktop/Mobile/Web/CLI wallet applications. You can save this string to a file and open the file in one of these wallet applications. You may also open this string using the deserializeEncryptedWallet function. If you loose the passphrase, you will be unable to open the wallet. This function can take upto a minute or so to execute.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - Returns the Wallet in JSON string format. If the wallet is invalid, null is returned.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object representing the wallet to serialize. |
| passphrase | <code>string</code> | A passphrase used to encrypt the wallet. It should atleast be 12 characters long. |

<a name="module_quantum-coin-js-sdk..serializeSeedAsEncryptedWallet"></a>

### quantum-coin-js-sdk~serializeSeedAsEncryptedWallet(seedArray, passphrase) ⇒ <code>string</code> \| <code>number</code> \| <code>null</code>
The serializeSeedAsEncryptedWallet function encrypts a raw seed byte array into a wallet JSON string
that can be opened with deserializeEncryptedWallet or Desktop/Mobile/Web/CLI wallet applications.
The seed is stored in its pre-expansion form (version 5 wallet format). This function can take
up to a minute or so to execute due to key derivation.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> \| <code>number</code> \| <code>null</code> - Returns the encrypted wallet JSON string. Returns -1000 if not initialized, null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| seedArray | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | The raw seed bytes. Length must be 96, 72, or 64 depending on scheme. |
| passphrase | <code>string</code> | A passphrase used to encrypt the wallet. Must be at least 12 characters long. |

<a name="module_quantum-coin-js-sdk..verifyWallet"></a>

### quantum-coin-js-sdk~verifyWallet(wallet) ⇒ <code>boolean</code>
The verifyWallet function verifies whether a Wallet is valid or not. To mitigate spoofing and other attachs, it is highly recommended to verify a wallet, especially if it is from an untrusted source.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>boolean</code> - Returns true if the Wallet verification succeeded, else returns false.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object representing the wallet to verify. |

<a name="module_quantum-coin-js-sdk..serializeWallet"></a>

### quantum-coin-js-sdk~serializeWallet(wallet) ⇒ <code>string</code>
The serializeWallet function serializes a Wallet object to a JSON string. You should encrypt the string before saving it to disk or a database.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - Returns the Wallet in JSON string format. If the wallet is invalid, null is returned.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object representing the wallet to serialize. |

<a name="module_quantum-coin-js-sdk..deserializeWallet"></a>

### quantum-coin-js-sdk~deserializeWallet(walletJson) ⇒ <code>Wallet</code> \| <code>null</code>
The deserializeWallet function creates a Wallet object from a JSON string.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Wallet</code> \| <code>null</code> - Returns the Wallet corresponding to the walletJson. If the wallet is invalid or the JSON is malformed, null is returned.  

| Param | Type | Description |
| --- | --- | --- |
| walletJson | <code>string</code> | A JSON string representing the wallet to deserialize. |

<a name="module_quantum-coin-js-sdk..signSendCoinTransaction"></a>

### ~~quantum-coin-js-sdk~signSendCoinTransaction(wallet, toAddress, coins, nonce) ⇒ <code>Promise.&lt;SignResult&gt;</code>~~
***Use signRawTransaction instead.***

The signSendCoinTransaction function returns a signed transaction. The chainId used for signing should be provided in the initialize() function.
Since the gas fee for sending coins is fixed at 1000 coins, there is no option to set the gas fee explicitly.
This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Promise.&lt;SignResult&gt;</code> - Returns a promise of type SignResult.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object from which the transaction has to be sent. The address corresponding to the Wallet should have enough coins to cover gas fees as well. A minimum of 1000 coins (1000000000000000000000 wei) are required for gas fees. |
| toAddress | <code>string</code> | The address to which the coins should be sent. |
| coins | <code>string</code> | The string representing the number of coins (in ether) to send. To convert between ethers and wei, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei |
| nonce | <code>number</code> | A monotonically increasing number representing the nonce of the account. You have to carefully manage the state of the nonce to avoid sending the coins multiple times, such as when retrying after an error. |

<a name="module_quantum-coin-js-sdk..signTransaction"></a>

### ~~quantum-coin-js-sdk~signTransaction(wallet, toAddress, coins, nonce, data) ⇒ <code>Promise.&lt;SignResult&gt;</code>~~
***Use signRawTransaction instead.***

The signTransaction function returns a signed transaction. The chainId used for signing should be provided in the initialize() function.
Since the gas fee for sending coins is fixed at 1000 coins, there is no option to set the gas fee explicitly.
This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Promise.&lt;SignResult&gt;</code> - Returns a promise of type SignResult.  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>Wallet</code> | A Wallet object from which the transaction has to be sent. The address corresponding to the Wallet should have enough coins to cover gas fees as well. A minimum of 1000 coins (1000000000000000000000 wei) are required for gas fees. |
| toAddress | <code>string</code> | The address to which the coins should be sent. |
| coins | <code>string</code> | The string representing the number of coins (in ether) to send. To convert between ethers and wei, see https://docs.ethers.org/v4/api-utils.html#ether-strings-and-wei |
| nonce | <code>number</code> | A monotonically increasing number representing the nonce of the account. You have to carefully manage the state of the nonce to avoid sending the coins multiple times, such as when retrying after an error. |
| data | <code>string</code> | Ignored. This parameter is accepted but not used. Use signRawTransaction to pass contract data. |

<a name="module_quantum-coin-js-sdk..hexStringToUint8Array"></a>

### quantum-coin-js-sdk~hexStringToUint8Array(hex) ⇒ <code>Uint8Array</code>
Helper function to convert a hex string to Uint8Array

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Uint8Array</code> - Uint8Array representation of the hex string, or empty array if null/undefined  

| Param | Type | Description |
| --- | --- | --- |
| hex | <code>string</code> | Hex string with or without 0x prefix |

<a name="module_quantum-coin-js-sdk..signRawTransaction"></a>

### quantum-coin-js-sdk~signRawTransaction(transactionSigningRequest) ⇒ <code>SignResult</code>
The signRawTransaction function returns a signed transaction. The chainId used for signing can be provided in the TransactionSigningRequest, or if null, the chainId specified in the initialize() function will be used.
With this function, you can set the gasLimit explicitly compared to signTransaction.
You can also pass data to be signed, such as when creating or invoking a smart contract.
Since the gas fee is fixed at 1000 coins for 21000 units of gas, there is no option to set the gas fee explicitly.
This function is useful for offline (cold storage) wallets, where you can sign a transaction offline and then broadcast it from a connected device (for example, via a relay or RPC endpoint).
Another usecase for this function is when you want to first store a signed transaction to a database, then queue it and finally broadcast the transaction from a connected device.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>SignResult</code> - Returns a promise of type SignResult.  

| Param | Type | Description |
| --- | --- | --- |
| transactionSigningRequest | <code>TransactionSigningRequest</code> | An object of type TransactionSigningRequest with the transaction signing details. |

<a name="module_quantum-coin-js-sdk..getGasPrice"></a>

### quantum-coin-js-sdk~getGasPrice(keyType, [fullSign]) ⇒ <code>Object</code>
Returns the gas price per unit of gas (per-gas-unit), in wei, for the signing context implied by keyType and fullSign. This is NOT the total transaction fee (total fee = gasPrice * gasLimit). fullSign is ignored for keyType 5 (always context 1); it only affects keyType 3 (false = compact/context 0, true = full/context 2).

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Object</code> - { resultCode, gasPrice }: resultCode 0 and gasPrice as a decimal wei string on success; negative resultCode with null gasPrice on invalid keyType.  

| Param | Type | Description |
| --- | --- | --- |
| keyType | <code>number</code> | 3 (HYBRIDEDMLDSASLHDSA) or 5 (HYBRIDEDMLDSASLHDSA5). |
| [fullSign] | <code>boolean</code> \| <code>null</code> | Optional. Use full (non-compact) signing for keyType 3. Ignored for keyType 5. Defaults to false. |

<a name="module_quantum-coin-js-sdk..sign"></a>

### quantum-coin-js-sdk~sign(privateKey, message, [signingContext]) ⇒ <code>Object</code>
Sign a message with a private key. Optional signingContext selects algorithm (same pattern as signRawTransaction); if null/omitted, derived from private key type.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Object</code> - resultCode 0 on success, signature bytes; negative on error (e.g. -1000 not initialized, -700 invalid args, -701 unknown key type, -702/-703 CIRCL sign error, -704 unsupported key type or context).  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Private key bytes. |
| message | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Message bytes (e.g. 32-byte hash). |
| [signingContext] | <code>number</code> \| <code>null</code> | Optional. 0 = hybridedmldsaslhdsa compact, 1 = hybridedmldsaslhdsa5, 2 = hybridedmldsaslhdsa full. If null/omitted, derived from private key type. |

<a name="module_quantum-coin-js-sdk..verify"></a>

### quantum-coin-js-sdk~verify(publicKey, signature, message) ⇒ <code>Object</code>
Verify a signature over a message with a public key. Algorithm is determined by the first byte of the signature: 1=hybrideds verifyCompact, 2=hybrideds verify, 3=hybridedmldsaslhdsa verifyCompact, 4=hybridedmldsaslhdsa verify, 5=hybridedmldsaslhdsa5 verify.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Object</code> - resultCode 0 and valid true if signature is valid; negative on error (e.g. -1000 not initialized, -715 invalid args, -717 CIRCL verify error, -719 signature invalid, -718 unknown signature type).  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Public key bytes. |
| signature | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Signature bytes from sign(); first byte selects verify function (1-5). |
| message | <code>Array.&lt;number&gt;</code> \| <code>Uint8Array</code> | Message bytes (same as passed to sign). |

<a name="module_quantum-coin-js-sdk..publicKeyFromSignature"></a>

### quantum-coin-js-sdk~publicKeyFromSignature(digest, signature) ⇒ <code>string</code>
The publicKeyFromSignature extracts the public key from a signature.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - - Returns the public key as a hex string. Returns null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| digest | <code>Array.&lt;number&gt;</code> | An array of bytes containing the digestHash. Should be of length 32. |
| signature | <code>Array.&lt;number&gt;</code> | An array of bytes containing the signature. |

<a name="module_quantum-coin-js-sdk..publicKeyFromPrivateKey"></a>

### quantum-coin-js-sdk~publicKeyFromPrivateKey(privateKey) ⇒ <code>string</code>
The publicKeyFromPrivateKey extracts the public key from a private key.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - - Returns the public key as a hex string. Returns null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>Array.&lt;number&gt;</code> | An array of bytes containing the privateKey. |

<a name="module_quantum-coin-js-sdk..addressFromPublicKey"></a>

### quantum-coin-js-sdk~addressFromPublicKey(publicKey) ⇒ <code>string</code>
The addressFromPublicKey returns the address corresponding to the public key.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - - Returns the address corresponding to the public key as a hex string. Returns null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>Array.&lt;number&gt;</code> | An array of bytes containing the public key. |

<a name="module_quantum-coin-js-sdk..scryptDeriveKey"></a>

### quantum-coin-js-sdk~scryptDeriveKey(secret, salt, N, r, p, dkLen) ⇒ <code>Array.&lt;number&gt;</code>
The scryptDeriveKey function derives a key from a secret and salt using the scrypt KDF.

Arbitrary scrypt parameters are supported. The classic set N=262144, r=8, p=1, dkLen=32 remains fully supported and byte-for-byte compatible with previous versions.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - Returns the derived key as a byte array. Returns -1000 before initialize(), or null if the operation failed or the parameters are invalid.  

| Param | Type | Description |
| --- | --- | --- |
| secret | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The secret/passphrase. A string is encoded as UTF-8 bytes. |
| salt | <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The salt as a byte array. |
| N | <code>number</code> | The scrypt CPU/memory cost parameter (power of two, > 1). |
| r | <code>number</code> | The scrypt block size parameter. |
| p | <code>number</code> | The scrypt parallelization parameter. |
| dkLen | <code>number</code> | The derived key length in bytes. |

<a name="module_quantum-coin-js-sdk..sha256"></a>

### quantum-coin-js-sdk~sha256(data) ⇒ <code>Array.&lt;number&gt;</code>
The sha256 function computes the SHA-256 digest of the input.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - The 32-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The data to hash (string -> UTF-8 bytes). |

<a name="module_quantum-coin-js-sdk..sha512"></a>

### quantum-coin-js-sdk~sha512(data) ⇒ <code>Array.&lt;number&gt;</code>
The sha512 function computes the SHA-512 digest of the input.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - The 64-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The data to hash (string -> UTF-8 bytes). |

<a name="module_quantum-coin-js-sdk..ripemd160"></a>

### quantum-coin-js-sdk~ripemd160(data) ⇒ <code>Array.&lt;number&gt;</code>
The ripemd160 function computes the RIPEMD-160 digest of the input.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - The 20-byte digest as a byte array. Returns -1000 before initialize(), or null on invalid input.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The data to hash (string -> UTF-8 bytes). |

<a name="module_quantum-coin-js-sdk..computeHmac"></a>

### quantum-coin-js-sdk~computeHmac(algorithm, key, data) ⇒ <code>Array.&lt;number&gt;</code>
The computeHmac function computes an HMAC over the data using the given key.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - The HMAC as a byte array. Returns -1000 before initialize(), or null on invalid input.  

| Param | Type | Description |
| --- | --- | --- |
| algorithm | <code>string</code> | The hash algorithm: "sha256" or "sha512". |
| key | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The HMAC key (string -> UTF-8 bytes). |
| data | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The data to authenticate (string -> UTF-8 bytes). |

<a name="module_quantum-coin-js-sdk..pbkdf2"></a>

### quantum-coin-js-sdk~pbkdf2(password, salt, iterations, keylen, algorithm) ⇒ <code>Array.&lt;number&gt;</code>
The pbkdf2 function derives a key using PBKDF2.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>Array.&lt;number&gt;</code> - - The derived key as a byte array. Returns -1000 before initialize(), or null on invalid input.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> \| <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The password (string -> UTF-8 bytes). |
| salt | <code>Uint8Array</code> \| <code>Array.&lt;number&gt;</code> | The salt as a byte array. |
| iterations | <code>number</code> | The iteration count (positive integer). |
| keylen | <code>number</code> | The derived key length in bytes (positive integer). |
| algorithm | <code>string</code> | The PRF hash algorithm: "sha256" or "sha512". |

<a name="module_quantum-coin-js-sdk..combinePublicKeySignature"></a>

### quantum-coin-js-sdk~combinePublicKeySignature(publicKey, signature) ⇒ <code>string</code>
The combinePublicKeySignature combines the public key and signature.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> - - Returns a hex string corresponding to combined signature. Returns null if the operation failed.  

| Param | Type | Description |
| --- | --- | --- |
| publicKey | <code>Array.&lt;number&gt;</code> | An array of bytes containing the public key. |
| signature | <code>Array.&lt;number&gt;</code> | An array of bytes containing the signature. |

<a name="module_quantum-coin-js-sdk..packMethodData"></a>

### quantum-coin-js-sdk~packMethodData(abiJSON, methodName, ...args) ⇒ <code>PackUnpackResult</code>
The packMethodData function packs a Solidity method call with the given ABI, method name, and arguments.
It returns the transaction data as a hex string that can be included in a transaction.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the packed transaction data as a hex string.  

| Param | Type | Description |
| --- | --- | --- |
| abiJSON | <code>string</code> | The Solidity ABI file content as a JSON string |
| methodName | <code>string</code> | The name of the method to call |
| ...args | <code>\*</code> | The parameters to pass to the method (variable arguments) |

<a name="module_quantum-coin-js-sdk..unpackMethodData"></a>

### quantum-coin-js-sdk~unpackMethodData(abiJSON, methodName, hexData) ⇒ <code>PackUnpackResult</code>
The unpackMethodData function unpacks the return values of a Solidity method call.
It returns the unpacked values as a JavaScript array or object.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the unpacked return values as a JSON string.  

| Param | Type | Description |
| --- | --- | --- |
| abiJSON | <code>string</code> | The Solidity ABI file content as a JSON string |
| methodName | <code>string</code> | The name of the method whose return values to unpack |
| hexData | <code>string</code> | The hex-encoded return data (with or without 0x prefix) |

<a name="module_quantum-coin-js-sdk..packCreateContractData"></a>

### quantum-coin-js-sdk~packCreateContractData(abiJSON, bytecode, ...args) ⇒ <code>PackUnpackResult</code>
The packCreateContractData function packs constructor data for contract creation.
It combines the contract bytecode with the ABI-encoded constructor parameters.
This matches the Go pattern: Pack("", params...) and append(bytecode, input...)

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the packed contract creation data as a hex string.  

| Param | Type | Description |
| --- | --- | --- |
| abiJSON | <code>string</code> | The Solidity ABI file content as a JSON string |
| bytecode | <code>string</code> | The contract bytecode as a hex string (with or without 0x prefix) |
| ...args | <code>\*</code> | The constructor parameters (variable arguments, can be 0 or more) |

<a name="module_quantum-coin-js-sdk..encodeEventLog"></a>

### quantum-coin-js-sdk~encodeEventLog(abiJSON, eventName, ...args) ⇒ <code>EventLogEncodeResult</code>
The encodeEventLog function encodes event parameters into topics and data according to the ABI specification.
It returns the topics array and data hex string that can be used to create event logs.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>EventLogEncodeResult</code> - - Returns an EventLogEncodeResult object containing the error (if any) and the encoded event log with topics and data.  

| Param | Type | Description |
| --- | --- | --- |
| abiJSON | <code>string</code> | The Solidity ABI file content as a JSON string |
| eventName | <code>string</code> | The name of the event to encode |
| ...args | <code>\*</code> | The event parameter values (variable arguments) |

<a name="module_quantum-coin-js-sdk..decodeEventLog"></a>

### quantum-coin-js-sdk~decodeEventLog(abiJSON, eventName, topics, data) ⇒ <code>PackUnpackResult</code>
The decodeEventLog function decodes event log topics and data back into event parameters.
It returns the decoded values as a JavaScript object.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the decoded event parameters as a JSON string.  

| Param | Type | Description |
| --- | --- | --- |
| abiJSON | <code>string</code> | The Solidity ABI file content as a JSON string |
| eventName | <code>string</code> | The name of the event to decode |
| topics | <code>Array.&lt;string&gt;</code> | Array of topic hex strings (with or without 0x prefix) |
| data | <code>string</code> | Hex-encoded data string (with or without 0x prefix) |

<a name="module_quantum-coin-js-sdk..encodeRlp"></a>

### quantum-coin-js-sdk~encodeRlp(value) ⇒ <code>PackUnpackResult</code>
The encodeRlp function encodes a JavaScript value to RLP (Recursive Length Prefix) format.
Supports: strings, numbers, booleans, arrays, objects (maps), and hex-encoded bytes.
Returns a hex-encoded string of the RLP-encoded data.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the RLP-encoded data as a hex string.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to encode (can be string, number, boolean, array, object, etc.) |

<a name="module_quantum-coin-js-sdk..decodeRlp"></a>

### quantum-coin-js-sdk~decodeRlp(data) ⇒ <code>PackUnpackResult</code>
The decodeRlp function decodes RLP-encoded data back to a JavaScript-compatible value.
Takes a hex-encoded string and returns a JSON string representation of the decoded value.

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>PackUnpackResult</code> - - Returns a PackUnpackResult object containing the error (if any) and the decoded value as a JSON string.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | The hex-encoded RLP data (with or without 0x prefix) |

<a name="module_quantum-coin-js-sdk..createAddress"></a>

### quantum-coin-js-sdk~createAddress(address, nonce) ⇒ <code>string</code> \| <code>null</code>
The createAddress function calculates the contract address that will be created by a transaction.
This uses the CREATE opcode address calculation: keccak256(RLP(sender, nonce))

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> \| <code>null</code> - - Returns the contract address as a hex string, or null if an error occurred.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The address of the account that will create the contract (hex string with 0x prefix) |
| nonce | <code>number</code> | The nonce of the account at the time of contract creation |

<a name="module_quantum-coin-js-sdk..createAddress2"></a>

### quantum-coin-js-sdk~createAddress2(address, salt, initHash) ⇒ <code>string</code> \| <code>null</code>
The createAddress2 function calculates the contract address using the CREATE2 opcode.
This allows deterministic contract address calculation: keccak256(0xff || sender || salt || keccak256(init_code))

**Kind**: inner method of [<code>quantum-coin-js-sdk</code>](#module_quantum-coin-js-sdk)  
**Returns**: <code>string</code> \| <code>null</code> - - Returns the contract address as a hex string, or null if an error occurred.  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | The address of the account that will create the contract (hex string with 0x prefix) |
| salt | <code>string</code> | A 32-byte salt value as a hex string (with 0x prefix) |
| initHash | <code>string</code> | The keccak256 hash of the contract initialization code as a hex string (with 0x prefix) |

