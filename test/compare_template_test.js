var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');

describe('Testing Compare Template Page', function(){
  it('Clear All', () => TestInitializer("compareTemplate",function() {
      const {Template, Element, Color, Border, Font} = require("../project/extension/js/template.js");
      const {  clearAll } = require("../project/extension/js/tabs/CompareTemplate.js");
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
      test.assert(template.color.length == 0,"Color is not empty")
      test.assert(template.font.length == 0,"Font is not empty")
      test.assert(template.border.length == 0,"Border is not empty")
  })).timeout(5000);
  it('RGB To HEX', () => TestInitializer("compareTemplate",function() {
    const {Template, Element, Color, Border, Font} = require("../project/extension/js/template.js");
    const { rgb2hex } = require("../project/extension/js/tabs/CompareTemplate.js");
    let colors = ["rgb(0,0,0)","rgb(255,255,255)","rgb(255,0,0)","rgb(0,255,0)","rgb(0,0,255)",
                      "rgb(255,255,0)","rgb(0,255,255)","rgb(255,0,255)","rgb(192,192,192)","rgb(128,128,128)",
                      "rgb(128,0,0)","rgb(128,128,0)","rgb(0,128,0)","rgb(128,0,128)","rgb(0,128,128)", "rgb(0,0,128)"];
    let correctHEX = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff", "#c0c0c0",
                    "#808080", "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"];
    for (let index = 0; index < colors.length; index++) {
      let hex = rgb2hex(colors[index])
      test.assert(hex == correctHEX[index], `Wrong hex conversion for ${colors[index]} : Expect ${correctHEX[index]} Got ${hex}`);
    }

  }));
});