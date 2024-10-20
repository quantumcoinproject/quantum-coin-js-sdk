<a name="module_qc-sdk"></a>

## qc-sdk
Quantum Coin SDK Module

**Example**  
```js
Installation:npm install qc-sdk --save[Example Project](https://github.com/DogeProtocol/qc-sdk/example)Adding reference:var qcsdk = require('qc-sdk');
```

* [qc-sdk](#module_qc-sdk)
    * [~Config](#module_qc-sdk..Config)
        * [new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)](#new_module_qc-sdk..Config_new)
        * [.readUrl](#module_qc-sdk..Config+readUrl) : <code>string</code>
        * [.writeUrl](#module_qc-sdk..Config+writeUrl) : <code>string</code>
        * [.chainId](#module_qc-sdk..Config+chainId) : <code>number</code>
        * [.readApiKey](#module_qc-sdk..Config+readApiKey) : <code>string</code>
        * [.writeApiKey](#module_qc-sdk..Config+writeApiKey) : <code>string</code>
    * [~initialize()](#module_qc-sdk..initialize)

<a name="module_qc-sdk..Config"></a>

### qc-sdk~Config
This is the configuration class required to initialize and interact with Quantum Coin blockchain

**Kind**: inner class of [<code>qc-sdk</code>](#module_qc-sdk)  
**Access**: public  

* [~Config](#module_qc-sdk..Config)
    * [new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)](#new_module_qc-sdk..Config_new)
    * [.readUrl](#module_qc-sdk..Config+readUrl) : <code>string</code>
    * [.writeUrl](#module_qc-sdk..Config+writeUrl) : <code>string</code>
    * [.chainId](#module_qc-sdk..Config+chainId) : <code>number</code>
    * [.readApiKey](#module_qc-sdk..Config+readApiKey) : <code>string</code>
    * [.writeApiKey](#module_qc-sdk..Config+writeApiKey) : <code>string</code>

<a name="new_module_qc-sdk..Config_new"></a>

#### new Config(readUrl, writeUrl, chainId, readApiKey, writeApiKey)
Creates a config class


| Param | Type | Description |
| --- | --- | --- |
| readUrl | <code>string</code> | The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay |
| writeUrl | <code>string</code> | The Write API URL pointing to a write relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay |
| chainId | <code>number</code> | The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324. |
| readApiKey | <code>string</code> | Optional parameter if authorization is enabled for the relay service. API Key for authorization. Defaults to null which indicates no authorization. |
| writeApiKey | <code>string</code> | Optional parameter if authorization is enabled for the relay service. API Key for authorization. Defaults to null which indicates no authorization. |

<a name="module_qc-sdk..Config+readUrl"></a>

#### config.readUrl : <code>string</code>
The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk..Config)  
**Access**: public  
<a name="module_qc-sdk..Config+writeUrl"></a>

#### config.writeUrl : <code>string</code>
The Read API URL pointing to a read relay. See https://github.com/DogeProtocol/go-dp/tree/dogep/relay

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk..Config)  
**Access**: public  
<a name="module_qc-sdk..Config+chainId"></a>

#### config.chainId : <code>number</code>
The chain id of the blockchain. Mainnet chainId is 123123. Testnet T4 chainId is 310324.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk..Config)  
**Access**: public  
<a name="module_qc-sdk..Config+readApiKey"></a>

#### config.readApiKey : <code>string</code>
API Key for authorization if authorization is enabled for the relay service. Defaults to null which indicates no authorization.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk..Config)  
**Access**: public  
<a name="module_qc-sdk..Config+writeApiKey"></a>

#### config.writeApiKey : <code>string</code>
API Key for authorization if authorization is enabled for the relay service. Defaults to null which indicates no authorization.

**Kind**: instance property of [<code>Config</code>](#module_qc-sdk..Config)  
**Access**: public  
<a name="module_qc-sdk..initialize"></a>

### qc-sdk~initialize()
This is a description of the initialize function.

**Kind**: inner method of [<code>qc-sdk</code>](#module_qc-sdk)  
