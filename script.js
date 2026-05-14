/**
 * script.js — Mangalam HDPE Pipes Product Page
 *
 * Modules (in order of execution):
 *   1. initNavbar          — Sticky scroll shadow on the nav
 *   2. initStickyBar       — Announcement bar: slide-in after first fold, slide out on scroll up
 *   3. initMobileMenu      — Hamburger toggle with focus-trap on Escape
 *   4. initDropdown        — Products mega-drop accessible keyboard
 *   5. initGallery         — Image carousel (prev/next, thumbs, swipe, keyboard)
 *   6. initAppsCarousel    — Applications card slider (responsive breakpoints)
 *   7. initFAQ             — Accordion (one-open-at-a-time)
 *   8. initCatalogueForm   — Email download gate with basic validation
 *   9. initMfgTabs         — Manufacturing process tab panels
 *  10. initTestimonials     — Drag-to-scroll testimonial track
 *  11. initSmoothScroll    — Offset anchor scroll (accounts for sticky nav)
 *  12. initForm            — Contact form validation + success feedback
 *  13. initReveal          — IntersectionObserver scroll-reveal animation
 *  14. initModal           — Modal open/close with body scroll lock
 */
(function () {
  'use strict';

  /** Shorthand querySelector helpers */
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

  /* ============================================================
     1. NAVBAR — add .scrolled shadow on scroll
  ============================================================ */
  function initNavbar() {
    const navbar = $('#navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ============================================================
     2. STICKY BAR
     - Triggers after user scrolls past first viewport height (first fold)
     - Slides down + fades in via CSS transition (.is-visible class)
     - Offsets the sticky navbar's top position to sit below the bar
     - Uses requestAnimationFrame for scroll-performance
  ============================================================ */
  function initStickyBar() {
    const bar    = $('#stickyBar');
    const navbar = $('#navbar');
    const BAR_H  = 52; // must match .sticky-bar { height } in CSS
    if (!bar) return;

    let ticking = false;

    function update() {
      const isPastFold = window.scrollY > window.innerHeight;

      // Toggle visibility class (CSS handles the animation)
      bar.classList.toggle('is-visible', isPastFold);

      // Accessibility: hide from screen readers when not visible
      bar.setAttribute('aria-hidden', String(!isPastFold));

      // Push the sticky navbar down so it sits below the bar
      if (navbar) {
        navbar.style.top = isPastFold ? `${BAR_H}px` : '0px';
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    // Run once on load in case the page is already scrolled
    update();
  }

  /* ============================================================
     3. MOBILE MENU
  ============================================================ */
  function initMobileMenu() {
    const btn = $('#hamburger');
    const menu = $('#mobileNav');
    if (!btn || !menu) return;

    function toggle(open) {
      btn.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
    $$('.mobile-nav__link, .mobile-nav .btn').forEach(el => {
      el.addEventListener('click', () => toggle(false));
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* ============================================================
     4. PRODUCTS DROPDOWN
  ============================================================ */
  function initDropdown() {
    const dropdown = $('#productsDropdown');
    const btn = $('#productsBtn');
    const menu = $('#dropdownMenu');
    if (!dropdown || !btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============================================================
     5. PRODUCT IMAGE GALLERY
     - Prev/Next arrows
     - Thumbnail clicks
     - Touch / swipe
     - Keyboard (←→)
  ============================================================ */
  function initGallery() {
    const track = $('#galleryTrack');
    const thumbsContainer = $('#galleryThumbs');
    const prevBtn = $('#galleryPrev');
    const nextBtn = $('#galleryNext');
    if (!track) return;

    const slides = $$('.gallery__slide', track);
    const thumbs = thumbsContainer ? $$('.gallery__thumb', thumbsContainer) : [];
    let current = 0;

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, slides.length - 1));
      track.style.transform = `translateX(-${current * 100}%)`;

      // Update thumbs
      thumbs.forEach((th, i) => {
        th.classList.toggle('is-active', i === current);
        th.setAttribute('aria-selected', String(i === current));
      });

      // Button states
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => goTo(i));
    });

    // Keyboard support
    track.parentElement.setAttribute('tabindex', '0');
    track.parentElement.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    // Touch / swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    goTo(0);

    // Auto-advance (optional, uncomment to enable)
    // setInterval(() => goTo((current + 1) % slides.length), 5000);
  }

  /* ============================================================
     6. APPLICATIONS CAROUSEL
  ============================================================ */
  function initAppsCarousel() {
    const track = $('#appsTrack');
    const prevBtn = $('#appsPrev');
    const nextBtn = $('#appsNext');
    if (!track) return;

    const cards = $$('.apps-card', track);
    let current = 0;
    // Show 4 cards at a time on desktop, 1 on mobile
    function getVisible() {
      return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
    }

    function goTo(idx) {
      const visible = getVisible();
      const max = Math.max(0, cards.length - visible);
      current = Math.max(0, Math.min(idx, max));
      const cardW = cards[0] ? cards[0].offsetWidth + 16 : 0;
      track.style.transform = `translateX(-${current * cardW}px)`;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= max;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    window.addEventListener('resize', () => goTo(current));
    goTo(0);
  }

  /* ============================================================
     7. FAQ ACCORDION
  ============================================================ */
  function initFAQ() {
    const items = $$('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        // Close all
        items.forEach(i => {
          i.classList.remove('is-open');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        // Open clicked (toggle)
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================================
     7. CATALOGUE FORM — email validation with visual feedback
  ============================================================ */
  function initCatalogueForm() {
    const form = $('#catalogueForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = $('#catalogueEmail', form);
      const btn = $('#catalogueSubmit', form);
      if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }
      const orig = btn.textContent;
      btn.textContent = '✓ Catalogue Sent!';
      btn.style.background = '#16a34a';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  }

  /* ============================================================
     10. MANUFACTURING PROCESS TABS
  ============================================================ */
  function initMfgTabs() {
    const tabs = $$('.mfg-tab');
    const panels = $$('.mfg-panel');
    if (!tabs.length || !panels.length) return;

    let current = 0;

    function goTo(idx) {
      idx = Math.max(0, Math.min(idx, tabs.length - 1));
      current = idx;

      tabs.forEach((t, i) => {
        t.classList.toggle('is-active', i === current);
        t.setAttribute('aria-selected', String(i === current));
      });
      panels.forEach((p, i) => p.classList.toggle('is-active', i === current));
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => goTo(i));
    });

    // Wire image overlay arrows — use event delegation on the panels container
    $$('.mfg-panel').forEach(panel => {
      panel.addEventListener('click', e => {
        const prev = e.target.closest('.mfg-img-arrow--prev');
        const next = e.target.closest('.mfg-img-arrow--next');
        if (prev) goTo(current - 1);
        if (next) goTo(current + 1);
      });
    });

    goTo(0);
  }


  /* ============================================================
     9. SMOOTH ANCHOR SCROLL (accounts for sticky navbar height)
  ============================================================ */
  function initSmoothScroll() {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     11. CONTACT FORM — field validation + success state feedback
  ============================================================ */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      $$('.form-input', form).forEach(input => { input.style.borderColor = ''; });

      $$('[required]', form).forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#ef4444';
          valid = false;
        }
      });

      const emailField = $('#email', form);
      if (emailField && emailField.value && !emailField.value.includes('@')) {
        emailField.style.borderColor = '#ef4444';
        valid = false;
      }

      if (!valid) return;

      const btn = $('#submitBtn');
      const original = btn.textContent;
      btn.textContent = '✓ Enquiry Sent!';
      btn.style.background = '#16a34a';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  }

  /* ============================================================
     8. SCROLL REVEAL — fade-in on scroll using IntersectionObserver
  ============================================================ */
  function initReveal() {
    const style = document.createElement('style');
    style.textContent = `
      .reveal{opacity:0;transform:translateY(24px);transition:opacity .5s ease,transform .5s ease;}
      .reveal.visible{opacity:1;transform:translateY(0);}
    `;
    document.head.appendChild(style);

    const els = $$('.specs-table__row, .cert-badge, .feature-item, .price-card, .trust-logo, .contact-form, .feature-card, .apps-card, .faq-item, .catalogue-cta, .testi-card, .portfolio-card');
    els.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => observer.observe(el));
  }

  /* ============================================================
     11. TESTIMONIALS — drag to scroll
  ============================================================ */
  function initTestimonials() {
    const track = $('#testimonialsTrack');
    if (!track) return;
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup',    () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.4;
      track.scrollLeft = scrollLeft - walk;
    });
  }
  /* ============================================================
     14. MODAL LOGIC
  ============================================================ */
  function initModal() {
    const triggers = $$('[data-modal-trigger]');
    const closeBtns = $$('.modal-close');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-trigger');
        const modal = $(`#${modalId}`);
        if (modal) {
          modal.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on overlay click
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = $('.modal-overlay.is-open');
        if (openModal) {
          openModal.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      }
    });
  }


  /* ============================================================
     DATASHEET FORM — email validation with success feedback
  ============================================================ */
  function initDatasheetForm() {
    const form = $('#datasheetForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const emailInput = $('#datasheetEmail', form);
      const btn = $('#datasheetSubmitBtn', form);
      if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }
      const orig = btn.textContent;
      btn.textContent = '✓ Sent! Check your inbox.';
      btn.style.background = '#16a34a';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
        // Close the modal
        const overlay = btn.closest('.modal-overlay');
        if (overlay) {
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      }, 3500);
    });
  }

  /* ============================================================
     15. IMAGE ZOOM
  ============================================================ */
  function initImageZoom() {
    const viewport = $('#galleryViewport');
    const lens = $('#zoomLens');
    const result = $('#zoomResult');
    const track = $('#galleryTrack');
    
    if (!viewport || !lens || !result || !track) return;

    const ZOOM_RATIO = 2.5;

    function getActiveImg() {
      const activeThumb = $('.gallery__thumb.is-active');
      const idx = activeThumb ? parseInt(activeThumb.getAttribute('data-index')) : 0;
      const slides = $$('.gallery__slide img', track);
      return slides[idx];
    }

    viewport.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 768) return; // Disable on mobile
      
      const img = getActiveImg();
      if (!img) return;

      lens.classList.add('is-active');
      result.classList.add('is-active');
      result.style.backgroundImage = `url('${img.src}')`;
      
      const vw = viewport.offsetWidth;
      const vh = viewport.offsetHeight;
      const rw = result.offsetWidth;
      const rh = result.offsetHeight;

      const lensW = rw / ZOOM_RATIO;
      const lensH = rh / ZOOM_RATIO;
      
      lens.style.width = `${lensW}px`;
      lens.style.height = `${lensH}px`;
      result.style.backgroundSize = `${vw * ZOOM_RATIO}px ${vh * ZOOM_RATIO}px`;
    });

    viewport.addEventListener('mouseleave', () => {
      lens.classList.remove('is-active');
      result.classList.remove('is-active');
    });

    viewport.addEventListener('mousemove', e => {
      if (window.innerWidth <= 768 || !lens.classList.contains('is-active')) return;

      const rect = viewport.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const lensW = lens.offsetWidth;
      const lensH = lens.offsetHeight;

      let lx = x - (lensW / 2);
      let ly = y - (lensH / 2);

      if (lx < 0) lx = 0;
      if (ly < 0) ly = 0;
      if (lx > rect.width - lensW) lx = rect.width - lensW;
      if (ly > rect.height - lensH) ly = rect.height - lensH;

      lens.style.left = `${lx}px`;
      lens.style.top = `${ly}px`;

      result.style.backgroundPosition = `-${lx * ZOOM_RATIO}px -${ly * ZOOM_RATIO}px`;
    });
  }

  /* ============================================================
     INIT ALL
  ============================================================ */
  function init() {
    initNavbar();
    initStickyBar();
    initMobileMenu();
    initDropdown();
    initGallery();
    initImageZoom();
    initAppsCarousel();
    initFAQ();
    initCatalogueForm();
    initMfgTabs();
    initTestimonials();
    initSmoothScroll();
    initForm();
    initReveal();
    initModal();
    initDatasheetForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
