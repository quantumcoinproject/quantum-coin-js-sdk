const qcsdk = require('quantum-coin-js-sdk');
const readline = require('readline');

/**
 * Example: Creating a Smart Contract using signRawTransaction
 * 
 * This example demonstrates how to create a smart contract on the Quantum Coin blockchain
 * using signRawTransaction and sendRawTransaction.
 * 
 * STEPS TO COMPILE THE SOLIDITY CONTRACT:
 * 
 * 1. Download the Solidity compiler (solc.exe) from:
 *    https://github.com/quantumcoinproject/Solidity/releases/tag/v32b.8.12
 * 
 * 2. Save the Solidity contract code below to a file (e.g., SimpleStorage.sol)
 * 
 * 3. Compile the contract using the following command:
 *    c:\solc\solc.exe --bin SimpleStorage.sol
 * 
 *    This will output the bytecode. Look for the "Binary:" section in the output.
 * 
 * 4. Copy the bytecode (without the 0x prefix if present) and paste it into the
 *    CONTRACT_BYTECODE variable below, ensuring it starts with "0x"
 * 
 * Example compilation output format:
 *    ======= SimpleStorage.sol:SimpleStorage =======
 *    Binary:
 *    608060405234801561001057600080fd5b50...
 * 
 * 5. Replace the CONTRACT_BYTECODE placeholder below with the actual compiled bytecode
 */

/**
 * Simple Solidity Contract Example:
 
  Save this to a file named SimpleStorage.sol for compilation
  
 // SPDX-License-Identifier: MIT
  pragma solidity ^0.7.6;
 
  contract SimpleStorage {
    uint256 private storedValue;
      
     event ValueChanged(uint256 newValue);
      
      function set(uint256 value) public {
         storedValue = value;
          emit ValueChanged(value);
     }
      
     function get() public view returns (uint256) {
          return storedValue;
      }
  }
*/

// ============================================
// COMPILATION INSTRUCTIONS:
// ============================================
// 1. Download solc.exe from: https://github.com/quantumcoinproject/Solidity/releases/tag/v32b.8.12
// 2. Save the Solidity code above to SimpleStorage.sol
// 3. Run: c:\gethbuild\solc.exe --bin SimpleStorage.sol
// 4. Copy the bytecode from the "Binary:" section
// 5. Paste it below in CONTRACT_BYTECODE, ensuring it starts with "0x"
// ============================================

// Replace below placeholder CONTRACT_BYTECODE with the actual compiled bytecode from solc.exe
// The bytecode should be a hex string starting with "0x"
// After compiling with: c:\gethbuild\solc.exe --bin SimpleStorage.sol
// Copy the bytecode from the "Binary:" section and paste it here
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b5060fe8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b606860bf565b6040518082815260200191505060405180910390f35b806000819055507f93fe6d397c74fdf1402a8b72e47b68512f0510d7b98a4bc4cbdf6ac7108b3c59816040518082815260200191505060405180910390a150565b6000805490509056fea26469706673582212204638427ab77bf9babc9db8fb5d8f69323478e00367c47884b65ee0677a337f8e64736f6c63430007060033";

// Configuration
var clientConfigVal = new qcsdk.Config("", "", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org

const rpcEndpointUrl = 'https://public.rpc.quantumcoinapi.com';

/**
 * Helper function to get transaction count (nonce) from RPC
 */
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
        if (result.error) {
            throw new Error(result.error.message);
        }
        return parseInt(result.result, 16);
    } catch (error) {
        console.error('Could not get transaction count:', error);
        throw error;
    }
}

/**
 * Helper function to calculate gas price
 * QuantumCoin uses a fixed gas price: 1000 coins per 21000 gas units
 * Gas price = (1000 coins * 10^18 wei) / 21000 gas = wei per gas unit
 */
function getGasPrice() {
    const gasPriceWei = BigInt("47619047619047600");
    
    return gasPriceWei;
}

/**
 * Helper function to prompt user for confirmation
 */
function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().trim());
        });
    });
}

/**
 * Helper function to convert wei to coins
 */
function weiToCoins(wei) {
    const oneCoinInWei = BigInt("1000000000000000000");
    const coins = Number(wei) / Number(oneCoinInWei);
    return coins;
}

/**
 * Helper function to estimate gas for a transaction via RPC
 */
async function estimateGas(fromAddress, toAddress, value, data) {
    try {
        const txObject = {
            from: fromAddress,
            to: toAddress, // null for contract creation
            value: value,
            data: data
        };
        
        const params = [txObject, "latest"];
        const response = await fetch(rpcEndpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_estimateGas',
                params: params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error.message);
        }
        return parseInt(result.result, 16);
    } catch (error) {
        console.error('Could not estimate gas:', error);
        throw error;
    }
}

/**
 * Helper function to send raw transaction via RPC
 */
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
        if (result.error) {
            throw new Error(result.error.message);
        }
        return result.result; // Returns transaction hash
    } catch (error) {
        console.error('Could not send raw transaction:', error);
        throw error;
    }
}

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then(async (initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }

    console.log("=== Example: Creating a Smart Contract ===\n");

    // Create a new wallet
    let wallet = qcsdk.newWallet();
    console.log("Created new wallet with address:", wallet.address);
    console.log("Note: This wallet needs to have sufficient balance for gas fees\n");

    try {
        // Get nonce from RPC
        const nonce = await getTransactionCount(wallet.address);
        console.log("Nonce (transaction count) is:", nonce);

        // Verify that bytecode has been set
        if (CONTRACT_BYTECODE === "0xPLACEHOLDER_REPLACE_WITH_COMPILED_BYTECODE" || CONTRACT_BYTECODE.length < 10) {
            console.error("\n❌ ERROR: CONTRACT_BYTECODE has not been set!");
            console.error("Please compile the Solidity contract and update CONTRACT_BYTECODE with the actual bytecode.");
            console.error("Steps:");
            console.error("1. Download solc.exe from: https://github.com/quantumcoinproject/Solidity/releases/tag/v32b.8.12");
            console.error("2. Save the Solidity code from the comments above to SimpleStorage.sol");
            console.error("3. Run: c:\\gethbuild\\solc.exe --bin SimpleStorage.sol");
            console.error("4. Copy the bytecode from the 'Binary:' section");
            console.error("5. Paste it in CONTRACT_BYTECODE variable, ensuring it starts with '0x'\n");
            return;
        }

        // Contract creation parameters
        const toAddress = null; // null for contract creation
        const valueInWei = "0x0"; // No value sent with contract creation (or use BigInt(0))
        const data = CONTRACT_BYTECODE; // Contract bytecode
        const remarks = null; // No remarks

        console.log("Creating contract with bytecode length:", data.length, "characters");

        // Estimate gas for contract creation
        console.log("Estimating gas for contract creation...");
        let gasLimit;
        try {
            const estimatedGas = await estimateGas(wallet.address, toAddress, valueInWei, data);
            console.log("Estimated gas:", estimatedGas);
            
            // Add 20% buffer to estimated gas to ensure transaction doesn't fail
            const gasBuffer = Math.ceil(estimatedGas * 0.2);
            gasLimit = estimatedGas + gasBuffer;
            console.log("Gas limit (with 20% buffer):", gasLimit);
        } catch (error) {
            console.warn("⚠️  Could not estimate gas, using default gas limit:", error.message);
            // Fallback to a default gas limit if estimation fails
            gasLimit = 500000;
            console.log("Using default gas limit:", gasLimit);
        }

        // Calculate gas price (fixed: 1000 coins per 21000 gas)
        console.log("\nCalculating gas price...");
        const gasPrice = getGasPrice();
        console.log("Gas price (wei per gas unit):", gasPrice.toString());
        console.log("Note: QuantumCoin uses a fixed rate of 1000 coins per 21000 gas units");

        // Calculate total fee
        const totalFeeWei = BigInt(gasLimit) * gasPrice;
        const totalFeeCoins = weiToCoins(totalFeeWei);

        // Display transaction details and request confirmation
        console.log("\n" + "=".repeat(60));
        console.log("TRANSACTION DETAILS");
        console.log("=".repeat(60));
        console.log("Gas Limit:     ", gasLimit.toLocaleString());
        console.log("Gas Price:     ", gasPrice.toString(), "wei");
        console.log("Total Fee:     ", totalFeeWei.toString(), "wei");
        console.log("Total Fee:     ", totalFeeCoins.toFixed(9), "coins");
        console.log("=".repeat(60));

        // Request user confirmation
        const confirmation = await promptUser("\nDo you want to proceed with this transaction? (yes/no): ");
        
        if (confirmation !== 'yes' && confirmation !== 'y') {
            console.log("Transaction cancelled by user.");
            return;
        }

        console.log("\nProceeding with transaction...");

        // Create transaction signing request
        const transactionRequest = new qcsdk.TransactionSigningRequest(
            wallet,
            toAddress, // null for contract creation
            valueInWei,
            nonce,
            data, // Contract bytecode
            gasLimit,
            remarks
        );

        // Sign the transaction
        console.log("\nSigning transaction...");
        const signResult = qcsdk.signRawTransaction(transactionRequest);

        if (signResult.resultCode !== 0) {
            console.error("Failed to sign transaction. Result code:", signResult.resultCode);
            return;
        }

        console.log("Transaction signed successfully");
        console.log("Transaction hash:", signResult.txnHash);
        console.log("Transaction data length:", signResult.txnData.length, "characters");

        // Send transaction via RPC
        console.log("\nSending transaction to network...");
        try {
            const txHash = await sendRawTransaction(signResult.txnData);
            console.log("✅ Transaction submitted successfully!");
            console.log("Transaction hash from RPC:", txHash);
            console.log("\nNote: The contract will be deployed at an address determined by the transaction.");
            console.log("You can check the transaction status on the block explorer.");
        } catch (error) {
            console.error("❌ Error sending transaction:", error.message);
            console.error("Make sure the wallet has sufficient balance for gas fees.");
        }

    } catch (error) {
        console.error("Error creating contract:", error);
    }
});

