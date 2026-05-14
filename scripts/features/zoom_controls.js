// Zoom controls using CSS transforms (safer than KineticJS stage manipulation)
(function() {
	let zoomLevel = 1;
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 3;
	const ZOOM_STEP = 0.1;
	const STORAGE_KEY = 'text2mindmap_zoom_level';

	const zoomControls = {
		setZoom(newLevel) {
			newLevel = Math.max(MIN_ZOOM, Math.min(newLevel, MAX_ZOOM));
			zoomLevel = newLevel;

			const $stageHolder = $('#stageHolder');
			if ($stageHolder.length) {
				// Use CSS transform to scale the entire canvas
				$stageHolder.css('transform', `scale(${zoomLevel})`);
				$stageHolder.css('transform-origin', 'top left');

				// Save zoom level
				try {
					localStorage.setItem(STORAGE_KEY, zoomLevel);
				} catch (e) {
					console.debug('Could not save zoom level:', e);
				}

				// Update zoom display if it exists
				const $zoomDisplay = $('#zoom-level-display');
				if ($zoomDisplay.length) {
					$zoomDisplay.text(Math.round(zoomLevel * 100) + '%');
				}
			}
		},

		zoomIn() {
			zoomControls.setZoom(zoomLevel + ZOOM_STEP);
		},

		zoomOut() {
			zoomControls.setZoom(zoomLevel - ZOOM_STEP);
		},

		resetZoom() {
			zoomControls.setZoom(1);
		},

		getZoomLevel() {
			return zoomLevel;
		}
	};

	$(document).ready(function() {
		// Load saved zoom level
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				zoomControls.setZoom(parseFloat(saved));
			}
		} catch (e) {
			console.debug('Could not load zoom level:', e);
		}

		// Keyboard bindings
		shortcuts.addBindings({
			'Ctrl+Plus': function(e) {
				e.preventDefault();
				zoomControls.zoomIn();
			},
			'Ctrl+Minus': function(e) {
				e.preventDefault();
				zoomControls.zoomOut();
			},
			'Ctrl+0': function(e) {
				e.preventDefault();
				zoomControls.resetZoom();
			},
			'Ctrl+Shift+Equal': function(e) {
				e.preventDefault();
				zoomControls.zoomIn();
			}
		});

		// Navbar button click handlers
		$(document).on('click', '#zoom-in-btn', function(e) {
			e.preventDefault();
			zoomControls.zoomIn();
		});

		$(document).on('click', '#zoom-out-btn', function(e) {
			e.preventDefault();
			zoomControls.zoomOut();
		});

		$(document).on('click', '#zoom-reset-btn', function(e) {
			e.preventDefault();
			zoomControls.resetZoom();
		});

		// Mouse wheel zoom (Ctrl+Scroll)
		$(document).on('wheel', function(e) {
			if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
				e.preventDefault();
				if (e.deltaY < 0) {
					zoomControls.zoomIn();
				} else {
					zoomControls.zoomOut();
				}
			}
		});

		// Touch pinch zoom support
		let lastDistance = 0;
		$(document).on('touchmove', function(e) {
			if (e.touches.length === 2) {
				e.preventDefault();

				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const distance = Math.hypot(
					touch2.clientX - touch1.clientX,
					touch2.clientY - touch1.clientY
				);

				if (lastDistance > 0) {
					const delta = distance - lastDistance;
					if (delta > 5) {
						zoomControls.zoomIn();
					} else if (delta < -5) {
						zoomControls.zoomOut();
					}
				}

				lastDistance = distance;
			}
		}, { passive: false });

		$(document).on('touchend', function() {
			lastDistance = 0;
		});
	});

	// Export for testing/debugging
	window.zoomControls = zoomControls;
}());
