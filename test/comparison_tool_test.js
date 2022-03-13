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


    })).timeout(5000);;
});