/* ============================================
   APP — State management & routing
   ============================================ */

const App = (() => {
  const state = {
    view: 'home',
    mode: 'commercial',
    category: 'all',
    activeProjectSlug: null,
    collapsedProjects: new Set(),
    projects: [],
    allCommercial: [],
    allPersonal: [],
    data: null,
    config: {
      createTitleText: true,
      gap: 5
    }
  };

  async function init() {
    try {
      const res = await fetch(Utils.BASE + '/data.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.data = await res.json();
    } catch (err) {
      console.error('Failed to load data.json:', err);
      return;
    }

    state.config.createTitleText = state.data.createTitleText !== false;
    state.config.gap = state.data.gap || 5;
    state.allCommercial = state.data.projects || [];
    state.allPersonal = state.data.personalProjects || [];

    // Initialize modules
    Settings.init();
    Header.init();
    Menu.init();
    Footer.init();
    Lightbox.init();
    Motifs.init();
    Transitions.buildGrid();

    // Check URL for direct project entry
    const path = window.location.pathname.replace(Utils.BASE, '').replace(/^\//, '').replace(/\/$/, '');
    if (path && path !== '' && path !== 'index.html') {
      const proj = findProjectBySlug(path);
      if (proj) {
        state.mode = state.allPersonal.some(function(p) { return p.slug === proj.slug; }) ? 'personal' : 'commercial';
        updateProjects();
        showHome(false);
        enterProject(proj.slug, false);
        return;
      }
    }

    updateProjects();
    showHome();
  }

  function updateProjects() {
    const source = state.mode === 'commercial' ? state.allCommercial : state.allPersonal;
    if (state.mode === 'personal' || state.category === 'all') {
      state.projects = source.slice();
    } else {
      state.projects = source.filter(function(p) { return p.category === state.category; });
    }
  }

  function findProjectBySlug(slug) {
    return state.allCommercial.find(function(p) { return p.slug === slug; }) ||
           state.allPersonal.find(function(p) { return p.slug === slug; }) ||
           (state.data.about && state.data.about.slug === slug ? state.data.about : null);
  }

  function findProject(slug) { return findProjectBySlug(slug); }

  function showHome(pushState) {
    if (pushState === undefined) pushState = true;
    state.view = 'home';
    state.activeProjectSlug = null;

    ScrollView.show();
    ProjectView.hide();
    Header.updateForHome();
    Footer.updateForHome();

    ScrollView.init(state.projects, state.config);

    if (pushState) {
      history.pushState({ view: 'home' }, '', Utils.BASE + '/');
    }
  }

  function enterProject(slug, withTransition) {
    if (withTransition === undefined) withTransition = true;
    if (!slug) return;

    const proj = findProject(slug);
    if (!proj) return;

    state.view = 'project';
    state.activeProjectSlug = slug;

    var doEnter = function() {
      ScrollView.hide();
      ProjectView.show(proj);
      Header.updateForProject();
      Footer.updateForProject();
      ColorWipe.setColor(proj.color);
      Motifs.refresh();
      history.pushState({ view: 'project', slug: slug }, '', Utils.BASE + '/' + slug);
    };

    if (withTransition) {
      Transitions.run(doEnter);
    } else {
      doEnter();
    }
  }

  function exitProject() {
    Transitions.run(function() {
      state.view = 'home';
      ProjectView.hide();
      ScrollView.show();
      Header.updateForHome();
      Footer.updateForHome();
      Motifs.refresh();
      history.pushState({ view: 'home' }, '', Utils.BASE + '/');
    });
  }

  function toggleMode() {
    state.mode = state.mode === 'commercial' ? 'personal' : 'commercial';
    state.category = 'all';
    state.collapsedProjects.clear();
    updateProjects();
    showHome();
    Motifs.refresh();
  }

  function setCategory(cat) {
    state.category = cat;
    state.collapsedProjects.clear();
    updateProjects();
    ScrollView.init(state.projects, state.config);
    Footer.updateActiveCategory();
    Header.updateForHome();
    Motifs.refresh();
  }

  function prevProject() {
    var source = state.mode === 'commercial' ? state.allCommercial : state.allPersonal;
    var filtered = state.category === 'all' ? source : source.filter(function(p) { return p.category === state.category; });
    var idx = filtered.findIndex(function(p) { return p.slug === state.activeProjectSlug; });
    if (idx > 0) {
      var prev = filtered[idx - 1];
      Transitions.run(function() {
        ProjectView.hide();
        var proj = findProject(prev.slug);
        state.activeProjectSlug = prev.slug;
        ProjectView.show(proj);
        Header.updateForProject();
        ColorWipe.setColor(proj.color);
        history.pushState({ view: 'project', slug: prev.slug }, '', Utils.BASE + '/' + prev.slug);
      });
    }
  }

  function nextProject() {
    var source = state.mode === 'commercial' ? state.allCommercial : state.allPersonal;
    var filtered = state.category === 'all' ? source : source.filter(function(p) { return p.category === state.category; });
    var idx = filtered.findIndex(function(p) { return p.slug === state.activeProjectSlug; });
    if (idx < filtered.length - 1) {
      var next = filtered[idx + 1];
      Transitions.run(function() {
        ProjectView.hide();
        var proj = findProject(next.slug);
        state.activeProjectSlug = next.slug;
        ProjectView.show(proj);
        Header.updateForProject();
        ColorWipe.setColor(proj.color);
        history.pushState({ view: 'project', slug: next.slug }, '', Utils.BASE + '/' + next.slug);
      });
    }
  }

  // Browser back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.view === 'project' && e.state.slug) {
      var proj = findProject(e.state.slug);
      if (proj) {
        state.view = 'project';
        state.activeProjectSlug = e.state.slug;
        ScrollView.hide();
        ProjectView.show(proj);
        Header.updateForProject();
        Footer.updateForProject();
        ColorWipe.setColor(proj.color);
      }
    } else {
      state.view = 'home';
      ProjectView.hide();
      ScrollView.show();
      Header.updateForHome();
      Footer.updateForHome();
    }
  });

  document.addEventListener('DOMContentLoaded', init);

  function rebuildHome() {
    state.collapsedProjects.clear();
    updateProjects();
    ScrollView.init(state.projects, state.config);
    Footer.updateActiveCategory();
    Header.updateForHome();
    Motifs.refresh();
  }

  return {
    state, findProject, enterProject, exitProject,
    toggleMode, setCategory, rebuildHome,
    prevProject, nextProject
  };
})();
