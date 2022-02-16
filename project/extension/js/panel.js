(function () {
  "use strict";
  var firstSnapshot,
    cssStringifier1 = new CSSStringifier(),
    shorthandPropertyFilter1 = new ShorthandPropertyFilter(),
    webkitPropertiesFilter1 = new WebkitPropertiesFilter(),
    defaultValueFilter1 = new DefaultValueFilter(),
    sameRulesCombiner1 = new SameRulesCombiner(),
    borderRadiusWorkaround1 = new BorderRadiusWorkaround(),
    createButton1 = $("#create1"),
    htmlTextarea1 = $("#html1"),
    cssTextarea1 = $("#css1"),
    propertiesCleanUpInput = $("#properties-clean-up"),
    removeDefaultValuesInput = $("#remove-default-values"),
    removeWebkitPropertiesInput = $("#remove-webkit-properties"),
    combineSameRulesInput = $("#combine-same-rules"),
    fixHTMLIndentationInput = $("#fix-html-indentation"),
    includeAncestors = $("#include-ancestors"),
    errorBox = $("#error-box"),
    loader = $("#loader"),
    secondSnapshot,
    cssStringifier2 = new CSSStringifier(),
    shorthandPropertyFilter2 = new ShorthandPropertyFilter(),
    webkitPropertiesFilter2 = new WebkitPropertiesFilter(),
    defaultValueFilter2 = new DefaultValueFilter(),
    sameRulesCombiner2 = new SameRulesCombiner(),
    borderRadiusWorkaround2 = new BorderRadiusWorkaround(),
    createButton2 = $("#create2"),
    htmlTextarea2 = $("#html2"),
    cssTextarea2 = $("#css2"),
    compareButton = $("#compare"),
    detailButton = $("#detail"),
    report = $("#report"),
    firstHTML,
    secondHTML,
    firstCSS,
    secondCSS,
    addButton = $("#add_button"),
    saveButton = $("#save_button"),
    inputProperty = $("#input_button"),
    templatePageButton = $("#template_page_button"),
    TemplateComparisonPageButton = $("#template_comparison_page_button"),
    comparePageButton = $("#compare_page_button"),
    downloadTemplateButton = $("#download-template"),
    compareTemplate = $('#compare_template'),
    highlightPrototype = $('#highlight_prototype'),
    displayTemplate = $('#display-template-btn'),
    data = {},
    console = chrome.extension.getBackgroundPage().console,
    template = new Template(),
    colors = [],
    fonts = [],
    borders = []

  restoreSettings();

  const INITIAL_CODE = "document.body";

  propertiesCleanUpInput.on("change", persistSettingAndProcessSnapshot);
  removeDefaultValuesInput.on("change", persistSettingAndProcessSnapshot);
  removeWebkitPropertiesInput.on("change", persistSettingAndProcessSnapshot);
  fixHTMLIndentationInput.on("change", persistSettingAndProcessSnapshot);
  combineSameRulesInput.on("change", persistSettingAndProcessSnapshot);
  includeAncestors.on("change", persistSettingAndProcessSnapshot);

  createButton1.on("click", makeFirstSnapshot);
  createButton2.on("click", makeSecondSnapshot);
  compareButton.on("click", compareSnapshots);
  detailButton.on("click", showDetail);
  saveButton.on("click", save);
  addButton.on("click", add);
  inputProperty.on("click", switch_to_add);
  comparePageButton.on("click", switch_to_compare);
  templatePageButton.on("click", switch_to_template);
  TemplateComparisonPageButton.on("click", switch_to_template_comparison);
  downloadTemplateButton.on("click", downloadTemplate);
  compareTemplate.on("click", startTemplateComparison);
  highlightPrototype.on("click", highlight_prototype);
  displayTemplate.on("click", display_template);

  data.index = 0;
  data.list = ["select", "color", "font", "border"]

  htmlTextarea1.on("click", function () {
    $(this).select();
  });
  cssTextarea1.on("click", function () {
    $(this).select();
  });
  htmlTextarea2.on("click", function () {
    $(this).select();
  });
  cssTextarea2.on("click", function () {
    $(this).select();
  });

  $('input[type="checkbox"]').each(function () {
    $(this).checkbox();
  });

  function readTemplate() {
    document
      .querySelector("#file-selector")
      .addEventListener("change", function () {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          localStorage.setItem("json-file", reader.result);
          var styleFromJSON = JSON.parse(reader.result);
          console.log(styleFromJSON);
          var templateParsed = new Template([],[],[]);
          for (const font of styleFromJSON.font) {
            var temp = new Font(                
              font.font_style,
              font.font_variant,
              font.font_weight,
              font.font_size,
              font.line_height,
              font.font_family);
            templateParsed.font.push(temp);
          }
          for (const border of styleFromJSON.border) {
            var temp = new Border(border.border_width, border.border_style, border.border_color);
            templateParsed.border.push(temp);
          }
          for (const color of styleFromJSON.color) {
            var temp = new Color(color.color);
            templateParsed.color.push(temp);
          }

          template = templateParsed;
          console.log(template);
        });
        reader.readAsText(this.files[0]);
      });
  }
  readTemplate();

  function restoreSettings() {
    // Since we can't access localStorage from here, we need to ask background page to handle the settings.
    // Communication with background page is based on sendMessage/onMessage.
    chrome.runtime.sendMessage(
      {
        name: "getSettings",
      },
      function (settings) {
        for (var prop in settings) {
          var el = $("#" + prop);

          if (!el.length) {
            // Make sure we don't leak any settings when changing/removing id's.
            delete settings[prop];
            continue;
          }

          //updating flat UI checkbox
          el.data("checkbox").setCheck(
            settings[prop] === "true" ? "check" : "uncheck"
          );
        }

        chrome.runtime.sendMessage({
          name: "setSettings",
          data: settings,
        });
      }
    );
  }

  function persistSettingAndProcessSnapshot() {
    console.assert(this.id);
    chrome.runtime.sendMessage({
      name: "changeSetting",
      item: this.id,
      value: this.checked,
    });
    processSnapshot();
  }

  /*
	Making & processing snippets
	 */

  function makeFirstSnapshot() {
    loader.addClass("creating");
    errorBox.removeClass("active");

    chrome.devtools.inspectedWindow.eval(
      "(" + Snapshooter.toString() + ")($0)",
      function (result) {
        try {
          firstSnapshot = JSON.parse(result);
        } catch (e) {
          errorBox
            .find(".error-message")
            .text(
              "DOM snapshot could not be created. Make sure that you have inspected some element."
            );
          errorBox.addClass("active");
        }

        processFirstSnapshot();

        loader.removeClass("creating");
      }
    );
  }

  function makeSecondSnapshot() {
    loader.addClass("creating");
    errorBox.removeClass("active");

    chrome.devtools.inspectedWindow.eval(
      "(" + Snapshooter.toString() + ")($0)",
      function (result) {
        try {
          secondSnapshot = JSON.parse(result);
        } catch (e) {
          errorBox
            .find(".error-message")
            .text(
              "DOM snapshot could not be created. Make sure that you have inspected some element."
            );
          errorBox.addClass("active");
        }

        processSecondSnapshot();

        loader.removeClass("creating");
      }
    );
  }

  function processFirstSnapshot() {
    if (!firstSnapshot) {
      console.log("first error");
      return;
    }

    var styles = firstSnapshot.css,
      html = firstSnapshot.html;

    if (includeAncestors.is(":checked")) {
      styles = firstSnapshot.ancestorCss.concat(styles);
      html =
        firstSnapshot.leadingAncestorHtml +
        html +
        firstSnapshot.trailingAncestorHtml;
    }

    loader.addClass("processing");

    if (removeDefaultValuesInput.is(":checked")) {
      styles = defaultValueFilter1.process(styles);
    }

    borderRadiusWorkaround1.process(styles);

    if (propertiesCleanUpInput.is(":checked")) {
      styles = shorthandPropertyFilter1.process(styles);
    }
    if (removeWebkitPropertiesInput.is(":checked")) {
      styles = webkitPropertiesFilter1.process(styles);
    }
    if (combineSameRulesInput.is(":checked")) {
      styles = sameRulesCombiner1.process(styles);
    }

    if (fixHTMLIndentationInput.is(":checked")) {
      html = $.htmlClean(html, {
        removeTags: ["class"],
        allowedAttributes: [
          ["id"],
          ["placeholder", ["input", "textarea"]],
          ["disabled", ["input", "textarea", "select", "option", "button"]],
          ["value", ["input", "button"]],
          ["readonly", ["input", "textarea", "option"]],
          ["label", ["option"]],
          ["selected", ["option"]],
          ["checked", ["input"]],
        ],
        format: true,
        replace: [],
        replaceStyles: [],
        allowComments: true,
      });
    }
    console.log(html);
    styles1 = styles;

    firstHTML = html;
    firstCSS = cssStringifier1.process(styles);
    htmlTextarea1.val(firstHTML);
    cssTextarea1.val(firstCSS);

    loader.removeClass("processing");
  }

  function processSecondSnapshot() {
    if (!secondSnapshot) {
      return;
    }

    var styles = secondSnapshot.css,
      html = secondSnapshot.html;

    if (includeAncestors.is(":checked")) {
      styles = secondSnapshot.ancestorCss.concat(styles);
      html =
        secondSnapshot.leadingAncestorHtml +
        html +
        secondSnapshot.trailingAncestorHtml;
    }

    loader.addClass("processing");

    if (removeDefaultValuesInput.is(":checked")) {
      styles = defaultValueFilter2.process(styles);
    }

    borderRadiusWorkaround2.process(styles);

    if (propertiesCleanUpInput.is(":checked")) {
      styles = shorthandPropertyFilter2.process(styles);
    }
    if (removeWebkitPropertiesInput.is(":checked")) {
      styles = webkitPropertiesFilter2.process(styles);
    }
    if (combineSameRulesInput.is(":checked")) {
      styles = sameRulesCombiner2.process(styles);
    }

    if (fixHTMLIndentationInput.is(":checked")) {
      html = $.htmlClean(html, {
        removeTags: ["class"],
        allowedAttributes: [
          ["id"],
          ["placeholder", ["input", "textarea"]],
          ["disabled", ["input", "textarea", "select", "option", "button"]],
          ["value", ["input", "button"]],
          ["readonly", ["input", "textarea", "option"]],
          ["label", ["option"]],
          ["selected", ["option"]],
          ["checked", ["input"]],
        ],
        format: true,
        replace: [],
        replaceStyles: [],
        allowComments: true,
      });
    }

    htmlTextarea2.val(secondHTML);
    cssTextarea2.val(secondCSS);
    styles2 = styles;
    secondHTML = html;
    secondCSS = cssStringifier2.process(styles);

    loader.removeClass("processing");
  }

  function compareSnapshots() {
    var dmp = new diff_match_patch();
    var diffHTML = dmp.diff_main(firstHTML, secondHTML);
    var diffCSS = dmp.diff_main(firstCSS, secondCSS);
    dmp.diff_cleanupSemantic(diffHTML);
    dmp.diff_cleanupSemantic(diffCSS);
    var dsHTML = dmp.diff_prettyHtml(diffHTML);
    document.getElementById("outputHTML").innerHTML = dsHTML;
    var dsCSS = dmp.diff_prettyHtml(diffCSS);
    document.getElementById("outputCSS").innerHTML = dsCSS;
    report.val(dmp.differenceReport(diffCSS));
  }

  function showDetail() {
    var diff = document.getElementById("diff");
    var button = document.getElementById("detail");
    if (diff.hidden == true) {
      diff.hidden = false;
      button.childNodes[0].nodeValue = "Hide Detail";
    } else {
      diff.hidden = true;
      button.childNodes[0].nodeValue = "Show Detail";
    }
  }

  function switch_to_add() {
    add();
    document.getElementById("add_and_save").hidden = false;
    document.getElementById("input_button").style.display = "none";
  }

  function switch_to_compare() {
    document.getElementById("template_page").hidden = true;
    document.getElementById("comparison_page").hidden = false;
    document.getElementById("template_comparison_page").hidden = true;
  }
  function switch_to_template_comparison() {
    document.getElementById("template_page").hidden = true;
    document.getElementById("comparison_page").hidden = true;
    document.getElementById("template_comparison_page").hidden = false;
  }
  function switch_to_template() {
    document.getElementById("template_page").hidden = false;
    document.getElementById("comparison_page").hidden = true;
    document.getElementById("template_comparison_page").hidden = true;
  }

  function del(id) {
    const property_div = document.getElementById("property_div");
    console.log(id);
    const div = document.getElementById(id);
    property_div.removeChild(div);
  }

  function add() {
    data.index++;
    var div = document.createElement("div");
    div.id = "div_" + data.index;
    var select_label = document.createElement("label");
    select_label.innerHTML = " Select Property ";

    var property_value_div = document.createElement("div");

    var select = document.createElement("select");
    select.className = "select_property";
    for (const val of data.list) {
      var option = document.createElement("option");
      option.value = val;
      option.text = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);
    }
    select.style = "margin-left: 20px;";
    select.onchange = function () {
      var value = select.options[select.selectedIndex].value;
      if (property_value_div.childElementCount > 0) {
        property_value_div.removeChild(property_value_div.lastChild);
      }
      switch (value) {
        case "color":
          var color_div = document.createElement("div");
          color_div.className = "color_div";

          var color_label = document.createElement("label");
          color_label.innerHTML = " Color ";
          color_label.style = "margin-left: 20px;";
          color_div.appendChild(color_label);

          var color_input = document.createElement("input");
          color_input.type = "text";
          color_input.className = "color_value";
          color_input.style = "margin-left: 20px;";
          color_input.placeholder = "#FFFFFF";
          color_div.appendChild(color_input);

          property_value_div.appendChild(color_div);
          break;

        case "font":
          var font_div = document.createElement("div");
          font_div.className = "font_div";

          var font_style_label = document.createElement("label");
          font_style_label.innerHTML = " Font Style ";
          font_style_label.style = "margin-left: 20px;";
          font_div.appendChild(font_style_label);

          var font_style_input = document.createElement("select");
          font_style_input.className = "font_style_input";
          for (const key of Object.keys(FONT_STYLE)) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            font_style_input.appendChild(option);
          }
          font_style_input.style = "margin-left: 20px;";
          font_div.appendChild(font_style_input);

          var font_variant_label = document.createElement("label");
          font_variant_label.innerHTML = " Font Variant ";
          font_variant_label.style = "margin-left: 20px;";
          font_div.appendChild(font_variant_label);

          var font_variant_input = document.createElement("select");
          font_variant_input.className = "font_variant_input";
          for (const key of Object.keys(FONT_VARIANT)) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            font_variant_input.appendChild(option);
          }
          font_variant_input.style = "margin-left: 20px;";
          font_div.appendChild(font_variant_input);

          var font_weight_label = document.createElement("label");
          font_weight_label.innerHTML = " Font Weight ";
          font_weight_label.style = "margin-left: 20px;";
          font_div.appendChild(font_weight_label);

          var font_weight_input = document.createElement("select");
          font_weight_input.className = "font_weight_input";
          for (const key of Object.keys(FONT_WEIGHT)) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            font_weight_input.appendChild(option);
          }
          font_weight_input.style = "margin-left: 20px;";
          font_div.appendChild(font_weight_input);

          var font_size_label = document.createElement("label");
          font_size_label.innerHTML = " Font Size ";
          font_size_label.style = "margin-left: 20px;";
          font_div.appendChild(font_size_label);

          var font_size_input = document.createElement("input");
          font_size_input.type = "text";
          font_size_input.className = "font_size_value";
          font_size_input.style = "margin-left: 20px;";
          font_div.appendChild(font_size_input);

          var line_height_label = document.createElement("label");
          line_height_label.innerHTML = " Line Height ";
          line_height_label.style = "margin-left: 20px;";
          font_div.appendChild(line_height_label);

          var line_height_input = document.createElement("input");
          line_height_input.type = "text";
          line_height_input.className = "line_height_value";
          line_height_input.style = "margin-left: 20px;";
          font_div.appendChild(line_height_input);

          var family_name_label = document.createElement("label");
          family_name_label.innerHTML = " Family Name ";
          family_name_label.style = "margin-left: 20px;";
          font_div.appendChild(family_name_label);

          var family_name_input = document.createElement("input");
          family_name_input.type = "text";
          family_name_input.className = "family_name_value";
          family_name_input.style = "margin-left: 20px;";
          font_div.appendChild(family_name_input);

          var generic_family_label = document.createElement("label");
          generic_family_label.innerHTML = " Generic Family ";
          generic_family_label.style = "margin-left: 20px;";
          font_div.appendChild(generic_family_label);

          var generic_family_input = document.createElement("select");
          generic_family_input.className = "generic_family_input";
          for (const key of Object.keys(GENERIC_FAMILY)) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            generic_family_input.appendChild(option);
          }
          generic_family_input.style = "margin-left: 20px;";
          font_div.appendChild(generic_family_input);

          property_value_div.appendChild(font_div);
          break;

        case "border":
          var border_div = document.createElement("div");
          border_div.className = "border_div";

          var border_width_label = document.createElement("label");
          border_width_label.innerHTML = " Border Width ";
          border_width_label.style = "margin-left: 20px;";
          border_div.appendChild(border_width_label);

          var border_width_input = document.createElement("input");
          border_width_input.type = "text";
          border_width_input.className = "border_width_value";
          border_width_input.style = "margin-left: 20px;";
          border_div.appendChild(border_width_input);

          var border_style_label = document.createElement("label");
          border_style_label.innerHTML = " Border Style ";
          border_style_label.style = "margin-left: 20px;";
          border_div.appendChild(border_style_label);

          var border_style_input = document.createElement("select");
          border_style_input.className = "border_style_input";
          for (const key of Object.keys(BORDER_STYLE)) {
            var option = document.createElement("option");
            option.value = key;
            option.text = key.charAt(0).toUpperCase() + key.slice(1);
            border_style_input.appendChild(option);
          }
          border_style_input.style = "margin-left: 20px;";
          border_div.appendChild(border_style_input);

          var border_color_label = document.createElement("label");
          border_color_label.innerHTML = " Border Color ";
          border_color_label.style = "margin-left: 20px;";
          border_div.appendChild(border_color_label);

          var border_color_input = document.createElement("input");
          border_color_input.type = "text";
          border_color_input.placeholder = "#FFFFFF";
          border_color_input.className = "border_color_value";
          border_color_input.style = "margin-left: 20px;";
          border_div.appendChild(border_color_input);

          property_value_div.appendChild(border_div);
          break;
        default:
          break;
      }
    };

    var delete_button = document.createElement("div");
    delete_button.className = "glyphicon glyphicon-trash";
    delete_button.innerHTML = " Delete ";
    delete_button.onclick = () => del(div.id);

    div.appendChild(select_label);
    div.appendChild(select);
    div.appendChild(property_value_div);
    div.appendChild(delete_button);
    var property_div = document.getElementById("property_div");
    property_div.appendChild(div);
  }
  // Convert rgb to hex
  const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
  
  function save() {
    let color_inputs = document.getElementsByClassName("color_div");
    for (const inputs of color_inputs) {
			let color = inputs.children[1].value;
			color = new Color(color);
			colors.push(color);
    }
    template.color = colors;

    let font_inputs = document.getElementsByClassName("font_div");
    for (const inputs of font_inputs) {
      console.log(inputs.children);
      let font_style = FONT_STYLE[inputs.children[1].value],
        font_variant = FONT_VARIANT[inputs.children[3].value],
        font_weight = FONT_WEIGHT[inputs.children[5].value],
        font_size = inputs.children[7].value,
        line_height = inputs.children[9].value ,
        family_name = inputs.children[11].value,
        generic_family = GENERIC_FAMILY[inputs.children[13].value],
        font_family = "";
      if (font_size !== "") {
        font_size += "px";
      }
      if (line_height !== "") {
        line_height += "px";
      }
      if (family_name !== ""){
        font_family = family_name + ', ' + generic_family;
      }
      let font = new Font(
          font_style,
          font_variant,
          font_weight,
          font_size,
          line_height,
          font_family
      );
      fonts.push(font);
    }
    template.font = fonts;

    let border_inputs = document.getElementsByClassName("border_div");
    for (const inputs of border_inputs) {
      let border_width = inputs.children[1].value ,
        border_style = BORDER_STYLE[inputs.children[3].value],
        border_color = inputs.children[5].value
      if (border_width !== "") {
        border_width += "px";
      }
      let border = new Border(border_width, border_style, border_color);
      borders.push(border);
    }
    template.border = borders;
    template.type = document.getElementById("element_class_input").value;
    console.log(template);
  }

  function downloadTemplate() {
    var content = JSON.stringify(template, null, 2);
    var blob = new Blob([content], { type: "application/json" });
    var name = String(template.type) + ".json";

    chrome.downloads.download({
      url: window.URL.createObjectURL(blob),
      filename: name, // template name.json?
    });
  }

  function getChildElementCount(code, _callback) {
    code += ".childElementCount";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const { id: tabId } = tabs[0].url;
      chrome.tabs.executeScript(tabId, { code }, (result) => {
        _callback(result);
      });
    });
  }


  const PARSING_DELIMITER = '|';
  function getStyle(code, _callback){
    var styleCode = "window.getComputedStyle(" + code + ")";
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function(tabs) {
          const { id: tabId } = tabs[0].url;
          chrome.tabs.executeScript(tabId, {code : `${styleCode}.getPropertyValue("font-style") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-variant") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-weight") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-size") + '${PARSING_DELIMITER}'
          + ${styleCode}.getPropertyValue("line-height") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-family") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-width") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-style") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-color") + '${PARSING_DELIMITER}' 
          + ${styleCode}.color`}, function (result) {
              _callback(result[0]);
          });      
    });
  }

  function getTagName(code, _callback){
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function(tabs) {
        const { id: tabId } = tabs[0].url;
        chrome.tabs.executeScript(tabId, {code : `${code}.tagName`}, function (result) {
            _callback(result[0]);
        });      
      }
  );
  }

  const parseStyleString = (styleString,code) => {
    const [font_style, font_variant, font_weight, font_size, line_height, font_family, border_width, border_style, border_color, color] = styleString.split(PARSING_DELIMITER);
    return {code, font_style, font_variant, font_weight, font_size, line_height, font_family, border_width, border_style, border_color, color};
  }

  const RELEVANT_TAGNAMES = ['DIV','SPAN']
  function traverseAndCompare(code) {
    getChildElementCount(code, (childnum) => {
      if (childnum == 0) {
        getTagName(code, (tagName) => {
          if(RELEVANT_TAGNAMES.includes(tagName)){
            getStyle(code,(styleString) => {
              const parsedStyle = parseStyleString(styleString,code);
              parsedStyle.color = rgb2hex(parsedStyle.color);
              parsedStyle.border_color = rgb2hex(parsedStyle.border_color);
              let elementFont = new Font(
                parsedStyle.font_style,
                parsedStyle.font_variant,
                parsedStyle.font_weight,
                parsedStyle.font_size,
                parsedStyle.line_height,
                parsedStyle.font_family
              );
              let elementBorder = new Border(parsedStyle.border_width, parsedStyle.border_style, parsedStyle.border_color);
              let elementColor = new Color(parsedStyle.color);
              let elementStyle = new Element(code, elementColor, elementFont, elementBorder);
              compareAgainstTemplate(elementStyle);
            });
          }
        });
      }
      else{
        getTagName(code, (tagName) => {
          if(RELEVANT_TAGNAMES.includes(tagName)){
            getStyle(code,(styleString) => {
              const parsedStyle = parseStyleString(styleString,code);
              parsedStyle.color = rgb2hex(parsedStyle.color);
              parsedStyle.border_color = rgb2hex(parsedStyle.border_color);
              let elementFont = new Font(
                parsedStyle.font_style,
                parsedStyle.font_variant,
                parsedStyle.font_weight,
                parsedStyle.font_size,
                parsedStyle.line_height,
                parsedStyle.font_family
              );
              let elementBorder = new Border(parsedStyle.border_width, parsedStyle.border_style, parsedStyle.border_color);
              let elementColor = new Color(parsedStyle.color);
              let elementStyle = new Element(code, elementColor, elementFont, elementBorder);
              compareAgainstTemplate(elementStyle);
            });
          }
        });
        for (let index = 0; index < childnum; index++) {
          traverseAndCompare(code + `.children[${index}]`);
        }
      }
    });
  }

  function startTemplateComparison() {
    traverseAndCompare(INITIAL_CODE);
  }

  function compareAgainstTemplate(elementStyle){
      var [flag, fontFlag, colorFlag, borderFlag] = template.compare(elementStyle);
      if (flag){
        var div = document.createElement('div');
        var togglePanelBtn = document.createElement('button');
        togglePanelBtn.innerHTML = " Show Details ";
        togglePanelBtn.className = "accordion";
        togglePanelBtn.parent = div;
        togglePanelBtn.onclick = function() {
          $(this).toggleClass("active");
          var panel = $(this).siblings()[0];
          if (panel.style.display === 'none') {
            panel.style.display = 'block';
          } else {
            panel.style.display = 'none';
          }
        };
        var panel_div = document.createElement('div');
        panel_div.className = "panel-template-comparison"
        panel_div.style.display = 'none';
        if(fontFlag !== PROPERTY.None){
          var font_div = document.createElement('div');
          font_div.innerHTML = "<h6>Font</h6><br>" + elementStyle.font.toString();
          if(fontFlag == PROPERTY.Inconsistent){
            // console.log(template.font[0], elementStyle.font);
            font_div.style.backgroundColor = 'rgb(240, 100, 110)'
          }
          panel_div.appendChild(font_div);
        }
        if(borderFlag !== PROPERTY.None){
          var border_div = document.createElement('div');
          border_div.innerHTML = "<h6>Border</h6><br>" + elementStyle.border.toString();
          if(borderFlag == PROPERTY.Inconsistent){
            border_div.style.backgroundColor = 'rgb(240, 100, 110)'
          }
          panel_div.appendChild(border_div);
        }
        if(colorFlag !== PROPERTY.None){
          var color_div = document.createElement('div');
          color_div.innerHTML = "<h6>Color</h6><br>" + elementStyle.color.toString();
          if(colorFlag == PROPERTY.Inconsistent){
            color_div.style.backgroundColor = 'rgb(240, 100, 110)'
          }
          panel_div.appendChild(color_div);
        }
        var showElementBtn = document.createElement('button');
        showElementBtn.innerHTML = " Highlight ";
        showElementBtn.onclick = () => highlightElement(elementStyle.code);
        panel_div.appendChild(showElementBtn);
        div.appendChild(togglePanelBtn);
        div.appendChild(panel_div);
        document.getElementById("template_comparison_output").appendChild(div);
      }
  }

  function display_template () {
    var div = document.createElement('div');
    var templateProperties = document.createElement('p');
    var code = ""
    if (template.font.length > 0) {
      code += "<h6>Font</h6><br>"
      for (let index = 0; index < template.font.length; index++) {
          code += `Font no.${index+1}<br>` + template.font[index].toString()
      }
    }
    if(template.color.length > 0){
      code += "<h6>Color</h6><br>"
      for (let index = 0; index < template.color.length; index++) {
          code += `Color no.${index+1}<br>` + template.color[index].toString()
      }
    }
    if(template.border.length > 0){
      code += "<h6>Border</h6><br>"
      for (let index = 0; index < template.border.length; index++) {
          code += `Border no.${index+1}<br>` + template.border[index].toString()
      }
    }

    templateProperties.innerHTML = code;
    
    templateProperties.parent = div;
    div.appendChild(templateProperties);
    document.getElementById("display-template").appendChild(div);
  }

  function highlightElement(code){
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function(tabs) {
        const { id: tabId } = tabs[0].url;
        chrome.tabs.executeScript(tabId, {code : `${code}.style.background = 'red'`}, function (result) {
            console.log(code + "is highlighted");
        });
      }
    );
  }

  function highlight_prototype(){
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function(tabs) {
        const { id: tabId } = tabs[0].url;
        chrome.tabs.executeScript(tabId, {code : "document.getElementsByClassName(\"nav-left\")[0].style.background = 'red'"}, function (result) {
          console.log("highlighted logo");
        });
    });
  }
})();
