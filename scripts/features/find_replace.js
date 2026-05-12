// Find & Replace — additive feature, no original files touched.
(function() {
	$(document).ready(function() {
		var $modal  = $('#find-replace-modal');
		var $findIn = $('#find-input');
		var $replIn = $('#replace-input');
		var $status = $('#find-replace-status');
		var $ta     = $('#textArea');
		var lastIndex = 0;

		// Ctrl+H shortcut
		shortcuts.addBinding('ctrl+h', function() {
			$modal.addClass('active');
			$findIn.focus();
			lastIndex = 0;
			$status.text('').removeClass('found not-found');
		});

		// Close via backdrop or X button
		$('#close-find-replace, #find-replace-backdrop').on('click', function() {
			$modal.removeClass('active');
		});

		// Find Next
		$('#find-replace-find').on('click', findNext);
		$findIn.on('keydown', function(e) { if (e.which === 13) findNext(); });

		function findNext() {
			var needle = $findIn.val();
			if (!needle) return;
			var text = $ta.val();
			var idx = text.indexOf(needle, lastIndex);
			if (idx === -1) idx = text.indexOf(needle, 0);
			if (idx === -1) {
				$status.text('Not found.').removeClass('found').addClass('not-found');
				lastIndex = 0;
			} else {
				$ta[0].focus();
				$ta[0].setSelectionRange(idx, idx + needle.length);
				lastIndex = idx + needle.length;
				var count = (text.match(new RegExp(esc(needle), 'g')) || []).length;
				$status.text(count + ' match' + (count !== 1 ? 'es' : '') + ' found.')
					   .removeClass('not-found').addClass('found');
			}
		}

		// Replace one
		$('#find-replace-replace').on('click', function() {
			var needle = $findIn.val(), repl = $replIn.val();
			if (!needle) return;
			var text = $ta.val();
			var start = lastIndex > needle.length ? lastIndex - needle.length : 0;
			var idx = text.indexOf(needle, start);
			if (idx === -1) idx = text.indexOf(needle, 0);
			if (idx === -1) { $status.text('Not found.').removeClass('found').addClass('not-found'); return; }
			$ta.val(text.substring(0, idx) + repl + text.substring(idx + needle.length)).trigger('input');
			lastIndex = idx + repl.length;
			$status.text('Replaced.').removeClass('not-found').addClass('found');
		});

		// Replace all
		$('#find-replace-all').on('click', function() {
			var needle = $findIn.val(), repl = $replIn.val();
			if (!needle) return;
			var text = $ta.val();
			var count = (text.match(new RegExp(esc(needle), 'g')) || []).length;
			if (!count) { $status.text('Not found.').removeClass('found').addClass('not-found'); return; }
			$ta.val(text.split(needle).join(repl)).trigger('input');
			lastIndex = 0;
			$status.text('Replaced ' + count + ' instance' + (count !== 1 ? 's' : '') + '.')
				   .removeClass('not-found').addClass('found');
		});

		function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
	});
}());
