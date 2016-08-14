// angular.module('BCE.addressController', ["BCE.apiFactory","monospaced.qrcode",'infinite-scroll','angular-loading-bar']); //instantiates
angular.module('BCE')
.controller("AddressController",["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){ 

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

    

if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
        $location.path('/');
        $rootScope.error = true;
}
else if (isNumeric(page_id) === false){
        
       $location.path('/');
       $rootScope.error = true;
}
else{ //the route params are clean

apiFactory.getAddress(id,1).success(function(data){ 

    $scope.addr = data;
    
    
}).error(function(err){
    
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
        apiFactory.getMoreTxs(id, page_id).success(function(data){
        
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

    
}]);