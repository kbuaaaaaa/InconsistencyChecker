var test = require("unit.js");
const { FONT_STYLE } = require("../project/extension/js/values.js");
const { TestInitializer } = require("./test_initializer.js");

describe("Testing Template Builder Page", function () {
  it("Switch To Add", () =>
    TestInitializer("templateBuilder", function () {
      const {
        switchToAdd,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      switchToAdd();
    })).timeout(5000);

  it("Add", () =>
    TestInitializer("templateBuilder", function () {
      const {
        add,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      add();
    })).timeout(5000);

  it("Add Label", () =>
    TestInitializer("templateBuilder", function () {
      const {
        addLabel,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      addLabel("test", document.createElement("div"));
    })).timeout(5000);

  it("Add Text Input", () =>
    TestInitializer("templateBuilder", function () {
      const {
        addTextInput,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      addTextInput("test", "test", document.createElement("div"));
    })).timeout(5000);

  it("Create Select Element", () =>
    TestInitializer("templateBuilder", function () {
      const {
        createSelect,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      createSelect();
    })).timeout(5000);

  it("Handle Select Change", () =>
    TestInitializer("templateBuilder", function () {
      const {
        createSelect,
        selectChange,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      let [selectLabel, select] = createSelect();
      select.selectedIndex = 1;
      selectChange(select, document.createElement("div"));
      select.selectedIndex = 2;
      selectChange(select, document.createElement("div"));
      select.selectedIndex = 3;
      selectChange(select, document.createElement("div"));
    })).timeout(5000);

  it("Create Select Input", () =>
    TestInitializer("templateBuilder", function () {
      const {
        createSelectInput,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      createSelectInput("test", FONT_STYLE);
    })).timeout(5000);

  it("Create Delete Button", () =>
    TestInitializer("templateBuilder", function () {
      const {
        createDelete,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      createDelete();
    })).timeout(5000);

  it("Delete", () =>
    TestInitializer("templateBuilder", function () {
      const {
        del,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
    })).timeout(5000);

  it("Save Template", () =>
    TestInitializer("templateBuilder", function () {
      const {
        save,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      save();
    })).timeout(5000);

  it("Clear Template Inputs", () =>
    TestInitializer("templateBuilder", function () {
      const {
        clear,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      clear();
    })).timeout(5000);

  it("Download Template", () =>
    TestInitializer("templateBuilder", function () {
      const {
        downloadTemplate,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
    })).timeout(5000);

  it("Generate Template Input From a Template", () =>
    TestInitializer("templateBuilder", function () {
      const {
        buildTemplateInput,
      } = require("../project/extension/js/tabs/TemplateBuilder.js");
      buildTemplateInput();
    })).timeout(5000);
});
