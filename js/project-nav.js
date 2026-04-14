/* ============================================
   PROJECT NAV — Overlay list of all projects
   Opens on footer center click. Shows current category
   with < > arrows to cycle, and filtered project list.
   Never auto-closes on item click — only via
   close buttons (X), backdrop click, or ESC.
   ============================================ */

const ProjectNav = (() => {
  const nav = document.getElementById('project-nav');
  const backdrop = nav.querySelector('.project-nav__backdrop');
  const content = nav.querySelector('.project-nav__content');
  const closeButtons = nav.querySelectorAll('.project-nav__close');

  // Categories cycle order
  const categories = ['all', 'club', 'festival', 'editorial'];
  const categoryLabels = { all: 'ALL', club: 'CLUB', festival: 'FESTIVAL', editorial: 'EDITORIAL' };
  const categoryColors = { all: null, club: '#39FF14', festival: '#FF6EC7', editorial: '#00FFFF' };

  function getFilteredProjects() {
    var source = App.state.mode === 'commercial' ? App.state.allCommercial : App.state.allPersonal;
    if (App.state.category === 'all') return source.slice();
    return source.filter(function(p) { return p.category === App.state.category; });
  }

  function buildList() {
    content.innerHTML = '';

    // Category header with arrows (only for commercial mode)
    if (App.state.mode === 'commercial') {
      var catRow = document.createElement('div');
      catRow.className = 'project-nav__mode-row';

      var prevArrow = document.createElement('button');
      prevArrow.className = 'project-nav__arrow';
      prevArrow.textContent = '<';
      prevArrow.addEventListener('click', function() { cycleCategory(-1); });

      var catLabel = document.createElement('span');
      catLabel.className = 'project-nav__mode-label';
      catLabel.textContent = categoryLabels[App.state.category] || 'ALL';

      var nextArrow = document.createElement('button');
      nextArrow.className = 'project-nav__arrow';
      nextArrow.textContent = '>';
      nextArrow.addEventListener('click', function() { cycleCategory(1); });

      catRow.appendChild(prevArrow);
      catRow.appendChild(catLabel);
      catRow.appendChild(nextArrow);
      content.appendChild(catRow);
    }

    // Project list
    var projects = getFilteredProjects();
    projects.forEach(function(proj) {
      var btn = document.createElement('button');
      btn.className = 'project-nav__item';
      btn.textContent = proj.nombre.toUpperCase();
      btn.dataset.slug = proj.slug;

      // Hover color via CSS custom property
      btn.style.setProperty('--nav-color', proj.color || '#fff');

      btn.addEventListener('click', function() {
        App.enterProject(proj.slug);
      });

      content.appendChild(btn);
    });
  }

  function cycleCategory(dir) {
    var idx = categories.indexOf(App.state.category);
    idx = (idx + dir + categories.length) % categories.length;
    var newCat = categories[idx];

    // Set state immediately so the nav list updates instantly
    App.state.category = newCat;
    buildList();

    // Update color to match category
    if (categoryColors[newCat]) {
      ColorWipe.setColor(categoryColors[newCat]);
    }

    // Rebuild the home view behind the nav (transition plays underneath)
    App.setCategory(newCat);
    Header.updateForHome();
  }

  function open(highlightSlug) {
    buildList();

    nav.classList.remove('project-nav--closing');
    nav.offsetHeight; // force reflow
    nav.classList.remove('project-nav--hidden');
  }

  function close() {
    nav.classList.add('project-nav--closing');

    var onEnd = function() {
      content.removeEventListener('transitionend', onEnd);
      nav.classList.add('project-nav--hidden');
      nav.classList.remove('project-nav--closing');
    };
    content.addEventListener('transitionend', onEnd);

    // Safety fallback
    setTimeout(function() {
      if (!nav.classList.contains('project-nav--hidden')) {
        nav.classList.add('project-nav--hidden');
        nav.classList.remove('project-nav--closing');
      }
    }, 700);
  }

  function init() {
    closeButtons.forEach(function(btn) { btn.addEventListener('click', close); });
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !nav.classList.contains('project-nav--hidden')) {
        close();
      }
    });
  }

  return { init, open, close };
})();
