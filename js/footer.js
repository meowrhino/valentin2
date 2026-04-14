/* ============================================
   FOOTER — Arrows + center label
   Home: shows active project name
   Project: shows "BACK TO HOME"
   ============================================ */

const Footer = (() => {
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');
  const centerBtn = document.getElementById('footer-center');

  function updateForHome() {
    if (App.state.mode === 'personal') {
      centerBtn.textContent = 'BACK HOME';
      centerBtn.onclick = () => {
        App.state.mode = 'commercial';
        App.state.category = 'all';
        App.rebuildHome();
      };
    } else if (App.state.category !== 'all') {
      centerBtn.textContent = 'BACK TO ALL';
      centerBtn.onclick = () => App.setCategory('all');
    } else {
      centerBtn.textContent = '';
      centerBtn.onclick = null;
    }
  }

  function updateForProject() {
    centerBtn.textContent = 'BACK HOME';
    centerBtn.onclick = () => App.exitProject();
  }

  function updateActiveProject(nombre) {
    if (App.state.view === 'home' && App.state.mode === 'commercial' && App.state.category === 'all' && nombre) {
      centerBtn.textContent = nombre.toUpperCase();
      centerBtn.onclick = function() {
        ProjectNav.open(App.state.activeProjectSlug);
      };
    }
  }

  function updateActiveCategory() {
    updateForHome();
  }

  function init() {
    prevBtn.addEventListener('click', () => {
      if (Lightbox.isOpen()) return;
      if (App.state.view === 'home') {
        ScrollView.prevProject();
      } else {
        App.prevProject();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (Lightbox.isOpen()) return;
      if (App.state.view === 'home') {
        ScrollView.nextProject();
      } else {
        App.nextProject();
      }
    });
  }

  return { init, updateForHome, updateForProject, updateActiveProject, updateActiveCategory };
})();
