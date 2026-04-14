/* ============================================
   TRANSITIONS — 8x8 Grid blackout/reveal (smoother)
   Grid only covers content area (between header/footer).
   Header/footer do a soft crossfade independently.
   ============================================ */

const Transitions = (() => {
  const grid = document.getElementById('transition-grid');
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');
  const CELLS = 64;
  const STAGGER_MS = 8;
  const CELL_FADE_MS = 150;
  const REVEAL_STAGGER_MS = 14;
  const REVEAL_FADE_MS = 450;
  const BLACK_PAUSE_MS = 250;
  const HEADER_FADE_MS = 400; // soft crossfade for header/footer

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
    grid.offsetHeight;
    cells.forEach(c => {
      c.style.transition = '';
    });
    grid.style.pointerEvents = 'none';

    // Restore header/footer
    header.style.transition = '';
    header.style.opacity = '';
    footer.style.transition = '';
    footer.style.opacity = '';
    running = false;
  }

  function run(callback) {
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

      // Header/footer: soft fade out during blackout
      header.style.transition = `opacity ${HEADER_FADE_MS}ms ease`;
      footer.style.transition = `opacity ${HEADER_FADE_MS}ms ease`;
      header.style.opacity = '0';
      footer.style.opacity = '0';

      // Phase 1: Blackout (content area only)
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

        // Header/footer: soft fade back in during reveal
        header.style.transition = `opacity ${HEADER_FADE_MS}ms ease`;
        footer.style.transition = `opacity ${HEADER_FADE_MS}ms ease`;
        header.style.opacity = '1';
        footer.style.opacity = '1';

        setTimeout(() => {
          if (!running) { resolve(); return; }

          // Phase 2: Reveal (content area)
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

      // Safety timeout
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
