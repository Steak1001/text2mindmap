// Canvas export: copy to clipboard as PNG, and export as PNG/JPG
(function() {
	function getCanvasElement() {
		return document.querySelector('#stageHolder canvas');
	}

	function getTitle() {
		return document.querySelector('.document-title-input').value || 'mindmap';
	}

	const canvasExport = {
		copyToClipboard() {
			const canvas = getCanvasElement();
			if (!canvas) {
				alert('Canvas not found. Please render a mindmap first.');
				return;
			}

			// Convert canvas to blob and copy to clipboard
			canvas.toBlob(function(blob) {
				const item = new ClipboardItem({ 'image/png': blob });
				navigator.clipboard.write([item]).then(() => {
					// Visual feedback
					const button = document.getElementById('edit-copy-image');
					if (button) {
						const originalText = button.textContent;
						button.textContent = '✓ Copied!';
						setTimeout(() => {
							button.textContent = originalText;
						}, 2000);
					}
				}).catch(err => {
					alert('Failed to copy to clipboard: ' + err.message);
				});
			});
		},

		exportPNG() {
			const canvas = getCanvasElement();
			if (!canvas) {
				alert('Canvas not found. Please render a mindmap first.');
				return;
			}

			const pngDataUrl = canvas.toDataURL('image/png');
			fileExport.saveFile(pngDataUrl, getTitle(), '.png');
		},

		exportJPG(quality = 0.9) {
			const canvas = getCanvasElement();
			if (!canvas) {
				alert('Canvas not found. Please render a mindmap first.');
				return;
			}

			const jpgDataUrl = canvas.toDataURL('image/jpeg', quality);
			fileExport.saveFile(jpgDataUrl, getTitle(), '.jpg');
		}
	};

	$(document).ready(function() {
		// Keyboard bindings
		shortcuts.addBindings({
			'Ctrl+Shift+C': canvasExport.copyToClipboard,
			'Ctrl+Shift+P': canvasExport.exportPNG
		});

		// Wire button clicks if they exist
		$(document).on('click', '#edit-copy-image', function(e) {
			e.preventDefault();
			canvasExport.copyToClipboard();
		});

		$(document).on('click', '#file-export-png', function(e) {
			e.preventDefault();
			canvasExport.exportPNG();
		});

		$(document).on('click', '#file-export-jpg', function(e) {
			e.preventDefault();
			canvasExport.exportJPG();
		});
	});

	// Export for testing/debugging
	window.canvasExport = canvasExport;
}());
