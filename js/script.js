/**
 * ==========================================================================
 * PAKISTAN ZINDABAD — 14 AUGUST 1947
 * Independence Day Celebration Portal - Master JavaScript Engine
 * Technologies: Pure Vanilla ES6+ JavaScript, Web Audio API, Canvas 2D
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. GLOBAL CONFIGURATION & AUDIO SYNTHESIZER (WEB AUDIO API)
     -------------------------------------------------------------------------- */
  const state = {
    audioEnabled: true,
    audioCtx: null,
    lightboxIndex: 0,
    galleryData: []
  };

  // Initialize Web Audio context on user gesture
  function initAudio() {
    if (!state.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        state.audioCtx = new AudioContext();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  // Synthesize Celebration Fanfare (Chords + Trumpet-like harmonics)
  function playFanfareSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!state.audioCtx) return;

      const now = state.audioCtx.currentTime;
      // Majestic patriotic chord notes in Hz (C Major triumphant sequence: C4, E4, G4, C5)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];

      notes.forEach((freq, index) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        // Amplitude Envelope
        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(state.audioCtx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 1.0);
      });
    } catch (e) {
      console.warn('Audio playback not supported or restricted:', e);
    }
  }

  // Synthesize Firework Burst Pop & Sparkle
  function playFireworkSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!state.audioCtx) return;

      const now = state.audioCtx.currentTime;
      
      // Noise burst for explosion
      const bufferSize = state.audioCtx.sampleRate * 0.3;
      const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = state.audioCtx.createBufferSource();
      noise.buffer = buffer;

      // Filter to simulate low thud
      const filter = state.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      const gain = state.audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(state.audioCtx.destination);

      noise.start(now);
    } catch (e) {
      // Ignore silent error
    }
  }

  // Audio Toggle Button
  const soundToggleBtn = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      if (state.audioEnabled) {
        initAudio();
        soundIcon.textContent = '🔊';
        soundToggleBtn.querySelector('.sound-label').textContent = 'Audio FX';
        playFanfareSound();
      } else {
        soundIcon.textContent = '🔇';
        soundToggleBtn.querySelector('.sound-label').textContent = 'Muted';
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. BACKGROUND CANVAS (FIREWORKS & FLOATING GLOW PARTICLES ENGINE)
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Particle Palette
    const colors = [
      '#00FF87', // Neon Mint
      '#FFD700', // Gold
      '#FFFFFF', // White
      '#048239', // Flag Green
      '#FFE566', // Light Gold
      '#4EFA8B'  // Lime
    ];

    // Floating Ambient Particles
    class FloatingParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 50;
        this.size = Math.random() * 2.5 + 1;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.7 + 0.3;
        this.pulse = Math.random() * Math.PI;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.pulse) * 0.3;
        this.pulse += 0.02;
        if (this.y < -10) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Fireworks Rocket & Particle Sparks
    class Spark {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.06;
        this.friction = 0.97;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.012;
        this.size = Math.random() * 2.5 + 1;
      }
      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Firework {
      constructor(targetX, targetY) {
        this.x = targetX || Math.random() * (width * 0.8) + width * 0.1;
        this.y = height;
        this.targetY = targetY || Math.random() * (height * 0.5) + height * 0.1;
        this.speed = Math.random() * 4 + 7;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.exploded = false;
        this.sparks = [];
      }
      update() {
        if (!this.exploded) {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += 0.08; // slight drag
          if (this.vy >= -1 || this.y <= this.targetY) {
            this.explode();
          }
        } else {
          for (let i = this.sparks.length - 1; i >= 0; i--) {
            this.sparks[i].update();
            if (this.sparks[i].alpha <= 0) {
              this.sparks.splice(i, 1);
            }
          }
        }
      }
      explode() {
        this.exploded = true;
        const sparkCount = Math.floor(Math.random() * 35) + 35;
        for (let i = 0; i < sparkCount; i++) {
          this.sparks.push(new Spark(this.x, this.y, this.color));
        }
        playFireworkSound();
      }
      draw() {
        if (!this.exploded) {
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          this.sparks.forEach(s => s.draw());
        }
      }
      isDead() {
        return this.exploded && this.sparks.length === 0;
      }
    }

    // Particle pool setup
    const floatingCount = window.innerWidth < 768 ? 30 : 65;
    const floatingParticles = Array.from({ length: floatingCount }, () => new FloatingParticle());
    const fireworks = [];

    // Periodic fireworks spawner
    let lastFireworkTime = 0;
    function spawnAutoFireworks(now) {
      if (now - lastFireworkTime > 2200) {
        fireworks.push(new Firework());
        lastFireworkTime = now;
      }
    }

    // Expose global trigger for fireworks explosion
    window.launchFireworkBatch = function(count = 6) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const fx = Math.random() * (width * 0.85) + width * 0.075;
          const fy = Math.random() * (height * 0.45) + height * 0.1;
          fireworks.push(new Firework(fx, fy));
        }, i * 180);
      }
    };

    // Canvas animation loop
    function animateCanvas(timestamp) {
      ctx.clearRect(0, 0, width, height);

      // Render floating particles
      floatingParticles.forEach(p => {
        p.update();
        p.draw();
      });

      // Spawn and update fireworks
      spawnAutoFireworks(timestamp);
      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        if (fireworks[i].isDead()) {
          fireworks.splice(i, 1);
        }
      }

      requestAnimationFrame(animateCanvas);
    }
    requestAnimationFrame(animateCanvas);

    // Interactive canvas click spawn
    window.addEventListener('click', (e) => {
      // Don't trigger if clicked on a button or link
      if (e.target.closest('button, a, input, textarea, .lightbox-modal, .celebration-modal-card')) return;
      fireworks.push(new Firework(e.clientX, e.clientY));
    });
  }

  /* --------------------------------------------------------------------------
     3. COUNTDOWN TO INDEPENDENCE DAY (VANILLA JS REAL COUNTDOWN)
     -------------------------------------------------------------------------- */
  function initCountdown() {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minutesEl = document.getElementById('countMinutes');
    const secondsEl = document.getElementById('countSeconds');
    const daysRing = document.getElementById('daysRing');
    const hoursRing = document.getElementById('hoursRing');
    const minutesRing = document.getElementById('minutesRing');
    const secondsRing = document.getElementById('secondsRing');
    const statusDisplay = document.getElementById('countdownStatus');
    const targetDateDisplay = document.getElementById('targetDateDisplay');

    if (!daysEl) return;

    const circumference = 2 * Math.PI * 54; // r=54 in SVG
    [daysRing, hoursRing, minutesRing, secondsRing].forEach(ring => {
      if (ring) {
        ring.style.strokeDasharray = `${circumference}`;
        ring.style.strokeDashoffset = `${circumference}`;
      }
    });

    function getNextIndependenceDay() {
      const now = new Date();
      const currentYear = now.getFullYear();
      let target = new Date(currentYear, 7, 14, 0, 0, 0); // Month 7 is August (0-indexed)

      // If today is August 14th
      if (now.getMonth() === 7 && now.getDate() === 14) {
        return { target: now, isToday: true, year: currentYear };
      }

      // If August 14 of this year has already passed, target next year
      if (now.getTime() > target.getTime()) {
        target = new Date(currentYear + 1, 7, 14, 0, 0, 0);
        return { target, isToday: false, year: currentYear + 1 };
      }

      return { target, isToday: false, year: currentYear };
    }

    function updateTimer() {
      const { target, isToday, year } = getNextIndependenceDay();
      const now = new Date();

      if (targetDateDisplay) {
        targetDateDisplay.textContent = `14 August ${year}`;
      }

      if (isToday) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        if (statusDisplay) {
          statusDisplay.innerHTML = `<div class="status-badge" style="background: rgba(255,215,0,0.15); border-color: var(--accent-gold); color: #FFF; font-weight:700; font-size:1.1rem;">🎉 TODAY IS INDEPENDENCE DAY! PAKISTAN ZINDABAD! 🎉</div>`;
        }
        return;
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');

      // Update progress rings
      if (daysRing) {
        const offset = circumference - (days / 365) * circumference;
        daysRing.style.strokeDashoffset = `${offset}`;
      }
      if (hoursRing) {
        const offset = circumference - (hours / 24) * circumference;
        hoursRing.style.strokeDashoffset = `${offset}`;
      }
      if (minutesRing) {
        const offset = circumference - (minutes / 60) * circumference;
        minutesRing.style.strokeDashoffset = `${offset}`;
      }
      if (secondsRing) {
        const offset = circumference - (seconds / 60) * circumference;
        secondsRing.style.strokeDashoffset = `${offset}`;
      }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }
  initCountdown();

  /* --------------------------------------------------------------------------
     4. NAVBAR SCROLL EFFECT & MOBILE HAMBURGER MENU
     -------------------------------------------------------------------------- */
  const navbarHeader = document.getElementById('navbarHeader');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const backToTopBtn = document.getElementById('backToTop');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky & Scroll effects
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header sticky shadow
    if (scrollY > 50) {
      navbarHeader?.classList.add('scrolled');
    } else {
      navbarHeader?.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // Active link highlighting based on section scroll position
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Mobile Menu Toggles
  function toggleMobileMenu() {
    const isOpen = navMenu?.classList.toggle('active');
    hamburgerBtn?.classList.toggle('active');
    mobileNavBackdrop?.classList.toggle('active');
    hamburgerBtn?.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburgerBtn?.addEventListener('click', toggleMobileMenu);
  mobileNavBackdrop?.addEventListener('click', toggleMobileMenu);

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu?.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // Back to Top smooth scroll
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* --------------------------------------------------------------------------
     5. STATS ANIMATED COUNTERS
     -------------------------------------------------------------------------- */
  function initCounters() {
    const statElements = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statElements.forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            const duration = 1800;
            const start = 0;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentVal = Math.floor(start + (target - start) * easeProgress);

              el.textContent = currentVal;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = target;
              }
            }
            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.5 });

    const statsBlock = document.querySelector('.hero-stats');
    if (statsBlock) observer.observe(statsBlock);
  }
  initCounters();

  /* --------------------------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    const revealItems = document.querySelectorAll('.reveal-item, .feature-card, .landmark-card, .celebration-card, .gallery-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealItems.forEach((item, index) => {
      item.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index % 4 * 0.1}s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index % 4 * 0.1}s`;
      observer.observe(item);
    });
  }
  initScrollReveal();

  /* --------------------------------------------------------------------------
     7. 3D CARD TILT EFFECT (FEATURE CARDS)
     -------------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* --------------------------------------------------------------------------
     8. PATRIOTIC GALLERY & VANILLA JS LIGHTBOX
     -------------------------------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  // Populate gallery data array
  state.galleryData = Array.from(galleryItems).map(item => ({
    src: item.getAttribute('data-src'),
    title: item.getAttribute('data-title'),
    caption: item.getAttribute('data-caption'),
    category: item.getAttribute('data-category'),
    element: item
  }));

  // Gallery Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.display = 'block';
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });

  // Open Lightbox
  function openLightbox(index) {
    state.lightboxIndex = index;
    const item = state.galleryData[index];
    if (!item) return;

    lightboxImg.src = item.src;
    lightboxImg.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxCaption.textContent = item.caption;

    lightbox?.classList.add('active');
    lightbox?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox?.classList.remove('active');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    let nextIndex = state.lightboxIndex + dir;
    if (nextIndex < 0) nextIndex = state.galleryData.length - 1;
    if (nextIndex >= state.galleryData.length) nextIndex = 0;
    openLightbox(nextIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  // Landmark Card "Explore Details" buttons linking to gallery items
  document.querySelectorAll('.btn-view-landmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const landmarkKey = btn.getAttribute('data-landmark');
      const foundIdx = state.galleryData.findIndex(item => item.src.toLowerCase().includes(landmarkKey));
      if (foundIdx !== -1) {
        openLightbox(foundIdx);
      } else {
        openLightbox(0);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));

  // Keyboard navigation for Lightbox & Modals
  window.addEventListener('keydown', (e) => {
    if (lightbox?.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    }
    if (celebrationOverlay?.classList.contains('active')) {
      if (e.key === 'Escape') closeCelebrationModal();
    }
  });

  /* --------------------------------------------------------------------------
     9. INTERACTIVE PLEDGE / WISH WALL
     -------------------------------------------------------------------------- */
  const pledgeForm = document.getElementById('pledgeForm');
  const pledgeStream = document.getElementById('pledgeStream');

  if (pledgeForm && pledgeStream) {
    pledgeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('pledgeName');
      const messageInput = document.getElementById('pledgeMessage');

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const avatars = ['🇵🇰', '🌙', '⭐', '🕊️', '✨'];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      const newCard = document.createElement('div');
      newCard.className = 'pledge-card-item';
      newCard.innerHTML = `
        <div class="pledge-author">
          <span class="author-avatar">${randomAvatar}</span>
          <div>
            <strong>${escapeHtml(name)}</strong>
            <span class="pledge-time">Just now</span>
          </div>
        </div>
        <p class="pledge-msg">"${escapeHtml(message)}"</p>
      `;

      pledgeStream.prepend(newCard);
      pledgeForm.reset();

      // Trigger mini fireworks celebration
      if (window.launchFireworkBatch) {
        window.launchFireworkBatch(3);
      }
      playFanfareSound();

      // Show success feedback
      const submitBtn = pledgeForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Pledge Posted! 🇵🇰</span>`;
      submitBtn.style.background = 'linear-gradient(135deg, #FFD700, #ffb703)';
      submitBtn.style.color = '#000';

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
      }, 2500);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* --------------------------------------------------------------------------
     10. SPECIAL "CRAZY" CELEBRATION MODAL & CONFETTI STORM ENGINE
     -------------------------------------------------------------------------- */
  const celebrationOverlay = document.getElementById('celebrationOverlay');
  const celebrationBackdrop = document.getElementById('celebrationBackdrop');
  const celebrationModalClose = document.getElementById('celebrationModalClose');
  const btnModalDismiss = document.getElementById('btnModalDismiss');
  const btnCheerAgain = document.getElementById('btnCheerAgain');

  // Trigger buttons
  const heroCelebrateBtn = document.getElementById('heroCelebrateBtn');
  const navCelebrateBtn = document.getElementById('navCelebrateBtn');
  const ctaCelebrateBtn = document.getElementById('ctaCelebrateBtn');

  // Confetti Engine for Celebration
  const confettiCanvas = document.getElementById('celebrationConfettiCanvas');
  let confettiCtx = null;
  let confettiPieces = [];
  let confettiAnimId = null;

  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
  }

  class ConfettiPiece {
    constructor(cWidth, cHeight) {
      this.cWidth = cWidth;
      this.cHeight = cHeight;
      this.reset();
    }
    reset() {
      this.x = Math.random() * this.cWidth;
      this.y = -20 - Math.random() * 80;
      this.size = Math.random() * 10 + 6;
      this.speedY = Math.random() * 4 + 3;
      this.speedX = (Math.random() - 0.5) * 3;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 10;
      this.colors = ['#01411C', '#00FF87', '#FFD700', '#FFFFFF', '#4EFA8B', '#FFE566'];
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.type = Math.random() > 0.3 ? 'ribbon' : 'flag'; // some mini flags!
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.05) * 1.5;
      this.rotation += this.rotSpeed;
      if (this.y > this.cHeight + 30) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.type === 'ribbon') {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        // Draw tiny Pakistan Flag piece
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-this.size / 2, -this.size / 3, this.size * 0.25, this.size * 0.66);
        ctx.fillStyle = '#01411C';
        ctx.fillRect(-this.size / 2 + this.size * 0.25, -this.size / 3, this.size * 0.75, this.size * 0.66);
        // tiny gold star center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(-this.size / 2 + this.size * 0.6, -this.size / 3 + this.size * 0.33, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function startConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const count = window.innerWidth < 768 ? 50 : 110;
    confettiPieces = Array.from({ length: count }, () => new ConfettiPiece(confettiCanvas.width, confettiCanvas.height));

    function loopConfetti() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiPieces.forEach(p => {
        p.update();
        p.draw(confettiCtx);
      });
      confettiAnimId = requestAnimationFrame(loopConfetti);
    }
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    loopConfetti();
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    if (confettiCtx && confettiCanvas) {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  function launchCelebration() {
    initAudio();
    playFanfareSound();
    
    // Launch huge barrage of fireworks
    if (window.launchFireworkBatch) {
      window.launchFireworkBatch(8);
    }

    celebrationOverlay?.classList.add('active');
    celebrationOverlay?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    startConfetti();
  }

  function closeCelebrationModal() {
    celebrationOverlay?.classList.remove('active');
    celebrationOverlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopConfetti();
  }

  // Event Listeners for Celebration Triggers
  heroCelebrateBtn?.addEventListener('click', launchCelebration);
  navCelebrateBtn?.addEventListener('click', launchCelebration);
  ctaCelebrateBtn?.addEventListener('click', launchCelebration);

  celebrationModalClose?.addEventListener('click', closeCelebrationModal);
  celebrationBackdrop?.addEventListener('click', closeCelebrationModal);
  btnModalDismiss?.addEventListener('click', closeCelebrationModal);

  btnCheerAgain?.addEventListener('click', () => {
    playFanfareSound();
    if (window.launchFireworkBatch) {
      window.launchFireworkBatch(6);
    }
  });

  // Newsletter Form Handler
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value) {
        input.value = '';
        const btn = newsletterForm.querySelector('button');
        btn.innerHTML = '✓';
        setTimeout(() => {
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        }, 2000);
      }
    });
  }

  console.log('%c🇵🇰 PAKISTAN ZINDABAD — 14 AUGUST 1947 🇵🇰', 'color: #00FF87; font-size: 18px; font-weight: bold; background: #01411C; padding: 8px 16px; border-radius: 6px;');
});
