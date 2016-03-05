var pp = angular.module('pp',['ngRoute']);
pp.config(function($routeProvider){
  $routeProvider
  .when('/',{
    templateUrl:'pages/main.html',
    controller:'mainController',
  })
});
pp.controller('mainController',['$scope','$location',
function($scope,$location){

}]);
