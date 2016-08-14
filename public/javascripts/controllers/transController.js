// angular.module('BCE.transController', ["BCE.apiFactory", 'BCE.wsFactory', "ngRoute", 'yaru22.angular-timeago','angular-loading-bar']); //instantiates
angular.module('BCE')
.controller("TransController",["$scope","$rootScope","apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){ 

var id = $routeParams.id;
var id_length = id.length;
    //SECURITY CYCLE
    if (id_length < 64){
       
        $location.path('/');
        
    }
    else{
        
        apiFactory.getTx(id)
        .success(function(data){ 
                
                $scope.tx = data;
            
            
        })
        .error(function(err){

                $location.path('/');
                $rootScope.error = true;
        });
   
    }
 
    
    

}])
.controller("TransLatestController",["$scope", "$rootScope", "wsFactory", function($scope, $rootScope, wsFactory){ 


$scope.tx_list = wsFactory.new_tx;


}]);