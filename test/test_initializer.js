const jsdom = require("jsdom");
global.test = true;
global.Template = require("../extension/js/template.js").Template;
global.Element = require("../extension/js/template.js").Element;
global.Color = require("../extension/js/template.js").Color;
global.Border = require("../extension/js/template.js").Border;
global.Font = require("../extension/js/template.js").Font;
global.FONT_STYLE = require("../extension/js/values.js").FONT_STYLE;
global.FONT_VARIANT = require("../extension/js/values.js").FONT_VARIANT;
global.FONT_WEIGHT = require("../extension/js/values.js").FONT_WEIGHT;
global.GENERIC_FAMILY = require("../extension/js/values.js").GENERIC_FAMILY;
global.BORDER_STYLE = require("../extension/js/values.js").BORDER_STYLE;
global.PROPERTY = require("../extension/js/values.js").PROPERTY;
global.CSSStringifier =
  require("../extension/js/tools/CSSStringifier").CSSStringifier;
global.ShorthandPropertyFilter =
  require("../extension/js/filters/ShorthandPropertyFilter").ShorthandPropertyFilter;
global.WebkitPropertiesFilter =
  require("../extension/js/filters/WebkitPropertiesFilter").WebkitPropertiesFilter;
global.DefaultValueFilter =
  require("../extension/js/filters/DefaultValueFilter").DefaultValueFilter;
global.SameRulesCombiner =
  require("../extension/js/tools/SameRulesCombiner").SameRulesCombiner;
global.BorderRadiusWorkaround =
  require("../extension/js/tools/BorderRadiusWorkaround").BorderRadiusWorkaround;
global.Snapshooter =
  require("../extension/js/tools/Snapshooter.js").Snapshooter;
global.diff_match_patch =
  require("../extension/js/diff_match_patch.js").diff_match_patch;
global.firstSnapshot = require("./firstElement.json");
global.secondSnapshot = require("./secondElement.json");
global.data = {};
global.data.index = 0;
global.data.list = ["select", "color", "font", "border"];

function TestInitializer(pageName, _callback) {
  return jsdom.JSDOM.fromFile(`extension/${pageName}.html`)
    .then(function (dom) {
      var window = dom.window;
      const jquery = require("jquery")(dom.window);
      global.document = window.document;
      global.window = window;
      var $ = (jQuery = require("jquery")(window));
      global.$ = $;
    })
    .then(function () {
      global.chrome = null;
      global.template = new Template(
        "test",
        [new Color("#ffffff")],
        [
          new Font(
            "normal",
            "normal",
            "400",
            14,
            20,
            '"Amazon Ember", Arial, sans-serif'
          ),
        ],
        [new Border(10, "none", "#ffffff")]
      );
      global.getTemplate = function () {
        return global.template;
      };
      global.storeTemplate = function (template) {};
      global.switch = 1;
      global.Blob = class Blob {
        constructor(file, type) {}
      };
      global.chrome = {
        tabs: {
          query: function (query, _callback) {
            _callback([{ url: { id: "" } }]);
          },
          executeScript: function (tabid, code, _callback) {
            if (code.code.includes(".childElementCount")) {
              _callback(global.switch--);
            } else if (code.code.includes(".tagName")) {
              _callback(["DIV"]);
            } else if (code.code.includes("window.getComputedStyle")) {
              _callback([
                'normal|normal|400|14px|20px|"Amazon Ember", Arial, sans-serif|0px|none|rgb(15, 17, 17)|rgb(15, 17, 17)|elementID|className',
              ]);
            }
          },
        },
        runtime: {
          sendMessage: function (message, _callback = null) {
            if (_callback) {
              _callback();
            }
          },
        },
        devtools: { inspectedWindow: { eval: function (code, _callback) {} } },
      };
      _callback();
    });
}

module.exports = { TestInitializer };
