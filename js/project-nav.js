/* ============================================
   PROJECT NAV — Overlay list of all projects
   Opens on marquee click. Each name shows its
   project color on hover. Click to enter project.
   ============================================ */

const ProjectNav = (() => {
  const nav = document.getElementById('project-nav');
  const backdrop = nav.querySelector('.project-nav__backdrop');
  const content = nav.querySelector('.project-nav__content');

  function open(highlightSlug) {
    content.innerHTML = '';

    var projects = App.state.projects;
    projects.forEach(function(proj) {
      var btn = document.createElement('button');
      btn.className = 'project-nav__item';
      btn.textContent = proj.nombre.toUpperCase();
      btn.dataset.slug = proj.slug;

      // Hover color via CSS custom property
      btn.style.setProperty('--nav-color', proj.color || '#fff');

      // Highlight the clicked project
      if (proj.slug === highlightSlug) {
        btn.classList.add('project-nav__item--active');
      }

      btn.addEventListener('click', function() {
        close();
        App.enterProject(proj.slug);
      });

      content.appendChild(btn);
    });

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
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !nav.classList.contains('project-nav--hidden')) {
        close();
      }
    });
  }

  return { init, open, close };
})();
