// angular.module('BCE.statusController', ["BCE.apiFactory", "BCE.wsFactory",'angular-loading-bar']); //instantiates
angular.module('BCE')
.controller("StatusPageController",["$scope","$rootScope","apiFactory", function($scope,$rootScope,apiFactory){ 

apiFactory.getStatusPage().success(function(data){ 

$scope.status_data = data.info;
$scope.data = data;

});

}])
.controller("StatusController",['$scope','$rootScope','wsFactory', function($scope,$rootScope,wsFactory){

	$scope.ws = wsFactory;



}])
.controller("RichListBKSController",['$scope','$rootScope','apiFactory', function($scope,$rootScope,apiFactory){

apiFactory.getRichListBKS().success(function(data){ 

$scope.data = data;

});	



}]);