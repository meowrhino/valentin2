/* ============================================
   MENU — Modal with mode/category switching
   Always enters from bottom, closes with "carrerilla" up.
   Menu never auto-closes on item click — only via
   close buttons (X), backdrop click, or ESC.
   Category hover changes text color only.
   ============================================ */

const Menu = (() => {
  const menuModal = document.getElementById('menu-modal');
  const menuBackdrop = menuModal.querySelector('.menu-modal__backdrop');
  const menuContent = menuModal.querySelector('.menu-modal__content');
  const menuCategories = document.getElementById('menu-categories');
  const modeItems = menuModal.querySelectorAll('[data-mode]');
  const catItems = menuModal.querySelectorAll('[data-category]');
  const closeButtons = menuModal.querySelectorAll('.menu-modal__close');

  function open() {
    // Sync active states — about is active when viewing the about project
    var isAbout = App.state.view === 'project' &&
      App.state.data && App.state.data.about &&
      App.state.activeProjectSlug === App.state.data.about.slug;

    modeItems.forEach(item => {
      if (item.dataset.mode === 'about') {
        item.classList.toggle('menu-modal__item--active', isAbout);
      } else {
        item.classList.toggle('menu-modal__item--active', !isAbout && item.dataset.mode === App.state.mode);
      }
    });
    catItems.forEach(item => {
      item.classList.toggle('menu-modal__item--active', item.dataset.category === App.state.category);
    });
    menuCategories.style.display = (App.state.mode === 'personal' || isAbout) ? 'none' : '';

    // Sync motif buttons
    const currentMotif = Settings.get('motifStyle');
    menuModal.querySelectorAll('.menu-modal__motif-btn').forEach(b => {
      b.classList.toggle('menu-modal__motif-btn--active', b.dataset.motif === currentMotif);
    });

    menuModal.classList.remove('menu-modal--closing');
    // Force reflow
    menuModal.offsetHeight;
    menuModal.classList.remove('menu-modal--hidden');
  }

  function close() {
    menuModal.classList.add('menu-modal--closing');

    const onEnd = () => {
      menuContent.removeEventListener('transitionend', onEnd);
      menuModal.classList.add('menu-modal--hidden');
      menuModal.classList.remove('menu-modal--closing');
    };
    menuContent.addEventListener('transitionend', onEnd);

    // Safety fallback
    setTimeout(() => {
      if (!menuModal.classList.contains('menu-modal--hidden')) {
        menuModal.classList.add('menu-modal--hidden');
        menuModal.classList.remove('menu-modal--closing');
      }
    }, 700);
  }

  function init() {
    // Close buttons
    closeButtons.forEach(btn => btn.addEventListener('click', close));
    menuBackdrop.addEventListener('click', close);

    // Mode switching
    modeItems.forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;

        // ABOUT navigates to about project
        if (mode === 'about') {
          if (App.state.data && App.state.data.about) {
            // Si ya estamos en about, no hacer nada
            if (App.state.view === 'project' && App.state.activeProjectSlug === App.state.data.about.slug) {
              return;
            }
            modeItems.forEach(mi => mi.classList.toggle('menu-modal__item--active', mi.dataset.mode === 'about'));
            App.enterProject(App.state.data.about.slug);
          }
          return;
        }

        // Switch mode, or return to home if in project view
        if (mode !== App.state.mode || App.state.view === 'project') {
          App.state.mode = mode;
          App.state.category = 'all';
          App.state.collapsedProjects.clear();

          modeItems.forEach(mi => mi.classList.toggle('menu-modal__item--active', mi.dataset.mode === mode));
          menuCategories.style.display = mode === 'personal' ? 'none' : '';
          catItems.forEach(ci => ci.classList.toggle('menu-modal__item--active', ci.dataset.category === 'all'));

          App.rebuildHome();
          Header.updateForHome();
        }
      });
    });

    // Category switching
    catItems.forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        if (cat !== App.state.category) {
          App.setCategory(cat);
          catItems.forEach(ci => ci.classList.toggle('menu-modal__item--active', ci.dataset.category === cat));
        }
      });
    });

    // Motif style buttons — uses wipe animation when switching
    const motifBtns = menuModal.querySelectorAll('.menu-modal__motif-btn');
    motifBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.motif;
        if (style === Settings.get('motifStyle')) return; // already active
        Settings.set('motifStyle', style);
        motifBtns.forEach(b => b.classList.toggle('menu-modal__motif-btn--active', b.dataset.motif === style));
        // Animated wipe transition for motifs
        Motifs.wipeRefresh('down');
      });
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menuModal.classList.contains('menu-modal--hidden')) {
        close();
      }
    });
  }

  return { init, open, close };
})();
