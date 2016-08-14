// angular.module('BCE.voteController', ["BCE.apiFactory","BCE.wsFactory","monospaced.qrcode",'infinite-scroll','angular-loading-bar']); //instantiates
angular.module('BCE').controller("MotionController", ["$scope", "$rootScope", "wsFactory", "$routeParams", "$location", function($scope, $rootScope, wsFactory, $routeParams, $location){
    
    var vm = this;
    vm.data = wsFactory.motion_list;

    
    
    
}])
.controller("MotionSuccessController", ["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){
    
    
    $scope.data = [];
    apiFactory.getSuccessMotions().success(function(data){
        
        var data_length = data.length;
        for(var m = 0; m < data_length; m++){
            $scope.data.push(data[m]);
        }
    })
    .error(function(err){ $location.path('/'); });
    
    
}])
.controller("VotedForMotionController", ["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){
    
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

    

    if (isAlphaNumeric(id) === false || id_length !== 40){
            $location.path('/');
            $rootScope.error = true;
    }
    else if (isNumeric(page_id) === false){
        
            $location.path('/');
            $rootScope.error = true;
    }
    else{ //the route params are clean
            
        $scope.data = [];        
            
        $scope.id = id;

        apiFactory.getVotedForMotions(id,page_id).success(function(data){

            var data_length = data.length;
            for(var m = 0; m < data_length; m++){
                $scope.data.push(data[m]);
            }
        })
        .error(function(err){ console.log(err); $location.path('/'); });
            
        
        $scope.nxt_page = 2;

        $scope.moreblocks = function(page_id, num_blocks,id){

            // Let's find how many pages
            var num_pages = Math.ceil(num_blocks/15);

            if ($scope.nxt_page <= num_pages){
                $scope.isBusy = true;

            apiFactory.getVotedForMotions(id,page_id).success(function(data){

                var data_len = data.length;
                for(var d = 0; d < data_len; d++){

                    $scope.data.push(data[d]);
                }                   
                $scope.nxt_page += 1;
                $scope.isBusy = false;
                }).error(function(err){

                    $location.path('/');
                    $rootScope.error = true;
                    $scope.nxt_page = 2;

                });

                



            }


        };
        
    } //routeparams are clean
    
}])
.controller("VotedForCustodianController", ["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){
    
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
    var amount_id = $routeParams.amount_id;
    var page_id = $routeParams.page_id;

    

    if (isAlphaNumeric(id) === false || (id_length !== 34 && id_length !== 33)){
            $location.path('/');
            $rootScope.error = true;
    }
    else if (isNumeric(page_id) === false){
        
            $location.path('/');
            $rootScope.error = true;
    }
    else if (isNumeric(amount_id) === false){
        
            $location.path('/');
            $rootScope.error = true;
    }
    else{ //the route params are clean
            
        $scope.data = [];       
            
        $scope.id = id;
        $scope.amount = amount_id;
        apiFactory.getVotedForCustodians(id,amount_id,page_id).success(function(data){

            var data_length = data.length;
            for(var m = 0; m < data_length; m++){
                $scope.data.push(data[m]);
            }
        })
        .error(function(err){ console.log(err); $location.path('/'); });
                
        $scope.nxt_page = 2;

        $scope.moreblocks = function(page_id, num_blocks,id){

            // Let's find how many pages
            var num_pages = Math.ceil(num_blocks/15);

            if ($scope.nxt_page <= num_pages){
                $scope.isBusy = true;

                apiFactory.getVotedForCustodians(id,amount_id,page_id).success(function(data){

                var data_len = data.length;
                for(var d = 0; d < data_len; d++){

                    $scope.data.push(data[d]);
                }   
                $scope.nxt_page += 1;
                $scope.isBusy = false;

                }).error(function(err){

                    $location.path('/');
                    $rootScope.error = true;
                    $scope.nxt_page = 2;

                });

                



            }


        };
        
    } //routeparams are clean
    
}])
.controller("CustodianController", ["$scope", "$rootScope", "wsFactory", "$routeParams", "$location", function($scope, $rootScope, wsFactory, $routeParams, $location){
    
    var vm = this;
    vm.data = wsFactory.custo_list;
    
        
    
}])
.controller("CustodianSuccessController", ["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){
    
    
    $scope.data = [];
    apiFactory.getSuccessCustodians().success(function(data){
        
        var data_length = data.length;
        for(var m = 0; m < data_length; m++){
            $scope.data.push(data[m]);
        }
    })
    .error(function(err){ $location.path('/'); });
    
    
}]);