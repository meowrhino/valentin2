/* ============================================
   FOOTER — Arrows + center label
   Home: shows project name (opens menu)
   Project: shows "BACK TO HOME" (exits project)
   ============================================ */

const Footer = (() => {
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');
  const centerBtn = document.getElementById('footer-center');

  function updateForHome() {
    centerBtn.textContent = '';
    centerBtn.onclick = null;
  }

  function updateForProject() {
    centerBtn.textContent = 'BACK TO HOME';
    centerBtn.onclick = () => App.exitProject();
  }

  function updateActiveProject(nombre) {
    if (App.state.view === 'home' && nombre) {
      centerBtn.textContent = nombre.toUpperCase();
      centerBtn.onclick = () => Menu.open();
    }
  }

  function updateActiveCategory() {}

  function init() {
    prevBtn.addEventListener('click', () => {
      if (Lightbox.isOpen()) return; // don't navigate while lightbox is open
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
