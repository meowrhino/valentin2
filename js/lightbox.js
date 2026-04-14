/* ============================================
   LIGHTBOX — Fullscreen image viewer
   Opens with animation: image flies from scroll position to center.
   Closes with animation: image flies back to scroll position.
   Arrow keys navigate, X buttons or click to close.
   ============================================ */

const Lightbox = (() => {
  const el = document.getElementById('lightbox');
  const img = el.querySelector('.lightbox__img');
  const closeButtons = el.querySelectorAll('.lightbox__close');

  let images = [];
  let currentIndex = 0;
  let _isOpen = false;
  let sourceRect = null; // original position of the clicked image

  function open(imageSources, startIndex, clickedImgEl) {
    images = imageSources;
    currentIndex = startIndex || 0;
    _isOpen = true;

    // Capture source position for animation
    if (clickedImgEl) {
      sourceRect = clickedImgEl.getBoundingClientRect();
    } else {
      sourceRect = null;
    }

    // Set image source
    img.src = images[currentIndex];

    if (sourceRect) {
      // Start image at source position
      img.style.transition = 'none';
      img.style.position = 'fixed';
      img.style.left = sourceRect.left + 'px';
      img.style.top = sourceRect.top + 'px';
      img.style.width = sourceRect.width + 'px';
      img.style.height = sourceRect.height + 'px';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.objectFit = 'cover';

      // Show lightbox bg
      el.classList.remove('lightbox--hidden');
      el.style.background = 'transparent';

      // Force reflow
      img.offsetHeight;

      // Animate to center
      img.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      img.style.left = '10dvw';
      img.style.top = '10dvh';
      img.style.width = 'calc(100vw - 20dvw)';
      img.style.height = 'calc(100vh - 20dvh)';
      img.style.objectFit = 'contain';

      // Fade in background
      setTimeout(function() {
        el.style.transition = 'background 0.3s ease';
        el.style.background = '';
      }, 50);

      // After animation, reset to normal layout
      setTimeout(function() {
        img.style.transition = '';
        img.style.position = '';
        img.style.left = '';
        img.style.top = '';
        img.style.width = '';
        img.style.height = '';
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        img.style.objectFit = '';
      }, 550);
    } else {
      el.classList.remove('lightbox--hidden');
    }

    // Hide header/footer
    Header.hideBars();
  }

  function closeLightbox() {
    if (!_isOpen) return;
    _isOpen = false;

    if (sourceRect) {
      // Animate image back to source position
      var currentRect = img.getBoundingClientRect();
      img.style.transition = 'none';
      img.style.position = 'fixed';
      img.style.left = currentRect.left + 'px';
      img.style.top = currentRect.top + 'px';
      img.style.width = currentRect.width + 'px';
      img.style.height = currentRect.height + 'px';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.objectFit = 'contain';

      img.offsetHeight;

      img.style.transition = 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      img.style.left = sourceRect.left + 'px';
      img.style.top = sourceRect.top + 'px';
      img.style.width = sourceRect.width + 'px';
      img.style.height = sourceRect.height + 'px';
      img.style.objectFit = 'cover';

      // Fade out bg
      el.style.transition = 'background 0.3s ease';
      el.style.background = 'transparent';

      setTimeout(function() {
        el.classList.add('lightbox--hidden');
        // Reset styles
        img.style.transition = '';
        img.style.position = '';
        img.style.left = '';
        img.style.top = '';
        img.style.width = '';
        img.style.height = '';
        img.style.maxWidth = '';
        img.style.maxHeight = '';
        img.style.objectFit = '';
        el.style.transition = '';
        el.style.background = '';
      }, 500);
    } else {
      el.classList.add('lightbox--hidden');
    }

    // Bring back header/footer
    Header.showBars();
  }

  function prev() {
    if (!_isOpen || images.length <= 1) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(function() {
      img.src = images[currentIndex];
      img.style.opacity = '1';
    }, 150);
  }

  function next() {
    if (!_isOpen || images.length <= 1) return;
    currentIndex = (currentIndex + 1) % images.length;
    img.style.opacity = '0';
    setTimeout(function() {
      img.src = images[currentIndex];
      img.style.opacity = '1';
    }, 150);
  }

  function init() {
    closeButtons.forEach(function(btn) { btn.addEventListener('click', closeLightbox); });
    img.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function(e) {
      if (!_isOpen) return;
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      else if (e.key === 'Escape') { closeLightbox(); e.preventDefault(); }
    });
  }

  return { init, open, close: closeLightbox, isOpen: function() { return _isOpen; } };
})();
