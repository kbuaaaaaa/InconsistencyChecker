(function () {
	"use strict";
	var firstSnapshot,
		cssStringifier1 = new CSSStringifier(),
		shorthandPropertyFilter1 = new ShorthandPropertyFilter(),
		webkitPropertiesFilter1 = new WebkitPropertiesFilter(),
		defaultValueFilter1 = new DefaultValueFilter(),
		sameRulesCombiner1 = new SameRulesCombiner(),
		borderRadiusWorkaround1 = new BorderRadiusWorkaround(),
		createButton1 = $('#create1'),
		htmlTextarea1 = $('#html1'),
		cssTextarea1 = $('#css1'),
		styles1,

		propertiesCleanUpInput = $('#properties-clean-up'),
		removeDefaultValuesInput = $('#remove-default-values'),
		removeWebkitPropertiesInput = $('#remove-webkit-properties'),
		combineSameRulesInput = $('#combine-same-rules'),
		fixHTMLIndentationInput = $('#fix-html-indentation'),
		includeAncestors = $('#include-ancestors'),
		errorBox = $('#error-box'),
		loader = $('#loader'),
		comparison = $('#comparison'),
		
		secondSnapshot,
		cssStringifier2 = new CSSStringifier(),
		shorthandPropertyFilter2 = new ShorthandPropertyFilter(),
		webkitPropertiesFilter2 = new WebkitPropertiesFilter(),
		defaultValueFilter2 = new DefaultValueFilter(),
		sameRulesCombiner2 = new SameRulesCombiner(),
		borderRadiusWorkaround2 = new BorderRadiusWorkaround(),
		createButton2 = $('#create2'),
		htmlTextarea2 = $('#html2'),
		cssTextarea2 = $('#css2'),
		styles2,

		compareButton = $('#compare'),
		detailButton = $('#detail'),
		report = $('#report'),
		firstHTML,
		secondHTML,
		firstCSS,
		secondCSS,

		addButton = $('#add_button'),
		saveButton = $('#save_button'),
		inputProperty = $('#input_button'),
		data = {}

		console = chrome.extension.getBackgroundPage().console;

	restoreSettings();

	propertiesCleanUpInput.on('change', persistSettingAndProcessSnapshot);
	removeDefaultValuesInput.on('change', persistSettingAndProcessSnapshot);
	removeWebkitPropertiesInput.on('change', persistSettingAndProcessSnapshot);
	fixHTMLIndentationInput.on('change', persistSettingAndProcessSnapshot);
	combineSameRulesInput.on('change', persistSettingAndProcessSnapshot);

	createButton1.on('click', makeFirstSnapshot);
	createButton2.on('click', makeSecondSnapshot);
	compareButton.on('click', compareSnapshots);
	detailButton.on('click', showDetail);
	saveButton.on('click', save);
	addButton.on('click', add);
	inputProperty.on('click',switch_to_add);

	data.index = 0;
	data.list = [
		"font",
		"width",
		"height",
		"border",
		"color"
	];

	htmlTextarea1.on('click', function () {
		$(this).select();
	});
	cssTextarea1.on('click', function () {
		$(this).select();
	});
	htmlTextarea2.on('click', function () {
		$(this).select();
	});
	cssTextarea2.on('click', function () {
		$(this).select();
	});

	$('input[type="checkbox"]').each(function () {
		$(this).checkbox();
	});


	/*
	Settings - saving & restoring
	 */

	function restoreSettings() {
		// Since we can't access localStorage from here, we need to ask background page to handle the settings.
		// Communication with background page is based on sendMessage/onMessage.
		chrome.runtime.sendMessage({
			name: 'getSettings'
		}, function(settings) {
			for (var prop in settings) {
				var el = $("#" + prop);

				if (!el.length) {
					// Make sure we don't leak any settings when changing/removing id's.
					delete settings[prop];
					continue;
				}

				//updating flat UI checkbox
				el.data('checkbox').setCheck(settings[prop] === "true" ? 'check' : 'uncheck');
			}

			chrome.runtime.sendMessage({
				name: 'setSettings',
				data: settings
			})
		});

	}

	function persistSettingAndProcessSnapshot() {
		console.assert(this.id);
		chrome.runtime.sendMessage({
			name: 'changeSetting',
			item: this.id,
			value: this.checked
		});
		processSnapshot();
	}

	/*
	Making & processing snippets
	 */

	function makeFirstSnapshot() {
		loader.addClass('creating');
		errorBox.removeClass('active');

		chrome.devtools.inspectedWindow.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
			try {
				firstSnapshot = JSON.parse(result);
			} catch (e) {
				errorBox.find('.error-message').text('DOM snapshot could not be created. Make sure that you have inspected some element.');
				errorBox.addClass('active');
			}

			processFirstSnapshot();

			loader.removeClass('creating');
		});
	}

	function makeSecondSnapshot() {
		loader.addClass('creating');
		errorBox.removeClass('active');

		chrome.devtools.inspectedWindow.eval("(" + Snapshooter.toString() + ")($0)", function (result) {
			try {
				secondSnapshot = JSON.parse(result);
			} catch (e) {
				errorBox.find('.error-message').text('DOM snapshot could not be created. Make sure that you have inspected some element.');
				errorBox.addClass('active');
			}

			processSecondSnapshot();

			loader.removeClass('creating');
		});
	}

	function processFirstSnapshot() {
		if (!firstSnapshot) {
			console.log("first error");
			return;
		}

		var styles = firstSnapshot.css,
			html = firstSnapshot.html;

		if (includeAncestors.is(':checked')) {
			styles = firstSnapshot.ancestorCss.concat(styles);
			html = firstSnapshot.leadingAncestorHtml + html + firstSnapshot.trailingAncestorHtml;
		}

		loader.addClass('processing');

		if (removeDefaultValuesInput.is(':checked')) {
			styles = defaultValueFilter1.process(styles);
		}

		borderRadiusWorkaround1.process(styles);

		if (propertiesCleanUpInput.is(':checked')) {
			styles = shorthandPropertyFilter1.process(styles);
		}
		if (removeWebkitPropertiesInput.is(':checked')) {
			styles = webkitPropertiesFilter1.process(styles);
		}
		if (combineSameRulesInput.is(':checked')) {
			styles = sameRulesCombiner1.process(styles);
		}

		if (fixHTMLIndentationInput.is(':checked')) {
			html = $.htmlClean(html, {
				removeTags: ['class'],
				allowedAttributes: [
					['id'],
					['placeholder', ['input', 'textarea']],
					['disabled', ['input', 'textarea', 'select', 'option', 'button']],
					['value', ['input', 'button']],
					['readonly', ['input', 'textarea', 'option']],
					['label', ['option']],
					['selected', ['option']],
					['checked', ['input']]
				],
				format: true,
				replace: [],
				replaceStyles: [],
				allowComments: true
			});
		}
		console.log(html);
		styles1 = styles;

		firstHTML = html;
		firstCSS = cssStringifier1.process(styles);
		htmlTextarea1.val(firstHTML);
		cssTextarea1.val(firstCSS);

		loader.removeClass('processing');
	}

	function processSecondSnapshot() {
		if (!secondSnapshot) {
			return;
		}

		var styles = secondSnapshot.css,
			html = secondSnapshot.html;

		if (includeAncestors.is(':checked')) {
			styles = secondSnapshot.ancestorCss.concat(styles);
			html = secondSnapshot.leadingAncestorHtml + html + secondSnapshot.trailingAncestorHtml;
		}

		loader.addClass('processing');

		if (removeDefaultValuesInput.is(':checked')) {
			styles = defaultValueFilter2.process(styles);
		}

		borderRadiusWorkaround2.process(styles);

		if (propertiesCleanUpInput.is(':checked')) {
			styles = shorthandPropertyFilter2.process(styles);
		}
		if (removeWebkitPropertiesInput.is(':checked')) {
			styles = webkitPropertiesFilter2.process(styles);
		}
		if (combineSameRulesInput.is(':checked')) {
			styles = sameRulesCombiner2.process(styles);
		}

		if (fixHTMLIndentationInput.is(':checked')) {
			html = $.htmlClean(html, {
				removeTags: ['class'],
				allowedAttributes: [
					['id'],
					['placeholder', ['input', 'textarea']],
					['disabled', ['input', 'textarea', 'select', 'option', 'button']],
					['value', ['input', 'button']],
					['readonly', ['input', 'textarea', 'option']],
					['label', ['option']],
					['selected', ['option']],
					['checked', ['input']]
				],
				format: true,
				replace: [],
				replaceStyles: [],
				allowComments: true
			});
		}

		styles2 = styles;
		secondHTML = html;
		secondCSS = cssStringifier2.process(styles)
		htmlTextarea2.val(secondHTML);
		cssTextarea2.val(secondCSS);

		loader.removeClass('processing');
	}

	function compareSnapshots(){
		var dmp = new diff_match_patch();
		var diffHTML = dmp.diff_main(firstHTML,secondHTML);
		var diffCSS = dmp.diff_main(firstCSS,secondCSS);
		dmp.diff_cleanupSemantic(diffHTML);
		dmp.diff_cleanupSemantic(diffCSS);
		var dsHTML = dmp.diff_prettyHtml(diffHTML);
		document.getElementById('outputHTML').innerHTML = dsHTML;
		var dsCSS = dmp.diff_prettyHtml(diffCSS);
		document.getElementById('outputCSS').innerHTML = dsCSS;
		report.val(dmp.differenceReport(diffCSS));
	}

	function showDetail(){
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

	function switch_to_add(){
		add();
		document.getElementById("add_and_save").hidden = false;
		document.getElementById("input_button").style.display = "none";
	};

    function add(){
        data.index++;
		var div = document.createElement("div");
		div.id = "div_" + data.index;
		var select_label = document.createElement("label");
		select_label.innerHTML = " Select Property ";

		var select = document.createElement("select");
		select.className = "select_property";
		for (const val of data.list){
			var option = document.createElement("option");
			option.value = val;
			option.text = val.charAt(0).toUpperCase() + val.slice(1);
			select.appendChild(option);
    	}
		select.style = "margin-left: 20px;";

		var property_label = document.createElement("label");
		property_label.innerHTML = " Property Value ";
		property_label.style = "margin-left: 20px;";

		var property_input = document.createElement("input");
		property_input.type = "text";
		property_input.className = "property_value";
		property_input.style = "margin-left: 20px;";
		

		div.appendChild(select_label);
		div.appendChild(select);
		div.appendChild(property_label);
		div.appendChild(property_input);
		var element = document.getElementById("property_div");
		element.append(div);
    }

//         <label for=\"\">Property Value
//             <input type=\"text\" class=\"property_value\"/>
//         </label>

//         <label for=\"\" style=\"margin-left: 20px;\" onclick=\"del(${data.index})\">
//                 Delete
//         </label>
//     </div>
// </script>

    function del(id) {
        document.getElementById("div_d"+ id).html('');
    }


    function save(){

        for (let i = 0; i < data.list.length; i++) {
            const element = data.list[i];
            document.getElementById('template_div').css({ element: "" })
        }

		document.getElementsByClassName("select_div").each(function (index, domEle) {

            var select_property = (domEle).find('.select_property').val().toString();
            var property_value = (domEle).find('.property_value').val().toString();

            if(property_value!=null&& property_value!=undefined&& property_value!=''){
                document.getElementById('#template_div').css({ select_property: property_value})
            }

        });
    }

})();

