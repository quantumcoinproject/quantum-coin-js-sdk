const qcsdk = require('quantum-coin-js-sdk');

//This example demonstrates how to use signRawTransaction to send coins
//It shows two examples: one using hex string for valueInWei, and another using BigInt

//Initialize the client configuration
//For mainnet, use chainId 123123
var clientConfigVal = new qcsdk.Config("", "", 123123, "", ""); //Mainnet

const rpcEndpointUrl = 'https://public.rpc.quantumcoinapi.com';

async function getTransactionCount(address) {
    try {
        const params = [address, "latest"];
        const response = await fetch(rpcEndpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionCount',
                params: params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Could not invoke RPC endpoint:', error);
        throw error;
    }
}

async function sendRawTransaction(signedTxData) {
    try {
        const params = [signedTxData];
        const response = await fetch(rpcEndpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_sendRawTransaction',
                params: params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Could not invoke RPC endpoint:', error);
        throw error;
    }
}

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then(async (initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }

    console.log("=== Example: signRawTransaction with hex value ===\n");

    // Create a new wallet
    let wallet1 = qcsdk.newWallet();
    console.log("Created new wallet 1 with address:", wallet1.address);

    // Example recipient address (replace with actual address)
    var toAddress = "0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612";

    // Get nonce from RPC
    try {
        const txnCountResult = await getTransactionCount(wallet1.address);
        let nonce = parseInt(txnCountResult.result, 16);
        console.log("Nonce (transaction count) is:", nonce);

        // Example 1: Using hex string for valueInWei
        // 1 coin = 1000000000000000000 wei = 0xDE0B6B3A7640000
        const valueInWeiHex = "0xDE0B6B3A7640000"; // 1 coin in hex
        const gasLimit = 21000; // Standard gas limit for simple transfers
        const data = null; // No contract data for simple coin transfer
        const remarks = null; // No remarks

        console.log("Signing transaction with hex value:", valueInWeiHex);

        const transactionRequest1 = new qcsdk.TransactionSigningRequest(
            wallet1,
            toAddress,
            valueInWeiHex, // hex string
            nonce,
            data,
            gasLimit,
            remarks
        );

        const signResult1 = qcsdk.signRawTransaction(transactionRequest1);

        if (signResult1.resultCode !== 0) {
            console.error("Failed to sign transaction. Result code:", signResult1.resultCode);
            return;
        }

        console.log("Transaction signed successfully");
        console.log("Transaction hash:", signResult1.txnHash);

        // Send transaction via RPC
        try {
            const rpcResult = await sendRawTransaction(signResult1.txnData);
            if (rpcResult.error) {
                console.error("RPC Error:", rpcResult.error.message);
            } else {
                console.log("Transaction submitted successfully!");
                console.log("Transaction hash from RPC:", rpcResult.result);
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
        }

    } catch (error) {
        console.error("Error in example 1:", error);
    }

    console.log("\n=== Example: signRawTransaction with BigInt value ===\n");

    // Create another new wallet for the second example
    let wallet2 = qcsdk.newWallet();
    console.log("Created new wallet 2 with address:", wallet2.address);

    try {
        // Get nonce from RPC
        const txnCountResult2 = await getTransactionCount(wallet2.address);
        let nonce2 = parseInt(txnCountResult2.result, 16);
        console.log("Nonce (transaction count) is:", nonce2);

        // Example 2: Using BigInt for valueInWei
        // 1 coin = 1000000000000000000 wei
        const valueInWeiBigInt = BigInt("1000000000000000000"); // 1 coin as BigInt
        const gasLimit2 = 21000; // Standard gas limit for simple transfers
        const data2 = null; // No contract data for simple coin transfer
        const remarks2 = null; // No remarks

        console.log("Signing transaction with BigInt value:", valueInWeiBigInt.toString());

        const transactionRequest2 = new qcsdk.TransactionSigningRequest(
            wallet2,
            toAddress,
            valueInWeiBigInt, // BigInt
            nonce2,
            data2,
            gasLimit2,
            remarks2
        );

        const signResult2 = qcsdk.signRawTransaction(transactionRequest2);

        if (signResult2.resultCode !== 0) {
            console.error("Failed to sign transaction. Result code:", signResult2.resultCode);
            return;
        }

        console.log("Transaction signed successfully");
        console.log("Transaction hash:", signResult2.txnHash);

        // Send transaction via RPC
        try {
            const rpcResult2 = await sendRawTransaction(signResult2.txnData);
            if (rpcResult2.error) {
                console.error("RPC Error:", rpcResult2.error.message);
            } else {
                console.log("Transaction submitted successfully!");
                console.log("Transaction hash from RPC:", rpcResult2.result);
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
        }

    } catch (error) {
        console.error("Error in example 2:", error);
    }
});

