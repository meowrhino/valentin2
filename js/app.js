/* ============================================
   APP — State management & routing
   ============================================ */

const App = (() => {
  const state = {
    view: 'home',           // 'home' | 'project'
    mode: 'commercial',     // 'commercial' | 'personal'
    category: 'all',        // 'all' | 'club' | 'festival' | 'editorial'
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
      const res = await fetch(`${Utils.BASE}/data.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
    } catch (err) {
      console.error('Failed to load data.json:', err);
      return;
    }

    state.config.createTitleText = state.data.createTitleText ?? true;
    state.config.gap = state.data.gap ?? 5;
    state.allCommercial = state.data.projects || [];
    state.allPersonal = state.data.personalProjects || [];

    // Initialize modules
    Settings.init();
    Header.init();
    Menu.init();
    Footer.init();
    Motifs.init();
    Transitions.buildGrid();

    // Check URL for direct project entry
    const path = window.location.pathname.replace(Utils.BASE, '').replace(/^\//, '').replace(/\/$/, '');
    if (path && path !== '' && path !== 'index.html') {
      const proj = findProjectBySlug(path);
      if (proj) {
        state.mode = state.allPersonal.some(p => p.slug === proj.slug) ? 'personal' : 'commercial';
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
      state.projects = [...source];
    } else {
      state.projects = source.filter(p => p.category === state.category);
    }
  }

  function findProjectBySlug(slug) {
    return state.allCommercial.find(p => p.slug === slug) ||
           state.allPersonal.find(p => p.slug === slug) ||
           (state.data.about && state.data.about.slug === slug ? state.data.about : null);
  }

  function findProject(slug) {
    return findProjectBySlug(slug);
  }

  function showHome(pushState = true) {
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

  function enterProject(slug, withTransition = true) {
    if (!slug) return;

    const proj = findProject(slug);
    if (!proj) return;

    state.view = 'project';
    state.activeProjectSlug = slug;

    const doEnter = () => {
      ScrollView.hide();
      ProjectView.show(proj);
      Header.showProjectMarquee(proj.nombre);
      Footer.updateForProject();
      ColorWipe.setColor(proj.color);
      Motifs.refresh();

      history.pushState({ view: 'project', slug }, '', Utils.BASE + '/' + slug);
    };

    if (withTransition) {
      Transitions.run(doEnter);
    } else {
      doEnter();
    }
  }

  function exitProject() {
    const doExit = () => {
      state.view = 'home';
      ProjectView.hide();
      ScrollView.show();
      Header.hideProjectMarquee();
      Header.updateForHome();
      Footer.updateForHome();
      Motifs.refresh();

      history.pushState({ view: 'home' }, '', Utils.BASE + '/');
    };

    Transitions.run(doExit);
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
    Motifs.refresh();
  }

  function prevProject() {
    const source = state.mode === 'commercial' ? state.allCommercial : state.allPersonal;
    const filtered = state.category === 'all' ? source : source.filter(p => p.category === state.category);
    const idx = filtered.findIndex(p => p.slug === state.activeProjectSlug);
    if (idx > 0) {
      const prev = filtered[idx - 1];
      Transitions.run(() => {
        ProjectView.hide();
        const proj = findProject(prev.slug);
        state.activeProjectSlug = prev.slug;
        ProjectView.show(proj);
        Header.showProjectMarquee(proj.nombre);
        ColorWipe.setColor(proj.color);
        history.pushState({ view: 'project', slug: prev.slug }, '', Utils.BASE + '/' + prev.slug);
      });
    }
  }

  function nextProject() {
    const source = state.mode === 'commercial' ? state.allCommercial : state.allPersonal;
    const filtered = state.category === 'all' ? source : source.filter(p => p.category === state.category);
    const idx = filtered.findIndex(p => p.slug === state.activeProjectSlug);
    if (idx < filtered.length - 1) {
      const next = filtered[idx + 1];
      Transitions.run(() => {
        ProjectView.hide();
        const proj = findProject(next.slug);
        state.activeProjectSlug = next.slug;
        ProjectView.show(proj);
        Header.showProjectMarquee(proj.nombre);
        ColorWipe.setColor(proj.color);
        history.pushState({ view: 'project', slug: next.slug }, '', Utils.BASE + '/' + next.slug);
      });
    }
  }

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.view === 'project' && e.state.slug) {
      const proj = findProject(e.state.slug);
      if (proj) {
        state.view = 'project';
        state.activeProjectSlug = e.state.slug;
        ScrollView.hide();
        ProjectView.show(proj);
        Header.showProjectMarquee(proj.nombre);
        Footer.updateForProject();
        ColorWipe.setColor(proj.color);
      }
    } else {
      state.view = 'home';
      ProjectView.hide();
      ScrollView.show();
      Header.hideProjectMarquee();
      Header.updateForHome();
      Footer.updateForHome();
    }
  });

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  function rebuildHome() {
    state.collapsedProjects.clear();
    updateProjects();
    ScrollView.init(state.projects, state.config);
    Footer.updateActiveCategory();
    Motifs.refresh();
  }

  return {
    state,
    findProject,
    enterProject,
    exitProject,
    toggleMode,
    setCategory,
    rebuildHome,
    prevProject,
    nextProject
  };
})();
