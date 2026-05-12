// Logic for importing a Markdown document from the user's local drive.
fileImport = (function() {
	$(document).ready(function() {
		if (window.FileReader) {
			$("#file-input").on("change", fileInput);
		}
	});

	function fileInput(event) {
		event.stopPropagation();
		event.preventDefault();
		if (event.target && event.target.files && event.target.files.length > 0) {
			const selectedFile = event.target.files[0];
			const reader = new FileReader();
			const fileName = selectedFile.name;
			reader.onloadend = function(event) { handleUpload(event, fileName); };
			reader.readAsText(selectedFile);
		}
		$("#file-input").val("");
	}

	function handleUpload(event, fileName) {
		if (event.target.readyState !== 2) return;
		if (event.target.error) { alert("There was an error opening the file."); return; }
		const content = event.target.result;
		documentTitle.setTitle(fileName.replace("/\.txt$/", ""));
		$("#textArea").val(content);
		mindmap.render();
		unsavedChanges.setHasChanges(false);
		settings.setSetting("documentTitle", settings.getDefaultValue("documentTitle"));
		settings.setSetting("documentContent", settings.getDefaultValue("documentContent"));
	}

	function chooseFile() {
		if (!window.FileReader) {
			alert("Your browser doesn't support opening files.");
			return;
		}
		$("#file-input").click();
	}

	return { chooseFile };
}());
