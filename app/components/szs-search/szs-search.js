'use strict';


angular.module('szsSearch', ['szsKeyList'])
  /**
   * @ngdoc directive
   * @name bbSearch
   * @restrict E
   * @requires $http
   * @description
   * a complex component wires up search string, search options, search results and server communications
   */
  .directive('szsSearch', [function() {
    return {
      restrict: 'E',
//      transclude: true,
      scope: {
        searchStr: '=szsSearchStr'
      },
      link: function(scope, elt, attrs, ctrl){
//        scope.data = scope.szsGetDataFn();
      },
      templateUrl: 'components/szs-search/szs-search.html'
    };
  }])

;


