var test = require('unit.js');
const jsdom = require('jsdom');
const {Template, Element, Color, Border, Font} = require("../project/extension/js/template.js");

describe('Testing Compare Template Page', function(){

  it('Clear All',function(){
    return jsdom.JSDOM.fromFile('project/extension/panel.html')
    .then(function(dom) {
      var window = dom.window;
      const jquery = require("jquery")(dom.window);
      global.document = window.document;
      global.window = window;
      var $ = jQuery = require('jquery')(window);
      global.$ = $;
    }).then(function() {
      const {
        clearAll,
        startTemplateComparison,
        traverseAndCompare,
        getChildElementCount,
        getTagName,
        getStyle,
        createElementStyle,
        parseStyleString,
        rgb2hex,
        compareAgainstTemplate,
        appendPropertyDiv,
        highlightElement,
        displayTemplate,
        addPropertyCode
      } = require("../project/extension/js/tabs/CompareTemplate.js");
      template = new Template("Example Template",
                    [new Color("#808080"),
                    new Color("#232F3E"),
                    new Color("#0f1111")],
                    [new Font("normal", "normal", "normal", "14px", "20px", "\"Amazon Ember\", Arial, sans-serif"),
                    new Font("normal","normal","400", "14px", "20px", "\"Amazon Ember\", Arial, sans-serif"),
                    new Font("normal", "normal", "400", "14px", "19px", "\"Amazon Ember\", Arial, sans-serif"),
                    new Font("normal", "normal", "400", "13px", "19px", "\"Amazon Ember\", Arial, sans-serif"),
                    new Font("normal", "normal", "normal", "13px", "19px", "\"Amazon Ember\", Arial, sans-serif")],
                    [new Border( "0px", "none", "#0f1111")]);
      clearAll();
      test
        .object(template)
        .hasProperty('name')
        .hasProperty('color')
        .hasProperty('font')
        .hasProperty('border');
    });
  });

});