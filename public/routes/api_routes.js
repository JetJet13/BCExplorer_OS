var express = require('express');
var router = express.Router();
var block = require('../api/local_api/block_api');
var tx = require('../api/local_api/transaction_api');
var address = require('../api/local_api/address_api');
var status = require('../api/local_api/status_api');
var vote = require('../api/local_api/vote_api');
var charts = require('../api/local_api/chart_api');

router.route("/hash_type/:id").get(block.hashType);
router.route("/block/:id/:page_id").get(block.blockDetails);
router.route("/moreblocktxs/:id/:page_id").get(block.moreBlockTxs);
router.route("/all_blocks/:page_id").get(block.allBlocks);
router.route("/block_latest/:id").get(block.block_latest);
router.route("/tx/:id").get(tx.getTx);
router.route("/address/:id/:page_id").get(address.getAddress);
router.route("/moretxs/:id/:page_id").get(address.getMoreTxs);
router.route('/status').get(status.statusPage);
router.route('/status_info').get(status.status_info);
router.route('/motions').get(vote.getMotions);
router.route('/motions_passed').get(vote.getSuccessMotions);
router.route('/motions_votedfor/:id/:page_id').get(vote.getVotedForMotions);
router.route('/custodians_votedfor/:id/:amount_id/:page_id').get(vote.getVotedForCustodians);
router.route('/custodians_passed').get(vote.getSuccessCustodians);
router.route('/custodians').get(vote.getCustodians);
router.route('/size_chart').get(charts.getSizeChart);
router.route('/diff_chart').get(charts.getDiffChart);
router.route('/block_chart').get(charts.getBlockChart);
router.route('/numtx_chart').get(charts.getNumTxChart);
router.route('/cd_chart').get(charts.getCDChart);
router.route('/mint_chart').get(charts.getMintChart);
router.route('/rich_list_bks').get(status.richListBKS);




module.exports = router;
