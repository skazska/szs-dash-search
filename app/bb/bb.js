'use strict';

angular.module('appointments.bb', ['ngRoute', 'szsBbSearch'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/bb', {
      templateUrl: 'bb/bb.html',
      controller: 'bbCtrl'
    });
  }])

  .controller('bbCtrl', ['$scope', function($scope) {



  }]);