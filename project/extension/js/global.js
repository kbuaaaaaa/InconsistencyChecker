var template = new Template(),
  colors = [],
  fonts = [],
  borders = [];
  console = chrome.extension.getBackgroundPage().console;

var data = {};
data.index = 0;
data.list = ["select", "color", "font", "border"];

function readTemplate(reader,event,_callback) {
    reader.addEventListener("load", () => {
      localStorage.setItem("json-file", reader.result);
      var styleFromJSON = JSON.parse(reader.result);
      var templateParsed = new Template([], [], []);

      for (const font of styleFromJSON.font) {
        var temp = new Font(
          font.font_style,
          font.font_variant,
          font.font_weight,
          font.font_size,
          font.line_height,
          font.font_family
        );
        templateParsed.font.push(temp);
      }

      for (const border of styleFromJSON.border) {
        var temp = new Border(
          border.border_width,
          border.border_style,
          border.border_color
        );
        templateParsed.border.push(temp);
      }

      for (const color of styleFromJSON.color) {
        var temp = new Color(color.color);
        templateParsed.color.push(temp);
      }

      template = templateParsed;
      if(_callback){
        _callback();
      }
    });
}
