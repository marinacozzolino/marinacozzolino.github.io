// Enhanced scroll position management - prevent bottom loading
(function() {
  // Immediately prevent any scroll behavior
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  
  // Clear any hash from URL that might cause auto-scroll
  if (window.location.hash) {
    // Replace current state without hash to prevent auto-scrolling
    history.replaceState(null, null, window.location.pathname);
  }
  
  // Force scroll to top immediately and repeatedly
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // Prevent hash-based navigation during initial load
  let isInitialLoad = true;
  
  // Monitor and correct scroll position during load
  const scrollMonitor = setInterval(function() {
    if (isInitialLoad && (window.pageYOffset > 0 || document.documentElement.scrollTop > 0)) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, 10);
  
  // Handle DOM load completion
  document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Stop aggressive monitoring after load, but keep checking briefly
    setTimeout(function() {
      clearInterval(scrollMonitor);
      isInitialLoad = false;
      
      // Final position verification
      window.scrollTo(0, 0);
    }, 1000);
  });
  
  // Handle page navigation events
  window.addEventListener('pageshow', function(event) {
    if (event.persisted || !isInitialLoad) {
      window.scrollTo(0, 0);
    }
  });
  
  // Prevent scroll on hash change during initial load
  window.addEventListener('hashchange', function(event) {
    if (isInitialLoad) {
      event.preventDefault();
      window.scrollTo(0, 0);
      return false;
    }
  });
})();

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
        backgroundColor: 0x29212c, // raisin-black background
        color1: 0xff1744, // vibrant red (like the "G" in Galaxy)
        color2: 0xff9500, // bright orange (like the "y" in Galaxy)
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