'use strict';

// Tiny environment-agnostic assertion shim (no node:assert). Throws on failure.
// makeAssert() returns a fresh assert object that also counts successful checks.

function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === 'object') {
        const ka = Object.keys(a);
        const kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (const k of ka) {
            if (!deepEqual(a[k], b[k])) return false;
        }
        return true;
    }
    return false;
}

function stringify(v) {
    try {
        return JSON.stringify(v);
    } catch (e) {
        return String(v);
    }
}

function makeAssert() {
    const self = {
        count: 0,
        ok(value, message) {
            if (!value) throw new Error(message || `expected truthy, got ${stringify(value)}`);
            self.count++;
        },
        equal(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || `expected ${stringify(expected)}, got ${stringify(actual)}`);
            }
            self.count++;
        },
        notEqual(actual, expected, message) {
            if (actual === expected) {
                throw new Error(message || `expected value !== ${stringify(expected)}`);
            }
            self.count++;
        },
        deepEqual(actual, expected, message) {
            if (!deepEqual(actual, expected)) {
                throw new Error(message || `deepEqual failed: ${stringify(actual)} vs ${stringify(expected)}`);
            }
            self.count++;
        },
        notDeepEqual(actual, expected, message) {
            if (deepEqual(actual, expected)) {
                throw new Error(message || `notDeepEqual failed: values are deeply equal`);
            }
            self.count++;
        },
        throws(fn, message) {
            let threw = false;
            try {
                fn();
            } catch (e) {
                threw = true;
            }
            if (!threw) throw new Error(message || 'expected function to throw');
            self.count++;
        },
    };
    return self;
}

module.exports = makeAssert;
