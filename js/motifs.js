/* ============================================
   MOTIFS — Floating background (screensaver style)
   5 movement styles selectable via Settings panel
   ============================================ */

const Motifs = (() => {
  const MOTIF_COUNT_TOTAL = 32;
  const MOTIFS_PER_VIEW = 5;
  const container = document.getElementById('motifs-layer');

  // ---- 5 Animation Style Sets ----
  const styles = {
    // A: Flotacion organica — smooth jellyfish-like, ease-in-out, short paths
    organic: [
      { name: 'organic-1', duration: '45s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-2', duration: '55s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-3', duration: '50s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-4', duration: '60s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-5', duration: '48s', timing: 'ease-in-out', direction: 'alternate' },
    ],
    // B: Deriva lenta — very slow dust floating, diagonal only
    drift: [
      { name: 'drift-1', duration: '90s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-2', duration: '110s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-3', duration: '100s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-4', duration: '85s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-5', duration: '120s', timing: 'linear', direction: 'alternate' },
    ],
    // C: Respiracion — pulsating scale with minimal translation
    breath: [
      { name: 'breath-1', duration: '35s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-2', duration: '40s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-3', duration: '45s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-4', duration: '38s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-5', duration: '42s', timing: 'ease-in-out', direction: 'alternate' },
    ],
    // D: Orbital — circular/elliptical multi-waypoint paths
    orbital: [
      { name: 'orbital-1', duration: '50s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-2', duration: '60s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-3', duration: '45s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-4', duration: '55s', timing: 'linear', direction: 'reverse' },
      { name: 'orbital-5', duration: '65s', timing: 'linear', direction: 'normal' },
    ],
    // E: Mixto — each motif picks from a different style
    mixed: null // handled specially
  };

  // For mixed mode, one animation from each style
  const mixedPool = [
    styles.organic[0],
    styles.drift[1],
    styles.breath[2],
    styles.orbital[0],
    styles.organic[3],
  ];

  let currentMotifs = [];

  function getMotifPath(i) {
    const num = String(i).padStart(2, '0');
    return `${Utils.BASE}/assets/motifs/motif-${num}.png`;
  }

  function getAnimationsForStyle(style) {
    if (style === 'mixed') return mixedPool;
    return styles[style] || styles.organic;
  }

  function createMotifElement(src, animIndex) {
    const img = document.createElement('img');
    img.className = 'motif';
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';

    // Size 200-400px
    const size = Utils.randInt(200, 400);
    img.style.width = size + 'px';
    img.style.height = 'auto';

    // Random starting position
    img.style.left = Utils.randInt(-10, 70) + '%';
    img.style.top = Utils.randInt(-5, 70) + '%';

    // Opacity 12-25%
    img.style.opacity = (Utils.randInt(12, 25) / 100).toFixed(2);

    // Animation from current style
    const currentStyle = Settings.get('motifStyle');
    const anims = getAnimationsForStyle(currentStyle);
    const anim = currentStyle === 'mixed' ? anims[animIndex % anims.length] : Utils.randPick(anims);
    const offset = Utils.randInt(0, 50000);
    img.style.animation = `${anim.name} ${anim.duration} ${anim.timing} infinite ${anim.direction}`;
    img.style.animationDelay = `-${offset}ms`;

    return img;
  }

  function init() {
    clear();
    const indices = Utils.shuffle(Array.from({ length: MOTIF_COUNT_TOTAL }, (_, i) => i + 1));
    const selected = indices.slice(0, MOTIFS_PER_VIEW);

    selected.forEach((i, idx) => {
      const el = createMotifElement(getMotifPath(i), idx);
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

  // Directional wipe: crossfade with new motifs (throttled)
  let wipeInProgress = false;
  let wipeTimeout = null;

  function wipeRefresh(direction) {
    if (wipeInProgress) return;
    if (wipeTimeout) clearTimeout(wipeTimeout);

    wipeTimeout = setTimeout(() => {
      doWipe(direction);
    }, 300);
  }

  function doWipe(direction) {
    if (wipeInProgress) return;
    wipeInProgress = true;

    // Fade out old motifs
    currentMotifs.forEach(el => {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
    });

    setTimeout(() => {
      init();
      // New motifs start at 0, fade in
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
