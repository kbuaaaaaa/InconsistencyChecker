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
		compareButton = $('#compare-button'),
		styles2

	restoreSettings();

	propertiesCleanUpInput.on('change', persistSettingAndProcessSnapshot);
	removeDefaultValuesInput.on('change', persistSettingAndProcessSnapshot);
	removeWebkitPropertiesInput.on('change', persistSettingAndProcessSnapshot);
	fixHTMLIndentationInput.on('change', persistSettingAndProcessSnapshot);
	combineSameRulesInput.on('change', persistSettingAndProcessSnapshot);
	includeAncestors.on('change', persistSettingAndProcessSnapshot);

	compareButton.on('click', generateReport);

	createButton1.on('click', makeFirstSnapshot);
	createButton2.on('click', makeSecondSnapshot);
	// compare styles1 and styles2 (the CSS properties)
	comparison.val("Here goes the comparison of styles!")
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
		htmlTextarea1.val(html);

		styles1 = styles;
		cssTextarea1.val(cssStringifier1.process(styles));

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

		htmlTextarea2.val(html);

		styles2 = styles;
		cssTextarea2.val(cssStringifier2.process(styles));

		loader.removeClass('processing');
	}

	// List of comparisons or something below
	var comparisons = "What can I say? The elements match perfectly!"

	function generateReport() {
		comparison.val(comparisons);
		};
	 
})();

