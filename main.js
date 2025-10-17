// main.js — slideshow + header scroll + timeline reveal + nav submenu + back-to-top
document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------
     Hero slideshow
     ------------------------- */
  const slides = Array.from(document.querySelectorAll('.hero-slideshow .slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-indicators .dot'));
  const hero = document.querySelector('.hero-slideshow');
  const heroTexts = Array.from(document.querySelectorAll('.hero-inner .hero-text'));

  let current = 0;
  let interval = null;
  const DELAY = 5000; // ms

  function setSlide(index) {
    if (!slides.length) return;
    const total = slides.length;
    const nextIndex = ((index % total) + total) % total;

    slides.forEach((s, i) => {
      const active = i === nextIndex;
      s.classList.toggle('visible', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    if (dots.length) {
      dots.forEach((d, i) => d.classList.toggle('active', i === nextIndex));
    }

    // sync hero text
    if (heroTexts.length) {
      heroTexts.forEach((t, i) => {
        const active = i === nextIndex;
        t.hidden = !active;
        t.setAttribute('aria-hidden', active ? 'false' : 'true');
        t.classList.toggle('fade-in', active);
      });
    }

    current = nextIndex;
  }

  function next() { setSlide(current + 1); }
  function prev() { setSlide(current - 1); }

  function start() {
    stop();
    if (slides.length > 1) interval = setInterval(next, DELAY);
  }
  function stop() {
    if (interval) { clearInterval(interval); interval = null; }
  }

  if (slides.length) {
    // dots: click + keyboard
    if (dots.length) {
      dots.forEach(d => {
        d.addEventListener('click', () => {
          const idx = Number(d.getAttribute('data-index'));
          if (!Number.isNaN(idx)) { setSlide(idx); start(); }
        });
        d.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const idx = Number(d.getAttribute('data-index'));
            if (!Number.isNaN(idx)) { setSlide(idx); start(); }
          }
        });
      });
    }

    // pause on hover (desktop)
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      // arrow-key navigation when hero is focused
      hero.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); start(); }
        if (e.key === 'ArrowLeft')  { prev(); start(); }
      });
      hero.setAttribute('tabindex', '-1'); // allow programmatic focus if needed
    }

    // pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // init
    setSlide(0);
    start();
  }

  /* -------------------------
     Header scroll effect (toggle .scrolled)
     ------------------------- */
  (function headerScroll() {
    const header = document.getElementById('pageHeader') || document.querySelector('.top-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* -------------------------
     Timeline reveal (IntersectionObserver)
     ------------------------- */
  (function timelineReveal() {
    const items = document.querySelectorAll('.overview-timeline .timeline-item');
    if (!items || items.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target); // reveal once
        }
      });
    }, { threshold: 0.22 });

    items.forEach(item => io.observe(item));
  })();

  /* -------------------------
     Nav: Conference submenu
     ------------------------- */
  (function navSubmenu() {
    const menuRoots = document.querySelectorAll('.nav-center .has-submenu');
    if (!menuRoots.length) return;

    function closeAll(except) {
      menuRoots.forEach(root => {
        if (root !== except) {
          const btn = root.querySelector('.nav-link[aria-expanded="true"]');
          const sub = root.querySelector('.submenu');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          if (sub) sub.style.display = 'none';
        }
      });
    }

    menuRoots.forEach(root => {
      const btn = root.querySelector('.nav-link');
      const sub = root.querySelector('.submenu');
      if (!btn || !sub) return;

      // initial state
      btn.setAttribute('aria-expanded', 'false');
      sub.style.display = 'none';

      // click/tap toggle
      btn.addEventListener('click', (e) => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll(root);
        btn.setAttribute('aria-expanded', String(!expanded));
        sub.style.display = expanded ? 'none' : 'block';
        if (!expanded) {
          // move focus to first link for accessibility
          const firstItem = sub.querySelector('a,button');
          if (firstItem) firstItem.focus({ preventScroll: true });
        }
      });

      // keyboard: ESC to close
      root.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          btn.setAttribute('aria-expanded', 'false');
          sub.style.display = 'none';
          btn.focus({ preventScroll: true });
        }
      });
    });

    // click outside to close
    document.addEventListener('click', (e) => {
      const anyOpen = document.querySelector('.nav-center .has-submenu .nav-link[aria-expanded="true"]');
      if (anyOpen && !anyOpen.parentElement.contains(e.target)) closeAll();
    });
  })();

}); // DOMContentLoaded


/* -------------------------
   Back to top button behaviour
   ------------------------- */
(function backToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggle() {
    if (window.scrollY > 320) btn.classList.add('show');
    else btn.classList.remove('show');
  }
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.blur();
  });
})();


// Smooth scroll to contact section when clicking "Contact" nav link
document.addEventListener('DOMContentLoaded', () => {
  const contactLink = document.querySelector('nav a[href="#contact"]');
  if (contactLink) {
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});

