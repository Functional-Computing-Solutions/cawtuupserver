const express = require('express');
const Router = require('express-promise-router')
var Promise = require('promise');
const bodyParser = require('body-parser');
const cors = require('cors')
const crypto = require('crypto');
const pkg = require('./package.json');
const fs = require('fs');

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

// App constants
const port = process.env.PORT || 5000;
const apiPrefix = '/api';

// Create the Express app & setup middlewares
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/(127(\.\d){3}|localhost)/}));
app.options('*', cors());

// ***************************************************************************

// Configure routes
const router = new express.Router();

// Get server infos
router.get('/', (req, res) => {
  return res.send(`${pkg.description} v${pkg.version}`);
});

// ----------------------------------------------

router.post('/upload', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Missing message body' });
  }

  return new Promise(async () => {
    await arweave.createTransaction({data: req.body.message}, centralWallet).then(async (tx) => 
    {
      tx.addTag('App-Name', 'caw')
      tx.addTag('Content-Type', 'text/plain')
      tx.addTag('Version', '0.8')
      tx.addTag('Type', req.body.isRepost ? 'repost' : 'post');
      tx.addTag('UID', req.body.uid);
      if(req.body.topicValue) {
        tx.addTag('Topic', req.body.topicValue);
      }
      await arweave.transactions.sign(tx, centralWallet).then(async () => 
      {
        let uploader = await arweave.transactions.getUploader(tx);

        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        }
        return tx;
      })
    })
  });
})

// ***************************************************************************

// Add 'api` prefix to all routes
app.use(apiPrefix, router);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
