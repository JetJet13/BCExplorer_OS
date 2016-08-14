// angular.module('BCE.wsFactory', ['ngWebSocket','BCE.apiFactory']); //instantiates
angular.module('BCE')
.factory('wsFactory', ['$websocket', 'apiFactory', function($websocket, apiFactory){
    
   var wsFactory = {
                    block_list:[],
                    tx_list:[],
                    motion_list:[],
                    custo_list:[],
                    status_list:{
                                  "id": "networkinfo",
                                  "height": null,
                                  "moneysupply": null,
                                  "connections": null
                    }
  };

    var dataStream = $websocket('ws://localhost:80/',{
       protocolVersion:8,
       origin:'localhost',
       reconnect:true});
dataStream.onClose(function(){
  console.log("Lost connection to websocket...attempting to reconnect.");
});
apiFactory.getLatestBlocks(6).success(function(data){

	var numBlocks = data.length;
	for (var i = 0; i < 6; i++) {

		wsFactory.block_list.unshift(data[i]);

	 }

});    

apiFactory.getStatus().success(function(data){

		    wsFactory.status_list.id = data.id;
        wsFactory.status_list.height = data.height;
        wsFactory.status_list.moneysupply = data.moneysupply;
        wsFactory.status_list.connections = data.connections;
        
});
    
// MOTION LIST
apiFactory.getMotions().success(function(data){
        
        var data_length = data.length;
        for(var m = 0; m < data_length; m++){
            wsFactory.motion_list.push(data[m]);
        }
    })
    .error(function(err){ $location.path('/'); });
    
// CUSTO LIST
apiFactory.getCustodians().success(function(data){
        
        var data_length = data.length;
        for(var m = 0; m < data_length; m++){
            wsFactory.custo_list.push(data[m]);
        }
    })
    .error(function(err){ $location.path('/'); });
    
dataStream.onMessage(function(message) {
    var msg = JSON.parse(message.data);
      if (msg.type === "block"){
            //console.log(wsFactory.block_list); 
            wsFactory.block_list.pop();
            wsFactory.block_list.unshift({       
                                       "height": msg.info.height,
                                       "timestamp": msg.info.timestamp, 
                                       "size": msg.info.size, 
                                       "numtx": msg.info.numtx, 
                                       "solvedby": msg.info.solvedby, 
                                       "tx_received_bks": msg.info.tx_received_bks, 
                                       "tx_received_bkc": msg.info.tx_received_bkc
                                      });
            wsFactory.block_list.sort(function (a, b) {
                              if (a.height > b.height) {
                                return -1;
                              }
                              if (a.height < b.height) {
                                return 1;
                              }
                              // a must be equal to b
                              return 0;
                            });
        }
    else if (msg.type === "tx"){
        
            if (tx_list.length >= 5){
                wsFactory.tx_list.pop();
            }
            
            wsFactory.tx_list.unshift({"id": msg.info.id,
                             "timestamp": msg.info.timestamp,
                             "out_total": msg.info.out_total
                            });
        
    }
    else if (msg.type === "status"){
        
        wsFactory.status_list.id = msg.info.id;
        wsFactory.status_list.height = msg.info.height;
        wsFactory.status_list.moneysupply = msg.info.moneysupply;
        wsFactory.status_list.connections = msg.info.connections;
        
    }
    else if (msg.type === "motion"){
        
        wsFactory.motion_list = [];
        apiFactory.getMotions().success(function(data){
                            
                var data_length = data.length;
                for(var m = 0; m < data_length; m++){
                    wsFactory.motion_list.push(data[m]);
                }
        })
        .error(function(err){ $location.path('/'); });
        
    }
    else if (msg.type === "custo"){
        
        wsFactory.custo_list = [];
        apiFactory.getCustodians().success(function(data){
        
        var data_length = data.length;
        for(var m = 0; m < data_length; m++){
            wsFactory.custo_list.push(data[m]);
        }
    })
    .error(function(err){ $location.path('/'); });
        
    }
    else{
      console.log(msg.message);
    }
            
});
           
    return wsFactory;
    
}]);
