document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const submitButton = contactForm.querySelector('.contact-submit');
    const status = contactForm.querySelector('#contact-status');
    const fields = contactForm.querySelectorAll('input:not([type="hidden"]), textarea');
    let sending = false;

    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !contactForm.reportValidity()) return;

      const payload = Object.fromEntries(new FormData(contactForm));
      const originalButton = submitButton.innerHTML;
      const previousReadOnly = Array.from(fields, field => field.readOnly);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      sending = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
      fields.forEach(field => { field.readOnly = true; });
      contactForm.setAttribute('aria-busy', 'true');
      status.hidden = false;
      status.textContent = 'Sending your message…';
      status.dataset.state = 'sending';

      try {
        const response = await fetch(contactForm.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Submission rejected');
        const result = await response.json();
        if (result.success !== true && result.success !== 'true') throw new Error('Submission not confirmed');
        contactForm.reset();
        status.textContent = 'Thank you. Your message has been submitted.';
        status.dataset.state = 'success';
      } catch {
        status.textContent = 'We couldn’t confirm your submission. Your message is still here—please try again.';
        status.dataset.state = 'error';
      } finally {
        clearTimeout(timeout);
        sending = false;
        submitButton.disabled = false;
        submitButton.innerHTML = originalButton;
        fields.forEach((field, index) => { field.readOnly = previousReadOnly[index]; });
        contactForm.removeAttribute('aria-busy');
      }
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // Scroll Reveal Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Automatically add reveal-up class to elements we want to animate
  const elementsToReveal = document.querySelectorAll('.card, .portrait-card, .logos-grid img, h2');
  elementsToReveal.forEach(el => {
    el.classList.add('reveal-up');
    observer.observe(el);
  });

  // Testimonial Carousel Scrolling
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach(card => {
    card.addEventListener('click', () => {
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    });
  });
});
