// Keyboard shortcuts help modal
(function() {
	// Registry of all available shortcuts
	const shortcutRegistry = [
		// File menu
		{ shortcut: 'Ctrl+N', action: 'New document' },
		{ shortcut: 'Ctrl+O', action: 'Open document' },
		{ shortcut: 'Ctrl+S', action: 'Save as .txt' },
		{ shortcut: 'Ctrl+E', action: 'Export as SVG' },
		{ shortcut: 'Ctrl+Shift+P', action: 'Export as PNG' },
		// Edit menu
		{ shortcut: 'Ctrl+Z', action: 'Undo' },
		{ shortcut: 'Ctrl+Shift+Z', action: 'Redo' },
		{ shortcut: 'Ctrl+H', action: 'Find & Replace' },
		{ shortcut: 'Ctrl+Shift+C', action: 'Copy image to clipboard' },
		// View
		{ shortcut: 'Ctrl+Plus', action: 'Zoom in' },
		{ shortcut: 'Ctrl+Minus', action: 'Zoom out' },
		{ shortcut: 'Ctrl+0', action: 'Reset zoom' },
		{ shortcut: 'Ctrl+Scroll', action: 'Zoom with mouse wheel' },
		// Help
		{ shortcut: 'Ctrl+?', action: 'Show this help' }
	];

	function buildHelpModalContent() {
		let html = '<div class="shortcuts-grid">';
		shortcutRegistry.forEach(item => {
			html += `
				<div class="shortcut-item">
					<kbd class="shortcut-key">${item.shortcut}</kbd>
					<span class="shortcut-action">${item.action}</span>
				</div>
			`;
		});
		html += '</div>';
		return html;
	}

	function openHelpModal() {
		const $modal = $('#keyboard-help-modal');
		$modal.addClass('active');
	}

	function closeHelpModal() {
		const $modal = $('#keyboard-help-modal');
		$modal.removeClass('active');
	}

	$(document).ready(function() {
		// Keyboard binding for help
		shortcuts.addBinding('Ctrl+?', function(e) {
			e.preventDefault();
			openHelpModal();
		});

		// Close button handler
		$(document).on('click', '#close-keyboard-help, #keyboard-help-backdrop', function(e) {
			if (this.id === 'keyboard-help-backdrop' || this.id === 'close-keyboard-help') {
				closeHelpModal();
			}
		});

		// Close on Escape key
		$(document).on('keydown', function(e) {
			if (e.keyCode === 27) {
				const $modal = $('#keyboard-help-modal');
				if ($modal.hasClass('active')) {
					closeHelpModal();
				}
			}
		});

		// Populate help modal content on first open
		if ($('#keyboard-help-content').html() === '') {
			$('#keyboard-help-content').html(buildHelpModalContent());
		}
	});

	// Export for testing
	window.keyboardHelp = {
		open: openHelpModal,
		close: closeHelpModal,
		registry: shortcutRegistry
	};
}());
