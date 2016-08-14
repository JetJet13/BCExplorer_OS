// angular.module('BCE.apiFactory', []); //instantiates
angular.module('BCE')
.factory('apiFactory', ['$http','$window', function($http,$window){
    
    var apiFactory = {};
    apiFactory.getBlockDetails = function (id,pageId) {
        return $http.get('/api/block/' + id + '/' + pageId);
    };
    apiFactory.getMoreBlockTxs = function (id,pageId){ // for the address page
        return $http.get('/api/moreblocktxs/' + id + '/' + pageId);  
    };
    apiFactory.getLatestBlocks = function (num){
        return $http.get('/api/block_latest/' + num);  
    };
    apiFactory.getAllBlocks = function (num){
        return $http.get('/api/all_blocks/' + num);  
    };
    apiFactory.getHashType = function (id){
        return $http.get('/api/hash_type/' + id)
    }
    apiFactory.getTx = function (id){
        return $http.get('/api/tx/' + id);  
    };
    apiFactory.getAddress = function (id,pageId){
        return $http.get('/api/address/' + id + '/' + pageId);  
    };
    apiFactory.getMoreTxs = function (id,pageId){ // for the address page
        return $http.get('/api/moretxs/' + id + '/' + pageId);  
    };
    apiFactory.getStatusPage = function (){
        return $http.get('/api/status');  
    };
    apiFactory.getStatus = function (){
        return $http.get('/api/status_info');  
    };
    apiFactory.getMotions = function (){
        return $http.get('/api/motions');  
    };
    apiFactory.getSuccessMotions = function (){
        return $http.get('/api/motions_passed');  
    };
    apiFactory.getVotedForMotions = function (id, page_id){
        return $http.get('/api/motions_votedfor/' + id + '/' + page_id);  
    };
    apiFactory.getVotedForCustodians = function (id, amount_id, page_id){
        return $http.get('/api/custodians_votedfor/' + id + '/' + amount_id+ '/' + page_id);  
    };
    apiFactory.getSuccessCustodians = function (){
        return $http.get('/api/custodians_passed');  
    };
    apiFactory.getCustodians = function (){
        return $http.get('/api/custodians');  
    };
    apiFactory.getSizeChart = function (){
        return $http.get('/api/size_chart');  
    };
    apiFactory.getDiffChart = function (){
        return $http.get('/api/diff_chart');  
    };
    apiFactory.getBlockChart = function (){
        return $http.get('/api/block_chart');  
    };
    apiFactory.getNumTxChart = function (){
        return $http.get('/api/numtx_chart');  
    };
    apiFactory.getCDChart = function (){
        return $http.get('/api/cd_chart');  
    };
    apiFactory.getMintChart = function (){
        return $http.get('/api/mint_chart');  
    };
    apiFactory.getRichListBKS = function (){
        return $http.get('/api/rich_list_bks'); 
    };
     return apiFactory;
}]);