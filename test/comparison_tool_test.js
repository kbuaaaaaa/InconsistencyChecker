var test = require('unit.js');
const jsdom = require('jsdom');
const {Template, Element, Color, Border, Font} = require("../project/extension/js/template.js");

describe('Testing Comparison Tool Page', function(){

  it('Test Name',function(){
    return jsdom.JSDOM.fromFile('project/extension/panel.html')
    .then(function(dom) {
      var window = dom.window;
      const jquery = require("jquery")(dom.window);
      global.document = window.document;
      global.window = window;
      var $ = jQuery = require('jquery')(window);
      global.$ = $;
    }).then(function() {
        global.CSSStringifier = require( "../project/extension/js/tools/CSSStringifier").CSSStringifier;
        global.ShorthandPropertyFilter = require( "../project/extension/js/filters/ShorthandPropertyFilter").ShorthandPropertyFilter;
        global.WebkitPropertiesFilter = require( "../project/extension/js/filters/WebkitPropertiesFilter").WebkitPropertiesFilter;
        global.DefaultValueFilter = require( "../project/extension/js/filters/DefaultValueFilter").DefaultValueFilter;
        global.SameRulesCombiner = require( "../project/extension/js/tools/SameRulesCombiner").SameRulesCombiner;
        global.BorderRadiusWorkaround = require( "../project/extension/js/tools/BorderRadiusWorkaround").BorderRadiusWorkaround;
        global.Snapshooter = require("../project/extension/js/tools/Snapshooter.js").Snapshooter;
        global.diff_match_patch = require("../project/extension/js/diff_match_patch.js").diff_match_patch;
        require('../project/extension/css/js/bootstrap.min.js');
        require('../project/extension/css/js/flatui-checkbox.js');
        require('../project/extension/js/libs/jquery.htmlClean.js');
      const {
        restoreSettings,
        persistSettingAndProcessSnapshot,
        makeFirstSnapshot,
        processFirstSnapshot,
        makeSecondSnapshot,
        processSecondSnapshot,
        compareSnapshots,
        showDetail,
        truncateSwitch,
        truncate
      } = require("../project/extension/js/tabs/ComparisonTool.js");


      //your tests goes here. If there is an undefined error or some weird shit you have no idea of, message Bua.
      //before running tests. tests take forever on the pipeline but you can run it locally. make sure you have node on your machine.
      //then do "npm install" for unitjs, mocha, jquery, jsdom.
      //run tests by "mocha test"
        //To write different tests copy this skeleton

    });
  });

});