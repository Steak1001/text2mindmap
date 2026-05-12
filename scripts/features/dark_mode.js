// Dark mode toggle — additive only, no original files touched.
(function() {
	$(document).ready(function() {
		var $toggle = $('#dark-mode-toggle');
		var $body = $('body');
		var KEY = 'text2mindmap_darkmode';
		try {
			if (localStorage.getItem(KEY) === 'true') {
				$body.addClass('dark-mode');
				$toggle.addClass('active');
			}
		} catch(e) {}
		$toggle.on('click', function(e) {
			e.preventDefault();
			$body.toggleClass('dark-mode');
			$toggle.toggleClass('active');
			try { localStorage.setItem(KEY, $body.hasClass('dark-mode')); } catch(e) {}
		});
	});
}());
