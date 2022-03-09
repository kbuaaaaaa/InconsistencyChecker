var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');

describe('Testing Template Builder Page', function(){
  it('Test Name', () => TestInitializer(function() {
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
    //To write different tests copy this skeleton
  }));
});