var console = chrome.extension.getBackgroundPage().console;

var data = {};
data.index = 0;
data.list = ["select", "color", "font", "border"];

function readTemplate(reader,_callback) {
    reader.addEventListener("load", () => {
      localStorage.setItem("template",reader.result);
      if(_callback){
        _callback();
      }
    });
}

function getTemplate(){
  let template = JSON.parse(localStorage.getItem("template"));
  var templateParsed = new Template([], [], []);
  console.log(template);
  for (const font of template.font) {
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

  for (const border of template.border) {
    var temp = new Border(
      border.border_width,
      border.border_style,
      border.border_color
    );
    templateParsed.border.push(temp);
  }

  for (const color of template.color) {
    var temp = new Color(color.color);
    templateParsed.color.push(temp);
  }

  template = templateParsed;
  return template;
}

function storeTemplate(template){
  localStorage.setItem("template",JSON.stringify(template, null, 2));
}

if (typeof module !== 'undefined'){module.exports = {readTemplate};};