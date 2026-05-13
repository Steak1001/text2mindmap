// Zoom controls for the mindmap canvas
(function() {
	let zoomLevel = 1;
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 3;
	const ZOOM_STEP = 0.1;
	let stage = null;

	const zoomControls = {
		getStage() {
			if (stage) return stage;
			try {
				if (window.Kinetic && window.Kinetic.stages && window.Kinetic.stages.length > 0) {
					stage = window.Kinetic.stages[0];
					return stage;
				}
			} catch (e) {
				console.debug('Stage lookup error:', e);
			}
			return null;
		},

		setZoom(newLevel) {
			newLevel = Math.max(MIN_ZOOM, Math.min(newLevel, MAX_ZOOM));
			zoomLevel = newLevel;
			const currentStage = zoomControls.getStage();
			if (currentStage && currentStage.scale) {
				currentStage.scale({ x: zoomLevel, y: zoomLevel });
				if (currentStage.draw) currentStage.draw();
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
			return Math.round(zoomLevel * 100);
		}
	};

	$(document).ready(function() {
		// Keyboard bindings
		shortcuts.addBindings({
			'Ctrl+Plus': zoomControls.zoomIn,
			'Ctrl+Minus': zoomControls.zoomOut,
			'Ctrl+0': zoomControls.resetZoom,
			'Ctrl+Shift+Equal': zoomControls.zoomIn
		});

		// Navbar button click handlers
		$('#zoom-in-btn').on('click', function(e) {
			e.preventDefault();
			zoomControls.zoomIn();
		});

		$('#zoom-out-btn').on('click', function(e) {
			e.preventDefault();
			zoomControls.zoomOut();
		});

		$('#zoom-reset-btn').on('click', function(e) {
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

		// Capture stage after mindmap renders
		const originalRender = mindmap.render;
		mindmap.render = function() {
			const result = originalRender.call(mindmap);
			setTimeout(() => {
				try {
					if (!stage && window.Kinetic && window.Kinetic.stages && window.Kinetic.stages.length > 0) {
						stage = window.Kinetic.stages[0];
					}
				} catch (e) {
					console.debug('Stage capture failed:', e);
				}
			}, 50);
			return result;
		};
	});

	window.zoomControls = zoomControls;
}());


