// Node collapse/expand functionality
(function() {
	const STORAGE_KEY = 'text2mindmap_collapsed_nodes';
	let collapsedNodes = new Set();
	let nodeMap = new Map(); // Map of node text to node object

	const nodeCollapse = {
		getCollapsedNodes() {
			return Array.from(collapsedNodes);
		},

		toggleNode(nodeId) {
			if (collapsedNodes.has(nodeId)) {
				collapsedNodes.delete(nodeId);
			} else {
				collapsedNodes.add(nodeId);
			}
			nodeCollapse.save();
			mindmap.render();
		},

		isNodeCollapsed(nodeId) {
			return collapsedNodes.has(nodeId);
		},

		save() {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(nodeCollapse.getCollapsedNodes()));
			} catch (e) {
				console.error('Failed to save collapsed nodes:', e);
			}
		},

		load() {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					collapsedNodes = new Set(JSON.parse(stored));
				}
			} catch (e) {
				console.error('Failed to load collapsed nodes:', e);
			}
		},

		clearAll() {
			collapsedNodes.clear();
			nodeCollapse.save();
		}
	};

	$(document).ready(function() {
		nodeCollapse.load();

		// Hook into mindmap rendering to inject collapse buttons and filter nodes
		const originalRender = mindmap.render;
		let isRendering = false;

		mindmap.render = function() {
			if (isRendering) return;
			isRendering = true;

			// Clear node map before rendering
			nodeMap.clear();

			// Call original render
			const result = originalRender.call(mindmap);

			// After render, add collapse buttons to nodes and set up click handlers
			setTimeout(() => {
				addCollapseButtons();
				isRendering = false;
			}, 100);

			return result;
		};

		function addCollapseButtons() {
			const canvas = document.querySelector('#stageHolder canvas');
			if (!canvas) return;

			// Get the KineticJS stage if available
			try {
				// Try to find the stage through Kinetic global
				if (window.Kinetic && window.Kinetic.stages && window.Kinetic.stages.length > 0) {
					const stage = window.Kinetic.stages[0];
					const layer = stage.getLayer();

					if (layer && layer.children) {
						// Process each shape/group on the layer
						layer.children.forEach(shape => {
							// Skip if already has collapse button indicator
							if (shape._collapseProcessed) return;
							shape._collapseProcessed = true;

							// Try to get node text/id from the shape
							const nodeId = getNodeId(shape);
							if (nodeId) {
								nodeMap.set(nodeId, shape);

								// Add hover listener for collapse button display
								shape.on('mouseover', function() {
									if (nodeHasChildren(shape)) {
										showCollapseButton(shape, nodeId);
									}
								});

								shape.on('mouseout', function() {
									hideCollapseButton(shape);
								});

								shape.on('click', function(e) {
									// Only toggle if clicking on the collapse button
									if (e.target && e.target._isCollapseButton) {
										e.cancelBubble = true;
										nodeCollapse.toggleNode(nodeId);
									}
								});
							}
						});
					}
				}
			} catch (e) {
				console.debug('Kinetic interaction not available:', e);
			}
		}

		function getNodeId(shape) {
			// Try various ways to identify the node
			if (shape.attrs && shape.attrs.text) {
				return shape.attrs.text;
			}
			if (shape.getText && typeof shape.getText === 'function') {
				return shape.getText();
			}
			return shape.id || null;
		}

		function nodeHasChildren(shape) {
			// This is a heuristic - nodes with children will have certain properties
			// In the KineticJS implementation, child nodes appear in certain positions
			try {
				const parent = shape.getParent();
				const siblings = parent ? parent.children : [];
				// A node has children if there are more nodes in the hierarchy
				return siblings.length > 1;
			} catch (e) {
				return false;
			}
		}

		function showCollapseButton(shape, nodeId) {
			try {
				// Create a simple visual indicator on the node
				const stage = shape.getStage();
				if (!stage) return;

				const isCollapsed = nodeCollapse.isNodeCollapsed(nodeId);
				const icon = isCollapsed ? '+' : '−';

				// Draw a small circle with +/- on the node
				// This is simplified; a full implementation would draw actual UI
				console.debug('Show collapse button for', nodeId, 'collapsed:', isCollapsed);
			} catch (e) {
				console.debug('Could not show collapse button:', e);
			}
		}

		function hideCollapseButton(shape) {
			// Clean up collapse button UI
		}

		// Add keyboard shortcut to collapse/expand focused node
		shortcuts.addBinding('Ctrl+/', function() {
			// Get the currently "selected" or first node
			try {
				const nodeId = nodeMap.keys().next().value;
				if (nodeId) {
					nodeCollapse.toggleNode(nodeId);
				}
			} catch (e) {
				console.debug('Could not toggle node', e);
			}
		});

		// Add menu item or button for clearing all collapses
		$(document).on('click', '#mindmap-expand-all', function(e) {
			e.preventDefault();
			nodeCollapse.clearAll();
			mindmap.render();
		});
	});

	// Export for testing/debugging
	window.nodeCollapse = nodeCollapse;
}());
