const qcsdk = require('quantum-coin-js-sdk');
const ethers = require('ethers');

//Initialize the client configuration
var clientConfigVal = new qcsdk.Config("https://t4-relayread.quantumcoin.org", "https://t4-relaywrite.quantumcoin.org", 310324, "", ""); //Testnet T4
//Testnet T4 Block Explorer: https://t4.scan.quantumcoin.org

//For mainnet, use the following configuration
//var clientConfigVal = new qcsdk.Config("https://relayread.quantumcoin.org", "https://relaywrite.quantumcoin.org", 123123, "", ""); //Mainnet
//Mainnet Block Explorer: https://scan.quantumcoin.org


//Conversion examples
let hexValue = "0x56BC75E2D63100000";
let weiValueExample = BigInt(hexValue).toString(); //convert hex to wei
console.log("hex to wei example: hex:" + hexValue + ", wei: " + weiValueExample);

let ethValueExample = ethers.formatEther(weiValueExample); //convert wei to eth
console.log("wei to eth example: wei:" + weiValueExample + ", eth (coins): " + ethValueExample);

let weiValueExample2 = ethers.parseUnits(ethValueExample, "ether"); //convert eth to wei
console.log("eth to wei example: eth (coins):" + ethValueExample + ", wei: " + weiValueExample2);

//Initialize the SDK
qcsdk.initialize(clientConfigVal).then((initResult) => {
    if (initResult === false) {
        console.error("Initialize failed");
        return;
    }
    console.log("Initialize succeeded");  

    //Get the account details
    let address = "0x0000000000000000000000000000000000000000000000000000000000001000"; //Just an example address https://t4.scan.quantumcoin.org/account/0x0000000000000000000000000000000000000000000000000000000000001000

    console.log("getAccountDetails " + address);
    qcsdk.getAccountDetails(address).then((accountDetailsResult) => {
        if (accountDetailsResult === null) {
            console.error("getAccountDetails failed : accountDetailsResult is null");
            return;
        }

        if (accountDetailsResult.resultCode !== 0) {
            console.log("getAccountDetails failed. resultCode is " + accountDetailsResult.resultCode);
            return;
        }

        if (accountDetailsResult.accountDetails === null) {
            console.error("getAccountDetails failed : accountDetails is null");
            return;
        }

        console.log("getAccountDetails succeeded:");

        console.log("     address: " + accountDetailsResult.accountDetails.address);

        console.log("     balance (wei): " + accountDetailsResult.accountDetails.balance);
        var etherValue = ethers.formatEther(accountDetailsResult.accountDetails.balance)
        console.log("     balance coins (ether): " + etherValue);

        console.log("     nonce: " + accountDetailsResult.accountDetails.nonce);

        console.log("     as of blockNumber: " + accountDetailsResult.accountDetails.blockNumber);
    });

    //Get the transaction details
    let txnHash = "0x710cc145eea254c3db9857b42f0b576f4159ac48a23bfc0c480c341e90a40376"; //Just an example transaction hash https://t4.scan.quantumcoin.org/txn/0x710cc145eea254c3db9857b42f0b576f4159ac48a23bfc0c480c341e90a40376

    console.log("getTransactionDetails " + txnHash);
    qcsdk.getTransactionDetails(txnHash).then((transactionDetailsResult) => {
        if (transactionDetailsResult === null) {
            console.error("getTransactionDetails failed : transactionDetailsResult is null");
            return;
        }

        if (transactionDetailsResult.resultCode !== 0) {
            console.log("getTransactionDetails failed. resultCode is " + transactionDetailsResult.resultCode);
            if (transactionDetailsResult.response !== null && transactionDetailsResult.response.status === 404) {
                console.log("this transaction does not exist or has been discarded");
            }
            return;
        }

        if (transactionDetailsResult.transactionDetails === null) {
            console.error("getTransactionDetails failed : transactionDetails is null");
            return;
        }

        console.log("     blockHash " + transactionDetailsResult.transactionDetails.blockHash);
        console.log("     blockNumber " + transactionDetailsResult.transactionDetails.blockNumber);
        console.log("     from " + transactionDetailsResult.transactionDetails.from);
        console.log("     gas " + transactionDetailsResult.transactionDetails.gas);
        console.log("     gasPrice " + transactionDetailsResult.transactionDetails.gasPrice);
        console.log("     hash " + transactionDetailsResult.transactionDetails.hash);
        console.log("     input " + transactionDetailsResult.transactionDetails.input);
        console.log("     nonce " + transactionDetailsResult.transactionDetails.nonce);
        console.log("     to " + transactionDetailsResult.transactionDetails.to);
        console.log("     value " + transactionDetailsResult.transactionDetails.value);

        if (transactionDetailsResult.transactionDetails.receipt === null) {
            console.log("transaction receipt is null. This indiciates the transaction is not yet registered in the blockchain. This transaction may be pending.")
        } else {
            console.log("          cumulativeGasUsed " + transactionDetailsResult.transactionDetails.receipt.cumulativeGasUsed);
            console.log("          effectiveGasPrice " + transactionDetailsResult.transactionDetails.receipt.effectiveGasPrice);
            console.log("          gasUsed " + transactionDetailsResult.transactionDetails.receipt.gasUsed);
            console.log("          hash " + transactionDetailsResult.transactionDetails.receipt.hash);
            console.log("          type " + transactionDetailsResult.transactionDetails.receipt.type);
            console.log("          status " + transactionDetailsResult.transactionDetails.receipt.status);

            if (transactionDetailsResult.transactionDetails.receipt.status === "0x1") {
                console.log("          Transaction has succeeded!!!");
            } else {
                console.log("          Transaction has failed!!!");
            }           
       }
    });


    //Get the latest block details
    console.log("getLatestBlockDetails");
    qcsdk.getLatestBlockDetails(address).then((latestBlockDetailsResult) => {
        if (latestBlockDetailsResult === null) {
            console.error("     getLatestBlockDetails failed : latestBlockDetailsResult is null");
            return;
        }

        if (latestBlockDetailsResult.resultCode !== 0) {
            console.log("     getLatestBlockDetails failed. resultCode is " + latestBlockDetailsResult.resultCode);
            return;
        }

        if (latestBlockDetailsResult.blockDetails === null) {
            console.error("     getLatestBlockDetails failed : blockDetails is null");
            return;
        }

        console.log("     getLatestBlockDetails succeeded:");
        console.log("     latest block number: " + latestBlockDetailsResult.blockDetails.blockNumber);
    });


    //Create a new wallet
    var wallet1 = qcsdk.newWallet();
    if (wallet1 === null) {
        console.log("creating a new wallet failed");
        return;
    }
    console.log("New wallet address is: " + wallet1.address);

    //Serialize wallet to a string (You should encrypt the string before saving it to disk or a database.)
    var walletJson = qcsdk.serializeWallet(wallet1);
    if (walletJson === null) {
        console.log("serializeWallet failed");
        return;
    }

    //Deserialzie a wallet from the serialized wallet
    var wallet2 = qcsdk.deserializeWallet(walletJson);
    console.log("Deserialized wallet address is: " + wallet2.address);

    //Validate that a wallet address is correct
    console.log("isAddressValid (expected true)" + qcsdk.isAddressValid(wallet1.address)); //should print true
    console.log("isAddressValid (expected false)" + qcsdk.isAddressValid("asfasdfasdfs")); //should print false

    //Send coins
    //First get account details nonce
    console.log("sendCoins getAccountDetails " + address);
    qcsdk.getAccountDetails(address).then((accountDetailsResult) => {
        if (accountDetailsResult === null) {
            console.error("     sendCoins getAccountDetails failed : accountDetailsResult is null");
            return;
        }

        if (accountDetailsResult.resultCode !== 0) {
            console.log("     sendCoins getAccountDetails failed. resultCode is " + accountDetailsResult.resultCode);
            return;
        }

        if (accountDetailsResult.accountDetails === null) {
            console.error("     sendCoins getAccountDetails failed : accountDetails is null");
            return;
        }

        var toAddress = "0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612";
        var nonce = accountDetailsResult.accountDetails.nonce;
        var coins = "10"; //in ethers and not in wei

        console.log("Sending coins (wei) " + coins);
        qcsdk.sendCoins(wallet2, toAddress, coins, nonce).then((sendResult) => { //carefully manage state of nonce when retrying on errors
            if (sendResult === null) {
                console.error("     sendCoins failed : sendResult is null");
                return;
            }

            if (sendResult.resultCode !== 0) {
                console.log("     sendCoins failed. resultCode is " + sendResult.resultCode);
                if (sendResult.response !== null) {
                    console.log("     sendCoin response statusText " + JSON.stringify(sendResult.response.statusText));
                    console.log("     ensure account has adequate gas and nonce is correct");
                }
                return;
            }

            console.log("     sendCoin succeeded. This does not necessarily mean that the transaction has succeded. txnHash " + sendResult.txnHash);
        });
    });

    //List transactions of an account
    address = "0x0000000000000000000000000000000000000000000000000000000000002000";
    let pageNumber = 0; //zero is default for latest page
    qcsdk.listAccountTransactions(address, pageNumber).then((accountTransactionsResult) => {
        if (accountTransactionsResult === null) {
            console.error("     listAccountTransactions failed : accountTransactionsResult is null");
            return;
        }

        if (accountTransactionsResult.resultCode !== 0) {
            console.log("       listAccountTransactions failed. resultCode is " + accountTransactionsResult.resultCode);
            console.log(accountTransactionsResult.response.status);
            return;
        }

        if (accountTransactionsResult.listAccountTransactionsResponse === null) {
            console.error("      listAccountTransactions failed : listAccountTransactionsResponse is null");
            return;
        }

        if (accountTransactionsResult.listAccountTransactionsResponse.pageCount === null) {
            console.error("      listAccountTransactions failed : pageCount is null");
            return;
        }

        if (accountTransactionsResult.listAccountTransactionsResponse.items === null) {
            console.error("      listAccountTransactions : items is null, no items to list");
            return;
        }

        let txnList = accountTransactionsResult.listAccountTransactionsResponse.items;

        console.log("     Account address: " + address);
        console.log("     Page Count: " + accountTransactionsResult.listAccountTransactionsResponse.pageCount);
        console.log("     Number of transactions returned: " + txnList.length);
        for (const txn of txnList) {
            console.log("     Transaction Hash: " + txn.hash);
            console.log("          From Address: " + txn.from);
            console.log("          To Address: " + txn.to);

            let weiValueExample = BigInt(txn.value).toString(); //value is in hex. convert hex to wei
            let ethValueExample = ethers.formatEther(weiValueExample); //convert wei to eth
            console.log("          Value (hex): " + txn.value + " , (wei): " + weiValueExample + " , coins (eth): " + ethValueExample);            

            console.log("          Status: " + txn.status);
            console.log("          Block Number: " + txn.blockNumber);
        }
    });

    //Offline sign a transaction from existing wallet. This is typically called from an offline device hosting a cold storage wallet
    let walletJsonExample = '{"address":"0xAB035828c5A9d240bB97c6136E4299150829c8dEa12908E85351e9dF6C379BB7","privateKey":"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","publicKey":"JEZUcaBrekkaFJIwX1H6/K6N+WNj3LOx8TVp5lWwgmb4qWncGvmGR762gNZFjp/xuTDjlC6drc4mG4+maUoqn8rGRr36EBvc8xxyRn10xklfxWDKNWf8pBcPvnLYy8H5SeA0LCsVJQemSun8WDYvk4fTFOglPvUuf2JvIYc1fBynVnGIuNI1wZ4I+7H/iSIPtsodSsBz3o79eLL2KKsiKHumU8cIx0iEYh3pBZqcQHe3oTywDHbA+sIGwpiqsw3MmTtIgELU2TNuYIMzIPsEzdEwBlh+oBZzDU0NkTe8Ll9MHB73baIAbzd4sSgLJd7yPCJOV0K2IiJygtZ5fYyGKFFt4OX4+WwO0oCihyHjigD8J3+XBZlCxzYi4VO3J/QGxf9+ITVKkwnoHhqXaw7bp3QhyFcfQLZXXOZ9e8sLGoBEQ/VU1CHrpe7VMuUA4BTO5/Ccv538PttQVxCGHpkNFNGk0Z8oZDRN7/genNi2QIM5uM07i0EsvOiw+iSJH+x615E+Ff8kyMxUA2zrDtyVVzbyOQyb8IkKxAI9RNqE4kpLCYaKCptPSueuUZX9JzI1aK4RM88zYIdJiquqdjgzlVAxfvHne9LCJp+NUECp0nuq0D6IJIg1oaYu7nXOVrImAm1XGMSQXxzdp9FbNkD4Hzxlm0ih/zbIw8pVI4RqtJrNf6Qeqbf6jeRvfzq9zUwm9mfeWZmLnnPyAG0XkJPKYGMAGbbWTL2uxm2zFSoSDR0zNLENi6xwaq5f8eQa+xYXF5rYxAchr83SHC6KUN+MX+IpLaRXjVxR7y6G+PUpVPaitUpIvLiHXzPdqTCQ7+xHkgcMo10CSGJjB+4HdEY3a7HPe/vqwFlPmRnr7CxXMHhLepmg71u1seI4fV69fHqsnfeKmdzL8XiB+djmUIZD/EXgoAx2rWhFt4a/csS/+w7owsE+QpWyYaDQidll7PDNuiYl8DyftuBUbDZ7BVwGb6vYGs7r8h6/iALRBoVdqGzb05OaFkZwUoAQBGBNKJgPRkfU6DNRpH4XIpcFgutE4aMWwk6sDpAri90fNgSgubFvZWPrztCTgQOgNdhbUlP2+jKC184Jsc3Sz62j+dGNk2muC/H0frCEGUYJetU2LfJ7mPI9gWbYWzFhXFWv2L4qOU6butU6X4hMDKScdcdPMniM1amn6JdF4rWTXNr4EkvXMh3NxFh60KHRFINMUljNtSsywg7+wVBYXHcShzR7ZnpF591QCwyJI5zuz/Fh9T7ucNsWWUIM9qeEeSu1wB/ZlyL7hQR2mKv9Axv1m4bPQsVzkldaIhVhToFr3NYANSVOGrYPwp0xtwZ1HeUQwD/Pj29uUXqb2acU80JqpsNtw5Ir1EtinKXpJ3lQec6jn+p2nFk3MlNPKw90cLRHg6QmllYVP4O+4ekNnvAVgNNs29Otf1Rh+3qfAKCSZdFged3fXgvTFigQD5tE+AFg9GNIkfnrZfq8G29OWKvbOlqNmogKOHQSHpcUODPiv/DwpbA9O04hCHoCIINZ0b8PxZNXaC/6+e2B6AkBMCnl9TZic4bNo+vs63ydTiuvJMSpWkbt2lnrJ7iKpiSAJ17ZBsXyZQCZ1+Zwe+HEBrA0hW02xVqy+dm3D0d1fnF5D+LdaUrH6UgaUy1bYI4KVq+LTOk2dC4nKkhVlYdG2JLtu16Olq/mpbLY/WeS3svKchXo69oq4lTogVxmc5DCl2gMHqVdK+v/4A7ObhCMftGKSD9BxXurBIhP5CQlYsEVO1tOagm0p7DcAI1O5QeKOCXgL1IrwNuW5gkuRM1MUyvKwnIl8FDBOVvzZRKfBSwAum4CEn6T+ja064ldZDigVACIWl9P9m9zmLXblWcZCi9e8ym+dg=="}';
    let walletExample = qcsdk.deserializeWallet(walletJsonExample);

    var toAddressExample = "0x8293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612";
    var nonceExample = 0;
    var coinsExample = "10"; //in ethers and not in wei
        
    qcsdk.signSendCoinTransaction(walletExample, toAddressExample, coinsExample, nonceExample).then((signResult) => {
        console.log("signSendCoinTransaction resultCode: " + signResult.resultCode);
        console.log("signSendCoinTransaction hash: " + signResult.txnHash);
        console.log("signSendCoinTransaction txnData: " + signResult.txnData); //txnData is to be sent to postTransaction
    });

    //Post a transaction that was signed offline (output of signSendCoinTransaction)
    let txnData = '0x00f90fbb8304bc348082520801a08293cd9b6ac502d2fe077b0c157dad39f36a5e546525b053151dced633634612888ac7230489e800008080c001b9058024465471a06b7a491a1492305f51fafcae8df96363dcb3b1f13569e655b08266f8a969dc1af98647beb680d6458e9ff1b930e3942e9dadce261b8fa6694a2a9fcac646bdfa101bdcf31c72467d74c6495fc560ca3567fca4170fbe72d8cbc1f949e0342c2b152507a64ae9fc58362f9387d314e8253ef52e7f626f2187357c1ca7567188b8d235c19e08fbb1ff89220fb6ca1d4ac073de8efd78b2f628ab22287ba653c708c74884621de9059a9c4077b7a13cb00c76c0fac206c298aab30dcc993b488042d4d9336e60833320fb04cdd13006587ea016730d4d0d9137bc2e5f4c1c1ef76da2006f3778b1280b25def23c224e5742b622227282d6797d8c8628516de0e5f8f96c0ed280a28721e38a00fc277f97059942c73622e153b727f406c5ff7e21354a9309e81e1a976b0edba77421c8571f40b6575ce67d7bcb0b1a804443f554d421eba5eed532e500e014cee7f09cbf9dfc3edb505710861e990d14d1a4d19f2864344deff81e9cd8b6408339b8cd3b8b412cbce8b0fa24891fec7ad7913e15ff24c8cc54036ceb0edc955736f2390c9bf0890ac4023d44da84e24a4b09868a0a9b4f4ae7ae5195fd27323568ae1133cf336087498aabaa7638339550317ef1e77bd2c2269f8d5040a9d27baad03e88248835a1a62eee75ce56b226026d5718c4905f1cdda7d15b3640f81f3c659b48a1ff36c8c3ca5523846ab49acd7fa41ea9b7fa8de46f7f3abdcd4c26f667de59998b9e73f2006d179093ca60630019b6d64cbdaec66db3152a120d1d3334b10d8bac706aae5ff1e41afb1617179ad8c40721afcdd21c2e8a50df8c5fe2292da4578d5c51ef2e86f8f52954f6a2b54a48bcb8875f33dda93090efec4792070ca35d0248626307ee077446376bb1cf7bfbeac0594f9919ebec2c5730784b7a99a0ef5bb5b1e2387d5ebd7c7aac9df78a99dccbf17881f9d8e6508643fc45e0a00c76ad6845b786bf72c4bffb0ee8c2c13e4295b261a0d089d965ecf0cdba2625f03c9fb6e0546c367b055c066fabd81aceebf21ebf8802d106855da86cdbd3939a16467052801004604d28980f4647d4e83351a47e1722970582eb44e1a316c24eac0e902b8bdd1f3604a0b9b16f6563ebced0938103a035d85b5253f6fa3282d7ce09b1cdd2cfada3f9d18d9369ae0bf1f47eb0841946097ad5362df27b98f23d8166d85b31615c55afd8be2a394e9bbad53a5f884c0ca49c75c74f32788cd5a9a7e89745e2b5935cdaf8124bd7321dcdc4587ad0a1d114834c5258cdb52b32c20efec150585c771287347b667a45e7dd500b0c89239ceecff161f53eee70db1659420cf6a784792bb5c01fd99722fb85047698abfd031bf59b86cf42c57392575a2215614e816bdcd60035254e1ab60fc29d31b706751de510c03fcf8f6f6e517a9bd9a714f3426aa6c36dc3922bd44b629ca5e927795079cea39fea769c593732534f2b0f7470b44783a4269656153f83bee1e90d9ef01580d36cdbd3ad7f5461fb7a9f00a09265d16079dddf5e0bd31628100f9b44f80160f4634891f9eb65fabc1b6f4e58abdb3a5a8d9a880a3874121e97143833e2bff0f0a5b03d3b4e21087a02208359d1bf0fc59357682ffaf9ed81e809013029e5f536627386cda3ebeceb7c9d4e2baf24c4a95a46edda59eb27b88aa62480275ed906c5f2650099d7e6707be1c406b034856d36c55ab2f9d9b70f47757e71790fe2dd694ac7e9481a532d5b608e0a56af8b4ce936742e272a4855958746d892edbb5e8e96afe6a5b2d8fd6792decbca7215e8ebda2ae254e8815c667390c297680c1ea55d2bebffe00ece6e108c7ed18a483f41c57bab04884fe4242562c1153b5b4e6a09b4a7b0dc008d4ee5078a3825e02f522bc0db96e6092e44cd4c532bcac27225f050c1395bf365129f052c00ba6e02127e93fa36b4eb895d6438a05400885a5f4ff66f7398b5db9567190a2f5ef329be76b909fe01202412c7a8a885c2f8630f91f10e64e6d2b76d72ee9c5384299c0996a6d42d98897de70ca4c2d10a399a9934fb08cb82642facf4d4e0dcd1c704400d72107fb603d844cad149577da3660bc6c70176cf1e737d475e200aa200e92f9c10fb09e1a0dcfb201c5d09492f1f22724c4611eda9b9888ddaf7d30a8d830229c34c3c80c33ce4bb95d99dcd3caaa8b398de0bb2f8d21096ef4950a0733c285943bc210043a0b42f6259c65f8bc558c0e6befc76fb5a986339911d58b14a18d8303275996944dc5f4035177b7fa826c1a4d3fa4dacaef89f10f8e55f05a912b1b6ce22b021dc2d4ad59c0fab7340f47a40dc2c39b07477925939cad57ad21dbce761bda1fb6c70f15621c9fb1e90e5a8552d43f9d9998bb7add63015e648b3d3c92ca1f097503d8406d974a49e4d7a070816c5bf965a18721fb8a001fecd5a77d2f07fab9398d4aae40294d6fd6631ce2b45848bb7adfc2a4efa60c848ae9ba8517e06cf5e5f3bfdc512c1e2b747ff7e94856db6e9a70c3aa98666ac7f5694b97561d10c192d28d679ea6916f94b2219925a8e16b753a66cc8d814ce2b7e3d06977951df8f59932bb9b976fdf8a33e92bb53f827347ffcbd912c50556467cbe9ff01ccba26c94a50e58c485edd7db5be95a2ad4335023d3b914337cbdb9a477b1c01025a44e0c3efb71368f90824c026346046ede03c90d21ab2ce636d0a93d7b8e76201f355946b05c30af17ad9770100f5994072de23f95009f6aaf5ae47aef2ccc4f754d54cdf3a1b8b7861ccb6bf76b2943fb729f58216e235e6440caad27c481ce397aa249575fb66ed38f742967551bf05e4876310612a112117282303bb539675757e9b9da6513890dffda231c93f84dc6980a93d4304c09a81b14701e40c21fecfd19ea69399372f634b6750dd4deee2eea2812745c47ba38ec7edea3a211fbeab29c3932f37ccb639b7aa79e011fcaff5a2310cc038cd58a5e24eed507104b6c90f87db1c8db6df2adfcb4a9f051109f7c1c31fec403b367e5b4990537517d343dc5a3fc3fd5061dfd0dd0032ffd937e4fd384105861306a7426bf2298ba7ecb7eee46cba8553377e3e6654e6ca66df1f1fa1823e03490d23fbbf3986b078cb5d6ce7227318f257972f1a81db2b401ded74603e51bc968cdcbede1baa89389e8e38d1ab379bb2f94e8a463889c502ab4d0b622c6f86265d1bd9a5d1b08c6a201a2859ecbf7a9414992273137d3370ed79274faf7d954c725aaf1632a1a5509147a54c6bcf7adc11848936e6b5e3e9aa367e924d03af4afb030dfe909df2670d37d8dc666d5cd6bae496137a90b07992f95519254dc47ba625d48a6d0d6af3ac2c29303260d9cc05821684e396a9e91046aa295bd8e25fbe09c25bb3339e83b41d796e339300952f1525404e61b14965c6bfd621eaaae713522482542da88b1c1d8af90979ae7668c052b74b35d0e7ebfce5f3b916ebfad838e9539e435eb5505aa119b34e61230557b8a4a501179e17640694b23a2caa09fb5526c8f8fc3c11ef333725c4d0310a3da932b91feb7e0c4284d4f4f5ff5e7c0a4fa5a18c2f1bd964ed3096375a21b3edab9f5c54e02387cdc2ad9894c8a3f4666b2d429ee46f8078529dc7af5ff3518d5e75d12c7f91cd7d7865e260ef33621c7a2c410821c81b1dd701cf4205d64a77bc77d5e715bb4554d465b2a1c03be9cc47fdcce0ce67ca8952ec5b0c7afb811931edd64e51bde041f220144b6d7bb06755a265d63314670bd262bc8dd9b806a35a059471f9fb50c97e2d4efefc3db51c4b31c279fa59b3377c32029be252c37f3eecf207545e5436cba14c4e4f5166dd6e7108b4c2c7ddb13e1f878888f4cfe9a921967ae2c732a9e317f417d5b4b5609d86f5bf685ae399ecedcef3acd1e81ec36a9638091f9ec3df3be493f71c27e2622d93cc4831a6898eb7542345f0bf23132e43bd80924e82df8ab0bc5113c61bf2c04c1ab142affa2ffd4eeda42e91f924852ff2b6606ec9d254ead8de534a90cc665e7ed6e457688f1c40a47ea690ab3974e280a74f696edad9f04c944ef664e453934faad8afff5f47d87a5b399d18f33de4288c7a3681980aaf92f34c9fdcac30c5a86801b9d04c6bb7482d351f8571d18d19991f63254b8f85ac8c9ea348a8afd5cda4c86d00aca6f482bb2bd616a20cbdd9d887a40baa32ebc44df867ab92a843da463ccfa5a7faa1222baafba19cfac9c50811eca087d5dbc2b895197420ba6874886270fe2c26d3f251f5bbf4a63c88ff7d9990439f573412eb2482a2099faf19d31ae0450081983390a1e1a73aad06e2913b52fc92388a995305e1b076a6057eadd4853a8f2b14075d27866c6fba28112791d8b5a42a8c5505cbe901eb1faeb72e0fb0f4de35d8e8cd0f5cf532368d4a49807ff9a80fff1a0dfbc5905b9636d3525c05200a2ca8bedcba9089534ac3e20575812f6d0a994ed4785d80daba4bb5bc48bd23928f37b955a951afb44730c829cc078ef2f878f371851fd67ba8884849d176f37390c6b3bc9990c260a706d40bb51e85514662fc77688a341fea074374c757ce4c67a0c069942935b31cb822c4df7d95c5589e6edeeb7830243175a0782ce2a5e31784a3acd60967384f76d991c53fbbdf98cd6cc8c52b76271077de9417d26b706b89db5f82abb33d61f39d83ee773698b77a7052555aad4f581bfbd7ce467229e4b0107d6c90961dffff4130c3baa5647c7115ba6060e4ccd3b7564ed7b859a2e288d41f63d259ac8a04e221a8102dad00d1cd4cc199875f4aafb11bb0a93479af32734a4a9dab9c78a319eed69e6b6229f201576c9a91e4aa4398499de51a7ecf6e54ec0eea3183adcd92ec657ab4a5e417944aaddd13df019ef419c74f9a9c7b39570e70eb289fd09f3c940b306e98f61643d66a9fc2d444c4d3b592e15ffe297e02ae8d50e3696933604a43b8fda8974d3558220b8626c17b65b46ef9b476f025612b194638387115812ecbdf62da668b28e04f71771ecb17a467e1db8cf2f700b7ed16f96f7d6bfdf586e217f7bdea69b33f3a3abb3d4c5d74088479544ca94ffff9c8b06a4d1d85a51bbcb6869726f180a3dc387633f0133fe56d409e6a65f51f887636db36a7892b42f755b734686ba9de501e19059d495fbb26826d0a4af1728e29c2d368da0f7a335c016d5045722d2eb1ecb6ebc0dd09606b7fb3998d828437982300a145d12b541ed0ccb1156e260cf94be043b1548c729bd3c0d2318a9bf0694709d93825fd00b988241ec284d1a7aa8008fd064669599781fb49a4936652658844d7f374fb9ebadd3153e8bc379c41774b985790bfa295ee47d4d04eff00cc623775bb42b32404597533ca28185b1fb5f0f39757081517188b0f2a2b4047485f8187b3bbcad0e7eff52d50567b8fb0cad5e2eefbfd2d435a7b7d9dacb4bdbec5d6e6f0002a4447484d5968829198b5b7d3dbe4fa000000000000000000000000000000000000000000101c2a3b46254236b647c19702639f4f6880a542bf7e06b3245ff77ef0c90a7cbb9e5b7c445bb99f059fa5db48bde3af7fef4da6ed6679417af85b683f859f9b4440a269061e5bddd3e3ee41';
    qcsdk.postTransaction(txnData).then((sendResult) => {
        if (sendResult === null) {
            console.error("     postTransaction failed : sendResult is null");
            return;
        }

        if (sendResult.resultCode !== 0) {
            console.log("     postTransaction failed. resultCode is " + sendResult.resultCode);
            if (sendResult.response !== null) {
                console.log("     postTransaction response statusText " + JSON.stringify(sendResult.response.statusText));
                console.log("     postTransaction ensure account has adequate gas and nonce is correct");
            }
            return;
        }

        console.log("     postTransaction succeeded. This does not necessarily mean that the transaction has succeded. txnHash " + sendResult.txnHash);
    });
});

