// Light/Dark mode toggle
(function() {
  const toggle = document.getElementById('mode-toggle');
  const darkClass = 'dark-mode';
  const storageKey = 'color-mode';

  function setMode(mode) {
    if (mode === 'dark') {
      document.documentElement.classList.add(darkClass);
    } else {
      document.documentElement.classList.remove(darkClass);
    }
    localStorage.setItem(storageKey, mode);
  }

  function getMode() {
    return localStorage.getItem(storageKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  toggle.addEventListener('click', function() {
    const current = getMode();
    setMode(current === 'dark' ? 'light' : 'dark');
  });

  // Initialize on page load
  setMode(getMode());
})(); 