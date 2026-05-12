// Zoom controls for the mindmap canvas
(function() {
	let zoomLevel = 1;
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 3;
	const ZOOM_STEP = 0.1;
	let stage = null;

	const zoomControls = {
		getStage() {
			if (!stage) {
				// Try to get the stage from KineticJS through the mindmap object
				// The mindmap object should have access to the stage
				stage = mindmap.getStage ? mindmap.getStage() : null;
			}
			return stage;
		},

		setZoom(newLevel) {
			newLevel = Math.max(MIN_ZOOM, Math.min(newLevel, MAX_ZOOM));
			zoomLevel = newLevel;
			const currentStage = zoomControls.getStage();
			if (currentStage) {
				currentStage.scale({ x: zoomLevel, y: zoomLevel });
				currentStage.draw();
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
			// Also handle = key (shifted +)
			'Ctrl+Shift+Equal': zoomControls.zoomIn
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

		// Get stage reference when mindmap is first rendered
		const originalRender = mindmap.render;
		mindmap.render = function() {
			const result = originalRender.call(mindmap);
			// Try to capture the stage after render
			if (!stage) {
				// Try multiple ways to get the stage
				if (mindmap.getStage) {
					stage = mindmap.getStage();
				} else if (window.Kinetic && window.Kinetic.Stage) {
					// Look for active stage in Kinetic
					stage = Kinetic.stages ? Kinetic.stages[0] : null;
				}
			}
			return result;
		};
	});

	// Export for testing/debugging
	window.zoomControls = zoomControls;
}());
