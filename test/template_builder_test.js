var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');

describe('Testing Template Builder Page', function(){
  it('Test Name', () => TestInitializer("templateBuilder",function() {
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


  })).timeout(5000);;
});