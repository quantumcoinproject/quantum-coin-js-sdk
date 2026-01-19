/**
 * Example: RLP Encoding and Decoding
 * 
 * This example demonstrates how to use the encodeRlp and decodeRlp functions
 * to encode and decode various JavaScript values using RLP (Recursive Length Prefix) encoding.
 * 
 * RLP is used in Ethereum and Quantum Coin for encoding structured data.
 */

const qcsdk = require('../index');

// Initialize the SDK
async function main() {
    console.log('=== RLP Encoding and Decoding Examples ===\n');

    // Initialize SDK with default mainnet config
    const initResult = await qcsdk.initialize(null);
    if (initResult === false) {
        console.error('Failed to initialize SDK');
        return;
    }
    console.log('SDK initialized successfully\n');

    // Example 1: Encode and decode a string
    console.log('--- Example 1: String ---');
    const stringValue = 'Hello, World!';
    console.log('Original value:', stringValue);
    
    const encodeResult1 = qcsdk.encodeRlp(stringValue);
    if (encodeResult1.error) {
        console.error('Encoding error:', encodeResult1.error);
    } else {
        console.log('Encoded (hex):', encodeResult1.result);
        
        const decodeResult1 = qcsdk.decodeRlp(encodeResult1.result);
        if (decodeResult1.error) {
            console.error('Decoding error:', decodeResult1.error);
        } else {
            const decoded = JSON.parse(decodeResult1.result);
            console.log('Decoded value:', decoded);
            console.log('Round-trip successful:', decoded === stringValue);
        }
    }
    console.log();

    // Example 2: Encode and decode a number
    console.log('--- Example 2: Number ---');
    const numberValue = 42;
    console.log('Original value:', numberValue);
    
    const encodeResult2 = qcsdk.encodeRlp(numberValue);
    if (encodeResult2.error) {
        console.error('Encoding error:', encodeResult2.error);
    } else {
        console.log('Encoded (hex):', encodeResult2.result);
        
        const decodeResult2 = qcsdk.decodeRlp(encodeResult2.result);
        if (decodeResult2.error) {
            console.error('Decoding error:', decodeResult2.error);
        } else {
            const decoded = JSON.parse(decodeResult2.result);
            console.log('Decoded value:', decoded);
            console.log('Round-trip successful:', decoded === numberValue);
        }
    }
    console.log();

    // Example 3: Encode and decode a boolean
    console.log('--- Example 3: Boolean ---');
    const boolValue = true;
    console.log('Original value:', boolValue);
    
    const encodeResult3 = qcsdk.encodeRlp(boolValue);
    if (encodeResult3.error) {
        console.error('Encoding error:', encodeResult3.error);
    } else {
        console.log('Encoded (hex):', encodeResult3.result);
        
        const decodeResult3 = qcsdk.decodeRlp(encodeResult3.result);
        if (decodeResult3.error) {
            console.error('Decoding error:', decodeResult3.error);
        } else {
            const decoded = JSON.parse(decodeResult3.result);
            console.log('Decoded value:', decoded);
            console.log('Round-trip successful:', decoded === boolValue);
        }
    }
    console.log();

    // Example 4: Encode and decode an array
    console.log('--- Example 4: Array ---');
    const arrayValue = ['hello', 123, true];
    console.log('Original value:', JSON.stringify(arrayValue));
    
    const encodeResult4 = qcsdk.encodeRlp(arrayValue);
    if (encodeResult4.error) {
        console.error('Encoding error:', encodeResult4.error);
    } else {
        console.log('Encoded (hex):', encodeResult4.result);
        
        const decodeResult4 = qcsdk.decodeRlp(encodeResult4.result);
        if (decodeResult4.error) {
            console.error('Decoding error:', decodeResult4.error);
        } else {
            const decoded = JSON.parse(decodeResult4.result);
            console.log('Decoded value:', JSON.stringify(decoded));
            console.log('Round-trip successful:', JSON.stringify(decoded) === JSON.stringify(arrayValue));
        }
    }
    console.log();

    // Example 5: Encode and decode an object (map)
    console.log('--- Example 5: Object (Map) ---');
    const objectValue = { name: 'Alice', age: 30, active: true };
    console.log('Original value:', JSON.stringify(objectValue));
    
    const encodeResult5 = qcsdk.encodeRlp(objectValue);
    if (encodeResult5.error) {
        console.error('Encoding error:', encodeResult5.error);
    } else {
        console.log('Encoded (hex):', encodeResult5.result);
        
        const decodeResult5 = qcsdk.decodeRlp(encodeResult5.result);
        if (decodeResult5.error) {
            console.error('Decoding error:', decodeResult5.error);
        } else {
            const decoded = JSON.parse(decodeResult5.result);
            console.log('Decoded value:', JSON.stringify(decoded));
            // Note: Objects are encoded as arrays of key-value pairs in RLP
            // The decoded structure may differ from the original object
        }
    }
    console.log();

    // Example 6: Encode and decode a hex string
    console.log('--- Example 6: Hex String ---');
    const hexValue = '0x48656c6c6f'; // "Hello" in hex
    console.log('Original value:', hexValue);
    
    const encodeResult6 = qcsdk.encodeRlp(hexValue);
    if (encodeResult6.error) {
        console.error('Encoding error:', encodeResult6.error);
    } else {
        console.log('Encoded (hex):', encodeResult6.result);
        
        const decodeResult6 = qcsdk.decodeRlp(encodeResult6.result);
        if (decodeResult6.error) {
            console.error('Decoding error:', decodeResult6.error);
        } else {
            const decoded = JSON.parse(decodeResult6.result);
            console.log('Decoded value:', decoded);
        }
    }
    console.log();

    // Example 7: Encode and decode a nested array
    console.log('--- Example 7: Nested Array ---');
    const nestedArrayValue = [1, [2, 3], [4, [5, 6]]];
    console.log('Original value:', JSON.stringify(nestedArrayValue));
    
    const encodeResult7 = qcsdk.encodeRlp(nestedArrayValue);
    if (encodeResult7.error) {
        console.error('Encoding error:', encodeResult7.error);
    } else {
        console.log('Encoded (hex):', encodeResult7.result);
        
        const decodeResult7 = qcsdk.decodeRlp(encodeResult7.result);
        if (decodeResult7.error) {
            console.error('Decoding error:', decodeResult7.error);
        } else {
            const decoded = JSON.parse(decodeResult7.result);
            console.log('Decoded value:', JSON.stringify(decoded));
            console.log('Round-trip successful:', JSON.stringify(decoded) === JSON.stringify(nestedArrayValue));
        }
    }
    console.log();

    // Example 8: Encode and decode a large number (BigInt)
    console.log('--- Example 8: Large Number (BigInt) ---');
    const bigIntValue = '1000000000000000000'; // 1 ether in wei
    console.log('Original value:', bigIntValue);
    
    const encodeResult8 = qcsdk.encodeRlp(bigIntValue);
    if (encodeResult8.error) {
        console.error('Encoding error:', encodeResult8.error);
    } else {
        console.log('Encoded (hex):', encodeResult8.result);
        
        const decodeResult8 = qcsdk.decodeRlp(encodeResult8.result);
        if (decodeResult8.error) {
            console.error('Decoding error:', decodeResult8.error);
        } else {
            const decoded = JSON.parse(decodeResult8.result);
            console.log('Decoded value:', decoded);
        }
    }
    console.log();

    // Example 9: Empty array
    console.log('--- Example 9: Empty Array ---');
    const emptyArrayValue = [];
    console.log('Original value:', JSON.stringify(emptyArrayValue));
    
    const encodeResult9 = qcsdk.encodeRlp(emptyArrayValue);
    if (encodeResult9.error) {
        console.error('Encoding error:', encodeResult9.error);
    } else {
        console.log('Encoded (hex):', encodeResult9.result);
        
        const decodeResult9 = qcsdk.decodeRlp(encodeResult9.result);
        if (decodeResult9.error) {
            console.error('Decoding error:', decodeResult9.error);
        } else {
            const decoded = JSON.parse(decodeResult9.result);
            console.log('Decoded value:', JSON.stringify(decoded));
            console.log('Round-trip successful:', JSON.stringify(decoded) === JSON.stringify(emptyArrayValue));
        }
    }
    console.log();

    console.log('=== All Examples Completed ===');
}

// Run the examples
main().catch(console.error);
