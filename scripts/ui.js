// ui.js — all DOM/UI helpers (theme, modals, dropdowns, pane resizer, file dialogs)
const UI = (() => {

  // ── Theme ──────────────────────────────────────────────────────────────
  function initTheme() {
    const saved = Settings.get('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved);
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Settings.set('theme', theme);
    const sun  = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    const btn  = document.getElementById('btn-theme-toggle');
    if (theme === 'dark') {
      sun.style.display  = 'none'; moon.style.display = '';
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      sun.style.display  = ''; moon.style.display = 'none';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // ── Modals ─────────────────────────────────────────────────────────────
  function openModal(id)  { document.getElementById(id)?.removeAttribute('hidden'); }
  function closeModal(id) { document.getElementById(id)?.setAttribute('hidden', ''); }

  function initModals() {
    document.addEventListener('click', e => {
      const closer = e.target.closest('[data-close]');
      if (closer) closeModal(closer.dataset.close);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape')
        document.querySelectorAll('.modal-overlay:not([hidden])').forEach(m => m.setAttribute('hidden', ''));
    });
  }

  // ── Dropdowns ──────────────────────────────────────────────────────────
  function initDropdowns() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('.menu-trigger');
      const item    = e.target.closest('.menu-item');
      document.querySelectorAll('.menu-item.open').forEach(m => { if (m !== item) m.classList.remove('open'); });
      if (trigger && item) { e.stopPropagation(); item.classList.toggle('open'); }
      else document.querySelectorAll('.menu-item.open').forEach(m => m.classList.remove('open'));
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.menu-item.open').forEach(m => m.classList.remove('open'));
  }

  // ── Document title ─────────────────────────────────────────────────────
  function initDocTitle() {
    const input  = document.getElementById('doc-title');
    const mirror = document.querySelector('.doc-title-mirror');
    function sync() {
      mirror.textContent = input.value || ' ';
      input.style.width  = mirror.offsetWidth + 'px';
    }
    input.addEventListener('input', () => { sync(); Settings.set('documentTitle', input.value); });
    sync();
    return {
      getTitle: () => input.value,
      setTitle: v   => { input.value = v; sync(); },
    };
  }

  // ── Pane resizer ───────────────────────────────────────────────────────
  function initPaneResizer() {
    const container  = document.getElementById('pane-container');
    const handle     = document.getElementById('resize-handle');
    const editorPane = document.getElementById('editor-pane');
    let dragging = false, startX, startW;

    handle.addEventListener('mousedown', e => {
      dragging = true; startX = e.clientX; startW = editorPane.offsetWidth;
      handle.classList.add('dragging');
      document.body.style.cssText += ';cursor:col-resize;user-select:none';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const totalW = container.offsetWidth;
      const newW   = Math.min(Math.max(startW + (e.clientX - startX), 180), totalW * 0.75);
      editorPane.style.width = newW + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // ── Collapse/expand editor ─────────────────────────────────────────────
  function initCollapseButtons(onToggle) {
    const editorPane  = document.getElementById('editor-pane');
    const handle      = document.getElementById('resize-handle');
    const collapseBtn = document.getElementById('editor-collapse-btn');
    const expandBtn   = document.getElementById('viewer-expand-btn');

    collapseBtn.addEventListener('click', () => {
      editorPane.classList.add('collapsed');
      handle.style.display = 'none';
      collapseBtn.style.display = 'none';
      expandBtn.style.display   = 'flex';
      onToggle && onToggle();
    });
    expandBtn.addEventListener('click', () => {
      editorPane.classList.remove('collapsed');
      handle.style.display = '';
      collapseBtn.style.display = 'flex';
      expandBtn.style.display   = 'none';
      onToggle && onToggle();
    });
    return {
      toggle: () => editorPane.classList.contains('collapsed') ? expandBtn.click() : collapseBtn.click(),
    };
  }

  // ── Autosave badge ─────────────────────────────────────────────────────
  function setAutosaveState(state) {
    const el    = document.getElementById('autosave-badge');
    const label = el.querySelector('.label');
    el.classList.remove('saved', 'saving', 'unsaved');
    el.classList.add(state);
    label.textContent = { saved: 'Saved', saving: 'Saving…', unsaved: 'Unsaved' }[state] || '';
  }

  // ── Toast ──────────────────────────────────────────────────────────────
  let _toastEl, _toastTimer;
  function toast(msg, duration = 1800) {
    if (!_toastEl) {
      _toastEl = document.createElement('div');
      _toastEl.className = 'toast';
      document.body.appendChild(_toastEl);
    }
    _toastEl.textContent = msg;
    _toastEl.style.display = '';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { if (_toastEl) _toastEl.style.display = 'none'; }, duration);
  }

  // ── Preferences UI ─────────────────────────────────────────────────────
  function loadPrefsUI() {
    document.getElementById('pref-color-mode').value = Settings.get('colorMode');
    document.getElementById('pref-layout').value     = Settings.get('layout');
    document.getElementById('pref-font-size').value  = Settings.get('fontSize');
    document.getElementById('pref-curved').checked   = Settings.get('curvedLines');
  }
  function savePrefsUI() {
    Settings.set('colorMode',   document.getElementById('pref-color-mode').value);
    Settings.set('layout',      document.getElementById('pref-layout').value);
    Settings.set('fontSize',    document.getElementById('pref-font-size').value);
    Settings.set('curvedLines', document.getElementById('pref-curved').checked);
  }

  // ── File helpers ───────────────────────────────────────────────────────
  function saveTextFile(content, filename) {
    _downloadBlob(new Blob([content], { type: 'text/plain' }), (filename || 'mindmap') + '.txt');
  }
  function saveSVGFile(content, filename) {
    _downloadBlob(new Blob([content], { type: 'image/svg+xml' }), (filename || 'mindmap') + '.svg');
  }
  function _downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a   = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }
  function openFileDialog(onLoad) {
    const input = document.getElementById('file-input');
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => onLoad(ev.target.result, file.name.replace(/\.[^.]+$/, ''));
      reader.readAsText(file);
      input.value = '';
    };
    input.click();
  }

  return {
    initTheme, applyTheme, openModal, closeModal, initModals,
    initDropdowns, closeAllDropdowns, initDocTitle,
    initPaneResizer, initCollapseButtons,
    setAutosaveState, toast,
    loadPrefsUI, savePrefsUI,
    saveTextFile, saveSVGFile, openFileDialog,
  };
})();
