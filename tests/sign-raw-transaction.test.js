const { describe, test, before } = require('node:test');
const assert = require('node:assert/strict');

/**
 * signRawTransaction tests: keyType (null, 3, 5) × signingContext (null, 0, 1, 2).
 * Positive: sign then eth_sendRawTransaction; expect no error or insufficient funds for gas.
 * Negative: signRawTransaction returns resultCode !== 0.
 */
const qcsdk = require('..');

const MAINNET_CHAIN_ID = 123123;
const READ_RELAY_URL = 'https://sdk.readrelay.quantumcoinapi.com';
const WRITE_RELAY_URL = 'https://sdk.writerelay.quantumcoinapi.com';
const PUBLIC_RPC_URL = 'https://public.rpc.quantumcoinapi.com';
const TO_ADDRESS_EXAMPLE =
  '0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612';

function isCirclAvailable() {
  const w = qcsdk.newWallet();
  return (
    typeof w === 'object' &&
    w != null &&
    w.privateKey != null &&
    w.address != null &&
    qcsdk.verifyWallet(w) === true
  );
}

function isHex0x(str) {
  return typeof str === 'string' && /^0x[0-9a-fA-F]*$/.test(str);
}

async function rpc(method, params) {
  const response = await fetch(PUBLIC_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  assert.ok(response.ok, `RPC HTTP ${response.status}`);
  return response.json();
}

function isInsufficientGasErrorMessage(message) {
  if (!message || typeof message !== 'string') return false;
  const m = message.toLowerCase();
  return (m.includes('insufficient') && m.includes('fund')) && m.includes('gas');
}

function makeTxReq(wallet, signingContext, nonce = 0) {
  return new qcsdk.TransactionSigningRequest(
    wallet,
    TO_ADDRESS_EXAMPLE,
    '0x0',
    nonce,
    null,
    21000,
    null,
    MAINNET_CHAIN_ID,
    signingContext,
  );
}

/** Sign, submit via RPC; assert success (tx hash) or insufficient funds for gas only. */
async function signAndSubmitRpc(wallet, signingContext) {
  const txnCount = await rpc('eth_getTransactionCount', [wallet.address, 'latest']);
  assert.ok(txnCount && (txnCount.result != null || txnCount.error), `RPC error: ${txnCount.error?.message ?? 'unknown'}`);
  assert.ok(txnCount.result != null, `eth_getTransactionCount failed: ${txnCount.error?.message ?? JSON.stringify(txnCount)}`);
  const nonce = parseInt(txnCount.result, 16);
  assert.ok(Number.isInteger(nonce) && nonce >= 0);

  const txReq = makeTxReq(wallet, signingContext, nonce);
  const sign = qcsdk.signRawTransaction(txReq);
  assert.equal(sign.resultCode, 0, `signRawTransaction failed with resultCode ${sign.resultCode}`);
  assert.ok(typeof sign.txnData === 'string' && sign.txnData.startsWith('0x'));

  const send = await rpc('eth_sendRawTransaction', [sign.txnData]);

  if (send && send.result && typeof send.result === 'string') {
    assert.ok(send.result.startsWith('0x'), 'expected tx hash');
    return;
  }

  const msg = send?.error?.message ?? '';
  assert.ok(
    isInsufficientGasErrorMessage(msg),
    `RPC submit failed with unexpected error: ${msg || JSON.stringify(send)}`,
  );
}

describe('signRawTransaction', () => {
  before(async () => {
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const initResult = await qcsdk.initialize(cfg);
    assert.equal(initResult, true, 'SDK initialize should succeed');
  });

  test('CIRCL is available', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
  });

  describe('positive: sign + RPC submit (no error or insufficient funds for gas only)', { concurrency: 1 }, () => {
    test('keyType null, signingContext null', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(null);
      assert.ok(wallet && typeof wallet === 'object', 'newWallet(null) must return a wallet');
      await signAndSubmitRpc(wallet, null);
    });

    test('keyType null, signingContext 0', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(null);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, 0);
    });

    test('keyType null, signingContext 2', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(null);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, 2);
    });

    test('keyType 3, signingContext null', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(3);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, null);
    });

    test('keyType 3, signingContext 0', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(3);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, 0);
    });

    test('keyType 3, signingContext 2', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(3);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, 2);
    });

    test('keyType 5, signingContext null', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(5);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, null);
    });

    test('keyType 5, signingContext 1', { timeout: 120_000 }, async () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(5);
      assert.ok(wallet && typeof wallet === 'object');
      await signAndSubmitRpc(wallet, 1);
    });
  });

  describe('negative: signRawTransaction returns error (resultCode !== 0)', () => {
    test('keyType 3 wallet with signingContext 1 (hybrid5) -> mismatch', () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(3);
      assert.ok(wallet && typeof wallet === 'object');
      const txReq = makeTxReq(wallet, 1);
      const result = qcsdk.signRawTransaction(txReq);
      assert.notEqual(result.resultCode, 0, `expected error, got resultCode ${result.resultCode}`);
    });

    test('keyType 5 wallet with signingContext 0 (hybrid compact) -> mismatch', () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(5);
      assert.ok(wallet && typeof wallet === 'object');
      const txReq = makeTxReq(wallet, 0);
      const result = qcsdk.signRawTransaction(txReq);
      assert.notEqual(result.resultCode, 0, `expected error, got resultCode ${result.resultCode}`);
    });

    test('keyType 5 wallet with signingContext 2 (hybrid full) -> mismatch', () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(5);
      assert.ok(wallet && typeof wallet === 'object');
      const txReq = makeTxReq(wallet, 2);
      const result = qcsdk.signRawTransaction(txReq);
      assert.notEqual(result.resultCode, 0, `expected error, got resultCode ${result.resultCode}`);
    });

    test('invalid signingContext (e.g. 99) -> error', () => {
      assert.ok(isCirclAvailable());
      const wallet = qcsdk.newWallet(3);
      assert.ok(wallet && typeof wallet === 'object');
      const txReq = makeTxReq(wallet, 99);
      const result = qcsdk.signRawTransaction(txReq);
      assert.notEqual(result.resultCode, 0, `expected error for signingContext 99, got ${result.resultCode}`);
    });
  });
});
