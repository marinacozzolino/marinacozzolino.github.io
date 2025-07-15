// VANTA.NET background for hero section
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof VANTA === 'undefined' || !VANTA.NET) return;
  VANTA.NET({
    el: '#vanta-bg',
    mouseControls: true,
    touchControls: true,
    minHeight: 400.00,
    minWidth: 200.00,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x0077ff,
    backgroundColor: 0x181a1b,
    points: 12.0,
    maxDistance: 22.0,
    spacing: 18.0
  });
})(); 