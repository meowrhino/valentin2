/* ============================================
   LIGHTBOX — Fullscreen image viewer
   Click image → header/footer slide out to sides
   Arrow keys navigate, X buttons or click to close
   ============================================ */

const Lightbox = (() => {
  const el = document.getElementById('lightbox');
  const img = el.querySelector('.lightbox__img');
  const closeButtons = el.querySelectorAll('.lightbox__close');

  let images = [];     // array of image src URLs
  let currentIndex = 0;
  let isOpen = false;

  function open(imageSources, startIndex) {
    images = imageSources;
    currentIndex = startIndex || 0;
    isOpen = true;

    // Show current image
    img.src = images[currentIndex];

    // Reveal lightbox
    el.classList.remove('lightbox--hidden');

    // Hide header/footer (slide to sides)
    Header.hideBars();
  }

  function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;

    el.classList.add('lightbox--hidden');

    // Bring back header/footer
    Header.showBars();
  }

  function prev() {
    if (!isOpen || images.length <= 1) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[currentIndex];
      img.style.opacity = '1';
    }, 150);
  }

  function next() {
    if (!isOpen || images.length <= 1) return;
    currentIndex = (currentIndex + 1) % images.length;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[currentIndex];
      img.style.opacity = '1';
    }, 150);
  }

  function init() {
    // Close buttons (4 corners)
    closeButtons.forEach(btn => btn.addEventListener('click', closeLightbox));

    // Click image to close
    img.addEventListener('click', closeLightbox);

    // Arrow keys
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      else if (e.key === 'Escape') { closeLightbox(); e.preventDefault(); }
    });
  }

  return { init, open, close: closeLightbox, isOpen: () => isOpen };
})();
