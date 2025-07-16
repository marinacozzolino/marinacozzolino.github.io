// VANTA.BIRDS hero background
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    if (window.VANTA && window.VANTA.BIRDS) {
      window.VANTA.BIRDS({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0xffffff,
        color1: 0x80CBC4,
        color2: 0xFFB997,
        birdSize: 0.40,
        wingSpan: 40.00,
        speedLimit: 3.00,
        // quantity: 30.00,
        separation: 49.00,
        backgroundAlpha: 0.15
      });
    }
  });
})();

// Portfolio filter bar logic
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.portfolio-card');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');
        cards.forEach(card => {
          if (filter === 'All' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  });
})();

// Modal logic for portfolio and blog cards
(function() {
  function openModal(title, desc, img, link) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = desc;
    const modalImg = document.getElementById('modal-img');
    if (img) {
      modalImg.src = img;
      modalImg.style.display = '';
    } else {
      modalImg.style.display = 'none';
    }
    const modalLink = document.getElementById('modal-link');
    if (link) {
      modalLink.href = link;
      modalLink.style.display = '';
    } else {
      modalLink.style.display = 'none';
    }
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.portfolio-card, .blog-card').forEach(card => {
      card.addEventListener('click', function(e) {
        e.preventDefault();
        openModal(
          card.getAttribute('data-title'),
          card.getAttribute('data-desc'),
          card.getAttribute('data-img'),
          card.getAttribute('data-link')
        );
      });
    });
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
  });
})(); 