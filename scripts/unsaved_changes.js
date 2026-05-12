// Small module for setting whether the user has unsaved changes.
unsavedChanges = (function() {
	const defaultMessage = "You have unsaved changes. Are you sure you want to continue?";
	let hasChanges = false;

	function confirmContinue(message) {
		return !getHasChanges() || confirm(message || defaultMessage);
	}
	function setHasChanges(value) { hasChanges = value; }
	function getHasChanges() { return hasChanges; }

	return { setHasChanges, getHasChanges, confirmContinue };
}());
