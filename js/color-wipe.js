/* ============================================
   COLOR WIPE — Center-outward color reveal for header/footer
   Uses clip-path animation to wipe color from center to edges
   ============================================ */

const ColorWipe = (() => {
  const headerLayer = document.getElementById('color-layer-header');
  const footerLayer = document.getElementById('color-layer-footer');

  let currentColor = '#fff';
  let isAnimating = false;

  function setColor(color) {
    const newColor = color || '#fff';
    if (newColor === currentColor) return;

    // Update CSS variable for text/border theming
    document.body.style.setProperty('--project-color', newColor);

    // Animate the color layers with wipe from center
    animateWipe(newColor);
    currentColor = newColor;
  }

  function animateWipe(newColor) {
    if (!headerLayer || !footerLayer) return;

    // Set new color on the "next" pseudo layer
    headerLayer.style.setProperty('--next-color', newColor);
    footerLayer.style.setProperty('--next-color', newColor);

    // Trigger the wipe animation
    headerLayer.classList.remove('color-layer--wipe');
    footerLayer.classList.remove('color-layer--wipe');

    // Force reflow
    headerLayer.offsetHeight;

    headerLayer.classList.add('color-layer--wipe');
    footerLayer.classList.add('color-layer--wipe');

    // After animation completes, set as base color
    const onEnd = () => {
      headerLayer.removeEventListener('animationend', onEnd);
      headerLayer.style.setProperty('--current-color', newColor);
      footerLayer.style.setProperty('--current-color', newColor);
      headerLayer.classList.remove('color-layer--wipe');
      footerLayer.classList.remove('color-layer--wipe');
    };

    headerLayer.addEventListener('animationend', onEnd);

    // Safety fallback
    setTimeout(() => {
      headerLayer.style.setProperty('--current-color', newColor);
      footerLayer.style.setProperty('--current-color', newColor);
      headerLayer.classList.remove('color-layer--wipe');
      footerLayer.classList.remove('color-layer--wipe');
    }, 900);
  }

  function setInstant(color) {
    const c = color || '#fff';
    currentColor = c;
    document.body.style.setProperty('--project-color', c);
    if (headerLayer) headerLayer.style.setProperty('--current-color', c);
    if (footerLayer) footerLayer.style.setProperty('--current-color', c);
  }

  return { setColor, setInstant };
})();
