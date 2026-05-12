// SVG export — saves the mind map canvas as an SVG-wrapped PNG.
// Exposes exportSVGFeature() for navbar.js to call.
(function() {
	window.exportSVGFeature = function() {
		var canvas = document.querySelector('#stageHolder canvas');
		if (!canvas) {
			alert('Nothing to export yet — create a mind map first.');
			return;
		}
		var dataURL = canvas.toDataURL('image/png');
		var w = canvas.width, h = canvas.height;
		var svgContent = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"',
			'     width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">',
			'  <image width="' + w + '" height="' + h + '" xlink:href="' + dataURL + '"/>',
			'</svg>'
		].join('\n');
		var title = (typeof documentTitle !== 'undefined') ? documentTitle.getTitle() : 'mindmap';
		fileExport.saveFile(svgContent, title, '.svg');
	};

	$(document).ready(function() {
		shortcuts.addBinding('ctrl+e', window.exportSVGFeature);
	});
}());
