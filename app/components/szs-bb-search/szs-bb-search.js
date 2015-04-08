'use strict'

angular.module('szsBbSearch', ['szsSearch', 'szsKeyList'])

  .directive('szsBbSearch',['$http', function($http){
    return {
      restrict: 'E',
      scope: {
        svcUrl: '@',
        searchStr: '@'
      },
      controller: function ($scope, $element, $attrs, $transclude) {
        var opts = $scope.szsKeyListData = {OPT:{name:'OPTION', items: {ITM:'item'}}};
        $http.get($scope.svcUrl).success(function(data) {
          $scope.szsBoardData = data;
        });

        $scope.searchOptsDel = function(optKey, itemKey) {
          if (angular.isDefined(optKey)) {
            if (angular.isDefined(itemKey)) {
              if (angular.isDefined(opts[optKey].items[itemKey])) {
                delete opts[optKey].items[itemKey];
                if (Object.keys(opts[optKey].items).length == 0) delete opts[optKey].items;
              }
            } else {
              if (angular.isDefined(opts[optKey])) delete opts[optKey];
            }
          }
        };

        $scope.searchOpts = function(val, optKey, itemKey){
          if (!angular.isDefined(val)) {
            if (angular.isDefined(optKey)&&angular.isDefined(itemKey)) return opts[optKey].items[itemKey] || null;
            if (angular.isDefined(optKey)) return opts[optKey] || null;
            return opts || null;
          } else {
            if (angular.isDefined(optKey)&&angular.isDefined(itemKey)) {
              opts[optKey].items[itemKey] = val;
            } else if (angular.isDefined(optKey)) {
              opts[optKey] = val;
            } else {
              opts = val;
            }
          }
        };


      },
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: 'components/szs-bb-search/szs-bb-search.html'
    }
  }])
;