/* ══════════════════════════════════════════════════════════════════════
   ЭкоСфера Безопасности — main.js
   Версия: 3.0 | 2026
   Весь интерактив сайта: SPA навигация, плеер, галерея, карусель,
   счётчики, радар, формы, GSAP scroll-трансформация.
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
    p.style.display = '';
  });

  var target = document.getElementById(id);
  if (!target) return;

  if (id === 'p-register') {
    target.style.display = 'block';
    target.classList.add('active');
    var inner = document.getElementById('reg-inner');
    if (inner && window.innerWidth <= 768) {
      inner.style.gridTemplateColumns = '1fr';
      var vis = inner.querySelector('.reg-visual');
      if (vis) vis.style.display = 'none';
    }
  } else {
    target.classList.add('active');
  }

  navLinks.forEach(function(a) {
    a.classList.toggle('active', a.id === 'nl-' + id.replace('p-', ''));
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
  initReveal();
}

window.showPage = showPage;
window.goHome   = function() { showPage('p-home'); };

/* ══════════════════════════════════════════════════════════════════════
   2. STICKY NAV + SCROLL TRANSFORM (GSAP / fallback)
   ══════════════════════════════════════════════════════════════════════ */
var stickyNav = document.getElementById('sticky-nav');
var masonryEl = document.getElementById('masonry');
var heroBgEl  = document.getElementById('hero-bg');

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom 25%',
    onUpdate: function(s) {
      var p = s.progress;

      /* Показываем sticky-nav после 35% прокрутки hero */
      if (stickyNav) stickyNav.classList.toggle('show', p > 0.35);

      /* Плавное исчезновение Masonry-сетки */
      if (masonryEl) {
        masonryEl.style.opacity    = p < .15 ? 1 : Math.max(0, 1 - (p - .15) / .35);
        masonryEl.style.transform  = 'scale(' + (1 - p * .03) + ')';
      }

      /* Параллакс фона */
      if (heroBgEl) {
        heroBgEl.style.transform = 'translateY(' + (s.progress * 100 * .25) + 'px)';
      }
    }
  });

} else {
  /* Fallback без GSAP */
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (stickyNav) stickyNav.classList.toggle('show', y > window.innerHeight * 0.4);
    if (heroBgEl)  heroBgEl.style.transform = 'translateY(' + y * 0.25 + 'px)';
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════════════
   3. MOBILE MENU
   ══════════════════════════════════════════════════════════════════════ */
var burger   = document.getElementById('burger');
var mobMenu  = document.getElementById('mob-menu');
var mobClose = document.getElementById('mob-close');

if (burger) {
  burger.addEventListener('click', function() {
    mobMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

window.closeMob = function() {
  if (mobMenu) mobMenu.classList.remove('open');
  document.body.style.overflow = '';
};

if (mobClose) mobClose.addEventListener('click', window.closeMob);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') window.closeMob();
});

/* ══════════════════════════════════════════════════════════════════════
   4. KEYBOARD NAVIGATION — masonry blocks
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
   5. REVEAL ON SCROLL (Intersection Observer)
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
  /* easeOutCubic плавное замедление к концу */
  function animateCounter(el, target, suffix, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
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
      var items = entry.target.querySelectorAll('[data-target]');
      items.forEach(function(item, i) {
        var valEl  = item.querySelector('.metric-val');
        if (!valEl || valEl.dataset.done) return;
        valEl.dataset.done = '1';
        setTimeout(function() {
          animateCounter(valEl, parseInt(item.dataset.target), item.dataset.suffix || '', 1800);
        }, i * 120);
      });
      metricsObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  var metricsSection = document.getElementById('metrics');
  if (metricsSection) metricsObs.observe(metricsSection);
})();

/* ══════════════════════════════════════════════════════════════════════
   7. RADAR TOOLTIP
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var tip = document.getElementById('r-tip');
  if (!tip) return;

  document.querySelectorAll('.radar-dot').forEach(function(dot) {
    dot.style.cursor = 'pointer';

    dot.addEventListener('mouseenter', function() {
      tip.textContent = (dot.dataset.ok === '1' ? '✅ ' : '🔴 ') + dot.dataset.city;
      tip.classList.add('show');
    });

    dot.addEventListener('mousemove', function(e) {
      var pr   = dot.closest('.radar-wrap').getBoundingClientRect();
      tip.style.left = (e.clientX - pr.left + 12) + 'px';
      tip.style.top  = (e.clientY - pr.top  - 36) + 'px';
    });

    dot.addEventListener('mouseleave', function() {
      tip.classList.remove('show');
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   8. LEADERS CAROUSEL (auto-rotate)
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var track   = document.getElementById('ltck');
  var dots    = document.querySelectorAll('.ldot');
  var current = 0;
  var timer;

  function cardWidth() {
    var card = track && track.querySelector('.leader-card');
    return card ? card.offsetWidth + 24 : 300; /* gap = 24px */
  }

  window.gL = function(i) {
    current = i;
    if (track) track.style.transform = 'translateX(-' + i * cardWidth() + 'px)';
    dots.forEach(function(d, j) { d.classList.toggle('on', j === i); });
    clearInterval(timer);
    timer = setInterval(next, 4000);
  };

  function next() { window.gL((current + 1) % dots.length); }

  if (track) {
    track.addEventListener('mouseenter', function() { clearInterval(timer); });
    track.addEventListener('mouseleave', function() { timer = setInterval(next, 4000); });
  }

  timer = setInterval(next, 4000);
})();

/* ══════════════════════════════════════════════════════════════════════
   9. MUSIC PLAYER
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var tracks = [
    { title: 'Звуки природы',     artist: 'ЭкоСфера Band',        dur: '3:42', likes: 847,  emoji: '🌿', isNew: true  },
    { title: 'Безопасный путь',   artist: 'Алексей Волков',        dur: '4:15', likes: 623,  emoji: '🛤️', isNew: true  },
    { title: 'Культура будущего', artist: 'Мария Козлова',         dur: '5:02', likes: 1204, emoji: '🌟', isNew: false },
    { title: 'Зелёная энергия',   artist: 'Дмитрий Орлов',         dur: '3:28', likes: 445,  emoji: '⚡', isNew: false },
    { title: 'Живая планета',     artist: 'ЭкоСфера Хор',          dur: '6:11', likes: 980,  emoji: '🌍', isNew: false },
    { title: 'Охрана труда',      artist: 'Петров & Смирнова',     dur: '2:54', likes: 312,  emoji: '⚙️', isNew: false },
    { title: 'Лесная симфония',   artist: 'Анна Волкова',          dur: '7:23', likes: 756,  emoji: '🌲', isNew: false },
  ];

  /* Сортировка: новые → популярные → хронология */
  var sorted = tracks.slice().sort(function(a, b) {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    return b.likes - a.likes;
  });

  var currentIdx = 0;
  var isPlaying  = false;
  var rotation   = 0;
  var spinTimer  = null;
  var fakeProgress = 0;

  /* Waveform генерация */
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
      list.appendChild(row);
      buildWf('twf-' + i, 12);
    });
  }

  function selectTrack(i) {
    currentIdx   = i;
    fakeProgress = 0;
    var t = sorted[i];

    var titleEl  = document.getElementById('now-title');
    var artistEl = document.getElementById('now-artist');
    var durEl    = document.getElementById('t-dur');
    var fillEl   = document.getElementById('prog-fill');
    var curEl    = document.getElementById('t-cur');
    var arm      = document.getElementById('arm');

    if (titleEl)  titleEl.textContent  = t.title;
    if (artistEl) artistEl.textContent = t.artist;
    if (durEl)    durEl.textContent    = t.dur;
    if (fillEl)   fillEl.style.width   = '0%';
    if (curEl)    curEl.textContent    = '0:00';
    if (arm)      arm.className        = 'gram-arm playing';

    isPlaying = true;
    var playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.textContent = '⏸';
    startSpin();
    renderTrackList();
  }

  window.togglePlay = function() {
    isPlaying = !isPlaying;
    var playBtn = document.getElementById('play-btn');
    var arm     = document.getElementById('arm');
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
    if (isPlaying)  { startSpin();  if (arm) arm.className = 'gram-arm playing'; }
    else            { stopSpin();   if (arm) arm.className = 'gram-arm'; }
  };

  function startSpin() {
    stopSpin();
    var vinyl = document.getElementById('vinyl');
    var startTime = Date.now() - (rotation / 360) * 2000;

    spinTimer = setInterval(function() {
      if (!vinyl) return;
      rotation = ((Date.now() - startTime) / 2000 * 360) % 360;
      vinyl.style.transform = 'rotate(' + rotation + 'deg)';

      /* Симуляция прогресса */
      fakeProgress = Math.min(fakeProgress + 0.015, 100);
      var fillEl   = document.getElementById('prog-fill');
      var curEl    = document.getElementById('t-cur');
      if (fillEl) fillEl.style.width = fakeProgress + '%';
      if (curEl) {
        var secs = Math.floor(fakeProgress / 100 * 240);
        curEl.textContent = Math.floor(secs / 60) + ':' + (secs % 60 < 10 ? '0' : '') + (secs % 60);
      }

      /* Waveform анимация */
      var activeWf = document.getElementById('twf-' + currentIdx);
      if (activeWf) {
        activeWf.querySelectorAll('.wf-bar').forEach(function(b) {
          b.style.animationPlayState = 'running';
        });
      }

      /* Автопереход к следующему треку */
      if (fakeProgress >= 100) {
        stopSpin();
        window.nextTrack();
      }
    }, 16);
  }

  function stopSpin() {
    clearInterval(spinTimer);
    document.querySelectorAll('.wf-bar').forEach(function(b) {
      b.style.animationPlayState = 'paused';
    });
  }

  window.prevTrack  = function() { selectTrack((currentIdx - 1 + sorted.length) % sorted.length); };
  window.nextTrack  = function() { selectTrack((currentIdx + 1) % sorted.length); };

  window.likeTrack  = function() {
    sorted[currentIdx].likes++;
    var btn = document.getElementById('like-btn');
    if (btn) btn.classList.toggle('liked');
    renderTrackList();
  };

  window.seekTrack  = function(e) {
    var track = document.getElementById('prog-track');
    if (!track) return;
    var rect = track.getBoundingClientRect();
    fakeProgress = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
    var fillEl = document.getElementById('prog-fill');
    if (fillEl) fillEl.style.width = fakeProgress + '%';
  };

  /* Init */
  renderTrackList();
  selectTrack(0);
})();

/* ══════════════════════════════════════════════════════════════════════
   10. ART GALLERY + LIGHTBOX
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var galleryData = [
    { emoji: '🌿', bg: '#0a2a1a' }, { emoji: '⚡', bg: '#1a1a0a' }, { emoji: '🔬', bg: '#0a1a2a' },
    { emoji: '🌊', bg: '#0a1530' }, { emoji: '🏔️', bg: '#1a0a2e' }, { emoji: '🌸', bg: '#2a0a1a' },
    { emoji: '🦋', bg: '#0a2010' }, { emoji: '🌍', bg: '#0a1a0a' }, { emoji: '🔥', bg: '#2a1a0a' },
  ];
  var shownRows = 1;

  function renderGallery() {
    var grid = document.getElementById('gal-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var items = galleryData.slice(0, shownRows * 3);
    items.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'gallery-item reveal';
      el.innerHTML =
        '<div style="width:100%;height:100%;background:linear-gradient(135deg,' + item.bg + ',' + item.bg.replace('0a', '1a') + ');display:flex;align-items:center;justify-content:center;font-size:56px">' + item.emoji + '</div>' +
        '<div class="gallery-item-overlay">🔍</div>';
      el.addEventListener('click', function() { openLightbox(item.emoji, item.bg); });
      grid.appendChild(el);
    });

    var moreBtn = document.getElementById('gal-more');
    if (moreBtn) moreBtn.style.display = shownRows * 3 >= galleryData.length ? 'none' : 'inline-flex';
    initReveal();
  }

  window.loadMoreGallery = function() { shownRows++; renderGallery(); };

  function openLightbox(emoji, bg) {
    var lb  = document.getElementById('gallery-lb');
    var img = document.getElementById('lb-img');
    if (!lb || !img) return;

    /* Canvas-заглушка вместо реального изображения */
    var canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 600;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 600);
    ctx.font = '180px serif';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, 400, 340);
    img.src = canvas.toDataURL();
    lb.classList.add('show');
  }

  window.closeLb = function() {
    var lb = document.getElementById('gallery-lb');
    if (lb) lb.classList.remove('show');
  };

  /* Закрытие по Escape */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeLb();
  });

  renderGallery();
})();

/* ══════════════════════════════════════════════════════════════════════
   11. VIDEO SIDEBAR
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var videos = [
    { emoji: '🏭', title: 'ISO 45001: внедрение за 30 дней',    author: 'А. Петров · 12:30'  },
    { emoji: '🌱', title: 'Экологический аудит предприятия',     author: 'Е. Смирнова · 8:45' },
    { emoji: '⚡', title: 'Энергоэффективность ISO 50001',       author: 'Д. Орлов · 15:20'   },
    { emoji: '🔬', title: 'Лабораторная безопасность',           author: 'М. Козлова · 9:10'  },
    { emoji: '🌍', title: 'Углеродный след компании',            author: 'И. Николаев · 22:05'},
    { emoji: '🏗️', title: 'Строительная безопасность',          author: 'А. Волкова · 11:33' },
  ];

  var sidebar = document.getElementById('vsidebar');
  if (!sidebar) return;

  videos.forEach(function(v) {
    var el = document.createElement('div');
    el.className = 'video-rec';
    el.innerHTML =
      '<div class="video-rec-thumb"><span>' + v.emoji + '</span></div>' +
      '<div><div class="video-rec-title">' + v.title + '</div><div class="video-rec-meta">' + v.author + '</div></div>';
    sidebar.appendChild(el);
  });
})();

window.toggleVideo = function() {
  var btn = document.getElementById('vid-play');
  if (btn) btn.textContent = btn.textContent === '▶' ? '⏸' : '▶';
};

/* ══════════════════════════════════════════════════════════════════════
   12. PHOTO SLIDER
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var slides = [
    { emoji: '🌿', title: 'Жизнь леса',      sub: 'Экологический проект Сибири',       bg: '#0a2a1a' },
    { emoji: '🌊', title: 'Чистые реки',      sub: 'Экспедиция по очистке водоёмов',    bg: '#0a1530' },
    { emoji: '🏔️', title: 'Горные маршруты', sub: 'Безопасность в дикой природе',       bg: '#1a0a2e' },
    { emoji: '🌸', title: 'Городские сады',   sub: 'Зелёная урбанизация',                bg: '#2a0a1a' },
    { emoji: '⚡', title: 'Чистая энергия',   sub: 'Возобновляемые источники',           bg: '#1a1a0a' },
  ];
  var cur  = 0;
  var wrap = document.getElementById('ps-wrap');
  if (!wrap) return;

  function render() {
    /* Убираем старые слайды */
    wrap.querySelectorAll('.photo-slide').forEach(function(el) { el.remove(); });

    var order   = [(cur - 1 + slides.length) % slides.length, cur, (cur + 1) % slides.length];
    var classes = ['ps-top', 'ps-center', 'ps-bottom'];

    order.forEach(function(idx, pos) {
      var s  = slides[idx];
      var el = document.createElement('div');
      el.className = 'photo-slide ' + classes[pos];
      el.innerHTML =
        '<div class="ps-bg-deco" style="background:linear-gradient(135deg,' + s.bg + ',' + s.bg.replace('0a', '1a') + ')">' + s.emoji + '</div>' +
        '<div class="ps-content">' +
          '<div class="ps-title">' + s.title + '</div>' +
          '<div class="ps-sub">' + s.sub + '</div>' +
          (pos === 1 ? '<button class="btn btn-primary btn-sm">Подробнее →</button>' : '') +
        '</div>';
      wrap.appendChild(el);
    });

    /* Стрелки */
    var oldArrows = wrap.querySelector('.ps-arrows');
    if (oldArrows) oldArrows.remove();
    var arrows = document.createElement('div');
    arrows.className = 'ps-arrows';
    arrows.innerHTML =
      '<button class="ps-arrow" onclick="psMove(-1)" aria-label="Вверх">▲</button>' +
      '<button class="ps-arrow" onclick="psMove(1)" aria-label="Вниз">▼</button>';
    wrap.appendChild(arrows);
  }

  window.psMove = function(dir) {
    cur = (cur + dir + slides.length) % slides.length;
    render();
  };

  render();
})();

/* ══════════════════════════════════════════════════════════════════════
   13. PROJECTS
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var projects = [
    { title: 'Зелёный завод',       desc: 'Снижение выбросов CO₂ на предприятиях Урала на 40%.', emoji: '🏭', status: 'done',   date: '2025-11', gallery: ['🏭','📊','🌿','⚙️'], team: ['👷','🔬','🌿'] },
    { title: 'Чистые реки Сибири',  desc: 'Экспедиция по очистке 12 рек и мониторинг воды.',     emoji: '🌊', status: 'active', date: '2026-01', gallery: ['🌊','🔬','🗺️','📷'], team: ['🌿','🔬','⚡','🎨'] },
    { title: 'Безопасный город',     desc: 'Аудит городской инфраструктуры и стандарты безопасности.', emoji: '🏙️', status: 'active', date: '2025-12', gallery: ['🏙️','🗺️','📋','🔧'], team: ['🏗️','⚡','👷'] },
    { title: 'Школьная безопасность',desc: 'ISO 45001 в 50 школах трёх регионов.',                emoji: '🏫', status: 'done',   date: '2025-09', gallery: ['🏫','📚','✅','🌟'], team: ['🌿','🎨','🔬'] },
    { title: 'Солнечная энергия',    desc: 'Установка 200 панелей в малых городах.',               emoji: '☀️', status: 'active', date: '2026-02', gallery: ['☀️','⚡','🔧','📊'], team: ['⚡','🏗️','🌿','👷'] },
    { title: 'Лесной дозор',         desc: 'IoT-мониторинг лесных пожаров.',                       emoji: '🌲', status: 'done',   date: '2025-10', gallery: ['🌲','📡','🗺️','🔥'], team: ['🔬','🌿','⚡'] },
  ];

  var grid   = document.getElementById('proj-grid');
  var detail = document.getElementById('proj-detail');
  if (!grid) return;

  projects.forEach(function(p, i) {
    var card = document.createElement('div');
    card.className = 'project-card reveal';
    var isActive = p.status === 'active';
    card.innerHTML =
      '<div class="project-card-img" style="background:linear-gradient(135deg,#101D30,#152238)">' +
        '<span style="font-size:56px">' + p.emoji + '</span>' +
        '<div class="project-status ' + (isActive ? 'status-active' : 'status-done') + '">' + (isActive ? 'В процессе' : 'Завершён') + '</div>' +
      '</div>' +
      '<div class="project-body">' +
        '<div class="card-tag' + (isActive ? '' : ' coral') + '">Проект · ' + p.date + '</div>' +
        '<div class="project-title">' + p.title + '</div>' +
        '<div class="project-desc">' + p.desc + '</div>' +
        '<div class="project-meta"><span>👥 ' + (p.team.length * 3) + ' участников</span><span>📅 ' + p.date + '</span></div>' +
      '</div>';
    card.addEventListener('click', function() { toggleDetail(i, p); });
    grid.appendChild(card);
  });

  function toggleDetail(i, p) {
    var existing = detail.querySelector('.project-detail.open');
    if (existing && existing.dataset.idx == i) { existing.classList.remove('open'); return; }
    detail.innerHTML = '';

    var galHtml  = p.gallery.map(function(e)  { return '<div class="pgm-item"><span>' + e + '</span></div>'; }).join('');
    var teamHtml = p.team.map(function(e, j)   { return '<div class="participant"><div class="participant-avatar">' + e + '</div><span>Участник ' + (j + 1) + '</span></div>'; }).join('');

    var el = document.createElement('div');
    el.className  = 'project-detail open';
    el.dataset.idx = i;
    el.innerHTML =
      '<div class="project-detail-inner">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">' +
          '<h3 style="font-family:var(--f-display);font-size:22px;font-weight:800">' + p.title + '</h3>' +
          '<button class="btn btn-ghost btn-sm" onclick="this.closest(\'.project-detail\').classList.remove(\'open\')">Закрыть ✕</button>' +
        '</div>' +
        '<div class="project-gallery-mini">' + galHtml + '</div>' +
        '<p style="font-size:14px;line-height:1.8;color:var(--c-text-2);margin-bottom:32px">' + p.desc + ' Реализуется при поддержке платформы ЭкоСфера Безопасности.</p>' +
        '<div style="font-family:var(--f-data);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text-2);margin-bottom:12px">Команда проекта</div>' +
        '<div class="participants">' + teamHtml + '</div>' +
      '</div>';

    detail.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  initReveal();
})();

/* ══════════════════════════════════════════════════════════════════════
   14. NEWS
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  /* Splash */
  var splash = document.getElementById('news-splash');
  if (splash) {
    splash.innerHTML =
      '<div class="news-splash-img" style="background:linear-gradient(135deg,#0d2948,#1a1035);font-size:96px">🏭</div>' +
      '<div class="news-splash-body">' +
        '<div class="news-splash-tag">Главная новость</div>' +
        '<h2 class="news-splash-h">Россия принимает обновлённый стандарт ISO 14001:2026 — что изменится для предприятий</h2>' +
        '<p class="news-splash-standfirst">Новая редакция стандарта экологического менеджмента вводит обязательный углеродный учёт. Эксперты платформы объясняют ключевые изменения.</p>' +
        '<div class="news-splash-meta">14 марта 2026 · Александр Петров · 5 мин чтения</div>' +
      '</div>';
  }

  /* Grid */
  var newsItems = [
    { emoji: '🌿', tag: 'Экология',   title: 'Итоги международной конференции по безопасности труда',          standfirst: 'Более 2000 делегатов из 94 стран обсудили новые подходы.',          meta: '12 марта 2026 · 3 мин' },
    { emoji: '⚡', tag: 'Энергетика', title: 'ЭкоСфера запускает программу обучения ISO 50001',                standfirst: 'Бесплатные вебинары для 500 предприятий России.',                     meta: '10 марта 2026 · 4 мин' },
    { emoji: '🔬', tag: 'Наука',      title: 'Исследование: культура безопасности и производительность',       standfirst: 'Данные 847 предприятий показали рост эффективности на 23%.',         meta: '8 марта 2026 · 6 мин'  },
    { emoji: '🏙️', tag: 'Города',    title: 'Казань первой внедрила стандарт безопасного города ISO 37120',   standfirst: 'Пилотный проект снизил число инцидентов на 34%.',                    meta: '5 марта 2026 · 5 мин'  },
    { emoji: '🌊', tag: 'Проекты',    title: 'Завершена экспедиция по мониторингу рек Западной Сибири',        standfirst: 'Волонтёры исследовали 12 рек и собрали данные для доклада.',         meta: '3 марта 2026 · 3 мин'  },
    { emoji: '🎨', tag: 'Культура',   title: 'Открытие выставки «Безопасность глазами художника»',            standfirst: '40 работ от художников из 15 стран в Москве.',                       meta: '1 марта 2026 · 2 мин'  },
  ];

  var grid = document.getElementById('news-grid');
  if (!grid) return;

  newsItems.forEach(function(n) {
    var el = document.createElement('div');
    el.className = 'news-card reveal';
    el.innerHTML =
      '<div class="news-card-img" style="background:linear-gradient(135deg,#101D30,#152238)"><span style="font-size:44px">' + n.emoji + '</span></div>' +
      '<div class="news-card-body">' +
        '<div class="news-card-tag">' + n.tag + '</div>' +
        '<div class="news-card-h">' + n.title + '</div>' +
        '<div class="news-card-standfirst">' + n.standfirst + '</div>' +
        '<div class="news-card-meta">' + n.meta + '</div>' +
      '</div>';
    grid.appendChild(el);
  });

  initReveal();
})();

/* ══════════════════════════════════════════════════════════════════════
   15. INITIATIVE FORM
   ══════════════════════════════════════════════════════════════════════ */
window.submitInitiative = function() {
  var inputs = document.querySelectorAll('#p-initiative .form-input');
  var filled = Array.from(inputs).filter(function(i) { return i.value.trim(); }).length;

  if (filled < 3) {
    alert('Пожалуйста, заполните обязательные поля (отмечены *)');
    return;
  }

  /* Анимируем прогресс шагов */
  ['is1','is2','is3','is4'].forEach(function(id, i) {
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) {
        el.className = 'init-step done';
        el.querySelector('.init-step-dot').textContent = '✓';
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
  Array.from(input.files).forEach(function(f) {
    var chip = document.createElement('div');
    chip.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:8px;font-family:var(--f-data);font-size:12px;color:var(--c-text-2)';
    chip.innerHTML = (f.type.startsWith('image') ? '🖼️' : f.type.includes('video') ? '🎬' : '📄') + ' ' + f.name.substring(0, 24) + (f.name.length > 24 ? '…' : '');
    preview.appendChild(chip);
  });
};

/* Drag & Drop */
(function() {
  var dz = document.getElementById('drop-zone');
  if (!dz) return;
  dz.addEventListener('dragover',  function(e) { e.preventDefault(); dz.style.borderColor = 'rgba(42,245,152,.6)'; });
  dz.addEventListener('dragleave', function()  { dz.style.borderColor = ''; });
  dz.addEventListener('drop',      function(e) { e.preventDefault(); dz.style.borderColor = ''; window.handleFiles({ files: e.dataTransfer.files }); });
})();

/* ══════════════════════════════════════════════════════════════════════
   16. REGISTRATION FORM
   ══════════════════════════════════════════════════════════════════════ */
window.registerUser = function() {
  var nameEl  = document.querySelector('#p-register input[type="text"]');
  var emailEl = document.querySelector('#p-register input[type="email"]');
  if (!nameEl || !nameEl.value.trim() || !emailEl || !emailEl.value.trim()) {
    alert('Пожалуйста, заполните имя и email');
    return;
  }
  var firstName = nameEl.value.trim().split(' ')[0];
  alert('🎉 Добро пожаловать, ' + firstName + '!\nАккаунт создан. Проверьте email для подтверждения.');
};

window.togglePw = function() {
  var inp = document.getElementById('pw-input');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
};

/* Password strength indicator */
var pwInput = document.getElementById('pw-input');
if (pwInput) {
  pwInput.addEventListener('input', function() {
    var len    = this.value.length;
    var colors = ['#FF6B6B', '#FFB347', '#4DA8FF', '#2AF598'];
    [1,2,3,4].forEach(function(i) {
      var bar = document.getElementById('pw-s' + i);
      if (bar) bar.style.background = len > (i - 1) * 2 ? colors[Math.min(Math.floor(len / 2) - 1, 3)] : 'var(--c-border)';
    });
  });
}
