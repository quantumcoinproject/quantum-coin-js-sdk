'use strict';

// Pure-JS byte/hex helpers - no Buffer, no atob - so specs run identically in
// Node and the browser. All return/accept plain number[] byte arrays.

function hexToBytes(hex) {
    if (typeof hex !== 'string') throw new Error('hexToBytes: expected string');
    const h = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
    if (h.length % 2 !== 0) throw new Error('hexToBytes: odd-length hex');
    const out = [];
    for (let i = 0; i < h.length; i += 2) {
        const byte = parseInt(h.slice(i, i + 2), 16);
        if (Number.isNaN(byte)) throw new Error('hexToBytes: invalid hex');
        out.push(byte);
    }
    return out;
}

function bytesToHex(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        out += (bytes[i] & 0xff).toString(16).padStart(2, '0');
    }
    return out;
}

function utf8ToBytes(str) {
    return Array.from(new TextEncoder().encode(String(str)));
}

module.exports = { hexToBytes, bytesToHex, utf8ToBytes };
