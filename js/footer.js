/* ============================================
   FOOTER — Arrows for navigation
   ============================================ */

const Footer = (() => {
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');

  function updateForHome() {}
  function updateForProject() {}
  function updateActiveCategory() {}

  function init() {
    prevBtn.addEventListener('click', () => {
      if (App.state.view === 'home') {
        ScrollView.prevProject();
      } else {
        App.prevProject();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (App.state.view === 'home') {
        ScrollView.nextProject();
      } else {
        App.nextProject();
      }
    });
  }

  return { init, updateForHome, updateForProject, updateActiveCategory };
})();
