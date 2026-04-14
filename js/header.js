/* ============================================
   HEADER — Branding (always VALENTIN BARRIO center) + Marquee
   Menu logic extracted to menu.js, color logic to color-wipe.js
   ============================================ */

const Header = (() => {
  const nameEl = document.getElementById('header-name');
  const marqueeEl = document.getElementById('header-marquee');
  const marqueeTrack = marqueeEl.querySelector('.marquee__track');
  const menuToggle = document.getElementById('menu-toggle');
  const footerProjectName = document.getElementById('footer-project-name');

  function updateForHome() {
    marqueeEl.classList.add('header__marquee--hidden');
    // VALENTIN BARRIO is always static in center — never changes
    nameEl.textContent = 'VALENTIN BARRIO';
    footerProjectName.textContent = '';
  }

  function updateActiveProject(nombre) {
    // Project name goes to FOOTER center (between arrows)
    if (App.state.view === 'home' && nombre) {
      footerProjectName.textContent = nombre.toUpperCase();
    }
  }

  function setProjectColor(color) {
    // Delegate to ColorWipe for center-outward animation
    ColorWipe.setColor(color);
  }

  function showProjectMarquee(nombre) {
    const text = nombre.toUpperCase();
    // Build marquee track with multiple spans, CSS padding-right creates the gap
    marqueeTrack.innerHTML = '';
    // Two groups of repeated spans for seamless loop
    for (let g = 0; g < 2; g++) {
      for (let i = 0; i < 12; i++) {
        const span = document.createElement('span');
        span.className = 'marquee__text';
        span.textContent = text;
        marqueeTrack.appendChild(span);
      }
    }
    marqueeEl.classList.remove('header__marquee--hidden');
  }

  function hideProjectMarquee() {
    marqueeEl.classList.add('header__marquee--hidden');
  }

  function init() {
    // MENU button opens menu from bottom
    menuToggle.addEventListener('click', () => Menu.open('bottom'));

    // Footer project name opens menu from bottom
    footerProjectName.addEventListener('click', () => Menu.open('bottom'));

    // VALENTIN BARRIO click → exit project if in project view
    nameEl.addEventListener('click', () => {
      if (App.state.view === 'project') {
        App.exitProject();
      }
    });
    nameEl.style.cursor = 'pointer';
  }

  return {
    init,
    updateForHome,
    updateActiveProject,
    setProjectColor,
    showProjectMarquee,
    hideProjectMarquee
  };
})();
