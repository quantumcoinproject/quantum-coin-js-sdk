/**
 * Single test: keyType 5, signingContext null — sign + RPC submit.
 * Run to see console logs (e.g. transactionGetTransactionHash2).
 */
const { describe, test, before } = require('node:test');
const assert = require('node:assert/strict');

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

async function signAndSubmitRpc(wallet, signingContext) {
  console.log('[test] eth_getTransactionCount...');
  const txnCount = await rpc('eth_getTransactionCount', [wallet.address, 'latest']);
  assert.ok(txnCount && (txnCount.result != null || txnCount.error));
  assert.ok(txnCount.result != null, `eth_getTransactionCount failed: ${txnCount.error?.message ?? JSON.stringify(txnCount)}`);
  const nonce = parseInt(txnCount.result, 16);
  assert.ok(Number.isInteger(nonce) && nonce >= 0);
  console.log('[test] nonce:', nonce);

  const txReq = makeTxReq(wallet, signingContext, nonce);
  console.log('[test] signRawTransaction(keyType 5, signingContext null)...');
  const sign = qcsdk.signRawTransaction(txReq);
  console.log('[test] signRawTransaction resultCode:', sign.resultCode);
  assert.equal(sign.resultCode, 0, `signRawTransaction failed with resultCode ${sign.resultCode}`);
  assert.ok(typeof sign.txnData === 'string' && sign.txnData.startsWith('0x'));

  console.log('[test] eth_sendRawTransaction...');
  const send = await rpc('eth_sendRawTransaction', [sign.txnData]);
  console.log('[test] send result:', send?.result ?? null, 'error:', send?.error?.message ?? null);

  if (send && send.result && typeof send.result === 'string') {
    assert.ok(send.result.startsWith('0x'), 'expected tx hash');
    console.log('[test] OK: tx hash', send.result);
    return;
  }

  const msg = send?.error?.message ?? '';
  assert.ok(
    isInsufficientGasErrorMessage(msg),
    `RPC submit failed with unexpected error: ${msg || JSON.stringify(send)}`,
  );
  console.log('[test] OK: insufficient funds for gas (expected for new wallet)');
}

describe('signRawTransaction keyType 5 signingContext null', () => {
  before(async () => {
    console.log('[test] initialize SDK...');
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const initResult = await qcsdk.initialize(cfg);
    assert.equal(initResult, true, 'SDK initialize should succeed');
  });

  test('keyType 5, signingContext null — sign + RPC submit', { timeout: 120_000 }, async () => {
    assert.ok(isCirclAvailable());
    const wallet = qcsdk.newWallet(5);
    assert.ok(wallet && typeof wallet === 'object');
    console.log('[test] wallet address:', wallet.address);
    await signAndSubmitRpc(wallet, null);
  });
});
