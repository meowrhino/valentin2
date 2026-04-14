/* ============================================
   TRANSITIONS — 8x8 Grid blackout/reveal
   ============================================ */

const Transitions = (() => {
  const grid = document.getElementById('transition-grid');
  const CELLS = 64;
  const STAGGER_MS = 12;
  const CELL_FADE_MS = 150;
  const REVEAL_STAGGER_MS = 20;
  const REVEAL_FADE_MS = 300;
  const BLACK_PAUSE_MS = 400;

  let cells = [];

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

  function run(callback) {
    return new Promise(resolve => {
      buildGrid();
      grid.style.pointerEvents = 'all';

      const blackoutOrder = randomOrder();
      const revealOrder = randomOrder();

      // Phase 1: Blackout
      blackoutOrder.forEach((idx, i) => {
        setTimeout(() => {
          cells[idx].style.opacity = '1';
        }, i * STAGGER_MS);
      });

      const blackoutDuration = CELLS * STAGGER_MS + CELL_FADE_MS;

      setTimeout(() => {
        // Execute callback while screen is black
        if (callback) callback();

        setTimeout(() => {
          // Phase 2: Reveal
          revealOrder.forEach((idx, i) => {
            setTimeout(() => {
              cells[idx].style.transition = `opacity ${REVEAL_FADE_MS}ms ease`;
              cells[idx].style.opacity = '0';
            }, i * REVEAL_STAGGER_MS);
          });

          const revealDuration = CELLS * REVEAL_STAGGER_MS + REVEAL_FADE_MS;

          setTimeout(() => {
            // Cleanup
            cells.forEach(c => {
              c.style.transition = `opacity ${CELL_FADE_MS}ms ease`;
              c.style.opacity = '0';
            });
            grid.style.pointerEvents = 'none';
            resolve();
          }, revealDuration + 100);
        }, BLACK_PAUSE_MS);
      }, blackoutDuration);
    });
  }

  return { run, buildGrid };
})();
