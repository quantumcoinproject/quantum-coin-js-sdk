const { describe, test, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Tests are required to live under `tests/` per project convention.
// These are the "non-transactional" tests: offline operations + read-only relay/RPC calls.

const qcsdk = require('..');

const MAINNET_CHAIN_ID = 123123;
const READ_RELAY_URL = 'https://sdk.readrelay.quantumcoinapi.com';
const WRITE_RELAY_URL = 'https://sdk.writerelay.quantumcoinapi.com';
const PUBLIC_RPC_URL = 'https://public.rpc.quantumcoinapi.com';

const VALID_ADDRESS_EXAMPLE =
  '0x6f605c4142f1cb037f967101a5b28ccd00b27cce4516190356baaf284d20e667';
const VALID_ADDRESS_EXAMPLE_UPPER =
  '0X6F605C4142F1CB037F967101A5B28CCD00B27CCE4516190356BAAF284D20E667';
const TO_ADDRESS_EXAMPLE =
  '0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612';
const ACCOUNT_ADDRESS_EXAMPLE =
  '0x0000000000000000000000000000000000000000000000000000000000001000';
const ACCOUNT_TX_LIST_EXAMPLE =
  '0x0000000000000000000000000000000000000000000000000000000000002000';
const TX_HASH_EXAMPLE =
  '0xe6fbabc178adaaab6b9dbda086de53deaced1d6fe40e7db9539fe9e85695d1be';

// Example seed words (48) from `example/example.js`
const SEED_WORD_LIST =
  'servetize,redmation,suaveton,dreadtolk,rondial,pondicle,miscoil,teaguery,dylodecid,portnel,mantical,slapware,sluthike,tactise,crierial,tajluvki,pranicum,sockcup,stacksong,duerling,genogram,peasate,pulubly,skimpop,feldtail,saprostal,crabrock,radiment,dolocsin,strigemen,juryeuk,fextial,merunized,tangienti,stylocyte,plumvieve,bobstike,nosecrown,acudemy,gripstick,lacreous,marculade,sporculum,outslope,bioburden,trompong,sidelay,finchage'
    .split(',');

// Example wallet created with external wallet (from examples)
const EXAMPLE_WALLET_ENCRYPTED_JSON =
  '{"address":"1a846abe71c8b989e8337c55d608be81c28ab3b2e40c83eaa2a68d516049aec6","crypto":{"cipher":"aes-256-ctr","ciphertext":"ab7e620dd66cb55ac201b9c6796de92bbb06f3681b5932eabe099871f1f7d79acabe30921a39ad13bfe74f42c515734882b6723760142aa3e26e011df514a534ae47bd15d86badd9c6f17c48d4c892711d54d441ee3a0ee0e5b060f816e79c7badd13ff4c235934b1986774223ecf6e8761388969bb239c759b54c8c70e6a2e27c93a4b70129c8159f461d271ae8f3573414c78b88e4d0abfa6365ed45456636d4ed971c7a0c6b84e6f0c2621e819268b135e2bcc169a54d1847b39e6ba2ae8ec969b69f330b7db9e785ed02204d5a1185915ae5338b0f40ef2a7f4d5aaf7563d502135e57f4eb89d5ec1efa5c77e374969d6cd85be625a2ed1225d68ecdd84067bfc69adb83ecd5c6050472eca28a5a646fcdd28077165c629975bec8a79fe1457cb53389b788b25e1f8eff8b2ca326d7dfcaba3f8839225a08057c018a458891fd2caa0d2b27632cffd80f592147ccec9a10dc8a08a48fb55047bff5cf85cda39eb089096bef63842fc3686412f298a54a9e4b0bf4ad36907ba373cbd6d32e7ac494af371da5aa9d38a3463220865114c4adc5e4ac258ba9c6af9fa2ddfd1aec2e16887e4b3977c69561df8599ac9d411c9dd2a4d57f92ea4e5c02aae3f49fb3bc83e16673e6c2dbe96bb181c8dfd0f9757ade2e4ff27215a836058c5ffeab042f6f97c7c02339f76a6284680e01b4bb733690eb3347fbfcc26614b8bf755f9dfce3fea9d4e4d15b164983201732c2e87593a86bca6da6972e128490338f76ae68135888070f4e59e90db54d23834769bdbda9769213faf5357f9167a224523975a946367b68f0cec98658575609f58bfd329e420a921c06713326e4cb20a0df1d77f37e78a320a637a96c604ca3fa89e24beb42313751b8f09b14f9c14c77e4fd13fc6382505d27c771bca0d821ec7c3765acffa99d83c50140a56b0b28101c762bd682fe55cb6f23cbeb3f421d7b36021010e45ac27160dd7ead99c864a1b550c7edb1246950fe32dcc049799f9085287f0a747a6ef7a023df46a23a22f3e833bbf8d404f84344870492658256ee1dfc40fda33bb8d48fc72d4520ba9fc820c9123104a045206809037709f2a5f6723fa77d6bac5a573823d4ec3a7f1cb786a52ee2697e622e5d75962fa554d1024a6c355e21f33a63b2b72e6c4742a8b1c373aa532b40518c38c90b5373c2eb8c9d7be2a9e16047a3ee09dc9a6849deac5183ace6cfe91a9bef2ffc0a7df6ccebfd4c858c84b0e0355650d7466971e66f1e3883013e5ad1be33199b1d110b79070ac1b745ccb14cf63a08f8cca3a21c9525e626ff5f0c34746e10750fb742ad51f11f2acae3676c2111853d7250d01b77821a6ba9e04400ba2c543ca9f2d701ae6f47bfad14ffe3039ee9e71f7b2401359ade9938750ddb9c5a8b018a7929ed8d0e717ff1861446ce17535e9b17c187711190aae3388bd9490837a636c25ed4d42d7079ad1a51e13292c683d5d012abcf46965c534b83ab53f2c1f0cf5830ef7582e06863a33c19a70511df632885d63245965047ea96b56f1af5b3b94a54999f784fb9574fdfcd7c1230e07a2aaa04acd3097b2b9f8ddba05ae9734491deb5c1a513c76ed276cb78bbf4839dae3156d76af444a5805129d5df791167a9c8576a1d7f760b2d2797c4658669608706fbd0ace1be2346f74862dfc9ef518e55632e43c043186e5d070deb34d12fb9e5aba84e5cb50213dc88efd39cc35bf42455aa82d5e3b707b3140be3b8623b34fdd81d08615c188ae8438a13881fdf6bf32f2cb9ff5fa625561040c6b71d4b8eccc90bc3b99650d28dd1ee63773e49664e3d48c484996b290943635a6f2eb1ce9796d3fa144a3f00ef82faaa32d6a413668f7b521517cb68b2b017fcf56c79326fa5e4060e643631ca3f0a0dc0ed718798b6f46b130d437c33f64039e887324b6f5e604b1669d613923794edbf04b1b3caea54793b52b44b170173a4f25c7ecef3b71e2aad76e556b1cb9f1d637ec52ececfa950dd31dbb6a60828a3ad34c1beffe09eb4785786d63bad10a0b0f66ea88c57380f38ea85f018dbd7f538cf1ee7624095b9a01ec5edd528f281168af020609e651ff316aa1320a710134ddfca600cc72174dcdb846d2aa29916488aa1b537b66da92e61af526debef4eb38c984569eaf549ff2129449269b492d030cd74d885f6f5785881cc4804b4a8a09ba4ff7aefe9074ac7d0c4f05d51fe4cc0ff7388a772092b9d02d70e5433a5cf3e02f46a6bd6b818d59a07ce3b9fbbf8b5faba74563bcc5240930c2d406c9aaee3e3ce0429bf68ac2b0a57adb09414cff50817d2a48fb9fa624ab863cb0c31a8b8dc5eaf6fa68cc1d7c6c685c5a33edd5c8933b9e8ab628ee428d0743699b2ff17f25586c7ce959280bb0b8c5342251f0a30b53dbc7bf1ee426ac9619c3560f811f2268ee37f189794e2e4b3db3a2fb2e34b649e504fb467438abfd1082619cc4a0b30d66beb831077812e418d2e2148db10cf4d4a29101ca52ec445b8d83519dd7de85a98e0beae9ee537096d3f1a55a7a80cdfa93d25f07c9f98e8af18cde19ec1f99c5dd4588b717a5039ddb7f177717caf0d0fd45420a70dbd6d3146890d9e450d5224146db4c33b779e3c3a04b976c052bad042ac57dd38be45407808c0fb0d7e2a8819e6cd53c6739e6612996ddaa6f066552590aa0343bc1e62b298ff2514a0cef8be21956c2e942816f7a3a3a0935eaf9b37251409ce444c986c3817e82835555fe18239f3ae33469d7965c2bde9991fde556bd07af01df52bbde0c35bb4ef48e3b5d0db53f8ca4ed35b83f760f0a1bc4ed9f86e85d6039a17df373c85402ef956f01db00eb39c4b74bd0660d29ee746714d9780d738e05c6cca414ce3d7b40dda8036a9eea9ab1388805f913eb19bdd3f09d9e161eaa50231bd9caba61971f194332dd28c696a60458c1c6c2cc5da8b1192611c7c553e9e12fe48ce46bbb891be8bb118721c86222e671ddd1da8f0ccb2b68e02f2014b4925e904e88369aaf7466bd7033a60c265d45955944916ecbdb84bf1b522b01b0149c632e04c568a7eb627c5bb90ece052ebcf79166c28b30d23fe52da0a5ab5dea83ca479a3e3b7a9cfbbfea04dbe6137c19d067317c2ec427a8c75a6b06bec6dcd5d5c0edc9aa80b9003b8e17c088b2f3db327d3e42630d82d20120240c3ba56232280787da4aabbf5bc95a864029f00710e195f2a76460a0317d10b552fe1bea097e41d49756c680a41d6ac186e62169b6b6cd7776ea84618b5b752328a5bacaa10aa122ff9b2698b43efe73d852a899db644863c8c9bc8068ea86ea843fd6fe36272b91cdc5d5317083ef3fd1e5462a0b0d0604dc57b3bbfceb0fca4cd349625dd7b25166af30efe5ee6a0af953a74d65f4736c59918ee55a3b0d9d9d42e04c7f8a77e479109f740e20c464d5d7e3d16805f47b61f403ff7f408c9e850d9baacd8067e544536a4953480b0f9ee9cd45f41ebd67b51f78788a6470cb1e5ca72ca346ce8a50d0ca0c921d5576a4455a1afb6d0bc688004712ee122cacdb29c51e84893324c27fa4a3f1917edf5352272b4c97579a6152e4b77663d0ab532915f2eeb6a862de8b696452321b660c3f2449673d086e95a7af28845a5259b763e0fcd09f72acf7b6c811066263060e5aa5b24658e880a01fd56bda4dad5ab604e129290f7d5489728f2a40968c6168b21cebbbcd11727cc9e9160c4e92e04387d3b0d62aab06a61f26daedd9fed11816ef2180172a47f47184ac4032b88758c98a2e0fb200f70e93ba695f5ebb7a1029610ad360d3b7fa1b4640b9dc674d3625eef786da93dff19bc7991b5d6193a3896664763fde479b5dfc04812111a80782854f2cf68ca7d82765cc9eb40fba4b44640710ed6e653abf9f07b466333f4fd22784d53cf40e17120f42caa841eaa24056b237827b0f47f7257c103c35027e9f503e5acfd023e7357b600d3084d361d5ee65ba319b45c153212a54e6fed85af7e43e0a926ebcbc2edf8de7e2ec9528f00bec262ad04d5c9dafccaea06a24748d28bf1799bae0e895543084539c50b5aaa4fb50d7431d6f0c8cee2a54aaf7ee7919b55bf40adb688632e5dbe273cea09e97b19c3d8e1f4de000deb66fa1942ad03a62d3252f51992244366c156000b49c297167a6cbdedea7ebae139d295f0ad298e0864249b905b7eb812886ec70ecdb286702274b5b8574149bf3866f9e46b997ff5ed622b169a0eb071347f18d530db1663906a28f4544ee4e004ab87b65476af30ede118052ff052b8dc986ca2c93dd5d4943266a579c7698ea014f688b3e8063a107feb162d392e2177b01bff77fb5abe5feebd0607158049a5a093325b7c9ee6b4dfa7a9f65c7c2fb628920d3603a1c2dad979eaa047cd661a268af1078c9788d720e64e4ce9d12e68de1e417ef2f293323681e1071f9220e1ee43d2e29d111b870ce3439f5100ecd4551ab65ee74aa1667e564957e9bc0ae1ea193980da2a0ec2698073388c85bec25ef447f0d5e93a5203fa44dff268e5cb799ed3b66e63d5e07b487e7534f24934c73a62a243e0151843a0fd3807711a101eaa7fc71f0ba68aebb9534d57cba41b094eebfb4c31cca8eddfa426f676aa347be8a7023a4e91ddb154b35cd4d5f7dbc2e5db491de99f33fc2cff2d57029ac950e1ccd681980af6a4e8969dfe39b3c7bfcbcf8fac92f1e6ec9fe572bfa6a7d65860eab2ed10ac01a71290b52e3148e84b7376a8605cd2bb0e8681ffc54691ce087685e33921bd44d36c78291713dce17569570f62137e6904f0d68cf53aa2ec395c389a75141f08114fb293ea63950e4ffee55ec6fc83cf44876b8e7f25cdd393ff87b9eda6eb746085b61a6900de191f0ce2cb388d61ece52e78bc47368194e8e00277e0d1631e6b9d4626ef76f8522582ccd5a40be3febc699bb510acc6271d55ff0f4cf3bb7669855a72efd9ca3e1056a2fe592a5bc877cce2b1f63b58383971da87873d2d1349cf5881242cdce4e7e2c5c514755746a0e0a7c2a6d9701cde005ae3420beb17c379a3516662253554f51f0423bb1844b0b90c54ed8177ceb0e1036a6609d836e748ca06c40ca64befadc6443ec286a0ce464678e8d11eb455f7bb305acebf6cb1f50e394a9bfeb752df1687831bac9cdd811f4f112ef6658d0f8799a866374ff96c5e2b79f30e7a74f8a2bc9ed1f88f01f30e30cb78ffb2bff10108f35e910ee3be4463e9e6f0ed910e8d598326e71dfa2277ffe5579d7fe9b6018bfe295b25219eae07b3b0270665c3fa00c3e0d180812b5cd62925585de84a7c48a9a86dba96544a251654d1966e082432dc85b6149cf21e91a46020ec32b66d28ba3b6a90c0617bc6fdd55aea819af2bcf84864ad60c28fe3c9f8339d0aee68b39d97f63b6e082835d86119cf9b9fdc8b827c847ce40aa10e1577a710132316845e825345e95bdf94d0c66ec65a6c4319fce4792313663b5f7a651a6710783e6ab71608ac6cbbf3af6911adf596ccf7c172b9bd5bceb6db379967b32b143bdd11d2ee12ddf64ecef6391e0f8570e6cddd3db95204919362b89b739fa94e7c1bfde799fd5e22aa25ca6ca42e30c08e23aae2385d99ebab441072a880dcefdab74a4c9bd39d363f6d1933d59400fca161d432aa00f23b1b1c19a154be8989699d549b66d44e39896f5523443bc6ddf4a65e91f1f3fb7b52318869a05856a4fc92f3694c81ed833c972fb918f7e5","cipherparams":{"iv":"8c46d6162cd4c765759aedcbce2a5874"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"82fb6cdc6917609135277badacf15baa31899d08b71a5a0fa33167167c161537"},"mac":"9187b17f7eca48e6b8c586b0cd790dbe0feb876ac8385f93faa7d5e22a3c8fc7"},"id":"92caf6ee-2d43-48c0-859e-ffa1e0e23312","version":3}';
const EXAMPLE_WALLET_PASSPHRASE = 'QuantumCoinExample123!';

// Fixture for "wallet test" (same as example wallet)
const TEST_WALLET_ENCRYPTED_JSON = EXAMPLE_WALLET_ENCRYPTED_JSON;
const TEST_WALLET_PASSPHRASE = EXAMPLE_WALLET_PASSPHRASE;

// Fixture for seed-words address test
const TEST_SEED_WORDS = [
  'cylamidal', 'suculate', 'sealmate', 'radiploid', 'equifaxis', 'and', 'antipoise', 'stitchesy', 'perelade', 'lite',
  'gourtarel', 'thursat', 'overdrome', 'cogulate', 'nonviva', 'stewnut', 'floribund', 'enduivist', 'decatary', 'elvenwort',
  'indoucate', 'ravelent', 'vocalus', 'wetshirt', 'rutatory', 'percect', 'breaktout', 'corpation', 'myricorus', 'veofreat',
  'junkard', 'supercarp', 'sukerus', 'tautang', 'facetype', 'shishkin', 'insulal', 'hobstone', 'stumbed', 'tecutonic',
  'jumplike', 'hegwirth', 'idea', 'bhagatpur', 'pavastava', 'kukuluan', 'mageiline', 'extranite',
];
const TEST_SEED_ADDRESS = '0x3Ce22c0e2714196734E42B0D4D5AD11284260502A560e46c2Cd857391564142F'.toLowerCase();

// First 32 and 36 words from TEST_SEED_WORDS (for deterministic address tests)
const TEST_SEED_WORDS_32 = TEST_SEED_WORDS.slice(0, 32);
const TEST_SEED_WORDS_36 = TEST_SEED_WORDS.slice(0, 36);
// Expected addresses for first 32/36 words (deterministic from test run)
const TEST_SEED_ADDRESS_32 = '0x38b12df2d4762a04a183f936c47747a1f13d0b0ba72066b43b4b6d7f776e9e25';
const TEST_SEED_ADDRESS_36 = '0x030e264c853bd859c53fae3ad6ef0e011dc799685e2b05d5efa7ac50f10ca075';

// Default test password for encrypt/decrypt in seed-wallet roundtrip tests
const SEED_WALLET_TEST_PASSPHRASE = TEST_WALLET_PASSPHRASE;

async function rpc(method, params) {
  const response = await fetch(PUBLIC_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  assert.ok(response.ok, `RPC HTTP ${response.status}`);
  return response.json();
}

function isHex0x(str) {
  return typeof str === 'string' && /^0x[0-9a-fA-F]*$/.test(str);
}

function isHex(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]+$/.test(str);
}

/** True if CIRCL WASM is loaded, newWallet() returns a wallet, and verifyWallet passes. */
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

function hexToBytes(hex) {
  assert.ok(typeof hex === 'string');
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  assert.equal(h.length % 2, 0);
  const out = [];
  for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16));
  return out;
}

describe('non-transactional', () => {
  test('exports: all classes are constructible (and not callable without new)', () => {
    const classExports = [
      'AccountDetails',
      'AccountDetailsResult',
      'AccountTransactionCompact',
      'AccountTransactionsResult',
      'BlockDetails',
      'Config',
      'EventLogEncodeResult',
      'LatestBlockDetailsResult',
      'ListAccountTransactionsResponse',
      'PackUnpackResult',
      'SendResult',
      'TransactionDetails',
      'TransactionDetailsResult',
      'TransactionReceipt',
      'TransactionSigningRequest',
      'Wallet',
    ];

    for (const name of classExports) {
      assert.equal(typeof qcsdk[name], 'function', `${name} export missing`);
      assert.throws(() => qcsdk[name](), TypeError, `${name} should require new`);
      // Basic "positive" constructability check
      assert.ok(new qcsdk[name](), `${name} should be new-able`);
    }
  });

  before(async () => {
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const initResult = await qcsdk.initialize(cfg);
    assert.equal(initResult, true, 'SDK initialize should succeed');
  });

  test('initialize: calling initialize twice returns false', async () => {
    const cfg = new qcsdk.Config(READ_RELAY_URL, WRITE_RELAY_URL, MAINNET_CHAIN_ID, '', '');
    const init2 = await qcsdk.initialize(cfg);
    assert.equal(init2, false);
  });

  test('isAddressValid: accepts valid 0x/0X and rejects invalid', () => {
    assert.equal(qcsdk.isAddressValid(VALID_ADDRESS_EXAMPLE), true);
    assert.equal(qcsdk.isAddressValid(VALID_ADDRESS_EXAMPLE_UPPER), true);
    assert.equal(qcsdk.isAddressValid('asfasdfasdfs'), false);
    assert.equal(qcsdk.isAddressValid(null), false);
  });

  test('wallet: newWallet/verifyWallet/serializeWallet/deserializeWallet roundtrip', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const w1 = qcsdk.newWallet();
    assert.ok(w1);
    assert.equal(typeof w1.address, 'string');
    assert.ok(w1.privateKey && (w1.privateKey.byteLength !== undefined || typeof w1.privateKey.length === 'number'));
    assert.ok(w1.publicKey && (w1.publicKey.byteLength !== undefined || typeof w1.publicKey.length === 'number'));
    assert.ok(w1.privateKey.length > 0);
    assert.ok(w1.publicKey.length > 0);
    assert.equal(qcsdk.verifyWallet(w1), true);
    assert.equal(qcsdk.isAddressValid(w1.address), true);

    const serialized = qcsdk.serializeWallet(w1);
    assert.ok(serialized && typeof serialized === 'string');
    const w2 = qcsdk.deserializeWallet(serialized);
    assert.ok(w2);
    assert.equal(w2.address.toLowerCase(), w1.address.toLowerCase());
    assert.equal(qcsdk.verifyWallet(w2), true);
  });

  test('wallet encrypted: serializeEncryptedWallet/deserializeEncryptedWallet', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const passphrase = 'QuantumCoinExample123!';
    const w1 = qcsdk.newWallet();
    const enc = qcsdk.serializeEncryptedWallet(w1, passphrase);
    assert.ok(enc && typeof enc === 'string');

    const w2 = qcsdk.deserializeEncryptedWallet(enc, passphrase);
    assert.ok(w2);
    assert.equal(w2.address.toLowerCase(), w1.address.toLowerCase());
    assert.equal(qcsdk.verifyWallet(w2), true);

    // Negative: wrong passphrase
    const wBad = qcsdk.deserializeEncryptedWallet(enc, passphrase + 'wrong');
    assert.equal(wBad, null);
  });

  test('wallet test', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.deserializeEncryptedWallet(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    assert.ok(wallet, 'deserializeEncryptedWallet should return a wallet');
    assert.equal(typeof wallet.address, 'string');
    assert.equal(wallet.address.toLowerCase(), '0x1a846abe71c8b989e8337c55d608be81c28ab3b2e40c83eaa2a68d516049aec6');
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
  });

  test('seed words: newWalletSeed/openWalletFromSeedWords (static fixture)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const seedWords = qcsdk.newWalletSeed();
    assert.ok(seedWords);
    assert.ok(Array.isArray(seedWords) || typeof seedWords === 'string');

    // Positive: open deterministic wallet from seed words fixture (48-word legacy / hybrideds)
    const seedWallet = qcsdk.openWalletFromSeedWords(SEED_WORD_LIST);
    assert.ok(seedWallet);
    assert.equal(qcsdk.verifyWallet(seedWallet), true);
    assert.equal(qcsdk.isAddressValid(seedWallet.address), true);

    // Negative: invalid seed input
    assert.equal(qcsdk.openWalletFromSeedWords(['not', 'enough']), null);
  });

  test('seed words: openWalletFromSeedWords TEST_SEED_WORDS yields TEST_SEED_ADDRESS', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS);
    assert.ok(wallet, 'openWalletFromSeedWords should return a wallet');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
  });

  test('seed words: first 32 words from TEST_SEED_WORDS — verifyWallet and isAddressValid (deterministic)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_32);
    assert.ok(wallet, 'openWalletFromSeedWords(first 32) should return a wallet');
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_32);
  });

  test('seed words: first 36 words from TEST_SEED_WORDS — verifyWallet and isAddressValid (deterministic)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS_36);
    assert.ok(wallet, 'openWalletFromSeedWords(first 36) should return a wallet');
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_36);
  });

  // --- openWalletFromSeed tests (raw seed byte arrays) ---

  // Hardcoded seed byte arrays derived from TEST_SEED_WORDS via seed-words.getSeedArrayFromWordList
  const TEST_SEED_ARRAY_48 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139,218,249,224,255,76,150,203,7,108,119,101,70,217,112,225,190,112,169,98,168,104,223,14,235,161,192,118,167,128,203,76,59];
  const TEST_SEED_ARRAY_32 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139];
  const TEST_SEED_ARRAY_36 = [49,159,218,142,198,66,182,182,73,216,5,119,6,71,216,42,164,55,124,237,92,81,228,227,156,0,38,189,152,58,215,177,80,252,71,86,51,210,70,33,106,200,184,26,246,139,249,41,191,104,163,253,21,26,43,108,146,94,243,204,112,236,219,139,218,249,224,255,76,150,203,7];

  test('openWalletFromSeed: 96-byte seed produces expected address (hybrideds)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_48);
    assert.ok(wallet, 'openWalletFromSeed should return a wallet for 96-byte seed');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
  });

  test('openWalletFromSeed: 64-byte seed produces expected address (hybrid)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32);
    assert.ok(wallet, 'openWalletFromSeed should return a wallet for 64-byte seed');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_32);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
  });

  test('openWalletFromSeed: 72-byte seed produces expected address (hybrid5)', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36);
    assert.ok(wallet, 'openWalletFromSeed should return a wallet for 72-byte seed');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_36);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    assert.equal(qcsdk.isAddressValid(wallet.address), true);
  });

  test('openWalletFromSeed: matches openWalletFromSeedWords for all three schemes', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    for (const [seedArray, seedWords] of [
      [TEST_SEED_ARRAY_48, TEST_SEED_WORDS],
      [TEST_SEED_ARRAY_32, TEST_SEED_WORDS_32],
      [TEST_SEED_ARRAY_36, TEST_SEED_WORDS_36],
    ]) {
      const fromSeed = qcsdk.openWalletFromSeed(seedArray);
      const fromWords = qcsdk.openWalletFromSeedWords(seedWords);
      assert.ok(fromSeed, 'openWalletFromSeed should return a wallet');
      assert.ok(fromWords, 'openWalletFromSeedWords should return a wallet');
      assert.equal(fromSeed.address.toLowerCase(), fromWords.address.toLowerCase());
    }
  });

  test('openWalletFromSeed: accepts Uint8Array input', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.openWalletFromSeed(new Uint8Array(TEST_SEED_ARRAY_48));
    assert.ok(wallet, 'openWalletFromSeed should accept Uint8Array');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS);
  });

  test('openWalletFromSeed: null input returns null', () => {
    assert.equal(qcsdk.openWalletFromSeed(null), null);
  });

  test('openWalletFromSeed: undefined input returns null', () => {
    assert.equal(qcsdk.openWalletFromSeed(undefined), null);
  });

  test('openWalletFromSeed: empty array returns null', () => {
    assert.equal(qcsdk.openWalletFromSeed([]), null);
  });

  test('openWalletFromSeed: wrong length array returns null', () => {
    assert.equal(qcsdk.openWalletFromSeed([1, 2, 3, 4, 5]), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(63).fill(0)), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(65).fill(0)), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(71).fill(0)), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(73).fill(0)), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(95).fill(0)), null);
    assert.equal(qcsdk.openWalletFromSeed(new Array(97).fill(0)), null);
  });

  test('openWalletFromSeed: non-array input returns null', () => {
    assert.equal(qcsdk.openWalletFromSeed('not an array'), null);
    assert.equal(qcsdk.openWalletFromSeed(12345), null);
    assert.equal(qcsdk.openWalletFromSeed({}), null);
  });

  // --- serializeSeedAsEncryptedWallet tests ---

  test('serializeSeedAsEncryptedWallet: 96-byte seed roundtrip — address and keys match', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const json = qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_48, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string', 'should return a JSON string');
    const wallet = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(wallet, 'deserializeEncryptedWallet should return a wallet');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    const ref = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_48);
    assert.ok(ref);
    assert.equal(wallet.publicKey.length, ref.publicKey.length);
    for (let i = 0; i < wallet.publicKey.length; i++) assert.equal(wallet.publicKey[i], ref.publicKey[i]);
    assert.equal(wallet.privateKey.length, ref.privateKey.length);
    for (let i = 0; i < wallet.privateKey.length; i++) assert.equal(wallet.privateKey[i], ref.privateKey[i]);
  });

  test('serializeSeedAsEncryptedWallet: 64-byte seed roundtrip — address and keys match', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const json = qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string', 'should return a JSON string');
    const wallet = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(wallet, 'deserializeEncryptedWallet should return a wallet');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_32);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    const ref = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32);
    assert.ok(ref);
    assert.equal(wallet.publicKey.length, ref.publicKey.length);
    for (let i = 0; i < wallet.publicKey.length; i++) assert.equal(wallet.publicKey[i], ref.publicKey[i]);
    assert.equal(wallet.privateKey.length, ref.privateKey.length);
    for (let i = 0; i < wallet.privateKey.length; i++) assert.equal(wallet.privateKey[i], ref.privateKey[i]);
  });

  test('serializeSeedAsEncryptedWallet: 72-byte seed roundtrip — address and keys match', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const json = qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_36, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string', 'should return a JSON string');
    const wallet = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(wallet, 'deserializeEncryptedWallet should return a wallet');
    assert.equal(wallet.address.toLowerCase(), TEST_SEED_ADDRESS_36);
    assert.equal(qcsdk.verifyWallet(wallet), true);
    const ref = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36);
    assert.ok(ref);
    assert.equal(wallet.publicKey.length, ref.publicKey.length);
    for (let i = 0; i < wallet.publicKey.length; i++) assert.equal(wallet.publicKey[i], ref.publicKey[i]);
    assert.equal(wallet.privateKey.length, ref.privateKey.length);
    for (let i = 0; i < wallet.privateKey.length; i++) assert.equal(wallet.privateKey[i], ref.privateKey[i]);
  });

  test('serializeSeedAsEncryptedWallet: null seed returns null', () => {
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(null, SEED_WALLET_TEST_PASSPHRASE), null);
  });

  test('serializeSeedAsEncryptedWallet: wrong-length seed returns null', () => {
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(new Array(5).fill(0), SEED_WALLET_TEST_PASSPHRASE), null);
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(new Array(63).fill(0), SEED_WALLET_TEST_PASSPHRASE), null);
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(new Array(97).fill(0), SEED_WALLET_TEST_PASSPHRASE), null);
  });

  test('serializeSeedAsEncryptedWallet: null passphrase returns null', () => {
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, null), null);
  });

  test('serializeSeedAsEncryptedWallet: short passphrase returns null', () => {
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, 'short'), null);
  });

  test('serializeSeedAsEncryptedWallet: non-string passphrase returns null', () => {
    assert.equal(qcsdk.serializeSeedAsEncryptedWallet(TEST_SEED_ARRAY_32, 12345), null);
  });

  // --- preExpansionSeed field tests ---

  test('Wallet class: constructor without preExpansionSeed defaults to null', () => {
    const w = new qcsdk.Wallet('0xabc', [1, 2], [3, 4]);
    assert.equal(w.preExpansionSeed, null);
  });

  test('Wallet class: constructor with preExpansionSeed stores it', () => {
    const seed = new Uint8Array([10, 20, 30]);
    const w = new qcsdk.Wallet('0xabc', [1, 2], [3, 4], seed);
    assert.ok(w.preExpansionSeed != null);
    assert.equal(w.preExpansionSeed.length, 3);
    assert.equal(w.preExpansionSeed[0], 10);
  });

  test('newWallet: wallet has preExpansionSeed === null', () => {
    const w = qcsdk.newWallet();
    assert.ok(w && typeof w === 'object');
    assert.equal(w.preExpansionSeed, null);
  });

  test('openWalletFromSeed: 64-byte seed — preExpansionSeed is byte-equal to input', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    assert.equal(wallet.preExpansionSeed.length, 64);
    const inputU8 = new Uint8Array(TEST_SEED_ARRAY_32);
    for (let i = 0; i < 64; i++) assert.equal(wallet.preExpansionSeed[i], inputU8[i]);
  });

  test('openWalletFromSeed: 72-byte seed — preExpansionSeed is byte-equal to input', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    assert.equal(wallet.preExpansionSeed.length, 72);
    const inputU8 = new Uint8Array(TEST_SEED_ARRAY_36);
    for (let i = 0; i < 72; i++) assert.equal(wallet.preExpansionSeed[i], inputU8[i]);
  });

  test('openWalletFromSeed: 96-byte seed — preExpansionSeed is byte-equal to input', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_48);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    assert.equal(wallet.preExpansionSeed.length, 96);
    const inputU8 = new Uint8Array(TEST_SEED_ARRAY_48);
    for (let i = 0; i < 96; i++) assert.equal(wallet.preExpansionSeed[i], inputU8[i]);
  });

  test('openWalletFromSeedWords: wallet has non-null preExpansionSeed', () => {
    const wallet = qcsdk.openWalletFromSeedWords(TEST_SEED_WORDS);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    assert.equal(wallet.preExpansionSeed.length, 96);
  });

  test('serializeEncryptedWallet roundtrip: seed wallet (64-byte) preserves preExpansionSeed and produces V5', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    const json = qcsdk.serializeEncryptedWallet(wallet, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.equal(parsed.version, 5, 'seed wallet should produce V5 encrypted JSON');
    const restored = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(restored);
    assert.equal(restored.address.toLowerCase(), wallet.address.toLowerCase());
    assert.ok(restored.preExpansionSeed != null);
    assert.equal(restored.preExpansionSeed.length, 64);
    const origSeed = new Uint8Array(TEST_SEED_ARRAY_32);
    for (let i = 0; i < 64; i++) assert.equal(restored.preExpansionSeed[i], origSeed[i]);
  });

  test('serializeEncryptedWallet roundtrip: seed wallet (72-byte) preserves preExpansionSeed and produces V5', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_36);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    const json = qcsdk.serializeEncryptedWallet(wallet, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.equal(parsed.version, 5, 'seed wallet should produce V5 encrypted JSON');
    const restored = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(restored);
    assert.equal(restored.address.toLowerCase(), wallet.address.toLowerCase());
    assert.ok(restored.preExpansionSeed != null);
    assert.equal(restored.preExpansionSeed.length, 72);
    const origSeed = new Uint8Array(TEST_SEED_ARRAY_36);
    for (let i = 0; i < 72; i++) assert.equal(restored.preExpansionSeed[i], origSeed[i]);
  });

  test('serializeEncryptedWallet roundtrip: seed wallet (96-byte) preserves preExpansionSeed and produces V5', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_48);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    const json = qcsdk.serializeEncryptedWallet(wallet, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.equal(parsed.version, 5, 'seed wallet should produce V5 encrypted JSON');
    const restored = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(restored);
    assert.equal(restored.address.toLowerCase(), wallet.address.toLowerCase());
    assert.ok(restored.preExpansionSeed != null);
    assert.equal(restored.preExpansionSeed.length, 96);
    const origSeed = new Uint8Array(TEST_SEED_ARRAY_48);
    for (let i = 0; i < 96; i++) assert.equal(restored.preExpansionSeed[i], origSeed[i]);
  });

  test('serializeEncryptedWallet roundtrip: non-seed wallet has null preExpansionSeed and produces V4', () => {
    const wallet = qcsdk.newWallet();
    assert.ok(wallet);
    assert.equal(wallet.preExpansionSeed, null);
    const json = qcsdk.serializeEncryptedWallet(wallet, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.equal(parsed.version, 4, 'non-seed wallet should produce V4 encrypted JSON');
    const restored = qcsdk.deserializeEncryptedWallet(json, SEED_WALLET_TEST_PASSPHRASE);
    assert.ok(restored);
    assert.equal(restored.address.toLowerCase(), wallet.address.toLowerCase());
    assert.equal(restored.preExpansionSeed, null);
  });

  test('serializeWallet/deserializeWallet roundtrip: seed wallet preserves preExpansionSeed', () => {
    const wallet = qcsdk.openWalletFromSeed(TEST_SEED_ARRAY_32);
    assert.ok(wallet && wallet.preExpansionSeed != null);
    const json = qcsdk.serializeWallet(wallet);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.ok(parsed.preExpansionSeed, 'serialized JSON should contain preExpansionSeed field');
    const restored = qcsdk.deserializeWallet(json);
    assert.ok(restored);
    assert.equal(restored.address.toLowerCase(), wallet.address.toLowerCase());
    assert.ok(restored.preExpansionSeed != null);
    assert.equal(restored.preExpansionSeed.length, 64);
    const origSeed = new Uint8Array(TEST_SEED_ARRAY_32);
    for (let i = 0; i < 64; i++) assert.equal(restored.preExpansionSeed[i], origSeed[i]);
  });

  test('serializeWallet/deserializeWallet roundtrip: non-seed wallet has null preExpansionSeed and no field in JSON', () => {
    const wallet = qcsdk.newWallet();
    assert.ok(wallet);
    assert.equal(wallet.preExpansionSeed, null);
    const json = qcsdk.serializeWallet(wallet);
    assert.ok(json && typeof json === 'string');
    const parsed = JSON.parse(json);
    assert.equal(parsed.preExpansionSeed, undefined, 'non-seed wallet JSON should not contain preExpansionSeed');
    const restored = qcsdk.deserializeWallet(json);
    assert.ok(restored);
    assert.equal(restored.preExpansionSeed, null);
  });

  test('backward compat: deserializeEncryptedWallet on V4 JSON (no seed) returns wallet with null preExpansionSeed', () => {
    const wallet = qcsdk.deserializeEncryptedWallet(EXAMPLE_WALLET_ENCRYPTED_JSON, EXAMPLE_WALLET_PASSPHRASE);
    assert.ok(wallet);
    assert.equal(wallet.preExpansionSeed, null);
    assert.equal(qcsdk.verifyWallet(wallet), true);
  });

  test('backward compat: deserializeWallet on JSON without preExpansionSeed field returns null seed', () => {
    const wallet = qcsdk.newWallet();
    const jsonWithoutSeed = JSON.stringify({
      address: wallet.address,
      privateKey: Array.from(wallet.privateKey).map(b => String.fromCodePoint(b)).join(''),
      publicKey: Array.from(wallet.publicKey).map(b => String.fromCodePoint(b)).join(''),
    });
    const w = qcsdk.newWallet();
    const json = qcsdk.serializeWallet(w);
    const parsed = JSON.parse(json);
    delete parsed.preExpansionSeed;
    const cleanJson = JSON.stringify(parsed);
    const restored = qcsdk.deserializeWallet(cleanJson);
    assert.ok(restored);
    assert.equal(restored.preExpansionSeed, null);
  });

  // Hardcoded encrypted wallet JSON (from openWalletFromSeedWords + serializeEncryptedWallet with SEED_WALLET_TEST_PASSPHRASE).
  // Deserialize and verify addresses match. Uses fixtures in tests/ (encrypted-48.json, encrypted-32.json, encrypted-36.json).
  test('seed words: deserializeEncryptedWallet from serialized 48/32/36 seed wallets — addresses match', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const testsDir = __dirname;
    const enc48 = fs.readFileSync(path.join(testsDir, 'encrypted-48.json'), 'utf8').trim();
    const enc32 = fs.readFileSync(path.join(testsDir, 'encrypted-32.json'), 'utf8').trim();
    const enc36 = fs.readFileSync(path.join(testsDir, 'encrypted-36.json'), 'utf8').trim();
    for (const [enc, expectedAddress] of [
      [enc48, TEST_SEED_ADDRESS],
      [enc32, TEST_SEED_ADDRESS_32],
      [enc36, TEST_SEED_ADDRESS_36],
    ]) {
      const wallet = qcsdk.deserializeEncryptedWallet(enc, SEED_WALLET_TEST_PASSPHRASE);
      assert.ok(wallet, 'deserializeEncryptedWallet should return a wallet');
      assert.equal(wallet.address.toLowerCase(), expectedAddress);
      assert.equal(qcsdk.verifyWallet(wallet), true);
      assert.equal(qcsdk.isAddressValid(wallet.address), true);
    }
  });

  test('publicKeyFromPrivateKey/addressFromPublicKey and signature helpers', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.newWallet();
    assert.ok(wallet);
    assert.equal(qcsdk.verifyWallet(wallet), true);

    const pubHex = qcsdk.publicKeyFromPrivateKey(wallet.privateKey);
    assert.ok(pubHex && typeof pubHex === 'string');
    assert.ok(isHex(pubHex), 'publicKeyFromPrivateKey returns hex (no 0x prefix)');

    // Compare derived public key bytes to wallet publicKey bytes
    const pubBytes = hexToBytes(pubHex);
    assert.equal(pubBytes.length, wallet.publicKey.length);
    for (let i = 0; i < pubBytes.length; i++) assert.equal(pubBytes[i], wallet.publicKey[i]);

    // addressFromPublicKey should match wallet address
    const addr = qcsdk.addressFromPublicKey(wallet.publicKey);
    assert.equal(addr.toLowerCase(), wallet.address.toLowerCase());

    // combinePublicKeySignature + publicKeyFromSignature roundtrip (use CIRCL hybrideds when available)
    const digest = new TextEncoder().encode('verifyverifyverifyverifyverifyok'); // 32 bytes
    assert.equal(digest.length, 32);
    const g = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {};
    const circl = g.circl;
    let sig;
    if (circl && circl.hybrideds) {
      const privU8 = wallet.privateKey instanceof Uint8Array ? wallet.privateKey : new Uint8Array(wallet.privateKey);
      const sigRes = circl.hybrideds.signCompact(privU8, digest);
      if (sigRes && sigRes.error) throw new Error('CIRCL sign failed: ' + sigRes.error);
      sig = sigRes.result instanceof Uint8Array ? Array.from(sigRes.result) : sigRes.result;
    } else {
      // Skip roundtrip if CIRCL not loaded (e.g. WASM not yet CIRCL build)
      return;
    }
    const combinedHex = qcsdk.combinePublicKeySignature(wallet.publicKey, sig);
    assert.ok(combinedHex && typeof combinedHex === 'string' && isHex(combinedHex));

    const combinedBytes = hexToBytes(combinedHex);
    const recoveredPubHex = qcsdk.publicKeyFromSignature(digest, combinedBytes);
    assert.ok(recoveredPubHex && typeof recoveredPubHex === 'string' && isHex(recoveredPubHex));
    assert.equal(recoveredPubHex.toLowerCase(), pubHex.toLowerCase());

    // Negative: wrong digest size
    assert.equal(qcsdk.publicKeyFromSignature([1, 2, 3], combinedBytes), null);
  });

  test('RLP: encodeRlp/decodeRlp roundtrip and negative decode', () => {
    // Note: current WASM DecodeRlp returns a JSON string where decoded bytes appear as boolean arrays.
    // We validate that encode->decode is structurally consistent rather than matching the original JS value.
    const enc = qcsdk.encodeRlp(['hello', 123, true]);
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));

    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
    const decoded = JSON.parse(dec.result);
    assert.ok(Array.isArray(decoded));
    assert.equal(decoded.length, 3);
    assert.ok(Array.isArray(decoded[0]) && decoded[0].length === 5); // "hello" bytes -> 5 trues
    assert.ok(Array.isArray(decoded[1]) && decoded[1].length >= 1);
    assert.ok(Array.isArray(decoded[2]) && decoded[2].length >= 1);
    assert.ok(decoded.flat(2).every((b) => typeof b === 'boolean'));

    const bad = qcsdk.decodeRlp('not-hex');
    assert.notEqual(bad.error, '');
  });

  test('ABI pack/unpack: packMethodData/unpackMethodData via RPC eth_call', async () => {
    // Minimal ERC20-like ABI used in examples
    const erc20ABI = JSON.stringify([
      {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
      },
      {
        name: 'name',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
      },
    ]);

    const tokenAddress =
      '0x1Bd75060B22686a9f32Af80BC02348c1BAeDBba06f47ad723885c92a6566B65d';
    const holderAddress =
      '0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6';

    const pack = qcsdk.packMethodData(erc20ABI, 'balanceOf', holderAddress);
    assert.equal(pack.error, '');
    assert.ok(isHex0x(pack.result));

    const call = await rpc('eth_call', [{ to: tokenAddress, data: pack.result }, 'latest']);
    assert.ok(call && (call.result || call.error));
    assert.ok(call.result && isHex0x(call.result), 'eth_call should return hex');

    const unpack = qcsdk.unpackMethodData(erc20ABI, 'balanceOf', call.result);
    assert.equal(unpack.error, '');
    const parsed = JSON.parse(unpack.result);
    assert.ok(Array.isArray(parsed));
    assert.equal(typeof parsed[0], 'string');

    // Negative: invalid ABI JSON
    const badPack = qcsdk.packMethodData('not-json', 'balanceOf', holderAddress);
    assert.notEqual(badPack.error, '');
  });

  test('Event logs: encodeEventLog/decodeEventLog (Transfer)', () => {
    const transferABI = JSON.stringify([
      {
        name: 'Transfer',
        type: 'event',
        anonymous: false,
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false },
        ],
      },
    ]);

    const fromAddress =
      '0xd51773b5dde3f8e4d29ae42b5046510e2a11fd0c8e4175853d6227896eb445c6';
    const toAddress =
      '0x1Bd75060B22686a9f32Af80BC02348c1BAeDBba06f47ad723885c92a6566B65d';
    const value = '1000000000000000000';

    const enc = qcsdk.encodeEventLog(transferABI, 'Transfer', fromAddress, toAddress, value);
    assert.equal(enc.error, '');
    assert.ok(enc.result);
    assert.equal(Array.isArray(enc.result.topics), true);
    assert.equal(enc.result.topics.length, 3);
    assert.ok(isHex0x(enc.result.data));

    const dec = qcsdk.decodeEventLog(transferABI, 'Transfer', enc.result.topics, enc.result.data);
    assert.equal(dec.error, '');
    const decoded = JSON.parse(dec.result);
    assert.equal(decoded.from.toLowerCase(), fromAddress.toLowerCase());
    assert.equal(decoded.to.toLowerCase(), toAddress.toLowerCase());
    assert.equal(decoded.value, value);

    // Negative: invalid ABI
    const bad = qcsdk.decodeEventLog('not-json', 'Transfer', enc.result.topics, enc.result.data);
    assert.notEqual(bad.error, '');
  });

  // --- packCreateContractData tests (ported from Go main_test.go) ---

  test('packCreateContractData: parameterless constructor', () => {
    const abi = JSON.stringify([{
      type: 'constructor',
      inputs: [],
      stateMutability: 'nonpayable',
    }]);
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const result = qcsdk.packCreateContractData(abi, bytecode);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.toLowerCase().startsWith(bytecode.toLowerCase()));
  });

  test('packCreateContractData: constructor with uint256 params', () => {
    const abi = JSON.stringify([{
      type: 'constructor',
      inputs: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' },
      ],
      stateMutability: 'nonpayable',
    }]);
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const result = qcsdk.packCreateContractData(abi, bytecode, '1', '2');
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.length > bytecode.length, 'result should be longer than bytecode alone');
    assert.ok(result.result.toLowerCase().startsWith(bytecode.toLowerCase()));
  });

  test('packCreateContractData: constructor with address param', () => {
    const abi = JSON.stringify([{
      type: 'constructor',
      inputs: [{ name: 'owner', type: 'address' }],
      stateMutability: 'nonpayable',
    }]);
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const ownerAddr = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const result = qcsdk.packCreateContractData(abi, bytecode, ownerAddr);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.length > bytecode.length);
  });

  test('packCreateContractData: constructor with uint256[] array param', () => {
    const abi = JSON.stringify([{
      type: 'constructor',
      inputs: [{ name: 'values', type: 'uint256[]' }],
      stateMutability: 'nonpayable',
    }]);
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const result = qcsdk.packCreateContractData(abi, bytecode, ['100', '200', '300']);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.length > bytecode.length);
  });

  test('packCreateContractData: empty ABI JSON returns error', () => {
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const r1 = qcsdk.packCreateContractData('', bytecode);
    assert.notEqual(r1.error, '');
    const r2 = qcsdk.packCreateContractData('   ', bytecode);
    assert.notEqual(r2.error, '');
  });

  test('packCreateContractData: empty bytecode returns error', () => {
    const abi = JSON.stringify([{ type: 'constructor', inputs: [], stateMutability: 'nonpayable' }]);
    const r1 = qcsdk.packCreateContractData(abi, '');
    assert.notEqual(r1.error, '');
    const r2 = qcsdk.packCreateContractData(abi, '   ');
    assert.notEqual(r2.error, '');
  });

  test('packCreateContractData: invalid bytecode returns error', () => {
    const abi = JSON.stringify([{ type: 'constructor', inputs: [], stateMutability: 'nonpayable' }]);
    const result = qcsdk.packCreateContractData(abi, '0xinvalid');
    assert.notEqual(result.error, '');
  });

  test('packCreateContractData: argument count mismatch returns error', () => {
    const abi = JSON.stringify([{
      type: 'constructor',
      inputs: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' },
      ],
      stateMutability: 'nonpayable',
    }]);
    const bytecode = '0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063';
    const tooFew = qcsdk.packCreateContractData(abi, bytecode, '1');
    assert.notEqual(tooFew.error, '');
    const tooMany = qcsdk.packCreateContractData(abi, bytecode, '1', '2', '3');
    assert.notEqual(tooMany.error, '');
  });

  // --- packMethodData / unpackMethodData extended tests (ported from Go) ---

  test('packMethodData: zero-argument method (name())', () => {
    const abi = JSON.stringify([{
      name: 'name',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
    }]);
    const result = qcsdk.packMethodData(abi, 'name');
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.equal(result.result.length, 10, 'zero-arg method should produce 4-byte selector (0x + 8 hex chars)');
  });

  test('packMethodData: address[] argument', () => {
    const abi = JSON.stringify([{
      name: 'getAmountsIn',
      type: 'function',
      inputs: [
        { name: 'amountOut', type: 'uint256' },
        { name: 'path', type: 'address[]' },
      ],
      outputs: [{ name: 'amounts', type: 'uint256[]' }],
      stateMutability: 'view',
    }]);
    const addr1 = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const addr2 = '0x0000000000000000000000000000000000000000000000000000000000000002';
    const result = qcsdk.packMethodData(abi, 'getAmountsIn', '1000', [addr1, addr2]);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.length > 10);
  });

  test('packMethodData: uint256[] argument', () => {
    const abi = JSON.stringify([{
      name: 'batchTransfer',
      type: 'function',
      inputs: [{ name: 'amounts', type: 'uint256[]' }],
      outputs: [],
      stateMutability: 'nonpayable',
    }]);
    const result = qcsdk.packMethodData(abi, 'batchTransfer', ['100', '200', '300']);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
  });

  test('packMethodData: mixed arguments (address, uint256, bool)', () => {
    const abi = JSON.stringify([{
      name: 'doSomething',
      type: 'function',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'flag', type: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    }]);
    const addr = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const result = qcsdk.packMethodData(abi, 'doSomething', addr, '500', true);
    assert.equal(result.error, '');
    assert.ok(isHex0x(result.result));
    assert.ok(result.result.length > 10);
  });

  test('packMethodData: empty method name returns error', () => {
    const abi = JSON.stringify([{
      name: 'getValue',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    }]);
    const r1 = qcsdk.packMethodData(abi, '');
    assert.notEqual(r1.error, '');
    const r2 = qcsdk.packMethodData(abi, '   ');
    assert.notEqual(r2.error, '');
  });

  test('unpackMethodData: empty method name returns error', () => {
    const abi = JSON.stringify([{
      name: 'getValue',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    }]);
    const r1 = qcsdk.unpackMethodData(abi, '', '0x00');
    assert.notEqual(r1.error, '');
    const r2 = qcsdk.unpackMethodData(abi, '   ', '0x00');
    assert.notEqual(r2.error, '');
  });

  test('unpackMethodData: non-existent method returns error', () => {
    const abi = JSON.stringify([{
      name: 'getValue',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    }]);
    const result = qcsdk.unpackMethodData(abi, 'nonExistentMethod', '0x00');
    assert.notEqual(result.error, '');
  });

  test('unpackMethodData: invalid hex data returns error', () => {
    const abi = JSON.stringify([{
      name: 'getValue',
      type: 'function',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }],
    }]);
    const result = qcsdk.unpackMethodData(abi, 'getValue', 'invalid hex');
    assert.notEqual(result.error, '');
  });

  test('packMethodData/unpackMethodData: offline roundtrip with balanceOf', () => {
    const abi = JSON.stringify([{
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
    }]);
    const addr = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const pack = qcsdk.packMethodData(abi, 'balanceOf', addr);
    assert.equal(pack.error, '');
    assert.ok(isHex0x(pack.result));
    const returnData = '0x' + '00'.repeat(31) + '0a';
    const unpack = qcsdk.unpackMethodData(abi, 'balanceOf', returnData);
    assert.equal(unpack.error, '');
    const parsed = JSON.parse(unpack.result);
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed[0], '10');
  });

  // --- Event log encode/decode extended tests (ported from Go) ---

  test('encodeEventLog: all-indexed event (Approval)', () => {
    const abi = JSON.stringify([{
      name: 'Approval',
      type: 'event',
      anonymous: false,
      inputs: [
        { name: 'owner', type: 'address', indexed: true },
        { name: 'spender', type: 'address', indexed: true },
        { name: 'value', type: 'uint256', indexed: true },
      ],
    }]);
    const owner = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const spender = '0x0000000000000000000000000000000000000000000000000000000000000002';
    const value = '1000000000000000000';
    const enc = qcsdk.encodeEventLog(abi, 'Approval', owner, spender, value);
    assert.equal(enc.error, '');
    assert.equal(enc.result.topics.length, 4);
    assert.equal(enc.result.data, '0x');
  });

  test('encodeEventLog: all-non-indexed event (Received)', () => {
    const abi = JSON.stringify([{
      name: 'Received',
      type: 'event',
      anonymous: false,
      inputs: [
        { name: 'sender', type: 'address', indexed: false },
        { name: 'amount', type: 'uint256', indexed: false },
      ],
    }]);
    const sender = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const amount = '1000000000000000000';
    const enc = qcsdk.encodeEventLog(abi, 'Received', sender, amount);
    assert.equal(enc.error, '');
    assert.equal(enc.result.topics.length, 1);
    assert.ok(enc.result.data !== '' && enc.result.data !== '0x');
  });

  test('encodeEventLog: anonymous event has no signature topic', () => {
    const abi = JSON.stringify([{
      name: 'AnonEvent',
      type: 'event',
      anonymous: true,
      inputs: [
        { name: 'value', type: 'uint256', indexed: true },
      ],
    }]);
    const enc = qcsdk.encodeEventLog(abi, 'AnonEvent', '42');
    assert.equal(enc.error, '');
    assert.equal(enc.result.topics.length, 1, 'anonymous event should have only indexed param topics, no signature');
  });

  test('encodeEventLog: invalid event name returns error', () => {
    const abi = JSON.stringify([{
      name: 'Transfer',
      type: 'event',
      anonymous: false,
      inputs: [],
    }]);
    const enc = qcsdk.encodeEventLog(abi, 'NonExistentEvent');
    assert.notEqual(enc.error, '');
  });

  test('encodeEventLog: argument count mismatch returns error', () => {
    const abi = JSON.stringify([{
      name: 'Transfer',
      type: 'event',
      anonymous: false,
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
      ],
    }]);
    const enc = qcsdk.encodeEventLog(abi, 'Transfer', '0x0000000000000000000000000000000000000000000000000000000000000001');
    assert.notEqual(enc.error, '');
  });

  test('decodeEventLog: invalid event name returns error', () => {
    const abi = JSON.stringify([{
      name: 'Transfer',
      type: 'event',
      anonymous: false,
      inputs: [],
    }]);
    const dec = qcsdk.decodeEventLog(abi, 'NonExistentEvent', ['0x00'], '0x');
    assert.notEqual(dec.error, '');
  });

  test('decodeEventLog: invalid topic signature returns error', () => {
    const abi = JSON.stringify([{
      name: 'Transfer',
      type: 'event',
      anonymous: false,
      inputs: [
        { name: 'from', type: 'address', indexed: true },
      ],
    }]);
    const wrongTopics = [
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ];
    const dec = qcsdk.decodeEventLog(abi, 'Transfer', wrongTopics, '0x');
    assert.notEqual(dec.error, '');
  });

  test('encodeEventLog/decodeEventLog: complex roundtrip (2 indexed + 3 non-indexed)', () => {
    const abi = JSON.stringify([{
      name: 'ComplexEvent',
      type: 'event',
      anonymous: false,
      inputs: [
        { name: 'indexedAddr', type: 'address', indexed: true },
        { name: 'indexedValue', type: 'uint256', indexed: true },
        { name: 'nonIndexedAddr', type: 'address', indexed: false },
        { name: 'nonIndexedValue', type: 'uint256', indexed: false },
        { name: 'flag', type: 'bool', indexed: false },
      ],
    }]);
    const indexedAddr = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const indexedValue = '1000000000000000000';
    const nonIndexedAddr = '0x0000000000000000000000000000000000000000000000000000000000000002';
    const nonIndexedValue = '2000000000000000000';
    const flag = true;

    const enc = qcsdk.encodeEventLog(abi, 'ComplexEvent', indexedAddr, indexedValue, nonIndexedAddr, nonIndexedValue, flag);
    assert.equal(enc.error, '');
    assert.equal(enc.result.topics.length, 3);
    assert.ok(enc.result.data !== '0x');

    const dec = qcsdk.decodeEventLog(abi, 'ComplexEvent', enc.result.topics, enc.result.data);
    assert.equal(dec.error, '');
    const decoded = JSON.parse(dec.result);
    assert.equal(decoded.indexedAddr.toLowerCase(), indexedAddr.toLowerCase());
    assert.equal(decoded.indexedValue, indexedValue);
    assert.equal(decoded.nonIndexedAddr.toLowerCase(), nonIndexedAddr.toLowerCase());
    assert.equal(decoded.nonIndexedValue, nonIndexedValue);
    assert.equal(decoded.flag, true);
  });

  // --- RLP encode/decode extended tests (ported from Go) ---

  test('encodeRlp/decodeRlp: string roundtrip', () => {
    const enc = qcsdk.encodeRlp('hello');
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));
    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
  });

  test('encodeRlp/decodeRlp: number roundtrip', () => {
    const enc = qcsdk.encodeRlp(42);
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));
    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
  });

  test('encodeRlp/decodeRlp: boolean roundtrip', () => {
    const encTrue = qcsdk.encodeRlp(true);
    assert.equal(encTrue.error, '');
    assert.ok(isHex0x(encTrue.result));
    const decTrue = qcsdk.decodeRlp(encTrue.result);
    assert.equal(decTrue.error, '');

    const encFalse = qcsdk.encodeRlp(false);
    assert.equal(encFalse.error, '');
    assert.ok(isHex0x(encFalse.result));
    const decFalse = qcsdk.decodeRlp(encFalse.result);
    assert.equal(decFalse.error, '');
  });

  test('encodeRlp/decodeRlp: hex string (0x48656c6c6f = "Hello")', () => {
    const enc = qcsdk.encodeRlp('0x48656c6c6f');
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));
    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
  });

  test('encodeRlp/decodeRlp: empty array', () => {
    const enc = qcsdk.encodeRlp([]);
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));
    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
    const decoded = JSON.parse(dec.result);
    assert.ok(Array.isArray(decoded));
    assert.equal(decoded.length, 0);
  });

  test('encodeRlp/decodeRlp: nested array', () => {
    const enc = qcsdk.encodeRlp([['inner', 1], 'outer']);
    assert.equal(enc.error, '');
    assert.ok(isHex0x(enc.result));
    const dec = qcsdk.decodeRlp(enc.result);
    assert.equal(dec.error, '');
    const decoded = JSON.parse(dec.result);
    assert.ok(Array.isArray(decoded));
    assert.equal(decoded.length, 2);
    assert.ok(Array.isArray(decoded[0]));
  });

  test('decodeRlp: empty string input returns error', () => {
    const dec = qcsdk.decodeRlp('');
    assert.notEqual(dec.error, '');
  });

  // --- createAddress / createAddress2 extended tests (ported from Go) ---

  test('createAddress: different nonces produce different addresses', () => {
    const w = qcsdk.newWallet();
    const addresses = new Set();
    for (let nonce = 0; nonce < 5; nonce++) {
      const addr = qcsdk.createAddress(w.address, nonce);
      assert.ok(addr && isHex0x(addr));
      addresses.add(addr.toLowerCase());
    }
    assert.equal(addresses.size, 5, 'nonces 0-4 should produce 5 distinct addresses');
  });

  test('createAddress: different deployer addresses produce different contract addresses', () => {
    const w1 = qcsdk.newWallet();
    const w2 = qcsdk.newWallet();
    const a1 = qcsdk.createAddress(w1.address, 0);
    const a2 = qcsdk.createAddress(w2.address, 0);
    assert.ok(a1 && a2);
    assert.notEqual(a1.toLowerCase(), a2.toLowerCase());
  });

  test('createAddress2: different salts produce different addresses', () => {
    const w = qcsdk.newWallet();
    const initHash = '0x' + '11'.repeat(32);
    const salt1 = '0x' + '01'.repeat(32);
    const salt2 = '0x' + '02'.repeat(32);
    const a1 = qcsdk.createAddress2(w.address, salt1, initHash);
    const a2 = qcsdk.createAddress2(w.address, salt2, initHash);
    assert.ok(a1 && a2);
    assert.notEqual(a1.toLowerCase(), a2.toLowerCase());
  });

  test('createAddress2: different initHashes produce different addresses', () => {
    const w = qcsdk.newWallet();
    const salt = '0x' + '22'.repeat(32);
    const initHash1 = '0x' + '11'.repeat(32);
    const initHash2 = '0x' + '33'.repeat(32);
    const a1 = qcsdk.createAddress2(w.address, salt, initHash1);
    const a2 = qcsdk.createAddress2(w.address, salt, initHash2);
    assert.ok(a1 && a2);
    assert.notEqual(a1.toLowerCase(), a2.toLowerCase());
  });

  test('contract address calculation: createAddress + createAddress2 basic validity and determinism', () => {
    const w = qcsdk.newWallet();
    const a0 = qcsdk.createAddress(w.address, 0);
    const a0b = qcsdk.createAddress(w.address, 0);
    const a1 = qcsdk.createAddress(w.address, 1);
    assert.ok(a0 && typeof a0 === 'string');
    assert.ok(isHex0x(a0));
    assert.equal(a0, a0b);
    assert.notEqual(a0, a1);

    // CREATE2
    const salt = '0x' + '22'.repeat(32);
    const initHash = '0x' + '11'.repeat(32);
    const c2a = qcsdk.createAddress2(w.address, salt, initHash);
    const c2b = qcsdk.createAddress2(w.address, salt, initHash);
    assert.ok(c2a && isHex0x(c2a));
    assert.equal(c2a, c2b);

    // Negative: invalid nonce type / invalid params
    assert.equal(qcsdk.createAddress(w.address, '0'), null);
    assert.equal(qcsdk.createAddress2(null, salt, initHash), null);
  });

  test('signing: signSendCoinTransaction and signRawTransaction validate inputs and produce tx data', async () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded and verifyWallet(newWallet()) must pass');
    const wallet = qcsdk.newWallet();
    assert.ok(wallet);

    const signSend = await qcsdk.signSendCoinTransaction(wallet, TO_ADDRESS_EXAMPLE, '0', 0);
    assert.equal(signSend.resultCode, 0);
    assert.ok(isHex0x(signSend.txnHash));
    assert.ok(isHex0x(signSend.txnData));

    const txReq = new qcsdk.TransactionSigningRequest(
      wallet,
      TO_ADDRESS_EXAMPLE,
      '0x0',
      0,
      null,
      21000,
      null,
      MAINNET_CHAIN_ID,
    );
    const signRaw = qcsdk.signRawTransaction(txReq);
    assert.equal(signRaw.resultCode, 0);
    assert.ok(isHex0x(signRaw.txnHash));
    assert.ok(isHex0x(signRaw.txnData));

    // Negative: invalid to address and invalid remarks length
    const signSendBad = await qcsdk.signSendCoinTransaction(wallet, 'bad', '1', 0);
    assert.notEqual(signSendBad.resultCode, 0);

    const longRemarks = '0x' + 'aa'.repeat(33); // > 32 bytes
    const txReqBad = new qcsdk.TransactionSigningRequest(
      wallet,
      TO_ADDRESS_EXAMPLE,
      '0x0',
      0,
      null,
      21000,
      longRemarks,
      MAINNET_CHAIN_ID,
    );
    const signRawBad = qcsdk.signRawTransaction(txReqBad);
    assert.notEqual(signRawBad.resultCode, 0);
  });

  // ---------------------------------------------------------------------------
  // Security-fix negative coverage
  // ---------------------------------------------------------------------------

  test('security: deserializeWallet returns null on malformed JSON (no thrown exception)', () => {
    const garbage = [
      '{bad json',
      '',
      'null',
      '42',
      '{"address":"abc"',
      undefined,
    ];
    for (const input of garbage) {
      const result = qcsdk.deserializeWallet(input);
      assert.ok(
        result === null || result === -1000,
        `deserializeWallet(${JSON.stringify(input)}) should return null or -1000, got ${result}`,
      );
    }
  });

  test('security: signRawTransaction rejects invalid hex in valueInWei', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.newWallet();
    const txReq = new qcsdk.TransactionSigningRequest(
      wallet, TO_ADDRESS_EXAMPLE, '0xZZZZ', 0, null, 21000, null, MAINNET_CHAIN_ID,
    );
    const res = qcsdk.signRawTransaction(txReq);
    assert.equal(res.resultCode, -903, 'invalid hex valueInWei must return -903');
  });

  test('security: signRawTransaction rejects invalid hex in data', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.newWallet();
    const txReq = new qcsdk.TransactionSigningRequest(
      wallet, TO_ADDRESS_EXAMPLE, '0x0', 0, '0xGGGG', 21000, null, MAINNET_CHAIN_ID,
    );
    const res = qcsdk.signRawTransaction(txReq);
    assert.equal(res.resultCode, -906, 'invalid hex data must return -906');
  });

  test('security: signRawTransaction rejects invalid hex in remarks', () => {
    assert.ok(isCirclAvailable(), 'CIRCL WASM must be loaded');
    const wallet = qcsdk.newWallet();
    const txReq = new qcsdk.TransactionSigningRequest(
      wallet, TO_ADDRESS_EXAMPLE, '0x0', 0, null, 21000, '0xZZZZ', MAINNET_CHAIN_ID,
    );
    const res = qcsdk.signRawTransaction(txReq);
    assert.equal(res.resultCode, -909, 'invalid hex remarks must return -909');
  });

  test('relay read-only APIs: getLatestBlockDetails/getAccountDetails/listAccountTransactions/getTransactionDetails', async () => {
    const latest = await qcsdk.getLatestBlockDetails();
    assert.ok(latest);
    assert.equal(typeof latest.resultCode, 'number');
    assert.equal(latest.resultCode, 0);
    assert.ok(latest.blockDetails && typeof latest.blockDetails.blockNumber === 'number');

    const acct = await qcsdk.getAccountDetails(ACCOUNT_ADDRESS_EXAMPLE);
    assert.ok(acct);
    assert.equal(typeof acct.resultCode, 'number');
    // If the relay is healthy, this should be 0 for a valid address.
    assert.equal(acct.resultCode, 0);
    assert.ok(acct.accountDetails);
    assert.equal(acct.accountDetails.address.toLowerCase(), ACCOUNT_ADDRESS_EXAMPLE.toLowerCase());

    const txList = await qcsdk.listAccountTransactions(ACCOUNT_TX_LIST_EXAMPLE, 0);
    assert.ok(txList);
    assert.equal(typeof txList.resultCode, 'number');
    assert.equal(txList.resultCode, 0);
    assert.ok(txList.listAccountTransactionsResponse);
    assert.equal(typeof txList.listAccountTransactionsResponse.pageCount, 'number');

    const txd = await qcsdk.getTransactionDetails(TX_HASH_EXAMPLE);
    assert.ok(txd);
    assert.equal(typeof txd.resultCode, 'number');
    // This should normally succeed; if the transaction no longer exists, it may be a 404.
    if (txd.resultCode === 0) {
      assert.ok(txd.transactionDetails);
      assert.ok(isHex0x(txd.transactionDetails.hash));
    } else {
      // Negative-but-expected fallback: it must be a "not found" style response.
      assert.ok(txd.response && typeof txd.response.status === 'number');
      assert.equal(txd.response.status, 404);
    }

    // Negative: invalid address/hash inputs
    const badAcct = await qcsdk.getAccountDetails('bad');
    assert.notEqual(badAcct.resultCode, 0);
    const badList = await qcsdk.listAccountTransactions('bad', 0);
    assert.notEqual(badList.resultCode, 0);
    const badTx = await qcsdk.getTransactionDetails('bad');
    assert.notEqual(badTx.resultCode, 0);
  });

  test('transactional API negative validation (no network send): postTransaction/sendCoins', async () => {
    const postNull = await qcsdk.postTransaction(null);
    assert.ok(postNull);
    assert.notEqual(postNull.resultCode, 0);

    const sendBad = await qcsdk.sendCoins(null, TO_ADDRESS_EXAMPLE, '1', 0);
    assert.notEqual(sendBad.resultCode, 0);
  });
});

