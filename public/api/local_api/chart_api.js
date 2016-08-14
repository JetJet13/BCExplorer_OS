var tools = require('../api_tools.js');
var client = tools.psqlClient;


exports.getSizeChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'size_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseInt(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
    
    
    
    
};

exports.getDiffChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'diff_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseFloat(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
        
    
};

exports.getBlockChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'block_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseInt(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
    
    
    
    
};

exports.getNumTxChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'numtx_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseInt(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
    
    
    
    
};

exports.getCDChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'cd_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseFloat(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
    
    
    
    
};

exports.getMintChart = function (req,res){
    
    
    var query = client.query("SELECT data FROM chart_info WHERE id = 'mint_chart'", function(err, result) {
        
         if (err){
         console.log(err);
	     return res.status(400).send("Uh-oh. Unsuccessful query status page");
     }
     else{

     	var result_length = result.rows[0].data.length;
     	for(var x = 0; x <  result_length; x++){
     		result.rows[0].data[x][0] = parseInt(result.rows[0].data[x][0])*1000;
     		result.rows[0].data[x][1] = parseFloat(result.rows[0].data[x][1]);

     	}
     	res.status(200).send(result.rows[0]);
     }
    
    });
    
    
    
    
};