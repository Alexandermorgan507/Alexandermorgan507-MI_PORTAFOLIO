/* ==========================================================================
   ALEXANDER MORGAN — PORTFOLIO INTERACTIVITY & SCROLL ENGINE (custom.js)
   Features:
   - Top Scroll Progress Indicator (rAF optimized)
   - IntersectionObserver Reveal & Stagger Animations
   - Animated Skill Progress Bars + Numeric Counter
   - Subtle Decorative Parallax (respects prefers-reduced-motion)
   - Smooth Section Navigation & Active Spy
   - Zero-Jump Portfolio Filtering + Fancybox Lightbox
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. STAGGER SETUP & INTERSECTION OBSERVER REVEALS
     ------------------------------------------------------------------------ */
  function initScrollReveals() {
    var staggerGroups = document.querySelectorAll('[data-stagger]');
    for (var g = 0; g < staggerGroups.length; g++) {
      var step = parseInt(staggerGroups[g].getAttribute('data-stagger'), 10) || 85;
      var items = staggerGroups[g].querySelectorAll('[data-reveal]');
      for (var i = 0; i < items.length; i++) {
        items[i].style.setProperty('--reveal-delay', (i * step) + 'ms');
      }
    }

    var revealElements = document.querySelectorAll('[data-reveal]');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      for (var k = 0; k < revealElements.length; k++) {
        revealElements[k].classList.add('is-visible');
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        for (var idx = 0; idx < entries.length; idx++) {
          if (entries[idx].isIntersecting) {
            entries[idx].target.classList.add('is-visible');
            obs.unobserve(entries[idx].target);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12
      }
    );

    for (var m = 0; m < revealElements.length; m++) {
      observer.observe(revealElements[m]);
    }
  }

  /* ------------------------------------------------------------------------
     2. ANIMATED SKILL PROGRESS BARS
     ------------------------------------------------------------------------ */
  function animateCounter(el, targetValue, duration) {
    if (prefersReducedMotion) {
      el.textContent = targetValue + '%';
      return;
    }
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * targetValue) + '%';
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = targetValue + '%';
      }
    }
    window.requestAnimationFrame(step);
  }

  function initSkillBars() {
    var skillsContainer = document.getElementById('skills-bars-wrapper');
    if (!skillsContainer) return;

    var fills = skillsContainer.querySelectorAll('.skill-bar-fill');

    function fillAllBars() {
      for (var i = 0; i < fills.length; i++) {
        (function (bar, index) {
          var level = parseInt(bar.getAttribute('data-level'), 10) || 0;
          var pctLabel = bar.closest('.skill-bar-item').querySelector('.skill-bar-pct');
          setTimeout(function () {
            bar.style.width = level + '%';
            if (pctLabel) {
              animateCounter(pctLabel, level, 1200);
            }
          }, prefersReducedMotion ? 0 : index * 110);
        })(fills[i], i);
      }
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      fillAllBars();
      return;
    }

    var barObserver = new IntersectionObserver(
      function (entries, obs) {
        if (entries[0].isIntersecting) {
          fillAllBars();
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    barObserver.observe(skillsContainer);
  }

  /* ------------------------------------------------------------------------
     3. SCROLL PROGRESS, STICKY HEADER, ACTIVE NAV & LIGHT PARALLAX
     ------------------------------------------------------------------------ */
  function initScrollEffects() {
    var progressBar = document.getElementById('scroll-progress');
    var header = document.querySelector('.header');
    var topBtn = document.querySelector('.topHome');
    var parallaxNodes = document.querySelectorAll('[data-parallax]');
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('#mainNav li');

    var ticking = false;

    function updateOnScroll() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var docHeight =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) - window.innerHeight;

      /* Top Scroll Progress Indicator */
      if (progressBar) {
        var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        progressBar.style.width = pct.toFixed(2) + '%';
      }

      /* Header Glass Background */
      if (header) {
        if (scrollTop > 40) {
          header.classList.add('scrolled', 'addBg');
        } else {
          header.classList.remove('scrolled', 'addBg');
        }
      }

      /* Back-to-top visibility */
      if (topBtn) {
        if (scrollTop > 420) {
          topBtn.classList.add('visible');
        } else {
          topBtn.classList.remove('visible');
        }
      }

      /* Active Section Spy */
      var spyOffset = scrollTop + 160;
      var currentSectionId = 'home';
      for (var s = 0; s < sections.length; s++) {
        var sec = sections[s];
        if (sec.offsetTop <= spyOffset) {
          currentSectionId = sec.getAttribute('id');
        }
      }

      for (var n = 0; n < navLinks.length; n++) {
        var link = navLinks[n].querySelector('a.scroll-link');
        if (link) {
          var href = link.getAttribute('href');
          if (href === '#' + currentSectionId) {
            navLinks[n].classList.add('active');
          } else {
            navLinks[n].classList.remove('active');
          }
        }
      }

      /* Subtle Parallax on Decorative Elements (Desktop/Tablet only) */
      if (!prefersReducedMotion && window.innerWidth >= 768 && parallaxNodes.length) {
        for (var p = 0; p < parallaxNodes.length; p++) {
          var speed = parseFloat(parallaxNodes[p].getAttribute('data-parallax')) || 0.08;
          var yPos = Math.round(scrollTop * speed);
          parallaxNodes[p].style.transform = 'translate3d(0, ' + yPos + 'px, 0)';
        }
      }

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateOnScroll);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateOnScroll();
  }

  /* ------------------------------------------------------------------------
     4. SMOOTH ANCHOR NAVIGATION & MOBILE COLLAPSE HANDLING
     ------------------------------------------------------------------------ */
  function initSmoothNavigation() {
    var scrollLinks = document.querySelectorAll('a.scroll-link, a.topHome');
    var navCollapse = document.getElementById('main-nav');

    for (var i = 0; i < scrollLinks.length; i++) {
      scrollLinks[i].addEventListener('click', function (e) {
        var targetAttr = this.getAttribute('href');
        if (!targetAttr || targetAttr.charAt(0) !== '#') return;

        var targetEl =
          targetAttr === '#top'
            ? document.body
            : document.querySelector(targetAttr);

        if (targetEl) {
          e.preventDefault();
          var headerOffset = 72;
          var targetY =
            targetAttr === '#top'
              ? 0
              : targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          /* Close mobile menu if open */
          if (navCollapse && navCollapse.classList.contains('in')) {
            if (window.jQuery) {
              window.jQuery(navCollapse).collapse('hide');
            } else {
              navCollapse.classList.remove('in');
            }
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. ZERO-JUMP PORTFOLIO FILTERING & FANCYBOX
     ------------------------------------------------------------------------ */
  function initPortfolioFilter() {
    var filterButtons = document.querySelectorAll('#filter a');
    var projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    for (var i = 0; i < filterButtons.length; i++) {
      filterButtons[i].addEventListener('click', function (e) {
        e.preventDefault();
        for (var b = 0; b < filterButtons.length; b++) {
          filterButtons[b].classList.remove('current');
        }
        this.classList.add('current');

        var selector = this.getAttribute('data-filter') || '*';
        var className = selector.charAt(0) === '.' ? selector.slice(1) : '';

        for (var c = 0; c < projectCards.length; c++) {
          var card = projectCards[c];
          var matches = selector === '*' || card.classList.contains(className);

          if (matches) {
            card.classList.remove('is-hidden');
            if (!prefersReducedMotion) {
              card.style.opacity = '0';
              card.style.transform = 'translate3d(0, 16px, 0)';
              (function (el) {
                window.requestAnimationFrame(function () {
                  window.requestAnimationFrame(function () {
                    el.style.opacity = '1';
                    el.style.transform = '';
                  });
                });
              })(card);
            }
          } else {
            card.classList.add('is-hidden');
          }
        }
      });
    }
  }

  function initFancybox() {
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.fancybox) {
      window.jQuery('.fancybox').fancybox({
        padding: 6,
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     6. BOOTSTRAP ALL MODULES ON DOM READY
     ------------------------------------------------------------------------ */
  function initAll() {
    initScrollReveals();
    initSkillBars();
    initScrollEffects();
    initSmoothNavigation();
    initPortfolioFilter();
    initFancybox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
