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
  const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
  if (href && href === currentPage) a.classList.add('active');
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
    const shown    = decimals ? current.toFixed(decimals) : Math.round(current).toLocaleString('en-IN');
    el.textContent = prefix + shown + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Metric tile label -> field in data/metrics.json.
// "Publications" is Google Scholar's indexed-item count, which is the headline
// figure the site quotes. The ORCID fields stay available for any tile that
// wants the narrower peer-reviewed-journal count instead.
const METRIC_LABEL_MAP = {
  'h-index':           'h_index',
  'i10-index':         'i10_index',
  'Citations':         'citations',
  'Publications':      'scholar_items',
  'Journal Articles':  'orcid_journal_articles',
  'Indexed Works':     'orcid_works',
  'WoS Documents':     'wos_documents'
};

// Patch a single metric-num element with a live value
function patchMetricEl(el, val) {
  if (val == null || isNaN(val)) return;
  const prefix  = el.dataset.prefix  || '';
  const suffix  = el.dataset.suffix  || '';
  el.dataset.target = String(val);
  if (el.dataset.done) {
    // Counter already animated — update text directly
    el.textContent = prefix + (val >= 1000 ? val.toLocaleString() : val) + suffix;
  }
  // else: counter will pick up the updated data-target when it fires
}

// Apply fetched metrics to all matching elements on the page
function applyMetrics(data) {
  document.querySelectorAll('.metric-item').forEach(function (item) {
    const label = item.querySelector('.metric-label');
    const num   = item.querySelector('.metric-num');
    if (!label || !num) return;
    const key = METRIC_LABEL_MAP[label.textContent.trim()];
    if (key && data[key] != null) patchMetricEl(num, data[key]);
  });

  // Inline prose figures: <span data-scholar="citations">1,836</span>
  document.querySelectorAll('[data-scholar]').forEach(function (el) {
    var k = el.getAttribute('data-scholar');
    if (data[k] != null && !isNaN(data[k])) {
      el.textContent = Number(data[k]).toLocaleString('en-IN');
    }
  });

  // Provenance line: which source each figure came from, and when
  if (data.last_updated) {
    // Name the sources, not competing counts — a second number beside the
    // headline figure only invites the question of which one is right.
    var src = [];
    if (data.scholar_items != null) src.push('Google Scholar');
    if (data.orcid_works != null)   src.push('ORCID');
    if (data.wos_documents != null) src.push('Web of Science');
    var line = 'Source: ' + src.join(', ') + ' \u00b7 updated ' + data.last_updated;
    document.querySelectorAll('[data-metrics-updated]').forEach(function (el) {
      el.textContent = line;
    });
    document.querySelectorAll('[data-scholar-updated]').forEach(function (el) {
      el.textContent = 'Scholar: ' + data.last_updated;
    });
  }
}

// ---- SCHOLAR AUTO-FETCH ----
// Reads /data/scholar_metrics.json (updated weekly by GitHub Actions).
// Falls back silently to hardcoded HTML values if the fetch fails.
// Fetch is started immediately but applied with a short delay so it
// doesn't block the initial render.
(function () {
  function load(url) {
    return fetch(url).then(function (r) {
      return r.ok ? r.json() : Promise.reject(new Error(url + ' ' + r.status));
    });
  }
  load('data/metrics.json')
    .catch(function () { return load('data/scholar_metrics.json'); })
    .then(function (data) { applyMetrics(data); })
    .catch(function () { /* keep the values baked into the HTML */ });
})();

// ---- COUNTER OBSERVER (set up after fetch is initiated) ----
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
      const top = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(top - offset);
    }
  });
});
