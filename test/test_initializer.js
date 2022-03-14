const jsdom = require('jsdom');
global.switch = 1;
global.Template = require("../project/extension/js/template.js").Template;
global.Element = require("../project/extension/js/template.js").Element;
global.Color = require("../project/extension/js/template.js").Color;
global.Border = require("../project/extension/js/template.js").Border;
global.Font = require("../project/extension/js/template.js").Font;
global.FONT_STYLE = require("../project/extension/js/values.js").FONT_STYLE;
global.FONT_VARIANT = require("../project/extension/js/values.js").FONT_VARIANT;
global.FONT_WEIGHT = require("../project/extension/js/values.js").FONT_WEIGHT;
global.GENERIC_FAMILY = require("../project/extension/js/values.js").GENERIC_FAMILY;
global.BORDER_STYLE = require("../project/extension/js/values.js").BORDER_STYLE;
global.PROPERTY = require("../project/extension/js/values.js").PROPERTY;
global.CSSStringifier = require( "../project/extension/js/tools/CSSStringifier").CSSStringifier;
global.ShorthandPropertyFilter = require( "../project/extension/js/filters/ShorthandPropertyFilter").ShorthandPropertyFilter;
global.WebkitPropertiesFilter = require( "../project/extension/js/filters/WebkitPropertiesFilter").WebkitPropertiesFilter;
global.DefaultValueFilter = require( "../project/extension/js/filters/DefaultValueFilter").DefaultValueFilter;
global.SameRulesCombiner = require( "../project/extension/js/tools/SameRulesCombiner").SameRulesCombiner;
global.BorderRadiusWorkaround = require( "../project/extension/js/tools/BorderRadiusWorkaround").BorderRadiusWorkaround;
global.Snapshooter = require("../project/extension/js/tools/Snapshooter.js").Snapshooter;
global.diff_match_patch = require("../project/extension/js/diff_match_patch.js").diff_match_patch;
function TestInitializer(pageName,_callback){
    return jsdom.JSDOM.fromFile(`project/extension/${pageName}.html`)
      .then(function(dom) {
        var window = dom.window;
        const jquery = require("jquery")(dom.window);
        global.document = window.document;
        global.window = window;
        var $ = jQuery = require('jquery')(window);
        global.$ = $;
      }).then(function() {
        global.chrome = null;
        global.template = new Template("test",[new Color("#ffffff")],[new Font("normal","normal","400",14,20,"\"Amazon Ember\", Arial, sans-serif")],[new Border(10,"none","#ffffff")]);
        _callback();
      });
}

module.exports = {TestInitializer};