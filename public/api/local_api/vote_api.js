var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;
var appear = tools.appear;

exports.getMotions = function (req,res){
    
     var query = client.query("SELECT * FROM motions WHERE passed = false ORDER BY numvotes DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{
            
            var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
                if (errH){
	                       console.log(errH);
	                       return res.status(400).send("Uh-oh. Unsuccessful query getHeight");
                }
                else{
                        
                bc_client.cmd('getcustodianvotes', function(bc_err, bc_data, resHeaders){
                            if (bc_err){
                                    console.log(["BC_exchange ERROR",bc_err]);
                                    nxtHash = "";
      
                            }
                            else{
                                
            var getblocks = client.query("SELECT vote FROM blocks WHERE height > $1", [resultH.rows[0].height - 100], function(errB,resultB){
                
                                if (errB){
	                                       console.log(errB);
	                                       return res.status(400).send("Uh-oh. Unsuccessful query getHeight");
                                }
                                else{
                                           var motion_list = [];
                                           var block_length = resultB.rows.length;
                                           for (var q = 0; q < block_length; q++){
                                               var block_motions = resultB.rows[q].vote.motions;
                                               var num_motions = block_motions.length;
                                               for(var m = 0; m < num_motions; m++){
                                                   motion_list.push(block_motions[m]);
                                               }
                                           }
                                    	   
                                    
                                           var blockCount = resultH.rows[0].height;
                                           var total_sdd = bc_data.total.sharedays;
                                           var result_length = result.rows.length;
                                           for (var b = 0; b < result_length; b++){

                                                result.rows[b].latest_vote = blockCount - result.rows[b].latest_block;
                                                result.rows[b].total_sdd = total_sdd;
                                                result.rows[b].last_100 = appear(motion_list,result.rows[b].id);
                                           }
                                                res.send(result.rows);
                                    }
                            });//blocks query
                                    
                        }
                    });//bitcoin client query
                            
                }
         
            
            }); //blockcount query       
        }
         
     });//motion query
    
    
    
};


exports.getSuccessMotions = function (req,res){
    
    
    var query = client.query("SELECT * FROM motions WHERE passed = true ORDER BY passedblock DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{
            res.status(200).send(result.rows);
        }
        
    });
    
    
    
    
};

exports.getVotedForMotions = function (req,res){
    
  var id = req.params.id;
  var id_length = id.length;
  var page_id = req.params.page_id;

  if (isAlphaNumeric(id) === false || id_length !== 40){
        console.log("either motion is not alphanumeric or motion length is bad");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isNumeric(page_id) === false){
        console.log("page id not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ //the route params are clean
        
        var num_offset = 15 * (parseInt(page_id) - 1);
        var query = client.query("SELECT height,timestamp,solvedby,coinagedestroyed,(SELECT count(1) FROM blocks WHERE $1 = ANY (motions) ) FROM blocks WHERE $1 = ANY (motions) ORDER BY height DESC LIMIT 15 OFFSET $2",[id,num_offset],function(err,result){
            
            if (err){
                console.log(err);
                return res.status(400).send("Uh-oh. Unsuccessful query");
            }
            else{
                res.status(200).send(result.rows);
            }
      
        });  
    }
};

exports.getVotedForCustodians = function (req,res){
    
  var id = req.params.id;
  var id_length = id.length;
  var amount_id = req.params.amount_id;
  var page_id = req.params.page_id;

  if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        console.log("either motion is not alphanumeric or motion length is bad");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isNumeric(page_id) === false){
        console.log("page id not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isNumeric(amount_id) === false){
        console.log("amount id not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ //the route params are clean
        
        var query_id = id + "_" + amount_id;
        var num_offset = 15 * (parseInt(page_id) - 1);
        var query = client.query("SELECT height,timestamp,solvedby,coinagedestroyed,(SELECT count(1) FROM blocks WHERE $1 = ANY (custodians) ) FROM blocks WHERE $1 = ANY (custodians) ORDER BY height DESC LIMIT 15 OFFSET $2",[query_id,num_offset],function(err,result){
            
            if (err){
                console.log(err);
                return res.status(400).send("Uh-oh. Unsuccessful query");
            }
            else{
                res.status(200).send(result.rows);
            }
      
        });  
    }
};

exports.getSuccessCustodians = function (req,res){
    
    
    var query = client.query("SELECT * FROM custodians WHERE passed = true ORDER BY passedblock DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{
            res.status(200).send(result.rows);
        }
        
    });
    
    
    
    
};

exports.getCustodians = function (req,res){
    
     var query = client.query("SELECT * FROM custodians WHERE passed = false ORDER BY numvotes DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{
            
            var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
                if (errH){
	                       console.log(errH);
	                       return res.status(400).send("Uh-oh. Unsuccessful query getHeight");
                }
                else{
                        
                bc_client.cmd('getcustodianvotes', function(bc_err, bc_data, resHeaders){
                            if (bc_err){
                                    console.log(["bcexchange error",bc_err]);
                                    return res.status(400).send("Uh-oh. Unsuccessful query getcustodianvotes");
      
                            }
                            else{
                                
            var getblocks = client.query("SELECT custodians FROM blocks WHERE height > $1", [resultH.rows[0].height - 100], function(errB,resultB){
                
                                if (errB){
	                                       console.log(errB);
	                                       return res.status(400).send("Uh-oh. Unsuccessful query getBlocks");
                                }
                                else{
                                           var custodian_list = [];
                                           var block_length = resultB.rows.length;
                                           for (var q = 0; q < block_length; q++){
                                               var block_custodians = resultB.rows[q].custodians;
                                               var num_custodians = block_custodians.length;
                                               for(var m = 0; m < num_custodians; m++){
                                                   custodian_list.push(block_custodians[m]);
                                               }
                                           }
                                    
                                    
                                           var blockCount = resultH.rows[0].height;
                                           var total_sdd = bc_data.total.sharedays;
                                           var result_length = result.rows.length;
                                           for (var b = 0; b < result_length; b++){

                                                result.rows[b].latest_vote = blockCount - result.rows[b].latest_block;
                                                result.rows[b].total_sdd = total_sdd;
                                                result.rows[b].last_100 = appear(custodian_list, result.rows[b].id+"_"+result.rows[b].amount);
                                           }
                                                res.send(result.rows);
                                    }
                            });//blocks query
                                    
                        }
                    });//bitcoin client query
                            
                }
         
            
            }); //blockcount query       
        }
         
     });//motion query
    
    
    
};

