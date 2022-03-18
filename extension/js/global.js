const data = {};
data.index = 0;
data.list = ["select", "color", "font", "border"];

function readTemplate(reader, _callback) {
  reader.addEventListener("load", () => {
    localStorage.setItem("template", reader.result);
    if (_callback) {
      _callback();
    }
  });
}

function getTemplate() {
  let template = JSON.parse(localStorage.getItem("template"));
  const templateParsed = new Template();
  templateParsed.name = template.name;
  for (const font of template.font) {
    const temp = new Font(
      font.fontStyle,
      font.fontVariant,
      font.fontWeight,
      font.fontSize,
      font.lineHeight,
      font.fontFamily
    );
    templateParsed.font.push(temp);
  }

  for (const border of template.border) {
    const temp = new Border(
      border.borderWidth,
      border.borderStyle,
      border.borderColor
    );
    templateParsed.border.push(temp);
  }

  for (const color of template.color) {
    const temp = new Color(color.color);
    templateParsed.color.push(temp);
  }

  template = templateParsed;
  return template;
}

function storeTemplate(template) {
  localStorage.setItem("template", JSON.stringify(template, null, 2));
}

if (typeof module !== "undefined") {
  module.exports = { readTemplate, getTemplate, storeTemplate };
}
