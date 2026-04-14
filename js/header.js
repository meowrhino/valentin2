/* ============================================
   HEADER — Branding + category label
   No marquee in project view. VALENTIN BARRIO always centered.
   ============================================ */

const Header = (() => {
  const nameEl = document.getElementById('header-name');
  const categoryEl = document.getElementById('header-category');
  const menuToggle = document.getElementById('menu-toggle');
  const headerWrapper = document.querySelector('.bar-wrapper--top');
  const footerWrapper = document.querySelector('.bar-wrapper--bottom');

  function updateForHome() {
    nameEl.textContent = 'VALENTIN BARRIO';
    // Show current category on the left
    const cat = App.state.category === 'all'
      ? (App.state.mode === 'commercial' ? 'COMERCIAL' : 'PERSONAL')
      : App.state.category.toUpperCase();
    categoryEl.textContent = cat;
  }

  function updateForProject() {
    // Header stays the same — no marquee, just VALENTIN BARRIO
    nameEl.textContent = 'VALENTIN BARRIO';
    categoryEl.textContent = '';
  }

  function updateActiveProject(nombre) {
    Footer.updateActiveProject(nombre);
  }

  function setProjectColor(color) {
    ColorWipe.setColor(color);
  }

  // Lightbox: slide bars out to sides
  function hideBars() {
    headerWrapper.classList.add('bar-wrapper--slide-left');
    footerWrapper.classList.add('bar-wrapper--slide-right');
  }

  function showBars() {
    headerWrapper.classList.remove('bar-wrapper--slide-left');
    footerWrapper.classList.remove('bar-wrapper--slide-right');
  }

  // Transitions: crossfade bars
  function fadeBarsOut() {
    headerWrapper.classList.add('bar-wrapper--fading');
    footerWrapper.classList.add('bar-wrapper--fading');
  }

  function fadeBarsIn() {
    headerWrapper.classList.remove('bar-wrapper--fading');
    footerWrapper.classList.remove('bar-wrapper--fading');
  }

  function init() {
    // MENU button opens menu from bottom
    menuToggle.addEventListener('click', () => Menu.open());

    // Category label on left opens menu too
    categoryEl.addEventListener('click', () => Menu.open());

    // VALENTIN BARRIO click → go to about
    nameEl.addEventListener('click', () => {
      if (App.state.view === 'project') {
        App.exitProject();
      }
      // Navigate to about section
      if (App.state.data && App.state.data.about) {
        App.enterProject(App.state.data.about.slug);
      }
    });
    nameEl.style.cursor = 'pointer';
  }

  return {
    init,
    updateForHome,
    updateForProject,
    updateActiveProject,
    setProjectColor,
    hideBars,
    showBars,
    fadeBarsOut,
    fadeBarsIn
  };
})();
