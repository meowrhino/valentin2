/* ============================================
   MOTIFS — Floating background (screensaver style)
   5 movement styles selectable via Settings.
   Uses wipe (slide) instead of fade for transitions.
   ============================================ */

const Motifs = (() => {
  const MOTIF_COUNT_TOTAL = 32;
  const MOTIFS_PER_VIEW = 5;
  const container = document.getElementById('motifs-layer');

  const styles = {
    organic: [
      { name: 'organic-1', duration: '45s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-2', duration: '55s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-3', duration: '50s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-4', duration: '60s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'organic-5', duration: '48s', timing: 'ease-in-out', direction: 'alternate' },
    ],
    drift: [
      { name: 'drift-1', duration: '90s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-2', duration: '110s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-3', duration: '100s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-4', duration: '85s', timing: 'linear', direction: 'alternate' },
      { name: 'drift-5', duration: '120s', timing: 'linear', direction: 'alternate' },
    ],
    breath: [
      { name: 'breath-1', duration: '35s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-2', duration: '40s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-3', duration: '45s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-4', duration: '38s', timing: 'ease-in-out', direction: 'alternate' },
      { name: 'breath-5', duration: '42s', timing: 'ease-in-out', direction: 'alternate' },
    ],
    orbital: [
      { name: 'orbital-1', duration: '50s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-2', duration: '60s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-3', duration: '45s', timing: 'linear', direction: 'normal' },
      { name: 'orbital-4', duration: '55s', timing: 'linear', direction: 'reverse' },
      { name: 'orbital-5', duration: '65s', timing: 'linear', direction: 'normal' },
    ],
    mixed: null
  };

  const mixedPool = [
    styles.organic[0], styles.drift[1], styles.breath[2],
    styles.orbital[0], styles.organic[3],
  ];

  let currentMotifs = [];

  function getMotifPath(i) {
    return Utils.BASE + '/assets/motifs/motif-' + String(i).padStart(2, '0') + '.png';
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

    const size = Utils.randInt(200, 400);
    img.style.width = size + 'px';
    img.style.height = 'auto';
    img.style.left = Utils.randInt(-10, 70) + '%';
    img.style.top = Utils.randInt(-5, 70) + '%';
    img.style.opacity = (Utils.randInt(12, 25) / 100).toFixed(2);

    const currentStyle = Settings.get('motifStyle');
    const anims = getAnimationsForStyle(currentStyle);
    const anim = currentStyle === 'mixed' ? anims[animIndex % anims.length] : Utils.randPick(anims);
    const offset = Utils.randInt(0, 50000);
    img.style.animation = anim.name + ' ' + anim.duration + ' ' + anim.timing + ' infinite ' + anim.direction;
    img.style.animationDelay = '-' + offset + 'ms';

    return img;
  }

  function init() {
    clear();
    const indices = Utils.shuffle(Array.from({ length: MOTIF_COUNT_TOTAL }, function(_, i) { return i + 1; }));
    const selected = indices.slice(0, MOTIFS_PER_VIEW);

    selected.forEach(function(i, idx) {
      var el = createMotifElement(getMotifPath(i), idx);
      container.appendChild(el);
      currentMotifs.push(el);
    });
  }

  function clear() {
    currentMotifs.forEach(function(el) { el.remove(); });
    currentMotifs = [];
  }

  function refresh() { init(); }

  // Wipe: slide old motifs out, new ones in
  let wipeInProgress = false;
  let wipeTimeout = null;

  function wipeRefresh(direction) {
    if (wipeInProgress) return;
    if (wipeTimeout) clearTimeout(wipeTimeout);

    wipeTimeout = setTimeout(function() {
      doWipe(direction);
    }, 300);
  }

  function doWipe(direction) {
    if (wipeInProgress) return;
    wipeInProgress = true;

    var wipeClass = direction === 'down' ? 'motif--wipe-out-left' : 'motif--wipe-out-right';

    // Slide old motifs out
    currentMotifs.forEach(function(el) {
      el.classList.add(wipeClass);
    });

    setTimeout(function() {
      // Remove old, create new
      init();

      // New motifs enter from opposite side
      var enterFrom = direction === 'down' ? '120vw' : '-120vw';
      currentMotifs.forEach(function(el) {
        var targetLeft = el.style.left;
        el.style.left = enterFrom;
        el.classList.add('motif--wipe-in');
        // Force reflow
        el.offsetHeight;
        el.style.left = targetLeft;
      });

      setTimeout(function() {
        currentMotifs.forEach(function(el) {
          el.classList.remove('motif--wipe-in');
        });
        wipeInProgress = false;
      }, 700);
    }, 550);
  }

  return { init, clear, refresh, wipeRefresh };
})();
