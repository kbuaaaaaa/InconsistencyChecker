(function () {
  var templatePageButton = $("#template_page_button"),
    TemplateComparisonPageButton = $("#template_comparison_page_button"),
    comparePageButton = $("#compare_page_button");

  restoreSettings();

  comparePageButton.on("click", switch_to_compare);
  templatePageButton.on("click", switch_to_template);
  TemplateComparisonPageButton.on("click", switch_to_template_comparison);

  readTemplate("#file-selector-output-page");

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
})();
