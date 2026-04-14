/* ============================================
   HEADER — Branding (always VALENTIN BARRIO) + Mode toggle + Menu Modal
   ============================================ */

const Header = (() => {
  const nameEl = document.getElementById('header-name');
  const marqueeEl = document.getElementById('header-marquee');
  const marqueeTextEl = document.getElementById('header-marquee-text');
  const menuToggle = document.getElementById('menu-toggle');
  const modeToggle = document.getElementById('mode-toggle');
  const menuModal = document.getElementById('menu-modal');
  const menuClose = document.getElementById('menu-close');
  const menuBackdrop = menuModal.querySelector('.menu-modal__backdrop');
  const menuCategories = document.getElementById('menu-categories');
  const footerProjectName = document.getElementById('footer-project-name');

  const modeItems = menuModal.querySelectorAll('[data-mode]');
  const catItems = menuModal.querySelectorAll('[data-category]');

  function updateForHome() {
    marqueeEl.classList.add('header__marquee--hidden');
    // VALENTIN BARRIO always visible — it's the link to about
    nameEl.textContent = App.state.mode === 'commercial' ? 'VALENTIN BARRIO' : 'VALENTIN';
    modeToggle.textContent = App.state.mode === 'commercial' ? 'COMERCIAL' : 'PERSONAL';
    footerProjectName.textContent = '';
  }

  function updateActiveProject(nombre) {
    // Project name goes to FOOTER center (between arrows), not header
    if (App.state.view === 'home' && nombre) {
      footerProjectName.textContent = nombre.toUpperCase();
    }
  }

  function setProjectColor(color) {
    document.body.style.setProperty('--project-color', color || '#fff');
  }

  function showProjectMarquee(nombre) {
    const text = nombre.toUpperCase();
    const repeated = (text + '          ').repeat(30);
    marqueeTextEl.textContent = repeated;
    marqueeEl.classList.remove('header__marquee--hidden');
  }

  function hideProjectMarquee() {
    marqueeEl.classList.add('header__marquee--hidden');
  }

  // ---- Menu Modal ----
  function openMenu() {
    modeItems.forEach(item => {
      item.classList.toggle('menu-modal__item--active', item.dataset.mode === App.state.mode);
    });
    catItems.forEach(item => {
      item.classList.toggle('menu-modal__item--active', item.dataset.category === App.state.category);
    });
    menuCategories.style.display = App.state.mode === 'personal' ? 'none' : '';

    menuModal.classList.remove('menu-modal--closing');
    menuModal.classList.remove('menu-modal--hidden');
  }

  function closeMenu() {
    menuModal.classList.add('menu-modal--closing');
    setTimeout(() => {
      menuModal.classList.add('menu-modal--hidden');
      menuModal.classList.remove('menu-modal--closing');
    }, 500);
  }

  function init() {
    menuToggle.addEventListener('click', openMenu);
    modeToggle.addEventListener('click', openMenu);
    // Footer project name also opens menu
    footerProjectName.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);

    // VALENTIN BARRIO click → go to about
    nameEl.addEventListener('click', () => {
      if (App.state.view === 'project') {
        App.exitProject();
      }
      // TODO: could navigate to about section in the future
    });
    nameEl.style.cursor = 'pointer';

    // Mode switching
    modeItems.forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        if (mode !== App.state.mode) {
          App.state.mode = mode;
          App.state.category = 'all';
          App.state.collapsedProjects.clear();

          modeItems.forEach(mi => mi.classList.toggle('menu-modal__item--active', mi.dataset.mode === mode));
          menuCategories.style.display = mode === 'personal' ? 'none' : '';
          catItems.forEach(ci => ci.classList.toggle('menu-modal__item--active', ci.dataset.category === 'all'));

          modeToggle.textContent = mode === 'commercial' ? 'COMERCIAL' : 'PERSONAL';
          App.rebuildHome();
          updateForHome();
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
          closeMenu();
        }
      });
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menuModal.classList.contains('menu-modal--hidden')) {
        closeMenu();
      }
    });
  }

  return {
    init,
    updateForHome,
    updateActiveProject,
    setProjectColor,
    showProjectMarquee,
    hideProjectMarquee,
    closeMenu
  };
})();
