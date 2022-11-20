// arupload.js 

// -- ARWEAVE -- 
const Arweave = require('arweave');
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

// GET WALLET PVT KEY FROM FILE
const centralWallet = JSON.parse(fs.readFileSync("arweavekey.json"));

function asyncArweaveTx() {
  const execSync = require('child_process').execSync;

  return JSON.parse(execSync("node arupload.js"));
}

(async function(msg) {
    await arweave.createTransaction({
        data: msg
    }, key);;
})();