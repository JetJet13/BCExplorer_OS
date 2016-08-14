var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;

exports.singleBlock = function(req,res){ 

    //SECURITY CYCLE
    var id = req.params.id;
    var id_length = id.length;
    var page_id = req.params.page_id;
    var sql_block = "";
    var sql_tx = "";
    console.log(id,id_length);
    
    if (isAlphaNumeric(id) === false || id_length > 64){
        console.log("id is not alphanumeric or id_length > 64");
        return res.status(400).send("Uh-oh, bad block hash request");
    }
    else if (isAlphaNumeric(id) && id_length <= 64){
        if (id_length < 64){
            //it might be a height
            if (isNumeric(id) === false){ // its not a height
                console.log("id is not numeric/not a height or hash.");
                return res.status(400).send("Uh-oh, bad block hash request");
            }
            else{                       // it is a height
                id = parseInt(id);
                sql_block = "SELECT * FROM blocks WHERE height = $1";
                
            }
        
            
        }
    else{ // isAlphaNumeric and id_length = 64
            sql_block = "SELECT * FROM blocks WHERE id = $1";
            
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
                delete resu.motions;
                delete resu.custodians;

                resu.nexthash = nxtHash;
                resu.conf = resultH.rows[0].height - resu.height + 1;
                
                return res.status(200).send(resu);

                    });
                }); 

             } 	

          });

    }
 };

exports.latestBlocks = function(req,res){

var howMany = req.params.id;

    if (isNumeric(howMany) === false){
        console.log("howMany is not numeric");
        return res.status(400).send("Uh-oh, bad id request");
    }
    else if (parseInt(howMany) > 300){
        console.log("asking for too many blocks");
        return res.status(400).send("Uh-oh, requested too many blocks; limit 300"); 
    }
    else{ // route params are clean
        howMany = parseInt(howMany);

        var query = client.query("SELECT COUNT(*) FROM blocks", function(errH, resultH) {
             if (errH){
                 console.log(errH);
                 return res.status(400).send("Uh-oh. Unsuccessful query block_latest by networkinfo");
             }
             else{
                 var height = resultH.rows[0].count - howMany;
                 var getBlocks = client.query("SELECT * FROM blocks WHERE height >= $1 ORDER BY height DESC LIMIT 300",[height],function(errB,resultB){

                     if (errB){
                 console.log(errB);
                 return res.status(400).send("Uh-oh. Unsuccessful query block_latest by blocks");
             }
             else{
			if (resultB.rowCount === 0){
				return res.status(400).send("Uh-oh. Unsuccessful query, returned no block list");
			}
			else{
        for (var i=0;i<resultB.rowCount;i++) {
              delete resultB.rows[i]["motions"];
              delete resultB.rows[i]["custodians"];
              if (i === 0){
                resultB.rows[i].nexthash = "";
                resultB.rows[i].conf = i + 1;
              }
              else{
                resultB.rows[i].nexthash = resultB.rows[i-1].id;
                resultB.rows[i].conf = i + 1;
              }
        }
        res.status(200).send(resultB.rows);
			}
		
                 
             }


                 });

             }
        });
    }

};























