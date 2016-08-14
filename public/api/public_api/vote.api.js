var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;
var appear = tools.appear;

exports.singleMotion = function (req,res){

  var id = req.params.id;
  var id_length = id.length;
  if (isAlphaNumeric(id) === false || id_length !== 40){
        console.log("motion hash is not alphanumeric or id_length !== 40");
        return res.status(400).send("Uh-oh, bad motion hash request");
  }
  else{
      var query = client.query("SELECT * FROM motions WHERE id = $1",[id], function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else if (result.rowCount === 0){
            console.log("Motion not found");
            return res.status(400).send("Uh-oh. Motion hash not found");
        }
        else{
            
            var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
                if (errH){
                         console.log(errH);
                         return res.status(400).send("Uh-oh. Unsuccessful query getHeight");
                }
                else{
                       // we need to get the number of sharedays 
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
                                          result.rows[0].latest_vote = blockCount - result.rows[0].latest_block;
                                          result.rows[0].total_sdd = total_sdd;
                                          result.rows[0].last_100 = appear(motion_list,result.rows[0].id);
                                          delete result.rows[0].url;
                                          res.send(result.rows[0]);
                                    }
                            });//blocks query
                                    
                        }
                    });//bitcoin client query
                            
                }
         
            
            }); //blockcount query       
        }
         
     });//motion query
  }//else
  

};
exports.allMotions = function (req,res){
    
     var query = client.query("SELECT * FROM motions WHERE passed = false ORDER BY numvotes DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else if (result.rowCount === 0){
          console.log("no motions in progress");
          return res.status(200).send([]);
        }
        else{
            
            var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
                if (errH){
	                       console.log(errH);
	                       return res.status(400).send("Uh-oh. Unsuccessful query getHeight");
                }
                else{
                       // we need to get the number of sharedays 
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
                                                delete result.rows[b].url;  
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


exports.allSuccessMotions = function (req,res){
    
    
    var query = client.query("SELECT * FROM motions WHERE passed = true ORDER BY passedblock DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else if (result.rowCount === 0){
            console.log("No success motions");
            return res.status(200).send([]);
        }
        else{
            for (var b = 0; b < result.rowCount; b++){
                delete result.rows[b].url;
            }
            res.status(200).send(result.rows);
        }
        
    });
    
    
    
    
};
exports.singleCustodian = function (req,res){
var address = req.params.id;
var address_length = address.length;
var amount = req.params.amount;
    if (isNumeric(amount) === false){
        console.log("amount is not numeric");
        return res.status(400).send("Uh-oh, bad amount request");
    }
    else if (isAlphaNumeric(address) === false || (address_length !== 34 && address_length !== 33)){
        console.log("either custo address is not alphanumeric or custo address is wrong length");
        return res.status(400).send("Uh-oh, bad custodian address request");
    }
    else{ //the route params are clean
           var id = address +"_"+amount;    
     var query = client.query("SELECT * FROM custodians WHERE id = $1",[id], function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else if (result.rowCount === 0){
            console.log("Custo not found");
            return res.status(400).send("Uh-oh. Custodian not found");
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
                                           delete result.rows[0].id;
                                           delete result.rows[0].url;
                                           result.rows[0].latest_vote = blockCount - result.rows[0].latest_block;
                                           result.rows[0].total_sdd = total_sdd;
                                           result.rows[0].last_100 = appear(custodian_list, result.rows[0].id+"_"+result.rows[0].amount);
                                           res.send(result.rows[0]);
                                    }
                            });//blocks query
                                    
                        }
                    });//bitcoin client query
                            
                }
         
            
            }); //blockcount query       
        }
         
     });//motion query
    }//else
    
    
    
    
};

exports.allSuccessCustodians = function (req,res){
    
    
    var query = client.query("SELECT * FROM custodians WHERE passed = true ORDER BY passedblock DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{
            for (var i=0; i<result.rowCount; i++){
              delete result.rows[i].id;
              delete result.rows[i].url;
            }
            res.status(200).send(result.rows);
        }
        
    });
    
    
    
    
};

exports.allCustodians = function (req,res){
    
     var query = client.query("SELECT * FROM custodians WHERE passed = false ORDER BY numvotes DESC", function(err,result){
         
         if (err){
            console.log(err);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else if(result.rowCount === 0){
            console.log("no custoians in progress");
            return res.status(400).send("Uh-oh. no custodians in progress");
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
                                                delete result.rows[b].id;
                                                delete result.rows[b].url;
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

