var test = require("unit.js");
const { TestInitializer } = require("./test_initializer.js");

describe("Testing Comparison Tool Page", function () {
  it("Restore Setting", () =>
    TestInitializer("compareElements", function () {
      require("../extension/css/js/flatui-checkbox.js");
      const {
        restoreSettings,
      } = require("../extension/js/tabs/ComparisonTool.js");
      restoreSettings();
    })).timeout(5000);

  it("Persist Setting and Process Snapshot", () =>
    TestInitializer("compareElements", function () {
      const {
        persistSettingAndProcessSnapshot,
      } = require("../extension/js/tabs/ComparisonTool.js");
      persistSettingAndProcessSnapshot();
    })).timeout(5000);

  it("Make First Snapshot", () =>
    TestInitializer("compareElements", function () {
      const {
        makeFirstSnapshot,
      } = require("../extension/js/tabs/ComparisonTool.js");
      makeFirstSnapshot();
    })).timeout(5000);

  it("Make Second Snapshot", () =>
    TestInitializer("compareElements", function () {
      const {
        makeSecondSnapshot,
      } = require("../extension/js/tabs/ComparisonTool.js");
      makeSecondSnapshot();
    })).timeout(5000);

  it("Compare Snapshot", () =>
    TestInitializer("compareElements", function () {
      require("../extension/js/libs/jquery.htmlClean.js")();
      const {
        processFirstSnapshot,
        processSecondSnapshot,
        compareSnapshots,
      } = require("../extension/js/tabs/ComparisonTool.js");
      processFirstSnapshot();
      processSecondSnapshot();
      compareSnapshots();
    })).timeout(5000);

  it("Show Detail", () =>
    TestInitializer("compareElements", function () {
      const { showDetail } = require("../extension/js/tabs/ComparisonTool.js");
      showDetail();
      showDetail();
    })).timeout(5000);

  it("Truncate", () =>
    TestInitializer("compareElements", function () {
      require("../extension/js/libs/jquery.htmlClean.js")();
      const {
        truncateSwitch,
      } = require("../extension/js/tabs/ComparisonTool.js");
      truncateSwitch();
      truncateSwitch();
    })).timeout(5000);
});
