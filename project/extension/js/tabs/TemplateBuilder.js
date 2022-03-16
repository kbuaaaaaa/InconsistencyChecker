const MARGIN_LEFT = "margin-left: 20px;";
const BORDER_RADIUS = "border-radius: 4px;";

var inputPropertyButton = $("#input_button"),
  addButton = $("#add_button"),
  saveButton = $("#save_button"),
  clearButton = $("#clear_button"),
  downloadTemplateButton = $("#download-template"),
  builderfileupload = $("#file-selector-builder-page"),
  propertyDiv = document.getElementById("property_div");

inputPropertyButton.on("click", switchToAdd);
addButton.on("click", add);
saveButton.on("click", save);
clearButton.on("click", clear);
downloadTemplateButton.on("click", downloadTemplate);
builderfileupload.on("change", function(event)
{
  const reader = new FileReader();
  readTemplate(reader,function(){buildTemplateInput();});
  reader.readAsText(this.files[0]);
  const { target = {} } = event || {};
  target.value = "";
});

function switchToAdd() {
  add();
  document.getElementById("add_and_save_and_clear").hidden = false;
  document.getElementById("input_button").style.display = "none";
}

function add() {
  data.index++;
  let div = document.createElement("div");
  let propertyValueDiv = document.createElement("div");
  div.id = "div-" + data.index;
  let [selectLabel, select] = createSelect();
  select.onchange = function(){selectChange(select,propertyValueDiv);}
  deleteButton = createDelete();
  deleteButton.onclick = () => del(div.id);
  div.appendChild(selectLabel);
  div.appendChild(select);
  div.appendChild(propertyValueDiv);
  div.appendChild(deleteButton);
  propertyDiv.appendChild(div);
}

function createSelect(){
  var selectLabel = document.createElement("label");
  selectLabel.innerHTML = " Select Property ";

  var select = document.createElement("select");
  select.className = "select-property";
  for (const val of data.list) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    select.appendChild(option);
  }
  select.style = MARGIN_LEFT + BORDER_RADIUS;
  return [selectLabel, select];
}

function createDelete(){
  var deleteButton = document.createElement("div");
  deleteButton.className = "glyphicon glyphicon-trash";
  deleteButton.innerHTML = " Delete ";
  return deleteButton;
}

function selectChange(select,propertyValueDiv){
  var value = select.options[select.selectedIndex].value;
    while (propertyValueDiv.childElementCount > 0) {
      propertyValueDiv.removeChild(propertyValueDiv.lastChild);
    }

    switch (value) {
      case "color":
        var colorDiv = document.createElement("div");
        colorDiv.className = "color-div";

        addLabel(" Color ", colorDiv);
        addTextInput("color-value", "#FFFFFF", colorDiv);

        propertyValueDiv.appendChild(colorDiv);
        break;

      case "font":
        var fontDiv = document.createElement("div");
        fontDiv.className = "font-div";

        addLabel(" Font Style ", fontDiv);
        addSelectInput("font-style-input", FONT_STYLE, fontDiv);

        addLabel(" Font Variant ", fontDiv);
        addSelectInput("font-variant-input", FONT_VARIANT, fontDiv);

        addLabel(" Font Weight ", fontDiv);
        addSelectInput("font-weight-input", FONT_WEIGHT, fontDiv);

        addLabel(" Font Size  (px) ", fontDiv);
        addTextInput("font-size-value", "12", fontDiv);

        addLabel(" Line Height (px) ", fontDiv);
        addTextInput("line-height-value", "20", fontDiv);

        addLabel(" Family Name ", fontDiv);
        addTextInput("family-name-value", '"Amazon Ember", Arial', fontDiv);

        addLabel(" Generic Family ", fontDiv);
        addSelectInput("generic-family-input", GENERIC_FAMILY, fontDiv);

        propertyValueDiv.appendChild(fontDiv);
        break;

      case "border":
        var borderDiv = document.createElement("div");
        borderDiv.className = "border-div";

        addLabel(" Border Width (px) ", borderDiv);
        addTextInput("border-width-value", "2", borderDiv);

        addLabel(" Border Style ", borderDiv);
        addSelectInput("border-style-input", BORDER_STYLE, borderDiv);

        addLabel(" Border Color ", borderDiv);
        addTextInput("border-color-value", "#FFFFFF", borderDiv);

        propertyValueDiv.appendChild(borderDiv);
        break;
      default:
        break;
    }
}

function addLabel(innerHTML, parentDiv) {
  var label = document.createElement("label");
  label.innerHTML = innerHTML;
  label.style = MARGIN_LEFT;
  parentDiv.appendChild(label);
}

function addTextInput(className, placeholder, parentDiv) {
  var textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = className;
  textInput.placeholder = placeholder;
  textInput.style = MARGIN_LEFT + BORDER_RADIUS;

  parentDiv.appendChild(textInput);
  return textInput;
}

function addSelectInput(className, object, parentDiv) {
  var selectInput = createSelectInput(className, object);
  selectInput.selectedIndex = Object.values(object).indexOf("");
  parentDiv.appendChild(selectInput);
  return selectInput;
}

function del(id) {
  const div = document.getElementById(id);
  propertyDiv.removeChild(div);
}

function createSelectInput(className, object) {
  var selectInput = document.createElement("select");
  selectInput.className = className;

  for (const key of Object.keys(object)) {
    var option = document.createElement("option");
    option.value = key;
    option.text = key.charAt(0).toUpperCase() + key.slice(1);
    selectInput.appendChild(option);
  }

  selectInput.style = MARGIN_LEFT + BORDER_RADIUS;

  return selectInput;
}

function save() {
  let template = new Template();
  template.name = document.getElementById("template_name").value;

  // Handling colors
  let colorInputs = document.getElementsByClassName("color-div");
  for (const inputs of colorInputs) {
    let color = inputs.children[1].value;
    color = new Color(color);
    colors.push(color);
  }
  template.color = colors;

  // Handling fonts
  let fontInputs = document.getElementsByClassName("font-div");
  for (const inputs of fontInputs) {
    let fontStyle = FONT_STYLE[inputs.children[1].value],
      fontVariant = FONT_VARIANT[inputs.children[3].value],
      fontWeight = FONT_WEIGHT[inputs.children[5].value],
      fontSize = inputs.children[7].value,
      lineHeight = inputs.children[9].value,
      familyName = inputs.children[11].value,
      genericFamily = GENERIC_FAMILY[inputs.children[13].value],
      fontFamily = "";

    if (fontSize !== "") {
      fontSize += "px";
    }
    if (lineHeight !== "") {
      lineHeight += "px";
    }
    if (familyName !== "") {
      fontFamily = familyName + ", " + genericFamily;
    }

    let font = new Font(
      fontStyle,
      fontVariant,
      fontWeight,
      fontSize,
      lineHeight,
      fontFamily
    );
    fonts.push(font);
  }
  template.font = fonts;

  // Handling borders
  let borderInputs = document.getElementsByClassName("border-div");
  for (const inputs of borderInputs) {
    let borderWidth = inputs.children[1].value,
      borderStyle = BORDER_STYLE[inputs.children[3].value],
      borderColor = inputs.children[5].value;

    if (borderWidth !== "") {
      borderWidth += "px";
    }

    let border = new Border(borderWidth, borderStyle, borderColor);
    borders.push(border);
  }
  template.border = borders;
  storeTemplate(template);
}

function clear() {
  data.index = 0;
  while (propertyDiv.firstChild) {
    propertyDiv.removeChild(propertyDiv.lastChild);
  }
}

function downloadTemplate() {
  var blob = new Blob([JSON.stringify(template, null, 2)], {
    type: "application/json",
  });
  var name = String(template.name) + ".json";

  chrome.downloads.download({
    url: window.URL.createObjectURL(blob),
    filename: name,
  });
}

function buildTemplateInput(){
  let template = getTemplate();
  document.getElementById("add_and_save_and_clear").hidden = false;
  document.getElementById("input_button").style.display = "none";
  for (const color of template.color) {
    data.index++;
    let div = document.createElement("div");
    let propertyValueDiv = document.createElement("div");
    div.id = "div-" + data.index;
    let [selectLabel, select] = createSelect();
    select.selectedIndex = 1;
    let input;
    let colorDiv = document.createElement("div");
    colorDiv.className = "color-div";
    addLabel(" Color ", colorDiv);
    input = addTextInput("color-value", "#FFFFFF", colorDiv);
    input.value = color.color;
    propertyValueDiv.appendChild(colorDiv);
    select.onchange = function(){selectChange(select,propertyValueDiv);}
    let deleteButton = createDelete();
    deleteButton.onclick = () => del(div.id);
    div.appendChild(selectLabel);
    div.appendChild(select);
    div.appendChild(propertyValueDiv);
    div.appendChild(deleteButton);
    propertyDiv.appendChild(div);
  }

  for (const font of template.font) {
    data.index++;
    let div = document.createElement("div");
    let propertyValueDiv = document.createElement("div");
    div.id = "div-" + data.index;
    let [selectLabel, select] = createSelect();
    select.selectedIndex = 2;
    let input;
    let fontDiv = document.createElement("div");
    fontDiv.className = "font-div";

    addLabel(" Font Style ", fontDiv);
    input = addSelectInput("font-style-input", FONT_STYLE, fontDiv);
    input.selectedIndex = Object.values(FONT_STYLE).indexOf(font.font_style);

    addLabel(" Font Variant ", fontDiv);
    input = addSelectInput("font-variant-input", FONT_VARIANT, fontDiv);
    input.selectedIndex = Object.values(FONT_VARIANT).indexOf(font.font_variant);

    addLabel(" Font Weight ", fontDiv);
    input = addSelectInput("font-weight-input", FONT_WEIGHT, fontDiv);
    input.selectedIndex = Object.values(FONT_WEIGHT).indexOf(font.font_weight);

    addLabel(" Font Size  (px) ", fontDiv);
    input = addTextInput("font-size-value", "12", fontDiv);
    input.value = font.font_size;

    addLabel(" Line Height (px) ", fontDiv);
    input = addTextInput("line-height-value", "20", fontDiv);
    input.value = font.line_height;
    const lastIndex = font.font_family.lastIndexOf(',');
    const familyName = font.font_family.slice(0, lastIndex);
    const genericFamily = font.font_family.slice(lastIndex + 2);
    addLabel(" Family Name ", fontDiv);
    input = addTextInput("family-name-value", '"Amazon Ember", Arial', fontDiv);
    input.value = familyName;

    addLabel(" Generic Family ", fontDiv);
    input = addSelectInput("generic-family-input", GENERIC_FAMILY, fontDiv);
    if(genericFamily == "sans-serif"){
      input.selectedIndex = 3;
    }
    else{
      input.selectedIndex = Object.values(GENERIC_FAMILY).indexOf(genericFamily);
    }

    propertyValueDiv.appendChild(fontDiv);
    select.onchange = function(){selectChange(select,propertyValueDiv);}
    let deleteButton = createDelete();
    deleteButton.onclick = () => del(div.id);
    div.appendChild(selectLabel);
    div.appendChild(select);
    div.appendChild(propertyValueDiv);
    div.appendChild(deleteButton);
    propertyDiv.appendChild(div);
  }

  for (const border of template.border) {
    data.index++;
    let div = document.createElement("div");
    let propertyValueDiv = document.createElement("div");
    div.id = "div-" + data.index;
    let [selectLabel, select] = createSelect();
    select.selectedIndex = 3;
    let borderDiv = document.createElement("div");
    borderDiv.className = "border-div";

    addLabel(" Border Width (px) ", borderDiv);
    input = addTextInput("border-width-value", "2", borderDiv);
    input.value = border.border_width;

    addLabel(" Border Style ", borderDiv);
    input = addSelectInput("border-style-input", BORDER_STYLE, borderDiv);
    input.selectedIndex = Object.values(BORDER_STYLE).indexOf(border.border_style);

    addLabel(" Border Color ", borderDiv);
    input = addTextInput("border-color-value", "#FFFFFF", borderDiv);
    input.value = border.border_color;

    propertyValueDiv.appendChild(borderDiv);
    select.onchange = function(){selectChange(select,propertyValueDiv);}
    let deleteButton = createDelete();
    deleteButton.onclick = () => del(div.id);
    div.appendChild(selectLabel);
    div.appendChild(select);
    div.appendChild(propertyValueDiv);
    div.appendChild(deleteButton);
    propertyDiv.appendChild(div);
  }

}


if (typeof module !== 'undefined'){module.exports = {
  switchToAdd,
  add,
  addLabel,
  addTextInput,
  addSelectInput,
  del,
  createSelect,
  createDelete,
  selectChange,
  createSelectInput,
  save,
  clear,
  downloadTemplate
};};