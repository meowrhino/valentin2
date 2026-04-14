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
    nameEl.classList.remove('bar__name--active');
    const cat = App.state.category === 'all'
      ? (App.state.mode === 'commercial' ? 'ALL' : 'PERSONAL')
      : App.state.category.toUpperCase();
    categoryEl.textContent = cat;
  }

  function updateForProject() {
    nameEl.textContent = 'VALENTIN BARRIO';
    const slug = App.state.activeProjectSlug;
    var isAbout = App.state.data && App.state.data.about && App.state.data.about.slug === slug;
    nameEl.classList.toggle('bar__name--active', isAbout);
    nameEl.style.cursor = isAbout ? 'default' : 'pointer';
    if (isAbout) {
      categoryEl.textContent = 'ABOUT';
    } else {
      const proj = App.findProject(slug);
      categoryEl.textContent = proj ? proj.nombre.toUpperCase() : '';
    }
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
      // Si estamos en about, no hacer nada (es solo texto)
      var isAbout = App.state.data && App.state.data.about &&
        App.state.view === 'project' &&
        App.state.activeProjectSlug === App.state.data.about.slug;
      if (isAbout) return;

      if (App.state.view === 'project') {
        App.exitProject();
      }
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
