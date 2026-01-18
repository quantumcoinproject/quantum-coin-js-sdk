//types.js

/**
 * Quantum Coin Solidity Types
 * 
 * This module provides JavaScript classes for all Solidity 0.7.6 types.
 * These types can be used as input or return types when interacting with smart contracts.
 * 
 * Supported Types:
 * - Boolean: Bool
 * - Unsigned Integers: Uint8, Uint16, ..., Uint256
 * - Signed Integers: Int8, Int16, ..., Int256
 * - Address: Address (32 bytes for QuantumCoin)
 * - Fixed-size Bytes: Bytes1, Bytes2, ..., Bytes32 (also available as bytes1, bytes2, ..., bytes32)
 * - Dynamic Bytes: Bytes
 * - String: String
 * - Arrays: ArrayType
 * - Structs: Struct
 * - Mappings: Mapping (documentation only)
 * 
 * @module quantumcoin/types
 * @example
 * const { Address, Uint256, Bytes2, bytes4 } = require('quantumcoin/types');
 * 
 * // Create types
 * const addr = new Address('0x6f605c4142f1cb037f967101a5b28ccd00b27cce4516190356baaf284d20e667');
 * const amount = new Uint256('1000000000000000000');
 * const fixedBytes = new Bytes2('0x12ab');
 * const fixedBytesLower = new bytes4([0x12, 0xab, 0xcd, 0xef]);
 */

// Lazy load index.js functions to avoid circular dependency
// We'll require it inside the functions that need it
let _isAddressValid = null;

/**
 * Gets the isAddressValid function from index.js
 * @private
 */
function getIsAddressValid() {
    if (_isAddressValid === null) {
        // Lazy require from quantum-coin-js-sdk
        const indexModule = require('quantum-coin-js-sdk');
        _isAddressValid = indexModule.isAddressValid;
    }
    return _isAddressValid;
}

/**
 * Validates a hex string
 * @private
 */
function isValidHex(hex) {
    if (typeof hex !== 'string') return false;
    const hexRegex = /^0x[0-9a-fA-F]+$/;
    return hexRegex.test(hex);
}

/**
 * Converts a value to hex string
 * @private
 */
function toHex(value) {
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            return value.toLowerCase();
        }
        // Assume it's a decimal string
        const num = BigInt(value);
        return '0x' + num.toString(16);
    }
    if (typeof value === 'bigint') {
        return '0x' + value.toString(16);
    }
    if (typeof value === 'number') {
        return '0x' + value.toString(16);
    }
    if (Array.isArray(value)) {
        // Byte array
        return '0x' + value.map(b => {
            const hex = b.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    throw new Error('Cannot convert value to hex');
}

/**
 * Converts hex string to byte array
 * @private
 */
function hexToBytes(hex) {
    if (!hex.startsWith('0x')) {
        throw new Error('Hex string must start with 0x');
    }
    const hexStr = hex.slice(2);
    const bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
        bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
    }
    return bytes;
}

/**
 * Validates a QuantumCoin address (32 bytes = 66 chars with 0x)
 * Uses isAddressValid from index.js
 * Assumes SDK is already initialized
 * @private
 */
function isValidAddress(address) {
    // Use isAddressValid from index.js directly
    // Assumes SDK is already initialized
    const isAddressValidFn = getIsAddressValid();
    const result = isAddressValidFn(address);
    return result === true;
}

/**
 * Base class for Solidity types
 * @class
 */
class SolidityType {
    /**
     * Gets the Solidity type name
     * @return {string}
     */
    getSolidityType() {
        return this.constructor.name;
    }

    /**
     * Converts to hex string for ABI encoding
     * @return {string}
     */
    toHex() {
        throw new Error('toHex() must be implemented by subclass');
    }

    /**
     * Converts to JavaScript value
     * @return {*}
     */
    toJS() {
        throw new Error('toJS() must be implemented by subclass');
    }
}

/**
 * Boolean type
 * @class
 * @extends SolidityType
 */
class Bool extends SolidityType {
    /**
     * Creates a Bool type
     * @param {boolean} value - The boolean value
     */
    constructor(value) {
        super();
        if (typeof value !== 'boolean') {
            throw new Error('Bool constructor expects a boolean value');
        }
        this.value = value;
    }

    toHex() {
        return this.value ? '0x01' : '0x00';
    }

    toJS() {
        return this.value;
    }

    getSolidityType() {
        return 'bool';
    }
}

/**
 * Base class for integer types
 * @class
 * @extends SolidityType
 */
class IntegerType extends SolidityType {
    /**
     * Creates an IntegerType
     * @param {string|number|BigInt} value - The integer value
     * @param {number} bits - Number of bits (8, 16, 24, ..., 256)
     * @param {boolean} signed - Whether the integer is signed
     */
    constructor(value, bits, signed) {
        super();
        this.bits = bits;
        this.signed = signed;
        
        if (typeof value === 'string') {
            if (value.startsWith('0x')) {
                this.value = BigInt(value);
            } else {
                this.value = BigInt(value);
            }
        } else if (typeof value === 'bigint') {
            this.value = value;
        } else if (typeof value === 'number') {
            this.value = BigInt(value);
        } else {
            throw new Error(`Invalid value type for ${this.constructor.name}`);
        }

        // Validate range
        const maxValue = signed ? (BigInt(2) ** BigInt(bits - 1)) - BigInt(1) : (BigInt(2) ** BigInt(bits)) - BigInt(1);
        const minValue = signed ? -(BigInt(2) ** BigInt(bits - 1)) : BigInt(0);
        
        if (this.value > maxValue || this.value < minValue) {
            throw new Error(`Value out of range for ${this.constructor.name} (${minValue} to ${maxValue})`);
        }
    }

    toHex() {
        if (this.value < 0) {
            // Two's complement for negative numbers
            const maxValue = BigInt(2) ** BigInt(this.bits);
            const positiveValue = maxValue + this.value;
            return '0x' + positiveValue.toString(16).padStart(this.bits / 4, '0');
        }
        return '0x' + this.value.toString(16).padStart(this.bits / 4, '0');
    }

    toJS() {
        return this.value;
    }
}

/**
 * Unsigned integer types (uint8, uint16, ..., uint256)
 */

/**
 * Uint8 type - 8-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint8 extends IntegerType {
    /**
     * Creates a Uint8 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 8, false);
    }
    getSolidityType() {
        return 'uint8';
    }
}

/**
 * Uint16 type - 16-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint16 extends IntegerType {
    /**
     * Creates a Uint16 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 16, false);
    }
    getSolidityType() {
        return 'uint16';
    }
}

/**
 * Uint24 type - 24-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint24 extends IntegerType {
    /**
     * Creates a Uint24 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 24, false);
    }
    getSolidityType() {
        return 'uint24';
    }
}

/**
 * Uint32 type - 32-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint32 extends IntegerType {
    /**
     * Creates a Uint32 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 32, false);
    }
    getSolidityType() {
        return 'uint32';
    }
}

/**
 * Uint40 type - 40-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint40 extends IntegerType {
    /**
     * Creates a Uint40 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 40, false);
    }
    getSolidityType() {
        return 'uint40';
    }
}

/**
 * Uint48 type - 48-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint48 extends IntegerType {
    /**
     * Creates a Uint48 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 48, false);
    }
    getSolidityType() {
        return 'uint48';
    }
}

/**
 * Uint56 type - 56-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint56 extends IntegerType {
    /**
     * Creates a Uint56 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 56, false);
    }
    getSolidityType() {
        return 'uint56';
    }
}

/**
 * Uint64 type - 64-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint64 extends IntegerType {
    /**
     * Creates a Uint64 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 64, false);
    }
    getSolidityType() {
        return 'uint64';
    }
}

/**
 * Uint72 type - 72-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint72 extends IntegerType {
    /**
     * Creates a Uint72 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 72, false);
    }
    getSolidityType() {
        return 'uint72';
    }
}

/**
 * Uint80 type - 80-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint80 extends IntegerType {
    /**
     * Creates a Uint80 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 80, false);
    }
    getSolidityType() {
        return 'uint80';
    }
}

/**
 * Uint88 type - 88-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint88 extends IntegerType {
    /**
     * Creates a Uint88 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 88, false);
    }
    getSolidityType() {
        return 'uint88';
    }
}

/**
 * Uint96 type - 96-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint96 extends IntegerType {
    /**
     * Creates a Uint96 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 96, false);
    }
    getSolidityType() {
        return 'uint96';
    }
}

/**
 * Uint104 type - 104-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint104 extends IntegerType {
    /**
     * Creates a Uint104 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 104, false);
    }
    getSolidityType() {
        return 'uint104';
    }
}

/**
 * Uint112 type - 112-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint112 extends IntegerType {
    /**
     * Creates a Uint112 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 112, false);
    }
    getSolidityType() {
        return 'uint112';
    }
}

/**
 * Uint120 type - 120-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint120 extends IntegerType {
    /**
     * Creates a Uint120 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 120, false);
    }
    getSolidityType() {
        return 'uint120';
    }
}

/**
 * Uint128 type - 128-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint128 extends IntegerType {
    /**
     * Creates a Uint128 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 128, false);
    }
    getSolidityType() {
        return 'uint128';
    }
}

/**
 * Uint136 type - 136-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint136 extends IntegerType {
    /**
     * Creates a Uint136 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 136, false);
    }
    getSolidityType() {
        return 'uint136';
    }
}

/**
 * Uint144 type - 144-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint144 extends IntegerType {
    /**
     * Creates a Uint144 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 144, false);
    }
    getSolidityType() {
        return 'uint144';
    }
}

/**
 * Uint152 type - 152-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint152 extends IntegerType {
    /**
     * Creates a Uint152 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 152, false);
    }
    getSolidityType() {
        return 'uint152';
    }
}

/**
 * Uint160 type - 160-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint160 extends IntegerType {
    /**
     * Creates a Uint160 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 160, false);
    }
    getSolidityType() {
        return 'uint160';
    }
}

/**
 * Uint168 type - 168-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint168 extends IntegerType {
    /**
     * Creates a Uint168 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 168, false);
    }
    getSolidityType() {
        return 'uint168';
    }
}

/**
 * Uint176 type - 176-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint176 extends IntegerType {
    /**
     * Creates a Uint176 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 176, false);
    }
    getSolidityType() {
        return 'uint176';
    }
}

/**
 * Uint184 type - 184-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint184 extends IntegerType {
    /**
     * Creates a Uint184 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 184, false);
    }
    getSolidityType() {
        return 'uint184';
    }
}

/**
 * Uint192 type - 192-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint192 extends IntegerType {
    /**
     * Creates a Uint192 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 192, false);
    }
    getSolidityType() {
        return 'uint192';
    }
}

/**
 * Uint200 type - 200-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint200 extends IntegerType {
    /**
     * Creates a Uint200 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 200, false);
    }
    getSolidityType() {
        return 'uint200';
    }
}

/**
 * Uint208 type - 208-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint208 extends IntegerType {
    /**
     * Creates a Uint208 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 208, false);
    }
    getSolidityType() {
        return 'uint208';
    }
}

/**
 * Uint216 type - 216-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint216 extends IntegerType {
    /**
     * Creates a Uint216 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 216, false);
    }
    getSolidityType() {
        return 'uint216';
    }
}

/**
 * Uint224 type - 224-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint224 extends IntegerType {
    /**
     * Creates a Uint224 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 224, false);
    }
    getSolidityType() {
        return 'uint224';
    }
}

/**
 * Uint232 type - 232-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint232 extends IntegerType {
    /**
     * Creates a Uint232 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 232, false);
    }
    getSolidityType() {
        return 'uint232';
    }
}

/**
 * Uint240 type - 240-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint240 extends IntegerType {
    /**
     * Creates a Uint240 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 240, false);
    }
    getSolidityType() {
        return 'uint240';
    }
}

/**
 * Uint248 type - 248-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint248 extends IntegerType {
    /**
     * Creates a Uint248 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 248, false);
    }
    getSolidityType() {
        return 'uint248';
    }
}

/**
 * Uint256 type - 256-bit unsigned integer
 * @class
 * @extends IntegerType
 */
class Uint256 extends IntegerType {
    /**
     * Creates a Uint256 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 256, false);
    }
    getSolidityType() {
        return 'uint256';
    }
}

/**
 * Signed integer types (int8, int16, ..., int256)
 */

/**
 * Int8 type - 8-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int8 extends IntegerType {
    /**
     * Creates an Int8 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 8, true);
    }
    getSolidityType() {
        return 'int8';
    }
}

/**
 * Int16 type - 16-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int16 extends IntegerType {
    /**
     * Creates an Int16 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 16, true);
    }
    getSolidityType() {
        return 'int16';
    }
}

/**
 * Int24 type - 24-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int24 extends IntegerType {
    /**
     * Creates an Int24 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 24, true);
    }
    getSolidityType() {
        return 'int24';
    }
}

/**
 * Int32 type - 32-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int32 extends IntegerType {
    /**
     * Creates an Int32 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 32, true);
    }
    getSolidityType() {
        return 'int32';
    }
}

/**
 * Int40 type - 40-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int40 extends IntegerType {
    /**
     * Creates an Int40 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 40, true);
    }
    getSolidityType() {
        return 'int40';
    }
}

/**
 * Int48 type - 48-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int48 extends IntegerType {
    /**
     * Creates an Int48 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 48, true);
    }
    getSolidityType() {
        return 'int48';
    }
}

/**
 * Int56 type - 56-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int56 extends IntegerType {
    /**
     * Creates an Int56 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 56, true);
    }
    getSolidityType() {
        return 'int56';
    }
}

/**
 * Int64 type - 64-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int64 extends IntegerType {
    /**
     * Creates an Int64 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 64, true);
    }
    getSolidityType() {
        return 'int64';
    }
}

/**
 * Int72 type - 72-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int72 extends IntegerType {
    /**
     * Creates an Int72 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 72, true);
    }
    getSolidityType() {
        return 'int72';
    }
}

/**
 * Int80 type - 80-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int80 extends IntegerType {
    /**
     * Creates an Int80 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 80, true);
    }
    getSolidityType() {
        return 'int80';
    }
}

/**
 * Int88 type - 88-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int88 extends IntegerType {
    /**
     * Creates an Int88 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 88, true);
    }
    getSolidityType() {
        return 'int88';
    }
}

/**
 * Int96 type - 96-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int96 extends IntegerType {
    /**
     * Creates an Int96 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 96, true);
    }
    getSolidityType() {
        return 'int96';
    }
}

/**
 * Int104 type - 104-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int104 extends IntegerType {
    /**
     * Creates an Int104 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 104, true);
    }
    getSolidityType() {
        return 'int104';
    }
}

/**
 * Int112 type - 112-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int112 extends IntegerType {
    /**
     * Creates an Int112 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 112, true);
    }
    getSolidityType() {
        return 'int112';
    }
}

/**
 * Int120 type - 120-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int120 extends IntegerType {
    /**
     * Creates an Int120 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 120, true);
    }
    getSolidityType() {
        return 'int120';
    }
}

/**
 * Int128 type - 128-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int128 extends IntegerType {
    /**
     * Creates an Int128 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 128, true);
    }
    getSolidityType() {
        return 'int128';
    }
}

/**
 * Int136 type - 136-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int136 extends IntegerType {
    /**
     * Creates an Int136 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 136, true);
    }
    getSolidityType() {
        return 'int136';
    }
}

/**
 * Int144 type - 144-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int144 extends IntegerType {
    /**
     * Creates an Int144 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 144, true);
    }
    getSolidityType() {
        return 'int144';
    }
}

/**
 * Int152 type - 152-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int152 extends IntegerType {
    /**
     * Creates an Int152 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 152, true);
    }
    getSolidityType() {
        return 'int152';
    }
}

/**
 * Int160 type - 160-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int160 extends IntegerType {
    /**
     * Creates an Int160 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 160, true);
    }
    getSolidityType() {
        return 'int160';
    }
}

/**
 * Int168 type - 168-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int168 extends IntegerType {
    /**
     * Creates an Int168 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 168, true);
    }
    getSolidityType() {
        return 'int168';
    }
}

/**
 * Int176 type - 176-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int176 extends IntegerType {
    /**
     * Creates an Int176 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 176, true);
    }
    getSolidityType() {
        return 'int176';
    }
}

/**
 * Int184 type - 184-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int184 extends IntegerType {
    /**
     * Creates an Int184 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 184, true);
    }
    getSolidityType() {
        return 'int184';
    }
}

/**
 * Int192 type - 192-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int192 extends IntegerType {
    /**
     * Creates an Int192 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 192, true);
    }
    getSolidityType() {
        return 'int192';
    }
}

/**
 * Int200 type - 200-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int200 extends IntegerType {
    /**
     * Creates an Int200 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 200, true);
    }
    getSolidityType() {
        return 'int200';
    }
}

/**
 * Int208 type - 208-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int208 extends IntegerType {
    /**
     * Creates an Int208 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 208, true);
    }
    getSolidityType() {
        return 'int208';
    }
}

/**
 * Int216 type - 216-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int216 extends IntegerType {
    /**
     * Creates an Int216 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 216, true);
    }
    getSolidityType() {
        return 'int216';
    }
}

/**
 * Int224 type - 224-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int224 extends IntegerType {
    /**
     * Creates an Int224 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 224, true);
    }
    getSolidityType() {
        return 'int224';
    }
}

/**
 * Int232 type - 232-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int232 extends IntegerType {
    /**
     * Creates an Int232 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 232, true);
    }
    getSolidityType() {
        return 'int232';
    }
}

/**
 * Int240 type - 240-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int240 extends IntegerType {
    /**
     * Creates an Int240 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 240, true);
    }
    getSolidityType() {
        return 'int240';
    }
}

/**
 * Int248 type - 248-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int248 extends IntegerType {
    /**
     * Creates an Int248 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 248, true);
    }
    getSolidityType() {
        return 'int248';
    }
}

/**
 * Int256 type - 256-bit signed integer
 * @class
 * @extends IntegerType
 */
class Int256 extends IntegerType {
    /**
     * Creates an Int256 type
     * @param {string|number|BigInt} value - The integer value
     */
    constructor(value) {
        super(value, 256, true);
    }
    getSolidityType() {
        return 'int256';
    }
}

/**
 * Address type (32 bytes for QuantumCoin)
 * @class
 * @extends SolidityType
 */
class Address extends SolidityType {
    /**
     * Creates an Address type
     * @param {string|Array<number>} value - The address as a hex string (66 chars with 0x) or 32-byte array
     */
    constructor(value) {
        super();
        if (typeof value === 'string') {
            if (!isValidAddress(value)) {
                throw new Error('Invalid address format. Must be 66 characters (0x + 64 hex chars)');
            }
            this.value = value.toLowerCase();
        } else if (Array.isArray(value)) {
            if (value.length !== 32) {
                throw new Error('Address byte array must be exactly 32 bytes');
            }
            this.value = toHex(value);
        } else {
            throw new Error('Address constructor expects a hex string or 32-byte array');
        }
    }

    toHex() {
        return this.value;
    }

    toJS() {
        return this.value;
    }

    getSolidityType() {
        return 'address';
    }
}

/**
 * Base class for fixed-size bytes types
 * @class
 * @extends SolidityType
 */
class FixedBytesType extends SolidityType {
    /**
     * Creates a FixedBytesType
     * @param {string|Array<number>} value - The bytes as hex string or byte array
     * @param {number} size - Number of bytes (1-32)
     */
    constructor(value, size) {
        super();
        this.size = size;
        
        if (typeof value === 'string') {
            if (!isValidHex(value)) {
                throw new Error(`Invalid hex string for bytes${size}`);
            }
            const bytes = hexToBytes(value);
            if (bytes.length !== size) {
                throw new Error(`bytes${size} must be exactly ${size} bytes`);
            }
            this.value = value.toLowerCase();
        } else if (Array.isArray(value)) {
            if (value.length !== size) {
                throw new Error(`bytes${size} must be exactly ${size} bytes`);
            }
            this.value = toHex(value);
        } else {
            throw new Error(`bytes${size} constructor expects a hex string or ${size}-byte array`);
        }
    }

    toHex() {
        return this.value;
    }

    toJS() {
        return this.value;
    }
}

/**
 * Fixed-size bytes types (bytes1, bytes2, ..., bytes32)
 * 
 * These types represent fixed-size byte arrays in Solidity.
 * Each type accepts:
 * - A hex string (e.g., "0x12ab" for bytes2)
 * - A byte array (e.g., [0x12, 0xab] for bytes2)
 */

/**
 * Bytes1 type - 1-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes1 extends FixedBytesType {
    /**
     * Creates a Bytes1 type
     * @param {string|Array<number>} value - The bytes as hex string or 1-byte array
     */
    constructor(value) {
        super(value, 1);
    }
    getSolidityType() {
        return 'bytes1';
    }
}

/**
 * Bytes2 type - 2-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes2 extends FixedBytesType {
    /**
     * Creates a Bytes2 type
     * @param {string|Array<number>} value - The bytes as hex string or 2-byte array
     */
    constructor(value) {
        super(value, 2);
    }
    getSolidityType() {
        return 'bytes2';
    }
}

/**
 * Bytes3 type - 3-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes3 extends FixedBytesType {
    /**
     * Creates a Bytes3 type
     * @param {string|Array<number>} value - The bytes as hex string or 3-byte array
     */
    constructor(value) {
        super(value, 3);
    }
    getSolidityType() {
        return 'bytes3';
    }
}

/**
 * Bytes4 type - 4-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes4 extends FixedBytesType {
    /**
     * Creates a Bytes4 type
     * @param {string|Array<number>} value - The bytes as hex string or 4-byte array
     */
    constructor(value) {
        super(value, 4);
    }
    getSolidityType() {
        return 'bytes4';
    }
}

/**
 * Bytes5 type - 5-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes5 extends FixedBytesType {
    /**
     * Creates a Bytes5 type
     * @param {string|Array<number>} value - The bytes as hex string or 5-byte array
     */
    constructor(value) {
        super(value, 5);
    }
    getSolidityType() {
        return 'bytes5';
    }
}

/**
 * Bytes6 type - 6-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes6 extends FixedBytesType {
    /**
     * Creates a Bytes6 type
     * @param {string|Array<number>} value - The bytes as hex string or 6-byte array
     */
    constructor(value) {
        super(value, 6);
    }
    getSolidityType() {
        return 'bytes6';
    }
}

/**
 * Bytes7 type - 7-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes7 extends FixedBytesType {
    /**
     * Creates a Bytes7 type
     * @param {string|Array<number>} value - The bytes as hex string or 7-byte array
     */
    constructor(value) {
        super(value, 7);
    }
    getSolidityType() {
        return 'bytes7';
    }
}

/**
 * Bytes8 type - 8-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes8 extends FixedBytesType {
    /**
     * Creates a Bytes8 type
     * @param {string|Array<number>} value - The bytes as hex string or 8-byte array
     */
    constructor(value) {
        super(value, 8);
    }
    getSolidityType() {
        return 'bytes8';
    }
}

/**
 * Bytes9 type - 9-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes9 extends FixedBytesType {
    /**
     * Creates a Bytes9 type
     * @param {string|Array<number>} value - The bytes as hex string or 9-byte array
     */
    constructor(value) {
        super(value, 9);
    }
    getSolidityType() {
        return 'bytes9';
    }
}

/**
 * Bytes10 type - 10-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes10 extends FixedBytesType {
    /**
     * Creates a Bytes10 type
     * @param {string|Array<number>} value - The bytes as hex string or 10-byte array
     */
    constructor(value) {
        super(value, 10);
    }
    getSolidityType() {
        return 'bytes10';
    }
}

/**
 * Bytes11 type - 11-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes11 extends FixedBytesType {
    /**
     * Creates a Bytes11 type
     * @param {string|Array<number>} value - The bytes as hex string or 11-byte array
     */
    constructor(value) {
        super(value, 11);
    }
    getSolidityType() {
        return 'bytes11';
    }
}

/**
 * Bytes12 type - 12-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes12 extends FixedBytesType {
    /**
     * Creates a Bytes12 type
     * @param {string|Array<number>} value - The bytes as hex string or 12-byte array
     */
    constructor(value) {
        super(value, 12);
    }
    getSolidityType() {
        return 'bytes12';
    }
}

/**
 * Bytes13 type - 13-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes13 extends FixedBytesType {
    /**
     * Creates a Bytes13 type
     * @param {string|Array<number>} value - The bytes as hex string or 13-byte array
     */
    constructor(value) {
        super(value, 13);
    }
    getSolidityType() {
        return 'bytes13';
    }
}

/**
 * Bytes14 type - 14-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes14 extends FixedBytesType {
    /**
     * Creates a Bytes14 type
     * @param {string|Array<number>} value - The bytes as hex string or 14-byte array
     */
    constructor(value) {
        super(value, 14);
    }
    getSolidityType() {
        return 'bytes14';
    }
}

/**
 * Bytes15 type - 15-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes15 extends FixedBytesType {
    /**
     * Creates a Bytes15 type
     * @param {string|Array<number>} value - The bytes as hex string or 15-byte array
     */
    constructor(value) {
        super(value, 15);
    }
    getSolidityType() {
        return 'bytes15';
    }
}

/**
 * Bytes16 type - 16-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes16 extends FixedBytesType {
    /**
     * Creates a Bytes16 type
     * @param {string|Array<number>} value - The bytes as hex string or 16-byte array
     */
    constructor(value) {
        super(value, 16);
    }
    getSolidityType() {
        return 'bytes16';
    }
}

/**
 * Bytes17 type - 17-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes17 extends FixedBytesType {
    /**
     * Creates a Bytes17 type
     * @param {string|Array<number>} value - The bytes as hex string or 17-byte array
     */
    constructor(value) {
        super(value, 17);
    }
    getSolidityType() {
        return 'bytes17';
    }
}

/**
 * Bytes18 type - 18-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes18 extends FixedBytesType {
    /**
     * Creates a Bytes18 type
     * @param {string|Array<number>} value - The bytes as hex string or 18-byte array
     */
    constructor(value) {
        super(value, 18);
    }
    getSolidityType() {
        return 'bytes18';
    }
}

/**
 * Bytes19 type - 19-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes19 extends FixedBytesType {
    /**
     * Creates a Bytes19 type
     * @param {string|Array<number>} value - The bytes as hex string or 19-byte array
     */
    constructor(value) {
        super(value, 19);
    }
    getSolidityType() {
        return 'bytes19';
    }
}

/**
 * Bytes20 type - 20-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes20 extends FixedBytesType {
    /**
     * Creates a Bytes20 type
     * @param {string|Array<number>} value - The bytes as hex string or 20-byte array
     */
    constructor(value) {
        super(value, 20);
    }
    getSolidityType() {
        return 'bytes20';
    }
}

/**
 * Bytes21 type - 21-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes21 extends FixedBytesType {
    /**
     * Creates a Bytes21 type
     * @param {string|Array<number>} value - The bytes as hex string or 21-byte array
     */
    constructor(value) {
        super(value, 21);
    }
    getSolidityType() {
        return 'bytes21';
    }
}

/**
 * Bytes22 type - 22-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes22 extends FixedBytesType {
    /**
     * Creates a Bytes22 type
     * @param {string|Array<number>} value - The bytes as hex string or 22-byte array
     */
    constructor(value) {
        super(value, 22);
    }
    getSolidityType() {
        return 'bytes22';
    }
}

/**
 * Bytes23 type - 23-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes23 extends FixedBytesType {
    /**
     * Creates a Bytes23 type
     * @param {string|Array<number>} value - The bytes as hex string or 23-byte array
     */
    constructor(value) {
        super(value, 23);
    }
    getSolidityType() {
        return 'bytes23';
    }
}

/**
 * Bytes24 type - 24-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes24 extends FixedBytesType {
    /**
     * Creates a Bytes24 type
     * @param {string|Array<number>} value - The bytes as hex string or 24-byte array
     */
    constructor(value) {
        super(value, 24);
    }
    getSolidityType() {
        return 'bytes24';
    }
}

/**
 * Bytes25 type - 25-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes25 extends FixedBytesType {
    /**
     * Creates a Bytes25 type
     * @param {string|Array<number>} value - The bytes as hex string or 25-byte array
     */
    constructor(value) {
        super(value, 25);
    }
    getSolidityType() {
        return 'bytes25';
    }
}

/**
 * Bytes26 type - 26-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes26 extends FixedBytesType {
    /**
     * Creates a Bytes26 type
     * @param {string|Array<number>} value - The bytes as hex string or 26-byte array
     */
    constructor(value) {
        super(value, 26);
    }
    getSolidityType() {
        return 'bytes26';
    }
}

/**
 * Bytes27 type - 27-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes27 extends FixedBytesType {
    /**
     * Creates a Bytes27 type
     * @param {string|Array<number>} value - The bytes as hex string or 27-byte array
     */
    constructor(value) {
        super(value, 27);
    }
    getSolidityType() {
        return 'bytes27';
    }
}

/**
 * Bytes28 type - 28-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes28 extends FixedBytesType {
    /**
     * Creates a Bytes28 type
     * @param {string|Array<number>} value - The bytes as hex string or 28-byte array
     */
    constructor(value) {
        super(value, 28);
    }
    getSolidityType() {
        return 'bytes28';
    }
}

/**
 * Bytes29 type - 29-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes29 extends FixedBytesType {
    /**
     * Creates a Bytes29 type
     * @param {string|Array<number>} value - The bytes as hex string or 29-byte array
     */
    constructor(value) {
        super(value, 29);
    }
    getSolidityType() {
        return 'bytes29';
    }
}

/**
 * Bytes30 type - 30-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes30 extends FixedBytesType {
    /**
     * Creates a Bytes30 type
     * @param {string|Array<number>} value - The bytes as hex string or 30-byte array
     */
    constructor(value) {
        super(value, 30);
    }
    getSolidityType() {
        return 'bytes30';
    }
}

/**
 * Bytes31 type - 31-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes31 extends FixedBytesType {
    /**
     * Creates a Bytes31 type
     * @param {string|Array<number>} value - The bytes as hex string or 31-byte array
     */
    constructor(value) {
        super(value, 31);
    }
    getSolidityType() {
        return 'bytes31';
    }
}

/**
 * Bytes32 type - 32-byte fixed-size array
 * @class
 * @extends FixedBytesType
 */
class Bytes32 extends FixedBytesType {
    /**
     * Creates a Bytes32 type
     * @param {string|Array<number>} value - The bytes as hex string or 32-byte array
     */
    constructor(value) {
        super(value, 32);
    }
    getSolidityType() {
        return 'bytes32';
    }
}

// Lowercase aliases for Solidity-style access
const bytes1 = Bytes1;
const bytes2 = Bytes2;
const bytes3 = Bytes3;
const bytes4 = Bytes4;
const bytes5 = Bytes5;
const bytes6 = Bytes6;
const bytes7 = Bytes7;
const bytes8 = Bytes8;
const bytes9 = Bytes9;
const bytes10 = Bytes10;
const bytes11 = Bytes11;
const bytes12 = Bytes12;
const bytes13 = Bytes13;
const bytes14 = Bytes14;
const bytes15 = Bytes15;
const bytes16 = Bytes16;
const bytes17 = Bytes17;
const bytes18 = Bytes18;
const bytes19 = Bytes19;
const bytes20 = Bytes20;
const bytes21 = Bytes21;
const bytes22 = Bytes22;
const bytes23 = Bytes23;
const bytes24 = Bytes24;
const bytes25 = Bytes25;
const bytes26 = Bytes26;
const bytes27 = Bytes27;
const bytes28 = Bytes28;
const bytes29 = Bytes29;
const bytes30 = Bytes30;
const bytes31 = Bytes31;
const bytes32 = Bytes32;

/**
 * Dynamic bytes type
 * @class
 * @extends SolidityType
 */
class Bytes extends SolidityType {
    /**
     * Creates a Bytes type
     * @param {string|Array<number>} value - The bytes as hex string or byte array
     */
    constructor(value) {
        super();
        if (typeof value === 'string') {
            if (!isValidHex(value)) {
                throw new Error('Invalid hex string for bytes');
            }
            this.value = value.toLowerCase();
        } else if (Array.isArray(value)) {
            this.value = toHex(value);
        } else {
            throw new Error('Bytes constructor expects a hex string or byte array');
        }
    }

    toHex() {
        return this.value;
    }

    toJS() {
        return this.value;
    }

    getSolidityType() {
        return 'bytes';
    }
}

/**
 * String type
 * @class
 * @extends SolidityType
 */
class String extends SolidityType {
    /**
     * Creates a String type
     * @param {string} value - The string value
     */
    constructor(value) {
        super();
        if (typeof value !== 'string') {
            throw new Error('String constructor expects a string value');
        }
        this.value = value;
    }

    toHex() {
        // String encoding is handled by ABI encoder, but we can provide UTF-8 bytes
        const bytes = Buffer.from(this.value, 'utf8');
        return '0x' + bytes.toString('hex');
    }

    toJS() {
        return this.value;
    }

    getSolidityType() {
        return 'string';
    }
}

/**
 * Array type (fixed or dynamic)
 * @class
 * @extends SolidityType
 */
class ArrayType extends SolidityType {
    /**
     * Creates an ArrayType
     * @param {Array} values - Array of values
     * @param {Function} elementType - Constructor for element type
     * @param {number|null} fixedSize - Fixed size if specified, null for dynamic
     */
    constructor(values, elementType, fixedSize = null) {
        super();
        if (!Array.isArray(values)) {
            throw new Error('ArrayType constructor expects an array');
        }
        if (fixedSize !== null && values.length !== fixedSize) {
            throw new Error(`Fixed-size array must have exactly ${fixedSize} elements`);
        }
        this.elementType = elementType;
        this.fixedSize = fixedSize;
        this.values = values.map(v => {
            if (v instanceof SolidityType) {
                return v;
            }
            return new elementType(v);
        });
    }

    toHex() {
        // Array encoding is handled by ABI encoder
        // This is a placeholder - actual encoding happens in packMethodData
        throw new Error('Array encoding should be handled by ABI encoder');
    }

    toJS() {
        return this.values.map(v => v.toJS());
    }

    getSolidityType() {
        const elementTypeName = this.values.length > 0 ? this.values[0].getSolidityType() : 'unknown';
        if (this.fixedSize !== null) {
            return `${elementTypeName}[${this.fixedSize}]`;
        }
        return `${elementTypeName}[]`;
    }
}

/**
 * Struct type
 * @class
 * @extends SolidityType
 */
class Struct extends SolidityType {
    /**
     * Creates a Struct type
     * @param {Object} fields - Object with field names as keys and SolidityType instances as values
     * @param {Object} structDefinition - Definition of struct fields (name -> type mapping)
     */
    constructor(fields, structDefinition) {
        super();
        this.structDefinition = structDefinition;
        this.fields = {};
        
        for (const [fieldName, fieldType] of Object.entries(structDefinition)) {
            if (!(fieldName in fields)) {
                throw new Error(`Missing field: ${fieldName}`);
            }
            const value = fields[fieldName];
            if (value instanceof SolidityType) {
                this.fields[fieldName] = value;
            } else {
                // Try to create instance from fieldType
                // This is a simplified version - in practice, you'd need a type registry
                throw new Error(`Field ${fieldName} must be a SolidityType instance`);
            }
        }
    }

    toHex() {
        // Struct encoding is handled by ABI encoder
        throw new Error('Struct encoding should be handled by ABI encoder');
    }

    toJS() {
        const result = {};
        for (const [fieldName, fieldValue] of Object.entries(this.fields)) {
            result[fieldName] = fieldValue.toJS();
        }
        return result;
    }

    getSolidityType() {
        return 'struct';
    }
}

/**
 * Mapping type (for documentation purposes - mappings cannot be passed as parameters in Solidity)
 * @class
 * @extends SolidityType
 */
class Mapping extends SolidityType {
    /**
     * Creates a Mapping type (for documentation only)
     * @param {Function} keyType - The key type constructor
     * @param {Function} valueType - The value type constructor
     */
    constructor(keyType, valueType) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
    }

    toHex() {
        throw new Error('Mappings cannot be encoded - they are storage-only types');
    }

    toJS() {
        throw new Error('Mappings cannot be converted to JS - they are storage-only types');
    }

    getSolidityType() {
        return `mapping(${this.keyType.name} => ${this.valueType.name})`;
    }
}

// Export all types
module.exports = {
    // Base class
    SolidityType,
    
    // Boolean
    Bool,
    
    // Unsigned integers
    Uint8,
    Uint16,
    Uint24,
    Uint32,
    Uint40,
    Uint48,
    Uint56,
    Uint64,
    Uint72,
    Uint80,
    Uint88,
    Uint96,
    Uint104,
    Uint112,
    Uint120,
    Uint128,
    Uint136,
    Uint144,
    Uint152,
    Uint160,
    Uint168,
    Uint176,
    Uint184,
    Uint192,
    Uint200,
    Uint208,
    Uint216,
    Uint224,
    Uint232,
    Uint240,
    Uint248,
    Uint256,
    
    // Signed integers
    Int8,
    Int16,
    Int24,
    Int32,
    Int40,
    Int48,
    Int56,
    Int64,
    Int72,
    Int80,
    Int88,
    Int96,
    Int104,
    Int112,
    Int120,
    Int128,
    Int136,
    Int144,
    Int152,
    Int160,
    Int168,
    Int176,
    Int184,
    Int192,
    Int200,
    Int208,
    Int216,
    Int224,
    Int232,
    Int240,
    Int248,
    Int256,
    
    // Address
    Address,
    
    // Fixed bytes (PascalCase: Bytes1, Bytes2, ..., Bytes32)
    Bytes1,
    Bytes2,
    Bytes3,
    Bytes4,
    Bytes5,
    Bytes6,
    Bytes7,
    Bytes8,
    Bytes9,
    Bytes10,
    Bytes11,
    Bytes12,
    Bytes13,
    Bytes14,
    Bytes15,
    Bytes16,
    Bytes17,
    Bytes18,
    Bytes19,
    Bytes20,
    Bytes21,
    Bytes22,
    Bytes23,
    Bytes24,
    Bytes25,
    Bytes26,
    Bytes27,
    Bytes28,
    Bytes29,
    Bytes30,
    Bytes31,
    Bytes32,
    
    // Fixed bytes (lowercase aliases: bytes1, bytes2, ..., bytes32)
    bytes1,
    bytes2,
    bytes3,
    bytes4,
    bytes5,
    bytes6,
    bytes7,
    bytes8,
    bytes9,
    bytes10,
    bytes11,
    bytes12,
    bytes13,
    bytes14,
    bytes15,
    bytes16,
    bytes17,
    bytes18,
    bytes19,
    bytes20,
    bytes21,
    bytes22,
    bytes23,
    bytes24,
    bytes25,
    bytes26,
    bytes27,
    bytes28,
    bytes29,
    bytes30,
    bytes31,
    bytes32,
    
    // Dynamic bytes
    Bytes,
    
    // String
    String,
    
    // Array
    ArrayType,
    
    // Struct
    Struct,
    
    // Mapping (documentation only)
    Mapping,
    
    // Helper functions
    isValidAddress,
    isValidHex,
    toHex,
    hexToBytes
};
