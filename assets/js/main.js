/* ══════════════════════════════════════════════════════════════════════
   ЭкоСфера Безопасности — main.js v3.1
   Исправления: баги регистрации, мобильное меню, карусель, плеер
   ══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════════════
   1. SPA PAGE SYSTEM
   ══════════════════════════════════════════════════════════════════════ */
var pages    = document.querySelectorAll('.page');
var navLinks = document.querySelectorAll('.nav-links a[id^="nl-"]');

function showPage(id) {
  pages.forEach(function(p) {
    p.classList.remove('active');
    /* FIX: сбрасываем инлайн display только у register,
       остальные управляются через .active в CSS */
    if (p.id === 'p-register') p.style.display = '';
  });

  var target = document.getElementById(id);
  if (!target) return;

  target.classList.add('active');

  /* FIX: регистрация — корректный grid на мобильном */
  if (id === 'p-register') {
    var inner = document.getElementById('reg-inner');
    if (inner) {
      if (window.innerWidth <= 768) {
        inner.style.gridTemplateColumns = '1fr';
        var vis = inner.querySelector('.reg-visual');
        if (vis) vis.style.display = 'none';
      } else {
        inner.style.gridTemplateColumns = '';
        var vis2 = inner.querySelector('.reg-visual');
        if (vis2) vis2.style.display = '';
      }
    }
  }

  /* Активный пункт меню */
  var pageKey = id.replace('p-', '');
  navLinks.forEach(function(a) {
    a.classList.toggle('active', a.id === 'nl-' + pageKey);
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
  initReveal();
  /* Re-init stagger for newly visible sections */
  if (window._initStagger) window._initStagger();
  /* Reset masonry state when returning to home */
  if (id === 'p-home') onScroll && onScroll();
}

window.showPage = showPage;
window.goHome   = function() { showPage('p-home'); };

/* ══════════════════════════════════════════════════════════════════════
   2. WORLD BACKGROUND — animated canvas parallax
   A single fixed canvas renders soft gradient orbs.
   All page content layers slide on top — creating depth.
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var canvas = document.getElementById('world-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  /* Orb definitions — colour, size, speed, initial position */
  var orbs = [
    { x: 0.72, y: 0.18, r: 0.48, color: '42,245,152',  alpha: 0.055, vx:  0.00012, vy:  0.00008 },
    { x: 0.12, y: 0.75, r: 0.40, color: '255,107,107', alpha: 0.040, vx: -0.00009, vy: -0.00006 },
    { x: 0.45, y: 0.50, r: 0.30, color: '77,168,255',  alpha: 0.032, vx:  0.00007, vy:  0.00010 },
    { x: 0.85, y: 0.85, r: 0.25, color: '180,42,245',  alpha: 0.028, vx: -0.00005, vy:  0.00007 },
  ];

  /* Scroll offset for parallax — each orb layer moves at different rate */
  var scrollY  = 0;
  var targetSY = 0;
  var W = 0, H = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('scroll', function() {
    targetSY = window.scrollY;
  }, { passive: true });

  function draw(ts) {
    requestAnimationFrame(draw);

    /* Smooth parallax scroll interpolation */
    scrollY += (targetSY - scrollY) * 0.06;

    ctx.clearRect(0, 0, W, H);

    /* Deep base gradient — the "sky" behind everything */
    var base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0,   '#070E1A');
    base.addColorStop(0.5, '#0a1828');
    base.addColorStop(1,   '#06111e');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* Grid lines — faint green lattice */
    ctx.save();
    ctx.strokeStyle = 'rgba(42,245,152,0.022)';
    ctx.lineWidth = 1;
    var grid = 72;
    for (var gx = 0; gx < W; gx += grid) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (var gy = 0; gy < H; gy += grid) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    ctx.restore();

    /* Animated gradient orbs — each at a different parallax depth */
    orbs.forEach(function(o, i) {
      /* Gentle drift */
      o.x += o.vx;
      o.y += o.vy;
      if (o.x < -0.2) o.x = 1.2;
      if (o.x >  1.2) o.x = -0.2;
      if (o.y < -0.2) o.y = 1.2;
      if (o.y >  1.2) o.y = -0.2;

      /* Parallax depth — deeper orbs move less on scroll */
      var depth     = 0.05 + i * 0.04;
      var parallaxY = scrollY * depth;

      var cx  = o.x * W;
      var cy  = o.y * H - parallaxY;
      var rad = o.r * Math.max(W, H);

      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0,   'rgba(' + o.color + ',' + o.alpha + ')');
      grad.addColorStop(0.5, 'rgba(' + o.color + ',' + (o.alpha * 0.4) + ')');
      grad.addColorStop(1,   'rgba(' + o.color + ',0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Vignette — darkens edges so content pops */
    var vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(draw);
})();

/* ══════════════════════════════════════════════════════════════════════
   3. STICKY NAV + MASONRY COLLAPSE SCROLL TRANSITION
   ══════════════════════════════════════════════════════════════════════ */
var stickyNav   = document.getElementById('sticky-nav');
var masonryEl   = document.getElementById('masonry');
var heroBgEl    = document.getElementById('hero-bg');
var heroTopbar  = document.querySelector('.hero-topbar');
var progressBar = document.getElementById('scroll-progress');

/* Cache masonry blocks once for perf */
var mbBlocks = masonryEl ? Array.from(masonryEl.querySelectorAll('.mb')) : [];

/* Target positions for each block's "collapse" — they converge to nav centre */
var mbTargets = [
  { tx: 0,   ty: -1 },   /* mb-1: main block — flies straight up */
  { tx: 0.4, ty: -1 },   /* mb-2 */
  { tx: 0.2, ty: -1 },   /* mb-3 */
  { tx: 0.5, ty: -1 },   /* mb-4 */
  { tx:-0.2, ty: -1 },   /* mb-5 */
  { tx: 0.3, ty: -1 },   /* mb-6 */
];

function onScroll() {
  var y = window.scrollY;

  /* ── Scroll progress bar ── */
  if (progressBar) {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docH > 0 ? (y / docH * 100) : 0) + '%';
  }

  /* ── Nav shadow ── */
  if (stickyNav) stickyNav.classList.toggle('scrolled', y > 10);

  /* ── Only animate on home page ── */
  var homeActive = document.getElementById('p-home').classList.contains('active');
  if (!homeActive) return;

  var hero = document.getElementById('hero');
  if (!hero) return;
  var heroH = hero.offsetHeight;

  /* progress 0→1 over the hero scroll distance */
  var p = Math.min(y / heroH, 1);

  /* Phase thresholds */
  var FADE_START  = 0.15;  /* masonry starts fading at 15% */
  var FADE_END    = 0.60;  /* fully gone at 60% */
  var TOPBAR_FADE = 0.35;  /* hero topbar starts hiding at 35% */

  /* ── Masonry global fade + scale ── */
  if (masonryEl) {
    var masonryP = p < FADE_START
      ? 1
      : Math.max(0, 1 - (p - FADE_START) / (FADE_END - FADE_START));
    masonryEl.style.opacity   = masonryP;
    masonryEl.style.transform = 'scale(' + (1 - p * 0.04) + ')';
  }

  /* ── Each block flies toward sticky nav — staggered collapse ── */
  mbBlocks.forEach(function(mb, i) {
    if (p < FADE_START) {
      mb.style.transform = '';
      mb.style.opacity   = '';
      return;
    }
    var blockP  = Math.min((p - FADE_START) / (FADE_END - FADE_START), 1);
    var target  = mbTargets[i] || { tx: 0, ty: -1 };
    /* stagger — later blocks lag slightly */
    var lag     = Math.max(0, blockP - i * 0.06);
    var eased   = lag < 0 ? 0 : 1 - Math.pow(1 - lag, 2);
    var tx      = target.tx * 80 * eased;
    var ty      = target.ty * 120 * eased;
    var sc      = 1 - eased * 0.18;
    mb.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + sc + ')';
    mb.style.opacity   = 1 - eased;
  });

  /* ── Hero topbar fades out as masonry collapses ── */
  if (heroTopbar) {
    heroTopbar.classList.toggle('hero-topbar--hidden', p > TOPBAR_FADE);
  }

  /* ── Parallax hero background ── */
  if (heroBgEl) {
    heroBgEl.style.transform = 'translateY(' + y * 0.28 + 'px)';
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
/* Run once on load */
onScroll();

/* GSAP enhancement for buttery smooth masonry collapse (if available) */
function setupGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  /* GSAP handles the masonry transform for smoother 60fps interpolation */
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: function(s) {
      /* Delegate to our onScroll for consistency */
      onScroll();
    },
    scrub: true
  });
}
setTimeout(setupGSAP, 120);

/* ══════════════════════════════════════════════════════════════════════
   4. STAGGER FADE-IN-UP SYSTEM
   Watches .stagger-section elements. When they enter viewport,
   fires .stagger-item--in on children sequentially with delay.
   Base delay: 120ms per data-stagger index.
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var STAGGER_MS  = 120;   /* delay between consecutive items */
  var OFFSET_BASE = 0;     /* extra base delay in ms */

  function fireStagger(section) {
    var items = section.querySelectorAll('.stagger-item');
    items.forEach(function(item) {
      var idx   = parseInt(item.getAttribute('data-stagger') || '0', 10);
      var delay = OFFSET_BASE + idx * STAGGER_MS;
      /* Apply transition-delay via inline style */
      item.style.transitionDelay = delay + 'ms';
      /* Use rAF to ensure the browser registers the initial hidden state */
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          item.classList.add('stagger-item--in');
        });
      });
    });
    section.dataset.staggerFired = '1';
  }

  var staggerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      if (entry.target.dataset.staggerFired) return;
      fireStagger(entry.target);
      staggerObs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function initStagger() {
    document.querySelectorAll('.stagger-section:not([data-stagger-fired])').forEach(function(sec) {
      staggerObs.observe(sec);
    });
  }

  /* Also attach section-enter to every major section */
  function initSectionEnter() {
    var sectionEnterObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-enter--in');
          sectionEnterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });

    document.querySelectorAll('#metrics, #leaders, #footer, #art-gallery, #video-sec, #photo-slider, #radar').forEach(function(sec) {
      sec.classList.add('section-enter');
      sectionEnterObs.observe(sec);
    });
  }

  initStagger();
  initSectionEnter();

  /* Re-run when pages switch */
  window._initStagger = function() {
    initStagger();
    initSectionEnter();
  };
})();

/* ══════════════════════════════════════════════════════════════════════
   3. MOBILE MENU — FIX: закрытие по overlay и Escape
   ══════════════════════════════════════════════════════════════════════ */
var burger    = document.getElementById('burger');
var mobMenu   = document.getElementById('mob-menu');
var mobClose  = document.getElementById('mob-close');
var mobOverlay= document.getElementById('mob-overlay');

function openMob() {
  if (!mobMenu) return;
  mobMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('mob-open');
  if (burger) burger.setAttribute('aria-expanded', 'true');
  if (mobOverlay) mobOverlay.style.display = 'block';
  /* Фокус на первый элемент меню */
  var firstLink = mobMenu.querySelector('a');
  if (firstLink) firstLink.focus();
}

window.closeMob = function() {
  if (!mobMenu) return;
  mobMenu.classList.remove('open');
  document.body.style.overflow = '';
  document.body.classList.remove('mob-open');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.focus();
  }
  if (mobOverlay) mobOverlay.style.display = 'none';
};

if (burger)     burger.addEventListener('click', openMob);
if (mobClose)   mobClose.addEventListener('click', window.closeMob);
if (mobOverlay) mobOverlay.addEventListener('click', window.closeMob);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.closeMob();
    var lb = document.getElementById('gallery-lb');
    if (lb && lb.classList.contains('show')) window.closeLb();
  }
});

/* ══════════════════════════════════════════════════════════════════════
   4. KEYBOARD — masonry blocks
   ══════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.mb').forEach(function(b) {
  b.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      b.click();
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   5. REVEAL ON SCROLL
   ══════════════════════════════════════════════════════════════════════ */
var revObs;

function initReveal() {
  if (revObs) revObs.disconnect();
  revObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.in)').forEach(function(el) {
    revObs.observe(el);
  });
}

initReveal();

/* ══════════════════════════════════════════════════════════════════════
   6. ANIMATED COUNTERS
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  function animateCounter(el, target, suffix, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('ru-RU') + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('ru-RU') + (suffix || '');
    }
    requestAnimationFrame(step);
  }

  var metricsObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-target]').forEach(function(item, i) {
        var valEl = item.querySelector('.metric-val');
        if (!valEl || valEl.dataset.done) return;
        valEl.dataset.done = '1';
        setTimeout(function() {
          animateCounter(valEl, parseInt(item.dataset.target), item.dataset.suffix || '', 1800);
        }, i * 120);
      });
      metricsObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  var m = document.getElementById('metrics');
  if (m) metricsObs.observe(m);
})();

/* ══════════════════════════════════════════════════════════════════════
   7. RADAR TOOLTIP — FIX: Touch support
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var tip = document.getElementById('r-tip');
  if (!tip) return;

  document.querySelectorAll('.radar-dot').forEach(function(dot) {
    function showTip(x, y) {
      tip.textContent = (dot.dataset.ok === '1' ? '✅ ' : '🔴 ') + dot.dataset.city;
      tip.classList.add('show');
      var pr = dot.closest('.radar-wrap').getBoundingClientRect();
      tip.style.left = (x - pr.left + 12) + 'px';
      tip.style.top  = (y - pr.top  - 36) + 'px';
    }

    dot.addEventListener('mouseenter', function(e) { showTip(e.clientX, e.clientY); });
    dot.addEventListener('mousemove',  function(e) { showTip(e.clientX, e.clientY); });
    dot.addEventListener('mouseleave', function()  { tip.classList.remove('show'); });

    /* Touch */
    dot.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var t = e.touches[0];
      showTip(t.clientX, t.clientY);
      setTimeout(function() { tip.classList.remove('show'); }, 2000);
    }, { passive: false });

    /* Keyboard */
    dot.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var r = dot.getBoundingClientRect();
        showTip(r.left + r.width / 2, r.top + r.height / 2);
        setTimeout(function() { tip.classList.remove('show'); }, 2000);
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   8. LEADERS CAROUSEL — FIX: корректный расчёт ширины карточки
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var track   = document.getElementById('ltck');
  var dots    = document.querySelectorAll('.ldot');
  var current = 0;
  var timer;

  /* FIX: Считаем ширину включая gap через CSS gap (24px) */
  function cardWidth() {
    if (!track) return 300;
    var card = track.querySelector('.leader-card');
    if (!card) return 300;
    /* getBoundingClientRect() — реальная ширина после рендера */
    var style = window.getComputedStyle(track);
    var gap   = parseFloat(style.gap) || 24;
    return card.getBoundingClientRect().width + gap;
  }

  window.gL = function(i) {
    current = Math.max(0, Math.min(i, dots.length - 1));
    if (track) track.style.transform = 'translateX(-' + current * cardWidth() + 'px)';
    dots.forEach(function(d, j) {
      d.classList.toggle('on', j === current);
      d.setAttribute('aria-selected', j === current ? 'true' : 'false');
    });
    clearInterval(timer);
    timer = setInterval(next, 4000);
  };

  function next() { window.gL((current + 1) % dots.length); }

  if (track) {
    track.addEventListener('mouseenter', function() { clearInterval(timer); });
    track.addEventListener('mouseleave', function() { timer = setInterval(next, 4000); });

    /* Touch swipe */
    var startX = 0;
    track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) window.gL(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  /* Запускаем после рендера */
  setTimeout(function() { timer = setInterval(next, 4000); }, 500);

  /* Пересчёт при изменении размера */
  window.addEventListener('resize', function() {
    if (track) track.style.transform = 'translateX(-' + current * cardWidth() + 'px)';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════════════
   9. MUSIC PLAYER — FIX: fakeProgress сбрасывается при смене трека
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var tracks = [
    { title: 'Звуки природы',     artist: 'ЭкоСфера Band',    dur: '3:42', durSec: 222, likes: 847,  emoji: '🌿', isNew: true  },
    { title: 'Безопасный путь',   artist: 'Алексей Волков',    dur: '4:15', durSec: 255, likes: 623,  emoji: '🛤️', isNew: true  },
    { title: 'Культура будущего', artist: 'Мария Козлова',     dur: '5:02', durSec: 302, likes: 1204, emoji: '🌟', isNew: false },
    { title: 'Зелёная энергия',   artist: 'Дмитрий Орлов',     dur: '3:28', durSec: 208, likes: 445,  emoji: '⚡', isNew: false },
    { title: 'Живая планета',     artist: 'ЭкоСфера Хор',      dur: '6:11', durSec: 371, likes: 980,  emoji: '🌍', isNew: false },
    { title: 'Охрана труда',      artist: 'Петров & Смирнова', dur: '2:54', durSec: 174, likes: 312,  emoji: '⚙️', isNew: false },
    { title: 'Лесная симфония',   artist: 'Анна Волкова',      dur: '7:23', durSec: 443, likes: 756,  emoji: '🌲', isNew: false },
  ];

  var sorted = tracks.slice().sort(function(a, b) {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.likes - a.likes;
  });

  var currentIdx   = 0;
  var isPlaying    = false;
  var spinTimer    = null;
  var fakeProgress = 0; /* 0–100 */

  function fmt(sec) {
    return Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60);
  }

  function buildWf(id, n) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var b = document.createElement('div');
      b.className = 'wf-bar';
      b.style.height = (20 + Math.random() * 80) + '%';
      b.style.setProperty('--d', (.4 + Math.random() * 1.2) + 's');
      b.style.animationDelay = (Math.random() * 0.8) + 's';
      b.style.animationPlayState = 'paused';
      el.appendChild(b);
    }
  }

  function renderTrackList() {
    var list = document.getElementById('tlist');
    if (!list) return;
    list.innerHTML = '';
    sorted.forEach(function(t, i) {
      var row = document.createElement('div');
      row.className = 'track-row' + (i === currentIdx ? ' active' : '');
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', i === currentIdx ? 'true' : 'false');
      row.setAttribute('tabindex', '0');
      row.innerHTML =
        '<span class="track-num">' + (i + 1) + '</span>' +
        '<div class="track-cover"><span>' + t.emoji + '</span></div>' +
        '<div class="track-info">' +
          '<div class="track-name">' + t.title + '</div>' +
          '<div class="track-artist">' + t.artist + '</div>' +
        '</div>' +
        '<div class="track-wf" id="twf-' + i + '"></div>' +
        '<div class="track-likes">🌸 ' + t.likes + '</div>' +
        '<span class="track-dur">' + t.dur + '</span>';
      row.addEventListener('click', function() { selectTrack(i); });
      row.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTrack(i); }
      });
      list.appendChild(row);
      buildWf('twf-' + i, 12);
    });
  }

  function updateUI() {
    var t = sorted[currentIdx];
    var el = function(id) { return document.getElementById(id); };
    if (el('now-title'))  el('now-title').textContent  = t.title;
    if (el('now-artist')) el('now-artist').textContent = t.artist;
    if (el('t-dur'))      el('t-dur').textContent      = t.dur;
    /* Update centre label emoji on the vinyl disc */
    if (el('gram-label')) el('gram-label').textContent = t.emoji;
  }

  function selectTrack(i) {
    stopSpin();
    currentIdx   = i;
    fakeProgress = 0;

    updateUI();

    var fillEl = document.getElementById('prog-fill');
    var curEl  = document.getElementById('t-cur');
    var arm    = document.getElementById('arm');
    if (fillEl) fillEl.style.width  = '0%';
    if (curEl)  curEl.textContent   = '0:00';
    if (arm)    arm.className       = 'gram-arm playing';

    isPlaying = true;
    var playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.textContent = '⏸';
      playBtn.setAttribute('aria-label', 'Пауза');
    }

    startSpin();
    renderTrackList();
  }

  window.togglePlay = function() {
    isPlaying = !isPlaying;
    var playBtn = document.getElementById('play-btn');
    var arm     = document.getElementById('arm');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Воспроизвести');
    }
    if (isPlaying) {
      startSpin();
      if (arm) arm.className = 'gram-arm playing';
    } else {
      stopSpin();
      if (arm) arm.className = 'gram-arm';
    }
  };

  /* ── Spin control via CSS animation-play-state ──
     The vinyl-img rotates via @keyframes vinylSpin in CSS.
     JS only toggles 'running' / 'paused' — no JS-driven transform needed.
     A progress ticker (setInterval) still handles the fake progress bar. */
  function startSpin() {
    stopSpin();

    /* Resume CSS rotation on vinyl image */
    var vinylImg = document.getElementById('vinyl');
    if (vinylImg) vinylImg.style.animationPlayState = 'running';

    var startTime = Date.now();

    spinTimer = setInterval(function() {
      /* Fake progress bar — maps elapsed time to track duration */
      var durSec   = sorted[currentIdx].durSec || 240;
      var stepPct  = (16 / (durSec * 1000)) * 100;
      fakeProgress = Math.min(fakeProgress + stepPct, 100);

      var fillEl = document.getElementById('prog-fill');
      var curEl  = document.getElementById('t-cur');
      var progEl = document.getElementById('prog-track');

      if (fillEl) fillEl.style.width = fakeProgress + '%';
      if (progEl) progEl.setAttribute('aria-valuenow', Math.round(fakeProgress));
      if (curEl) {
        var secs = Math.floor(fakeProgress / 100 * durSec);
        curEl.textContent = fmt(secs);
      }

      /* Waveform bars */
      var wf = document.getElementById('twf-' + currentIdx);
      if (wf) wf.querySelectorAll('.wf-bar').forEach(function(b) {
        b.style.animationPlayState = 'running';
      });

      /* Auto-advance to next track */
      if (fakeProgress >= 100) {
        stopSpin();
        setTimeout(function() { window.nextTrack(); }, 300);
      }
    }, 16);
  }

  function stopSpin() {
    clearInterval(spinTimer);
    spinTimer = null;

    /* Pause CSS rotation — disc freezes in place */
    var vinylImg = document.getElementById('vinyl');
    if (vinylImg) vinylImg.style.animationPlayState = 'paused';

    document.querySelectorAll('.wf-bar').forEach(function(b) {
      b.style.animationPlayState = 'paused';
    });
  }

  window.prevTrack = function() { selectTrack((currentIdx - 1 + sorted.length) % sorted.length); };
  window.nextTrack = function() { selectTrack((currentIdx + 1) % sorted.length); };

  window.likeTrack = function() {
    sorted[currentIdx].likes++;
    var btn = document.getElementById('like-btn');
    if (btn) btn.classList.toggle('liked');
    renderTrackList();
  };

  window.seekTrack = function(e) {
    var trackEl = document.getElementById('prog-track');
    if (!trackEl) return;
    var rect     = trackEl.getBoundingClientRect();
    fakeProgress = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
    var fillEl   = document.getElementById('prog-fill');
    if (fillEl) fillEl.style.width = fakeProgress + '%';
  };

  renderTrackList();
  selectTrack(0);
})();

/* ══════════════════════════════════════════════════════════════════════
   10. ART GALLERY + LIGHTBOX
   Images: Unsplash CDN (free, no attribution required for display)
   60-30-10 palette: 60% deep navy/dark teal (bg tint), 30% mid-teal
   overlays, 10% green accent (#2AF598) on hover/active states.
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  /* Real Unsplash photos — safety, ecology, art themes */
  var galleryData = [
    {
      url:   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      title: 'Культура безопасности',
      tint:  'rgba(7,20,38,0.45)'
    },
    {
      url:   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      title: 'Жизнь леса',
      tint:  'rgba(5,22,14,0.40)'
    },
    {
      url:   'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80',
      title: 'Чистый воздух',
      tint:  'rgba(5,18,32,0.42)'
    },
    {
      url:   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      title: 'Технологии безопасности',
      tint:  'rgba(7,14,38,0.50)'
    },
    {
      url:   'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
      title: 'Возобновляемая энергия',
      tint:  'rgba(7,22,14,0.42)'
    },
    {
      url:   'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
      title: 'Экология будущего',
      tint:  'rgba(5,20,12,0.44)'
    },
    {
      url:   'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
      title: 'Солнечная энергетика',
      tint:  'rgba(18,14,5,0.40)'
    },
    {
      url:   'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
      title: 'Искусство и безопасность',
      tint:  'rgba(7,14,30,0.48)'
    },
    {
      url:   'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
      title: 'Природа под защитой',
      tint:  'rgba(5,18,12,0.40)'
    },
  ];
  var shownRows = 1;

  function renderGallery() {
    var grid = document.getElementById('gal-grid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryData.slice(0, shownRows * 3).forEach(function(item, idx) {
      var el = document.createElement('div');
      el.className = 'gallery-item reveal';
      el.setAttribute('role', 'listitem');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', item.title + ' — открыть');
      /* 60% bg tint overlay keeps dark navy dominant per 60-30-10 */
      el.innerHTML =
        '<img src="' + item.url + '" alt="' + item.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">' +
        '<div style="position:absolute;inset:0;background:' + item.tint + ';"></div>' +
        '<div class="gallery-item-overlay" aria-hidden="true">🔍</div>';
      el.style.position = 'relative';
      el.addEventListener('click', function() { openLightbox(item.url, item.title); });
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item.url, item.title); }
      });
      grid.appendChild(el);
    });
    var moreBtn = document.getElementById('gal-more');
    if (moreBtn) moreBtn.style.display = shownRows * 3 >= galleryData.length ? 'none' : 'inline-flex';
    initReveal();
  }

  window.loadMoreGallery = function() { shownRows++; renderGallery(); };

  function openLightbox(url, title) {
    var lb  = document.getElementById('gallery-lb');
    var img = document.getElementById('lb-img');
    if (!lb || !img) return;
    img.src = url;
    img.alt = title;
    lb.classList.add('show');
    var closeBtn = document.getElementById('gallery-lb-close');
    if (closeBtn) closeBtn.focus();
  }

  window.closeLb = function() {
    var lb = document.getElementById('gallery-lb');
    if (lb) lb.classList.remove('show');
  };

  /* FIX: клик по img не закрывает lightbox */
  var lbImg = document.getElementById('lb-img');
  if (lbImg) lbImg.addEventListener('click', function(e) { e.stopPropagation(); });

  renderGallery();
})();

/* ══════════════════════════════════════════════════════════════════════
   11. VIDEO SIDEBAR
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var videos = [
    { emoji: '🏭', title: 'ISO 45001: внедрение за 30 дней',  author: 'А. Петров · 12:30'   },
    { emoji: '🌱', title: 'Экологический аудит предприятия',   author: 'Е. Смирнова · 8:45'  },
    { emoji: '⚡', title: 'Энергоэффективность ISO 50001',     author: 'Д. Орлов · 15:20'    },
    { emoji: '🔬', title: 'Лабораторная безопасность',         author: 'М. Козлова · 9:10'   },
    { emoji: '🌍', title: 'Углеродный след компании',          author: 'И. Николаев · 22:05' },
    { emoji: '🏗️', title: 'Строительная безопасность',        author: 'А. Волкова · 11:33'  },
  ];
  var sidebar = document.getElementById('vsidebar');
  if (!sidebar) return;
  videos.forEach(function(v) {
    var el = document.createElement('div');
    el.className = 'video-rec';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', v.title);
    el.innerHTML =
      '<div class="video-rec-thumb" aria-hidden="true"><span>' + v.emoji + '</span></div>' +
      '<div><div class="video-rec-title">' + v.title + '</div><div class="video-rec-meta">' + v.author + '</div></div>';
    sidebar.appendChild(el);
  });
})();

window.toggleVideo = function() {
  var btn = document.getElementById('vid-play');
  if (!btn) return;
  var playing = btn.textContent === '⏸';
  btn.textContent = playing ? '▶' : '⏸';
  btn.setAttribute('aria-label', playing ? 'Воспроизвести видео' : 'Пауза');
};

/* ══════════════════════════════════════════════════════════════════════
   12. CASCADE GALLERY — Horizontal Stacked Slider
   Swiper.js v11, effect:'creative', direction:'horizontal'
   Active card: full size, Ken Burns, PiP, title, CTA.
   Adjacent cards: translateX(±108%), scale(0.72), opacity(0.40), z(-600px).
   Nav: left/right arrows + dot pagination + counter.
   ══════════════════════════════════════════════════════════════════════ */
(function() {

  /* ── Slide data ── */
  var slides = [
    {
      url:  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=90',
      pip:  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=320&q=75',
      title: 'Жизнь леса',
      sub:   'Экологический проект Сибири',
      tag:   'Экология',
      cta:   'Смотреть сейчас',
      tint:  'rgba(5,22,12,0.55)'
    },
    {
      url:  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=90',
      pip:  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=320&q=75',
      title: 'Чистые реки',
      sub:   'Экспедиция по очистке водоёмов',
      tag:   'Водные ресурсы',
      cta:   'Смотреть сейчас',
      tint:  'rgba(5,14,28,0.52)'
    },
    {
      url:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=90',
      pip:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=320&q=75',
      title: 'Горные маршруты',
      sub:   'Безопасность в дикой природе',
      tag:   'Безопасность',
      cta:   'Смотреть сейчас',
      tint:  'rgba(7,10,28,0.56)'
    },
    {
      url:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=90',
      pip:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=320&q=75',
      title: 'Городские сады',
      sub:   'Зелёная урбанизация',
      tag:   'Экология',
      cta:   'Смотреть сейчас',
      tint:  'rgba(5,22,12,0.50)'
    },
    {
      url:  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1600&q=90',
      pip:  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=320&q=75',
      title: 'Чистая энергия',
      sub:   'Возобновляемые источники будущего',
      tag:   'Энергетика',
      cta:   'Смотреть сейчас',
      tint:  'rgba(16,14,4,0.50)'
    },
  ];

  /* ── Build slide HTML ── */
  var wrap = document.getElementById('cgal-slides-wrap');
  if (!wrap) return;

  wrap.innerHTML = slides.map(function(s, i) {
    return [
      '<div class="swiper-slide cgal-slide" data-idx="' + i + '" aria-label="' + s.title + '">',

        /* Full-bleed bg */
        '<div class="cgal-bg">',
          '<img src="' + s.url + '" alt="' + s.title + '" loading="' + (i < 2 ? 'eager' : 'lazy') + '">',
          '<div class="cgal-tint" style="background:' + s.tint + '"></div>',
        '</div>',

        /* Active content */
        '<div class="cgal-content">',

          /* Tag — top left */
          '<div class="cgal-tag-wrap">',
            '<span class="cgal-tag">' + s.tag + '</span>',
          '</div>',

          /* Centre: PiP + text + CTA */
          '<div class="cgal-center">',
            '<div class="cgal-pip">',
              '<img src="' + s.pip + '" alt="' + s.title + ' превью" loading="lazy">',
              '<div class="cgal-pip-ring"></div>',
            '</div>',
            '<h2 class="cgal-title">' + s.title + '</h2>',
            '<p  class="cgal-sub">'  + s.sub   + '</p>',
            '<button class="cgal-cta">',
              s.cta,
              ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
            '</button>',
          '</div>',

          /* Watermark number */
          '<div class="cgal-num">' + String(i + 1).padStart(2, '0') + '</div>',

        '</div>',

      '</div>'
    ].join('');
  }).join('');

  /* ── Build dot pagination ── */
  var dotsWrap = document.getElementById('cgal-dots');
  if (dotsWrap) {
    dotsWrap.innerHTML = slides.map(function(_, i) {
      return '<button class="cgal-dot' + (i === 0 ? ' cgal-dot--active' : '') +
             '" data-idx="' + i + '" aria-label="Слайд ' + (i + 1) + '"></button>';
    }).join('');
  }

  /* ── Update counter ── */
  var curEl   = document.getElementById('cgal-cur');
  var totalEl = document.getElementById('cgal-total');
  if (totalEl) totalEl.textContent = String(slides.length).padStart(2, '0');

  function updateUI(realIdx) {
    /* Counter */
    if (curEl) curEl.textContent = String(realIdx + 1).padStart(2, '0');
    /* Dots */
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.cgal-dot').forEach(function(d, i) {
        d.classList.toggle('cgal-dot--active', i === realIdx);
      });
    }
  }

  /* ── Init Swiper ── */
  function initSwiper() {
    if (typeof Swiper === 'undefined') {
      setTimeout(initSwiper, 200);
      return;
    }

    var swiper = new Swiper('#cgal-swiper', {

      /* ── HORIZONTAL cascade ── */
      direction: 'horizontal',

      /* Creative effect — "deck of cards" depth preset */
      effect: 'creative',
      creativeEffect: {
        limitProgress: 3,          /* render up to 3 cards on each side */

        /* Card to the LEFT of active — recedes into depth */
        prev: {
          translate:  ['-115%', 0, -500],   /* X offset, Y=0, Z-depth */
          scale:       0.74,
          opacity:     0.36,
          shadow:      false,
          /* CSS filter applied via .swiper-slide-prev class below */
        },
        /* Card to the RIGHT of active */
        next: {
          translate:  ['115%', 0, -500],
          scale:       0.74,
          opacity:     0.36,
          shadow:      false,
        },
      },

      /* Smooth cubic transition */
      speed:       680,
      grabCursor:  true,
      loop:        true,
      centeredSlides: true,

      keyboard: { enabled: true, onlyInViewport: true },
      a11y:     { enabled: true },

      /* Custom navigation — left / right arrows */
      navigation: {
        prevEl: '#cgal-prev',
        nextEl: '#cgal-next',
      },

      /* Autoplay pauses on hover */
      autoplay: {
        delay:                 5500,
        disableOnInteraction:  false,
        pauseOnMouseEnter:     true,
      },

      on: {
        init:        function() { updateUI(0); },
        slideChange: function() { updateUI(this.realIndex); },
      },
    });

    /* Wire up dot clicks to swiper navigation */
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.cgal-dot').forEach(function(dot) {
        dot.addEventListener('click', function() {
          swiper.slideToLoop(parseInt(dot.getAttribute('data-idx')));
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initSwiper, 60); });
  } else {
    setTimeout(initSwiper, 60);
  }
})();

/* ══════════════════════════════════════════════════════════════════════
   13. PROJECTS — real images per project theme
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var projects = [
    {
      title: 'Зелёный завод',
      desc:  'Снижение выбросов CO₂ на предприятиях Урала на 40%.',
      img:   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
      tint:  'rgba(7,14,26,0.55)',
      status: 'done',   date: '2025-11',
      gallery: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&q=70','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&q=70','https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300&q=70','https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=70'],
      team: ['👷','🔬','🌿']
    },
    {
      title: 'Чистые реки Сибири',
      desc:  'Экспедиция по очистке 12 рек и мониторинг воды.',
      img:   'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
      tint:  'rgba(5,14,26,0.50)',
      status: 'active', date: '2026-01',
      gallery: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=70','https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&q=70','https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=70','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=70'],
      team: ['🌿','🔬','⚡','🎨']
    },
    {
      title: 'Безопасный город',
      desc:  'Аудит городской инфраструктуры и стандарты безопасности.',
      img:   'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
      tint:  'rgba(7,12,28,0.54)',
      status: 'active', date: '2025-12',
      gallery: ['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&q=70','https://images.unsplash.com/photo-1486325212027-8081e485255e?w=300&q=70','https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&q=70','https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=70'],
      team: ['🏗️','⚡','👷']
    },
    {
      title: 'Школьная безопасность',
      desc:  'ISO 45001 в 50 школах трёх регионов России.',
      img:   'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
      tint:  'rgba(7,14,24,0.52)',
      status: 'done',   date: '2025-09',
      gallery: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&q=70','https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300&q=70','https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&q=70','https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=300&q=70'],
      team: ['🌿','🎨','🔬']
    },
    {
      title: 'Солнечная энергия',
      desc:  'Установка 200 солнечных панелей в малых городах.',
      img:   'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80',
      tint:  'rgba(14,12,5,0.48)',
      status: 'active', date: '2026-02',
      gallery: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=70','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&q=70','https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&q=70','https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300&q=70'],
      team: ['⚡','🏗️','🌿','👷']
    },
    {
      title: 'Лесной дозор',
      desc:  'IoT-мониторинг лесных пожаров.',
      img:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      tint:  'rgba(5,18,10,0.50)',
      status: 'done',   date: '2025-10',
      gallery: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=70','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=70','https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&q=70'],
      team: ['🔬','🌿','⚡']
    },
  ];

  var grid   = document.getElementById('proj-grid');
  var detail = document.getElementById('proj-detail');
  if (!grid) return;

  projects.forEach(function(p, i) {
    var card = document.createElement('div');
    card.className = 'project-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    var isActive = p.status === 'active';
    card.innerHTML =
      '<div class="project-card-img" style="position:relative;overflow:hidden;">' +
        '<img src="' + p.img + '" alt="' + p.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">' +
        '<div style="position:absolute;inset:0;background:' + p.tint + ';"></div>' +
        '<div class="project-status ' + (isActive ? 'status-active' : 'status-done') + '" style="position:absolute;top:var(--sp-4);left:var(--sp-4);">' + (isActive ? 'В процессе' : 'Завершён') + '</div>' +
      '</div>' +
      '<div class="project-body">' +
        '<div class="card-tag' + (isActive ? '' : ' coral') + '">Проект · ' + p.date + '</div>' +
        '<div class="project-title">' + p.title + '</div>' +
        '<div class="project-desc">' + p.desc + '</div>' +
        '<div class="project-meta"><span>👥 ' + (p.team.length * 3) + ' участников</span><span>📅 ' + p.date + '</span></div>' +
      '</div>';
    card.addEventListener('click', function() { toggleDetail(i, p); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetail(i, p); }
    });
    grid.appendChild(card);
  });

  function toggleDetail(i, p) {
    var existing = detail.querySelector('.project-detail.open');
    if (existing && parseInt(existing.dataset.idx) === i) {
      existing.classList.remove('open');
      return;
    }
    detail.innerHTML = '';
    /* Gallery of real images */
    var galHtml  = p.gallery.map(function(url) {
      return '<div class="pgm-item" style="overflow:hidden;position:relative;">' +
               '<img src="' + url + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;">' +
             '</div>';
    }).join('');
    var teamHtml = p.team.map(function(e, j) {
      return '<div class="participant"><div class="participant-avatar" aria-hidden="true">' + e + '</div><span>Участник ' + (j + 1) + '</span></div>';
    }).join('');
    var el = document.createElement('div');
    el.className   = 'project-detail open';
    el.dataset.idx = i;
    el.innerHTML =
      '<div class="project-detail-inner">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">' +
          '<h3 style="font-family:var(--f-display);font-size:22px;font-weight:800">' + p.title + '</h3>' +
          '<button class="btn btn-ghost btn-sm" aria-label="Закрыть детали проекта">Закрыть ✕</button>' +
        '</div>' +
        '<div class="project-gallery-mini">' + galHtml + '</div>' +
        '<p style="font-size:14px;line-height:1.8;color:var(--c-text-2);margin-bottom:32px">' + p.desc + ' Реализуется при поддержке платформы ЭкоСфера Безопасности.</p>' +
        '<div style="font-family:var(--f-data);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text-2);margin-bottom:12px">Команда проекта</div>' +
        '<div class="participants">' + teamHtml + '</div>' +
      '</div>';
    el.querySelector('.btn-ghost').addEventListener('click', function() {
      el.classList.remove('open');
    });
    detail.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  initReveal();
})();

/* ══════════════════════════════════════════════════════════════════════
   14. NEWS — Newspaper-style layout renderer
   Data: splash (1) + left off-leads (3) + center secondary (2)
         + right briefs (4) + right feature (1) + bottom row (5)
   60-30-10: dark navy tints (60%), mid-surface cards (30%), green accent (10%)
   ══════════════════════════════════════════════════════════════════════ */
(function() {

  /* ── Full article dataset ── */
  var allNews = [
    {
      id: 1, tag: 'Экология', priority: 'splash',
      img:  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=85',
      headline: 'Россия принимает обновлённый стандарт ISO 14001:2026 — что изменится для предприятий',
      deck:     'Новая редакция стандарта экологического менеджмента вводит обязательный углеродный учёт и усиливает требования к прозрачности отчётности. Эксперты ЭкоСферы объясняют ключевые изменения и дают практические рекомендации.',
      byline:   'Александр Петров · 14 марта 2026 · 5 мин чтения',
      caption:  'Промышленный объект после сертификации ISO 14001'
    },
    {
      id: 2, tag: 'Безопасность', priority: 'off-lead',
      img:  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
      headline: 'Итоги международной конференции по безопасности труда в Женеве',
      deck:     'Более 2000 делегатов из 94 стран обсудили новые подходы к охране труда в цифровую эпоху.',
      byline:   'Елена Смирнова · 12 марта 2026',
      caption:  'Участники конференции МОТ'
    },
    {
      id: 3, tag: 'Энергетика', priority: 'off-lead',
      img:  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80',
      headline: 'ЭкоСфера запускает масштабную программу обучения ISO 50001',
      deck:     'Бесплатные вебинары для 500 предприятий России в рамках национального проекта энергоэффективности.',
      byline:   'Дмитрий Орлов · 10 марта 2026',
      caption:  'Солнечные панели на объекте участника программы'
    },
    {
      id: 4, tag: 'Наука', priority: 'off-lead',
      img:  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
      headline: 'Новое исследование: культура безопасности повышает производительность на 23%',
      deck:     'Данные 847 предприятий за три года подтвердили прямую зависимость между уровнем культуры безопасности и KPI.',
      byline:   'Мария Козлова · 8 марта 2026',
      caption:  'Ветрогенераторы — объект исследования по ISO 50001'
    },
    {
      id: 5, tag: 'Города', priority: 'secondary',
      img:  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=80',
      headline: 'Казань первой в России внедрила стандарт безопасного города ISO 37120',
      deck:     'Пилотный проект охватил 12 районов и снизил число инцидентов на 34% за первый год.',
      byline:   'Игорь Николаев · 5 марта 2026',
      caption:  'Ночная Казань после внедрения умной инфраструктуры'
    },
    {
      id: 6, tag: 'Проекты', priority: 'secondary',
      img:  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&q=80',
      headline: 'Завершена экспедиция по мониторингу рек Западной Сибири',
      deck:     'Волонтёры ЭкоСферы исследовали 12 рек и собрали данные для национального экологического доклада.',
      byline:   'Анна Волкова · 3 марта 2026',
      caption:  'Одна из рек в зоне экологического мониторинга'
    },
    {
      id: 7, tag: 'Культура', priority: 'brief',
      img:  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=300&q=75',
      headline: 'Открытие выставки «Безопасность глазами художника» в Москве',
      deck:     '40 работ от художников из 15 стран.',
      byline:   '1 марта 2026'
    },
    {
      id: 8, tag: 'Экология', priority: 'brief',
      img:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=75',
      headline: 'Лесной дозор: IoT-датчики снизили число пожаров в Сибири на 41%',
      deck:     'Пилот в Красноярском крае признан лучшей практикой ООН.',
      byline:   '28 февраля 2026'
    },
    {
      id: 9, tag: 'Наука', priority: 'brief',
      img:  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300&q=75',
      headline: 'ВОЗ: качество воздуха в городах России улучшилось на 18%',
      deck:     'Прогресс связан с переходом 200 предприятий на стандарт ISO 14001.',
      byline:   '25 февраля 2026'
    },
    {
      id: 10, tag: 'Проекты', priority: 'brief',
      img:  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=75',
      headline: 'Зелёный завод Урала — победитель EcoAward 2026',
      deck:     'Проект ЭкоСферы по снижению выбросов CO₂ признан лучшим в Европе.',
      byline:   '22 февраля 2026'
    },
    {
      id: 11, tag: 'Энергетика', priority: 'right-feature',
      img:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
      headline: 'Горные общины переходят на солнечную энергию при поддержке ЭкоСферы',
      deck:     'Программа охватила 34 посёлка в горных регионах. Экономия на топливе — 60 млн руб. в год.',
      byline:   'Дмитрий Орлов · 20 февраля 2026',
      caption:  'Солнечные станции в труднодоступных районах'
    },
    {
      id: 12, tag: 'Безопасность', priority: 'bottom',
      img:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75',
      headline: 'Новые требования к кибербезопасности промышленных систем',
      deck:     'ФСТЭК выпустил обновлённые требования к защите АСУ ТП на объектах КИИ.',
      byline:   '18 февраля 2026'
    },
    {
      id: 13, tag: 'Экология', priority: 'bottom',
      img:  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=75',
      headline: 'Водопады Карелии включены в экологический мониторинг',
      deck:     'Новые точки наблюдения расширяют сеть до 312 объектов по всей России.',
      byline:   '16 февраля 2026'
    },
    {
      id: 14, tag: 'Города', priority: 'bottom',
      img:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=75',
      headline: 'Умные фонари снизили потребление энергии в Новосибирске на 35%',
      deck:     'Пилот распространяется на 15 городов России в 2026 году.',
      byline:   '14 февраля 2026'
    },
    {
      id: 15, tag: 'Наука', priority: 'bottom',
      img:  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=75',
      headline: 'Российские учёные разработали биодеградируемый сорбент нефти',
      deck:     'Новый материал разлагается за 28 дней и не вредит морской экосистеме.',
      byline:   '12 февраля 2026'
    },
    {
      id: 16, tag: 'Культура', priority: 'bottom',
      img:  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&q=75',
      headline: 'Документальный фильм «Охрана труда» взял приз на «Артдокфест»',
      deck:     'Картина снята командой ЭкоСферы и рассказывает о жизни инспекторов по безопасности.',
      byline:   '10 февраля 2026'
    },
  ];

  /* Active filter */
  var activeFilter = 'all';

  /* ── Filter buttons ── */
  document.querySelectorAll('.np-sec-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeFilter = btn.getAttribute('data-filter');
      document.querySelectorAll('.np-sec-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderAll();
    });
  });

  /* ── Helpers ── */
  function filtered(priority) {
    return allNews.filter(function(n) {
      return n.priority === priority && (activeFilter === 'all' || n.tag === activeFilter);
    });
  }

  function img(url, alt, cls) {
    return '<div class="' + cls + '-img-wrap"><img src="' + url + '" alt="' + (alt||'') + '" loading="lazy"><div class="np-img-tint"></div></div>';
  }

  /* ── Render splash ── */
  function renderSplash() {
    var sp = document.getElementById('np-splash');
    if (!sp) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'splash' && (activeFilter === 'all' || n.tag === activeFilter);
    });
    var s = items[0] || allNews[0];
    document.getElementById('np-splash-img').src    = s.img;
    document.getElementById('np-splash-img').alt    = s.headline;
    document.getElementById('np-splash-kicker').textContent  = s.tag.toUpperCase();
    document.getElementById('np-splash-headline').textContent = s.headline;
    document.getElementById('np-splash-deck').textContent     = s.deck;
    document.getElementById('np-splash-byline').textContent   = s.byline;
    sp.style.display = 'block';
  }

  /* ── Render left column (off-leads) ── */
  function renderLeft() {
    var el = document.getElementById('np-left-cards');
    if (!el) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'off-lead' && (activeFilter === 'all' || n.tag === activeFilter);
    }).slice(0, 3);
    if (!items.length) { el.innerHTML = '<div class="np-empty">Нет материалов</div>'; return; }
    el.innerHTML = items.map(function(n, i) {
      return '<article class="np-offlead" tabindex="0">' +
        '<div class="np-offlead-img-wrap"><img src="' + n.img + '" alt="' + n.headline + '" loading="lazy"><div class="np-img-tint"></div><span class="np-kicker">' + n.tag + '</span></div>' +
        '<div class="np-offlead-body">' +
          '<h3 class="np-offlead-headline">' + n.headline + '</h3>' +
          '<p class="np-offlead-deck">' + n.deck + '</p>' +
          '<div class="np-byline">' + n.byline + '</div>' +
        '</div>' +
        (i < 2 ? '<div class="np-rule"></div>' : '') +
      '</article>';
    }).join('');
  }

  /* ── Render center secondary (2 cards under splash) ── */
  function renderCenterSecondary() {
    var el = document.getElementById('np-center-secondary');
    if (!el) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'secondary' && (activeFilter === 'all' || n.tag === activeFilter);
    }).slice(0, 2);
    if (!items.length) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(function(n) {
      return '<article class="np-secondary" tabindex="0">' +
        '<div class="np-secondary-img-wrap"><img src="' + n.img + '" alt="' + n.headline + '" loading="lazy"><div class="np-img-tint"></div><span class="np-kicker">' + n.tag + '</span></div>' +
        '<div class="np-secondary-body">' +
          '<h3 class="np-secondary-headline">' + n.headline + '</h3>' +
          '<p class="np-secondary-deck">' + n.deck + '</p>' +
          '<div class="np-byline">' + n.byline + '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ── Render right column (briefs) ── */
  function renderRightBriefs() {
    var el = document.getElementById('np-right-briefs');
    if (!el) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'brief' && (activeFilter === 'all' || n.tag === activeFilter);
    }).slice(0, 4);
    if (!items.length) { el.innerHTML = '<div class="np-empty">Нет материалов</div>'; return; }
    el.innerHTML = items.map(function(n, i) {
      return '<article class="np-brief" tabindex="0">' +
        '<div class="np-brief-img-wrap"><img src="' + n.img + '" alt="' + n.headline + '" loading="lazy"><div class="np-img-tint"></div></div>' +
        '<div class="np-brief-body">' +
          '<span class="np-kicker">' + n.tag + '</span>' +
          '<h4 class="np-brief-headline">' + n.headline + '</h4>' +
          '<p class="np-brief-deck">' + n.deck + '</p>' +
          '<div class="np-byline">' + n.byline + '</div>' +
        '</div>' +
        (i < 3 ? '<div class="np-rule"></div>' : '') +
      '</article>';
    }).join('');
  }

  /* ── Render right featured ── */
  function renderRightFeature() {
    var el = document.getElementById('np-right-feature');
    if (!el) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'right-feature' && (activeFilter === 'all' || n.tag === activeFilter);
    });
    var n = items[0];
    if (!n) { el.innerHTML = ''; return; }
    el.innerHTML =
      '<article class="np-right-feat" tabindex="0">' +
        '<div class="np-right-feat-img-wrap"><img src="' + n.img + '" alt="' + n.headline + '" loading="lazy"><div class="np-img-tint"></div><span class="np-kicker">' + n.tag + '</span></div>' +
        '<h3 class="np-right-feat-headline">' + n.headline + '</h3>' +
        '<p class="np-right-feat-deck">' + n.deck + '</p>' +
        '<div class="np-byline">' + n.byline + '</div>' +
      '</article>';
  }

  /* ── Render bottom row ── */
  function renderBottom() {
    var el = document.getElementById('np-bottom-grid');
    if (!el) return;
    var items = allNews.filter(function(n) {
      return n.priority === 'bottom' && (activeFilter === 'all' || n.tag === activeFilter);
    });
    if (!items.length) { el.innerHTML = '<div class="np-empty">Нет материалов</div>'; return; }
    el.innerHTML = items.map(function(n) {
      return '<article class="np-bottom-card" tabindex="0">' +
        '<div class="np-bottom-img-wrap"><img src="' + n.img + '" alt="' + n.headline + '" loading="lazy"><div class="np-img-tint"></div></div>' +
        '<div class="np-bottom-body">' +
          '<span class="np-kicker">' + n.tag + '</span>' +
          '<h4 class="np-bottom-headline">' + n.headline + '</h4>' +
          '<div class="np-byline">' + n.byline + '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderAll() {
    renderSplash();
    renderLeft();
    renderCenterSecondary();
    renderRightBriefs();
    renderRightFeature();
    renderBottom();
  }

  renderAll();
})();

/* ══════════════════════════════════════════════════════════════════════
   15. INITIATIVE FORM — FIX: валидация по id, не по querySelectorAll
   ══════════════════════════════════════════════════════════════════════ */
window.submitInitiative = function() {
  /* Проверяем конкретные обязательные поля */
  var required = ['init-name', 'init-cat', 'init-short', 'init-problem', 'init-solution', 'init-author'];
  var empty = required.filter(function(id) {
    var el = document.getElementById(id);
    return !el || !el.value.trim();
  });

  if (empty.length > 0) {
    /* Подсвечиваем пустые поля */
    empty.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.borderColor = 'rgba(255,107,107,.6)';
        el.addEventListener('input', function() { el.style.borderColor = ''; }, { once: true });
      }
    });
    alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
    var firstEl = document.getElementById(empty[0]);
    if (firstEl) firstEl.focus();
    return;
  }

  ['is1','is2','is3','is4'].forEach(function(id, i) {
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) {
        el.className = 'init-step done';
        var dot = el.querySelector('.init-step-dot');
        if (dot) dot.textContent = '✓';
      }
    }, i * 400);
  });

  setTimeout(function() {
    alert('✅ Инициатива успешно отправлена!\nМодератор свяжется с вами в течение 3 рабочих дней.');
  }, 1800);
};

window.triggerUpload = function(id) {
  var el = document.getElementById(id);
  if (el) el.click();
};

window.handleFiles = function(input) {
  var preview = document.getElementById('file-preview');
  if (!preview) return;
  Array.from(input.files || []).forEach(function(f) {
    var chip = document.createElement('div');
    chip.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:8px;font-family:var(--f-data);font-size:12px;color:var(--c-text-2)';
    var icon = f.type.startsWith('image') ? '🖼️' : f.type.includes('video') ? '🎬' : '📄';
    var name = f.name.length > 24 ? f.name.substring(0, 24) + '…' : f.name;
    chip.textContent = icon + ' ' + name;
    preview.appendChild(chip);
  });
};

/* Drag & Drop */
(function() {
  var dz = document.getElementById('drop-zone');
  if (!dz) return;
  dz.addEventListener('dragover',  function(e) { e.preventDefault(); dz.style.borderColor = 'rgba(42,245,152,.6)'; });
  dz.addEventListener('dragleave', function()  { dz.style.borderColor = ''; });
  dz.addEventListener('drop',      function(e) {
    e.preventDefault();
    dz.style.borderColor = '';
    window.handleFiles({ files: e.dataTransfer.files });
  });
  /* Клавиатура */
  dz.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.triggerUpload('file-main'); }
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   16. REGISTRATION FORM — FIX: читаем правильные id
   ══════════════════════════════════════════════════════════════════════ */
window.registerUser = function() {
  var nameEl  = document.getElementById('reg-name');
  var emailEl = document.getElementById('reg-email');
  var pwEl    = document.getElementById('pw-input');

  var errors = [];
  if (!nameEl  || !nameEl.value.trim())              errors.push(nameEl);
  if (!emailEl || !emailEl.value.trim())             errors.push(emailEl);
  if (pwEl && pwEl.value.length < 8)                 errors.push(pwEl);

  if (errors.length) {
    errors.forEach(function(el) {
      if (!el) return;
      el.style.borderColor = 'rgba(255,107,107,.6)';
      el.addEventListener('input', function() { el.style.borderColor = ''; }, { once: true });
    });
    alert('Пожалуйста, заполните все поля корректно (пароль — минимум 8 символов)');
    if (errors[0]) errors[0].focus();
    return;
  }

  var firstName = nameEl.value.trim().split(' ')[0];
  alert('🎉 Добро пожаловать, ' + firstName + '!\nАккаунт создан. Проверьте email для подтверждения.');
};

window.togglePw = function() {
  var inp = document.getElementById('pw-input');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
};

/* Password strength */
var pwInput = document.getElementById('pw-input');
if (pwInput) {
  pwInput.addEventListener('input', function() {
    var len    = this.value.length;
    var colors = ['#FF6B6B', '#FFB347', '#4DA8FF', '#2AF598'];
    [1,2,3,4].forEach(function(i) {
      var bar = document.getElementById('pw-s' + i);
      if (bar) {
        var active = len >= i * 2;
        bar.style.background = active ? colors[Math.min(Math.floor(len / 2) - 1, 3)] : 'var(--c-border)';
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   17. RESIZE HANDLER — адаптация при изменении размера окна
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      /* Перестраиваем навигацию регистрации */
      var inner = document.getElementById('reg-inner');
      if (inner) {
        var vis = inner.querySelector('.reg-visual');
        if (window.innerWidth <= 768) {
          inner.style.gridTemplateColumns = '1fr';
          if (vis) vis.style.display = 'none';
        } else {
          inner.style.gridTemplateColumns = '';
          if (vis) vis.style.display = '';
        }
      }
    }, 150);
  }, { passive: true });
})();
