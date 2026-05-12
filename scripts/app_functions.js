// A library of various functions that can be called by the app.
appFunctions = (function() {
	return {
		fileNew() {
			if (!unsavedChanges.confirmContinue()) { return; }
			$("#textArea").val(settings.getDefaultValue("documentContent"));
			mindmap.render();
			documentTitle.setTitle(settings.getDefaultValue("documentTitle"));
			unsavedChanges.setHasChanges(false);
			settings.setSetting("documentContent", settings.getDefaultValue("documentContent"));
			settings.setSetting("documentTitle", settings.getDefaultValue("documentTitle"));
		},
		fileOpen() {
			if (!unsavedChanges.confirmContinue()) { return; }
			fileImport.chooseFile();
		},
		fileSave() {
			const content = $("#textArea").val();
			const title = documentTitle.getTitle();
			fileExport.saveFile(content, title, ".txt");
			unsavedChanges.setHasChanges(false);
			settings.setSetting("documentTitle", settings.getDefaultValue("documentTitle"));
			settings.setSetting("documentContent", settings.getDefaultValue("documentContent"));
		},
		fileRename() {
			documentTitle.focus();
		},
		filePreferences() {
			$("#settings-modal").addClass("active");
		}
	};
}());
