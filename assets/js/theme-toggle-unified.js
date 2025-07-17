// Unified Theme Toggle Functionality
// Based on cc065d1 theme-toggle.js, adapted for CSS custom properties
(function() {
  let currentTheme = 'dark'; // Default theme (matches cc065d1 'night')
  
  // Get elements
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  // Load saved theme preference
  function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    
    // Map old theme names to new ones for backwards compatibility
    let mappedTheme = savedTheme;
    if (savedTheme === 'night') mappedTheme = 'dark';
    if (savedTheme === 'day') mappedTheme = 'light';
    
    if (mappedTheme && (mappedTheme === 'light' || mappedTheme === 'dark')) {
      currentTheme = mappedTheme;
      applyTheme(currentTheme);
    }
  }
  
  // Apply theme
  function applyTheme(theme) {
    currentTheme = theme;
    
    // Destroy existing Vanta instance if it exists
    if (window.vantaEffect) {
      window.vantaEffect.destroy();
      window.vantaEffect = null;
    }
    
    // Set data attribute on body
    document.body.setAttribute('data-theme', theme);
    
    // Update icon visibility (same logic as cc065d1)
    if (theme === 'light') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Update toggle accessibility (same logic as cc065d1)
    themeToggle.setAttribute('aria-label', 
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
    
    // Dispatch custom event for Vanta reinitialization
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }, 100);
  }
  
  // Toggle theme (same logic as cc065d1: night <-> day becomes dark <-> light)
  function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }
  
  // Initialize theme toggle functionality (identical to cc065d1)
  function initThemeToggle() {
    if (!themeToggle) return;
    
    // Load saved preference
    loadThemePreference();
    
    // Add click event listener
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add keyboard support
    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }
  
  // Initialize when DOM is loaded (identical to cc065d1)
  document.addEventListener('DOMContentLoaded', initThemeToggle);
})(); 