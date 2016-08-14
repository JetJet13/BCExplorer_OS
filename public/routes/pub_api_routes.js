var express = require('express');
var Router = express.Router();
var block = require('../api/public_api/block.api.js');
var tx = require('../api/public_api/tx.api.js');
var address = require('../api/public_api/address.api.js');
var vote = require('../api/public_api/vote.api.js');
var status = require('../api/public_api/status.api.js');

Router.route("/block/:id").get(block.singleBlock);
Router.route("/latestblocks/:id").get(block.latestBlocks);
Router.route("/tx/:id").get(tx.singleTx);
Router.route("/blocktx/:id").get(tx.blockTx);
Router.route("/sendrawtx/").post(tx.sendRawTransaction);
Router.route("/address/:id").get(address.addressInfo);
Router.route("/addresstxs/:id/:howmany").get(address.addresstxs);
Router.route("/unspent/:id").get(address.unspent);

Router.route('/motion/:id').get(vote.singleMotion);
Router.route('/allmotions').get(vote.allMotions);
Router.route('/allsuccessmotions').get(vote.allSuccessMotions);

Router.route('/custodian/:id/:amount').get(vote.singleCustodian);
Router.route('/allcustodians').get(vote.allCustodians);
Router.route('/allsuccesscustodians').get(vote.allSuccessCustodians);

Router.route('/status').get(status.status);

Router.route('/*').get(function(req,res){
	res.status(400).send("The API your trying to reach doesn't exist");
});
module.exports = Router;