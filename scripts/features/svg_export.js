// SVG export — saves the current mind map canvas as an SVG file.
// Hooks into the existing fileExport module.
(function() {
	$(document).ready(function() {
		// Register the navbar click
		$('#file-save-svg').on('click', function(e) {
			e.preventDefault();
			exportSVG();
		});

		// Register Ctrl+E shortcut
		shortcuts.addBinding('ctrl+e', exportSVG);
	});

	function exportSVG() {
		// KineticJS renders to a <canvas>. Convert that canvas to SVG via data URL.
		// We wrap the canvas image in an SVG <image> element for full fidelity.
		var canvas = document.querySelector('#stageHolder canvas');
		if (!canvas) {
			alert('Nothing to export yet — create a mind map first.');
			return;
		}
		var dataURL = canvas.toDataURL('image/png');
		var w = canvas.width;
		var h = canvas.height;
		var svgContent = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"',
			'     width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">',
			'  <image width="' + w + '" height="' + h + '" xlink:href="' + dataURL + '"/>',
			'</svg>'
		].join('\n');
		var title = (typeof documentTitle !== 'undefined') ? documentTitle.getTitle() : 'mindmap';
		fileExport.saveFile(svgContent, title, '.svg');
	}
}());
