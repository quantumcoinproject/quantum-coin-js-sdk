const qcsdk = require('quantum-coin-js-sdk');
const ethers = require('ethers');

/**
 * Example: Token Pack/Unpack Operations
 * 
 * This example demonstrates how to use packMethodData and unpackMethodData
 * to interact with ERC20 tokens and Router contracts.
 */

// Configuration
var clientConfigVal = new qcsdk.Config("https://sdk.readrelay.quantumcoinapi.com", "https://sdk.writerelay.quantumcoinapi.com", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org

// RPC endpoint for making contract calls
const rpcEndpointUrl = 'https://public.rpc.quantumcoinapi.com';

// Contract addresses
const SWAP_ROUTER_ADDRESS = "0x41323EF72662185f44a03ea0ad8094a0C9e925aB1102679D8e957e838054aac5";
const FACTORY_ADDRESS = "0xbbF45a1B60044669793B444eD01Eb33e03Bb8cf3c5b6ae7887B218D05C5Cbf1d"; // Replace with actual Factory contract address
const TOKEN_A_ADDRESS = "0x1Bd75060B22686a9f32Af80BC02348c1BAeDBba06f47ad723885c92a6566B65d";
const TOKEN_B_ADDRESS = "0x12b803EC8529b26deEa8D7ff37B9457Ea15C05bD3fD0Ba2F3A4b95D53c82403a";
const ACCOUNT_HOLDER_ADDRESS = "0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6";

// ERC20 Token Standard ABI
const erc20ABI = [
    {
        "name": "balanceOf",
        "type": "function",
        "inputs": [
            {"name": "account", "type": "address"}
        ],
        "outputs": [
            {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "string"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "string"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "decimals",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "uint8"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "totalSupply",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "owner",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "address"}
        ],
        "stateMutability": "view"
    }
];

// QuantumSwap Router ABI
const quantumswapV2RouterABI = [
    {
        "name": "getAmountsIn",
        "type": "function",
        "inputs": [
            {"name": "amountOut", "type": "uint256"},
            {"name": "path", "type": "address[]"}
        ],
        "outputs": [
            {"name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "getAmountsOut",
        "type": "function",
        "inputs": [
            {"name": "amountIn", "type": "uint256"},
            {"name": "path", "type": "address[]"}
        ],
        "outputs": [
            {"name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "swapExactTokensForTokens",
        "type": "function",
        "inputs": [
            {"name": "amountIn", "type": "uint256"},
            {"name": "amountOutMin", "type": "uint256"},
            {"name": "path", "type": "address[]"},
            {"name": "to", "type": "address"},
            {"name": "deadline", "type": "uint256"}
        ],
        "outputs": [
            {"name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "nonpayable"
    },
    {
        "name": "swapTokensForExactTokens",
        "type": "function",
        "inputs": [
            {"name": "amountOut", "type": "uint256"},
            {"name": "amountInMax", "type": "uint256"},
            {"name": "path", "type": "address[]"},
            {"name": "to", "type": "address"},
            {"name": "deadline", "type": "uint256"}
        ],
        "outputs": [
            {"name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "nonpayable"
    }
];

// Factory Contract ABI (for getting pair addresses)
const factoryABI = [
    {
        "name": "getPair",
        "type": "function",
        "inputs": [
            {"name": "tokenA", "type": "address"},
            {"name": "tokenB", "type": "address"}
        ],
        "outputs": [
            {"name": "pair", "type": "address"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "allPairs",
        "type": "function",
        "inputs": [
            {"name": "", "type": "uint256"}
        ],
        "outputs": [
            {"name": "", "type": "address"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "allPairsLength",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
    }
];

/**
 * Helper function to make RPC calls
 */
async function rpcCall(method, params) {
    try {
        const response = await fetch(rpcEndpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: method,
                params: params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('RPC call failed:', error);
        throw error;
    }
}

/**
 * Helper function to get transaction count (nonce) for an address
 */
async function getTransactionCount(address) {
    const result = await rpcCall("eth_getTransactionCount", [address, "latest"]);
    if (result.error) {
        throw new Error(`Failed to get transaction count: ${result.error.message}`);
    }
    return parseInt(result.result, 16);
}

/**
 * Helper function to send raw transaction
 */
async function sendRawTransaction(signedTxData) {
    const result = await rpcCall("eth_sendRawTransaction", [signedTxData]);
    if (result.error) {
        throw new Error(`Failed to send transaction: ${result.error.message}`);
    }
    return result.result; // Returns transaction hash
}

/**
 * Helper function to convert wei to coins (ETH equivalent)
 */
function weiToCoins(wei) {
    const oneCoinInWei = BigInt("1000000000000000000");
    const coins = Number(wei) / Number(oneCoinInWei);
    return coins;
}

/**
 * Example 1: Get token balance of an address
 */
async function example1_GetTokenBalance() {
    console.log('\n=== Example 1: Get Token Balance ===\n');
    
    // Token contract address
    const tokenAddress = TOKEN_A_ADDRESS;
    // User address
    const userAddress = ACCOUNT_HOLDER_ADDRESS;
    
    const abiJSON = JSON.stringify(erc20ABI);
    
    // Pack the balanceOf method call
    const packResult = qcsdk.packMethodData(abiJSON, "balanceOf", userAddress);
    
    if (packResult.error) {
        console.error("Error packing balanceOf:", packResult.error);
        return;
    }
    
    console.log("Packed data (hex):", packResult.result);
    
    // Make RPC call to get the balance
    const rpcResult = await rpcCall("eth_call", [
        {
            to: tokenAddress,
            data: packResult.result
        },
        "latest"
    ]);
    
    if (rpcResult.error) {
        console.error("RPC error:", rpcResult.error);
        return;
    }
    
    const returnData = rpcResult.result;
    console.log("Return data (hex):", returnData);
    
    // Unpack the return value
    const unpackResult = qcsdk.unpackMethodData(abiJSON, "balanceOf", returnData);
    
    if (unpackResult.error) {
        console.error("Error unpacking balanceOf:", unpackResult.error);
        return;
    }
    
    // Parse the JSON result
    const balance = JSON.parse(unpackResult.result)[0];
    const balanceWei = BigInt(balance);
    const balanceCoins = weiToCoins(balanceWei);
    console.log("Token Contract Address:", TOKEN_A_ADDRESS);
    console.log("ACCOUNT_HOLDER_ADDRESS:", ACCOUNT_HOLDER_ADDRESS);
    console.log("Token balance (wei):", balance);
    console.log("Token balance (coins):", balanceCoins.toFixed(9));
}

/**
 * Example 2: Get token name, totalSupply, decimals, owner, and symbol
 */
async function example2_GetTokenInfo() {
    console.log('\n=== Example 2: Get Token Information ===\n');
    
    // Token contract address
    const tokenAddress = TOKEN_A_ADDRESS;
    const abiJSON = JSON.stringify(erc20ABI);
    
    // Helper function to call a view function
    async function callViewFunction(methodName, ...args) {
        const packResult = qcsdk.packMethodData(abiJSON, methodName, ...args);
        
        if (packResult.error) {
            console.error(`Error packing ${methodName}:`, packResult.error);
            return null;
        }
        
        const rpcResult = await rpcCall("eth_call", [
            {
                to: tokenAddress,
                data: packResult.result
            },
            "latest"
        ]);
        
        if (rpcResult.error) {
            console.error(`RPC error for ${methodName}:`, rpcResult.error);
            return null;
        }
        
        const unpackResult = qcsdk.unpackMethodData(abiJSON, methodName, rpcResult.result);
        
        if (unpackResult.error) {
            console.error(`Error unpacking ${methodName}:`, unpackResult.error);
            return null;
        }
        
        return JSON.parse(unpackResult.result);
    }
    
    // Get token name
    console.log("Getting token name...");
    const nameResult = await callViewFunction("name");
    if (nameResult) {
        console.log("Token name:", nameResult[0]);
    }
    
    // Get token symbol
    console.log("Getting token symbol...");
    const symbolResult = await callViewFunction("symbol");
    if (symbolResult) {
        console.log("Token symbol:", symbolResult[0]);
    }
    
    // Get token decimals
    console.log("Getting token decimals...");
    const decimalsResult = await callViewFunction("decimals");
    if (decimalsResult) {
        console.log("Token decimals:", parseInt(decimalsResult[0], 10));
    }
    
    // Get total supply
    console.log("Getting total supply...");
    const totalSupplyResult = await callViewFunction("totalSupply");
    if (totalSupplyResult) {
        const totalSupply = totalSupplyResult[0];
        const totalSupplyWei = BigInt(totalSupply);
        const totalSupplyCoins = weiToCoins(totalSupplyWei);
        console.log("Total supply (wei):", totalSupply);
        console.log("Total supply (coins):", totalSupplyCoins.toFixed(9));
    }
    
    // Get owner
    console.log("Getting token owner...");
    const ownerResult = await callViewFunction("owner");
    if (ownerResult) {
        console.log("Token owner:", ownerResult[0]);
    }
}

/**
 * Example 3: Get pair address for two tokens
 */
async function example3_GetPairAddress() {
    console.log('\n=== Example 3: Get Pair Address for Two Tokens ===\n');
    
    // Factory contract address
    const factoryAddress = FACTORY_ADDRESS;
    const abiJSON = JSON.stringify(factoryABI);
    
    // Token addresses
    const tokenA = TOKEN_A_ADDRESS;
    const tokenB = TOKEN_B_ADDRESS;
    
    console.log("Token A:", tokenA);
    console.log("Token B:", tokenB);
    console.log("Factory Address:", factoryAddress);
    
    // Pack the getPair method call
    const packResult = qcsdk.packMethodData(abiJSON, "getPair", tokenA, tokenB);
    
    if (packResult.error) {
        console.error("Error packing getPair:", packResult.error);
        return;
    }
    
    console.log("Packed data (hex):", packResult.result);
    
    // Make RPC call
    const rpcResult = await rpcCall("eth_call", [
        {
            to: factoryAddress,
            data: packResult.result
        },
        "latest"
    ]);
    
    if (rpcResult.error) {
        console.error("RPC error:", rpcResult.error);
        return;
    }
    
    console.log("RPC result (raw):", rpcResult.result);
    
    // Check if result is empty or indicates a revert
    if (!rpcResult.result || rpcResult.result === "0x" || rpcResult.result === "") {
        console.error("\n❌ Error: Empty result returned from Factory contract.");
        console.error("Possible reasons:");
        console.error("  1. Factory contract address does not exist or is incorrect");
        console.error("  2. Contract execution reverted (contract may not have getPair function)");
        console.error("  3. Factory contract is not deployed at the specified address");
        console.error("\nPlease verify the Factory contract address:", factoryAddress);
        return null;
    }
    
    // Check for revert indicator (some RPCs return "0x" for reverts, others may have specific error data)
    // If the result is just "0x" or very short, it might be a revert
    if (rpcResult.result.length <= 2) {
        console.error("\n❌ Error: Contract execution likely reverted.");
        console.error("The Factory contract may not have the getPair function or the contract address is incorrect.");
        return null;
    }
    
    // Unpack the return value
    const unpackResult = qcsdk.unpackMethodData(abiJSON, "getPair", rpcResult.result);
    
    if (unpackResult.error) {
        console.error("\n❌ Error unpacking getPair:", unpackResult.error);
        console.error("This usually means:");
        console.error("  1. The Factory contract address is incorrect");
        console.error("  2. The contract doesn't have the getPair function");
        console.error("  3. The execution reverted (empty string returned)");
        console.error("\nPlease verify the Factory contract address:", factoryAddress);
        return null;
    }
    
    // Parse the JSON result
    const parsed = JSON.parse(unpackResult.result);
    const pairAddress = parsed[0];
    
    console.log("\n✅ Pair Address:", pairAddress);
    
    if (pairAddress === "0x0000000000000000000000000000000000000000000000000000000000000000" || 
        pairAddress === null || 
        pairAddress === undefined) {
        console.log("⚠️  Note: Pair does not exist yet. It will be created when liquidity is first added.");
    } else {
        console.log("✅ Pair exists at the address above.");
    }
    
    return pairAddress;
}

/**
 * Example 3a: Get amount in using QuantumSwap Router
 */
async function example3a_GetAmountIn() {
    console.log('\n=== Example 3a: Get Amount In (QuantumSwapV2 Router) ===\n');
    
    // QuantumSwapV2 Router contract address
    const routerAddress = SWAP_ROUTER_ADDRESS;
    const abiJSON = JSON.stringify(quantumswapV2RouterABI);
    
    // Example: Want 1 token out, calculate how much token in needed
    // amountOut: 1 token (with 18 decimals) = 1000000000000000000 wei
    const amountOut = "1000000000000000000";
    const amountOutWei = BigInt(amountOut);
    const amountOutCoins = weiToCoins(amountOutWei);
    
    // Swap path: TokenA -> TokenB
    const path = [TOKEN_A_ADDRESS, TOKEN_B_ADDRESS];
    
    // Pack the getAmountsIn method call
    const packResult = qcsdk.packMethodData(abiJSON, "getAmountsIn", amountOut, path);
    
    if (packResult.error) {
        console.error("Error packing getAmountsIn:", packResult.error);
        return;
    }
    
    console.log("Packed data (hex):", packResult.result);
    console.log("Amount out desired (wei):", amountOut);
    console.log("Amount out desired (coins):", amountOutCoins.toFixed(9));
    console.log("Swap path:", path);
    
    // Make RPC call
    const rpcResult = await rpcCall("eth_call", [
        {
            to: routerAddress,
            data: packResult.result
        },
        "latest"
    ]);
    
    if (rpcResult.error) {
        console.error("RPC error:", rpcResult.error);
        return;
    }
    
    // Unpack the return value
    const unpackResult = qcsdk.unpackMethodData(abiJSON, "getAmountsIn", rpcResult.result);
    
    if (unpackResult.error) {
        console.error("Error unpacking getAmountsIn:", unpackResult.error);
        return;
    }
    
    // Parse the JSON result (array of amounts)
    const parsed = JSON.parse(unpackResult.result);
    console.log("Parsed result:", parsed);
    const amounts = parsed[0];
    console.log("Amounts array:", amounts);
    console.log("Amounts array type:", typeof amounts, Array.isArray(amounts));
    
    // Handle case where amounts might be a string or already an array
    let amountsArray;
    if (typeof amounts === 'string') {
        // If it's a string, try to parse it again
        try {
            amountsArray = JSON.parse(amounts);
        } catch (e) {
            console.error("Failed to parse amounts string:", amounts);
            return;
        }
    } else if (Array.isArray(amounts)) {
        amountsArray = amounts;
    } else {
        console.error("Unexpected amounts type:", typeof amounts, amounts);
        return;
    }
    
    const amountInWei = BigInt(amountsArray[0]);
    const amountInCoins = weiToCoins(amountInWei);
    const amountOutResultWei = BigInt(amountsArray[1]);
    const amountOutResultCoins = weiToCoins(amountOutResultWei);
    console.log("Amount in needed (wei):", amountsArray[0]);
    console.log("Amount in needed (coins):", amountInCoins.toFixed(9));
    console.log("Amount out (wei):", amountsArray[1]);
    console.log("Amount out (coins):", amountOutResultCoins.toFixed(9));
    
    return amounts;
}

/**
 * Example 3b: Get amount out using QuantumSwapV2 Router
 */
async function example3b_GetAmountOut() {
    console.log('\n=== Example 3b: Get Amount Out (QuantumSwapV2 Router) ===\n');
    
    // QuantumSwapV2 Router contract address
    const routerAddress = SWAP_ROUTER_ADDRESS;
    const abiJSON = JSON.stringify(quantumswapV2RouterABI);
    
    // Example: Put in 1 token, calculate how much token out received
    // amountIn: 1 token (with 18 decimals) = 1000000000000000000 wei
    const amountIn = "1000000000000000000";
    const amountInInputWei = BigInt(amountIn);
    const amountInInputCoins = weiToCoins(amountInInputWei);
    
    // Swap path: TokenA -> TokenB
    const path = [TOKEN_A_ADDRESS, TOKEN_B_ADDRESS];
    
    // Pack the getAmountsOut method call
    const packResult = qcsdk.packMethodData(abiJSON, "getAmountsOut", amountIn, path);
    
    if (packResult.error) {
        console.error("Error packing getAmountsOut:", packResult.error);
        return;
    }
    
    console.log("Packed data (hex):", packResult.result);
    console.log("Amount in (wei):", amountIn);
    console.log("Amount in (coins):", amountInInputCoins.toFixed(9));
    console.log("Swap path:", path);
    
    // Make RPC call
    const rpcResult = await rpcCall("eth_call", [
        {
            to: routerAddress,
            data: packResult.result
        },
        "latest"
    ]);
    
    if (rpcResult.error) {
        console.error("RPC error:", rpcResult.error);
        return;
    }
    
    // Unpack the return value
    const unpackResult = qcsdk.unpackMethodData(abiJSON, "getAmountsOut", rpcResult.result);
    
    if (unpackResult.error) {
        console.error("Error unpacking getAmountsOut:", unpackResult.error);
        return;
    }
    
    // Parse the JSON result (array of amounts)
    const parsed = JSON.parse(unpackResult.result);
    console.log("Parsed result:", parsed);
    const amounts = parsed[0];
    console.log("Amounts array:", amounts);
    console.log("Amounts array type:", typeof amounts, Array.isArray(amounts));
    
    // Handle case where amounts might be a string or already an array
    let amountsArray;
    if (typeof amounts === 'string') {
        // If it's a string, try to parse it again
        try {
            amountsArray = JSON.parse(amounts);
        } catch (e) {
            console.error("Failed to parse amounts string:", amounts);
            return;
        }
    } else if (Array.isArray(amounts)) {
        amountsArray = amounts;
    } else {
        console.error("Unexpected amounts type:", typeof amounts, amounts);
        return;
    }
    
    const amountInWei = BigInt(amountsArray[0]);
    const amountInCoins = weiToCoins(amountInWei);
    const amountOutWei = BigInt(amountsArray[1]);
    const amountOutCoins = weiToCoins(amountOutWei);
    console.log("Amount in (wei):", amountsArray[0]);
    console.log("Amount in (coins):", amountInCoins.toFixed(9));
    console.log("Amount out received (wei):", amountsArray[1]);
    console.log("Amount out received (coins):", amountOutCoins.toFixed(9));
    
    return amountsArray;
}

/**
 * Example 4a: Swap exact tokens for tokens (using getAmountOut output)
 * This example uses the output from getAmountOut to perform a swap
 */
async function example4a_SwapExactTokensForTokens() {
    console.log('\n=== Example 4a: Swap Exact Tokens For Tokens (using getAmountOut) ===\n');
    
    // Step 1: Create a new wallet
    console.log("Step 1: Creating a new wallet...");
    const wallet = qcsdk.newWallet();
    if (wallet === null) {
        console.error("Failed to create wallet");
        return;
    }
    console.log("Wallet address:", wallet.address);
    
    // Step 2: Get the expected amount out
    console.log("\nStep 2: Getting expected amount out...");
    const amountsOut = await example3b_GetAmountOut();
    
    if (!amountsOut || amountsOut.length < 2) {
        console.error("Failed to get amount out");
        return;
    }
    
    const amountIn = "1000000000000000000"; // 1 token
    const amountInWei = BigInt(amountIn);
    const amountInCoins = weiToCoins(amountInWei);
    const amountOutMin = amountsOut[1]; // Use the amount out from getAmountsOut (with some slippage tolerance)
    
    // Apply 1% slippage tolerance (multiply by 99/100)
    const slippageTolerance = BigInt(amountOutMin) * BigInt(99) / BigInt(100);
    const amountOutMinWithSlippage = slippageTolerance.toString();
    const amountOutMinWei = BigInt(amountOutMin);
    const amountOutMinCoins = weiToCoins(amountOutMinWei);
    const amountOutMinWithSlippageWei = BigInt(amountOutMinWithSlippage);
    const amountOutMinWithSlippageCoins = weiToCoins(amountOutMinWithSlippageWei);
    
    console.log("\nStep 3: Preparing swap transaction...");
    console.log("Amount in (wei):", amountIn);
    console.log("Amount in (coins):", amountInCoins.toFixed(9));
    console.log("Expected amount out (wei):", amountsOut[1]);
    console.log("Expected amount out (coins):", amountOutMinCoins.toFixed(9));
    console.log("Minimum amount out (with 1% slippage) (wei):", amountOutMinWithSlippage);
    console.log("Minimum amount out (with 1% slippage) (coins):", amountOutMinWithSlippageCoins.toFixed(9));
    
    // QuantumSwapV2 Router contract address
    const routerAddress = SWAP_ROUTER_ADDRESS;
    const abiJSON = JSON.stringify(quantumswapV2RouterABI);
    
    // Swap path
    const path = [TOKEN_A_ADDRESS, TOKEN_B_ADDRESS];
    
    // Recipient address (use the wallet address we created)
    const to = wallet.address;
    
    // Deadline: 20 minutes from now (Unix timestamp in seconds, UTC)
    // Date.now() already returns UTC milliseconds, so no conversion needed
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
    const deadlineStr = deadline.toString();
    
    // Pack the swapExactTokensForTokens method call
    const packResult = qcsdk.packMethodData(
        abiJSON,
        "swapExactTokensForTokens",
        amountIn,
        amountOutMinWithSlippage,
        path,
        to,
        deadlineStr
    );
    
    if (packResult.error) {
        console.error("Error packing swapExactTokensForTokens:", packResult.error);
        return;
    }
    
    console.log("Packed swap transaction data (hex):", packResult.result);
    
    // Step 4: Get nonce for the wallet
    console.log("\nStep 4: Getting transaction count (nonce)...");
    let nonce;
    try {
        nonce = await getTransactionCount(wallet.address);
        console.log("Nonce:", nonce);
    } catch (error) {
        console.error("Failed to get nonce:", error.message);
        return;
    }
    
    // Step 5: Sign the transaction
    console.log("\nStep 5: Signing transaction...");
    const gasLimit = 300000; // Gas limit for swap transaction
    const valueInWeiHex = "0x0"; // No native token value for token swaps
    
    const transactionRequest = new qcsdk.TransactionSigningRequest(
        wallet,
        routerAddress,
        valueInWeiHex,
        nonce,
        packResult.result,
        gasLimit,
        null // remarks
    );
    
    const signResult = qcsdk.signRawTransaction(transactionRequest);
    
    if (signResult.resultCode !== 0) {
        console.error("Failed to sign transaction. Result code:", signResult.resultCode);
        return;
    }
    
    console.log("Transaction signed successfully");
    console.log("Transaction hash:", signResult.txnHash);
    console.log("Transaction data:", signResult.txnData);
    
    // Step 6: Send the transaction
    console.log("\nStep 6: Sending transaction to network...");
    try {
        const txHash = await sendRawTransaction(signResult.txnData);
        console.log("Transaction sent successfully!");
        console.log("Transaction ID (hash):", txHash);
        console.log("You can view this transaction on the block explorer");
    } catch (error) {
        console.error("Failed to send transaction:", error.message);
    }
}

/**
 * Example 4b: Swap tokens for exact tokens (using getAmountIn output)
 * This example uses the output from getAmountIn to perform a swap
 */
async function example4b_SwapTokensForExactTokens() {
    console.log('\n=== Example 4b: Swap Tokens For Exact Tokens (using getAmountIn) ===\n');
    
    // Step 1: Create a new wallet
    console.log("Step 1: Creating a new wallet...");
    const wallet = qcsdk.newWallet();
    if (wallet === null) {
        console.error("Failed to create wallet");
        return;
    }
    console.log("Wallet address:", wallet.address);
    
    // Step 2: Get the required amount in
    console.log("\nStep 2: Getting required amount in...");
    const amountsIn = await example3a_GetAmountIn();
    
    if (!amountsIn || amountsIn.length < 2) {
        console.error("Failed to get amount in");
        return;
    }
    
    const amountOut = "1000000000000000000"; // 1 token desired out
    const amountOutWei = BigInt(amountOut);
    const amountOutCoins = weiToCoins(amountOutWei);
    const amountInMax = amountsIn[0]; // Use the amount in from getAmountsIn
    
    // Apply 2% slippage tolerance (multiply by 102/100)
    const slippageTolerance = BigInt(amountInMax) * BigInt(102) / BigInt(100);
    const amountInMaxWithSlippage = slippageTolerance.toString();
    const amountInMaxWei = BigInt(amountInMax);
    const amountInMaxCoins = weiToCoins(amountInMaxWei);
    const amountInMaxWithSlippageWei = BigInt(amountInMaxWithSlippage);
    const amountInMaxWithSlippageCoins = weiToCoins(amountInMaxWithSlippageWei);
    
    console.log("\nStep 3: Preparing swap transaction...");
    console.log("Desired amount out (wei):", amountOut);
    console.log("Desired amount out (coins):", amountOutCoins.toFixed(9));
    console.log("Required amount in (wei):", amountsIn[0]);
    console.log("Required amount in (coins):", amountInMaxCoins.toFixed(9));
    console.log("Maximum amount in (with 2% slippage) (wei):", amountInMaxWithSlippage);
    console.log("Maximum amount in (with 2% slippage) (coins):", amountInMaxWithSlippageCoins.toFixed(9));
    
    // QuantumSwapV2 Router contract address
    const routerAddress = SWAP_ROUTER_ADDRESS;
    const abiJSON = JSON.stringify(quantumswapV2RouterABI);
    
    // Swap path
    const path = [TOKEN_A_ADDRESS, TOKEN_B_ADDRESS];
    
    // Recipient address (use the wallet address we created)
    const to = wallet.address;
    
    // Deadline: 20 minutes from now (Unix timestamp in seconds, UTC)
    // Date.now() already returns UTC milliseconds, so no conversion needed
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
    const deadlineStr = deadline.toString();
    
    // Pack the swapTokensForExactTokens method call
    const packResult = qcsdk.packMethodData(
        abiJSON,
        "swapTokensForExactTokens",
        amountOut,
        amountInMaxWithSlippage,
        path,
        to,
        deadlineStr
    );
    
    if (packResult.error) {
        console.error("Error packing swapTokensForExactTokens:", packResult.error);
        return;
    }
    
    console.log("Packed swap transaction data (hex):", packResult.result);
    
    // Step 4: Get nonce for the wallet
    console.log("\nStep 4: Getting transaction count (nonce)...");
    let nonce;
    try {
        nonce = await getTransactionCount(wallet.address);
        console.log("Nonce:", nonce);
    } catch (error) {
        console.error("Failed to get nonce:", error.message);
        return;
    }
    
    // Step 5: Sign the transaction
    console.log("\nStep 5: Signing transaction...");
    const gasLimit = 300000; // Gas limit for swap transaction
    const valueInWeiHex = "0x0"; // No native token value for token swaps
    
    const transactionRequest = new qcsdk.TransactionSigningRequest(
        wallet,
        routerAddress,
        valueInWeiHex,
        nonce,
        packResult.result,
        gasLimit,
        null // remarks
    );
    
    const signResult = qcsdk.signRawTransaction(transactionRequest);
    
    if (signResult.resultCode !== 0) {
        console.error("Failed to sign transaction. Result code:", signResult.resultCode);
        return;
    }
    
    console.log("Transaction signed successfully");
    console.log("Transaction hash:", signResult.txnHash);
    console.log("Transaction data:", signResult.txnData);
    
    // Step 6: Send the transaction
    console.log("\nStep 6: Sending transaction to network...");
    try {
        const txHash = await sendRawTransaction(signResult.txnData);
        console.log("Transaction sent successfully!");
        console.log("Transaction ID (hash):", txHash);
        console.log("You can view this transaction on the block explorer");
    } catch (error) {
        console.error("Failed to send transaction:", error.message);
    }
}

/**
 * Main execution function
 */
async function main() {
    // Initialize the SDK
    const initResult = await qcsdk.initialize(clientConfigVal);
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }
    console.log("SDK initialized successfully\n");
    
    try {
        // Example 1: Get token balance
        await example1_GetTokenBalance();
        
        // Example 2: Get token information
        await example2_GetTokenInfo();
        
        // Example 3: Get pair address for two tokens
        await example3_GetPairAddress();
        
        // Example 3a: Get amount in
        await example3a_GetAmountIn();
        
        // Example 3b: Get amount out
        await example3b_GetAmountOut();

        // Note: Swap examples (4a and 4b) create wallets, sign transactions, and send them
        // Uncomment below to test swap examples:
         await example4a_SwapExactTokensForTokens();
         await example4b_SwapTokensForExactTokens();
        
    } catch (error) {
        console.error("Error running examples:", error);
    }
}

// Run the examples
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    example1_GetTokenBalance,
    example2_GetTokenInfo,
    example3_GetPairAddress,
    example3a_GetAmountIn,
    example3b_GetAmountOut,
    example4a_SwapExactTokensForTokens,
    example4b_SwapTokensForExactTokens
};

