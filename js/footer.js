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
      // In home, clicking footer project name does nothing special (just info)
      centerBtn.onclick = null;
    }
  }

  function updateActiveCategory() {}

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
