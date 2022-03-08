var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');

describe('Testing Compare Template Page', function(){
  it('Clear All', () => TestInitializer(function() {
      const {Template, Element, Color, Border, Font} = require("../project/extension/js/template.js");
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
        .hasProperty('name', "Example Template")
        .hasProperty('color')
        .hasProperty('font')
        .hasProperty('border');
  }));
});