const CODE_TO_EVAL = `(${Snapshooter.toString()})($0)`;
const INSPECTED_WINDOW_ERROR_MESSAGE =
  "DOM snapshot could not be created. Make sure that you have inspected some element.";
const TAGS_TO_REMOVE = ["class"];
const ALLOWED_ATTRIBUTES = [
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
const propertiesCleanUpInput = $("#properties-clean-up");
const removeDefaultValuesInput = $("#remove-default-values");
const removeWebkitPropertiesInput = $("#remove-webkit-properties");
const combineSameRulesInput = $("#combine-same-rules");
const fixHTMLIndentationInput = $("#fix-html-indentation");
const includeAncestors = $("#include-ancestors");
const errorBox = $("#error-box");
const loader = $("#loader");

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
const cssStringifier1 = new CSSStringifier();
const shorthandPropertyFilter1 = new ShorthandPropertyFilter();
const webkitPropertiesFilter1 = new WebkitPropertiesFilter();
const defaultValueFilter1 = new DefaultValueFilter();
const sameRulesCombiner1 = new SameRulesCombiner();
const borderRadiusWorkaround1 = new BorderRadiusWorkaround();
let firstSnapshot;
const createButton1 = $("#create1");
const htmlTextArea1 = $("#html1");
let firstHTML;
const cssTextArea1 = $("#css1");
let firstCSS;

createButton1.on("click", makeFirstSnapshot);
htmlTextArea1.on("click", function () {
  $(this).select();
});
cssTextArea1.on("click", function () {
  $(this).select();
});

// Element 2
const cssStringifier2 = new CSSStringifier();
const shorthandPropertyFilter2 = new ShorthandPropertyFilter();
const webkitPropertiesFilter2 = new WebkitPropertiesFilter();
const defaultValueFilter2 = new DefaultValueFilter();
const sameRulesCombiner2 = new SameRulesCombiner();
const borderRadiusWorkaround2 = new BorderRadiusWorkaround();
let secondSnapshot;
const createButton2 = $("#create2");
const htmlTextArea2 = $("#html2");
let secondHTML;
const cssTextArea2 = $("#css2");
let secondCSS;

createButton2.on("click", makeSecondSnapshot);
htmlTextArea2.on("click", function () {
  $(this).select();
});
cssTextArea2.on("click", function () {
  $(this).select();
});

// Compare elements
const compareButton = $("#compare");
const detailButton = $("#detail");
const truncateButton = $("#truncateBtn"); // TODO rename id, remove camel case
const report = $("#report");

compareButton.on("click", compareSnapshots);
detailButton.on("click", showDetail);
truncateButton.on("click", truncateSwitch);

if (typeof test !== "undefined") {
  firstSnapshot = global.firstSnapshot;
  secondSnapshot = global.secondSnapshot;
}

function restoreSettings() {
  // Since we can't access localStorage from here,
  // we need to ask background page to handle the settings.
  // Communication with background page is based on sendMessage/onMessage.
  chrome.runtime.sendMessage(
    {
      name: "getSettings",
    },
    (settings) => {
      for (const prop in settings) {
        const el = $(`#${prop}`);

        if (!el.length) {
          // Make sure we don't leak any settings when changing/removing id's.
          delete settings[prop]; // eslint-disable-line no-param-reassign
          continue; // eslint-disable-line no-continue
        }

        // updating flat UI checkbox
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
  chrome.runtime.sendMessage({
    name: "changeSetting",
    item: this.id,
    value: this.checked,
  });
}

/*
 * Making and processing snapshots
 */
function makeFirstSnapshot() {
  loader.addClass("creating");
  errorBox.removeClass("active");

  chrome.devtools.inspectedWindow.eval(CODE_TO_EVAL, (result) => {
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
    return;
  }

  let styles = firstSnapshot.css;
  let { html } = firstSnapshot;

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
  if (removeDefaultValuesInput.is(":checked") && typeof test == "undefined") {
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

  chrome.devtools.inspectedWindow.eval(CODE_TO_EVAL, (result) => {
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

  let styles = secondSnapshot.css;
  let { html } = secondSnapshot;

  if (includeAncestors.is(":checked")) {
    styles = secondSnapshot.ancestorCss.concat(styles);
    html =
      secondSnapshot.leadingAncestorHtml +
      html +
      secondSnapshot.trailingAncestorHtml;
  }

  loader.addClass("processing");

  if (removeDefaultValuesInput.is(":checked") && typeof test == "undefined") {
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
  const dmp = new diff_match_patch(); // eslint-disable-line new-cap

  const diffHTML = dmp.diff_main(firstHTML, secondHTML);
  const diffCSS = dmp.diff_main(firstCSS, secondCSS);

  dmp.diff_cleanupSemantic(diffHTML);
  dmp.diff_cleanupSemantic(diffCSS);

  const dsHTML = dmp.diff_prettyHtml(diffHTML);
  document.getElementById("outputHTML").innerHTML = dsHTML;

  const dsCSS = dmp.diff_prettyHtml(diffCSS);
  document.getElementById("outputCSS").innerHTML = dsCSS;

  report.val(dmp.differenceReport(diffCSS));
}

function showDetail() {
  const diff = document.getElementById("diff"); // TODO more descriptive id
  const button = document.getElementById("detail");

  if (diff.hidden === true) {
    diff.hidden = false;
    button.childNodes[0].nodeValue = "Hide Detail";
  } else {
    diff.hidden = true;
    button.childNodes[0].nodeValue = "Show Detail";
  }
}

function truncateSwitch() {
  if (truncateButton.attr("truncated") === "true") {
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

if (typeof module !== "undefined") {
  module.exports = {
    restoreSettings,
    persistSettingAndProcessSnapshot,
    makeFirstSnapshot,
    processFirstSnapshot,
    makeSecondSnapshot,
    processSecondSnapshot,
    compareSnapshots,
    showDetail,
    truncateSwitch,
    truncate,
  };
}
