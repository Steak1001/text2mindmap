// Undo/Redo system with 500ms debounce and in-memory state history
(function() {
	const MAX_STATES = 50;
	let undoStack = [];
	let redoStack = [];
	let debounceTimer = null;
	let lastSavedState = null;
	let isInitialized = false;

	const undoRedo = {
		// Push current state to undo stack with 500ms debounce
		pushSnapshot(text) {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				if (text !== lastSavedState) {
					undoStack.push(text);
					if (undoStack.length > MAX_STATES) {
						undoStack.shift();
					}
					redoStack = [];
					lastSavedState = text;
				}
			}, 500);
		},

		undo(currentText) {
			clearTimeout(debounceTimer);
			if (undoStack.length > 0) {
				redoStack.push(currentText);
				const previousState = undoStack.pop();
				lastSavedState = previousState;
				return previousState;
			}
			return currentText;
		},

		redo(currentText) {
			clearTimeout(debounceTimer);
			if (redoStack.length > 0) {
				undoStack.push(currentText);
				const nextState = redoStack.pop();
				lastSavedState = nextState;
				return nextState;
			}
			return currentText;
		},

		hasUndo() {
			return undoStack.length > 0;
		},

		hasRedo() {
			return redoStack.length > 0;
		},

		clear() {
			undoStack = [];
			redoStack = [];
			lastSavedState = null;
			clearTimeout(debounceTimer);
		}
	};

	$(document).ready(function() {
		const $textArea = $('#textArea');

		// Keyboard bindings
		shortcuts.addBindings({
			'Ctrl+Z': function() {
				const current = $textArea.val();
				const previous = undoRedo.undo(current);
				if (previous !== current) {
					$textArea.val(previous);
					$textArea.trigger('input');
				}
			},
			'Ctrl+Shift+Z': function() {
				const current = $textArea.val();
				const next = undoRedo.redo(current);
				if (next !== current) {
					$textArea.val(next);
					$textArea.trigger('input');
				}
			}
		});

		// Initialize with current content
		lastSavedState = $textArea.val();
		isInitialized = true;

		// Push snapshot on text input (after initialization)
		$textArea.on('input propertychange', function() {
			if (isInitialized) {
				undoRedo.pushSnapshot($textArea.val());
			}
		});

		// Hook into file new to clear undo/redo
		const originalFileNew = appFunctions.fileNew;
		appFunctions.fileNew = function() {
			undoRedo.clear();
			originalFileNew.call(appFunctions);
			// Re-initialize after file new
			setTimeout(() => {
				lastSavedState = $textArea.val();
			}, 100);
		};

		// Monitor file import by tracking significant content changes
		// (when someone imports a file via file input)
		const originalVal = $.fn.val;
		$textArea.val = function(newVal) {
			const result = originalVal.call(this, newVal);
			if (typeof newVal === 'string' && newVal !== lastSavedState && isInitialized) {
				// Large content change detected (likely file import)
				if (Math.abs(newVal.length - lastSavedState.length) > 50) {
					undoRedo.clear();
					lastSavedState = newVal;
				}
			}
			return result;
		};
	});

	// Export for testing/debugging
	window.undoRedo = undoRedo;
}());
