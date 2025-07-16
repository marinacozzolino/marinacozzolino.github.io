// Theme Toggle Functionality
(function() {
  // Theme configuration
  const themes = {
    night: 'assets/css/night.css',
    day: 'assets/css/day.css'
  };

  let currentTheme = 'night'; // Default theme
  
  // Get elements
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  // Get the theme stylesheet link (now loaded directly in HTML)
  let themeStylesheet = document.getElementById('theme-stylesheet');
  
  // Load saved theme preference
  function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      currentTheme = savedTheme;
      applyTheme(currentTheme);
    }
  }
  
  // Apply theme
  function applyTheme(theme) {
    currentTheme = theme;
    themeStylesheet.href = themes[theme];
    
    // Update icon visibility
    if (theme === 'day') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Update toggle accessibility
    themeToggle.setAttribute('aria-label', 
      theme === 'day' ? 'Switch to night theme' : 'Switch to day theme'
    );
  }
  
  // Toggle theme
  function toggleTheme() {
    const newTheme = currentTheme === 'night' ? 'day' : 'night';
    applyTheme(newTheme);
  }
  
  // Initialize theme toggle functionality
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
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initThemeToggle);
})(); 