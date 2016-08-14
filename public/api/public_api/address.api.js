var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;


exports.addressInfo = function (req,res){

	var id = req.params.id;
    var id_length = id.length;
    var id_type = "";
    var sql = "";
    
    if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        console.log("either address is not alphanumeric or address length is invalid");
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
               return res.status(400).send("Uh-oh. something broke");
            }
            else if (result.rowCount === 0){
                return res.status(400).send("Uh-oh. could not find info about specified address");
            }
            else{

                    var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){

                        if (errH){
                     console.log(err);
                     return res.status(400).send("Uh-oh. something broke");
                    }


                    var Address_data = {
                        'address': result.rows[0].id,
                        'hash160': result.rows[0].hash160,
                        'numtx': result.rows[0].numtx,
                        'total_sent': result.rows[0].total_sent,
                        'total_received': result.rows[0].total_received,
                        'balance': result.rows[0].balance,
                        'type': result.rows[0].type
                    };
                    res.status(200).send(Address_data);

                //client.end()
                    });
                            }

                        });
            

    }
    
};

exports.addresstxs = function (req, res){
    
    
    var id = req.params.id;
    var id_length = id.length;
    var howMany = req.params.howmany;
    
    if (isNumeric(howMany) === false){
        console.log("page id not numeric");
        return res.status(400).send("Uh-oh, bad 'how many' request");
    }
    else if(parseInt(howMany) > 50){
        console.log("howMany > 50");
        return res.status(400).send("Uh-oh, your 'how many' parameter exceeded the LIMIT of 50");
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
        
        var howMany = parseInt(howMany);
        var queryTx = client.query("SELECT * FROM transactions WHERE $1 = ANY (addresses) ORDER BY timestamp DESC LIMIT $2", [id,howMany], function(errTx,resultTx){


        if (errTx){
            console.log(errTx);
            return res.status(400).send("Uh-oh. specified address has no transactions");
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

        //client.end()
            });
                    }

                });
    
    }
};

exports.unspent = function (req,res){
    var id = req.params.id;
    var id_length = id.length;

    if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        console.log("either address is not alphanumeric or address is wrong length");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else{ //the route params are clean
    
    var getHeight = client.query("SELECT * FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
        if (errH){
             console.log(err);
             return res.status(400).send("Uh-oh. something broke");
        }
        else{
            var queryTx = client.query("SELECT id,height,outputs,out_count,out_txs FROM transactions WHERE $1 = ANY (addresses) ORDER BY height DESC", [id], function(errTx,resultTx){

                if (errTx){
                    console.log(errTx);
                    return res.status(400).send("Uh-oh. something broke");
                }
                else{
                    var unspent_txs = [];
                    var resu_tx = resultTx.rows;
                    var resu_tx_count = resultTx.rowCount;
                    var unspent_balance = 0;

                        for (var f = 0; f < resu_tx_count; f++){
                            var hash = resu_tx[f].id;
                            var height_tx = resu_tx[f].height;
                            var out_count = resu_tx[f].out_count;
                            var outputs = resu_tx[f].outputs;
                            var out_txs = resu_tx[f].out_txs;
                            for(var i = 0; i < out_count; i++){
                                if (outputs[i].address === id && out_txs[i] === "unspent"){
                                    var unspent_tx = {
                                        hash:hash,
                                        height:height_tx,
                                        conf:resultH.rows[0].height - resu_tx[f]["height"] + 1,
                                        out_index:i,
                                        amount:outputs[i].out_val,
                                        type:outputs[i].type,
                                        script:outputs[i].script.decode
                                    };
                                    unspent_txs.push(unspent_tx);
                                    unspent_balance += outputs[i].out_val;
                                    console.log( outputs[i]);
                                }
                            }
                        }
                    res.status(200).send({address:id,unspent_balance:unspent_balance,txs:unspent_txs});


                    }//queryTx else
                });//queryTx
            }//getHeight else
        });//getHeight
    }//else

};










