// Node collapse/expand functionality
(function() {
	const STORAGE_KEY = 'text2mindmap_collapsed_nodes';
	let collapsedNodes = new Set();
	let nodeMap = new Map();
	let currentHoveredNode = null;

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

		const originalRender = mindmap.render;
		let isRendering = false;

		mindmap.render = function() {
			if (isRendering) return;
			isRendering = true;

			nodeMap.clear();
			currentHoveredNode = null;
			removeCollapseButton();

			const result = originalRender.call(mindmap);

			setTimeout(() => {
				setupNodeHoverHandlers();
				isRendering = false;
			}, 100);

			return result;
		};

		function setupNodeHoverHandlers() {
			try {
				if (!window.Kinetic || !window.Kinetic.stages || window.Kinetic.stages.length === 0) {
					return;
				}

				const stage = window.Kinetic.stages[0];
				const layer = stage.getLayer();

				if (!layer || !layer.children) return;

				layer.children.forEach(shape => {
					if (shape._collapseHoverSetup) return;
					shape._collapseHoverSetup = true;

					const nodeId = getNodeIdentifier(shape);
					if (!nodeId) return;

					nodeMap.set(nodeId, shape);

					shape.on('mouseover', function(e) {
						currentHoveredNode = nodeId;
						const hasChildren = checkNodeHasChildren(shape);
						if (hasChildren) {
							showCollapseButton(nodeId, shape);
						}
					});

					shape.on('mouseout', function() {
						if (currentHoveredNode === nodeId) {
							currentHoveredNode = null;
							removeCollapseButton();
						}
					});
				});
			} catch (e) {
				console.debug('Node hover setup error:', e);
			}
		}

		function getNodeIdentifier(shape) {
			try {
				if (shape.attrs && shape.attrs.text) {
					return shape.attrs.text.toString().trim();
				}
				if (shape.getText && typeof shape.getText === 'function') {
					const text = shape.getText();
					return text ? text.toString().trim() : null;
				}
				if (shape.id) {
					return shape.id.toString();
				}
			} catch (e) {
				console.debug('Could not get node identifier:', e);
			}
			return null;
		}

		function checkNodeHasChildren(shape) {
			try {
				const layer = shape.getLayer();
				if (!layer || !layer.children) return false;

				const shapeIndex = layer.children.indexOf(shape);
				if (shapeIndex === -1) return false;

				const nextShape = layer.children[shapeIndex + 1];
				if (!nextShape) return false;

				const currentX = shape.getX ? shape.getX() : shape.x;
				const nextX = nextShape.getX ? nextShape.getX() : nextShape.x;

				return nextX > currentX;
			} catch (e) {
				console.debug('Could not check for children:', e);
				return false;
			}
		}

		function showCollapseButton(nodeId, shape) {
			removeCollapseButton();

			try {
				const canvas = document.querySelector('#stageHolder canvas');
				if (!canvas) return;

				const isCollapsed = nodeCollapse.isNodeCollapsed(nodeId);
				const button = document.createElement('button');
				button.className = 'node-collapse-btn';
				button.id = 'active-node-collapse-btn';
				button.innerHTML = isCollapsed ? '+' : '−';
				button.title = isCollapsed ? 'Expand' : 'Collapse';

				button.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					nodeCollapse.toggleNode(nodeId);
				});

				button.addEventListener('mouseout', function() {
					setTimeout(() => {
						if (currentHoveredNode === nodeId) {
							removeCollapseButton();
						}
					}, 100);
				});

				const container = document.querySelector('#viewer-container');
				if (container) {
					container.appendChild(button);
					button.style.position = 'fixed';
					button.style.top = '60px';
					button.style.right = '30px';
				}
			} catch (e) {
				console.debug('Could not show collapse button:', e);
			}
		}

		function removeCollapseButton() {
			const btn = document.getElementById('active-node-collapse-btn');
			if (btn) btn.remove();
		}

		shortcuts.addBinding('Ctrl+/', function() {
			if (currentHoveredNode) {
				nodeCollapse.toggleNode(currentHoveredNode);
			}
		});

		$(document).on('click', '#mindmap-expand-all', function(e) {
			e.preventDefault();
			nodeCollapse.clearAll();
			mindmap.render();
		});
	});

	window.nodeCollapse = nodeCollapse;
}());

