const INITIAL_CODE = 'document.body';
const PARSING_DELIMITER = '|';
const RELEVANT_TAGNAMES = ['DIV', 'SPAN'];
const INCONSISTENCY_BACKGROUND_COLOR = 'rgb(240, 100, 110)';

const clearAllButton = $('#clearAll_button');
const compareTemplate = $('#compare_template');
const displayTemplateButton = $('#display-template-btn');
const expandAllButton = $('#expand-all-btn');
let elementNumber = 1;

clearAllButton.on('click', clearAll);
compareTemplate.on('click', startTemplateComparison);
displayTemplateButton.on('click', displayTemplate);
expandAllButton.on('click', expandAll);

function clearAll() {
  const element = document.getElementById('template_comparison_output'); // TODO remove underscores from id
  element.innerHTML = '';
  // the code below is the same as the reset function from the template builder
  template.border = [];
  template.font = [];
  template.color = [];
}

function startTemplateComparison() {
  traverseAndCompare(INITIAL_CODE);
}

function traverseAndCompare(code) {
  getChildElementCount(code, (childnum) => {
    if (childnum === 0) {
      getTagName(code, (tagName) => {
        if (RELEVANT_TAGNAMES.includes(tagName)) {
          getStyle(code, (styleString) => {
            elementNumber += 1;
            const elementStyle = createElementStyle(styleString, code);
            compareAgainstTemplate(elementStyle);
          });
        }
      });
    } else {
      getTagName(code, (tagName) => {
        if (RELEVANT_TAGNAMES.includes(tagName)) {
          getStyle(code, (styleString) => {
            elementNumber += 1;
            const elementStyle = createElementStyle(styleString, code);
            compareAgainstTemplate(elementStyle);
          });
        }
      });
      for (let index = 0; index < childnum; index += 1) {
        traverseAndCompare(`${code}.children[${index}]`);
      }
    }
  });
}

function getChildElementCount(code, _callback) {
  scriptCode = `${code}.childElementCount`;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId } = tabs[0].url;
    chrome.tabs.executeScript(tabId, { scriptCode }, (result) => {
      _callback(result);
    });
  });
}

function getTagName(code, _callback) {
  const scriptCode = `${code}.tagName`;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId } = tabs[0].url;
    chrome.tabs.executeScript(tabId, { code: scriptCode }, (result) => {
      _callback(result[0]);
    });
  });
}

function getStyle(code, _callback) {
  const styleCode = `window.getComputedStyle(${code})`;
  const scriptCode = `${styleCode}.getPropertyValue("font-style") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("font-variant") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("font-weight") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("font-size") + '${PARSING_DELIMITER}'
    + ${styleCode}.getPropertyValue("line-height") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("font-family") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("border-width") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("border-style") + '${PARSING_DELIMITER}' 
    + ${styleCode}.getPropertyValue("border-color") + '${PARSING_DELIMITER}' 
    + ${styleCode}.color + '${PARSING_DELIMITER}'
    + ${code}.id + '${PARSING_DELIMITER}'
    + ${code}.className`;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId } = tabs[0].url;
    chrome.tabs.executeScript(tabId, { code: scriptCode }, (result) => {
      _callback(result[0]);
    });
  });
}

function createElementStyle(styleString, code) {
  const parsedStyle = parseStyleString(styleString, code);

  parsedStyle.color = rgb2hex(parsedStyle.color);
  parsedStyle.borderColor = rgb2hex(parsedStyle.borderColor);

  const elementFont = new Font(
    parsedStyle.fontStyle,
    parsedStyle.fontVariant,
    parsedStyle.fontWeight,
    parsedStyle.fontSize,
    parsedStyle.lineHeight,
    parsedStyle.fontFamily,
  );
  const elementBorder = new Border(
    parsedStyle.borderWidth,
    parsedStyle.borderStyle,
    parsedStyle.borderColor,
  );
  const elementColor = new Color(parsedStyle.color);

  const elementStyle = new Element(
    code,
    parsedStyle.id,
    parsedStyle.className,
    elementNumber,
    elementColor,
    elementFont,
    elementBorder,
  );

  return elementStyle;
}

const parseStyleString = (styleString, code) => {
  const [
    fontStyle,
    fontVariant,
    fontWeight,
    fontSize,
    lineHeight,
    fontFamily,
    borderWidth,
    borderStyle,
    borderColor,
    color,
    id,
    className,
  ] = styleString.split(PARSING_DELIMITER);
  return {
    code,
    fontStyle,
    fontVariant,
    fontWeight,
    fontSize,
    lineHeight,
    fontFamily,
    borderWidth,
    borderStyle,
    borderColor,
    color,
    id,
    className,
  };
};

const rgb2hex = (rgb) => {
  if (rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
    return `#${rgb
      .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
      .slice(1)
      .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
      .join('')}`;
  }
  return null;
};

function compareAgainstTemplate(elementStyle) {
  const [flag, fontFlag, colorFlag, borderFlag] = template.compare(elementStyle);

  const panelDiv = document.createElement('div');
  panelDiv.className = 'panel-template-comparison';
  panelDiv.style.display = 'none';

  if (flag) {
    const div = document.createElement('div');

    const togglePanelBtn = document.createElement('button');
    let identifier = '';
    if (elementStyle.id !== '') {
      identifier = `Element ID : ${elementStyle.id}`;
    } else if (elementStyle.className !== '' && elementStyle.id === '') {
      identifier = `Element Class : ${elementStyle.className}`;
    } else {
      identifier = `Element Number : ${elementStyle.number}`;
    }
    togglePanelBtn.innerHTML = identifier;
    togglePanelBtn.className = 'accordion';
    togglePanelBtn.parent = div;
    togglePanelBtn.onclick = function () {
      $(this).toggleClass('active');
      const panel = $(this).siblings()[0];
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    };

    appendPropertyDiv(fontFlag, 'Font', elementStyle.font, panelDiv);
    appendPropertyDiv(borderFlag, 'Border', elementStyle.border, panelDiv);
    appendPropertyDiv(colorFlag, 'Color', elementStyle.color, panelDiv);

    togglePanelBtn.onmouseover = () => highlightElement(elementStyle.code);
    togglePanelBtn.onmouseleave = () => unHighlightElement(elementStyle.code);

    div.appendChild(togglePanelBtn);
    div.appendChild(panelDiv);
    document.getElementById('template_comparison_output').appendChild(div); // TODO remove underscores
  }
}

function appendPropertyDiv(
  flag,
  propertyName,
  elementStyleProperty,
  parentDiv,
) {
  if (flag !== PROPERTY.None) {
    const div = document.createElement('div');
    div.innerHTML = `<h6>${propertyName}</h6><br>${elementStyleProperty.toString()}`;

    if (flag === PROPERTY.Inconsistent) {
      div.style.backgroundColor = INCONSISTENCY_BACKGROUND_COLOR;
    }

    parentDiv.appendChild(div);
  }
}

function highlightElement(code) {
  const scriptCode = `${code}.style.background = 'red'`;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId } = tabs[0].url;
    chrome.tabs.executeScript(tabId, { code: scriptCode }, () => {});
  });
}

function unHighlightElement(code) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId } = tabs[0].url;
    chrome.tabs.executeScript(tabId, { code: `${code}.style.background = ''` });
  });
}

function displayTemplate() {
  const displayTemplateDIV = document.getElementById('display-template');
  if (displayTemplateDIV.childElementCount > 1) {
    displayTemplateDIV.removeChild(displayTemplateDIV.lastChild);
  }
  const div = document.createElement('div');
  const templateProperties = document.createElement('p');
  const code = '';

  templateProperties.innerHTML = code.concat(
    addPropertyCode('Font', template.font),
    addPropertyCode('Color', template.color),
    addPropertyCode('Border', template.border),
  );
  templateProperties.parent = div;

  div.appendChild(templateProperties);
  displayTemplateDIV.appendChild(div);
}

function expandAll() {
  if (expandAllButton.attr('expanded') === 'true') {
    expandOrCollapse('false', 'Expand All', 'block', 'none');
  } else {
    expandOrCollapse('true', 'Collapse All', 'none', 'blocK');
  }
}

function expandOrCollapse(
  isExpanded,
  buttonName,
  panelDisplay1,
  panelDisplay2,
) {
  const toggleButtons = document.getElementsByClassName('accordion');
  expandAllButton.attr('expanded', isExpanded);
  expandAllButton.html(buttonName);
  for (let i = 0; i < toggleButtons.length; i += 1) {
    const panel = toggleButtons[i].nextElementSibling;
    if (panel.style.display === panelDisplay1) {
      toggleButtons[i].classList.toggle('active');
    }
    panel.style.display = panelDisplay2;
  }
}

function addPropertyCode(propertyName, propertyValues) {
  let code = '';
  if (propertyValues.length > 0) {
    code += `<h6>${propertyName}</h6>`;

    for (let index = 0; index < propertyValues.length; index += 1) {
      code += `${propertyName} no.${index + 1}<br>${propertyValues[
        index
      ].toString()}`;
    }
    code += '<br>';
  }

  return code;
}

if (typeof module !== 'undefined') {
  module.exports = {
    clearAll,
    startTemplateComparison,
    traverseAndCompare,
    getChildElementCount,
    getTagName,
    getStyle,
    createElementStyle,
    parseStyleString,
    rgb2hex,
    compareAgainstTemplate,
    appendPropertyDiv,
    highlightElement,
    displayTemplate,
    addPropertyCode,
  };
}
