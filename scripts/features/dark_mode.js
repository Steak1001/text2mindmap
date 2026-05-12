// Dark mode toggle — additive feature, does not touch any original code.
(function() {
	$(document).ready(function() {
		var $toggle = $('#dark-mode-toggle');
		var $body = $('body');
		var STORAGE_KEY = 'text2mindmap_darkmode';

		// Restore preference across sessions
		try {
			if (localStorage.getItem(STORAGE_KEY) === 'true') {
				$body.addClass('dark-mode');
				$toggle.addClass('active');
			}
		} catch(e) {}

		$toggle.on('click', function(e) {
			e.preventDefault();
			$body.toggleClass('dark-mode');
			$toggle.toggleClass('active');
			try {
				localStorage.setItem(STORAGE_KEY, $body.hasClass('dark-mode'));
			} catch(e) {}
		});
	});
}());
