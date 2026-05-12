// Helper functions for saving and loading user settings with localStorage.
settings = (function() {
	const prefix = "text2mindmap";
	const defaultValues = {
		"documentContent": "Text2MindMap\n\tTurn tab-indented lists into mind maps\n\t\tPress Tab to indent lines\n\t\tPress Shift + Tab to unindent lines\n\tDrag nodes to re-organize them\n\tRight-click the mindmap to save it as an image\n\tThis project is based on the now dead site Text2MindMap.com",
		"documentTitle": "Untitled Document"
	};
	const fontFamilyMap = {
		"monospace": "monospace",
		"sans-serif": "sans-serif",
		"serif": "serif",
	};

	function getSetting(key) {
		let setting;
		try { setting = JSON.parse(localStorage.getItem(prefix + key)); } catch(e) {}
		if (!setting || setting == "") {
			setting = getDefaultValue(key);
			setSetting(key, setting);
		}
		return setting;
	}

	function setSetting(key, value) {
		if (!value) value = getDefaultValue(key);
		try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch(e) {
			console.error('Error saving setting. Key: ' + key);
		}
	}

	function getDefaultValue(key) {
		if (key in defaultValues) return defaultValues[key];
	}

	function reset() {
		for (let key in defaultValues) setSetting(key, getDefaultValue(key));
	}

	return { getSetting, setSetting, fontFamilyMap, getDefaultValue, reset };
}());
