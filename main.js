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

    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); start(); }
        if (e.key === 'ArrowLeft')  { prev(); start(); }
      });
      hero.setAttribute('tabindex', '-1');
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

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
     Header solid switch (after hero)
     Makes header solid when you're past the hero/top banner
     ------------------------- */
  (function headerSolidSwitch() {
    const header = document.getElementById('pageHeader') || document.querySelector('.top-header');
    if (!header) return;

    // Observe either the slideshow hero or the simple .topimage banner (tracks page, etc.)
    const heroSection = document.querySelector('.hero-slideshow, .topimage');

    // If no hero exists on the page, just keep header solid
    if (!heroSection) {
      header.classList.add('solid');
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      // When the hero is visible near the top, keep header transparent;
      // once it's out of view, make header solid for readability.
      if (entry.isIntersecting) {
        header.classList.remove('solid');
      } else {
        header.classList.add('solid');
      }
    }, { rootMargin: '-72px 0px 0px 0px' });

    io.observe(heroSection);
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
          io.unobserve(entry.target);
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

      btn.setAttribute('aria-expanded', 'false');
      sub.style.display = 'none';

      btn.addEventListener('click', (e) => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        closeAll(root);
        btn.setAttribute('aria-expanded', String(!expanded));
        sub.style.display = expanded ? 'none' : 'block';
        if (!expanded) {
          const firstItem = sub.querySelector('a,button');
          if (firstItem) firstItem.focus({ preventScroll: true });
        }
      });

      root.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          btn.setAttribute('aria-expanded', 'false');
          sub.style.display = 'none';
          btn.focus({ preventScroll: true });
        }
      });
    });

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

// Countdown for ARIIA 2026
(function countdownInit(){
  const el = document.querySelector('.info-bar .countdown');
  if (!el) return;

  const targetStr = el.getAttribute('data-date');
  const target = new Date(targetStr);

  const dEl = el.querySelector('.cd-d');
  const hEl = el.querySelector('.cd-h');
  const mEl = el.querySelector('.cd-m');
  const sEl = el.querySelector('.cd-s');

  const pad = n => String(n).padStart(2,'0');

  function tick(){
    const now = new Date();
    let diff = Math.max(0, target - now);

    const d = Math.floor(diff / (1000*60*60*24)); diff %= 1000*60*60*24;
    const h = Math.floor(diff / (1000*60*60));    diff %= 1000*60*60;
    const m = Math.floor(diff / (1000*60));       diff %= 1000*60;
    const s = Math.floor(diff / 1000);

    dEl.textContent = d;
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

