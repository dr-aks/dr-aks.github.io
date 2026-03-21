/* ============================================================
   ASHISH KUMAR — Professor Website | main.js
   ============================================================ */

// ---- NAV SCROLL EFFECT ----
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ---- MOBILE NAV TOGGLE ----
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) navLinks.classList.remove('open');
  });
}

// ---- ACTIVE NAV LINK ----
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ---- SCROLL ANIMATIONS ----
const animEls = document.querySelectorAll('[data-anim]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), (e.target.dataset.delay || 0) * 100);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  animEls.forEach(el => observer.observe(el));
} else {
  // Fallback: make all animated elements visible immediately
  animEls.forEach(el => el.classList.add('visible'));
}

// ---- COUNTER ANIMATION ----
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const decimals = (el.dataset.target.includes('.')) ? 1 : 0;
  const duration = 1800;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const current  = target * ease;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = 'true';
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.metric-num[data-target]').forEach(el => {
    counterObserver.observe(el);
  });
}

// ---- LATTICE BACKGROUND ----
document.querySelectorAll('.lattice-bg').forEach(el => {
  el.style.backgroundImage =
    'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.07) 1px, transparent 0)';
  el.style.backgroundSize = '38px 38px';
});

// ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
// Polyfill for Safari iOS < 15.4 which doesn't support scrollTo({behavior:'smooth'})
function smoothScrollTo(top) {
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({ top: top, behavior: 'smooth' });
  } else {
    // Simple rAF-based fallback
    const start = window.scrollY;
    const change = top - start;
    const duration = 500;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      window.scrollTo(0, start + change * ease);
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;
      smoothScrollTo(target.offsetTop - offset);
    }
  });
});
