var langJson = "";

async function initApp() {
    var langJsonString = await ReadFile("./json/en-us.json");
    if (langJsonString == null) {
        alert("Error ocurred reading lang json.");
        return;
    }

    langJson = JSON.parse(langJsonString);
    if (langJson == null) {
        alert("Error ocurred parsing json.");
        return;
    }
}

async function saveQuantumWallet(walletJson) {
    var isoStr = new Date().toISOString();
    isoStr = isoStr.replaceAll(":", "-");
    var addr = currentWallet.address.toLowerCase()
    if (addr.startsWith("0x") == true) {
        addr = addr.substring(2, addr.length)
    }
    var filename = "UTC--" + isoStr + "--" + addr + ".wallet"
    var mimetype = 'text/javascript'
    saveFile(walletJson, mimetype, filename)
    return filename
}

function saveFile(content, mimeType, filename) {
    const a = document.createElement('a');
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
}
