const CODE_TO_EVAL = "(" + Snapshooter.toString() + ")($0)",
  INSPECTED_WINDOW_ERROR_MESSAGE =
    "DOM snapshot could not be created. Make sure that you have inspected some element.",
  TAGS_TO_REMOVE = ["class"],
  ALLOWED_ATTRIBUTES = [
    ["id"],
    ["placeholder", ["input", "textarea"]],
    ["disabled", ["input", "textarea", "select", "option", "button"]],
    ["value", ["input", "button"]],
    ["readonly", ["input", "textarea", "option"]],
    ["label", ["option"]],
    ["selected", ["option"]],
    ["checked", ["input"]],
  ];

// Settings and other page elements
var propertiesCleanUpInput = $("#properties-clean-up"),
  removeDefaultValuesInput = $("#remove-default-values"),
  removeWebkitPropertiesInput = $("#remove-webkit-properties"),
  combineSameRulesInput = $("#combine-same-rules"),
  fixHTMLIndentationInput = $("#fix-html-indentation"),
  includeAncestors = $("#include-ancestors"),
  errorBox = $("#error-box"),
  loader = $("#loader");

propertiesCleanUpInput.on("change", persistSettingAndProcessSnapshot);
removeDefaultValuesInput.on("change", persistSettingAndProcessSnapshot);
removeWebkitPropertiesInput.on("change", persistSettingAndProcessSnapshot);
fixHTMLIndentationInput.on("change", persistSettingAndProcessSnapshot);
combineSameRulesInput.on("change", persistSettingAndProcessSnapshot);
includeAncestors.on("change", persistSettingAndProcessSnapshot);

$('input[type="checkbox"]').each(function () {
  $(this).checkbox();
});

// Element 1
var cssStringifier1 = new CSSStringifier(),
  shorthandPropertyFilter1 = new ShorthandPropertyFilter(),
  webkitPropertiesFilter1 = new WebkitPropertiesFilter(),
  defaultValueFilter1 = new DefaultValueFilter(),
  sameRulesCombiner1 = new SameRulesCombiner(),
  borderRadiusWorkaround1 = new BorderRadiusWorkaround(),
  firstSnapshot,
  createButton1 = $("#create1"),
  htmlTextArea1 = $("#html1"),
  firstHTML,
  cssTextArea1 = $("#css1"),
  firstCSS;

createButton1.on("click", makeFirstSnapshot);
htmlTextArea1.on("click", function () {
  $(this).select();
});
cssTextArea1.on("click", function () {
  $(this).select();
});

// Element 2
var cssStringifier2 = new CSSStringifier(),
  shorthandPropertyFilter2 = new ShorthandPropertyFilter(),
  webkitPropertiesFilter2 = new WebkitPropertiesFilter(),
  defaultValueFilter2 = new DefaultValueFilter(),
  sameRulesCombiner2 = new SameRulesCombiner(),
  borderRadiusWorkaround2 = new BorderRadiusWorkaround(),
  secondSnapshot,
  createButton2 = $("#create2"),
  htmlTextArea2 = $("#html2"),
  secondHTML,
  cssTextArea2 = $("#css2"),
  secondCSS;

createButton2.on("click", makeSecondSnapshot);
htmlTextArea2.on("click", function () {
  $(this).select();
});
cssTextArea2.on("click", function () {
  $(this).select();
});

// Compare elements
var compareButton = $("#compare"),
  detailButton = $("#detail"),
  truncateButton = $("#truncateBtn"), // TODO rename id, remove camel case
  report = $("#report");

compareButton.on("click", compareSnapshots);
detailButton.on("click", showDetail);
truncateButton.on("click", truncateSwitch);

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
  // processSnapshot(); // ! This function is not defined in the original file
}

/*
 * Making and processing snapshots
 */
function makeFirstSnapshot() {
  loader.addClass("creating");
  errorBox.removeClass("active");

  chrome.devtools.inspectedWindow.eval(CODE_TO_EVAL, function (result) {
    try {
      firstSnapshot = JSON.parse(result);
    } catch (e) {
      errorBox.find(".error-message").text(INSPECTED_WINDOW_ERROR_MESSAGE);
      errorBox.addClass("active");
    }

    processFirstSnapshot();

    loader.removeClass("creating");
  });
}

function processFirstSnapshot() {
  if (!firstSnapshot) {
    // console.log("first error"); // ! log statement
    return;
  }

  var styles = firstSnapshot.css,
    html = firstSnapshot.html;

  // ? settings
  if (includeAncestors.is(":checked")) {
    styles = firstSnapshot.ancestorCss.concat(styles);
    html =
      firstSnapshot.leadingAncestorHtml +
      html +
      firstSnapshot.trailingAncestorHtml;
  }

  loader.addClass("processing");

  // ? settings
  if (removeDefaultValuesInput.is(":checked")) {
    styles = defaultValueFilter1.process(styles);
  }

  borderRadiusWorkaround1.process(styles);

  // ? settings
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
      removeTags: TAGS_TO_REMOVE,
      allowedAttributes: ALLOWED_ATTRIBUTES,
      format: true,
      replace: [],
      replaceStyles: [],
      allowComments: true,
    });
  }

  firstHTML = html;
  firstCSS = cssStringifier1.process(styles);
  htmlTextArea1.val(firstHTML);
  cssTextArea1.val(firstCSS);

  loader.removeClass("processing");
}

function makeSecondSnapshot() {
  loader.addClass("creating");
  errorBox.removeClass("active");

  chrome.devtools.inspectedWindow.eval(CODE_TO_EVAL, function (result) {
    try {
      secondSnapshot = JSON.parse(result);
    } catch (e) {
      errorBox.find(".error-message").text(INSPECTED_WINDOW_ERROR_MESSAGE);
      errorBox.addClass("active");
    }

    processSecondSnapshot();

    loader.removeClass("creating");
  });
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
      removeTags: TAGS_TO_REMOVE,
      allowedAttributes: ALLOWED_ATTRIBUTES,
      format: true,
      replace: [],
      replaceStyles: [],
      allowComments: true,
    });
  }

  htmlTextArea2.val(secondHTML);
  cssTextArea2.val(secondCSS);
  secondHTML = html;
  secondCSS = cssStringifier2.process(styles);

  loader.removeClass("processing");
}

/*
 * Comparing snapshots
 */
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
  var diff = document.getElementById("diff"); // TODO more descriptive id
  var button = document.getElementById("detail");

  if (diff.hidden == true) {
    diff.hidden = false;
    button.childNodes[0].nodeValue = "Hide Detail";
  } else {
    diff.hidden = true;
    button.childNodes[0].nodeValue = "Show Detail";
  }
}

function truncateSwitch() {
  if (truncateButton.attr("truncated") == "true") {
    truncateButton.attr("truncated", "false");
    truncateButton.html("Truncate classes");
    processFirstSnapshot();
    processSecondSnapshot();
  } else {
    truncate();
    truncateButton.html("Restore classes");
    truncateButton.attr("truncated", "true");
  }
}

function truncate() {
  const REGEX = /(?<=\{\s*)[\s\S]*?(?=\s*\})/gs;

  cssTextArea1.val(firstCSS.replaceAll(REGEX, "\n..."));
  cssTextArea2.val(secondCSS.replaceAll(REGEX, "\n..."));
}

if (typeof module !== 'undefined'){module.exports = {
  restoreSettings,
  persistSettingAndProcessSnapshot,
  makeFirstSnapshot,
  processFirstSnapshot,
  makeSecondSnapshot,
  processSecondSnapshot,
  compareSnapshots,
  showDetail,
  truncateSwitch,
  truncate
};};