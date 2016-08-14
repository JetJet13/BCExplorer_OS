var tools = require("../api_tools.js");
var client = tools.psqlClient;
var bc_client = tools.bitcoinClient;

exports.status = function(req,res){

    var query = client.query("SELECT * FROM statuspage WHERE id = 'status info'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var getNumTx = client.query("SELECT COUNT(*) FROM transactions WHERE chain = 'main'",function(errT,resultT){

			if (errT){
         
	     			return res.status(400).send("Uh-oh. Unsuccessful query status tx count");
     	}
     	else{
			
			result.rows[0].info.difficulty = result.rows[0].info.difficulty.toString();
			result.rows[0].info.connections = result.rows[0].info.connections.toString();
			result.rows[0].info.height = result.rows[0].info.blocks.toString();
			result.rows[0].info.bks_supply = result.rows[0].info.moneysupply.toString();
			result.rows[0].info.bkc_supply = "0";
			result.rows[0].info.pos_blocks = (result.rows[0].info.blocks - 401).toString();
			result.rows[0].info.pow_blocks = "401";
     		result.rows[0].info.total_tx = resultT.rows[0].count;

    		delete result.rows[0].info.ip;
    		delete result.rows[0].info.blocks;
    		delete result.rows[0].info.proxy;
    		delete result.rows[0].info.stake;
    		delete result.rows[0].info.errors;
    		delete result.rows[0].info.parked;
    		delete result.rows[0].info.balance;
    		delete result.rows[0].info.newmint;
    		delete result.rows[0].info.testnet;
    		delete result.rows[0].info.version;
    		delete result.rows[0].info.paytxfee;
    		delete result.rows[0].info.walletunit;
    		delete result.rows[0].info.keypoolsize;
    		delete result.rows[0].info.keypoololdest;
    		delete result.rows[0].info.walletversion;
    		delete result.rows[0].info.protocolversion;
    		delete result.rows[0].info.moneysupply;
			
			return res.status(200).send(result.rows[0].info);

     	}     		

     	});


     		
	


         
     }
        
        
        
    });
};

