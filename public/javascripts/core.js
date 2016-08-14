angular.module('BCE',[
    'ngRoute',
    'monospaced.qrcode',
    'infinite-scroll',
    'highcharts-ng',
    'ngWebSocket',
    'yaru22.angular-timeago',
    'angular-loading-bar'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }])
.run(['$rootScope','$location','$window', function($rootScope, $location,$window){

$rootScope.detail = 'reg';
$rootScope.goBack = function(){

    if($location.path() !== "/"){
        return $window.history.back();
    }
    else{
        return null;
    }

}
$rootScope.goHome = function(){

    if($location.path() !== "/"){
        return $location.path("/");
    }
    else{
        return null;
    }
}
$rootScope.toggle = function(){
    
    
    if ($rootScope.detail === 'ext'){
       
        $rootScope.detail = 'reg';   
    }
    else{
       
        $rootScope.detail = 'ext';
    } 
};

$rootScope.goNav = function(id,type){
        
        if(type === "block"){
            
            $location.path("/blocks/" + id + "/1");
            
        }
        else if(type === "tx"){
             
            $location.path("/transactions/" + id);
            
        }
        else if(type === "address"){
             
            $location.path("/address/" + id + "/1");
            
        }
        
    };
    
}])
.directive('scrollToItem', function() {                                                      
    return {                                                                                 
        restrict: 'A',                                                                       
        scope: {                                                                             
            scrollTo: "@",
            offset:"=?"                                                                    
        },                                                                                   
        link: function(scope, $elm,attr) {                                                   

            $elm.on('click', function() {
            var topOffset = scope.offset || 0;                                                
                $('html,body').animate({scrollTop: $(scope.scrollTo).offset().top - topOffset  }, "slow");
            });                                                                              
        }                                                                                    
    };})
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
		
			
			$routeProvider.when('/', {
				templateUrl : '../html/home.html'			
			});

			$routeProvider.when('/blocks/:id/:page_id', {
				templateUrl : '../html/block.html'			
			});

			$routeProvider.when('/transactions/:id', {
				templateUrl : '../html/trans.html'			
			});

			$routeProvider.when('/address/:id/:page_id', {
				templateUrl : '../html/address.html'			
			});
			
			$routeProvider.when('/status', {
				templateUrl : '../html/status.html'			
			});

            $routeProvider.when('/allBlocks/:page_id', {
                templateUrl : '../html/all_blocks.html'         
            });
    
            $routeProvider.when('/motions', {
                templateUrl : '../html/motions.html'         
            });
            
            $routeProvider.when('/motions_passed', {
                templateUrl : '../html/motions_passed.html'         
            });
    
            $routeProvider.when('/votedfor/motion/:id/:page_id', {
                templateUrl : '../html/votedfor_motion.html'         
            });
            
            $routeProvider.when('/votedfor/custodian/:id/:amount_id/:page_id', {
                templateUrl : '../html/votedfor_custodian.html'         
            });
    
            $routeProvider.when('/custodians', {
                templateUrl : '../html/custodians.html'         
            });
    
            $routeProvider.when('/custodians_passed', {
                templateUrl : '../html/custodians_passed.html'         
            });

            $routeProvider.when('/charts/:id', {
                templateUrl : '../html/charts.html'         
            });

            $routeProvider.when('/status/richListBKS', {
                templateUrl : '../html/richlist_bks.html'         
            });

            $routeProvider.when('/apis', {
                templateUrl : '../html/apis.html'         
            });

            $routeProvider.otherwise({ redirectTo: '/' });
        
        $locationProvider.html5Mode(true);
	}])
.controller('QueryController',[ '$scope', '$rootScope', '$location', 'apiFactory', function($scope, $rootScope, $location, apiFactory){
    
$scope.search = {};
$rootScope.error = false;
$scope.go = function(id){
        
        var id_length = id.length;
    
        if (id_length < 64 && id_length < 33){
        
            var isheight = parseInt(id);
        
            if (isNaN(isheight)){ // id is not a height or hash
                $scope.search.id = "";
                $rootScope.error = true;
            }
            else{ //id is a height
            
                $scope.search.id = ""
                $location.path("/blocks/"+ id + "/1");
                $rootScope.error = false;
            }
        }
        else if (id_length > 64){ // id is neither a height or block/tx hash
                $scope.search.id = "";
                $rootScope.error = true;
        }
        else if (id_length === 34 || id_length === 33){
            $scope.search.id = "";
            $location.path("/address/" + id + "/1");
            $rootScope.error = false;
        }
        else{ //id might be a tx hash or block hash
        
            apiFactory.getHashType(id)
            .success(function(data){
            
                 //id is a valid hash
            
                    var hash_type = data.type;
            
                    if (hash_type === "block"){
                
                        $scope.search.id = ""
                        $location.path("/blocks/" + id + "/1");
                        $rootScope.error = false;
                    }
                    else{
                
                        $scope.search.id = ""
                        $location.path("/transactions/" + id);
                        $rootScope.error = false;
                    }
              
            
            })
            .error(function(err){

                $scope.search.id = "";
                $rootScope.error = true;

            });
        
    }
        
    };
    
    
    
    
    
}])
//------------------------------------------------------------------------------------------------
