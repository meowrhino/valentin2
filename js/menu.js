/* ============================================
   MENU — Modal, mode/category switching, animations
   Extracted from header.js for cleaner separation
   ============================================ */

const Menu = (() => {
  const menuModal = document.getElementById('menu-modal');
  const menuBackdrop = menuModal.querySelector('.menu-modal__backdrop');
  const menuContent = menuModal.querySelector('.menu-modal__content');
  const menuCategories = document.getElementById('menu-categories');
  const modeItems = menuModal.querySelectorAll('[data-mode]');
  const catItems = menuModal.querySelectorAll('[data-category]');

  // All close buttons (4 corners)
  const closeButtons = menuModal.querySelectorAll('.menu-modal__close');

  // Track which direction the menu entered from
  let openDirection = 'bottom'; // 'bottom' | 'left'

  function open(direction = 'bottom') {
    openDirection = direction;

    // Sync active states
    modeItems.forEach(item => {
      item.classList.toggle('menu-modal__item--active', item.dataset.mode === App.state.mode);
    });
    catItems.forEach(item => {
      item.classList.toggle('menu-modal__item--active', item.dataset.category === App.state.category);
    });
    menuCategories.style.display = App.state.mode === 'personal' ? 'none' : '';

    // Sync motif style buttons
    const currentMotif = Settings.get('motifStyle');
    menuModal.querySelectorAll('.menu-modal__motif-btn').forEach(b => {
      b.classList.toggle('menu-modal__motif-btn--active', b.dataset.motif === currentMotif);
    });

    // Set open direction class
    menuModal.classList.remove('menu-modal--closing', 'menu-modal--from-left', 'menu-modal--from-bottom');
    menuModal.classList.add(direction === 'left' ? 'menu-modal--from-left' : 'menu-modal--from-bottom');

    // Force reflow before removing hidden
    menuModal.offsetHeight;
    menuModal.classList.remove('menu-modal--hidden');
  }

  function close() {
    // Close in the reverse direction it opened
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
    // Close buttons (all 4 corners)
    closeButtons.forEach(btn => {
      btn.addEventListener('click', close);
    });

    // Backdrop click closes
    menuBackdrop.addEventListener('click', close);

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

          App.rebuildHome();
          Header.updateForHome();
        }
      });
    });

    // Category switching — closes with left direction then reopens view
    catItems.forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        if (cat !== App.state.category) {
          App.setCategory(cat);
          catItems.forEach(ci => ci.classList.toggle('menu-modal__item--active', ci.dataset.category === cat));
          close();
        }
      });
    });

    // Category hover — reveal color
    catItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const cat = item.dataset.category;
        let color = null;
        if (cat === 'club') color = 'var(--color-club)';
        else if (cat === 'festival') color = 'var(--color-festival)';
        else if (cat === 'editorial') color = 'var(--color-editorial)';

        if (color) {
          menuContent.style.setProperty('--menu-hover-color', color);
          menuContent.classList.add('menu-modal__content--color-reveal');
        }
      });

      item.addEventListener('mouseleave', () => {
        menuContent.classList.remove('menu-modal__content--color-reveal');
      });
    });

    // Motif style buttons
    const motifBtns = menuModal.querySelectorAll('.menu-modal__motif-btn');
    motifBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.motif;
        Settings.set('motifStyle', style);
        motifBtns.forEach(b => b.classList.toggle('menu-modal__motif-btn--active', b.dataset.motif === style));
        Motifs.refresh();
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
