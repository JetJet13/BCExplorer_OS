var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;

exports.blockDetails = function(req,res){ 

    //SECURITY CYCLE
    var id = req.params.id;
    var id_length = id.length;
    var page_id = req.params.page_id;
    var sql_block = "";
    var sql_tx = "";
    console.log(id,id_length);
    
    if (isNumeric(page_id) === false){
        console.log("page id is not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isAlphaNumeric(id) === false || id_length > 64){
        console.log("id is not alphanumeric or id_length > 64");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isAlphaNumeric(id) && id_length <= 64){
        if (id_length < 64){
            //it might be a height
            if (isNumeric(id) === false){ // its not a height
                console.log("id is not numeric/not a height or hash.");
                return res.status(400).send("Uh-oh, bad id request");
            }
            else{                       // it is a height
                id = parseInt(id);
                sql_block = "SELECT * FROM blocks WHERE height = $1";
                sql_tx = "SELECT * FROM transactions WHERE height = $1 ORDER BY tx_num ASC LIMIT 15";
            }
        
            
        }
        else{ // isAlphaNumeric and id_length = 64
            sql_block = "SELECT * FROM blocks WHERE id = $1";
            sql_tx = "SELECT * FROM transactions WHERE blockhash = $1 ORDER BY tx_num ASC LIMIT 15";
        }
        
        //the route params are clean
        var query = client.query(sql_block, [id], function(err, result) {
             if (err){
                 console.log(err);
                 return res.status(400).send("Uh-oh. Unsuccessful query block by height");

             }
             else if (result.rowCount === 0){
                 console.log("id returned no results");
                return res.status(400).send("Uh-oh, bad id request");
             }
             else{

              var tx_query = client.query(sql_tx, [id], function(errTx, resultTx){

             if (errTx || resultTx.rowCount === 0){
                 console.log(errTx);
                 return res.status(400).send("Uh-oh. Unsuccessful query transaction block_api");
             }
             else{
		console.log(resultTx.rows[0].inputs);
                var getHeight = client.query("SELECT * FROM networkinfo WHERE id = 'network status'", function(errH,resultH){

                    if (errH){
                 console.log(err);
                 return res.status(400).send("Uh-oh. Unsuccessful query transaction block_api");
                }
                
                bc_client.cmd('getblockhash', parseInt(result.rows[0].height) + 1, function(err, nxtHash, resHeaders){
                            if (err){
                                    console.log(err)
                                    nxtHash = "";
      
                            };

        
                    
                var resu = result.rows[0];
                var resu_tx = resultTx.rows;
                var resu_tx_count = resultTx.rowCount;

               // for (var f = 0;f < resu_tx_count;f++){
                    //var t = resu_tx[f]["inputs"];
                    //var s = resu_tx[f]["outputs"];
                    //resu_tx[f]["inputs"] = convertJSONarray(t);
                    //resu_tx[f]["outputs"] = convertJSONarray(s);

                //}

                var bType = resu["type"];

                if (bType === "proof-of-work"){

                    var reward = resu_tx[0].out_total;
                }
                else{ //proof-of-stake

                    var reward = resu_tx[1].out_total - resu_tx[1].in_total;

                }
                resu.nexthash = nxtHash;
                resu.conf = resultH.rows[0].height - resu.height + 1;
                console.log(resu.conf);
                return res.status(200).send({"block_data": resu, "tx_data": resu_tx, "reward": reward});

                    });
                }); 

             } 	

              });
             }      

          });

    }
 };

exports.block_latest = function(req,res){

var howMany = req.params.id;

    if (isNumeric(howMany) === false){
        console.log("howMany is not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ // route params are clean
        howMany = parseInt(howMany);

        var query = client.query("SELECT MAX(height) FROM blocks", function(errH, resultH) {
             if (errH){
                 console.log(errH);
                 return res.status(400).send("Uh-oh. Unsuccessful query block_latest by networkinfo");
             }
             else{
                 var height = resultH.rows[0].max - howMany;
                 var getBlocks = client.query("SELECT height, timestamp, size, numtx, solvedby, tx_received_bks, tx_received_bkc FROM blocks WHERE height >= $1 ORDER BY height ASC",[height],function(errB,resultB){

                     if (errB){
                 console.log(errB);
                 return res.status(400).send("Uh-oh. Unsuccessful query block_latest by blocks");
             }
             else{
			if (resultB.rowCount === 0){
				return res.status(400).send("Uh-oh. Unsuccessful query, returned no block list");
			}
			else{
				return res.status(200).send(resultB.rows);
			}
		
                 
             }


                 });

             }
        });
    }

};

exports.hashType = function(req,res){
    
    var id = req.params.id;
    var id_length = id.length;
    
    if (isAlphaNumeric(id) === false || id_length !== 64){
        console.log("id is not alphanumeric or id_length != 64");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ // the route params are clean
        
    
        var query = client.query("SELECT type FROM hashtype WHERE id = $1", [id], function(err, result) {
         if (err || result.rowCount === 0){
             console.log(err);
             return res.status(400).send("Uh-oh, bad id request");

         }
         else{
             return res.status(200).send(result.rows[0]);
         
        }
    
        });
    }
};

exports.moreBlockTxs = function (req,res){
    
    var id = req.params.id;
    var id_length = id.length;
    var page_id = req.params.page_id;
    if (isNumeric(page_id) === false){
        console.log("page id is not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if(parseInt(page_id) < 2){
        console.log("page id is < 2");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isAlphaNumeric(id) === false || id_length > 64){
        console.log("id.length > 64 or id is not alphanumeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isAlphaNumeric(id) && id_length <= 64){
        if (id_length < 64){
            //it might be a height
            if (isNumeric(id) === false){ // its not a height
                console.log("id is not numeric/not a height or hash.");
                return res.status(400).send("Uh-oh, bad id request");
            }
            else{                       // it is a height
                id = parseInt(id);
            }
        
            
        }
    //the route params are clean        
    var num_offset = 15 * (parseInt(page_id) - 1);
    var queryTx = client.query("SELECT * FROM transactions WHERE blockhash = $1 LIMIT 15 OFFSET $2", [id, num_offset], function(errTx,resultTx){


    if (errTx){
        console.log(errTx);
        return res.status(400).send("Uh-oh. Unsuccessful query");
    }
    else{


        var resu_tx = resultTx.rows;
        var resu_tx_count = resultTx.rowCount;

            for (var f = 0; f < resu_tx_count; f++){
                var t = resu_tx[f]["inputs"];
                var s = resu_tx[f]["outputs"];
                resu_tx[f]["inputs"] = convertJSONarray(t);
                resu_tx[f]["outputs"] = convertJSONarray(s);

            }

        res.status(200).send(resu_tx);

    //client.end()
                }

            });
    }
};

exports.allBlocks = function(req,res){

var page_id = req.params.page_id;

if (isNumeric(page_id) === false){
        console.log("page id is not numeric");
        return res.status(400).send("Uh-oh, bad id request");
}
else{

      var queryH = client.query("SELECT COUNT(*) FROM blocks", function(errH, resultH) {
        if (errH){
        console.log(errH);
        return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{

            var height = resultH.rows[0].count;
            var num_offset = 15 * (parseInt(page_id) - 1);
            var query = client.query("SELECT height, timestamp, size, numtx, solvedby, tx_received_bks, tx_received_bkc FROM blocks ORDER BY height DESC LIMIT 15 OFFSET $1", [num_offset], function(err,result){
                if (err){
                        console.log(err);
                        return res.status(400).send("Uh-oh. Unsuccessful query");
                }
                else{

                  var data = {
                    info:result.rows,
                    block_count:height
                  };
                  res.status(200).send(data);
                }
            });

        }

      });
    

}


};
