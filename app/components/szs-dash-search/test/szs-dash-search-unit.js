'use strict';

describe('module szsDashSearch',function(){
  describe('szsDashSearchQueryProvider', function(){
    var prv, srv;
    beforeEach(function(){
      angular.module('testMod',['szsDashSearch']).config(function(szsDashSearchQueryProvider){
        prv = szsDashSearchQueryProvider;
      });
      module('testMod');
      inject(function(szsDashSearchQuery){
        srv = szsDashSearchQuery;}
      );
    });
    it('should have urlPrefix to configure', function() {
      expect(prv.urlPrefix()).toBe('');
      prv.urlPrefix('data/');
      expect(prv.urlPrefix()).toBe('data/');
    });
    it('urlPrefix should be attached to service url', function(){
      prv.urlPrefix('data/');
      var inst = srv('search.json',function(res){});
      expect(inst.req().url).toBe('data/search.json');
    });
  });
  describe('szsDashSearchQuery', function() {
    var $httpBackend, szsDashSearchQuery, szsKeyList, szsDashSearchKeyListOpts;
    var inst, result, opts;
    beforeEach(module('szsDashSearch'));
    beforeEach(inject(function (_$httpBackend_, _szsDashSearchQuery_, _szsKeyList_, _szsDashSearchKeyListOpts_) {
      $httpBackend = _$httpBackend_;
      szsDashSearchQuery = _szsDashSearchQuery_;
      szsKeyList = _szsKeyList_;
      szsDashSearchKeyListOpts = _szsDashSearchKeyListOpts_;

      opts = szsKeyList();
      opts.add('opt', 'itm', 'option', 'item');
      opts.add('opt', 'itm2', 'option', 'item2');
      opts.add('opt1', 'itm3', 'option', 'item2');
      opts = szsDashSearchKeyListOpts(opts.opts);

      inst = szsDashSearchQuery('search', function (res) {
        result = res;
      });
      result = null;
    }));
    it('should return object with method to request search service by search string and options',
      function () {
        expect(typeof inst.req).toBe('function');
        expect(typeof inst.request).toBe('function');
      }
    );
    it('should prepare request on search string and options', function () {
      inst.request('search', opts);
      var req = inst.req();
      expect(req.params).toEqual({opt: ['itm', 'itm2'], opt1: ['itm3'], searchStr: 'search'})
    });
    it('should perform empty request ', function(){
      $httpBackend.expectGET('')
        .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
      szsDashSearchQuery(undefined, function (res) { result = res; }).request();
      $httpBackend.flush();
      expect(result).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
    });
    it('should perform request with params', function(){
      $httpBackend.expectGET('search?opt=itm&opt=itm2&opt1=itm3&searchStr=abc')
        .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
      szsDashSearchQuery('search', function (res) { result = res; }).request('abc', opts);
      $httpBackend.flush();
      expect(result).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
    });
  });
  describe('szsDashSearchKeyListOpts', function(){
    var srv;

    beforeEach(module('szsDashSearch'));

    beforeEach(inject(function(szsDashSearchKeyListOpts){
      srv = szsDashSearchKeyListOpts;
    }));

    it("Should convert szsKeyList options data {opt:{title:'o',items:{itm:{title:'i'}}}} to {opt:['itm']}", function(){
      var input = {opt:{title:'o',items:{itm:{title:'i'}}}};
      var output = {opt:['itm']};
      expect(srv(input)).toEqual(output);
    });
  });
  describe('szsDashSearch directive', function(){
    var $compile, $rootScope, $httpBackend;
    var scope, iScope, elem;
    beforeEach(function(){

      module('templates');
      module('szsDashSearch');
    });
    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;

      scope = $rootScope.$new();
    }));
    describe('apply and auto apply', function(){
      beforeEach(function(){
        $httpBackend.expectGET('').respond([]);
        elem = '<szs-dash-search ></szs-dash-search>';
        elem = $compile(elem)(scope);
      });
      it('should contain element with class apply-btn', function(){
        $rootScope.$digest();
        expect(elem.find('.apply-btn').length).toBe(1);
      });
      it('should initiate search request if auto-apply is set', function(){
        elem = '<szs-dash-search auto-apply></szs-dash-search>';
        elem = $compile(elem)(scope);
        expect($httpBackend.flush).not.toThrow();
      });
      it('should initiate search request when click on applyBtn if auto-apply is not set', function(){
        expect($httpBackend.flush).toThrow();
        $rootScope.$digest();
        elem.find('.apply-btn').eq(0).click();
        expect($httpBackend.flush).not.toThrow();
      });
      it('disable apply button when aut-apply is set', function(){
        $rootScope.$digest();
        expect(elem.find('.apply-btn').eq(0).is("[disabled]")).toBeFalsy();
        elem = '<szs-dash-search auto-apply></szs-dash-search>';
        elem = $compile(elem)(scope);
        $rootScope.$digest();
        expect(elem.find('.apply-btn').eq(0).is("[disabled]")).toBeTruthy();
      });
      it('should decorate along change, apply, success, error cycle', function(){
        $rootScope.$digest();
        var btn = elem.find('.apply-btn').eq(0);
        iScope = elem.isolateScope();
        iScope.searchStr = 'sss';
        $rootScope.$digest();
        expect(btn.text()).toBe("Apply");
        expect(btn.hasClass("btn-primary")).toBeTruthy();
        $httpBackend.resetExpectations();
        $httpBackend.expectGET('?searchStr=sss')
          .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        btn.click();
        expect(btn.text()).toBe("Wait");
        expect(btn.hasClass("btn-info")).toBeTruthy();
        $httpBackend.flush();
        expect(btn.text()).toBe("Ok");
        expect(btn.hasClass("btn-success")).toBeTruthy();
        iScope.itemClick({contentType:"option",option:"opt", title:"option"}, {item:"itm", title:"item"});
        $rootScope.$digest();
        expect(btn.text()).toBe("Apply");
        expect(btn.hasClass("btn-primary")).toBeTruthy();
        $httpBackend.expectGET('?opt=itm&searchStr=sss')
          .respond(400, '');
        btn.click();
        expect(btn.text()).toBe("Wait");
        expect(btn.hasClass("btn-info")).toBeTruthy();
        $httpBackend.flush();
        expect(btn.text()).toBe("Error");
        expect(btn.hasClass("btn-danger")).toBeTruthy();

      });
    });
    describe('search string',function(){
      beforeEach(function(){
        $httpBackend.expectGET('').respond([]);
        elem = '<szs-dash-search ></szs-dash-search>';
        elem = $compile(elem)(scope);
      });
      it('should be present in szs-search-string with searchStr model link', function(){
        $rootScope.$digest();
        expect(elem.find('.szs-search-string input[ng-model=searchStr]').length).toBe(1);
      });
      it('Should not request search if search string len less than min-search-str',function(){
        $httpBackend.expectGET('?searchStr=src')
          .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        elem = '<szs-dash-search search-str="src" min-search-str="4" auto-apply></szs-dash-search>';
        elem = $compile(elem)(scope);
        expect($httpBackend.flush).toThrow();
      });
    });
    describe('keyList', function(){
      beforeEach(function(){
        $httpBackend.expectGET('').respond([]);
        elem = '<szs-dash-search ></szs-dash-search>';
        elem = $compile(elem)(scope);
      });
      it('should be present with scope link set by szs-key-list attribute', function(){
        $rootScope.$digest();
        var keyList = elem.find('szs-key-list-panel');
        expect(keyList.length).toBe(1);
        iScope = elem.isolateScope();
        expect(iScope[keyList.attr("szs-key-list")]).toBeDefined();
      });
    });
    describe('results', function() {
      beforeEach(function () {
        $httpBackend.expectGET('test').
          respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}
            ,{option: 'test1', title:'test1', items:[{item: 'item1', title: 'item1'}
              ,{item: 'item2', title: 'item2'}]}]);
        elem = '<szs-dash-search svc-url="test" auto-apply></szs-dash-search>';
        elem = $compile(elem)(scope);
        $httpBackend.flush();
        $rootScope.$digest();
      });
      describe('tabs', function(){
        it('should be presented as .szs-dash-search-tabs element with .szs-dash-search-tab elements inside', function(){
          expect(elem.find('.szs-dash-search-tabs .szs-dash-search-tab').length).toBe(2);
        });
        it('should reorder szsBoardData model when .szs-dash-search-tab is clicked', function(){
          iScope = elem.isolateScope();
          expect(iScope.szsBoardData).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}
            ,{option: 'test1', title:'test1', items:[{item: 'item1', title: 'item1'}
              ,{item: 'item2', title: 'item2'}]}]);
          elem.find('.szs-dash-search-tabs .szs-dash-search-tab').eq(1).click();
          $rootScope.$digest();
          expect(iScope.szsBoardData).toEqual([
            {option: 'test1', title:'test1', items:[{item: 'item1', title: 'item1'}
              ,{item: 'item2', title: 'item2'}]},
            {option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        });
//        it('should be draggable to reorder items in data model', function(){});
      });
      describe('board', function() {
        it('should be presented as elements with szs-board-pane attribute', function () {
          expect(elem.find('[szs-board-pane]').length).toBe(2);
        });
        it('should contain items as .opt-item in panes', function(){
          expect(elem.find('.opt-item').length).toBe(3);
        });
        it('should call itemClick when .opt-item clicked', function(){
          iScope = elem.isolateScope();
          spyOn(iScope, "itemClick");
          elem.find('.opt-item').eq(0).click();
          expect(iScope.itemClick).toHaveBeenCalled();
        })
      });
    });
    describe('communication ', function(){
      it('Should request search and set response to szsBoardData',function(){
        $httpBackend.expectGET('test?searchStr=srch')
          .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        elem = '<szs-dash-search svc-url="test" search-str="srch" auto-apply></szs-dash-search>';
        elem = $compile(elem)(scope); $httpBackend.flush(); $rootScope.$digest();
        iScope = elem.isolateScope();
        expect(iScope.szsBoardData).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
      });
      it('Should send request with searchStr param, on searchStr scope value change', function(){
        $httpBackend.expectGET('test').respond([]);
        elem = $compile('<szs-dash-search svc-url="test" auto-apply></szs-dash-search>')(scope);
        $httpBackend.flush(); $rootScope.$digest();
        iScope = elem.isolateScope();
        expect(iScope.szsBoardData).toEqual([]);
        $httpBackend.expectGET('test?searchStr=1')
          .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        iScope.searchStr = '1'; $rootScope.$digest(); $httpBackend.flush();
        expect(iScope.szsBoardData).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
      });
      it("Should send request with options params, on scope's keyList change", function(){
        $httpBackend.expectGET('test').respond([]);
        elem = $compile(elem)(scope); $httpBackend.flush(); $rootScope.$digest();
        iScope = elem.isolateScope();
        expect(iScope.szsBoardData).toEqual([]);
        $httpBackend.expectGET('test?opt=itm')
          .respond([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
        iScope.szsKeyList.add('opt', 'itm', 'option', 'item'); $rootScope.$digest(); $httpBackend.flush();
        expect(iScope.szsBoardData).toEqual([{option: 'test', title:'test', items:[{item: 'item', title: 'item'}]}]);
      });

    });
    describe('interactions', function(){
      it('should reorder tabs and panes on tab click so it become first', function(){
        $httpBackend.expectGET('test').
          respond([{option: 'test', title:'test'},{option: 'test1', title:'test1'},{option: 'test2', title:'test2'}]);
        elem = $compile(elem)(scope); $httpBackend.flush(); $rootScope.$digest();
        var tabs = elem.find('.szs-dash-search-tab');
        expect(tabs.eq(0).html()).toContain('test');
        tabs.eq(1).click(); //$rootScope.$digest();
        tabs = elem.find('.szs-dash-search-tab');
        expect(tabs.eq(0).html()).toContain('test1');
      });
    });

  });
});