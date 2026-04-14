/* ============================================
   TRANSITIONS — 8x8 Grid + Horizontal wipe
   Grid: for project navigation (content area only)
   Wipe: for mode/category changes (left-to-right sweep)
   ============================================ */

const Transitions = (() => {
  const grid = document.getElementById('transition-grid');
  const wipeOverlay = document.getElementById('wipe-overlay');
  const headerWrapper = document.querySelector('.bar-wrapper--top');
  const footerWrapper = document.querySelector('.bar-wrapper--bottom');

  const CELLS = 64;
  const STAGGER_MS = 8;
  const CELL_FADE_MS = 150;
  const REVEAL_STAGGER_MS = 14;
  const REVEAL_FADE_MS = 450;
  const BLACK_PAUSE_MS = 250;

  let cells = [];
  let running = false;

  function buildGrid() {
    if (cells.length) return;
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
    cells.forEach(function(c) {
      c.style.transition = 'none';
      c.style.opacity = '0';
    });
    grid.offsetHeight;
    cells.forEach(function(c) { c.style.transition = ''; });
    grid.style.pointerEvents = 'none';

    // Restore header/footer
    headerWrapper.classList.remove('bar-wrapper--fading');
    footerWrapper.classList.remove('bar-wrapper--fading');
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

      // Header/footer soft fade
      headerWrapper.classList.add('bar-wrapper--fading');
      footerWrapper.classList.add('bar-wrapper--fading');

      // Phase 1: Blackout
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
        if (callback) callback();

        // Restore header/footer
        headerWrapper.classList.remove('bar-wrapper--fading');
        footerWrapper.classList.remove('bar-wrapper--fading');

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

  // Horizontal wipe (for mode/category changes)
  function wipe(callback) {
    return new Promise(function(resolve) {
      // Reset
      wipeOverlay.className = 'wipe-overlay';
      wipeOverlay.offsetHeight; // force reflow

      // Wipe in (left to right cover)
      wipeOverlay.classList.add('wipe-overlay--in');

      setTimeout(function() {
        // Execute callback while covered
        if (callback) callback();

        // Small pause
        setTimeout(function() {
          // Wipe out (continue right)
          wipeOverlay.classList.remove('wipe-overlay--in');
          wipeOverlay.classList.add('wipe-overlay--out');

          setTimeout(function() {
            // Reset overlay
            wipeOverlay.className = 'wipe-overlay';
            resolve();
          }, 450);
        }, 100);
      }, 420);
    });
  }

  return { run, wipe, buildGrid };
})();
