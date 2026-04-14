/* ============================================
   UTILS — Shared helpers
   ============================================ */

const Utils = (() => {
  // Dynamic base path (GitHub Pages vs local)
  function getBasePath() {
    const base = document.querySelector('base');
    if (base) return base.href.replace(/\/$/, '');
    const path = window.location.pathname;
    if (path.includes('/valentin2/')) {
      return path.substring(0, path.indexOf('/valentin2/') + '/valentin2'.length);
    }
    return '';
  }

  const BASE = getBasePath();

  function projectImagePath(slug, num) {
    return `${BASE}/_PROJECTS/${slug}/${num}.webp`;
  }

  // ---- Lazy loading with IntersectionObserver ----
  // Map of root element -> observer
  const lazyObservers = new Map();

  function getOrCreateObserver(root) {
    if (lazyObservers.has(root)) return lazyObservers.get(root);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.onload = () => img.classList.add('loaded');
            img.onerror = () => img.classList.add('loaded');
            delete img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    }, {
      root: root,
      rootMargin: '400px 0px',
      threshold: 0.01
    });

    lazyObservers.set(root, observer);
    return observer;
  }

  function lazyLoad(img, root) {
    // Find the scroll container if not provided
    if (!root) {
      root = img.closest('.scroll-host') || null;
    }
    const observer = getOrCreateObserver(root);
    observer.observe(img);
  }

  // ---- Shuffle array (Fisher-Yates) ----
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- Random int in range ----
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ---- Pick random item from array ----
  function randPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ---- Debounce ----
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  return {
    BASE,
    projectImagePath,
    lazyLoad,
    shuffle,
    randInt,
    randPick,
    debounce
  };
})();
