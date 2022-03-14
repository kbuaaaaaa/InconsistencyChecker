var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');

describe('Testing Compare Template Page', function(){
  it('Clear All', () => TestInitializer("compareTemplate",function() {
      const { clearAll } = require("../project/extension/js/tabs/CompareTemplate.js");
      clearAll();
  })).timeout(5000);
  it('RGB To HEX', () => TestInitializer("compareTemplate",function() {
    const { rgb2hex } = require("../project/extension/js/tabs/CompareTemplate.js");
    rgb2hex("rgb(0,0,0)")

  })).timeout(5000);;
  it('Start Comparison', () => TestInitializer("compareTemplate",function() {
    const { startTemplateComparison } = require("../project/extension/js/tabs/CompareTemplate.js");
    startTemplateComparison();
  })).timeout(5000);;
  it('Traverse DOM', () => TestInitializer("compareTemplate",function() {
    const { traverseAndCompare } = require("../project/extension/js/tabs/CompareTemplate.js");
    traverseAndCompare("");
    // traverseAndCompare("");
  })).timeout(5000);;
  it('Get Child Element Number', () => TestInitializer("compareTemplate",function() {
    const { getChildElementCount } = require("../project/extension/js/tabs/CompareTemplate.js");
    getChildElementCount("",()=>{});
  })).timeout(5000);;
  it('Get HTML Tag Name', () => TestInitializer("compareTemplate",function() {
    const { getTagName } = require("../project/extension/js/tabs/CompareTemplate.js");
    getTagName("",()=>{});
  })).timeout(5000);;
  it('Get Element Style', () => TestInitializer("compareTemplate",function() {
    const { getStyle } = require("../project/extension/js/tabs/CompareTemplate.js");
    getStyle("",()=>{});
  })).timeout(5000);;
  it('Parse Style', () => TestInitializer("compareTemplate",function() {
    const { parseStyleString } = require("../project/extension/js/tabs/CompareTemplate.js");
    styleString = "normal|normal|400|14px|20px|\"Amazon Ember\", Arial, sans-serif|0px|none|rgb(15, 17, 17)|rgb(15, 17, 17)|elementID|className";
    parseStyleString(styleString,"document.body");
  })).timeout(5000);;
  it('Compare Against Template', () => TestInitializer("compareTemplate",function() {
    const { compareAgainstTemplate } = require("../project/extension/js/tabs/CompareTemplate.js");
    compareAgainstTemplate(new Element(code = "document.body", id = "id", className = "name", number = "15", color = new Color("#ffffff"), font = new Font(), border = new Border()));
    compareAgainstTemplate(new Element(code = "document.body", id = "", className = "name", number = "15", color = new Color("#ffffff"), font = new Font(), border = new Border()));
    compareAgainstTemplate(new Element(code = "document.body", id = "", className = "", number = "15", color = new Color("#ffffff"), font = new Font(), border = new Border()));
  })).timeout(5000);;
  it('Append Property', () => TestInitializer("compareTemplate",function() {
    const { appendPropertyDiv } = require("../project/extension/js/tabs/CompareTemplate.js");
    appendPropertyDiv(PROPERTY.Consistent, "Font", new Font(),document.createElement("div") );
    appendPropertyDiv(PROPERTY.Inconsistent, "Font", new Font(),document.createElement("div") );

  })).timeout(5000);;
  it('Highlight Element', () => TestInitializer("compareTemplate",function() {
    const { highlightElement } = require("../project/extension/js/tabs/CompareTemplate.js");
    highlightElement();
  })).timeout(5000);;
  it('UnHighlight Element', () => TestInitializer("compareTemplate",function() {
    const { unHighlightElement } = require("../project/extension/js/tabs/CompareTemplate.js");
    unHighlightElement();
  })).timeout(5000);;
  it('Display Template', () => TestInitializer("compareTemplate",function() {
    const { displayTemplate } = require("../project/extension/js/tabs/CompareTemplate.js");
    displayTemplate();
    displayTemplate();
  })).timeout(5000);;
  it('Add Property Code', () => TestInitializer("compareTemplate",function() {
    const { addPropertyCode } = require("../project/extension/js/tabs/CompareTemplate.js");
    addPropertyCode("Font", [new Font()]);
  })).timeout(5000);;
  it('Expand All Panel', () => TestInitializer("compareTemplate",function() {
    const { expandAll } = require("../project/extension/js/tabs/CompareTemplate.js");
    expandAll();
    expandAll();
  })).timeout(5000);;
  it('Collapse Panel', () => TestInitializer("compareTemplate",function() {
    const { expandOrCollapse } = require("../project/extension/js/tabs/CompareTemplate.js");
    let testacc = document.createElement("div");
    testacc.className = "accordion";
    var panelDiv = document.createElement("div");
    panelDiv.className = "panel-template-comparison";
    panelDiv.style.display = "none";
    document.getElementById("template_comparison_output").appendChild(testacc);
    document.getElementById("template_comparison_output").appendChild(panelDiv);
    expandOrCollapse("true", "Collapse All", "none", "blocK");
  })).timeout(5000);;
  it('Create DOM Element', () => TestInitializer("compareTemplate",function() {
    const { createElementStyle } = require("../project/extension/js/tabs/CompareTemplate.js");
    styleString = "normal|normal|400|14px|20px|\"Amazon Ember\", Arial, sans-serif|0px|none|rgb(15, 17, 17)|rgb(15, 17, 17)|elementID|className";
    createElementStyle(styleString,"document.body");
  })).timeout(5000);;
});

