/* ============================================
   TRANSITIONS — 8x8 Grid + Horizontal wipe

   Two transition types:

   1. GRID (run): 64 cells (8×8) that fade in randomly to black,
      then fade out randomly to reveal the new content.
      Used for project enter/exit/prev/next navigation.

   2. WIPE (wipe): Horizontal left-to-right color sweep.
      Used for mode and category changes.

   GRID MODE TOGGLE — FULLSCREEN_GRID
   ───────────────────────────────────
   false (default): Grid covers only the content area, between
     header and footer. Uses CSS top: var(--header-h) and
     bottom: var(--footer-h). Header/footer fade softly via
     .bar-wrapper--fading class during the transition.

   true: Grid covers the entire viewport (top:0, bottom:0).
     The 8×8 cells span edge to edge, covering header and
     footer completely. No separate bar fading needed since
     the grid is on top of everything.

   To switch: change FULLSCREEN_GRID below.
   ============================================ */

const Transitions = (() => {
  const grid = document.getElementById('transition-grid');
  const wipeOverlay = document.getElementById('wipe-overlay');
  const headerWrapper = document.querySelector('.bar-wrapper--top');
  const footerWrapper = document.querySelector('.bar-wrapper--bottom');

  // ── TOGGLE: set to true for full-viewport grid (covers header/footer) ──
  const FULLSCREEN_GRID = false;

  const CELLS = 64;           // 8×8 grid
  const STAGGER_MS = 8;       // delay between each cell's blackout start
  const CELL_FADE_MS = 150;   // how long each cell takes to fade to black
  const REVEAL_STAGGER_MS = 14; // delay between each cell's reveal start
  const REVEAL_FADE_MS = 450; // how long each cell takes to fade out (reveal)
  const BLACK_PAUSE_MS = 250; // pause at full black before revealing

  let cells = [];
  let running = false;

  function buildGrid() {
    if (cells.length) return;
    // In fullscreen mode, the grid covers the entire viewport
    // (ignoring header/footer). Otherwise it sits between them.
    if (FULLSCREEN_GRID) {
      grid.classList.add('transition-grid--fullscreen');
    }
    for (var i = 0; i < CELLS; i++) {
      var cell = document.createElement('div');
      cell.className = 'transition-grid__cell';
      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  function randomOrder() {
    return Utils.shuffle(Array.from({ length: CELLS }, function(_, i) { return i; }));
  }

  function cleanup() {
    // Reset all cells to transparent instantly
    cells.forEach(function(c) {
      c.style.transition = 'none';
      c.style.opacity = '0';
    });
    grid.offsetHeight; // force reflow so the reset takes effect
    cells.forEach(function(c) { c.style.transition = ''; });
    grid.style.pointerEvents = 'none';

    // Ensure header/footer are visible (only relevant in content-only mode)
    if (!FULLSCREEN_GRID) {
      headerWrapper.classList.remove('bar-wrapper--fading');
      footerWrapper.classList.remove('bar-wrapper--fading');
    }
    running = false;
  }

  // 8x8 Grid transition (for project enter/exit/navigation)
  function run(callback) {
    if (running) {
      cleanup();
      if (callback) callback();
      return Promise.resolve();
    }

    return new Promise(function(resolve) {
      running = true;
      buildGrid();
      grid.style.pointerEvents = 'all';

      var blackoutOrder = randomOrder();
      var revealOrder = randomOrder();

      // In content-only mode, header/footer fade softly alongside the grid.
      // In fullscreen mode, the grid covers them — no fade needed.
      if (!FULLSCREEN_GRID) {
        headerWrapper.classList.add('bar-wrapper--fading');
        footerWrapper.classList.add('bar-wrapper--fading');
      }

      // Phase 1: Blackout — cells fade to opaque in random order
      blackoutOrder.forEach(function(idx, i) {
        setTimeout(function() {
          if (!running) return;
          cells[idx].style.transition = 'opacity ' + CELL_FADE_MS + 'ms ease-in-out';
          cells[idx].style.opacity = '1';
        }, i * STAGGER_MS);
      });

      var blackoutDuration = CELLS * STAGGER_MS + CELL_FADE_MS;

      setTimeout(function() {
        if (!running) { resolve(); return; }
        // Content swap happens here, while screen is fully black
        if (callback) callback();

        // Restore header/footer visibility
        if (!FULLSCREEN_GRID) {
          headerWrapper.classList.remove('bar-wrapper--fading');
          footerWrapper.classList.remove('bar-wrapper--fading');
        }

        setTimeout(function() {
          if (!running) { resolve(); return; }

          // Phase 2: Reveal
          revealOrder.forEach(function(idx, i) {
            setTimeout(function() {
              if (!running) return;
              cells[idx].style.transition = 'opacity ' + REVEAL_FADE_MS + 'ms ease-in-out';
              cells[idx].style.opacity = '0';
            }, i * REVEAL_STAGGER_MS);
          });

          var revealDuration = CELLS * REVEAL_STAGGER_MS + REVEAL_FADE_MS;

          setTimeout(function() {
            cleanup();
            resolve();
          }, revealDuration + 150);
        }, BLACK_PAUSE_MS);
      }, blackoutDuration);

      // Safety
      var totalMax = blackoutDuration + BLACK_PAUSE_MS + CELLS * REVEAL_STAGGER_MS + REVEAL_FADE_MS + 500;
      setTimeout(function() {
        if (running) { cleanup(); resolve(); }
      }, totalMax);
    });
  }

  // ── HORIZONTAL WIPE ──
  // A solid color sweep from left to right. Used for mode/category changes.
  // Timeline: wipe-in (420ms) → callback while covered → pause (100ms) → wipe-out (450ms)
  function wipe(callback) {
    return new Promise(function(resolve) {
      wipeOverlay.className = 'wipe-overlay';
      wipeOverlay.offsetHeight; // force reflow so CSS reset takes effect

      // Phase 1: sweep in from left, covering the content
      wipeOverlay.classList.add('wipe-overlay--in');

      setTimeout(function() {
        // Content swap happens here, while screen is fully covered
        if (callback) callback();

        setTimeout(function() {
          // Phase 2: sweep continues right, revealing new content
          wipeOverlay.classList.remove('wipe-overlay--in');
          wipeOverlay.classList.add('wipe-overlay--out');

          setTimeout(function() {
            wipeOverlay.className = 'wipe-overlay';
            resolve();
          }, 450);
        }, 100);
      }, 420);
    });
  }

  return { run, wipe, buildGrid };
})();
