const ethers = require('ethers');

let hexValue = "0xDE0B6B3A7640000";

//Convert hex to wei
let weiValueExample = BigInt(hexValue).toString();
console.log("hex to wei example: hex:" + hexValue + ", wei: " + weiValueExample);

//Convert wei to eth
let ethValueExample = ethers.formatEther(weiValueExample);
console.log("wei to eth example: wei:" + weiValueExample + ", eth (coins): " + ethValueExample);

//Convert eth to wei
let weiValueExample2 = ethers.parseUnits(ethValueExample, "ether");
console.log("eth to wei example: eth (coins):" + ethValueExample + ", wei: " + weiValueExample2);

//Convert wei to hex
let hexValue2 =  ethers.toBeHex(weiValueExample2);
console.log("wei to hex example : hex: " + hexValue2 + ", wei: " + weiValueExample2);
