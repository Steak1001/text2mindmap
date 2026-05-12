// main.js — app bootstrap; wires all modules together
(function () {
  'use strict';

  const textarea   = document.getElementById('textArea');
  const svgEl      = document.getElementById('mindmap-svg');
  const emptyState = document.getElementById('empty-state');

  let docTitle, collapseCtrl, renderTimer, unsaved = false;

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    UI.initTheme();
    UI.initModals();
    UI.initDropdowns();
    UI.initPaneResizer();

    docTitle     = UI.initDocTitle();
    collapseCtrl = UI.initCollapseButtons(() => setTimeout(() => Renderer.fitToScreen(), 200));

    docTitle.setTitle(Settings.get('documentTitle'));
    textarea.value = Settings.get('documentContent');
    textarea.style.fontSize = Settings.get('fontSize') + 'px';

    Renderer.init(svgEl);
    renderMap();

    bindTextarea();
    bindCommands();
    bindZoomButtons();
    bindKeyboard();
    bindPrefsModal();

    window.addEventListener('resize', debounce(() => Renderer.fitToScreen(), 200));
    UI.setAutosaveState('saved');
  }

  // ── Render ───────────────────────────────────────────────────────────
  function renderMap() {
    const tree = Parser.parse(textarea.value.trim());
    if (tree) {
      emptyState.classList.add('hidden');
      Renderer.render(tree, getPrefs());
    } else {
      emptyState.classList.remove('hidden');
      Renderer.render(null, {});
    }
  }

  function getPrefs() {
    return {
      colorMode:   Settings.get('colorMode'),
      layout:      Settings.get('layout'),
      curvedLines: Settings.get('curvedLines'),
    };
  }

  // ── Textarea ─────────────────────────────────────────────────────────
  function bindTextarea() {
    textarea.addEventListener('input', () => {
      markUnsaved();
      clearTimeout(renderTimer);
      renderTimer = setTimeout(() => {
        Settings.set('documentContent', textarea.value);
        renderMap();
        markSaved();
      }, 300);
    });

    textarea.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = textarea;
      const lines = value.split('\n');
      let pos = 0, sl = 0, el = 0;
      for (let i = 0; i < lines.length; i++) {
        if (pos + lines[i].length >= s && !sl) sl = i;
        if (pos + lines[i].length >= end)     { el = i; break; }
        pos += lines[i].length + 1;
      }
      for (let i = sl; i <= el; i++) {
        if (e.shiftKey) { if (lines[i].startsWith('\t')) lines[i] = lines[i].slice(1); }
        else lines[i] = '\t' + lines[i];
      }
      textarea.value = lines.join('\n');
      markUnsaved();
      clearTimeout(renderTimer);
      renderTimer = setTimeout(() => { Settings.set('documentContent', textarea.value); renderMap(); markSaved(); }, 300);
    });
  }

  function markUnsaved() { unsaved = true;  UI.setAutosaveState('unsaved'); }
  function markSaved()   { unsaved = false; UI.setAutosaveState('saved'); }

  // ── Commands ─────────────────────────────────────────────────────────
  const CMDS = {
    'cmd-new':            fileNew,
    'cmd-open':           fileOpen,
    'cmd-save-txt':       fileSaveTxt,
    'cmd-save-svg':       fileSaveSVG,
    'cmd-rename':         () => { document.getElementById('doc-title').focus(); document.getElementById('doc-title').select(); },
    'cmd-zoom-in':        () => Renderer.zoomBy(1.25),
    'cmd-zoom-out':       () => Renderer.zoomBy(0.8),
    'cmd-zoom-fit':       () => Renderer.fitToScreen(),
    'cmd-toggle-editor':  () => collapseCtrl.toggle(),
    'cmd-preferences':    openPreferences,
    'cmd-help':           () => UI.openModal('help-modal'),
  };

  function bindCommands() {
    Object.entries(CMDS).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { UI.closeAllDropdowns(); fn(); });
    });
  }

  function bindZoomButtons() {
    document.getElementById('zoom-in-btn') .addEventListener('click', () => Renderer.zoomBy(1.25));
    document.getElementById('zoom-out-btn').addEventListener('click', () => Renderer.zoomBy(0.8));
    document.getElementById('zoom-fit-btn').addEventListener('click', () => Renderer.fitToScreen());
  }

  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'SELECT';
      const inTA    = tag === 'TEXTAREA';
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n': e.preventDefault(); fileNew(); break;
          case 'o': e.preventDefault(); fileOpen(); break;
          case 's': e.preventDefault(); fileSaveTxt(); break;
          case 'e': e.preventDefault(); collapseCtrl.toggle(); break;
          case '=': case '+': e.preventDefault(); Renderer.zoomBy(1.25); break;
          case '-': e.preventDefault(); Renderer.zoomBy(0.8); break;
          case '0': e.preventDefault(); Renderer.fitToScreen(); break;
        }
      }
      if (!inInput && !inTA && e.key === '?') UI.openModal('help-modal');
    });
  }

  // ── File operations ──────────────────────────────────────────────────
  function fileNew() {
    if (unsaved && !confirm('You have unsaved changes. Create a new document anyway?')) return;
    textarea.value = Settings.getDefault('documentContent');
    docTitle.setTitle(Settings.getDefault('documentTitle'));
    Settings.set('documentContent', textarea.value);
    Settings.set('documentTitle',   Settings.getDefault('documentTitle'));
    renderMap(); markSaved();
    UI.toast('New document');
  }

  function fileOpen() {
    if (unsaved && !confirm('You have unsaved changes. Open a file anyway?')) return;
    UI.openFileDialog((content, name) => {
      textarea.value = content;
      docTitle.setTitle(name);
      Settings.set('documentContent', content);
      Settings.set('documentTitle',   name);
      renderMap(); markSaved();
      UI.toast('Opened: ' + name);
    });
  }

  function fileSaveTxt() {
    UI.saveTextFile(textarea.value, docTitle.getTitle());
    markSaved();
    UI.toast('Saved as .txt');
  }

  function fileSaveSVG() {
    const svg = Renderer.exportSVG();
    if (!svg) { UI.toast('Nothing to export'); return; }
    UI.saveSVGFile(svg, docTitle.getTitle());
    UI.toast('Exported as SVG');
  }

  // ── Preferences ──────────────────────────────────────────────────────
  function openPreferences() { UI.loadPrefsUI(); UI.openModal('pref-modal'); }

  function bindPrefsModal() {
    document.getElementById('pref-save').addEventListener('click', () => {
      UI.savePrefsUI();
      textarea.style.fontSize = Settings.get('fontSize') + 'px';
      renderMap();
      UI.closeModal('pref-modal');
      UI.toast('Preferences saved');
    });
  }

  // ── Utils ────────────────────────────────────────────────────────────
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  document.addEventListener('DOMContentLoaded', init);
})();
