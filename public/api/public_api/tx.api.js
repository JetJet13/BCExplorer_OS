var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;

exports.singleTx = function(req,res){

var id = req.params.id;   // '905ef10ee3f4386f11d041d87b074d1fb3db8c6a142e3b448b8665c156f61fcb';
var id_length = id.length;

    if (isAlphaNumeric(id) === false && id_length === 71 && isAlphaNumeric(id.substr(7))){
        id = id.substr(7);
    }
    else if (isAlphaNumeric(id) === false || id_length !== 64){
        console.log("id is not alphanumeric or length != 64");
        return res.status(400).send("Uh-oh, bad id request");
    }
    
    
var query = client.query("SELECT * FROM transactions WHERE id = $1",[id],function(err,result){


if (err){
	console.log(err); 
	return res.status(400).send("Uh-oh, something broke");
}
else if (result.rowCount === 0){
    return res.status(400).send("Uh-oh, hash specified returned no results");
}
else{
    
var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
    if (errH){
	console.log(errH);
	return res.status(400).send("Uh-oh. something broke");
}
else{

    
    // result.rows[0].inputs = convertJSONarray(result.rows[0].inputs); 
    // result.rows[0].outputs = convertJSONarray(result.rows[0].outputs);
	
	for(var i =0; i < result.rows[0].inputs.length; i++){
		delete result.rows[0].inputs[i].in_script;
	}
	for(var i =0; i < result.rows[0].outputs.length; i++){

	if(result.rows[0].out_txs[i] === "unspent"){
		result.rows[0].outputs[i].spent = false;
	}
	else{
		result.rows[0].outputs[i].spent = true;
	}

	}
	
    result.rows[0].hash = result.rows[0].id;
    result.rows[0].fee = result.rows[0].in_total - result.rows[0].out_total;
    result.rows[0].conf = resultH.rows[0].height - result.rows[0].height + 1;

    delete result.rows[0].addresses;
    delete result.rows[0].out_txs;
    delete result.rows[0].id;
    
if (result.rows[0].fee < 0){
    
    result.rows[0].fee = 0;
}
return res.status(200).send(result.rows[0]);
//client.end()

        }
    });    

    }

});


};

exports.sendRawTransaction = function(req,res) {

  var rawTx = req.body.rawTx;
 console.log(rawTx);
  var checkInputs = req.body.checkInputs || 0;
  if (0 === rawTx.length){
    return res.status(400).send("Uh-oh. 1st parameter is not valid.");
  }
  else if (isNumeric(checkInputs)=== false){
    return res.status(400).send("Uh-oh. 2nd parameter is not an int.");
  }
  else{
      
         

        bc_client.cmd('sendrawtransaction', rawTx,parseInt(checkInputs), function(bc_err, bc_data, resHeaders){
                                    if (bc_err){
                                            console.log(bc_err);
						if(bc_err.code == -5){
							 return res.status(400).send({success:false,status:"Transaction already in the blockchain"});
						}
						else if(bc_err.code == -22){
							 return res.status(400).send({success:false,status:"Transaction decode failed"});
						}
						else{
							 return res.status(400).send({success:false,status:bc_err});
						}
                                            
                                    }
                                    else{
             
                                      return res.status(200).send({success:true,status:'sent',data:bc_data});
                        
                                    }

                  });


  }//else 
  
};

exports.blockTx = function (req,res){
    
    var id = req.params.id;
    var id_length = id.length;
    var sql_tx = "";

    if (isAlphaNumeric(id) === false || id_length > 64){
        console.log("id is not alphanumeric or id_length > 64");
        return res.status(400).send("Uh-oh, bad hash request");
    }
    else if (isAlphaNumeric(id) && id_length < 64){
        
        if (id_length < 64){
            //it might be a height
            if (isNumeric(id) === false){ // its not a height
                console.log("id is not numeric/not a height or hash.");
                return res.status(400).send("Uh-oh, bad height request");
            }
            else{                       // it is a height
                id = parseInt(id);
                sql_tx = "SELECT * FROM transactions WHERE height = $1 ORDER BY tx_num ASC LIMIT 50";
            }
        
            
        }
      }
      else{ // isAlphaNumeric and id_length = 64
                sql_tx = "SELECT * FROM transactions WHERE blockhash = $1 ORDER BY tx_num ASC LIMIT 50";
        }           
    
        var tx_query = client.query(sql_tx, [id], function(errTx, resultTx){

             if (errTx || resultTx.rowCount === 0){
                 console.log(errTx);
                 return res.status(400).send("Uh-oh. Found no block transactions with specified hash.");
             }
             else{

                var getHeight = client.query("SELECT * FROM networkinfo WHERE id = 'network status'", function(errH,resultH){

                    if (errH){
                 console.log(err);
                 return res.status(400).send("Uh-oh. something broke");
                }

                var resu_tx = resultTx.rows;
                var resu_tx_count = resultTx.rowCount;

                for (var f = 0; f < resu_tx_count; f++){

                        for(var i =0; i < resu_tx[f].inputs.length; i++){
                            delete resu_tx[f].inputs[i].in_script;
                        }
                        for(var i =0; i < resu_tx[f].outputs.length; i++){

                            if(resu_tx[f].out_txs[i] === "unspent"){
                                resu_tx[f].outputs[i].spent = false;
                            }
                            else{
                                resu_tx[f].outputs[i].spent = true;
                            }
                        }
                    delete resu_tx[f].addresses;
                    delete resu_tx[f].out_txs;
                    resu_tx[f].conf = resultH.rows[0].height - resu_tx[f]["height"] + 1
                }

            res.status(200).send(resu_tx);

                    });
      

             }  

      });

};
