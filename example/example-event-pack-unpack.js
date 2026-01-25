const qcsdk = require('quantum-coin-js-sdk');

/**
 * Example: Event Log Encode/Decode Operations
 * 
 * This example demonstrates how to use encodeEventLog and decodeEventLog
 * to encode and decode Ethereum event logs according to the ABI specification.
 */

// Configuration
var clientConfigVal = new qcsdk.Config("https://sdk.readrelay.quantumcoinapi.com", "https://sdk.writerelay.quantumcoinapi.com", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org

/**
 * Example 1: Basic Transfer Event (ERC20)
 * Transfer(address indexed from, address indexed to, uint256 value)
 */
async function example1_TransferEvent() {
    console.log("\n=== Example 1: Transfer Event ===");
    
    const transferABI = JSON.stringify([{
        "name": "Transfer",
        "type": "event",
        "anonymous": false,
        "inputs": [
            {"name": "from", "type": "address", "indexed": true},
            {"name": "to", "type": "address", "indexed": true},
            {"name": "value", "type": "uint256", "indexed": false}
        ]
    }]);

    const fromAddress = "0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6";
    const toAddress = "0x1Bd75060B22686a9f32Af80BC02348c1BAeDBba06f47ad723885c92a6566B65d";
    const value = "1000000000000000000"; // 1 token (18 decimals)

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(transferABI, "Transfer", fromAddress, toAddress, value);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded Transfer Event:");
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 3 topics (event signature + from + to)");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        transferABI,
        "Transfer",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded Transfer Event:");
    console.log("  From:", decoded.from);
    console.log("  To:", decoded.to);
    console.log("  Value:", decoded.value);
    console.log("  Verification:", 
        decoded.from.toLowerCase() === fromAddress.toLowerCase() &&
        decoded.to.toLowerCase() === toAddress.toLowerCase() &&
        decoded.value === value ? "✓ Match" : "✗ Mismatch"
    );
}

/**
 * Example 2: Event with All Indexed Parameters
 * Approval(address indexed owner, address indexed spender, uint256 indexed value)
 */
async function example2_AllIndexedEvent() {
    console.log("\n=== Example 2: All Indexed Event (Approval) ===");
    
    const approvalABI = JSON.stringify([{
        "name": "Approval",
        "type": "event",
        "anonymous": false,
        "inputs": [
            {"name": "owner", "type": "address", "indexed": true},
            {"name": "spender", "type": "address", "indexed": true},
            {"name": "value", "type": "uint256", "indexed": true}
        ]
    }]);

    const owner = "0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6";
    const spender = "0x1Bd75060B22686a9f32Af80BC02348c1BAeDBba06f47ad723885c92a6566B65d";
    const value = "5000000000000000000"; // 5 tokens

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(approvalABI, "Approval", owner, spender, value);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded Approval Event:");
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 4 topics (event signature + owner + spender + value)");
    console.log("  Data should be empty (0x) since all parameters are indexed");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        approvalABI,
        "Approval",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded Approval Event:");
    console.log("  Owner:", decoded.owner);
    console.log("  Spender:", decoded.spender);
    console.log("  Value:", decoded.value);
}

/**
 * Example 3: Event with All Non-Indexed Parameters
 * ValueChanged(uint256 newValue, string message)
 */
async function example3_AllNonIndexedEvent() {
    console.log("\n=== Example 3: All Non-Indexed Event ===");
    
    const valueChangedABI = JSON.stringify([{
        "name": "ValueChanged",
        "type": "event",
        "anonymous": false,
        "inputs": [
            {"name": "newValue", "type": "uint256", "indexed": false},
            {"name": "message", "type": "string", "indexed": false}
        ]
    }]);

    const newValue = "42";
    const message = "Hello, Quantum Coin!";

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(valueChangedABI, "ValueChanged", newValue, message);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded ValueChanged Event:");
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 1 topic (event signature only)");
    console.log("  Data contains both parameters");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        valueChangedABI,
        "ValueChanged",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded ValueChanged Event:");
    console.log("  New Value:", decoded.newValue);
    console.log("  Message:", decoded.message);
    console.log("  Verification:", 
        decoded.newValue === newValue &&
        decoded.message === message ? "✓ Match" : "✗ Mismatch"
    );
}

/**
 * Example 4: Event with Indexed String
 * StringEvent(string indexed message)
 * Note: Indexed strings are hashed, so we can't recover the original value
 */
async function example4_IndexedStringEvent() {
    console.log("\n=== Example 4: Indexed String Event ===");
    
    const stringEventABI = JSON.stringify([{
        "name": "StringEvent",
        "type": "event",
        "anonymous": false,
        "inputs": [
            {"name": "message", "type": "string", "indexed": true}
        ]
    }]);

    const message = "Hello, World!";

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(stringEventABI, "StringEvent", message);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded StringEvent:");
    console.log("  Original message:", message);
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 2 topics (event signature + hashed string)");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        stringEventABI,
        "StringEvent",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded StringEvent:");
    console.log("  Message (hash):", decoded.message);
    console.log("  Note: Indexed strings return the hash, not the original value");
    console.log("  This is expected behavior for indexed dynamic types");
}

/**
 * Example 5: Anonymous Event
 * AnonymousEvent(uint256 value)
 */
async function example5_AnonymousEvent() {
    console.log("\n=== Example 5: Anonymous Event ===");
    
    const anonymousABI = JSON.stringify([{
        "name": "AnonymousEvent",
        "type": "event",
        "anonymous": true,
        "inputs": [
            {"name": "value", "type": "uint256", "indexed": false}
        ]
    }]);

    const value = "12345";

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(anonymousABI, "AnonymousEvent", value);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded AnonymousEvent:");
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 0 topics (anonymous events have no signature topic)");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        anonymousABI,
        "AnonymousEvent",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded AnonymousEvent:");
    console.log("  Value:", decoded.value);
    console.log("  Verification:", decoded.value === value ? "✓ Match" : "✗ Mismatch");
}

/**
 * Example 6: Complex Event with Mixed Types
 * ComplexEvent(address indexed owner, uint256 indexed tokenId, string name, uint256[] amounts)
 */
async function example6_ComplexEvent() {
    console.log("\n=== Example 6: Complex Event with Mixed Types ===");
    
    const complexABI = JSON.stringify([{
        "name": "ComplexEvent",
        "type": "event",
        "anonymous": false,
        "inputs": [
            {"name": "owner", "type": "address", "indexed": true},
            {"name": "tokenId", "type": "uint256", "indexed": true},
            {"name": "name", "type": "string", "indexed": false},
            {"name": "amounts", "type": "uint256[]", "indexed": false}
        ]
    }]);

    const owner = "0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6";
    const tokenId = "1";
    const name = "My Token";
    const amounts = ["100", "200", "300"];

    // Encode the event
    const encodeResult = qcsdk.encodeEventLog(complexABI, "ComplexEvent", owner, tokenId, name, amounts);
    
    if (encodeResult.error) {
        console.error("Encode error:", encodeResult.error);
        return;
    }

    console.log("Encoded ComplexEvent:");
    console.log("  Topics:", encodeResult.result.topics);
    console.log("  Data:", encodeResult.result.data);
    console.log("  Number of topics:", encodeResult.result.topics.length);
    console.log("  Expected: 3 topics (event signature + owner + tokenId)");
    console.log("  Data contains name and amounts array");

    // Decode the event back
    const decodeResult = qcsdk.decodeEventLog(
        complexABI,
        "ComplexEvent",
        encodeResult.result.topics,
        encodeResult.result.data
    );

    if (decodeResult.error) {
        console.error("Decode error:", decodeResult.error);
        return;
    }

    const decoded = JSON.parse(decodeResult.result);
    console.log("\nDecoded ComplexEvent:");
    console.log("  Owner:", decoded.owner);
    console.log("  Token ID:", decoded.tokenId);
    console.log("  Name:", decoded.name);
    console.log("  Amounts:", decoded.amounts);
    console.log("  Verification:", 
        decoded.owner.toLowerCase() === owner.toLowerCase() &&
        decoded.tokenId === tokenId &&
        decoded.name === name &&
        JSON.stringify(decoded.amounts) === JSON.stringify(amounts) ? "✓ Match" : "✗ Mismatch"
    );
}

/**
 * Main function to run all examples
 */
async function runExamples() {
    console.log("==========================================");
    console.log("Event Log Encode/Decode Examples");
    console.log("==========================================");

    try {
        // Initialize SDK
        await qcsdk.initialize(clientConfigVal);
        console.log("SDK initialized successfully");

        // Run examples
        await example1_TransferEvent();
        await example2_AllIndexedEvent();
        await example3_AllNonIndexedEvent();
        await example4_IndexedStringEvent();
        await example5_AnonymousEvent();
        await example6_ComplexEvent();

        console.log("\n==========================================");
        console.log("All examples completed successfully!");
        console.log("==========================================");
    } catch (error) {
        console.error("Error running examples:", error);
    }
}

// Run the examples
runExamples().catch(console.error);
