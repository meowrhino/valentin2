/* ============================================
   SCROLL — Infinite vertical scroll (circular pool)
   ============================================ */

const ScrollView = (() => {
  const host = document.getElementById('scroll-host');
  const content = document.getElementById('scroll-content');

  const BATCH_SIZE = 6;
  const THRESHOLD = 0.2;
  const FILL_FACTOR = 1.2;
  const MARQUEE_VARIANTS = ['scroll-marquee--v1', 'scroll-marquee--v2', 'scroll-marquee--v3'];

  let pool = [];
  let poolPtr = 0;
  let projects = [];
  let scrollEnabled = false;
  let scrollHandler = null;
  let activeObserver = null;
  let sentinelObserver = null;
  let projectElements = [];
  let lastScrollTop = 0;
  let lastVariantIdx = -1;

  // ---- Smooth scroll with ease-in-out ----
  function smoothScrollTo(target, duration) {
    duration = duration || 900;
    const startY = host.scrollTop;
    const targetRect = target.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const targetCenter = targetRect.top + targetRect.height / 2 - hostRect.top + host.scrollTop;
    const endY = targetCenter - host.clientHeight / 2;
    const distance = endY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      host.scrollTop = startY + distance * easeInOutCubic(progress);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ---- Build the scroll ----
  function init(projectList, config) {
    projects = projectList;
    content.innerHTML = '';
    projectElements = [];
    lastVariantIdx = -1;

    if (!projects.length) return;

    const createTitleText = config.createTitleText;

    // Padding at start
    const startPad = document.createElement('div');
    startPad.style.height = 'var(--scroll-pad)';
    startPad.className = 'scroll-pad';
    content.appendChild(startPad);

    projects.forEach((proj, i) => {
      const group = renderProjectGroup(proj, createTitleText);
      content.appendChild(group);
      projectElements.push(group);

      if (i < projects.length - 1) {
        content.appendChild(createGapSentinel(projects[i + 1].slug));
      }
    });

    pool = Utils.shuffle([...projects, ...projects, ...projects]);
    poolPtr = 0;

    ensureMinFill(createTitleText);
    enableInfiniteScroll(createTitleText);
    setupActiveDetection();
    host.scrollTop = 0;
  }

  function createGapSentinel(nextSlug) {
    var frag = document.createDocumentFragment();
    var top = document.createElement('div');
    top.style.height = 'calc(var(--gap-between) / 2)';
    frag.appendChild(top);
    var sentinel = document.createElement('div');
    sentinel.className = 'gap-sentinel';
    sentinel.dataset.nextSlug = nextSlug;
    sentinel.style.height = '1px';
    frag.appendChild(sentinel);
    var bot = document.createElement('div');
    bot.style.height = 'calc(var(--gap-between) / 2)';
    frag.appendChild(bot);
    return frag;
  }

  function renderProjectGroup(proj, createTitleText) {
    const wrapper = document.createElement('div');
    wrapper.className = 'project-group-wrapper';
    wrapper.dataset.slug = proj.slug;

    if (createTitleText) {
      const marquee = createScrollMarquee(proj.nombre, proj.slug);
      wrapper.appendChild(marquee);
    }

    const imgContainer = document.createElement('div');
    imgContainer.className = 'project-group';
    imgContainer.dataset.slug = proj.slug;

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

      // Click image → open in lightbox with animation from this position
      item.addEventListener('click', function() {
        var allImages = fotos.map(function(n) { return Utils.projectImagePath(proj.slug, n); });
        Lightbox.open(allImages, idx, img);
      });

      imgContainer.appendChild(item);

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
    let idx;
    do { idx = Math.floor(Math.random() * MARQUEE_VARIANTS.length); }
    while (idx === lastVariantIdx);
    lastVariantIdx = idx;
    const variant = MARQUEE_VARIANTS[idx];
    marquee.className = 'scroll-marquee ' + variant;
    marquee.dataset.slug = slug;

    const track = document.createElement('div');
    track.className = 'scroll-marquee__track';

    const text = nombre.toUpperCase();
    // Wide spacing via CSS padding-right. Repeat 30x inside each span for full coverage.
    // Two identical spans side-by-side = seamless loop with translateX(-50%)
    const repeated = new Array(30).fill(text).join(' \u00A0 ');

    var span1 = document.createElement('span');
    span1.className = 'scroll-marquee__text';
    span1.textContent = repeated;
    track.appendChild(span1);

    var span2 = document.createElement('span');
    span2.className = 'scroll-marquee__text';
    span2.textContent = repeated;
    track.appendChild(span2);

    marquee.appendChild(track);

    // Click marquee → enter project (not toggle accordion)
    marquee.addEventListener('click', (e) => {
      e.stopPropagation();
      App.enterProject(slug);
    });

    return marquee;
  }

  // ---- Infinite scroll ----
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

      fragment.appendChild(createGapSentinel(proj.slug));

      const group = renderProjectGroup(proj, createTitleText);

      if (App.state.collapsedProjects.has(proj.slug)) {
        const imgGroup = group.querySelector('.project-group');
        if (imgGroup) imgGroup.classList.add('project-group--collapsed');
        const mq = group.querySelector('.scroll-marquee');
        if (mq) mq.classList.add('scroll-marquee--paused');
      }

      fragment.appendChild(group);
      projectElements.push(group);
    }

    content.appendChild(fragment);

    content.querySelectorAll('img[data-src]').forEach(img => {
      Utils.lazyLoad(img, host);
    });

    if (sentinelObserver) {
      content.querySelectorAll('.gap-sentinel').forEach(s => {
        sentinelObserver.observe(s);
      });
    }
  }

  function enableInfiniteScroll(createTitleText) {
    if (scrollHandler) host.removeEventListener('scroll', scrollHandler);

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
    if (scrollHeight - scrollTop - clientHeight < scrollHeight * THRESHOLD) {
      appendBatch(createTitleText);
    }
  }

  // ---- Active project detection ----
  function setupActiveDetection() {
    if (activeObserver) activeObserver.disconnect();
    if (sentinelObserver) sentinelObserver.disconnect();

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

  // ---- Navigation ----
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
      const dist = Math.abs(rect.top + rect.height / 2 - centerY);
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
    if (idx > 0) smoothScrollTo(wrappers[idx - 1], 900);
  }

  function nextProject() {
    const wrappers = getVisibleProjectWrappers();
    const idx = getCurrentIndex();
    if (idx < wrappers.length - 1) smoothScrollTo(wrappers[idx + 1], 900);
  }

  function destroy() {
    if (scrollHandler) { host.removeEventListener('scroll', scrollHandler); scrollHandler = null; }
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

  function hide() { host.style.display = 'none'; }

  return { init, destroy, show, hide, prevProject, nextProject, getCurrentIndex, getVisibleProjectWrappers };
})();
