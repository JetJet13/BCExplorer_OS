// angular.module('BCE.blockController', ["BCE.apiFactory", 'BCE.wsFactory', 'ngRoute', 'infinite-scroll', 'yaru22.angular-timeago','angular-loading-bar']); //instantiates
angular.module('BCE')
.controller("BlockController",[ "$scope", "$rootScope", "apiFactory","$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){ 

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};
function isNumeric(str) {
    var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58)) { // numeric (0-9)
      return false;
    }
  }
  return true;
    
};
    
    
var id = $routeParams.id;
var id_length = id.length;
var page_id = $routeParams.page_id;

// SECURITY CYCLE
if (isNumeric(page_id) === false){
    $location.path('/');
    $rootScope.error = true;
}
else if (isAlphaNumeric(id) === false || id_length > 64){
    $location.path('/');
    $rootScope.error = true;
}
else if (isAlphaNumeric(id) && id_length <= 64){ //somewhat clean route params

        apiFactory.getBlockDetails(id,1)
        .success(function(data){ 

        $scope.block_data = data.block_data;
        $scope.reward = data.reward;
        $scope.tx_data = data.tx_data;


        })
        .error(function(err){

        $location.path('/');
        $rootScope.error = true;

        }); 

}   
    
$scope.nxt_page = 2;

$scope.moretxs = function(id, page_id, numtx){
    
    // Let's find how many pages
    var num_pages = Math.ceil(numtx/15);
    
    if ($scope.nxt_page <= num_pages){
        $scope.isBusy = true;
        apiFactory.getMoreBlockTxs(id, page_id).success(function(data){
        
        var data_len = data.length;
        for(var d = 0; d < data_len; d++){
        
            $scope.addr.txs.push(data[d]);
        }   
        $scope.isBusy = false;
        $scope.nxt_page += 1;
    
        }).error(function(err){
    
            $location.path('/address/' + id + '/1');
            $scope.nxt_page = 2;
    
        }); 
        
        
    }
    
  
};
    
}])
.controller("BlockLatestController", ['$scope','$rootScope', '$routeParams', '$location', 'wsFactory', function($scope, $rootScope, $routeParams, $location, wsFactory){
var vm = this;

vm.block_list = wsFactory.block_list;
   

    
    
}])
.controller("AllBlocksController", ["$scope", "$rootScope", "$routeParams", "$location", "apiFactory", function($scope, $rootScope, $routeParams, $location, apiFactory){

    $scope.block_list = [];
    $scope.isBusy = true;
    apiFactory.getAllBlocks("1").success(function(data){

        var data_length = data.info.length;
        $scope.block_count = data.block_count;
        for(var v = 0; v < data_length; v++){
            $scope.block_list.push(data.info[v]);
        }
        $scope.isBusy = false;

    }).error(function(err){
        $location.path('/');
        $rootScope.error = true;
    });

$scope.nxt_page = 2;

$scope.moreblocks = function(page_id, num_blocks){
    
    // Let's find how many pages
    var num_pages = Math.ceil(num_blocks/15);
    
    if ($scope.nxt_page <= num_pages){
        $scope.isBusy = true;
        apiFactory.getAllBlocks(page_id).success(function(data){
        
        var data_len = data.info.length;
        for(var d = 0; d < data_len; d++){
        
            $scope.block_list.push(data.info[d]);
        }   
        $scope.isBusy = false;
        $scope.nxt_page += 1;
    
        }).error(function(err){
    
            $location.path('/');
            $rootScope.error = true;
            $scope.nxt_page = 2;
    
        }); 
        
        
    }
    
  
};


}]);