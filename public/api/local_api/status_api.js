var tools = require('../api_tools.js');
var client = tools.psqlClient;

exports.statusPage = function(req,res){
    
    var query = client.query("SELECT * FROM statuspage WHERE id = 'status info'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var the_date = parseInt(Date.now()/1000) - 86400;
     	console.log(the_date);
     	var getBlocks = client.query("SELECT COUNT(*) AS numblocks, SUM(tx_received_bks) AS tx_received_bks, SUM(tx_received_bkc) AS tx_received_bkc, SUM(numtx) AS num_tx FROM blocks WHERE timestamp > $1",[the_date],function(errB,resultB){

     	if (errB){
         console.log(errB);
	     return res.status(400).send("Uh-oh. Unsuccessful query status blocks");
     	}
     	else{

     	var getNumTx = client.query("SELECT COUNT(*) FROM transactions WHERE chain = 'main'",function(errT,resultT){

			if (errT){
         console.log(errT);
	     return res.status(400).send("Uh-oh. Unsuccessful query status tx count");
     	}
     	else{

     		result.rows[0].info.total_tx = resultT.rows[0].count;
     		result.rows[0].num_blocks = resultB.rows[0].numblocks;
     		result.rows[0].num_tx = resultB.rows[0].num_tx;
     		result.rows[0].tx_received_bks = resultB.rows[0].tx_received_bks;
            result.rows[0].tx_received_bkc = resultB.rows[0].tx_received_bkc;
			return res.status(200).send(result.rows[0]);

     	}     		

     	});


     		
		}

     	});
         
     }
        
        
        
    });
    
    
};

exports.status_info = function(req,res){

var query = client.query("SELECT * FROM networkinfo WHERE id = 'network status'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	return res.status(200).send(result.rows[0]);

     }

 });	
};


exports.richListBKS = function(req,res){

var query = client.query("SELECT id,balance,numtx FROM address_bks ORDER BY balance DESC LIMIT 100", function(err, result){

if (err){
         console.log(err);
         return res.status(400).send("Uh-oh. Unsuccessful query richListBKS");
     }
     else{

        for (var x = 1; x < result.rows.length+1; x++){
            result.rows[x-1].rank = x;
        }
        return res.status(200).send(result.rows);

     }


});

}