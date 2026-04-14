/* ============================================
   MOTIFS — Floating background (screensaver style)
   ============================================ */

const Motifs = (() => {
  const MOTIF_COUNT_TOTAL = 32;
  const MOTIFS_PER_VIEW = 5;
  const container = document.getElementById('motifs-layer');

  // Screensaver-style animations — varied speeds and trajectories
  const animations = [
    { name: 'screensaver-1', duration: '40s', timing: 'linear', direction: 'alternate' },
    { name: 'screensaver-2', duration: '50s', timing: 'linear', direction: 'alternate' },
    { name: 'screensaver-3', duration: '55s', timing: 'linear', direction: 'alternate' },
    { name: 'screensaver-4', duration: '45s', timing: 'linear', direction: 'alternate' },
    { name: 'screensaver-5', duration: '65s', timing: 'linear', direction: 'alternate' },
    { name: 'screensaver-6', duration: '35s', timing: 'linear', direction: 'alternate' },
  ];

  let currentMotifs = [];

  function getMotifPath(i) {
    const num = String(i).padStart(2, '0');
    return `${Utils.BASE}/assets/motifs/motif-${num}.png`;
  }

  function createMotifElement(src) {
    const img = document.createElement('img');
    img.className = 'motif';
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';

    // MUCH LARGER sizes (200-400px)
    const size = Utils.randInt(200, 400);
    img.style.width = size + 'px';
    img.style.height = 'auto';

    // Random starting position (can go off-screen slightly)
    img.style.left = Utils.randInt(-10, 70) + '%';
    img.style.top = Utils.randInt(-5, 70) + '%';

    // Higher opacity so they're visible
    img.style.opacity = (Utils.randInt(12, 25) / 100).toFixed(2);

    // Screensaver animation — slow, wide travel
    const anim = Utils.randPick(animations);
    const offset = Utils.randInt(0, 50000);
    img.style.animation = `${anim.name} ${anim.duration} ${anim.timing} infinite ${anim.direction}`;
    img.style.animationDelay = `-${offset}ms`;

    return img;
  }

  function init() {
    clear();
    const indices = Utils.shuffle(Array.from({ length: MOTIF_COUNT_TOTAL }, (_, i) => i + 1));
    const selected = indices.slice(0, MOTIFS_PER_VIEW);

    selected.forEach(i => {
      const el = createMotifElement(getMotifPath(i));
      container.appendChild(el);
      currentMotifs.push(el);
    });
  }

  function clear() {
    currentMotifs.forEach(el => el.remove());
    currentMotifs = [];
  }

  function refresh() {
    init();
  }

  // Directional wipe: simple crossfade with new motifs (throttled)
  let wipeInProgress = false;
  let wipeTimeout = null;

  function wipeRefresh(direction) {
    // Heavy throttle: max once per 2 seconds
    if (wipeInProgress) return;
    if (wipeTimeout) clearTimeout(wipeTimeout);

    wipeTimeout = setTimeout(() => {
      doWipe(direction);
    }, 300); // debounce 300ms
  }

  function doWipe(direction) {
    if (wipeInProgress) return;
    wipeInProgress = true;

    // Simple approach: fade out old motifs, swap, fade in new
    currentMotifs.forEach(el => {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
    });

    setTimeout(() => {
      init(); // swap to new random motifs
      // New motifs start at 0 opacity, fade in
      currentMotifs.forEach(el => {
        const targetOpacity = el.style.opacity;
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease';
        requestAnimationFrame(() => {
          el.style.opacity = targetOpacity || '0.18';
        });
      });

      setTimeout(() => {
        wipeInProgress = false;
      }, 600);
    }, 350);
  }

  return { init, clear, refresh, wipeRefresh };
})();
