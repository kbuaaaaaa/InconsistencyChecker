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

		propertiesCleanUpInput = $('#properties-clean-up'),
		removeDefaultValuesInput = $('#remove-default-values'),
		removeWebkitPropertiesInput = $('#remove-webkit-properties'),
		combineSameRulesInput = $('#combine-same-rules'),
		fixHTMLIndentationInput = $('#fix-html-indentation'),
		includeAncestors = $('#include-ancestors'),
		errorBox = $('#error-box'),
		
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
		templatePageButton = $('#template_page_button'),
		comparePageButton = $('#compare_page_button'),
		data = {},

		console = chrome.extension.getBackgroundPage().console,
		template = new Template(),
		colors = [],
		fonts = [],
		borders = [],
		widths = [],
		heights = []


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
	comparePageButton.on('click',switch_to_compare);
	templatePageButton.on('click',switch_to_template);

	data.index = 0;
	data.list = [
		"select",
		"color",
		"font",
		"border",
		"width",
		"height"
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

	function switch_to_compare(){
		document.getElementById("template_page").hidden = true;
		document.getElementById("comparison_page").hidden = false;
	}

	function switch_to_template(){
		document.getElementById("template_page").hidden = false;
		document.getElementById("comparison_page").hidden = true;
	}

    function del(id) {
        const property_div = document.getElementById("property_div");
		console.log(id);
		const div = document.getElementById(id);
		property_div.removeChild(div);
    }

    function add(){
        data.index++;
		var div = document.createElement("div");
		div.id = "div_" + data.index;
		var select_label = document.createElement("label");
		select_label.innerHTML = " Select Property ";

		var property_value_div = document.createElement("div");

		var select = document.createElement("select");
		select.className = "select_property";
		for (const val of data.list){
			var option = document.createElement("option");
			option.value = val;
			option.text = val.charAt(0).toUpperCase() + val.slice(1);
			select.appendChild(option);
    	}
		select.style = "margin-left: 20px;";
		select.onchange = function(){
			var value = select.options[select.selectedIndex].value;
			if(property_value_div.childElementCount > 0){
				property_value_div.removeChild(property_value_div.lastChild);
			}
			switch (value) {
				case "color":
					var color_div = document.createElement("div");
					color_div.className = "color_div";

					var red_label = document.createElement("label");
					red_label.innerHTML = " R ";
					red_label.style = "margin-left: 20px;";
					color_div.appendChild(red_label);
			
					var red_input = document.createElement("input");
					red_input.type = "text";
					red_input.className = "red_value";
					red_input.style = "margin-left: 20px;";
					color_div.appendChild(red_input);

					var green_label = document.createElement("label");
					green_label.innerHTML = " G ";
					green_label.style = "margin-left: 20px;";
					color_div.appendChild(green_label);
			
					var green_input = document.createElement("input");
					green_input.type = "text";
					green_input.className = "green_value";
					green_input.style = "margin-left: 20px;";
					color_div.appendChild(green_input);

					var blue_label = document.createElement("label");
					blue_label.innerHTML = " B ";
					blue_label.style = "margin-left: 20px;";
					color_div.appendChild(blue_label);
			
					var blue_input = document.createElement("input");
					blue_input.type = "text";
					blue_input.className = "blue_value";
					blue_input.style = "margin-left: 20px;";
					color_div.appendChild(blue_input);

					property_value_div.appendChild(color_div)
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
					for (const key of Object.keys(FONT_STYLE)){
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
					for (const key of Object.keys(FONT_VARIANT)){
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
					for (const key of Object.keys(FONT_WEIGHT)){
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
					for (const key of Object.keys(GENERIC_FAMILY)){
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
					for (const key of Object.keys(BORDER_STYLE)){
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

    function save(){
		let	color_inputs = document.getElementsByClassName("color_div");
		for (const inputs of color_inputs) {
			let r = inputs.children[1].value,
				g = inputs.children[3].value,
				b = inputs.children[5].value,
				color = new Color(r,g,b)
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
				font_size = inputs.children[7].value,
				line_height = inputs.children[9].value,
				font_name = inputs.children[11].value,
				font_family = inputs.children[13].value,
				generic_family = inputs.children[15].value,
				font = new Font(font_style,font_variant,font_weight,font_size,line_height,font_name,font_family,generic_family)
			fonts.push(font);
		}
		console.log(fonts);
		template.font = fonts;

		let border_inputs = document.getElementsByClassName("border_div");
		for (const inputs of border_inputs) {
			let border_width = inputs.children[1].value,
				border_style = inputs.children[3].value,
				border_color = inputs.children[5].value,
				border = new Border(border_width,border_style,border_color)
			borders.push(border);
		}
		console.log(borders);
		template.border = borders;

		let width_inputs = document.getElementsByClassName("width_div");
		for (const inputs of width_inputs) {
			widths.push(inputs.children[1].value);
		}
		console.log(widths);
		template.width = widths;

		let height_inputs = document.getElementsByClassName("height_div");
		for (const inputs of height_inputs) {
			heights.push(inputs.children[1].value);
		}
		console.log(heights);
		template.height = heights;

		template.type = document.getElementById("element_class_input").value;

		console.log(template);

    }
})();

