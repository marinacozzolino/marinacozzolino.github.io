// Contact form feedback
(function() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const feedback = form.querySelector('.form-feedback');
  form.addEventListener('submit', function(e) {
    if (form.querySelector('[name="_gotcha"]').value) {
      e.preventDefault();
      return;
    }
    feedback.style.display = 'block';
    feedback.textContent = 'Sending...';
    setTimeout(() => {
      feedback.textContent = 'Thank you! Your message has been sent.';
      setTimeout(() => { feedback.style.display = 'none'; }, 5000);
    }, 1200);
  });
})(); 