// Find & Replace — works directly on the textarea content.
// Opens a modal (defined in index.html), does not touch original scripts.
(function() {
	$(document).ready(function() {
		var $modal   = $('#find-replace-modal');
		var $findIn  = $('#find-input');
		var $replIn  = $('#replace-input');
		var $status  = $('#find-replace-status');
		var $ta      = $('#textArea');

		// Track current match position for Find Next
		var lastIndex = 0;

		// Open modal
		$('#edit-find-replace').on('click', function(e) {
			e.preventDefault();
			$modal.addClass('active');
			$findIn.focus();
			lastIndex = 0;
			$status.text('').removeClass('found not-found');
		});

		shortcuts.addBinding('ctrl+h', function() {
			$('#edit-find-replace').trigger('click');
		});

		// Close modal
		$('#close-find-replace, #find-replace-backdrop').on('click', function() {
			$modal.removeClass('active');
		});

		// Find Next
		$('#find-replace-find').on('click', function() {
			findNext();
		});

		// Also trigger find on Enter in the find input
		$findIn.on('keydown', function(e) {
			if (e.which === 13) findNext();
		});

		function findNext() {
			var needle = $findIn.val();
			if (!needle) return;
			var text = $ta.val();
			var idx = text.indexOf(needle, lastIndex);
			if (idx === -1) {
				// Wrap around
				idx = text.indexOf(needle, 0);
			}
			if (idx === -1) {
				$status.text('Not found.').removeClass('found').addClass('not-found');
				lastIndex = 0;
			} else {
				$ta[0].focus();
				$ta[0].setSelectionRange(idx, idx + needle.length);
				lastIndex = idx + needle.length;
				var matchCount = (text.match(new RegExp(escapeRegex(needle), 'g')) || []).length;
				$status.text(matchCount + ' match' + (matchCount !== 1 ? 'es' : '') + ' found.')
					   .removeClass('not-found').addClass('found');
			}
		}

		// Replace current selection / next match
		$('#find-replace-replace').on('click', function() {
			var needle  = $findIn.val();
			var replace = $replIn.val();
			if (!needle) return;
			var text = $ta.val();
			var idx = text.indexOf(needle, lastIndex > 0 ? lastIndex - needle.length : 0);
			if (idx === -1) idx = text.indexOf(needle, 0);
			if (idx === -1) {
				$status.text('Not found.').removeClass('found').addClass('not-found');
				return;
			}
			var newText = text.substring(0, idx) + replace + text.substring(idx + needle.length);
			$ta.val(newText).trigger('input');
			lastIndex = idx + replace.length;
			$status.text('Replaced.').removeClass('not-found').addClass('found');
		});

		// Replace All
		$('#find-replace-all').on('click', function() {
			var needle  = $findIn.val();
			var replace = $replIn.val();
			if (!needle) return;
			var text = $ta.val();
			var count = (text.match(new RegExp(escapeRegex(needle), 'g')) || []).length;
			if (count === 0) {
				$status.text('Not found.').removeClass('found').addClass('not-found');
				return;
			}
			var newText = text.split(needle).join(replace);
			$ta.val(newText).trigger('input');
			lastIndex = 0;
			$status.text('Replaced ' + count + ' instance' + (count !== 1 ? 's' : '') + '.')
				   .removeClass('not-found').addClass('found');
		});

		function escapeRegex(s) {
			return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
	});
}());
