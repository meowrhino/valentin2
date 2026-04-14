/* ============================================
   SCROLL — Infinite vertical scroll (circular pool)
   ============================================ */

const ScrollView = (() => {
  const host = document.getElementById('scroll-host');
  const content = document.getElementById('scroll-content');

  const BATCH_SIZE = 6;
  const THRESHOLD = 0.2; // load at 80% scroll
  const FILL_FACTOR = 1.2;
  const MARQUEE_VARIANTS = ['scroll-marquee--v1', 'scroll-marquee--v2', 'scroll-marquee--v3', 'scroll-marquee--v4'];

  let pool = [];
  let poolPtr = 0;
  let projects = [];
  let scrollEnabled = false;
  let scrollHandler = null;
  let activeObserver = null;
  let sentinelObserver = null;
  let projectElements = [];
  let lastScrollTop = 0; // track all project group elements for navigation

  // ---- Build the scroll ----
  function init(projectList, config) {
    projects = projectList;
    content.innerHTML = '';
    projectElements = [];

    if (!projects.length) return;

    // Read spacing from CSS custom properties
    const createTitleText = config.createTitleText;

    // Padding at start
    const startPad = document.createElement('div');
    startPad.style.height = 'var(--scroll-pad)';
    startPad.className = 'scroll-pad';
    content.appendChild(startPad);

    // Render all projects once, in order
    projects.forEach((proj, i) => {
      const group = renderProjectGroup(proj, createTitleText);
      content.appendChild(group);
      projectElements.push(group);

      // Gap between projects with sentinel at midpoint for motif change
      if (i < projects.length - 1) {
        const spacerTop = document.createElement('div');
        spacerTop.style.height = 'calc(var(--gap-between) / 2)';
        content.appendChild(spacerTop);

        // Sentinel: invisible 1px div at midpoint — triggers motif/color change
        const sentinel = document.createElement('div');
        sentinel.className = 'gap-sentinel';
        sentinel.dataset.nextSlug = projects[i + 1].slug;
        sentinel.style.height = '1px';
        content.appendChild(sentinel);

        const spacerBot = document.createElement('div');
        spacerBot.style.height = 'calc(var(--gap-between) / 2)';
        content.appendChild(spacerBot);
      }
    });

    // Build pool for infinite scroll
    pool = Utils.shuffle([...projects, ...projects, ...projects]);
    poolPtr = 0;

    // Ensure minimum fill
    ensureMinFill(createTitleText);

    // Setup scroll listener
    enableInfiniteScroll(createTitleText);

    // Setup active project detection
    setupActiveDetection();

    // Scroll to top
    host.scrollTop = 0;
  }

  function renderProjectGroup(proj, createTitleText) {
    const wrapper = document.createElement('div');
    wrapper.className = 'project-group-wrapper';
    wrapper.dataset.slug = proj.slug;

    // Marquee title (if enabled)
    if (createTitleText) {
      const marquee = createScrollMarquee(proj.nombre, proj.slug);
      wrapper.appendChild(marquee);
    }

    // Image container (collapsible)
    const imgContainer = document.createElement('div');
    imgContainer.className = 'project-group';
    imgContainer.dataset.slug = proj.slug;

    // Render fotosHome images
    const fotos = proj.fotosHome || [1];
    fotos.forEach((num, idx) => {
      const item = document.createElement('div');
      item.className = 'scroll-item';
      item.dataset.slug = proj.slug;

      const img = document.createElement('img');
      img.className = 'scroll-item__img';
      img.dataset.src = Utils.projectImagePath(proj.slug, num);
      img.alt = proj.nombre;
      Utils.lazyLoad(img, host);

      item.appendChild(img);

      // Click to enter project
      item.addEventListener('click', () => {
        App.enterProject(proj.slug);
      });

      imgContainer.appendChild(item);

      // Inner gap between photos of same project
      if (idx < fotos.length - 1) {
        const innerSpacer = document.createElement('div');
        innerSpacer.style.height = 'var(--gap-base)';
        imgContainer.appendChild(innerSpacer);
      }
    });

    wrapper.appendChild(imgContainer);
    return wrapper;
  }

  function createScrollMarquee(nombre, slug) {
    const marquee = document.createElement('div');
    const variant = Utils.randPick(MARQUEE_VARIANTS);
    marquee.className = `scroll-marquee ${variant}`;
    marquee.dataset.slug = slug;

    const track = document.createElement('div');
    track.className = 'scroll-marquee__track';

    // Wide spacing between iterations — no dots, just generous whitespace
    const text = nombre.toUpperCase();
    const spacer = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; // 30 non-breaking spaces
    const repeated = (text + spacer).repeat(4);

    // Two copies for seamless CSS animation
    const span1 = document.createElement('span');
    span1.className = 'scroll-marquee__text';
    span1.textContent = repeated;

    const span2 = document.createElement('span');
    span2.className = 'scroll-marquee__text';
    span2.textContent = repeated;

    track.appendChild(span1);
    track.appendChild(span2);
    marquee.appendChild(track);

    // Accordion toggle
    marquee.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAccordion(slug, marquee);
    });

    return marquee;
  }

  function toggleAccordion(slug, marqueeEl) {
    const isPaused = marqueeEl.classList.contains('scroll-marquee--paused');
    // Find all wrappers and their marquees for this slug
    const wrappers = content.querySelectorAll(`.project-group-wrapper[data-slug="${slug}"]`);

    wrappers.forEach(wrapper => {
      const group = wrapper.querySelector('.project-group');
      const marq = wrapper.querySelector('.scroll-marquee');
      if (!group) return;

      if (isPaused) {
        // Expand
        if (marq) marq.classList.remove('scroll-marquee--paused');
        group.classList.remove('project-group--collapsed');
        group.style.maxHeight = group.scrollHeight + 'px';
        setTimeout(() => { group.style.maxHeight = ''; }, 600);
      } else {
        // Collapse — marquee slides left, images collapse
        if (marq) marq.classList.add('scroll-marquee--paused');
        group.style.maxHeight = group.scrollHeight + 'px';
        group.offsetHeight; // force reflow
        group.classList.add('project-group--collapsed');
      }
    });

    if (isPaused) {
      App.state.collapsedProjects.delete(slug);
    } else {
      App.state.collapsedProjects.add(slug);
    }
  }

  // ---- Infinite scroll mechanics ----
  function ensureMinFill(createTitleText) {
    const minHeight = host.clientHeight * FILL_FACTOR;
    let safety = 0;
    while (content.scrollHeight < minHeight && safety < 50) {
      appendBatch(createTitleText);
      safety++;
    }
  }

  function appendBatch(createTitleText) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < BATCH_SIZE; i++) {
      if (poolPtr >= pool.length) {
        poolPtr = 0;
        pool = Utils.shuffle(pool);
      }

      const proj = pool[poolPtr++];

      // Spacer before each new project with sentinel at midpoint
      const spacerTop = document.createElement('div');
      spacerTop.style.height = 'calc(var(--gap-between) / 2)';
      fragment.appendChild(spacerTop);

      const sentinel = document.createElement('div');
      sentinel.className = 'gap-sentinel';
      sentinel.dataset.nextSlug = proj.slug;
      sentinel.style.height = '1px';
      fragment.appendChild(sentinel);

      const spacerBot = document.createElement('div');
      spacerBot.style.height = 'calc(var(--gap-between) / 2)';
      fragment.appendChild(spacerBot);

      const group = renderProjectGroup(proj, createTitleText);

      // If this project is currently collapsed, collapse the new instance too
      if (App.state.collapsedProjects.has(proj.slug)) {
        const imgGroup = group.querySelector('.project-group');
        if (imgGroup) imgGroup.classList.add('project-group--collapsed');
        const marquee = group.querySelector('.scroll-marquee');
        if (marquee) marquee.classList.add('scroll-marquee--paused');
      }

      fragment.appendChild(group);
      projectElements.push(group);
    }

    content.appendChild(fragment);

    // Re-observe new images for lazy loading
    content.querySelectorAll('img[data-src]').forEach(img => {
      Utils.lazyLoad(img, host);
    });

    // Re-observe new sentinels for motif changes
    if (sentinelObserver) {
      content.querySelectorAll('.gap-sentinel').forEach(s => {
        sentinelObserver.observe(s);
      });
    }
  }

  function enableInfiniteScroll(createTitleText) {
    if (scrollHandler) {
      host.removeEventListener('scroll', scrollHandler);
    }

    let ticking = false;
    scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkAndAppend(createTitleText);
          ticking = false;
        });
        ticking = true;
      }
    };
    host.addEventListener('scroll', scrollHandler);
    scrollEnabled = true;
  }

  function checkAndAppend(createTitleText) {
    const { scrollTop, scrollHeight, clientHeight } = host;
    const remaining = scrollHeight - scrollTop - clientHeight;
    const threshold = scrollHeight * THRESHOLD;

    if (remaining < threshold) {
      appendBatch(createTitleText);
    }
  }

  // ---- Active project detection (name + color in header/footer) ----
  function setupActiveDetection() {
    if (activeObserver) activeObserver.disconnect();
    if (sentinelObserver) sentinelObserver.disconnect();

    // Observer for scroll items: updates project name + color
    activeObserver = new IntersectionObserver((entries) => {
      let bestEntry = null;
      let bestRatio = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEntry = entry;
        }
      });
      if (bestEntry) {
        const slug = bestEntry.target.dataset.slug;
        if (slug && slug !== App.state.activeProjectSlug) {
          App.state.activeProjectSlug = slug;
          const proj = App.findProject(slug);
          if (proj) {
            Header.updateActiveProject(proj.nombre);
            Header.setProjectColor(proj.color);
          }
        }
      }
    }, {
      root: host,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0.1
    });

    content.querySelectorAll('.scroll-item').forEach(item => {
      activeObserver.observe(item);
    });

    // Sentinel observer: triggers motif crossfade at gap midpoints
    sentinelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const direction = lastScrollTop <= host.scrollTop ? 'down' : 'up';
          lastScrollTop = host.scrollTop;
          Motifs.wipeRefresh(direction);
        }
      });
    }, {
      root: host,
      rootMargin: '0px',
      threshold: 1.0
    });

    content.querySelectorAll('.gap-sentinel').forEach(s => {
      sentinelObserver.observe(s);
    });
  }

  // ---- Navigation (jump between projects) ----
  function getVisibleProjectWrappers() {
    return Array.from(content.querySelectorAll('.project-group-wrapper'));
  }

  function getCurrentIndex() {
    const wrappers = getVisibleProjectWrappers();
    const hostRect = host.getBoundingClientRect();
    const centerY = hostRect.top + hostRect.height / 2;

    let closestIdx = 0;
    let closestDist = Infinity;

    wrappers.forEach((wrapper, i) => {
      const rect = wrapper.getBoundingClientRect();
      const wrapperCenter = rect.top + rect.height / 2;
      const dist = Math.abs(wrapperCenter - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    return closestIdx;
  }

  function prevProject() {
    const wrappers = getVisibleProjectWrappers();
    const idx = getCurrentIndex();
    if (idx > 0) {
      wrappers[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function nextProject() {
    const wrappers = getVisibleProjectWrappers();
    const idx = getCurrentIndex();
    if (idx < wrappers.length - 1) {
      wrappers[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function destroy() {
    if (scrollHandler) {
      host.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    scrollEnabled = false;
    if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
    if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }
    content.innerHTML = '';
    projectElements = [];
    pool = [];
    poolPtr = 0;
  }

  function show() {
    host.style.display = '';
    host.classList.remove('project-host--hidden');
  }

  function hide() {
    host.style.display = 'none';
  }

  return {
    init,
    destroy,
    show,
    hide,
    prevProject,
    nextProject,
    getCurrentIndex,
    getVisibleProjectWrappers
  };
})();
