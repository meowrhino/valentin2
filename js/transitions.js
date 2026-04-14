/* ============================================
   TRANSITIONS — 8x8 Grid blackout/reveal (smoother)
   ============================================ */

const Transitions = (() => {
  const grid = document.getElementById('transition-grid');
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
    for (let i = 0; i < CELLS; i++) {
      const cell = document.createElement('div');
      cell.className = 'transition-grid__cell';
      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  function randomOrder() {
    const indices = Array.from({ length: CELLS }, (_, i) => i);
    return Utils.shuffle(indices);
  }

  function cleanup() {
    cells.forEach(c => {
      c.style.transition = 'none';
      c.style.opacity = '0';
    });
    // Force reflow then restore transition
    grid.offsetHeight;
    cells.forEach(c => {
      c.style.transition = '';
    });
    grid.style.pointerEvents = 'none';
    running = false;
  }

  function run(callback) {
    // Prevent double-running
    if (running) {
      cleanup();
      if (callback) callback();
      return Promise.resolve();
    }

    return new Promise(resolve => {
      running = true;
      buildGrid();
      grid.style.pointerEvents = 'all';

      const blackoutOrder = randomOrder();
      const revealOrder = randomOrder();

      // Phase 1: Blackout
      blackoutOrder.forEach((idx, i) => {
        setTimeout(() => {
          if (!running) return;
          cells[idx].style.transition = `opacity ${CELL_FADE_MS}ms ease-in-out`;
          cells[idx].style.opacity = '1';
        }, i * STAGGER_MS);
      });

      const blackoutDuration = CELLS * STAGGER_MS + CELL_FADE_MS;

      setTimeout(() => {
        if (!running) { resolve(); return; }

        // Execute callback while screen is black
        if (callback) callback();

        setTimeout(() => {
          if (!running) { resolve(); return; }

          // Phase 2: Reveal
          revealOrder.forEach((idx, i) => {
            setTimeout(() => {
              if (!running) return;
              cells[idx].style.transition = `opacity ${REVEAL_FADE_MS}ms ease-in-out`;
              cells[idx].style.opacity = '0';
            }, i * REVEAL_STAGGER_MS);
          });

          const revealDuration = CELLS * REVEAL_STAGGER_MS + REVEAL_FADE_MS;

          setTimeout(() => {
            cleanup();
            resolve();
          }, revealDuration + 150);
        }, BLACK_PAUSE_MS);
      }, blackoutDuration);

      // Safety timeout — force cleanup if stuck
      const totalMax = blackoutDuration + BLACK_PAUSE_MS +
                       CELLS * REVEAL_STAGGER_MS + REVEAL_FADE_MS + 500;
      setTimeout(() => {
        if (running) {
          console.warn('Transition safety timeout — forcing cleanup');
          cleanup();
          resolve();
        }
      }, totalMax);
    });
  }

  return { run, buildGrid };
})();
