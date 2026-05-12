// renderer.js — D3 v7 SVG mind map renderer
// Replaces old KineticJS + D3 v3 canvas renderer
const Renderer = (() => {
  const BRANCH_COLORS = [
    '#01696f','#2563eb','#7c3aed','#db2777',
    '#d97706','#16a34a','#0891b2','#9333ea',
  ];

  let svg, g, zoomBehavior, currentRoot = null;
  let prefs = { colorMode: 'branch', layout: 'radial', curvedLines: true };

  // ── Init ────────────────────────────────────────────────────────────────
  function init(svgEl) {
    svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    g = svg.append('g').attr('class', 'mm-canvas');
    zoomBehavior = d3.zoom()
      .scaleExtent([0.08, 5])
      .on('zoom', e => {
        g.attr('transform', e.transform);
        const lbl = document.getElementById('zoom-label');
        if (lbl) lbl.textContent = Math.round(e.transform.k * 100) + '%';
      });
    svg.call(zoomBehavior).on('dblclick.zoom', null);
  }

  // ── Render entry ────────────────────────────────────────────────────────
  function render(data, userPrefs = {}) {
    if (!svg) return;
    prefs = { ...prefs, ...userPrefs };
    currentRoot = data;
    g.selectAll('*').remove();
    if (!data) return;
    const root = d3.hierarchy(data, d => d._collapsed ? [] : d.children);
    if (prefs.layout === 'radial') renderRadial(root);
    else renderTree(root);
  }

  // ── Color helper ────────────────────────────────────────────────────────
  function nodeColor(d) {
    if (d.depth === 0) return BRANCH_COLORS[0];
    if (prefs.colorMode === 'level') return BRANCH_COLORS[d.depth % BRANCH_COLORS.length];
    // Branch coloring: follow the path back to a depth-1 child of root
    let n = d;
    while (n.depth > 1) n = n.parent;
    const idx = n.parent ? n.parent.children.indexOf(n) : 0;
    return BRANCH_COLORS[idx % BRANCH_COLORS.length];
  }

  // ── Text fill: uses CSS variable so it reacts to dark mode ──────────────
  function textFill() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--text').trim() || '#1c1b1a';
  }

  // ── Collapse on click ───────────────────────────────────────────────────
  function onNodeClick(e, d) {
    if (d.depth === 0) return;
    e.stopPropagation();
    d.data._collapsed = !d.data._collapsed;
    render(currentRoot, prefs);
  }

  // ── Radial layout ───────────────────────────────────────────────────────
  function renderRadial(root) {
    const W = svg.node().clientWidth  || 800;
    const H = svg.node().clientHeight || 600;
    const radius = Math.min(W, H) / 2 - 80;

    d3.tree().size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(root);

    const linkGen = prefs.curvedLines
      ? d3.linkRadial().angle(d => d.x).radius(d => d.y)
      : d => {
          const sx = d.source.y * Math.cos(d.source.x - Math.PI / 2);
          const sy = d.source.y * Math.sin(d.source.x - Math.PI / 2);
          const tx = d.target.y * Math.cos(d.target.x - Math.PI / 2);
          const ty = d.target.y * Math.sin(d.target.x - Math.PI / 2);
          return `M${sx},${sy}L${tx},${ty}`;
        };

    g.append('g').selectAll('path')
      .data(root.links()).join('path')
      .attr('class', 'mm-link')
      .attr('d', linkGen)
      .attr('stroke', d => nodeColor(d.target))
      .attr('opacity', 0.45);

    const node = g.append('g').selectAll('g')
      .data(root.descendants()).join('g')
      .attr('class', 'mm-node')
      .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .on('click', onNodeClick);

    node.append('circle')
      .attr('r', d => d.depth === 0 ? 18 : d.depth === 1 ? 12 : 7)
      .attr('fill', d => nodeColor(d))
      .attr('opacity', d => d.depth === 0 ? 1 : 0.82);

    node.append('text')
      .attr('dy', '0.32em')
      .attr('x', d => d.x >= Math.PI === !d.children ? 16 : -16)
      .attr('text-anchor', d => d.x >= Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
      .attr('fill', textFill())
      .attr('font-weight', d => d.depth <= 1 ? 600 : 400)
      .text(d => d.data.name);

    fitToScreen();
  }

  // ── Tree layout (top-down or left-right) ────────────────────────────────
  function renderTree(root) {
    const isLR = prefs.layout === 'lr';
    d3.tree().nodeSize(isLR ? [26, 160] : [90, 50])(root);

    if (isLR) root.descendants().forEach(d => { const t = d.x; d.x = d.y; d.y = t; });

    const linkGen = prefs.curvedLines
      ? (isLR
          ? d3.linkHorizontal().x(d => d.x).y(d => d.y)
          : d3.linkVertical().x(d => d.x).y(d => d.y))
      : d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;

    g.append('g').selectAll('path')
      .data(root.links()).join('path')
      .attr('class', 'mm-link')
      .attr('d', linkGen)
      .attr('stroke', d => nodeColor(d.target))
      .attr('opacity', 0.45);

    const node = g.append('g').selectAll('g')
      .data(root.descendants()).join('g')
      .attr('class', 'mm-node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', onNodeClick);

    node.append('circle')
      .attr('r', d => d.depth === 0 ? 18 : d.depth === 1 ? 12 : 7)
      .attr('fill', d => nodeColor(d))
      .attr('opacity', d => d.depth === 0 ? 1 : 0.82);

    node.append('text')
      .attr('dy', '0.32em')
      .attr('x', d => isLR ? (d.depth === 0 ? 0 : 18) : 0)
      .attr('y', d => isLR ? 0 : (d.depth === 0 ? 0 : -18))
      .attr('text-anchor', d => isLR ? (d.depth === 0 ? 'middle' : 'start') : 'middle')
      .attr('fill', textFill())
      .attr('font-weight', d => d.depth <= 1 ? 600 : 400)
      .text(d => d.data.name);

    fitToScreen();
  }

  // ── Zoom helpers ────────────────────────────────────────────────────────
  function fitToScreen() {
    if (!g) return;
    const W = svg.node().clientWidth  || 800;
    const H = svg.node().clientHeight || 600;
    const b = g.node().getBBox();
    if (!b.width || !b.height) return;
    const scale = Math.min(0.92, Math.min(W / (b.width + 80), H / (b.height + 80)));
    const tx = W / 2 - scale * (b.x + b.width  / 2);
    const ty = H / 2 - scale * (b.y + b.height / 2);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  function zoomBy(factor) {
    svg.transition().duration(220).call(zoomBehavior.scaleBy, factor);
  }

  // ── SVG export ──────────────────────────────────────────────────────────
  function exportSVG() {
    if (!svg) return null;
    const clone = svg.node().cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(clone);
  }

  return { init, render, zoomBy, fitToScreen, exportSVG };
})();
