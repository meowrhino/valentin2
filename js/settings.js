/* ============================================
   SETTINGS — Simple localStorage store for preferences
   UI is handled by menu.js motif buttons
   ============================================ */

const Settings = (() => {
  const STORAGE_KEY = 'valentin2_settings';

  const defaults = {
    motifStyle: 'orbital'
  };

  let current = {};

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      current = saved ? Object.assign({}, defaults, JSON.parse(saved)) : Object.assign({}, defaults);
    } catch (e) {
      current = Object.assign({}, defaults);
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch (e) {}
  }

  function get(key) {
    return current[key] !== undefined ? current[key] : defaults[key];
  }

  function set(key, value) {
    current[key] = value;
    save();
  }

  function init() {
    load();
  }

  return { init, get, set };
})();
