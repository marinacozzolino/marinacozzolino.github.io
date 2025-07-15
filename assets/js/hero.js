// VANTA.NET full screen background
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof VANTA === 'undefined' || !VANTA.NET) return;
  
  let vantaEffect = VANTA.NET({
    el: '#vanta-bg',
    mouseControls: true,
    touchControls: true,
    minHeight: window.innerHeight * 0.5,
    minWidth: window.innerWidth,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x87CEEB,
    backgroundColor: 0xFFFFFF,
    points: 15.0,
    maxDistance: 25.0,
    spacing: 20.0
  });

  // Handle window resize for full screen responsiveness
  window.addEventListener('resize', function() {
    if (vantaEffect) {
      vantaEffect.resize();
    }
  });
})(); 