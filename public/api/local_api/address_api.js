var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;

exports.getAddress = function (req,res){

	var id = req.params.id;
    var id_length = id.length;
    var page_id = req.params.page_id;
    var id_type = "";
    var sql = "";
    
    if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        console.log("either address is not alphanumeric or address length is bad");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isNumeric(page_id) === false){
        console.log("page id not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ //the route params are clean
        
        
        // let's find what kind of address it is...BKS or BKC
        if (id.substring(0,1) === "8" || id.substring(0,1) === "9"){
            id_type = "BKS";
            sql = "SELECT * FROM address_bks WHERE id = $1";
        }
        else if (id.substring(0,1) === "C"){
            id_type = "BKC";
            sql = "SELECT * FROM address_bkc WHERE id = $1";
        }
        else{
            console.log("address has bad prefix");
            return res.status(400).send("Uh-oh, bad id request");   
        }
        
        var query = client.query(sql, [id], function(err,result){

            if (err){
               console.log(err);
               return res.status(400).send("Uh-oh. Unsuccessful query");
            }
            else if (result.rowCount === 0){
                return res.status(400).send("Uh-oh. Unsuccessful query");
            }

            else{

                var queryTx = client.query("SELECT * FROM transactions WHERE $1 = ANY (addresses) ORDER BY timestamp DESC LIMIT 15", [id], function(errTx,resultTx){


                if (errTx){
                    console.log(errTx);
                    return res.status(400).send("Uh-oh. Unsuccessful query");
                }
                else{

                    var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){

                        if (errH){
                     console.log(err);
                     return res.status(400).send("Uh-oh. Unsuccessful query transaction block_api");
                    }

                    var resu_tx = resultTx.rows;
                    var resu_tx_count = resultTx.rowCount;

                        for (var f = 0; f < resu_tx_count; f++){
                           // var t = resu_tx[f]["inputs"];
                           // var s = resu_tx[f]["outputs"];
                           // resu_tx[f]["inputs"] = convertJSONarray(t);
                           // resu_tx[f]["outputs"] = convertJSONarray(s);
                              resu_tx[f].conf = resultH.rows[0].height - resu_tx[f]["height"] + 1

                        }


                    var Address_data = {
                        'address': result.rows[0].id,
                        'hash160': result.rows[0].hash160,
                        'numtx': result.rows[0].numtx,
                        'total_sent': result.rows[0].total_sent,
                        'total_received': result.rows[0].total_received,
                        'balance': result.rows[0].balance,
                        'type': result.rows[0].type,
                        'txs': resu_tx
                    };
                    res.status(200).send(Address_data);

                //client.end()
                    });
                            }

                        });
            }
        });
    }
    
};

exports.getMoreTxs = function (req, res){
    
    
    var id = req.params.id;
    var id_length = id.length;
    var page_id = req.params.page_id;
    
    if (isNumeric(page_id) === false){
        console.log("page id not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if(parseInt(page_id) < 2){
        console.log("page id < 2");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        console.log("either address is not alphanumeric or address is wrong length");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ //the route params are clean
        
        
        // let's find what kind of address it is...BKS or BKC
        if (id.substring(0,1) !== "8" && id.substring(0,1) !== "C"){
            console.log("address has bad prefix");
            return res.status(400).send("Uh-oh, bad id request");   
        }
        
        var num_offset = 15 * (parseInt(page_id) - 1);
        var queryTx = client.query("SELECT * FROM transactions WHERE $1 = ANY (addresses) ORDER BY timestamp DESC LIMIT 15 OFFSET $2", [id, num_offset], function(errTx,resultTx){


        if (errTx){
            console.log(errTx);
            return res.status(400).send("Uh-oh. Unsuccessful query");
        }
        else{

            var getHeight = client.query("SELECT * FROM networkinfo WHERE id = 'network status'", function(errH,resultH){

                if (errH){
             console.log(err);
             return res.status(400).send("Uh-oh. Unsuccessful query transaction block_api");
            }

            var resu_tx = resultTx.rows;
            var resu_tx_count = resultTx.rowCount;

                for (var f = 0; f < resu_tx_count; f++){
                    //var t = resu_tx[f]["inputs"];
                    //var s = resu_tx[f]["outputs"];
                    //resu_tx[f]["inputs"] = convertJSONarray(t);
                    //resu_tx[f]["outputs"] = convertJSONarray(s);
                    resu_tx[f].conf = resultH.rows[0].height - resu_tx[f]["height"] + 1
                }

            res.status(200).send(resu_tx);

        //client.end()
            });
                    }

                });
    
    }
};










var convertJSONarray = function(s){

  var step1 = s.replace(/"{/g,'{').replace(/}"/g,'}').replace(/\\/g,"");
  var step2 = "[" + step1.slice(1,-1) + "]";
  var step3 = JSON.parse(step2);
  return step3;


};
