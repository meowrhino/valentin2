/* ============================================
   SETTINGS — Debug/testing panel for motif styles
   Accessible via a discrete button, stores in localStorage
   ============================================ */

const Settings = (() => {
  const STORAGE_KEY = 'valentin2_settings';
  const panel = document.getElementById('settings-panel');
  const toggleBtn = document.getElementById('settings-toggle');

  const defaults = {
    motifStyle: 'mixed' // 'organic' | 'drift' | 'breath' | 'orbital' | 'mixed'
  };

  let current = { ...defaults };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        current = { ...defaults, ...parsed };
      }
    } catch (e) {
      current = { ...defaults };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      // localStorage not available
    }
  }

  function get(key) {
    return current[key] ?? defaults[key];
  }

  function set(key, value) {
    current[key] = value;
    save();
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.remove('settings-panel--hidden');
    syncRadios();
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.add('settings-panel--hidden');
  }

  function togglePanel() {
    if (!panel) return;
    panel.classList.toggle('settings-panel--hidden');
    if (!panel.classList.contains('settings-panel--hidden')) {
      syncRadios();
    }
  }

  function syncRadios() {
    if (!panel) return;
    const radios = panel.querySelectorAll('input[name="motif-style"]');
    radios.forEach(r => {
      r.checked = r.value === current.motifStyle;
    });
  }

  function init() {
    load();

    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePanel);
    }

    if (panel) {
      // Close button
      const closeBtn = panel.querySelector('.settings-panel__close');
      if (closeBtn) closeBtn.addEventListener('click', closePanel);

      // Radio buttons for motif style
      const radios = panel.querySelectorAll('input[name="motif-style"]');
      radios.forEach(r => {
        r.addEventListener('change', () => {
          if (r.checked) {
            set('motifStyle', r.value);
            // Refresh motifs with new style
            Motifs.refresh();
          }
        });
      });

      syncRadios();
    }
  }

  return { init, get, set, openPanel, closePanel };
})();
