const INITIAL_CODE = "document.body",
  PARSING_DELIMITER = "|",
  RELEVANT_TAGNAMES = ["DIV", "SPAN"],
  INCONSISTENCY_BACKGROUND_COLOR = "rgb(240, 100, 110)";

var clearAllButton = $("#clearAll_button"),
  compareTemplate = $("#compare_template"),
  displayTemplateButton = $("#display-template-btn"),
  expandAllButton = $("#expand-all-btn"),
  outputfileupload = $("#file-selector-output-page");
  elementNumber = 1;

clearAllButton.on("click", clearAll);
compareTemplate.on("click", startTemplateComparison);
displayTemplateButton.on("click", displayTemplate);
expandAllButton.on("click", expandAll);
outputfileupload.on("change", function(event)
{
  const reader = new FileReader();
  readTemplate(reader,null);
  reader.readAsText(this.files[0]);
  const { target = {} } = event || {};
  target.value = "";
});

function clearAll() {
  var element = document.getElementById("template_comparison_output"); // TODO remove underscores from id
  element.innerHTML = "";
  // the code below is the same as the reset function from the template builder
  template.border = [];
  template.font = [];
  template.color = [];
}

function startTemplateComparison() {
  traverseAndCompare(INITIAL_CODE);
}

function traverseAndCompare(code) {
  if(chrome){
    getChildElementCount(code, (childnum) => {
      if (childnum == 0) {
        getTagName(code, (tagName) => {
          if (RELEVANT_TAGNAMES.includes(tagName)) {
            getStyle(code, (styleString) => {
              elementNumber += 1;
              let elementStyle = createElementStyle(styleString, code);
              compareAgainstTemplate(elementStyle);
            });
          }
        });
      } else {
        getTagName(code, (tagName) => {
          if (RELEVANT_TAGNAMES.includes(tagName)) {
            getStyle(code, (styleString) => {
              elementNumber += 1;
              let elementStyle = createElementStyle(styleString, code);
              compareAgainstTemplate(elementStyle);
            });
          }
        });
        for (let index = 0; index < childnum; index++) {
          traverseAndCompare(`${code}.children[${index}]`);
        }
      }
    });
  }
}

function getChildElementCount(code, _callback) {
  code += ".childElementCount";
  if(chrome){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(tabId, { code }, (result) => {
        _callback(result);
      });
    });
  }
}

function getTagName(code, _callback) {
  var scriptCode = `${code}.tagName`;
  if(chrome){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(tabId, { code: scriptCode }, function (result) {
        _callback(result[0]);
      });
    });
  }
}

function getStyle(code, _callback) {
  var styleCode = `window.getComputedStyle(${code})`;
  var scriptCode = `${styleCode}.getPropertyValue("font-style") + '${PARSING_DELIMITER}' 
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

  if(chrome){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(tabId, { code: scriptCode }, function (result) {
        _callback(result[0]);
      });
    });
  }
}

function createElementStyle(styleString, code) {
  const parsedStyle = parseStyleString(styleString, code);

  parsedStyle.color = rgb2hex(parsedStyle.color);
  parsedStyle.borderColor = rgb2hex(parsedStyle.borderColor);

  let elementFont = new Font(
    parsedStyle.fontStyle,
    parsedStyle.fontVariant,
    parsedStyle.fontWeight,
    parsedStyle.fontSize,
    parsedStyle.lineHeight,
    parsedStyle.fontFamily
  );
  let elementBorder = new Border(
    parsedStyle.borderWidth,
    parsedStyle.borderStyle,
    parsedStyle.borderColor
  );
  let elementColor = new Color(parsedStyle.color);

  let elementStyle = new Element(
    code,
    parsedStyle.id,
    parsedStyle.className,
    elementNumber,
    elementColor,
    elementFont,
    elementBorder
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
  if(rgb
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)){
      return `#${rgb
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        .slice(1)
        .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
        .join("")}`;
  }

}

function compareAgainstTemplate(elementStyle) {
  var [flag, fontFlag, colorFlag, borderFlag] = template.compare(elementStyle);

  var panelDiv = document.createElement("div");
  panelDiv.className = "panel-template-comparison";
  panelDiv.style.display = "none";

  if (flag) {
    var div = document.createElement("div");

    var togglePanelBtn = document.createElement("button");
    let identifier = "";
    if (elementStyle.id !== "") {
      identifier = `Element ID : ${elementStyle.id}`;
    } else if (elementStyle.className !== "" && elementStyle.id === "") {
      identifier = `Element Class : ${elementStyle.className}`;
    } else {
      identifier = `Element Number : ${elementStyle.number}`;
    }
    togglePanelBtn.innerHTML = identifier;
    togglePanelBtn.className = "accordion";
    togglePanelBtn.parent = div;
    togglePanelBtn.onclick = function () {
      $(this).toggleClass("active");
      var panel = $(this).siblings()[0];
      if (panel.style.display === "none") {
        panel.style.display = "block";
      } else {
        panel.style.display = "none";
      }
    };

    appendPropertyDiv(fontFlag, "Font", elementStyle.font, panelDiv);
    appendPropertyDiv(borderFlag, "Border", elementStyle.border, panelDiv);
    appendPropertyDiv(colorFlag, "Color", elementStyle.color, panelDiv);

    togglePanelBtn.onmouseover = () => highlightElement(elementStyle.code);
    togglePanelBtn.onmouseleave = () => unHighlightElement(elementStyle.code);

    div.appendChild(togglePanelBtn);
    div.appendChild(panelDiv);
    document.getElementById("template_comparison_output").appendChild(div); // TODO remove underscores
  }
}

function appendPropertyDiv(
  flag,
  propertyName,
  elementStyleProperty,
  parentDiv
) {
  if (flag !== PROPERTY.None) {
    var div = document.createElement("div");
    div.innerHTML = `<h6>${propertyName}</h6><br>${elementStyleProperty.toString()}`;

    if (flag == PROPERTY.Inconsistent) {
      div.style.backgroundColor = INCONSISTENCY_BACKGROUND_COLOR;
    }

    parentDiv.appendChild(div);
  }
}

function highlightElement(code) {
  var scriptCode = `${code}.style.background = 'red'`;
  if(chrome){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(
        tabId,
        { code: scriptCode },null
      );
    });
  }
}

function unHighlightElement(code) {
  if(chrome){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(tabId, { code: `${code}.style.background = ''` });
    });
  }
}

function displayTemplate() {
  let displayTemplateDIV = document.getElementById("display-template");
  if(displayTemplateDIV.childElementCount > 1){
    displayTemplateDIV.removeChild(displayTemplateDIV.lastChild);
  }
  var div = document.createElement("div");
  var templateProperties = document.createElement("p");
  var code = "";

  templateProperties.innerHTML = code.concat(
    addPropertyCode("Font", template.font),
    addPropertyCode("Color", template.color),
    addPropertyCode("Border", template.border)
  );
  templateProperties.parent = div;

  div.appendChild(templateProperties);
  displayTemplateDIV.appendChild(div);
}

function expandAll() {
  if (expandAllButton.attr("expanded") == "true") {
    expandOrCollapse("false", "Expand All", "block", "none");
  }
  else {
    expandOrCollapse("true", "Collapse All", "none", "blocK")
  }
}

function expandOrCollapse(isExpanded, buttonName, panelDisplay1, panelDisplay2) {
  var toggleButtons = document.getElementsByClassName("accordion");
  expandAllButton.attr("expanded", isExpanded);
  expandAllButton.html(buttonName);
  for (var i = 0; i < toggleButtons.length; i++) {
    var panel = toggleButtons[i].nextElementSibling;
    if (panel.style.display == panelDisplay1) {
      toggleButtons[i].classList.toggle("active");
    }
    panel.style.display = panelDisplay2;
  }
}

function addPropertyCode(propertyName, propertyValues) {
  var code = "";
  if (propertyValues.length > 0) {
    code += `<h6>${propertyName}</h6>`;
    for (let index = 0; index < propertyValues.length; index++) {
      code +=
        `${propertyName} no.${index + 1}<br>` +
        propertyValues[index].toString();
    }
    code += "<br>";
  }

  return code;
}

if (typeof module !== 'undefined'){module.exports = {
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
  unHighlightElement,
  displayTemplate,
  addPropertyCode,
  expandAll,
  expandOrCollapse
};};
