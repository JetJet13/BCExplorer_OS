var tools = require('../api_tools.js');
var client = tools.psqlClient;
var isAlphaNumeric = tools.isAlphaNumeric;
var isNumeric = tools.isNumeric;
var bc_client = tools.bitcoinClient;
var convertJSONarray = tools.convertJSONarray;

exports.getTx = function(req,res){

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
	return res.status(400).send("Uh-oh, Unsuccessful query");
}
else if (result.rowCount === 0){
    return res.status(400).send("Uh-oh, Unsuccessful query");
}
else{
    
var getHeight = client.query("SELECT height FROM networkinfo WHERE id = 'network status'", function(errH,resultH){
    
    if (errH){
	console.log(errH);
	return res.status(400).send("Uh-oh. Unsuccessful query getHeight")
}
else{

    
    //result.rows[0].inputs = convertJSONarray(result.rows[0].inputs); 
    //result.rows[0].outputs = convertJSONarray(result.rows[0].outputs);    
    result.rows[0].fee = result.rows[0].in_total - result.rows[0].out_total;
    result.rows[0].conf = resultH.rows[0].height - result.rows[0].height + 1;
    
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

