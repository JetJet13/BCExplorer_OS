// angular.module('BCE.chartController', ["BCE.apiFactory","BCE.wsFactory","monospaced.qrcode",'infinite-scroll','angular-loading-bar']); //instantiates
angular.module('BCE')
.controller("ChartController", ["$scope", "$rootScope", "apiFactory", "$routeParams", "$location", function($scope, $rootScope, apiFactory, $routeParams, $location){ 


var id = $routeParams.id; 

if (id !== "size" && id !== "diff" && id !== "numblocks" && id !== "numtx" && id !== "sdd" && id !== "mint"){
    $location.path('/');
}
else if (id === "size"){
    $scope.id = id;
    apiFactory.getSizeChart().success(function(data){ 

$scope.chartSize ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
        colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
    
        title: {
            text: 'Average Block Sizes (KB)',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
        
            }
            
        },
        yAxis: {
            min:0,

            title: {
                text: 'Size (KB)',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
                
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
        
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'size',
            data: data.data,
            tooltip: {
                        valueSuffix: ' KB'
            }
            
        }]
  };


});
}
else if (id === "diff"){
    $scope.id = id;
    apiFactory.getDiffChart().success(function(data){ 

$scope.chartDiff ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
    colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
        title: {
            text: 'Average Block Difficulty',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
            
        },
        yAxis: {
            min:0,

            title: {
                text: 'Difficulty',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'Diff.',
            data: data.data,
            tooltip: {
                        
            }
            
        }]
  };


});
}
else if (id === "numblocks"){
    $scope.id = id;
    apiFactory.getBlockChart().success(function(data){ 

$scope.chartNumBlocks ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
        colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
        title: {
            text: 'Average Number of Blocks',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }   
        },
        yAxis: {
            min:0,

            title: {
                text: 'Num. of Blocks',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'Num. Blocks',
            data: data.data,
            tooltip: {
                        valueSuffix: ' blocks'
            }
            
        }]
  };


});
}
else if (id === "numtx"){
    $scope.id = id;
    apiFactory.getNumTxChart().success(function(data){ 

$scope.chartNumTx ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
        colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
        title: {
            text: 'Average Number of Trans.',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
              style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        yAxis: {
            min:0,

            title: {
                text: 'Num. of Trans.',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'Num. Trans.',
            data: data.data,
            tooltip: {
                        
            }
            
        }]
  };


});
}
else if (id === "sdd"){
    $scope.id = id;
    apiFactory.getCDChart().success(function(data){ 

$scope.chartCD ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
        colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
        title: {
            text: 'Average Coinage Destroyed (SDD)',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
              style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        yAxis: {
            min:0,

            title: {
                text: 'SDD',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'SDD',
            data: data.data,
            tooltip: {
                        valueSuffix: ' SDD'
            }
            
        }]
  };


});
}
else if (id === "mint"){
    $scope.id = id;
    apiFactory.getMintChart().success(function(data){ 

$scope.chartMint ={
    
    options:{
    chart: {
            type: 'line',
            zoomType: 'x',
//          backgroundColor: '#FFFFFF',
            style: {
                fontFamily: 'DINPro'
            }
        },
        colors: ['#43B985', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    },
        title: {
            text: 'Average Mint Amount',
            style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
        },
        xAxis: {
          type: 'datetime',
          title: {
                text: 'Date',
              style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        yAxis: {
            min:0,

            title: {
                text: 'BlockShares (BKS)',
                style: {
	               color: '#2C4055',
                    fontWeight: 'bold'
                }
            },
            labels:{
                style: {
	               color: '#2C4055'
                    
                }
            }
        },
        subtitle:{
              
                text: 'every 24hrs (source: bcblockexplorer.com)',
                style: {
	               color: '#2C4055'
                }
            } ,
        series: [{
            name: 'mint',
            data: data.data,
            tooltip: {
                        valueSuffix: ' BKS'
            }
            
        }]
  };


});
}


}]);