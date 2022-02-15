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
    data = {},
    console = chrome.extension.getBackgroundPage().console,
    template = new Template(),
    colors = [],
    fonts = [],
    borders = [],
    widths = [],
    heights = [],
    templateString = {font : [] , border : [], color : []}

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

  data.index = 0;
  data.list = ["select", "color", "font", "border", "width", "height"];

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

  document.querySelector("#file-selector").addEventListener("change", function () {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        localStorage.setItem("json-file", reader.result);
      });
      reader.readAsDataURL(this.files[0]);
    });

  // template.font = [new Font(FONT_STYLE.Normal,FONT_VARIANT.Normal,FONT_WEIGHT.Normal,14,20,"\"Amazon Ember\"", "Arial",GENERIC_FAMILY.Sans_Serif)];
  // templateString.font = ['   14px / 20px \"Amazon Ember\", Arial, sans-serif'];

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

          var font_name_label = document.createElement("label");
          font_name_label.innerHTML = " Font Name ";
          font_name_label.style = "margin-left: 20px;";
          font_div.appendChild(font_name_label);

          var font_name_input = document.createElement("input");
          font_name_input.type = "text";
          font_name_input.className = "font_name_value";
          font_name_input.style = "margin-left: 20px;";
          font_div.appendChild(font_name_input);

          var font_family_label = document.createElement("label");
          font_family_label.innerHTML = " Font Family ";
          font_family_label.style = "margin-left: 20px;";
          font_div.appendChild(font_family_label);

          var font_family_input = document.createElement("input");
          font_family_input.type = "text";
          font_family_input.className = "font_family_value";
          font_family_input.style = "margin-left: 20px;";
          font_div.appendChild(font_family_input);

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

        case "width":
          var width_div = document.createElement("div");
          width_div.className = "width_div";

          var width_label = document.createElement("label");
          width_label.innerHTML = " Value ";
          width_label.style = "margin-left: 20px;";
          width_div.appendChild(width_label);

          var width_input = document.createElement("input");
          width_input.type = "text";
          width_input.className = "width_value";
          width_input.style = "margin-left: 20px;";
          width_div.appendChild(width_input);

          property_value_div.appendChild(width_div);
          break;

        case "height":
          var height_div = document.createElement("div");
          height_div.className = "height_div";

          var height_label = document.createElement("label");
          height_label.innerHTML = " Value ";
          height_label.style = "margin-left: 20px;";
          height_div.appendChild(height_label);

          var height_input = document.createElement("input");
          height_input.type = "text";
          height_input.className = "height_value";
          height_input.style = "margin-left: 20px;";
          height_div.appendChild(height_input);

          property_value_div.appendChild(height_div);
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

  function save() {
    let color_inputs = document.getElementsByClassName("color_div");
    for (const inputs of color_inputs) {
			let color = inputs.children[1].value;
			color = new Color(color);
			colors.push(color);
    }
    console.log(colors);
    template.color = colors;

    let font_inputs = document.getElementsByClassName("font_div");
    for (const inputs of font_inputs) {
      console.log(inputs.children);
      let font_style = inputs.children[1].value,
        font_variant = inputs.children[3].value,
        font_weight = inputs.children[5].value,
        font_size = inputs.children[7].value + "px",
        line_height = inputs.children[9].value + "px",
        font_name = inputs.children[11].value,
        font_family = inputs.children[13].value,
        generic_family = inputs.children[15].value,
        font = new Font(
          font_style,
          font_variant,
          font_weight,
          font_size,
          line_height,
          font_name,
          font_family,
          generic_family
        );
      fonts.push(font);
    }
    // console.log(fonts);
    template.font = fonts;

    let border_inputs = document.getElementsByClassName("border_div");
    for (const inputs of border_inputs) {
      let border_width = inputs.children[1].value + "px",
        border_style = inputs.children[3].value,
        border_color = new Color(inputs.children[5].value),
        border = new Border(border_width, border_style, border_color);
      borders.push(border);
    }
    // console.log(borders);
    template.border = borders;

    let width_inputs = document.getElementsByClassName("width_div");
    for (const inputs of width_inputs) {
      widths.push(inputs.children[1].value);
    }
    // console.log(widths);
    template.width = widths;

    let height_inputs = document.getElementsByClassName("height_div");
    for (const inputs of height_inputs) {
      heights.push(inputs.children[1].value);
    }
    // console.log(heights);
    template.height = heights;

    template.type = document.getElementById("element_class_input").value;

    console.log(template);
  }

  function downloadTemplate() {
    // TODO: pass a template object as a parameter and put that in the content
    var content = "test"; // JSON.stringify(template	)
    var blob = new Blob([content], { type: "text/plain;charset=UTF-8" });

    chrome.downloads.download({
      url: window.URL.createObjectURL(blob),
      filename: "test.txt", // template name.json?
    });
  }

  function getChildElementCount(code, _callback){
    code += ".childElementCount";
      chrome.tabs.query(
        { active: true, currentWindow: true },
        function(tabs) {
          const { id: tabId } = tabs[0].url;
          chrome.tabs.executeScript(tabId, {code}, (result)  => {
            _callback(result);
          });
      }); 
  }

  // Convert rgb to hex
  const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;

  const PARSING_DELIMITER = '|';
  const FONT_PARSING_DELIMITER = ',';
  function getStyle(code, _callback){
    var styleCode = "window.getComputedStyle(" + code + ")";
    chrome.tabs.query(
        { active: true, currentWindow: true },
        function(tabs) {
          const { id: tabId } = tabs[0].url;
          chrome.tabs.executeScript(tabId, {code : `${styleCode}.getPropertyValue("font-size") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-style") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-variant") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-weight") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("line-height") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("font-family") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-width") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-style") + '${PARSING_DELIMITER}' 
          + ${styleCode}.getPropertyValue("border-color") + '${PARSING_DELIMITER}' 
          + ${styleCode}.color`}, function (result) {
              _callback(result[0]);
          });      
        }
    );
  }

  const parseStyleString = (styleString,code) => {
    const [font_style, font_variant, font_weight, font_size, line_height, font_family_all, border_width, border_style, border_color, color] = styleString.split(PARSING_DELIMITER);
    const [font_name,font_family,generic_family] = font_family_all.split(FONT_PARSING_DELIMITER);
    return {code, font_style, font_variant, font_weight, font_size, line_height, font_name, font_family, generic_family, border_width, border_style, border_color, color};
  }

  function traverseAndCompare(code) {
    getChildElementCount(code,(childnum)=>{
      if (childnum == 0) {
        getStyle(code,(styleString) => {
          // console.log(styleString);
          const parsedStyle = parseStyleString(styleString,code);
          
          parsedStyle.color = rgb2hex(parsedStyle.color);
          parsedStyle.border_color = rgb2hex(parsedStyle.border_color);
          elementFont = new Font(
            font_style,
            font_variant,
            font_weight,
            font_size,
            line_height,
            font_name,
            font_family,
            generic_family
          );
          elementBorder = new Border(parsedStyle.border_width, parsedStyle.border_style, new Color(parsedStyle.border_color));
          elementColor = new Color(parsedStyle.color);
          elementStyle = new Element(code, elementColor, elementFont, elementBorder);
          compareAgainstTemplate(elementStyle);
        });
      }
      else{
        for (let index = 0; index < childnum; index++) {
          traverseAndCompare(code + `.children[${index}]`);
        }
      }
    });
  }

  function startTemplateComparison(){
    traverseAndCompare(INITIAL_CODE);
  }

  function compareAgainstTemplate(elementStyle){
      var flag = false;
      var dmp = new diff_match_patch();
      var diffFont = dmp.diff_main(templateString.font[0].replace(/ /g, ''), elementStyle.font.replace(/ /g, ''));

      dmp.diff_cleanupSemantic(diffFont);
      console.log(diffFont);

      for (const result of diffFont) {
        if(result[0] > 0 || result[0] <0) {
          flag = true;
        }
      }
      if (flag){
        // var dsFont = dmp.diff_prettyHtml(diffFont);
        var div = document.createElement('div');
        var togglePanelBtn = document.createElement('button');
        togglePanelBtn.innerHTML = " Show Details ";
        togglePanelBtn.className = "accordion";
        togglePanelBtn.parent = div;
        togglePanelBtn.onclick = function() {
          $(this).toggleClass("active");
          var panel = $(this).siblings()[0];
          if (panel.style.display === 'none') {
            //console.log("unhiding div");
            panel.style.display = 'block';
          } else {
            //console.log("hiding div");
            panel.style.display = 'none';
          }
        };
        var panel_div = document.createElement('div');
        panel_div.className = "panel-template-comparison"
        // panel_div.innerHTML = dsFont;
        panel_div.innerHTML = "Template : " + templateString.font[0] + "<br>" + "Element : " + elementStyle.font + "<br>";
        panel_div.style.display = 'none';
        var showElementBtn = document.createElement('button');
        showElementBtn.innerHTML = " Highlight ";
        showElementBtn.onclick = () => highlightElement(elementStyle.code);
        panel_div.appendChild(showElementBtn);
        div.appendChild(togglePanelBtn);
        div.appendChild(panel_div);
        document.getElementById("template_comparison_output").appendChild(div);
      }
  }

  function compareAgainstTemplateV2(elementStyle) {
    var flagFont = false;
    var flagColor = false;
    var flagBorder = false;

    var dmp = new diff_match_patch();

    var diffFont2;
    var diffColor;
    var diffBorder;

    // To use after calculating differences
    dmp.diff_cleanupSemantic(diffFont2);
    dmp.diff_cleanupSemantic(diffColor);
    dmp.diff_cleanupSemantic(diffBorder);

    // Comparisons of color properties
    if (templateString.color.length > 0) {
      for (let i = 0, len = templateString.color.length; i < len; i++) {
        diffColor = dmp.diff_main(templateString.color[0], elementStyle.color);
        dmp.diff_cleanupSemantic(diffColor);

        console.log(diffFont);

        for (const result of diffColor) {
          if (result[0] > 0 || result[0] < 0) {
            flag = true;
          }

          if (flag) {
            var div = document.createElement('div');
            var togglePanelBtn = document.createElement('button');
            togglePanelBtn.innerHTML = " Show Details ";
            togglePanelBtn.className = "accordion";
            togglePanelBtn.parent = div;
            togglePanelBtn.onclick = function () {
              $(this).toggleClass("active");
              var panel = $(this).siblings()[0];
              if (panel.style.display === 'none') {
                panel.style.display = 'block';
              } else {
                panel.style.display = 'none';
              }
            };
            var panel_div = document.createElement('div');
            panel_div.className = "panel-template-comparison";
            // TODO: concatanate relevant properties so they only appear once
            // Like all template properties displayed together, only once, same for element ones... 
            // so it would be done at the end of a for loop for all the properties from the template
            // -> perhaps you need a for loop for each element, with for loops for each set of properties
            // - you only display outout at end of one element
            panel_div.innerHTML = "Template: " + templateString.color[i] + "<br>" + "Element: " + elementStyle.color + "<br>"
            panel_div.style.display = 'none';
            var showElementBtn = document.createElement('button');
            showElementBtn.innerHTML = " Highlight ";
            showElementBtn.onclick = () => highlightElement(elementStyle.code);
            panel_div.appendChild(showElementBtn);
            div.appendChild(togglePanelBtn);
            div.appendChild(panel_div);
            document.getElementById("template_comparison_output").appendChild(div);
          }
        }
      }
    }


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
      }
    );
  }


  //console.log("Template string: ", templateString);
  //console.log("Template string font first: ", templateString.font[0]);
  //console.log("Template string font all: ", templateString.font);
  //console.log("Template string font replaced: ", templateString.font[0].replace(/ /g, ''));
  //console.log("element style: ", elementStyle);
  //console.log("elementstyle font:", elementStyle.font);
  //console.log("Element style font: ", elementStyle.font.replace(/ /g, ''))

})();


