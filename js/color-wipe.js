/* ============================================
   COLOR WIPE — Updates project color for blend-mode system
   The bar-color divs behind header/footer use --project-color.
   mix-blend-mode: multiply on the bar makes white text/borders
   take on the project color (white × color = color).
   ============================================ */

const ColorWipe = (() => {
  const headerColor = document.getElementById('header-color');
  const footerColor = document.getElementById('footer-color');

  let currentColor = '#fff';

  function setColor(color) {
    const newColor = color || '#fff';
    if (newColor === currentColor) return;
    currentColor = newColor;

    // Update CSS variable for anything that reads it directly
    document.body.style.setProperty('--project-color', newColor);

    // Update the color layer backgrounds
    if (headerColor) headerColor.style.background = newColor;
    if (footerColor) footerColor.style.background = newColor;
  }

  function setInstant(color) {
    setColor(color);
  }

  return { setColor, setInstant };
})();
