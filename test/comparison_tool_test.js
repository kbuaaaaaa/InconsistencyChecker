var test = require('unit.js');
const {TestInitializer} = require('./test_initializer.js');


describe('Testing Comparison Tool Page', function(){
    it('Test Name', () => TestInitializer("compareElements",function() {
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
    }));
});