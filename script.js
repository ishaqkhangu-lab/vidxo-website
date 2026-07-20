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
      const count = window.innerWidth < 700 ? 20 : 40;
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

  /* ==========================================================
     PORTFOLIO VIDEOS — how to add more of your own:
     1. Upload your video to YouTube (Public or Unlisted both work).
     2. Copy the video ID from the URL:
        https://youtu.be/e-1AQDQJOSs  ->  ID is "e-1AQDQJOSs"
        https://www.youtube.com/watch?v=e-1AQDQJOSs -> same ID, after "v="
     3. Add a new { title: '...', youtubeId: '...' } object to the list below.
        The thumbnail is pulled automatically from YouTube — no image upload needed.
  ========================================================== */
  const portfolioItems = [
    { title: 'T2F AI Automation', youtubeId: 'e-1AQDQJOSs' },
    { title: 'Sanative Vibez', youtubeId: 'oX7kshYCRjA' },
    { title: 'AI is Revolutionizing Hygiene', youtubeId: 'tUljDfxcIXU' },
    { title: 'HRC Directory', youtubeId: 'UA3uAYtBFuc' },
    { title: 'GPS Tracking', youtubeId: 'Auz08RudWYI' },
    { title: 'Answering Genius', youtubeId: '64xZPUUdlIA' }
  ];

  const portfolioGrid = document.getElementById('portfolioGrid');

  function renderPortfolio() {
    portfolioGrid.innerHTML = '';
    portfolioItems.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'p-card';
      card.setAttribute('data-reveal', '');
      card.innerHTML = `
        <img class="p-thumb" loading="lazy" src="https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg" alt="${item.title}">
        <div class="p-overlay"></div>
        <div class="p-play"><i class="fa-brands fa-youtube"></i></div>
        <div class="p-content">
          <div class="p-title">${item.title}</div>
        </div>
      `;
      card.addEventListener('click', () => openModal(item));
      portfolioGrid.appendChild(card);
      revealObserver.observe(card);
      setTimeout(() => card.classList.add('in-view'), 20 + idx * 40);
    });
  }
  renderPortfolio();

  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalDuration = document.getElementById('modalDuration');

  function openModal(item) {
    modalTitle.textContent = item.title;
    modalDuration.textContent = 'Watch on YouTube';
    modalVideo.src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    modalVideo.src = ''; // stops playback
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    formNote.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        formNote.textContent = "Thanks — we'll be in touch within 24 hours.";
        toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
        form.reset();
      } else {
        formNote.textContent = "Something went wrong — please email us directly at ishaqkhangu@gmail.com.";
      }
    } catch (err) {
      formNote.textContent = "Something went wrong — please email us directly at ishaqkhangu@gmail.com.";
    } finally {
      submitBtn.disabled = false;
    }
  });

})();
