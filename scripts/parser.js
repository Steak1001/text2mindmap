// parser.js — converts indented text into a tree structure for D3
const Parser = (() => {
  function parse(text) {
    const lines = text
      .split('\n')
      .filter(l => l.trim() && !l.trim().startsWith('#'));
    if (!lines.length) return null;

    const root = { name: '', children: [], _depth: -1 };
    const stack = [root];

    for (const line of lines) {
      const depth = getDepth(line);
      const name  = line.trim();
      if (!name) continue;
      const node = { name, children: [], _depth: depth, _collapsed: false };
      while (stack.length > 1 && stack[stack.length - 1]._depth >= depth) stack.pop();
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }

    if (root.children.length === 1) return root.children[0];
    root.name = 'Root';
    root._depth = 0;
    return root;
  }

  function getDepth(line) {
    let d = 0;
    for (const ch of line) { if (ch === '\t') d++; else break; }
    return d;
  }

  return { parse };
})();
