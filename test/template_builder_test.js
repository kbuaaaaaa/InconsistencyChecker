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
        switchToAdd,
        add,
        addLabel,
        addTextInput,
        addSelectInput,
        del,
        createSelectInput,
        save,
        clear,
        downloadTemplate,
        reset
      } = require("../project/extension/js/tabs/TemplateBuilder.js");


      //your tests goes here. If there is an undefined error or some weird shit you have no idea of, message Bua.
      //before running tests. tests take forever on the pipeline but you can run it locally. make sure you have node on your machine.
      //then do "npm install" for unitjs, mocha, jquery, jsdom.
      //run tests by "mocha test"

    });
  });

});