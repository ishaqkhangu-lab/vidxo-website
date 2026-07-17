(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------
     NAV: scroll state, active link, mobile menu
  --------------------------------------------- */
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function onScrollNav(){
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileLinks.forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }));

  const sections = ['home','services','portfolio','process','testimonials','pricing','faq','contact']
    .map(id => document.getElementById(id)).filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  sections.forEach(s => navObserver.observe(s));

  /* ---------------------------------------------
     Cursor glow
  --------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    }, { passive: true });
  }

  /* ---------------------------------------------
     Button ripple position (radial highlight follows cursor)
  --------------------------------------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--ry', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ---------------------------------------------
     Service card mouse-follow glow
  --------------------------------------------- */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------------------------------------
     Hero panels: subtle parallax on mouse move
  --------------------------------------------- */
  const stage = document.getElementById('stage');
  if (stage && !reduceMotion && window.innerWidth > 900) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left - r.width / 2) / r.width;
      const py = (e.clientY - r.top - r.height / 2) / r.height;
      stage.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
    }, { passive: true });
    document.querySelector('.hero').addEventListener('mouseleave', () => {
      stage.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
    stage.style.transition = 'transform .4s ease-out';
    stage.style.transformStyle = 'preserve-3d';
  }

  /* ---------------------------------------------
     Waveform bars generation
  --------------------------------------------- */
  const waveform = document.getElementById('waveform');
  if (waveform) {
    const bars = 40;
    let html = '';
    for (let i = 0; i < bars; i++) {
      const h = 20 + Math.round(Math.random() * 80);
      html += `<span style="height:${h}%"></span>`;
    }
    waveform.innerHTML = html;
    if (!reduceMotion) {
      setInterval(() => {
        waveform.querySelectorAll('span').forEach(s => {
          s.style.height = (15 + Math.round(Math.random() * 85)) + '%';
        });
      }, 900);
    }
  }

  /* ---------------------------------------------
     Particle canvas (hero background)
  --------------------------------------------- */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
      const hero = document.querySelector('.hero');
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
    function initParticles() {
      const count = window.innerWidth < 700 ? 35 : 70;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,255,${p.alpha})`;
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(tick);
    }
    resize(); initParticles();
    if (!reduceMotion) requestAnimationFrame(tick); else tick();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  /* ---------------------------------------------
     Scroll reveal
  --------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), (i % 4) * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------
     Portfolio data + render + filter + modal
  --------------------------------------------- */
  const PLACEHOLDER_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  const portfolioItems = [
    { title: 'Aurora Timepiece Launch', category: 'Luxury Commercial', duration: '0:45', grad: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' },
    { title: 'Saffron Table Reel', category: 'Restaurant Advertisement', duration: '0:30', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { title: 'Maison Noir SS26', category: 'Fashion Brand', duration: '0:38', grad: 'linear-gradient(135deg,#ec4899,#8B5CF6)' },
    { title: 'Haven Residences Tour', category: 'Real Estate', duration: '1:10', grad: 'linear-gradient(135deg,#10b981,#3B82F6)' },
    { title: 'Vantage EV Reveal', category: 'Automobile', duration: '0:52', grad: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { title: 'Orbital Onboarding Walkthrough', category: 'SaaS Explainer', duration: '1:24', grad: 'linear-gradient(135deg,#8B5CF6,#3B82F6)' },
    { title: 'Ironclad Fitness Launch', category: 'Fitness Brand', duration: '0:40', grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
    { title: 'Meridian Clinic Story', category: 'Healthcare', duration: '0:58', grad: 'linear-gradient(135deg,#22d3ee,#3B82F6)' },
    { title: 'Nexora Platform Film', category: 'Technology', duration: '1:05', grad: 'linear-gradient(135deg,#3B82F6,#1e40af)' },
    { title: 'Stratus Capital Brand Film', category: 'Finance', duration: '0:48', grad: 'linear-gradient(135deg,#64748b,#8B5CF6)' },
    { title: 'Golden Hour Ad Set', category: 'Luxury Commercial', duration: '0:35', grad: 'linear-gradient(135deg,#eab308,#f97316)' },
    { title: 'Pulse SaaS Explainer', category: 'SaaS Explainer', duration: '1:15', grad: 'linear-gradient(135deg,#6366f1,#8B5CF6)' }
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');
  const filterBar = document.getElementById('portfolioFilters');

  function renderPortfolio(filter) {
    portfolioGrid.innerHTML = '';
    portfolioItems
      .filter(item => filter === 'all' || item.category === filter)
      .forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'p-card';
        card.setAttribute('data-reveal', '');
        card.innerHTML = `
          <div class="p-thumb" style="position:absolute;inset:0;background:${item.grad}"></div>
          <div class="p-overlay"></div>
          <div class="p-play"><i class="fa-solid fa-play"></i></div>
          <div class="p-content">
            <span class="p-category">${item.category}</span>
            <div class="p-title">${item.title}</div>
            <span class="p-duration">${item.duration}</span>
          </div>
        `;
        card.addEventListener('click', () => openModal(item));
        portfolioGrid.appendChild(card);
        revealObserver.observe(card);
        setTimeout(() => card.classList.add('in-view'), 20 + idx * 40);
      });
  }
  renderPortfolio('all');

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.pf-chip');
    if (!chip) return;
    filterBar.querySelectorAll('.pf-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderPortfolio(chip.dataset.filter);
  });

  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalDuration = document.getElementById('modalDuration');

  function openModal(item) {
    modalTitle.textContent = item.title;
    modalCategory.textContent = item.category;
    modalDuration.textContent = 'Duration · ' + item.duration;
    modalVideo.src = PLACEHOLDER_VIDEO;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    document.body.style.overflow = '';
  }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------------------------------------------
     Animated stat counters
  --------------------------------------------- */
  const statNums = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statObserver.observe(el));

  /* ---------------------------------------------
     Timeline fill on scroll
  --------------------------------------------- */
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timelineFill');
  if (timeline && timelineFill) {
    window.addEventListener('scroll', () => {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(Math.max((vh - r.top) / (r.height + vh * 0.4), 0), 1);
      timelineFill.style.width = (progress * 100) + '%';
    }, { passive: true });
  }

  /* ---------------------------------------------
     FAQ accordion
  --------------------------------------------- */
  document.querySelectorAll('.acc-item').forEach(item => {
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.acc-body').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------------------------------------------
     Testimonials — Swiper
  --------------------------------------------- */
  if (window.Swiper) {
    new Swiper('.testimonial-swiper', {
      loop: true,
      spaceBetween: 24,
      slidesPerView: 1,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  }

  /* ---------------------------------------------
     Contact form (static — no backend)
  --------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const toast = document.getElementById('toast');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = "Thanks — we'll be in touch within 24 hours.";
    toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
    form.reset();
  });

  /* ---------------------------------------------
     GSAP ScrollTrigger refresh (optional smooth extras)
  --------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

})();
