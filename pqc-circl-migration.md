# Plan: newWallet() CIRCL Migration and Optional keyType

## 1. Reference

- **WASM source:** `C:\github\circl\sign\wasm\wasm.go`
- **SDK file:** `index.js`
- The WASM functions from that file are already available in `index.js` (global `circl` after WASM load).

## 2. Goal

- Move away from PQC for **newWallet()** key generation and use CIRCL library methods.
- Change **newWallet()** to accept an optional **keyType** number and branch key generation accordingly.
- Move **openWalletFromSeedWords** seed expansion and key derivation from PQC to CIRCL, branching on seed word list length using the constants in section 4. After **getSeedArrayFromWordList**, the resultant **seedArray** length is validated using the base-seed constants in section 4. Do not hardcode these numeric values; use the declared constants.
- Move **newWalletSeed** to CIRCL: accept optional **keyType** (null, 3, or 5 only; null → use 3). Use **circl.cryptoRandom** instead of PQC for random base seed. Support only **hybrid** (3) and **hybrid5** (5); **skip hybrideds** in newWalletSeed. Use constants from section 4; do not hardcode.
- Do not change return parameters or any other APIs.

## 3. CIRCL WASM API (from wasm.go)

- **circl.hybridedmldsaslhdsa** — Ed25519 + ML-DSA-44 + SLH-DSA-SHAKE-256f  
  - `generateKey()`, `expandSeed(baseSeed)`, `newKeyFromSeed(seed)` → `{ result, error }`
  - `sign(privateKey, message)`, `verify(publicKey, message, signature)` → `{ result, error }` (message must be 32 bytes; see `CryptoMsgLength`)
  - `signCompact(privateKey, message)`, `verifyCompact(publicKey, message, signature)` → same shape (compact signature; used by signRawTransaction when context 0 or when key type 3 and context null)
  - `PrivateKeySize` (4064), `PublicKeySize` (1408), `SigLength`, `CompactSigLength`, `CryptoMsgLength` (32)
- **circl.hybridedmldsaslhdsa5** (registered in Go as **circl.hybridedmldsaslhds5**) — Ed25519 + ML-DSA-87 + SLH-DSA-SHAKE-256s  
  - `generateKey()`, `expandSeed(baseSeed)`, `newKeyFromSeed(seed)` → same shape
  - `sign(privateKey, message)`, `verify(publicKey, message, signature)` → `{ result, error }` (message must be 32 bytes)
  - `PrivateKeySize` (7680), `PublicKeySize` (2688), `SigLength`, `CryptoMsgLength` (32)
- **circl.hybrideds** — Ed25519 + ML-DSA-44 + SLH-DSA-SHAKE-256f (different key layout/seed expander)  
  - `generateKey()`, `expandSeed(baseSeed)`, `newKeyFromSeed(seed)` → same shape
  - `sign(privateKey, message)`, `verify(publicKey, message, signature)` → same shape
  - `signCompact(privateKey, message)`, `verifyCompact(publicKey, message, signature)` → same shape (compact signature; used by signSendCoinTransaction, signTransaction, and sendCoins)

All functions return `{ result, error }`; caller must check `error` before using `result`. Keys and seeds are `Uint8Array`. Replace PQC `cryptoExpandSeed` with the appropriate `circl.*.expandSeed`, and `cryptoNewKeyPairFromSeed` with the appropriate `circl.*.newKeyFromSeed`. For signing/verification, use `circl.hybridedmldsaslhdsa.sign`/`.verify` or `circl.hybridedmldsaslhds5.sign`/`.verify` (JS namespace for hybrid5 may be **hybridedmldsaslhds5** or **hybridedmldsaslhds5** per runtime; see section 7).

## 4. Constants (no magic numbers)

Declare the following constants and use them instead of hardcoding numeric literals for seed word list length, base seed (seedArray) length, and key type.

| Constant | Value | Use |
|----------|-------|-----|
| `KEY_TYPE_HYBRID` | 3 | keyType for hybridedmldsaslhdsa (Ed25519 + ML-DSA-44 + SLH-DSA-SHAKE-256f) |
| `KEY_TYPE_HYBRID5` | 5 | keyType for hybridedmldsaslhdsa5 (Ed25519 + ML-DSA-87 + SLH-DSA-SHAKE-256s) |
| `SEED_WORD_LIST_LENGTH_HYBRIDEDS` | 48 | `seedWordList.length` for hybrideds branch |
| `SEED_WORD_LIST_LENGTH_HYBRID5` | 36 | `seedWordList.length` for hybridedmldsaslhdsa5 branch |
| `SEED_WORD_LIST_LENGTH_HYBRID` | 32 | `seedWordList.length` for hybridedmldsaslhdsa branch |
| `BASE_SEED_BYTES_HYBRIDEDS` | 96 | Expected `seedArray.length` after getSeedArrayFromWordList (hybrideds) |
| `BASE_SEED_BYTES_HYBRID5` | 72 | Expected `seedArray.length` after getSeedArrayFromWordList (hybrid5) |
| `BASE_SEED_BYTES_HYBRID` | 64 | Expected `seedArray.length` after getSeedArrayFromWordList (hybrid) |

Implementation must reference these constants (e.g. when branching on keyType, seed word list length, or validating seedArray.length). Use `KEY_TYPE_HYBRID` and `KEY_TYPE_HYBRID5` wherever the spec refers to key type 3 or 5; do not use the raw numbers 3 or 5 in logic. Do not use the raw numbers 48, 36, 32, 96, 72, 64 in logic.

## 4a. Internal function: getKeyTypeFromPrivateKey()

**Purpose:** Determine the key scheme (hybrid vs hybrid5) from a wallet’s private key so callers can use the correct CIRCL namespace for sign/verify.

### 4a.1 Signature

- **Name:** `getKeyTypeFromPrivateKey` (internal; not exported).
- **Parameter:** `privateKey` — byte array (e.g. `number[]` or `Uint8Array`) from a Wallet.
- **Returns:** `KEY_TYPE_HYBRID` (3) or `KEY_TYPE_HYBRID5` (5) on success; on failure a single, well-defined error value (e.g. `null` or `-1001`).

### 4a.2 Logic

- If `privateKey` is null/undefined or not a byte array (e.g. no `.length` or not indexable), return the chosen error value.
- Let `len = privateKey.length` (or equivalent for Uint8Array).
- If `len === circl.hybridedmldsaslhdsa.PrivateKeySize` → return `KEY_TYPE_HYBRID`.
- If `len === circl.hybridedmldsaslhdsa5.PrivateKeySize` (or `circl.hybridedmldsaslhds5.PrivateKeySize`, per the actual JS namespace exposed by the WASM) → return `KEY_TYPE_HYBRID5`.
- Otherwise → return the chosen error value (unknown key type / invalid length).

Implementation must use the CIRCL namespace’s `PrivateKeySize` constants for comparison; do not hardcode 4064 or 7680.

### 4a.3 Implementation checklist

| # | Action |
|---|--------|
| 1 | Implement internal `getKeyTypeFromPrivateKey(privateKey)`. |
| 2 | Compare `privateKey.length` to `circl.hybridedmldsaslhdsa.PrivateKeySize`; if equal, return `KEY_TYPE_HYBRID`. |
| 3 | Compare to `circl.hybridedmldsaslhdsa5.PrivateKeySize` or `circl.hybridedmldsaslhds5.PrivateKeySize`; if equal, return `KEY_TYPE_HYBRID5`. |
| 4 | Otherwise return error (e.g. `null` or `-1001`). |

## 5. Current newWallet() Behavior (to preserve)

- **Signature:** `function newWallet()`
- **Returns:** `-1000` if not initialized; otherwise a `Wallet` instance.
- **Logic:** `keyPair = pqc.cryptoNewKeyPair()`, then `address = PublicKeyToAddress(keyPair.getPublicKey())`, `new Wallet(address, keyPair.getPrivateKey(), keyPair.getPublicKey())`.
- **Return type:** number (error) or Wallet (success). No change to return type or Wallet shape.

## 6. Specification of Changes (newWallet only)

### 6.1 Signature

- **New:** `function newWallet(keyType)`
- **keyType:** optional number. Allowed: `null`, `undefined`, or `KEY_TYPE_HYBRID` (3), or `KEY_TYPE_HYBRID5` (5) only. If null/undefined, `KEY_TYPE_HYBRID` is the default.

### 6.2 Initialization Check

- Unchanged: if `isInitialized === false` → `return -1000`.

### 6.3 keyType Handling

| keyType value | Action |
|---------------|--------|
| `null`, `undefined`, or `KEY_TYPE_HYBRID` (3) | Create wallet using `circl.hybridedmldsaslhdsa.generateKey()`. (null/undefined default to `KEY_TYPE_HYBRID`.) |
| `KEY_TYPE_HYBRID5` (5) | Create wallet using `circl.hybridedmldsaslhdsa5.generateKey()` (or `circl.hybridedmldsaslhds5.generateKey()` if that is the actual name exposed by the WASM). |
| Any other value (e.g. 0, 4, 6, negative, non-integer) | Return a single, well-defined error code (e.g. `-1001` for invalid key type). |

### 6.4 CIRCL Call and Error Handling

- Invoke the chosen `generateKey()` with no arguments.
- If `res.error` is set: return an error code (e.g. `-1002` for crypto failure), not a Wallet.
- If `res.result` is missing or lacks `publicKey` or `privateKey`: return the same error code.

### 6.5 Build Wallet (unchanged semantics)

- Use `res.result.publicKey` and `res.result.privateKey` (WASM returns `Uint8Array`).
- If downstream code (e.g. `PublicKeyToAddress`, Wallet, signing) expects `number[]`, convert via e.g. `Array.from(res.result.publicKey)` (and similarly for private key); otherwise pass through.
- `address = PublicKeyToAddress(publicKey)`.
- `return new Wallet(address, privateKey, publicKey)`.
- Do not change the Wallet constructor, its fields, or that a Wallet is returned on success.

### 6.6 Other Functions

- Do **not** change return type (number for errors, Wallet on success), Wallet structure (address, privateKey, publicKey), or signatures of public APIs.
- **openWalletFromSeedWords** is in scope for CIRCL migration as specified in section 9; do not change its return parameters or contract.
- **newWalletSeed** is in scope for CIRCL migration as specified in section 10; do not change its return parameters or contract.
- **verifyWallet** is in scope for CIRCL migration as specified in section 11; replace internal use of `pqc.cryptoSign`/`pqc.cryptoVerify` with CIRCL sign/verify per key type; do not change its return parameters or contract.
- **signSendCoinTransaction** is in scope for CIRCL migration as specified in section 12; replace internal use of `pqc.cryptoSign`/`pqc.cryptoVerify` with the CIRCL WASM **hybrideds** scheme (`circl.hybrideds.signCompact` and `circl.hybrideds.verifyCompact`); do not change the function’s return parameters or contract.
- **signTransaction** is in scope for CIRCL migration as specified in section 13; replace internal use of `pqc.cryptoSign`/`pqc.cryptoVerify` with the CIRCL WASM **hybrideds** scheme (`circl.hybrideds.signCompact` and `circl.hybrideds.verifyCompact`); do not change the function’s return parameters or contract.
- **sendCoins** is in scope for CIRCL migration as specified in section 15; replace internal use of `pqc.cryptoSign`/`pqc.cryptoVerify` with the CIRCL WASM **hybrideds** scheme (`circl.hybrideds.signCompact` and `circl.hybrideds.verifyCompact`); do not change the function’s return parameters or contract.
- **signRawTransaction** is in scope for CIRCL migration as specified in section 14; replace internal use of `pqc.cryptoSign`/`pqc.cryptoVerify` with CIRCL WASM schemes chosen by **signingContext** (and by **getKeyTypeFromPrivateKey** when signingContext is null); do not change the function’s return parameters or contract.
- Add **signRawTransaction tests** as specified in section 14.8: test every allowed **signingContext** / **signingScheme** value (null, 0, 1, 2), creating the appropriate wallet per case via **newWallet(keyType)**.
- Add **tests for newWallet, newWalletSeed, openWalletFromSeedWords** as specified in section 17: use keyTypes 3 and 5 for newWallet and newWalletSeed; use legacy hardcoded 48-word seed words (e.g. from example.js line 385) to test openWalletFromSeedWords for the 48-word / 96-byte (hybrideds) branch.
- Add **tests for other functions impacted by the PQC→CIRCL migration** as specified in section 18: verifyWallet, signSendCoinTransaction, signTransaction, sendCoins (when feasible), and serializeWallet/deserializeWallet (and encrypted variants) with CIRCL-created wallets.
- After all of the above migrations are complete, **remove the PQC dependency** as specified in section 16 (no remaining references to `pqc`, no PQC load/init, no package dependency on the PQC library).

## 7. Namespace Note for keyType 5

- In `wasm.go`, the hybrid5 namespace is registered as **hybridedmldsaslhds5** (no 'a' before 5).
- In JS use **circl.hybridedmldsaslhds5.generateKey()** unless the runtime explicitly exposes **circl.hybridedmldsaslhdsa5**; if so, use that name.

## 8. Implementation Checklist (newWallet)

| # | Action |
|---|--------|
| 1 | Add optional parameter `keyType` to `newWallet()`. |
| 2 | If `!isInitialized` → return `-1000`. |
| 3 | If `keyType` is null/undefined or `KEY_TYPE_HYBRID` → call `circl.hybridedmldsaslhdsa.generateKey()`. (null/undefined default to `KEY_TYPE_HYBRID`.) |
| 4 | If `keyType === KEY_TYPE_HYBRID5` → call `circl.hybridedmldsaslhdsa5` / `circl.hybridedmldsaslhds5.generateKey()`. |
| 5 | Any other `keyType` (e.g. 4) → return chosen error code (e.g. `-1001`). |
| 6 | If `generateKey()` returns `.error` or invalid `.result` → return chosen error code (e.g. `-1002`). |
| 7 | From `result.publicKey` / `result.privateKey` build address and `new Wallet(...)`; return that Wallet. |
| 8 | Ensure Wallet receives (address, privateKey, publicKey) in the form the rest of the code expects (convert Uint8Array → array only if needed). |

## 9. Specification of Changes (openWalletFromSeedWords)

Replace PQC seed expansion and key derivation with CIRCL based on **seedWordList.length** using the constants in section 4. After calling **getSeedArrayFromWordList**, validate **seedArray.length** using the base-seed constants in section 4 and use the matching CIRCL scheme (do not change return parameters or contract of openWalletFromSeedWords). Do not hardcode numeric literals; use the declared constants.

| seedWordList.length (constant) | seedArray.length (constant, after getSeedArrayFromWordList) | expandSeed | newKeyFromSeed |
|-------------------------------|-------------------------------------------------------------|------------|----------------|
| `SEED_WORD_LIST_LENGTH_HYBRIDEDS` (48) | `BASE_SEED_BYTES_HYBRIDEDS` (96) | Use `circl.hybrideds.expandSeed` instead of `cryptoExpandSeed`. | Use `circl.hybrideds.newKeyFromSeed` instead of `cryptoNewKeyPairFromSeed`. |
| `SEED_WORD_LIST_LENGTH_HYBRID5` (36) | `BASE_SEED_BYTES_HYBRID5` (72) | Use `circl.hybridedmldsaslhdsa5.expandSeed` instead of `cryptoExpandSeed`. | Use `circl.hybridedmldsaslhdsa5.newKeyFromSeed` instead of `cryptoNewKeyPairFromSeed`. |
| `SEED_WORD_LIST_LENGTH_HYBRID` (32) | `BASE_SEED_BYTES_HYBRID` (64) | Use `circl.hybridedmldsaslhdsa.expandSeed` instead of `cryptoExpandSeed`. | Use `circl.hybridedmldsaslhdsa.newKeyFromSeed` instead of `cryptoNewKeyPairFromSeed`. |

- Branch on **seedWordList.length** using `SEED_WORD_LIST_LENGTH_HYBRIDEDS`, `SEED_WORD_LIST_LENGTH_HYBRID5`, and `SEED_WORD_LIST_LENGTH_HYBRID`. After **getSeedArrayFromWordList**, validate **seedArray.length** against `BASE_SEED_BYTES_HYBRIDEDS`, `BASE_SEED_BYTES_HYBRID5`, or `BASE_SEED_BYTES_HYBRID` respectively for each branch before using the corresponding CIRCL expandSeed/newKeyFromSeed.
- For each branch: call the chosen `expandSeed(baseSeed)` with the appropriate base seed bytes; check `.error`; then call the chosen `newKeyFromSeed(expandedSeed)` with the expanded seed; check `.error`; then build the wallet from `result.publicKey` and `result.privateKey` as today (e.g. `PublicKeyToAddress`, `new Wallet(...)`).
- If `seedWordList.length` does not equal any of the three seed-word-list constants, retain existing behavior (or define an explicit error path per product requirements). If `seedArray.length` does not match the expected base-seed constant for the chosen branch, treat as error (or per product requirements).
- Do not change return parameters or any other APIs.

## 10. Specification of Changes (newWalletSeed)

Replace PQC random seed generation with CIRCL. **keyType** determines which scheme (and thus base seed length and word count). **Hybrideds is not supported** in newWalletSeed; only **hybrid** and **hybrid5** are used. Do not change return parameters or contract (array of seed words, or null / -1000).

### 10.1 keyType

- **Allowed values:** `null`, `KEY_TYPE_HYBRID` (3), or `KEY_TYPE_HYBRID5` (5) only.
- **If `keyType === null` or `keyType === undefined`:** treat as `KEY_TYPE_HYBRID` (hybrid).
- **Any other value:** return `null` (or a single error code, e.g. `-1001` for invalid key type).

### 10.2 Scheme mapping (no hybrideds)

| keyType | Scheme | Base seed length (constant) | Word list length (constant) |
|---------|--------|-----------------------------|-----------------------------|
| null (→ KEY_TYPE_HYBRID) | hybrid (hybridedmldsaslhdsa) | `BASE_SEED_BYTES_HYBRID` (64) | `SEED_WORD_LIST_LENGTH_HYBRID` (32) |
| KEY_TYPE_HYBRID (3) | hybrid | `BASE_SEED_BYTES_HYBRID` (64) | `SEED_WORD_LIST_LENGTH_HYBRID` (32) |
| KEY_TYPE_HYBRID5 (5) | hybrid5 (hybridedmldsaslhdsa5) | `BASE_SEED_BYTES_HYBRID5` (72) | `SEED_WORD_LIST_LENGTH_HYBRID5` (36) |

Use only these constants; do not reference hybrideds constants in newWalletSeed.

### 10.3 Random bytes (CIRCL)

- Replace **pqc.cryptoNewSeed()** with **circl.cryptoRandom(size)**.
- **size** = `BASE_SEED_BYTES_HYBRID` for `KEY_TYPE_HYBRID`; `BASE_SEED_BYTES_HYBRID5` for `KEY_TYPE_HYBRID5`.
- Check **res.error**; on error return **null** (or chosen error code, e.g. `-1002`).
- Validate **res.result.length** equals the chosen base-seed constant; on mismatch return **null**.

### 10.4 Word list and return

- Convert bytes to words with **seedwords.getWordListFromSeedArray(res.result)**.
- Validate **wordList.length** equals `SEED_WORD_LIST_LENGTH_HYBRID` (32) or `SEED_WORD_LIST_LENGTH_HYBRID5` (36) as appropriate; on failure return **null**.
- **Return:** success → array of seed words (32 or 36 words); not initialized → **-1000**; invalid keyType or crypto/validation failure → **null** (or chosen error codes). Do not change return type or contract.

### 10.5 Implementation flow

1. If `!isInitialized` → return `-1000`.
2. If `keyType === null` or `keyType === undefined` → set `keyType = KEY_TYPE_HYBRID`.
3. If `keyType !== KEY_TYPE_HYBRID && keyType !== KEY_TYPE_HYBRID5` → return `null` (or `-1001`).
4. Set `baseSeedLen` = (keyType === KEY_TYPE_HYBRID5) ? `BASE_SEED_BYTES_HYBRID5` : `BASE_SEED_BYTES_HYBRID`; `expectedWordLen` = (keyType === KEY_TYPE_HYBRID5) ? `SEED_WORD_LIST_LENGTH_HYBRID5` : `SEED_WORD_LIST_LENGTH_HYBRID`.
5. `res = circl.cryptoRandom(baseSeedLen)`; if `res.error` or `res.result.length !== baseSeedLen` → return `null`.
6. `wordList = seedwords.getWordListFromSeedArray(res.result)`; if invalid or `wordList.length !== expectedWordLen` → return `null`.
7. Return `wordList`.

### 10.6 Implementation Checklist (newWalletSeed)

| # | Action |
|---|--------|
| 1 | Add optional parameter `keyType` to `newWalletSeed()`. |
| 2 | If `!isInitialized` → return `-1000`. |
| 3 | If `keyType` is null/undefined → set keyType to `KEY_TYPE_HYBRID`. |
| 4 | If keyType is not `KEY_TYPE_HYBRID` or `KEY_TYPE_HYBRID5` → return `null` (or `-1001`). |
| 5 | Use `circl.cryptoRandom(BASE_SEED_BYTES_HYBRID)` for `KEY_TYPE_HYBRID`, `circl.cryptoRandom(BASE_SEED_BYTES_HYBRID5)` for `KEY_TYPE_HYBRID5`. |
| 6 | On `res.error` or wrong length → return `null`. |
| 7 | Convert to words; validate length with `SEED_WORD_LIST_LENGTH_HYBRID` or `SEED_WORD_LIST_LENGTH_HYBRID5`; return word list or `null`. |

## 11. Specification of Changes (verifyWallet)

Replace PQC signing and verification inside **verifyWallet()** with CIRCL, using the internal **getKeyTypeFromPrivateKey()** to choose the correct scheme. Do not change the public signature or return contract of verifyWallet (still returns boolean or `-1000` when not initialized).

### 11.1 Current behavior (reference)

- **verifyWallet(wallet)** returns `-1000` if not initialized; else validates wallet shape, address, and key lengths, then uses `pqc.cryptoSign(message, wallet.privateKey)` and `pqc.cryptoVerify(message, quantumSig, wallet.publicKey)` with a fixed 32-byte message. Returns the boolean result of verification.

### 11.2 Key type and CIRCL replacement

- At the point where the current code would call `pqc.cryptoSign` and `pqc.cryptoVerify`:
  1. Call **getKeyTypeFromPrivateKey(wallet.privateKey)**.
  2. If it returns an error (e.g. `null` or `-1001`) → return `false`.
  3. If it returns `KEY_TYPE_HYBRID`:  
     - Sign: `sigRes = circl.hybridedmldsaslhdsa.sign(wallet.privateKey, message)`.  
     - If `sigRes.error` is set → return `false`.  
     - Verify: `verRes = circl.hybridedmldsaslhdsa.verify(wallet.publicKey, message, sigRes.result)`.  
     - If `verRes.error` is set → return `false`. Return `verRes.result` (boolean).
  4. If it returns `KEY_TYPE_HYBRID5`:  
     - Sign: `sigRes = circl.hybridedmldsaslhdsa5.sign(wallet.privateKey, message)` (or `circl.hybridedmldsaslhds5.sign` per actual WASM namespace).  
     - If `sigRes.error` is set → return `false`.  
     - Verify: `verRes = circl.hybridedmldsaslhdsa5.verify(wallet.publicKey, message, sigRes.result)` (or `circl.hybridedmldsaslhds5.verify`).  
     - If `verRes.error` is set → return `false`. Return `verRes.result` (boolean).

### 11.3 CIRCL sign/verify API (from wasm.go)

- **hybrid (key type KEY_TYPE_HYBRID):**  
  - `circl.hybridedmldsaslhdsa.sign(privateKey, message)` → `{ result: Uint8Array, error }`.  
  - `circl.hybridedmldsaslhdsa.verify(publicKey, message, signature)` → `{ result: boolean, error }`.  
  - Message must be exactly 32 bytes (`CryptoMsgLength`); the existing verify message is already 32 bytes.
- **hybrid5 (key type KEY_TYPE_HYBRID5):**  
  - `circl.hybridedmldsaslhdsa5.sign(privateKey, message)` / `circl.hybridedmldsaslhds5.sign(...)` → `{ result: Uint8Array, error }`.  
  - `circl.hybridedmldsaslhdsa5.verify(publicKey, message, signature)` / `circl.hybridedmldsaslhds5.verify(...)` → `{ result: boolean, error }`.  
  - Message must be exactly 32 bytes.

Keys and message must be passed in the form the CIRCL WASM expects (e.g. `Uint8Array`); convert from `number[]` if the wallet stores keys as arrays.

### 11.4 Key and length validation

- Remove or relax the current hardcoded checks `wallet.privateKey.length !== 4064` and `wallet.publicKey.length !== 1408`, so that both hybrid and hybrid5 wallets are accepted. Validation of private key length is effectively done by **getKeyTypeFromPrivateKey** (which compares to `circl.hybridedmldsaslhdsa.PrivateKeySize` and `circl.hybridedmldsaslhdsa5.PrivateKeySize`). Optionally validate `wallet.publicKey.length` against the scheme’s `PublicKeySize` (1408 for hybrid, 2688 for hybrid5) after resolving key type; if length does not match, return `false`.

### 11.5 Implementation checklist (verifyWallet)

| # | Action |
|---|--------|
| 1 | Implement or reuse **getKeyTypeFromPrivateKey(wallet.privateKey)**; in verifyWallet, call it before signing. |
| 2 | If getKeyTypeFromPrivateKey returns an error → return `false`. |
| 3 | If key type is `KEY_TYPE_HYBRID`: use `circl.hybridedmldsaslhdsa.sign(privateKey, message)` and `circl.hybridedmldsaslhdsa.verify(publicKey, message, sig)`; check `.error` on each; return `verRes.result` or `false`. |
| 4 | If key type is `KEY_TYPE_HYBRID5`: use `circl.hybridedmldsaslhds5` (or hybridedmldsaslhdsa5).sign/verify with same pattern. |
| 5 | Ensure the verify message remains 32 bytes. Convert wallet keys to Uint8Array if required by CIRCL. |
| 6 | Replace or remove hardcoded 4064/1408 length checks so hybrid5 keys (private 7680, public 2688) are accepted; optionally validate public key length per scheme after key type is known. |

## 12. Specification of Changes (signSendCoinTransaction)

Replace PQC signing and verification inside **signSendCoinTransaction** with the CIRCL WASM **hybrideds** scheme using **signCompact** and **verifyCompact**. Do not change the function’s public signature, return type (`SignResult` promise), or contract.

### 12.1 Requirement

- Where the current code calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)` and `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)`, use instead:
  - **Sign:** `circl.hybrideds.signCompact(wallet.privateKey, message)` → `{ result, error }`.
  - **Verify:** `circl.hybrideds.verifyCompact(wallet.publicKey, message, signature)` → `{ result, error }`.
- Pass keys and message in the form CIRCL expects (e.g. `Uint8Array`); convert from `number[]` if the wallet stores keys as arrays.
- On `signCompact` or `verifyCompact` returning `.error`, treat as signing/verification failure and return the same `SignResult` error code used today for that case (e.g. `-507`).

### 12.2 CIRCL hybrideds signCompact/verifyCompact (from wasm.go)

- **circl.hybrideds.signCompact(privateKey, message)** — `privateKey` must be `hybrideds.PrivateKeySize` bytes; `message` must be exactly 32 bytes (`CryptoMsgLength`). Returns `{ result: Uint8Array, error }` (signature length `hybrideds.CompactSigLength`).
- **circl.hybrideds.verifyCompact(publicKey, message, signature)** — `publicKey` must be `hybrideds.PublicKeySize` bytes; `message` 32 bytes; `signature` must be `hybrideds.CompactSigLength` bytes. Returns `{ result: boolean, error }`.

If the transaction signing hash produced by `transactionGetSigningHash` (or equivalent) is not 32 bytes, the implementation must produce a 32-byte digest (e.g. via a single SHA-256 hash of the signing hash) before calling `circl.hybrideds.signCompact` and `circl.hybrideds.verifyCompact`, so that the CIRCL 32-byte message requirement is satisfied.

### 12.3 Implementation checklist (signSendCoinTransaction)

| # | Action |
|---|--------|
| 1 | In **signSendCoinTransaction**, at the step that currently calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)`, replace with `circl.hybrideds.signCompact(wallet.privateKey, message)`. Use a 32-byte `message`: either `txSigningHash` if it is already 32 bytes, or a 32-byte digest (e.g. SHA-256) of `txSigningHash`. |
| 2 | Replace `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)` with `circl.hybrideds.verifyCompact(wallet.publicKey, message, quantumSig)`, using the same 32-byte `message` as for sign. Check `.error`; if set, return the same failure `SignResult` as today (e.g. `-507`). |
| 3 | Convert wallet `privateKey` and `publicKey` to `Uint8Array` if required by the CIRCL API. |
| 4 | Do not change the function signature, return type, or any other behavior (validation, hash building, transaction encoding, etc.). |

## 13. Specification of Changes (signTransaction)

Replace PQC signing and verification inside **signTransaction** with the CIRCL WASM **hybrideds** scheme using **signCompact** and **verifyCompact**. Do not change the function’s public signature, return type (`SignResult` promise), or contract.

### 13.1 Requirement

- Where the current code calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)` and `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)`, use instead:
  - **Sign:** `circl.hybrideds.signCompact(wallet.privateKey, message)` → `{ result, error }`.
  - **Verify:** `circl.hybrideds.verifyCompact(wallet.publicKey, message, signature)` → `{ result, error }`.
- Pass keys and message in the form CIRCL expects (e.g. `Uint8Array`); convert from `number[]` if the wallet stores keys as arrays.
- On `signCompact` or `verifyCompact` returning `.error`, treat as signing/verification failure and return the same `SignResult` error code used today for that case (e.g. `-507`).

### 13.2 CIRCL hybrideds signCompact/verifyCompact (from wasm.go)

- Same as section 12.2: **circl.hybrideds.signCompact(privateKey, message)** and **circl.hybrideds.verifyCompact(publicKey, message, signature)**; message must be exactly 32 bytes (`CryptoMsgLength`). Signature length is `hybrideds.CompactSigLength`. If the transaction signing hash is not 32 bytes, produce a 32-byte digest (e.g. SHA-256) before calling signCompact/verifyCompact.

### 13.3 Implementation checklist (signTransaction)

| # | Action |
|---|--------|
| 1 | In **signTransaction**, at the step that currently calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)`, replace with `circl.hybrideds.signCompact(wallet.privateKey, message)`. Use a 32-byte `message`: either `txSigningHash` if it is already 32 bytes, or a 32-byte digest (e.g. SHA-256) of `txSigningHash`. |
| 2 | Replace `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)` with `circl.hybrideds.verifyCompact(wallet.publicKey, message, quantumSig)`, using the same 32-byte `message` as for sign. Check `.error`; if set, return the same failure `SignResult` as today (e.g. `-507`). |
| 3 | Convert wallet `privateKey` and `publicKey` to `Uint8Array` if required by the CIRCL API. |
| 4 | Do not change the function signature, return type, or any other behavior (validation, hash building, transaction encoding, etc.). |

## 14. Specification of Changes (signRawTransaction)

Replace PQC signing and verification inside **signRawTransaction** with CIRCL WASM, selecting the scheme and mode (compact vs full) based on **signingContext** and, when **signingContext** is null, on **getKeyTypeFromPrivateKey(wallet.privateKey)**. Do not change the function’s public signature, return type (`SignResult` promise), or contract.

### 14.1 Message and keys

- The 32-byte message rule applies: the value passed to sign/verify must be exactly 32 bytes. If the transaction signing hash from `transactionGetSigningHash2` (or equivalent) is not 32 bytes, produce a 32-byte digest (e.g. SHA-256) before calling any CIRCL sign/verify. Pass keys as CIRCL expects (e.g. `Uint8Array`); convert from `number[]` if needed. On any CIRCL `.error`, treat as signing/verification failure and return the same `SignResult` error code used today (e.g. `-507`).

### 14.2 When signingContext is null

- Call **getKeyTypeFromPrivateKey(transactionSigningRequest.wallet.privateKey)**.
- If it returns an error (e.g. `null` or `-1001`) → treat as failure and return the appropriate `SignResult` error.
- If it returns **KEY_TYPE_HYBRID** (3): use **circl.hybridedmldsaslhdsa.signCompact** and **circl.hybridedmldsaslhdsa.verifyCompact**.
- If it returns **KEY_TYPE_HYBRID5** (5): use **circl.hybridedmldsaslhdsa5.sign** and **circl.hybridedmldsaslhdsa5.verify** (or **circl.hybridedmldsaslhds5.sign** / **circl.hybridedmldsaslhds5.verify** per actual WASM namespace). Note: hybrid5 has no compact mode; use full sign/verify only.

### 14.3 When signingContext is 0

- Use **circl.hybridedmldsaslhdsa.signCompact** and **circl.hybridedmldsaslhdsa.verifyCompact**.

### 14.4 When signingContext is 1

- Use **circl.hybridedmldsaslhdsa5.sign** and **circl.hybridedmldsaslhdsa5.verify** (or **circl.hybridedmldsaslhds5.sign** / **circl.hybridedmldsaslhds5.verify**).

### 14.5 When signingContext is 2

- Use **circl.hybridedmldsaslhdsa.sign** and **circl.hybridedmldsaslhdsa.verify** (full signature, not compact).

### 14.6 Summary table

| signingContext | Scheme / mode | Sign | Verify |
|----------------|---------------|------|--------|
| `null` | key type from **getKeyTypeFromPrivateKey**: 3 → compact hybrid, 5 → full hybrid5 | key type 3: `circl.hybridedmldsaslhdsa.signCompact`; key type 5: `circl.hybridedmldsaslhdsa5.sign` (or hybridedmldsaslhds5) | key type 3: `circl.hybridedmldsaslhdsa.verifyCompact`; key type 5: `circl.hybridedmldsaslhdsa5.verify` (or hybridedmldsaslhds5) |
| `0` | hybrid compact | `circl.hybridedmldsaslhdsa.signCompact` | `circl.hybridedmldsaslhdsa.verifyCompact` |
| `1` | hybrid5 full | `circl.hybridedmldsaslhdsa5.sign` (or hybridedmldsaslhds5) | `circl.hybridedmldsaslhdsa5.verify` (or hybridedmldsaslhds5) |
| `2` | hybrid full | `circl.hybridedmldsaslhdsa.sign` | `circl.hybridedmldsaslhdsa.verify` |

### 14.7 Implementation checklist (signRawTransaction)

| # | Action |
|---|--------|
| 1 | At the step that currently calls `pqc.cryptoSign`/`pqc.cryptoVerify`, read **signingContext** from the transaction signing request (e.g. `transactionSigningRequest.signingContext` or equivalent). |
| 2 | If signingContext is **null** or **undefined**: call **getKeyTypeFromPrivateKey(wallet.privateKey)**; if error, return failure `SignResult`; if `KEY_TYPE_HYBRID` use hybridedmldsaslhdsa signCompact/verifyCompact; if `KEY_TYPE_HYBRID5` use hybridedmldsaslhdsa5 (or hybridedmldsaslhds5) sign/verify. |
| 3 | If signingContext is **0**: use `circl.hybridedmldsaslhdsa.signCompact` and `circl.hybridedmldsaslhdsa.verifyCompact`. |
| 4 | If signingContext is **1**: use `circl.hybridedmldsaslhdsa5.sign` and `circl.hybridedmldsaslhdsa5.verify` (or hybridedmldsaslhds5). |
| 5 | If signingContext is **2**: use `circl.hybridedmldsaslhdsa.sign` and `circl.hybridedmldsaslhdsa.verify`. |
| 6 | Ensure 32-byte message for all CIRCL calls; convert keys to Uint8Array if required. Check `.error` on each CIRCL result; on error return the same failure `SignResult` as today. Do not change function signature, return type, or other behavior. |

### 14.8 signRawTransaction tests (all allowed signingContext / signingScheme values)

Add or extend tests so that **signRawTransaction** is exercised for every allowed value of the signing context (the parameter may be named **signingContext** or **signingScheme** in the API). For each case, create a wallet with the **keyType** that is compatible with the chosen scheme, then call **signRawTransaction** and assert success (e.g. `resultCode === 0`, valid `txnHash`, valid `txnData`).

#### 14.8.1 Test matrix

| # | signingContext / signingScheme | Wallet keyType | How to create wallet | Description |
|---|-------------------------------|----------------|----------------------|-------------|
| 1 | `null` (or `undefined`) | `KEY_TYPE_HYBRID` (3) | `newWallet(KEY_TYPE_HYBRID)` or `newWallet(3)` | Dynamic: key type 3 → hybrid compact sign/verify. |
| 2 | `null` (or `undefined`) | `KEY_TYPE_HYBRID5` (5) | `newWallet(KEY_TYPE_HYBRID5)` or `newWallet(5)` | Dynamic: key type 5 → hybrid5 full sign/verify. |
| 3 | `0` | `KEY_TYPE_HYBRID` (3) | `newWallet(KEY_TYPE_HYBRID)` or `newWallet(3)` | Explicit hybrid compact; wallet must be hybrid. |
| 4 | `1` | `KEY_TYPE_HYBRID5` (5) | `newWallet(KEY_TYPE_HYBRID5)` or `newWallet(5)` | Explicit hybrid5 full; wallet must be hybrid5. |
| 5 | `2` | `KEY_TYPE_HYBRID` (3) | `newWallet(KEY_TYPE_HYBRID)` or `newWallet(3)` | Explicit hybrid full; wallet must be hybrid. |

#### 14.8.2 Test requirements

- For each row in the table above, the test must:
  1. Create a wallet using the indicated **keyType** (via **newWallet(keyType)**). Use the constants `KEY_TYPE_HYBRID` and `KEY_TYPE_HYBRID5` in implementation; do not rely on a pre-existing wallet of unknown key type.
  2. Build a **TransactionSigningRequest** with that wallet, a valid toAddress, valueInWei (e.g. `'0x0'`), nonce, data (e.g. `null`), gasLimit, remarks (e.g. `null`), chainId, and the **signingContext** / **signingScheme** value for the row (e.g. `null`, `0`, `1`, or `2`).
  3. Call **signRawTransaction(transactionSigningRequest)** (or the promise-returning variant if the API returns a promise).
  4. Assert that the call succeeds: e.g. `resultCode === 0`, and that `txnHash` and `txnData` are valid (e.g. non-null, hex string format as required).
- Optionally add negative tests: e.g. signingContext `1` with a **keyType 3** wallet (or signingContext `0` or `2` with a **keyType 5** wallet) if the implementation is specified to reject mismatched wallet/scheme combinations.
- Tests may live in the same file as existing signRawTransaction tests (e.g. `non-transactional.test.js`) or in a dedicated test file; the spec does not mandate the file name.

#### 14.8.3 Implementation checklist (signRawTransaction tests)

| # | Action |
|---|--------|
| 1 | Add a test that creates a wallet with `newWallet(KEY_TYPE_HYBRID)`, builds a TransactionSigningRequest with **signingContext** `null`, calls signRawTransaction, and asserts success. |
| 2 | Add a test that creates a wallet with `newWallet(KEY_TYPE_HYBRID5)`, builds a TransactionSigningRequest with **signingContext** `null`, calls signRawTransaction, and asserts success. |
| 3 | Add a test that creates a wallet with `newWallet(KEY_TYPE_HYBRID)` and **signingContext** `0`; call signRawTransaction and assert success. |
| 4 | Add a test that creates a wallet with `newWallet(KEY_TYPE_HYBRID5)` and **signingContext** `1`; call signRawTransaction and assert success. |
| 5 | Add a test that creates a wallet with `newWallet(KEY_TYPE_HYBRID)` and **signingContext** `2`; call signRawTransaction and assert success. |
| 6 | Ensure SDK is initialized (and CIRCL WASM loaded) before running these tests, e.g. via the same setup as other transaction tests. |

## 15. Specification of Changes (sendCoins)

Replace PQC signing and verification inside **sendCoins** with the CIRCL WASM **hybrideds** scheme using **signCompact** and **verifyCompact**. Do not change the function’s public signature, return type (`Promise<SendResult>`), or contract.

### 15.1 Requirement

- Where the current code calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)` and `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)`, use instead:
  - **Sign:** `circl.hybrideds.signCompact(wallet.privateKey, message)` → `{ result, error }`.
  - **Verify:** `circl.hybrideds.verifyCompact(wallet.publicKey, message, signature)` → `{ result, error }`.
- Pass keys and message in the form CIRCL expects (e.g. `Uint8Array`); convert from `number[]` if the wallet stores keys as arrays.
- On `signCompact` or `verifyCompact` returning `.error`, treat as signing/verification failure and return the same `SendResult` error code used today for that case (e.g. `-10`).

### 15.2 CIRCL hybrideds signCompact/verifyCompact (from wasm.go)

- Same as section 12.2: **circl.hybrideds.signCompact(privateKey, message)** and **circl.hybrideds.verifyCompact(publicKey, message, signature)**; message must be exactly 32 bytes (`CryptoMsgLength`). Signature length is `hybrideds.CompactSigLength`. If the transaction signing hash from `transactionGetSigningHash` is not 32 bytes, produce a 32-byte digest (e.g. SHA-256) before calling signCompact/verifyCompact.

### 15.3 Implementation checklist (sendCoins)

| # | Action |
|---|--------|
| 1 | In **sendCoins**, at the step that currently calls `pqc.cryptoSign(txSigningHash, wallet.privateKey)`, replace with `circl.hybrideds.signCompact(wallet.privateKey, message)`. Use a 32-byte `message`: either `txSigningHash` if it is already 32 bytes, or a 32-byte digest (e.g. SHA-256) of `txSigningHash`. |
| 2 | Replace `pqc.cryptoVerify(txSigningHash, quantumSig, wallet.publicKey)` with `circl.hybrideds.verifyCompact(wallet.publicKey, message, quantumSig)`, using the same 32-byte `message` as for sign. Check `.error`; if set, return the same failure `SendResult` as today (e.g. `-10`). |
| 3 | Convert wallet `privateKey` and `publicKey` to `Uint8Array` if required by the CIRCL API. |
| 4 | Do not change the function signature, return type, or any other behavior (validation, hash building, transaction encoding, postTransaction call, etc.). |

## 16. Remove PQC dependency (final step)

**When to do this:** Only after all CIRCL migrations in sections 6, 8, 9, 10, 11, 12, 13, 14, and 15 are complete and verified. The SDK must no longer call any PQC APIs for key generation, seed expansion, signing, or verification.

### 16.1 Requirement

- Remove all use of the PQC library from the SDK so that the **pqc** dependency is no longer required.
- No code path in the SDK may reference `pqc` (e.g. `pqc.cryptoSign`, `pqc.cryptoVerify`, `pqc.cryptoNewKeyPair`, `pqc.cryptoExpandSeed`, `pqc.cryptoNewKeyPairFromSeed`, `pqc.cryptoNewSeed`, or any other PQC API).
- Remove or replace PQC load/initialization (e.g. WASM or script load of the PQC module) so that the SDK does not load the PQC library at runtime.
- Remove the PQC package or script dependency from the project (e.g. from `package.json`, build scripts, or HTML script tags, as applicable). The SDK’s only post-quantum/hybrid crypto dependency for the migrated behavior shall be the CIRCL WASM (and any runtime needed to load it).

### 16.2 Implementation checklist (remove PQC)

| # | Action |
|---|--------|
| 1 | Confirm no remaining references to `pqc` in the codebase (search for `pqc.` and any PQC module name used for load/init). |
| 2 | Remove or stub out PQC initialization/load code (e.g. where the PQC WASM or script is loaded and assigned to `pqc` or equivalent). Ensure `initialize()` or equivalent still loads and exposes the CIRCL WASM as required. |
| 3 | Remove the PQC dependency from package.json (or equivalent) and from any build/bundle configuration or documentation that lists it. |
| 4 | Run the full test suite and any integration checks to ensure all behavior previously relying on PQC now uses CIRCL and that no code path still invokes PQC. |

## 17. Tests for newWallet, newWalletSeed, openWalletFromSeedWords

Add or extend tests so that **newWallet**, **newWalletSeed**, and **openWalletFromSeedWords** are exercised with **keyTypes 3 and 5**, and so that **openWalletFromSeedWords** is tested with the legacy 48-word (hybrideds) seed-word list. Use the constants `KEY_TYPE_HYBRID` and `KEY_TYPE_HYBRID5` in test code where appropriate.

### 17.1 newWallet tests (keyTypes 3 and 5)

- **keyType KEY_TYPE_HYBRID (3):** Create a wallet with `newWallet(KEY_TYPE_HYBRID)` or `newWallet(3)`. Assert the call returns a valid Wallet (non-null, has `address`, `privateKey`, `publicKey`). Assert `verifyWallet(wallet)` is true. Optionally assert private key length equals `circl.hybridedmldsaslhdsa.PrivateKeySize` (4064) and public key length equals `circl.hybridedmldsaslhdsa.PublicKeySize` (1408), or use constants. Optionally roundtrip with serializeWallet/deserializeWallet and verify again.
- **keyType KEY_TYPE_HYBRID5 (5):** Create a wallet with `newWallet(KEY_TYPE_HYBRID5)` or `newWallet(5)`. Assert the call returns a valid Wallet. Assert `verifyWallet(wallet)` is true. Optionally assert private key length equals hybridedmldsaslhdsa5/hybridedmldsaslhds5 `PrivateKeySize` (7680) and public key length `PublicKeySize` (2688).
- **keyType null/undefined (default 3):** Optionally add or retain a test that calls `newWallet()` with no argument and asserts a Wallet is returned and verifyWallet succeeds (default key type is KEY_TYPE_HYBRID).

### 17.2 newWalletSeed tests (keyTypes 3 and 5)

- **keyType KEY_TYPE_HYBRID (3):** Call `newWalletSeed(KEY_TYPE_HYBRID)` or `newWalletSeed(3)`. Assert the result is a non-null array of seed words. Assert `result.length === SEED_WORD_LIST_LENGTH_HYBRID` (32). Optionally call `openWalletFromSeedWords(result)` and assert a valid Wallet is returned and `verifyWallet` succeeds.
- **keyType KEY_TYPE_HYBRID5 (5):** Call `newWalletSeed(KEY_TYPE_HYBRID5)` or `newWalletSeed(5)`. Assert the result is a non-null array of seed words. Assert `result.length === SEED_WORD_LIST_LENGTH_HYBRID5` (36). Optionally call `openWalletFromSeedWords(result)` and assert a valid Wallet is returned and `verifyWallet` succeeds.
- **keyType null/undefined (default 3):** Optionally call `newWalletSeed()` with no argument and assert result length is 32 (default KEY_TYPE_HYBRID).

Use the constants `SEED_WORD_LIST_LENGTH_HYBRID` and `SEED_WORD_LIST_LENGTH_HYBRID5` (or the numeric values 32 and 36) for length assertions; the spec prefers referencing constants where they are available in the test environment.

### 17.3 openWalletFromSeedWords tests (legacy 48-word / 96-byte hybrideds branch)

- Use the **legacy hardcoded 48-word seed word list** from **example.js line 385** (the same fixture as in `example/example.js` and, if present, in existing tests such as `non-transactional.test.js` as `SEED_WORD_LIST`). The string is a comma-separated list of 48 words; split it into an array and pass it to **openWalletFromSeedWords(seedWordArray)**.
- This exercises the **48-word / 96-byte base-seed branch** (hybrideds): `seedWordList.length === SEED_WORD_LIST_LENGTH_HYBRIDEDS` (48), `seedArray.length === BASE_SEED_BYTES_HYBRIDEDS` (96) after getSeedArrayFromWordList, and the implementation uses `circl.hybrideds.expandSeed` and `circl.hybrideds.newKeyFromSeed`.
- **Assert:** openWalletFromSeedWords returns a non-null Wallet; assert `verifyWallet(wallet)` is true. Assert the wallet address equals the **expected address** for this fixture: `0xc7C24aE0Db614F1638C5161e823A539a0293238366d4EaF29A63316D631e964F` (as in example.js line 393 and existing tests that use this fixture). This ensures the hybrideds branch produces the same deterministic wallet for the legacy seed.
- Tests may live in the same file as existing wallet/seed tests (e.g. `non-transactional.test.js`) or in a dedicated test file.

### 17.4 Implementation checklist (newWallet, newWalletSeed, openWalletFromSeedWords tests)

| # | Action |
|---|--------|
| 1 | Add or extend test: `newWallet(KEY_TYPE_HYBRID)` returns valid Wallet; verifyWallet succeeds; optionally assert key lengths for hybrid. |
| 2 | Add or extend test: `newWallet(KEY_TYPE_HYBRID5)` returns valid Wallet; verifyWallet succeeds; optionally assert key lengths for hybrid5. |
| 3 | Add or extend test: `newWalletSeed(KEY_TYPE_HYBRID)` returns array of length 32; optionally openWalletFromSeedWords roundtrip and verify. |
| 4 | Add or extend test: `newWalletSeed(KEY_TYPE_HYBRID5)` returns array of length 36; optionally openWalletFromSeedWords roundtrip and verify. |
| 5 | Add or extend test: openWalletFromSeedWords with legacy 48-word seed (example.js line 385 / SEED_WORD_LIST); assert Wallet returned, verifyWallet true, address equals `0xc7C24aE0Db614F1638C5161e823A539a0293238366d4EaF29A63316D631e964F`. |
| 6 | Ensure SDK is initialized (and CIRCL WASM loaded) before running these tests. |

## 18. Tests for other functions impacted by PQC→CIRCL migration

Add or extend tests for every other public function that is affected by the migration from PQC to CIRCL WASM, so that the CIRCL code paths are exercised and regressions are caught. The following functions use CIRCL for signing, verification, or key handling and should have explicit test coverage using CIRCL-created or CIRCL-compatible wallets.

### 18.1 verifyWallet tests

- **Positive (key type 3):** Create a wallet with `newWallet(KEY_TYPE_HYBRID)`. Call `verifyWallet(wallet)` and assert the result is `true`. This exercises the branch where **getKeyTypeFromPrivateKey** returns KEY_TYPE_HYBRID and CIRCL hybridedmldsaslhdsa sign/verify is used.
- **Positive (key type 5):** Create a wallet with `newWallet(KEY_TYPE_HYBRID5)`. Call `verifyWallet(wallet)` and assert the result is `true`. This exercises the hybridedmldsaslhdsa5 sign/verify path.
- **Positive (hybrideds / 48-word wallet):** Open a wallet from the legacy 48-word seed (example.js line 385 / SEED_WORD_LIST). Call `verifyWallet(wallet)` and assert `true`. This exercises verification for a wallet from the hybrideds branch (if verifyWallet supports hybrideds key lengths; otherwise document any limitation).
- **Negative:** Call `verifyWallet` with an invalid or malformed wallet (e.g. null, missing keys, wrong key length) and assert the result is `false` or the defined error return (e.g. `-1000` when not initialized).
- **Not initialized:** If the test environment can run without initializing the SDK, assert `verifyWallet(someWallet)` returns `-1000` when not initialized.

### 18.2 signSendCoinTransaction tests

- **Positive:** Using a CIRCL-created or CIRCL-compatible wallet (e.g. from `newWallet(KEY_TYPE_HYBRID)`, or from `openWalletFromSeedWords` with the legacy 48-word list, or a deserialized wallet that was created with CIRCL), call **signSendCoinTransaction(wallet, toAddress, coins, nonce)** with valid parameters. Assert `resultCode === 0` (or the success code used by the API), and that `txnHash` and `txnData` are valid (e.g. non-null, expected format such as hex). This ensures the hybrideds signCompact/verifyCompact path used inside signSendCoinTransaction works end-to-end.
- **Negative:** Call with invalid inputs (e.g. invalid toAddress, invalid coins, or invalid wallet) and assert the appropriate error result code.

### 18.3 signTransaction tests

- **Positive:** Using a CIRCL-created or CIRCL-compatible wallet, call **signTransaction(wallet, toAddress, coins, nonce, data)** with valid parameters. Assert success (`resultCode === 0` or equivalent) and valid `txnHash` and `txnData`. This exercises the hybrideds signCompact/verifyCompact path in signTransaction.
- **Negative:** Call with invalid inputs and assert the appropriate error result code.

### 18.4 sendCoins tests

- **When network is available:** If the test suite runs against a live or test RPC, add or extend a test that calls **sendCoins(wallet, toAddress, coins, nonce)** with a CIRCL-created or CIRCL-compatible wallet and valid parameters, and assert the call completes with the expected success or documented failure (e.g. insufficient funds). This exercises the hybrideds signCompact/verifyCompact path and the full send flow.
- **When network is not available:** If sendCoins is not exercised in the test environment (e.g. unit tests only), the spec does not require a dedicated sendCoins test; the signing path is covered by signSendCoinTransaction and signRawTransaction tests. Optionally document that sendCoins shares the same CIRCL sign/verify path as signSendCoinTransaction.

### 18.5 serializeWallet / deserializeWallet tests (CIRCL wallets)

- **Roundtrip (key type 3):** Create a wallet with `newWallet(KEY_TYPE_HYBRID)`. Call `serializeWallet(wallet)`, then `deserializeWallet(serialized)`. Assert the deserialized wallet is non-null and that `verifyWallet(deserialized)` is true. Optionally assert `deserialized.address` matches the original wallet address. This ensures serialized CIRCL hybrid wallets survive roundtrip.
- **Roundtrip (key type 5):** Same as above with `newWallet(KEY_TYPE_HYBRID5)`. Ensures hybrid5 wallet serialization/deserialization works with CIRCL key sizes.
- **Roundtrip (48-word opened wallet):** Open a wallet from the legacy 48-word seed, serialize it, deserialize it, and assert verifyWallet and address match. Ensures hybrideds-derived wallets serialize correctly.

### 18.6 serializeEncryptedWallet / deserializeEncryptedWallet tests (CIRCL wallets)

- **Roundtrip (key type 3):** Create a wallet with `newWallet(KEY_TYPE_HYBRID)`. Call `serializeEncryptedWallet(wallet, passphrase)`, then `deserializeEncryptedWallet(encrypted, passphrase)`. Assert the deserialized wallet is non-null and that `verifyWallet(deserialized)` is true. Ensures encrypted serialization works for CIRCL hybrid wallets.
- **Roundtrip (key type 5):** Same with `newWallet(KEY_TYPE_HYBRID5)`. Ensures encrypted roundtrip for hybrid5 wallets.
- **Negative:** Deserialize with wrong passphrase and assert failure (e.g. null or error).

### 18.7 Implementation checklist (other impacted functions)

| # | Action |
|---|--------|
| 1 | Add or extend verifyWallet tests: positive for keyType 3 wallet, keyType 5 wallet, and 48-word opened wallet; negative for invalid wallet; not-initialized when applicable. |
| 2 | Add or extend signSendCoinTransaction test: success with CIRCL-compatible wallet; assert resultCode 0 and valid txnHash/txnData; negative for invalid inputs. |
| 3 | Add or extend signTransaction test: success with CIRCL-compatible wallet; assert resultCode 0 and valid txnHash/txnData; negative for invalid inputs. |
| 4 | Add or extend sendCoins test when network/RPC is available; otherwise document that signing path is covered by signSendCoinTransaction/signRawTransaction. |
| 5 | Add or extend serializeWallet/deserializeWallet roundtrip tests for wallets created with newWallet(KEY_TYPE_HYBRID), newWallet(KEY_TYPE_HYBRID5), and openWalletFromSeedWords(48-word list). |
| 6 | Add or extend serializeEncryptedWallet/deserializeEncryptedWallet roundtrip tests for keyType 3 and keyType 5 wallets; negative test for wrong passphrase. |
| 7 | Ensure SDK is initialized (and CIRCL WASM loaded) before running these tests. |
