// settings.js — persists user preferences to localStorage
const Settings = (() => {
  const PREFIX = 't2mm_';
  const DEFAULTS = {
    documentContent: 'Mind Map\n\tIdeas\n\t\tFirst idea\n\t\tSecond idea\n\tGoals\n\t\tShort term\n\t\tLong term\n\tNotes\n\t\tSomething to remember',
    documentTitle:   'Untitled Document',
    colorMode:       'branch',
    layout:          'radial',
    fontSize:        '14',
    curvedLines:     true,
    theme:           'light',
  };
  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return DEFAULTS[key];
      return JSON.parse(raw);
    } catch { return DEFAULTS[key]; }
  }
  function set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
    catch (e) { console.warn('Settings: could not save', key, e); }
  }
  function getDefault(key) { return DEFAULTS[key]; }
  return { get, set, getDefault };
})();
