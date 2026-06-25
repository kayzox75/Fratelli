(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky header background on scroll ---- */
  var header = document.getElementById('site-header');
  function updateHeader() {
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  navToggle.addEventListener('click', function () {
    var isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mainNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---- Menu tabs ---- */
  var tabs = document.querySelectorAll('.menu-tab');
  var panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.getAttribute('data-target');

      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(function (panel) {
        if (panel.id === targetId) {
          panel.hidden = false;
          panel.classList.add('is-active');
        } else {
          panel.hidden = true;
          panel.classList.remove('is-active');
        }
      });
    });
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Hero : vidéo qui s'agrandit au scroll (scroll-expand) ---- */
  var ehSection = document.querySelector('[data-expand-hero]');
  if (ehSection && !prefersReducedMotion) {
    var ehMedia = ehSection.querySelector('[data-eh-media]');
    var ehBg = ehSection.querySelector('[data-eh-bg]');
    var ehWordL = ehSection.querySelector('[data-eh-word-left]');
    var ehWordR = ehSection.querySelector('[data-eh-word-right]');
    var ehTitles = ehSection.querySelector('[data-eh-titles]');
    var ehCaption = ehSection.querySelector('[data-eh-caption]');
    var ehHint = ehSection.querySelector('[data-eh-hint]');

    ehSection.classList.add('eh-active');

    var ehMobile = window.innerWidth < 768;
    var ehTicking = false;

    function ehApply(p) {
      // Taille de la vidéo (interpolation, plafonnée en CSS via min())
      var w = 300 + p * (ehMobile ? 620 : 1240);
      var h = 360 + p * (ehMobile ? 220 : 380);
      ehMedia.style.width = 'min(95vw, ' + w + 'px)';
      ehMedia.style.height = 'min(86vh, ' + h + 'px)';

      // Le fond s'estompe
      if (ehBg) ehBg.style.opacity = String(1 - p * 0.92);

      // Le titre se sépare puis disparaît
      var tx = p * (ehMobile ? 62 : 46);
      ehWordL.style.transform = 'translateX(-' + tx + 'vw)';
      ehWordR.style.transform = 'translateX(' + tx + 'vw)';
      ehTitles.style.opacity = String(Math.max(0, 1 - p / 0.55));

      // La légende apparaît en fin de course
      var capOpacity = p < 0.82 ? 0 : (p - 0.82) / 0.18;
      ehCaption.style.opacity = String(capOpacity);
      ehCaption.style.pointerEvents = capOpacity > 0.5 ? 'auto' : 'none';

      // L'indice de défilement s'efface
      if (ehHint) ehHint.style.opacity = String(Math.max(0, 1 - p * 5));
    }

    function ehUpdate() {
      var rect = ehSection.getBoundingClientRect();
      var total = ehSection.offsetHeight - window.innerHeight;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var p = total > 0 ? scrolled / total : 0;
      ehApply(p);
      ehTicking = false;
    }

    function ehRequest() {
      if (!ehTicking) {
        ehTicking = true;
        window.requestAnimationFrame(ehUpdate);
      }
    }

    window.addEventListener('scroll', ehRequest, { passive: true });
    window.addEventListener('resize', function () {
      ehMobile = window.innerWidth < 768;
      ehRequest();
    }, { passive: true });

    ehApply(0);
  }
})();
