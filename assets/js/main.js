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