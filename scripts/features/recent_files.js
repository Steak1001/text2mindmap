// Recent files manager
(function() {
	const MAX_RECENT = 5;
	const STORAGE_KEY = 'text2mindmap_recent_files';

	const recentFiles = {
		getList() {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				return stored ? JSON.parse(stored) : [];
			} catch (e) {
				return [];
			}
		},

		add(title, content) {
			if (!title || !content) return;

			let list = recentFiles.getList();
			// Remove if already exists (to put it at top)
			list = list.filter(item => item.title !== title);
			// Add to beginning
			list.unshift({
				title: title,
				content: content,
				timestamp: new Date().toISOString()
			});
			// Keep only MAX_RECENT
			list = list.slice(0, MAX_RECENT);

			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
			} catch (e) {
				console.error('Failed to save recent files:', e);
			}
		},

		load(title) {
			const list = recentFiles.getList();
			const item = list.find(f => f.title === title);
			if (item) {
				return item.content;
			}
			return null;
		},

		remove(title) {
			let list = recentFiles.getList();
			list = list.filter(item => item.title !== title);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
			} catch (e) {
				console.error('Failed to update recent files:', e);
			}
		}
	};

	$(document).ready(function() {
		// Hook into file operations to track recent files
		const originalFileNew = appFunctions.fileNew;
		appFunctions.fileNew = function() {
			originalFileNew.call(appFunctions);
		};

		// Track when user changes document title or saves
		$(document).on('settingsUpdated', function(e, key) {
			if (key === 'documentTitle' || key === 'documentContent') {
				const title = document.querySelector('.document-title-input').value || 'untitled';
				const content = $('#textArea').val();
				if (content.trim().length > 0) {
					recentFiles.add(title, content);
				}
			}
		});

		// Update recent files when document title changes
		$('.document-title-input').on('change blur', function() {
			const title = $(this).val() || 'untitled';
			const content = $('#textArea').val();
			if (content.trim().length > 0) {
				recentFiles.add(title, content);
				updateRecentFilesMenu();
			}
		});

		// Save to recent when user saves a file
		$(document).on('click', '#file-save', function() {
			setTimeout(() => {
				const title = document.querySelector('.document-title-input').value || 'untitled';
				const content = $('#textArea').val();
				if (content.trim().length > 0) {
					recentFiles.add(title, content);
					updateRecentFilesMenu();
				}
			}, 100);
		});

		// Save to recent periodically (every 30 seconds while editing)
		setInterval(() => {
			const title = document.querySelector('.document-title-input').value || 'untitled';
			const content = $('#textArea').val();
			if (content.trim().length > 0) {
				recentFiles.add(title, content);
			}
		}, 30000);

		function updateRecentFilesMenu() {
			const list = recentFiles.getList();
			let html = '';

			if (list.length === 0) {
				html = '<li style="padding: 10px; color: #999;">No recent files</li>';
			} else {
				list.forEach(item => {
					html += `<li><a href="#" class="recent-file-item" data-title="${escapeHtml(item.title)}"><i class="fa fa-file-text fa-fw"></i>${escapeHtml(item.title)}</a></li>`;
				});
			}

			$('#recent-files-menu').html(html);
		}

		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		// Load recent file on click
		$(document).on('click', '.recent-file-item', function(e) {
			e.preventDefault();
			const title = $(this).data('title');
			const content = recentFiles.load(title);

			if (content) {
				// Check for unsaved changes
				if (unsavedChanges.getHasChanges()) {
					const confirmed = confirm('You have unsaved changes. Do you want to discard them?');
					if (!confirmed) return;
				}

				// Load the file
				document.querySelector('.document-title-input').value = title;
				$('#textArea').val(content);
				$('#textArea').trigger('input');
				mindmap.render();
				unsavedChanges.setHasChanges(false);
			}
		});

		// Initialize menu on page load
		updateRecentFilesMenu();

		// Update menu periodically
		setInterval(updateRecentFilesMenu, 60000);
	});

	// Export for testing/debugging
	window.recentFiles = recentFiles;
}());
