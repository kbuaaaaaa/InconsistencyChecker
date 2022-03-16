const MARGIN_LEFT = 'margin-left: 20px;';
const BORDER_RADIUS = 'border-radius: 4px;';

// buttons from the HTML
// TODO: change ids, remove underscores
const inputPropertyButton = $('#input_button');
const addButton = $('#add_button');
const saveButton = $('#save_button');
const clearButton = $('#clear_button');
const downloadTemplateButton = $('#download-template');
const resetButton = $('#reset_button');

const propertyDiv = document.getElementById('property_div');

inputPropertyButton.on('click', switchToAdd);
addButton.on('click', add);
saveButton.on('click', save);
clearButton.on('click', clear);

downloadTemplateButton.on('click', downloadTemplate);
resetButton.on('click', reset);

function switchToAdd() {
  add();
  document.getElementById('add_and_save_and_clear').hidden = false;
  document.getElementById('input_button').style.display = 'none';
}

function add() {
  data.index++;

  const div = document.createElement('div');
  div.id = `div-${data.index}`;
  const selectLabel = document.createElement('label');
  selectLabel.innerHTML = ' Select Property ';

  const propertyValueDiv = document.createElement('div');

  const select = document.createElement('select');
  select.className = 'select-property';
  for (const val of data.list) {
    const option = document.createElement('option');
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    select.appendChild(option);
  }
  select.style = MARGIN_LEFT + BORDER_RADIUS;

  select.onchange = function () {
    const { value } = select.options[select.selectedIndex];
    if (propertyValueDiv.childElementCount > 0) {
      propertyValueDiv.removeChild(propertyValueDiv.lastChild);
    }

    switch (value) {
      case 'color':
        var colorDiv = document.createElement('div');
        colorDiv.className = 'color-div';

        addLabel(' Color ', colorDiv);
        addTextInput('color-value', '#FFFFFF', colorDiv);

        propertyValueDiv.appendChild(colorDiv);
        break;

      case 'font':
        var fontDiv = document.createElement('div');
        fontDiv.className = 'font-div';

        addLabel(' Font Style ', fontDiv);
        addSelectInput('font-style-input', FONT_STYLE, fontDiv);

        addLabel(' Font Variant ', fontDiv);
        addSelectInput('font-variant-input', FONT_VARIANT, fontDiv);

        addLabel(' Font Weight ', fontDiv);
        var fontWeightInput = createSelectInput(
          'font-weight-input',
          FONT_WEIGHT,
        );
        fontWeightInput.selectedIndex = 9;
        fontDiv.appendChild(fontWeightInput);

        addLabel(' Font Size  (px) ', fontDiv);
        addTextInput('font-size-value', '12', fontDiv);

        addLabel(' Line Height (px) ', fontDiv);
        addTextInput('line-height-value', '20', fontDiv);

        addLabel(' Family Name ', fontDiv);
        addTextInput('family-name-value', '"Amazon Ember", Arial', fontDiv);

        addLabel(' Generic Family ', fontDiv);
        addSelectInput('generic-family-input', GENERIC_FAMILY, fontDiv);

        propertyValueDiv.appendChild(fontDiv);
        break;

      case 'border':
        var borderDiv = document.createElement('div');
        borderDiv.className = 'border-div';

        addLabel(' Border Width (px) ', borderDiv);
        addTextInput('border-width-value', '2', borderDiv);

        addLabel(' Border Style ', borderDiv);
        addSelectInput('border-style-input', BORDER_STYLE, borderDiv);

        addLabel(' Border Color ', borderDiv);
        addTextInput('border-color-value', '#FFFFFF', borderDiv);

        propertyValueDiv.appendChild(borderDiv);
        break;
      default:
        break;
    }
  };

  const deleteButton = document.createElement('div');
  deleteButton.className = 'glyphicon glyphicon-trash';
  deleteButton.innerHTML = ' Delete ';
  deleteButton.onclick = () => del(div.id);

  div.appendChild(selectLabel);
  div.appendChild(select);
  div.appendChild(propertyValueDiv);
  div.appendChild(deleteButton);

  propertyDiv.appendChild(div);
}

function addLabel(innerHTML, parentDiv) {
  const label = document.createElement('label');
  label.innerHTML = innerHTML;
  label.style = MARGIN_LEFT;
  parentDiv.appendChild(label);
}

function addTextInput(className, placeholder, parentDiv) {
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.className = className;
  textInput.placeholder = placeholder;
  textInput.style = MARGIN_LEFT + BORDER_RADIUS;

  parentDiv.appendChild(textInput);
}

function addSelectInput(className, object, parentDiv) {
  const selectInput = createSelectInput(className, object);

  parentDiv.appendChild(selectInput);
}

function del(id) {
  const div = document.getElementById(id);

  propertyDiv.removeChild(div);
}

function createSelectInput(className, object) {
  const selectInput = document.createElement('select');
  selectInput.className = className;

  for (const key of Object.keys(object)) {
    const option = document.createElement('option');
    option.value = key;
    option.text = key.charAt(0).toUpperCase() + key.slice(1);
    selectInput.appendChild(option);
  }

  selectInput.style = MARGIN_LEFT + BORDER_RADIUS;

  return selectInput;
}

function save() {
  template.name = document.getElementById('template_name').value;

  // Handling colors
  const colorInputs = document.getElementsByClassName('color-div');
  for (const inputs of colorInputs) {
    let color = inputs.children[1].value;
    color = new Color(color);
    colors.push(color);
  }
  template.color = colors;

  // Handling fonts
  const fontInputs = document.getElementsByClassName('font-div');
  for (const inputs of fontInputs) {
    const fontStyle = FONT_STYLE[inputs.children[1].value];
    const fontVariant = FONT_VARIANT[inputs.children[3].value];
    const fontWeight = FONT_WEIGHT[inputs.children[5].value];
    let fontSize = inputs.children[7].value;
    let lineHeight = inputs.children[9].value;
    const familyName = inputs.children[11].value;
    const genericFamily = GENERIC_FAMILY[inputs.children[13].value];
    let fontFamily = '';

    if (fontSize !== '') {
      fontSize += 'px';
    }
    if (lineHeight !== '') {
      lineHeight += 'px';
    }
    if (familyName !== '') {
      fontFamily = `${familyName}, ${genericFamily}`;
    }

    const font = new Font(
      fontStyle,
      fontVariant,
      fontWeight,
      fontSize,
      lineHeight,
      fontFamily,
    );
    fonts.push(font);
  }
  template.font = fonts;

  // Handling borders
  const borderInputs = document.getElementsByClassName('border-div');
  for (const inputs of borderInputs) {
    let borderWidth = inputs.children[1].value;
    const borderStyle = BORDER_STYLE[inputs.children[3].value];
    const borderColor = inputs.children[5].value;

    if (borderWidth !== '') {
      borderWidth += 'px';
    }

    const border = new Border(borderWidth, borderStyle, borderColor);
    borders.push(border);
  }
  template.border = borders;
}

function clear() {
  while (propertyDiv.firstChild) {
    propertyDiv.removeChild(propertyDiv.lastChild);
  }
}

function downloadTemplate() {
  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: 'application/json',
  });
  const name = `${String(template.name)}.json`;

  chrome.downloads.download({
    url: window.URL.createObjectURL(blob),
    filename: name,
  });
}

function reset() {
  borders = [];
  fonts = [];
  colors = [];
}

if (typeof module !== 'undefined') {
  module.exports = {
    switchToAdd,
    add,
    addLabel,
    addTextInput,
    addSelectInput,
    del,
    createSelectInput,
    save,
    clear,
    downloadTemplate,
    reset,
  };
}
