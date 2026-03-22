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
   3. STICKY NAV + MASONRY COLLAPSE SCROLL TRANSITION
   ══════════════════════════════════════════════════════════════════════ */
var stickyNav   = document.getElementById('sticky-nav');
var masonryEl   = document.getElementById('masonry');
var heroBgEl    = document.getElementById('hero-bg');
var heroTopbar  = document.querySelector('.hero-topbar');
var progressBar = document.getElementById('scroll-progress');


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

  /* ── Parallax hero background ── */
  if (heroBgEl) {
    heroBgEl.style.transform = 'translateY(' + y * 0.20 + 'px)';
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
/* ══════════════════════════════════════════════════════════════════════
   3. MOBILE MENU
   Overlay управляется CSS через body.mob-open.
   Закрытие: кнопка ✕, клик по overlay, Escape, клик по ссылке меню.
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
  if (burger) {
    burger.setAttribute('aria-expanded', 'true');
  }
  /* Фокус на первый элемент меню для a11y */
  var firstLink = mobMenu.querySelector('a, button');
  if (firstLink) setTimeout(function() { firstLink.focus(); }, 50);
}

function toggleMob() {
  if (!mobMenu) return;
  if (mobMenu.classList.contains('open')) {
    window.closeMob();
    return;
  }
  openMob();
}

window.closeMob = function() {
  if (!mobMenu) return;
  mobMenu.classList.remove('open');
  document.body.style.overflow  = '';
  document.body.classList.remove('mob-open');
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    /* Возвращаем фокус на кнопку-триггер */
    burger.focus();
  }
};

if (burger)     burger.addEventListener('click', toggleMob);
if (mobClose)   mobClose.addEventListener('click', window.closeMob);

/* Клик / тап по overlay — закрывает меню */
if (mobOverlay) {
  mobOverlay.addEventListener('click',      window.closeMob);
  mobOverlay.addEventListener('touchstart', function(e) {
    /* preventDefault блокирует ghost click на iOS */
    e.preventDefault();
    window.closeMob();
  }, { passive: false });
}

/* Escape */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.body.classList.contains('mob-open')) {
      window.closeMob();
      return;
    }
    var lb = document.getElementById('gallery-lb');
    if (lb && lb.classList.contains('show')) window.closeLb();
  }
});

/* Клик вне меню на весь document (fallback для странных браузеров) */
document.addEventListener('click', function(e) {
  if (!document.body.classList.contains('mob-open')) return;
  /* Если клик не внутри #mob-menu и не на #burger — закрыть */
  if (mobMenu && !mobMenu.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
    window.closeMob();
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
   6. ANIMATED COUNTERS + PUBLIC STATS FROM API
   Данные загружаются с /stats/public:
     - users:     сумма зарегистрированных пользователей
     - projects:  одобренные администратором проекты (status=ACTIVE|COMPLETED)
     - articles:  опубликованные статьи (status=PUBLISHED)
     - countries: уникальные страны в одобренных проектах (count > 0)
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var API_BASE = window.ECOSFERA_API || 'http://localhost:4000';

  /* easeOutCubic анимация счётчика */
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

  /* Применяем данные из API к DOM — главные счётчики + вторичные элементы */
  function applyStats(data) {
    var map = [
      { elId: 'cnt1', val: data.users,     suffix: '' },
      { elId: 'cnt2', val: data.projects,  suffix: '' },
      { elId: 'cnt3', val: data.articles,  suffix: '' },
      { elId: 'cnt4', val: data.countries, suffix: '' },
    ];
    map.forEach(function(item, i) {
      var el = document.getElementById(item.elId);
      if (!el || el.dataset.done) return;
      el.dataset.done = '1';
      setTimeout(function() {
        animateCounter(el, item.val, item.suffix, 1800);
      }, i * 120);
    });

    /* Вторичные элементы — обновляем сразу без анимации */
    var np = document.getElementById('np-countries-stat');
    if (np) np.textContent = data.countries + ' ' + (data.countries === 1 ? 'страна' : data.countries < 5 ? 'страны' : 'стран');

    var ip = document.getElementById('init-projects-stat');
    if (ip) ip.textContent = data.projects;
    var ic = document.getElementById('init-countries-stat');
    if (ic) ic.textContent = data.countries;

    var ru = document.getElementById('reg-stat-users');
    if (ru) ru.textContent = data.users > 1000
      ? Math.round(data.users / 1000) + 'K+'
      : String(data.users);
    var rc = document.getElementById('reg-stat-countries');
    if (rc) rc.textContent = String(data.countries);
    var rp = document.getElementById('reg-stat-projects');
    if (rp) rp.textContent = String(data.projects);
  }

  /* Запрос к API — с fallback на заглушку если сервер недоступен */
  function loadStats() {
    fetch(API_BASE + '/stats/public', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        window._publicStats = data;  /* сохраняем глобально для карты и лидеров */
        applyStats(data);
        buildMapPins(data.projectsByCountry || []);
        updateMapLabel(data.countries, data.projects);
      })
      .catch(function() {
        /* Fallback: показываем прочерки если API недоступен */
        ['cnt1','cnt2','cnt3','cnt4'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.textContent = '—';
        });
        updateMapLabel(0, 0);
      });
  }

  /* IntersectionObserver: запускаем fetch когда секция metrics входит в viewport */
  var metricsLoaded = false;
  var metricsObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting || metricsLoaded) return;
      metricsLoaded = true;
      loadStats();
      metricsObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  var m = document.getElementById('metrics');
  if (m) metricsObs.observe(m);

  /* Также загружаем при загрузке главной страницы без скролла */
  setTimeout(loadStats, 400);
})();

/* ══════════════════════════════════════════════════════════════════════
   7. MAP PINS + TOOLTIP
   buildMapPins(list) — принимает массив { country, count, status }
   из /stats/public и строит пины. Страна попадает на карту только
   если count > 0. Тултип показывает название страны и число проектов.
   Позиции захардкожены по ключу country (lat/lng → % внутри блока).
   ══════════════════════════════════════════════════════════════════════ */

/* Словарь страна → примерная позиция на SVG-блоке (top%, left%) */
var COUNTRY_POSITIONS = {
  'Россия':        { top: 30, left: 52 },
  'Казахстан':     { top: 38, left: 58 },
  'Беларусь':      { top: 26, left: 48 },
  'Украина':       { top: 28, left: 46 },
  'Германия':      { top: 24, left: 40 },
  'Франция':       { top: 28, left: 37 },
  'США':           { top: 32, left: 14 },
  'Китай':         { top: 34, left: 68 },
  'Индия':         { top: 40, left: 63 },
  'Бразилия':      { top: 56, left: 28 },
  'Великобритания':{ top: 22, left: 36 },
  'Канада':        { top: 22, left: 16 },
  'Австралия':     { top: 62, left: 76 },
  'Япония':        { top: 32, left: 78 },
  'ЮАР':           { top: 64, left: 46 },
  'Аргентина':     { top: 66, left: 26 },
  'Мексика':       { top: 40, left: 16 },
  'Нигерия':       { top: 48, left: 42 },
  'Египет':        { top: 36, left: 46 },
  'Турция':        { top: 30, left: 50 },
};

/* Создаёт tooltip-элемент один раз */
var _mapTip = null;
function getMapTip() {
  if (_mapTip) return _mapTip;
  _mapTip = document.createElement('div');
  _mapTip.className = 'map-tooltip';
  _mapTip.setAttribute('aria-hidden', 'true');
  _mapTip.style.cssText = [
    'position:absolute;pointer-events:none;z-index:10',
    'background:rgba(11,31,58,.95);border:1px solid rgba(42,245,152,.3)',
    'color:#e2e8f0;font-size:12px;font-family:var(--f-data,monospace)',
    'padding:5px 10px;border-radius:6px;white-space:nowrap',
    'opacity:0;transition:opacity .15s;transform:translateX(-50%)',
  ].join(';');
  var container = document.querySelector('.map-placeholder');
  if (container) container.style.position = 'relative';
  if (container) container.appendChild(_mapTip);
  return _mapTip;
}

/* Присоединяет tooltip-события к пину */
function attachPinEvents(pin, country, count, isActive) {
  var tip = getMapTip();

  function show(x, y) {
    var pr = pin.closest('.map-placeholder').getBoundingClientRect();
    tip.textContent = (isActive ? '🔴 ' : '✅ ') + country + ' · ' + count + ' проект' + (count === 1 ? '' : count < 5 ? 'а' : 'ов');
    tip.style.left    = (x - pr.left) + 'px';
    tip.style.top     = (y - pr.top - 40) + 'px';
    tip.style.opacity = '1';
  }
  function hide() { tip.style.opacity = '0'; }

  pin.addEventListener('mouseenter', function(e) { show(e.clientX, e.clientY); });
  pin.addEventListener('mousemove',  function(e) { show(e.clientX, e.clientY); });
  pin.addEventListener('mouseleave', hide);
  pin.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    show(t.clientX, t.clientY);
    setTimeout(hide, 2000);
  }, { passive: false });
  pin.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var r = pin.getBoundingClientRect();
      var pr = pin.closest('.map-placeholder').getBoundingClientRect();
      show(r.left + r.width / 2 - pr.left + pr.left, r.top - pr.top + pr.top);
      setTimeout(hide, 2000);
    }
  });
}

/* Публичная функция: вызывается из модуля счётчиков после загрузки API */
window.buildMapPins = function(list) {
  var container = document.getElementById('map-pins-container');
  if (!container) return;
  container.innerHTML = '';

  /* Фильтр: только страны с count > 0 */
  var active = (list || []).filter(function(item) { return item.count > 0; });

  active.forEach(function(item) {
    var pos = COUNTRY_POSITIONS[item.country];
    /* Если страна не в словаре — генерируем случайную позицию (fallback) */
    if (!pos) {
      pos = { top: 20 + Math.random() * 50, left: 10 + Math.random() * 75 };
    }

    var pin = document.createElement('div');
    var isActive = item.status === 'ACTIVE';
    pin.className = 'map-pin ' + (isActive ? 'map-pin--active' : 'map-pin--done');
    pin.style.top  = pos.top  + '%';
    pin.style.left = pos.left + '%';
    pin.setAttribute('data-city', item.country);
    pin.setAttribute('tabindex', '0');
    pin.setAttribute('role', 'button');
    pin.setAttribute('aria-label', item.country + ': ' + item.count + ' проектов');

    attachPinEvents(pin, item.country, item.count, isActive);
    container.appendChild(pin);
  });
};

/* Обновляет подпись под картой */
window.updateMapLabel = function(countries, projects) {
  var el = document.getElementById('map-stats-label');
  if (!el) return;
  el.textContent = (countries || 0) + ' ' + (countries === 1 ? 'страна' : countries < 5 ? 'страны' : 'стран') +
                   ' · ' + (projects || 0) + ' проектов';
};

/* ══════════════════════════════════════════════════════════════════════
   8. LEADERS CAROUSEL — API-driven
   Источник: GET /users/leaders
   Каждый лидер это пользователь с role=LEADER (назначает только ADMIN).
   Логика клика: если у лидера есть статьи (articlesCount > 0) →
   переходим на страницу Статьи с фильтром по автору.
   Если статей нет — карточка неактивна (нет cursor-pointer, нет перехода).
   Dots и carousel строятся динамически после загрузки данных.
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var API_BASE = window.ECOSFERA_API || 'http://localhost:4000';
  var track    = document.getElementById('ltck');
  var dotsWrap = document.getElementById('leader-dots');
  var current  = 0;
  var timer;
  var dotsNodeList = [];

  /* Расчёт ширины карточки включая gap */
  function cardWidth() {
    if (!track) return 300;
    var card = track.querySelector('.leader-card');
    if (!card) return 300;
    var gap = parseFloat(window.getComputedStyle(track).gap) || 24;
    return card.getBoundingClientRect().width + gap;
  }

  /* Прокрутка к слайду i */
  window.gL = function(i) {
    if (!dotsNodeList.length) return;
    current = Math.max(0, Math.min(i, dotsNodeList.length - 1));
    if (track) track.style.transform = 'translateX(-' + current * cardWidth() + 'px)';
    dotsNodeList.forEach(function(d, j) {
      d.classList.toggle('on', j === current);
      d.setAttribute('aria-selected', j === current ? 'true' : 'false');
    });
    clearInterval(timer);
    timer = setInterval(next, 4000);
  };

  function next() { window.gL((current + 1) % Math.max(1, dotsNodeList.length)); }

  /* Построить dots по количеству лидеров */
  function buildDots(count) {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    dotsNodeList = [];
    /* Показываем один dot на каждую «страницу» из 3 карточек */
    var pages = Math.ceil(count / 3) || 1;
    for (var p = 0; p < pages; p++) {
      var btn = document.createElement('button');
      btn.className = 'ldot' + (p === 0 ? ' on' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', p === 0 ? 'true' : 'false');
      btn.setAttribute('aria-label', 'Слайд ' + (p + 1));
      /* Замыкание для индекса */
      (function(idx) {
        btn.onclick = function() { window.gL(idx); };
      })(p);
      dotsWrap.appendChild(btn);
      dotsNodeList.push(btn);
    }
  }

  /* Построить карточку лидера */
  function buildCard(leader) {
    var hasArticles = (leader.articlesCount || 0) > 0;
    var card = document.createElement('div');
    card.className = 'leader-card' + (hasArticles ? ' leader-card--clickable' : ' leader-card--inactive');

    /* Фото / инициал */
    var photo = document.createElement('div');
    photo.className = 'leader-photo';
    photo.setAttribute('aria-hidden', 'true');
    if (leader.avatarUrl) {
      var img = document.createElement('img');
      img.src = leader.avatarUrl;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      photo.appendChild(img);
    } else {
      photo.textContent = leader.emoji || leader.name.charAt(0);
    }

    /* Инфо */
    var info = document.createElement('div');
    info.className = 'leader-info';

    var name = document.createElement('div');
    name.className = 'leader-name';
    name.textContent = leader.name;

    var role = document.createElement('div');
    role.className = 'leader-role';
    role.textContent = (leader.bio || leader.role || 'Участник платформы');

    var quote = document.createElement('div');
    quote.className = 'leader-quote';
    quote.textContent = leader.quote || '«Безопасность — это культура, которую мы строим вместе.»';

    info.appendChild(name);
    info.appendChild(role);
    info.appendChild(quote);

    /* Индикатор статей */
    if (hasArticles) {
      var badge = document.createElement('div');
      badge.className = 'leader-articles-badge';
      badge.textContent = leader.articlesCount + (leader.articlesCount === 1 ? ' статья' : leader.articlesCount < 5 ? ' статьи' : ' статей');
      info.appendChild(badge);
    }

    card.appendChild(photo);
    card.appendChild(info);

    /* Клик: переходим на страницу статей с фильтром по автору */
    if (hasArticles) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Статьи автора: ' + leader.name);
      card.title = 'Читать статьи · ' + leader.name;

      function goToArticles(e) {
        /* Показываем страницу статей и фильтруем по authorId */
        if (typeof showPage === 'function') showPage('p-articles');
        /* Устанавливаем фильтр после перехода */
        setTimeout(function() {
          if (typeof window.artFilterByAuthor === 'function') {
            window.artFilterByAuthor(leader.id, leader.name);
          }
        }, 80);
      }

      card.addEventListener('click', goToArticles);
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToArticles(e); }
      });
    } else {
      card.setAttribute('aria-disabled', 'true');
      card.title = 'У этого лидера пока нет статей';
    }

    return card;
  }

  /* Загрузка лидеров из API */
  function loadLeaders() {
    fetch(API_BASE + '/users/leaders', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(leaders) {
        if (!track) return;
        track.innerHTML = '';
        if (!leaders || leaders.length === 0) {
          /* Секцию скрываем если лидеров нет */
          var section = document.getElementById('leaders');
          if (section) section.style.display = 'none';
          return;
        }
        leaders.forEach(function(leader) {
          track.appendChild(buildCard(leader));
        });
        buildDots(leaders.length);

        /* Запускаем карусель */
        if (track) {
          track.addEventListener('mouseenter', function() { clearInterval(timer); });
          track.addEventListener('mouseleave', function() { timer = setInterval(next, 4000); });
          var startX = 0;
          track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
          track.addEventListener('touchend',   function(e) {
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) window.gL(dx < 0 ? current + 1 : current - 1);
          }, { passive: true });
        }
        setTimeout(function() { timer = setInterval(next, 4000); }, 600);
      })
      .catch(function(err) {
        console.warn('Leaders API unavailable:', err);
        /* Fallback — скрываем секцию */
        var section = document.getElementById('leaders');
        if (section) section.style.display = 'none';
      });
  }

  /* Пересчёт при resize */
  window.addEventListener('resize', function() {
    if (track) track.style.transform = 'translateX(-' + current * cardWidth() + 'px)';
  }, { passive: true });

  /* Загрузка при старте */
  loadLeaders();
})();

/* ══════════════════════════════════════════════════════════════════════
   9. MUSIC PLAYER — FIX: fakeProgress сбрасывается при смене трека
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var tracks = [];
  var _tracksLoaded = false;

  function loadTracks(cb) {
    if (_tracksLoaded) { if (cb) cb(); return; }
    var API = window.ECOSFERA_API || 'http://localhost:4000';
    fetch(API + '/tracks', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        tracks = (Array.isArray(data) ? data : (data.tracks || [])).map(function(t) {
          return {
            title:  t.title  || 'Трек',
            artist: t.artist || 'Исполнитель',
            dur:    t.duration || '0:00',
            durSec: t.durationSec || 0,
            likes:  t.likes || 0,
            emoji:  t.emoji || '🎵',
            isNew:  !!t.isNew,
            src:    t.src   || '',
            cover:  t.coverImage || '',
          };
        });
        _tracksLoaded = true;
        if (cb) cb();
      })
      .catch(function() {
        /* Fallback: плеер без треков */
        tracks = [];
        _tracksLoaded = true;
        if (cb) cb();
      });
  }

  /* Инициализируем плеер после загрузки треков */
  function initPlayer() {
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
    /* Update cover image if available */
    var coverImg = document.getElementById('player-cover-img');
    if (coverImg && t.coverUrl) coverImg.src = t.coverUrl;
  }

  function selectTrack(i) {
    stopSpin();
    currentIdx   = i;
    fakeProgress = 0;

    updateUI();

    var fillEl = document.getElementById('prog-fill');
    var curEl  = document.getElementById('t-cur');
    if (fillEl) fillEl.style.width  = '0%';
    if (curEl)  curEl.textContent   = '0:00';

    isPlaying = true;
    var playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.setAttribute('aria-label', 'Пауза');
      playBtn.classList.add('playing');
    }

    startSpin();
    renderTrackList();
  }

  window.togglePlay = function() {
    isPlaying = !isPlaying;
    var playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Воспроизвести');
      playBtn.classList.toggle('playing', isPlaying);
    }
    if (isPlaying) { startSpin(); }
    else { stopSpin(); }
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
  } // end initPlayer

  /* Загружаем треки при показе страницы Искусство */
  var _playerReady = false;
  var _origShowPageArt = window.showPage;
  window.showPage = function(id) {
    _origShowPageArt(id);
    if (id === 'p-art' && !_playerReady) {
      _playerReady = true;
      loadTracks(function() {
        if (tracks.length > 0) initPlayer();
      });
    }
  };

  /* Если страница уже активна — инициализируем сразу */
  if (document.getElementById('p-art') && document.getElementById('p-art').classList.contains('active')) {
    loadTracks(function() {
      if (tracks.length > 0) initPlayer();
    });
  }
})();

/* ══════════════════════════════════════════════════════════════════════
   10. ART GALLERY + LIGHTBOX
   Images: Unsplash CDN (free, no attribution required for display)
   60-30-10 palette: 60% deep navy/dark teal (bg tint), 30% mid-teal
   overlays, 10% green accent (#2AF598) on hover/active states.
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  /* Галерея загружается из API GET /gallery?type=GRID */
  var galleryData = [];
  var shownRows = 1;
  var _galleryLoaded = false;

  function loadGallery(cb) {
    if (_galleryLoaded) { if (cb) cb(); return; }
    var API = window.ECOSFERA_API || 'http://localhost:4000';
    fetch(API + '/gallery?type=GRID&limit=30', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var items = Array.isArray(data) ? data : (data.items || []);
        galleryData = items.map(function(g) {
          return {
            url:   g.imageUrl,
            title: g.title || '',
            tint:  'rgba(7,20,38,0.45)',
          };
        });
        /* Fallback: Unsplash если API недоступен */
        if (galleryData.length === 0) {
          galleryData = [
            { url:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', title:'Культура безопасности', tint:'rgba(7,20,38,0.45)' },
            { url:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', title:'Жизнь леса',            tint:'rgba(5,22,14,0.40)'  },
            { url:'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80', title:'Чистый воздух',         tint:'rgba(5,18,32,0.42)'  },
            { url:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', title:'Технологии',            tint:'rgba(7,14,38,0.50)'  },
            { url:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', title:'Зелёная планета',       tint:'rgba(5,18,12,0.45)'  },
            { url:'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80', title:'Природа под защитой',   tint:'rgba(5,18,12,0.40)'  },
          ];
        }
        _galleryLoaded = true;
        if (cb) cb();
      })
      .catch(function() {
        _galleryLoaded = true;
        if (cb) cb();
      });
  }

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

  /* Загружаем при показе страницы Искусство */
  var _galleryInited = false;
  var _origShowPageGal = window.showPage;
  window.showPage = function(id) {
    _origShowPageGal(id);
    if (id === 'p-art' && !_galleryInited) {
      _galleryInited = true;
      loadGallery(function() { renderGallery(); });
    }
  };
  if (document.getElementById('p-art') && document.getElementById('p-art').classList.contains('active')) {
    loadGallery(function() { renderGallery(); });
  }
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
   13. PROJECTS — данные из API GET /projects
   ══════════════════════════════════════════════════════════════════════ */
(function() {
  var API       = window.ECOSFERA_API || 'http://localhost:4000';
  var grid      = document.getElementById('proj-grid');
  var detailBox = document.getElementById('proj-detail');

  var STAGE_LABELS = { IDEA:'Идея', PLANNING:'Планирование', ACTIVE:'Активен', COMPLETED:'Завершён' };
  var STAGE_COLORS = {
    IDEA:      'rgba(139,92,246,.15)',
    PLANNING:  'rgba(245,158,11,.15)',
    ACTIVE:    'rgba(42,245,152,.15)',
    COMPLETED: 'rgba(148,163,184,.15)',
  };
  var STAGE_TEXT = {
    IDEA:      'var(--c-text-2)',
    PLANNING:  '#f59e0b',
    ACTIVE:    'var(--accent)',
    COMPLETED: 'var(--c-text-3)',
  };

  function renderSkeleton() {
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var sk = document.createElement('div');
      sk.style.cssText = 'background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);padding:24px;min-height:160px;opacity:0.5;animation:pulse 1.5s ease-in-out infinite alternate';
      sk.innerHTML = '<div style="height:16px;background:var(--c-border);border-radius:4px;margin-bottom:10px;width:60%"></div>' +
                     '<div style="height:12px;background:var(--c-border);border-radius:4px;width:90%"></div>';
      grid.appendChild(sk);
    }
  }

  function renderCard(p) {
    var stage  = p.stage || 'ACTIVE';
    var card   = document.createElement('div');
    card.className = 'proj-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', p.title);

    var membersCount = p.members ? p.members.length : 0;
    var stageLabel   = STAGE_LABELS[stage] || stage;

    card.innerHTML =
      '<div class="proj-card__head">' +
        '<div class="proj-emoji" aria-hidden="true">' + (p.emoji || '🌿') + '</div>' +
        '<span style="background:' + (STAGE_COLORS[stage] || 'transparent') + ';color:' + (STAGE_TEXT[stage] || 'inherit') + ';font-family:var(--f-data);font-size:11px;padding:3px 10px;border-radius:12px;font-weight:600">' + stageLabel + '</span>' +
      '</div>' +
      '<h3 class="proj-title">' + p.title + '</h3>' +
      '<p class="proj-desc">' + (p.description || '').slice(0, 120) + (p.description && p.description.length > 120 ? '…' : '') + '</p>' +
      '<div class="proj-meta">' +
        (p.location ? '<span class="proj-loc">📍 ' + p.location + '</span>' : '') +
        '<span class="proj-members">👥 ' + membersCount + '</span>' +
      '</div>' +
      '<button class="btn btn-ghost btn-sm proj-details-btn">Подробнее →</button>';

    /* Клик — открываем детали */
    card.querySelector('.proj-details-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      openDetail(p);
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(p); }
    });

    return card;
  }

  function openDetail(p) {
    if (!detailBox) return;
    detailBox.innerHTML = '';
    var stage = p.stage || 'ACTIVE';
    var membersHtml = (p.members || []).map(function(m) {
      var name = m.user ? m.user.name : 'Участник';
      return '<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:20px;font-size:12px;color:var(--c-text-2)">' +
        '<span style="width:22px;height:22px;border-radius:50%;background:var(--c-green-dim);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--c-green)">' +
        name.slice(0,1) + '</span>' + name + '</div>';
    }).join('');

    var el = document.createElement('div');
    el.className = 'proj-detail-card';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Детали проекта: ' + p.title);
    el.innerHTML =
      '<div class="proj-detail__header">' +
        '<div style="font-size:40px">' + (p.emoji || '🌿') + '</div>' +
        '<div>' +
          '<h3 style="font-family:var(--f-display);font-size:clamp(18px,2.5vw,24px);font-weight:700;margin-bottom:6px">' + p.title + '</h3>' +
          '<span style="background:' + (STAGE_COLORS[stage]||'') + ';color:' + (STAGE_TEXT[stage]||'') + ';font-family:var(--f-data);font-size:11px;padding:3px 10px;border-radius:12px;font-weight:600">' + (STAGE_LABELS[stage]||stage) + '</span>' +
          (p.location ? ' <span style="font-size:12px;color:var(--c-text-3);margin-left:6px">📍 ' + p.location + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<p style="font-size:14px;color:var(--c-text-2);line-height:1.75;margin-bottom:var(--sp-5)">' + (p.description || '') + '</p>' +
      (membersHtml ? '<div style="font-family:var(--f-data);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--c-text-2);margin-bottom:12px">Команда проекта</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:var(--sp-5)">' + membersHtml + '</div>' : '') +
      '<button class="btn btn-ghost" style="margin-top:8px">Закрыть ✕</button>';

    el.querySelector('.btn-ghost').addEventListener('click', function() {
      detailBox.innerHTML = '';
    });
    detailBox.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function loadProjects() {
    renderSkeleton();
    fetch(API + '/projects?status=ACTIVE&limit=24', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var list = Array.isArray(data) ? data : (data.projects || []);
        if (!grid) return;
        grid.innerHTML = '';
        if (list.length === 0) {
          grid.innerHTML = '<p style="color:var(--c-text-3);font-size:14px;grid-column:1/-1;text-align:center;padding:40px 0">Проектов пока нет</p>';
          return;
        }
        list.forEach(function(p) { grid.appendChild(renderCard(p)); });
        initReveal();
      })
      .catch(function(err) {
        console.warn('Projects API unavailable', err);
        if (grid) grid.innerHTML = '<p style="color:var(--c-text-3);font-size:14px;grid-column:1/-1;text-align:center;padding:40px 0">Не удалось загрузить проекты</p>';
      });
  }

  /* Загружаем при показе страницы проектов */
  var _origShowPage = window.showPage;
  window.showPage = function(id) {
    _origShowPage(id);
    if (id === 'p-projects') loadProjects();
  };

  /* Если страница уже активна при загрузке */
  if (document.getElementById('p-projects') && document.getElementById('p-projects').classList.contains('active')) {
    loadProjects();
  }

  initReveal();  initReveal();
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
   15. INITIATIVE FORM — подключена к POST /initiatives
   ══════════════════════════════════════════════════════════════════════ */
window.submitInitiative = function() {
  var required = ['init-name', 'init-cat', 'init-short', 'init-problem', 'init-solution', 'init-author'];
  var empty = required.filter(function(id) {
    var el = document.getElementById(id);
    return !el || !el.value.trim();
  });

  if (empty.length > 0) {
    empty.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.borderColor = 'rgba(255,107,107,.6)';
        el.addEventListener('input', function() { el.style.borderColor = ''; }, { once: true });
      }
    });
    var firstEl = document.getElementById(empty[0]);
    if (firstEl) firstEl.focus();
    return;
  }

  /* Блокируем кнопку */
  var btn = document.querySelector('[onclick="submitInitiative()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Отправка…'; }

  /* Анимация шагов */
  ['is1','is2','is3'].forEach(function(id, i) {
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) {
        el.className = 'init-step done';
        var dot = el.querySelector('.init-step-dot');
        if (dot) dot.textContent = '✓';
      }
    }, i * 300);
  });

  var payload = {
    name:       document.getElementById('init-name').value.trim(),
    category:   document.getElementById('init-cat').value.trim(),
    shortDesc:  document.getElementById('init-short').value.trim(),
    problem:    document.getElementById('init-problem').value.trim(),
    solution:   document.getElementById('init-solution').value.trim(),
    result:     (document.getElementById('init-result')  || {}).value || '',
    location:   (document.getElementById('init-loc')     || {}).value || '',
    duration:   (document.getElementById('init-dur')     || {}).value || '',
    resources:  (document.getElementById('init-res')     || {}).value || '',
    links:      (document.getElementById('init-link')    || {}).value || '',
    authorName: document.getElementById('init-author').value.trim(),
  };

  /* Пробуем получить токен авторизованного пользователя */
  var token = null;
  try {
    var stored = JSON.parse(localStorage.getItem('ecosfera_auth') || '{}');
    token = stored.accessToken || null;
  } catch(e) {}

  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  fetch((window.ECOSFERA_API || 'http://localhost:4000') + '/initiatives', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  })
  .then(function(r) {
    return r.json().then(function(data) {
      if (!r.ok) throw new Error(data.error || 'Ошибка отправки');
      return data;
    });
  })
  .then(function() {
    /* Финальный шаг */
    var is4 = document.getElementById('is4');
    if (is4) {
      is4.className = 'init-step done';
      var dot = is4.querySelector('.init-step-dot');
      if (dot) dot.textContent = '✓';
    }

    /* Заменяем форму на успех-экран */
    setTimeout(function() {
      var grid = document.querySelector('.init-form-grid');
      if (grid) {
        grid.innerHTML = '<div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:20px;text-align:center">' +
          '<div style="font-size:64px">✅</div>' +
          '<h2 style="font-family:var(--f-display);font-size:clamp(22px,3vw,36px);color:var(--c-text-1)">Инициатива отправлена!</h2>' +
          '<p style="color:var(--c-text-2);max-width:440px;line-height:1.8">Модератор свяжется с вами в течение 3 рабочих дней.<br>Спасибо за вклад в культуру безопасности.</p>' +
          '<button class="btn btn-ghost btn-lg" onclick="showPage(\'p-home\')">На главную</button>' +
        '</div>';
      }
    }, 900);
  })
  .catch(function(err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Отправить инициативу →'; }
    /* Сброс шагов */
    ['is1','is2','is3'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.className = el.id === 'is1' ? 'init-step done' : 'init-step';
    });
    /* Показываем ошибку */
    var errEl = document.getElementById('init-error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.id = 'init-error-msg';
      errEl.style.cssText = 'color:#FF6B6B;font-size:13px;margin-top:10px;text-align:center';
      btn && btn.parentNode && btn.parentNode.insertBefore(errEl, btn.nextSibling);
    }
    errEl.textContent = err.message;
  });
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
   16. REGISTRATION FORM — подключена к /auth/register
   ══════════════════════════════════════════════════════════════════════ */
window.registerUser = function() {
  var nameEl  = document.getElementById('reg-name');
  var emailEl = document.getElementById('reg-email');
  var pwEl    = document.getElementById('pw-input');
  var btn     = document.querySelector('[onclick="registerUser()"]');

  /* Валидация */
  var errors = [];
  if (!nameEl  || nameEl.value.trim().length < 2)    errors.push(nameEl);
  if (!emailEl || !emailEl.value.includes('@'))       errors.push(emailEl);
  if (!pwEl    || pwEl.value.length < 8)              errors.push(pwEl);

  if (errors.length) {
    errors.forEach(function(el) {
      if (!el) return;
      el.style.borderColor = 'rgba(255,107,107,.6)';
      el.addEventListener('input', function() { el.style.borderColor = ''; }, { once: true });
    });
    errors[0] && errors[0].focus();
    return;
  }

  /* Блокируем кнопку */
  if (btn) { btn.disabled = true; btn.textContent = 'Регистрация…'; }

  fetch((window.ECOSFERA_API || 'http://localhost:4000') + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:     nameEl.value.trim(),
      email:    emailEl.value.trim(),
      password: pwEl.value,
    }),
  })
  .then(function(r) {
    return r.json().then(function(data) {
      if (!r.ok) throw new Error(data.error || 'Ошибка регистрации');
      return data;
    });
  })
  .then(function(data) {
    /* Сохраняем токены */
    try {
      localStorage.setItem('ecosfera_auth', JSON.stringify({ refreshToken: data.refreshToken }));
      var exp = new Date(Date.now() + 864e5).toUTCString();
      document.cookie = 'ecosfera_access=' + encodeURIComponent(data.accessToken) + ';expires=' + exp + ';path=/;SameSite=Lax';
    } catch(e) {}

    /* Показываем успех */
    var inner = document.getElementById('reg-inner');
    if (inner) {
      inner.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:400px;gap:20px;text-align:center">' +
        '<div style="font-size:56px">🎉</div>' +
        '<h2 style="font-family:var(--f-display);font-size:clamp(24px,3vw,36px);color:var(--c-text-1)">Добро пожаловать, ' + data.user.name.split(' ')[0] + '!</h2>' +
        '<p style="color:var(--c-text-2);max-width:340px">Ваш аккаунт создан. Переходите в личный кабинет.</p>' +
        '<a href="http://localhost:3000/dashboard" class="btn btn-primary btn-lg" style="margin-top:8px">Перейти в кабинет →</a>' +
      '</div>';
    }
  })
  .catch(function(err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Создать аккаунт →'; }
    /* Показываем ошибку под кнопкой */
    var existing = document.getElementById('reg-error-msg');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'reg-error-msg';
      existing.style.cssText = 'color:#FF6B6B;font-size:13px;margin-top:8px;text-align:center';
      btn && btn.parentNode && btn.parentNode.insertBefore(existing, btn.nextSibling);
    }
    existing.textContent = err.message;
  });
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

/* ══════════════════════════════════════════════════════════════════════
   17. ARTICLES PAGE — SPA module
   Data layer: mock JSON (mirrors Prisma Article/User/Like schema).
   Prod: replace artFetch() with axios.get('http://localhost:4000/articles')
   ══════════════════════════════════════════════════════════════════════ */
(function() {

  /* ── ARTICLES loaded from API ── */
  var ARTICLES = [];          /* будет заполнен из GET /articles */
  var _articlesLoaded = false;

  /* Нормализуем статью из API в формат, совместимый с рендером */
  function normalizeArticle(a) {
    return {
      id:        a.id,
      slug:      a.slug,
      title:     a.title,
      lead:      a.lead   || '',
      tag:       a.tag    || 'general',
      tagLabel:  { iso:'ISO / ГОСТ', ecology:'Экология', safety:'Охрана труда',
                   energy:'Энергетика', culture:'Культура', general:'Общее' }[a.tag] || a.tag,
      cover:     a.coverImage || '',
      readMin:   a.readTime || 5,
      published: a.status === 'PUBLISHED',
      views:     a.views  || 0,
      likes:     a.likes  || 0,
      createdAt: (a.createdAt || '').slice(0, 10),
      author: {
        id:       a.author ? a.author.id : '',
        name:     a.author ? a.author.name : 'Автор',
        role:     a.author ? (a.author.bio || a.author.role || '') : '',
        avatarUrl: a.author ? (a.author.avatarUrl || '') : '',
        initials: a.author ? a.author.name.slice(0,2).toUpperCase() : 'АВ',
      },
      content: Array.isArray(a.content) ? a.content : [],
    };
  }

  function loadArticlesFromAPI(callback) {
    if (_articlesLoaded) { if (callback) callback(); return; }
    var API = window.ECOSFERA_API || 'http://localhost:4000';
    fetch(API + '/articles?limit=50', { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var list = Array.isArray(data) ? data : (data.articles || []);
        ARTICLES = list.map(normalizeArticle);
        _articlesLoaded = true;
        if (callback) callback();
      })
      .catch(function(err) {
        console.warn('Articles API unavailable, using empty list', err);
        ARTICLES = [];
        _articlesLoaded = true;
        if (callback) callback();
      });
  }

  var currentArticleId = null;
  var likedArticles    = {};
  var activeTag        = 'all';
  var searchQuery      = '';
  var activeAuthorId   = null;   /* фильтр по автору — заполняется из карточки лидера */
  var activeAuthorName = '';
  var shownCount       = 4;
  var DRAFT_KEY        = 'ecosfera_draft';
  var editorBlocks     = [];

  /* ── Filtering & sorting ── */
  function getFiltered() {
    return ARTICLES.filter(function(a) {
      var tagOk    = activeTag === 'all' || a.tag === activeTag;
      var searchOk = !searchQuery || (
        a.title.toLowerCase().includes(searchQuery) ||
        a.lead.toLowerCase().includes(searchQuery) ||
        a.author.name.toLowerCase().includes(searchQuery)
      );
      /* Фильтр по автору-лидеру: сравниваем по id ИЛИ по имени (mock-данные не имеют id) */
      var authorOk = !activeAuthorId || a.author.id === activeAuthorId || a.author.name === activeAuthorName;
      return tagOk && searchOk && authorOk;
    });
  }

  /* Публичная функция: вызывается при клике на карточку лидера */
  window.artFilterByAuthor = function(authorId, authorName) {
    activeAuthorId   = authorId;
    activeAuthorName = authorName || '';
    activeTag        = 'all';
    searchQuery      = '';
    shownCount       = 4;

    /* Сбрасываем тег и поиск визуально */
    document.querySelectorAll('.art-tag').forEach(function(b) { b.classList.remove('art-tag--active'); });
    var allTag = document.querySelector('.art-tag[data-tag="all"]');
    if (allTag) allTag.classList.add('art-tag--active');
    var si = document.getElementById('art-search-input');
    if (si) si.value = '';

    /* Показываем баннер «Статьи автора: Имя» */
    var banner = document.getElementById('art-author-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'art-author-banner';
      banner.style.cssText = [
        'display:flex;align-items:center;gap:10px;padding:10px 16px',
        'background:rgba(42,245,152,.08);border:1px solid rgba(42,245,152,.2)',
        'border-radius:10px;font-size:13px;color:var(--c-text-2)',
        'margin-bottom:16px',
      ].join(';');
      var grid = document.getElementById('art-grid');
      if (grid && grid.parentNode) grid.parentNode.insertBefore(banner, grid);
    }
    banner.style.display = 'flex';
    banner.innerHTML =
      '<span style="color:var(--accent)">🏆 Статьи лидера:</span>' +
      '<strong style="color:var(--c-text-1)">' + (authorName || '') + '</strong>' +
      '<button onclick="window.artClearAuthorFilter()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--c-text-3);font-size:18px;line-height:1" aria-label="Сбросить фильтр">✕</button>';

    renderList();
  };

  /* Сброс фильтра по автору */
  window.artClearAuthorFilter = function() {
    activeAuthorId   = null;
    activeAuthorName = '';
    var banner = document.getElementById('art-author-banner');
    if (banner) banner.style.display = 'none';
    shownCount = 4;
    renderList();
  };

  function getSorted(arr) {
    var sel = document.getElementById('art-sort-select');
    var mode = sel ? sel.value : 'newest';
    return arr.slice().sort(function(a, b) {
      if (mode === 'newest')  return new Date(b.createdAt) - new Date(a.createdAt);
      if (mode === 'popular') return b.views - a.views;
      if (mode === 'reading') return a.readMin - b.readMin;
      return 0;
    });
  }

  /* ── Render article card ── */
  function renderCard(a) {
    var card = document.createElement('article');
    card.className = 'art-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', a.title);
    card.innerHTML =
      '<div class="art-card__img-wrap">' +
        '<img src="' + a.cover + '" alt="' + a.title + '" loading="lazy">' +
        '<div class="art-card__tint"></div>' +
        '<span class="art-card__tag">' + a.tagLabel + '</span>' +
      '</div>' +
      '<div class="art-card__body">' +
        '<h2 class="art-card__title">' + a.title + '</h2>' +
        '<p  class="art-card__lead">'  + a.lead.substring(0, 110) + '…</p>' +
        '<div class="art-card__meta">' +
          '<div class="art-card__author">' +
            '<div class="art-card__avatar">' + a.author.initials + '</div>' +
            '<span>' + a.author.name + '</span>' +
          '</div>' +
          '<div class="art-card__stats">' +
            '<span>' + a.readMin + ' мин</span>' +
            '<span>' + a.views.toLocaleString('ru-RU') + ' просм</span>' +
            '<span>' + (likedArticles[a.id] ? '♥' : '♡') + ' ' + a.likes + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    card.addEventListener('click', function() { artOpenArticle(a.id); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); artOpenArticle(a.id); }
    });
    return card;
  }

  /* ── Render list ── */
  function renderList() {
    var grid = document.getElementById('art-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var items = getSorted(getFiltered()).slice(0, shownCount);
    if (!items.length) {
      grid.innerHTML = '<div class="art-empty">По вашему запросу статей не найдено</div>';
      document.getElementById('art-load-btn').style.display = 'none';
      return;
    }
    items.forEach(function(a) { grid.appendChild(renderCard(a)); });
    var all = getFiltered().length;
    document.getElementById('art-load-btn').style.display = shownCount >= all ? 'none' : 'inline-flex';
    if (window._initStagger) window._initStagger();
  }

  window.artLoadMore = function() {
    shownCount += 4;
    renderList();
  };

  /* ── Open full article ── */
  function artOpenArticle(id) {
    var a = ARTICLES.find(function(x) { return x.id === id; });
    if (!a) return;
    currentArticleId = id;

    /* fill fields */
    var $ = function(sel) { return document.getElementById(sel); };
    $('art-cover-img').src    = a.cover;
    $('art-cover-img').alt    = a.title;
    $('art-kicker').textContent  = a.tagLabel;
    $('art-title').textContent   = a.title;
    $('art-lead').textContent    = a.lead;
    $('art-reading-time').textContent = a.readMin + ' мин чтения ·';
    $('art-date').textContent    = new Date(a.createdAt).toLocaleDateString('ru-RU', {day:'numeric',month:'long',year:'numeric'});
    $('art-author-name').textContent = a.author.name;
    $('art-author-role').textContent = a.author.role;
    $('art-author-avatar').textContent = a.author.initials;
    $('art-like-count').textContent    = a.likes + (likedArticles[id] ? ' ♥' : '');

    /* render Editor.js-style blocks */
    var body = $('art-body');
    body.innerHTML = '';
    (a.content || []).forEach(function(block) {
      var el;
      if (block.type === 'paragraph') {
        el = document.createElement('p');
        el.className = 'art-block-p';
        el.textContent = block.text;
      } else if (block.type === 'heading') {
        el = document.createElement('h2');
        el.className = 'art-block-h';
        el.textContent = block.text;
      } else if (block.type === 'quote') {
        el = document.createElement('blockquote');
        el.className = 'art-block-quote';
        el.innerHTML = '<p>' + block.text + '</p>' +
          (block.caption ? '<cite>' + block.caption + '</cite>' : '');
      } else if (block.type === 'list') {
        el = document.createElement('ul');
        el.className = 'art-block-list';
        (block.items || []).forEach(function(item) {
          var li = document.createElement('li');
          li.textContent = item;
          el.appendChild(li);
        });
      } else if (block.type === 'image') {
        el = document.createElement('figure');
        el.className = 'art-block-img';
        el.innerHTML = '<img src="' + (block.url||'') + '" alt="' + (block.caption||'') + '" loading="lazy">' +
          (block.caption ? '<figcaption>' + block.caption + '</figcaption>' : '');
      }
      if (el) body.appendChild(el);
    });

    /* related */
    var relGrid = $('art-related-grid');
    relGrid.innerHTML = '';
    ARTICLES.filter(function(x) { return x.id !== id && x.tag === a.tag; })
      .slice(0, 3)
      .forEach(function(rel) {
        var div = document.createElement('div');
        div.className = 'art-related__card';
        div.innerHTML =
          '<div class="art-related__card-img"><img src="' + rel.cover + '" alt="' + rel.title + '" loading="lazy"></div>' +
          '<div class="art-related__card-title">' + rel.title + '</div>' +
          '<div class="art-related__card-meta">' + rel.author.name + ' · ' + rel.readMin + ' мин</div>';
        div.addEventListener('click', function() { artOpenArticle(rel.id); window.scrollTo({top:0,behavior:'instant'}); });
        relGrid.appendChild(div);
      });

    artShowView('article');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ── Like ── */
  window.artToggleLike = function() {
    if (!currentArticleId) return;
    var a = ARTICLES.find(function(x) { return x.id === currentArticleId; });
    if (!a) return;
    if (likedArticles[currentArticleId]) {
      likedArticles[currentArticleId] = false;
      a.likes = Math.max(0, a.likes - 1);
    } else {
      likedArticles[currentArticleId] = true;
      a.likes++;
    }
    var btn = document.getElementById('art-like-btn');
    if (btn) btn.classList.toggle('liked', likedArticles[currentArticleId]);
    var cnt = document.getElementById('art-like-count');
    if (cnt) cnt.textContent = a.likes + (likedArticles[currentArticleId] ? ' ♥' : '');
  };

  /* ── Share ── */
  window.artShare = function(method) {
    var url = window.location.href + '#' + currentArticleId;
    if (method === 'tg') window.open('https://t.me/share/url?url=' + encodeURIComponent(url));
    if (method === 'copy') {
      navigator.clipboard.writeText(url).then(function() { alert('Ссылка скопирована!'); });
    }
  };

  /* ── View switcher ── */
  window.artShowView = function(name) {
    ['list','article','write'].forEach(function(v) {
      var el = document.getElementById('art-view-' + v);
      if (el) el.style.display = v === name ? 'block' : 'none';
    });
    if (name === 'list') { shownCount = 4; renderList(); }
    if (name === 'write') initComposer();
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  /* ── Tag filters ── */
  document.querySelectorAll('.art-tag').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.art-tag').forEach(function(b) { b.classList.remove('art-tag--active'); });
      btn.classList.add('art-tag--active');
      activeTag  = btn.getAttribute('data-tag');
      shownCount = 4;
      renderList();
    });
  });

  /* ── Search ── */
  var searchInput = document.getElementById('art-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchQuery = this.value.toLowerCase().trim();
      shownCount  = 4;
      renderList();
    });
  }

  /* ── Sort ── */
  var sortSel = document.getElementById('art-sort-select');
  if (sortSel) sortSel.addEventListener('change', renderList);

  /* ── Composer (Editor.js-style blocks) ── */
  function initComposer() {
    editorBlocks = [{ type: 'paragraph', text: '' }];
    renderEditorBlocks();
    var draftRaw = localStorage.getItem(DRAFT_KEY);
    if (draftRaw) {
      try {
        var d = JSON.parse(draftRaw);
        if (d.title)  document.getElementById('composer-title').value = d.title;
        if (d.lead)   document.getElementById('composer-lead').value  = d.lead;
        if (d.blocks) { editorBlocks = d.blocks; renderEditorBlocks(); }
      } catch(e) {}
    }
  }

  window.artAddBlock = function(type) {
    var block = { type: type };
    if (type === 'paragraph') block.text = '';
    if (type === 'heading')   block.text = '';
    if (type === 'quote')     { block.text = ''; block.caption = ''; }
    if (type === 'image')     { block.url = ''; block.caption = ''; }
    if (type === 'list')      block.items = [''];
    editorBlocks.push(block);
    renderEditorBlocks();
  };

  function renderEditorBlocks() {
    var editor = document.getElementById('art-editor');
    if (!editor) return;
    editor.innerHTML = '';
    editorBlocks.forEach(function(block, idx) {
      var wrap = document.createElement('div');
      wrap.className = 'art-editor__block';
      wrap.setAttribute('data-idx', idx);

      var deleteBtn = '<button class="art-editor__block-del" onclick="artDeleteBlock(' + idx + ')" aria-label="Удалить блок">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';

      if (block.type === 'paragraph') {
        wrap.innerHTML = deleteBtn + '<textarea class="art-editor__input art-editor__para" placeholder="Начните писать…" oninput="artUpdateBlock(' + idx + ',\'text\',this.value)">' + (block.text||'') + '</textarea>';
      } else if (block.type === 'heading') {
        wrap.innerHTML = deleteBtn + '<input class="art-editor__input art-editor__head" type="text" placeholder="Заголовок раздела…" value="' + (block.text||'') + '" oninput="artUpdateBlock(' + idx + ',\'text\',this.value)">';
      } else if (block.type === 'quote') {
        wrap.innerHTML = deleteBtn +
          '<textarea class="art-editor__input art-editor__quote-text" placeholder="Текст цитаты…" oninput="artUpdateBlock(' + idx + ',\'text\',this.value)">' + (block.text||'') + '</textarea>' +
          '<input class="art-editor__input art-editor__quote-cap" type="text" placeholder="Источник цитаты…" value="' + (block.caption||'') + '" oninput="artUpdateBlock(' + idx + ',\'caption\',this.value)">';
      } else if (block.type === 'image') {
        wrap.innerHTML = deleteBtn +
          '<input class="art-editor__input" type="url" placeholder="URL изображения (Cloudinary/S3)…" value="' + (block.url||'') + '" oninput="artUpdateBlock(' + idx + ',\'url\',this.value)">' +
          '<input class="art-editor__input" type="text" placeholder="Подпись к фото…" value="' + (block.caption||'') + '" oninput="artUpdateBlock(' + idx + ',\'caption\',this.value)">';
      } else if (block.type === 'list') {
        var itemsHtml = (block.items||['']).map(function(item, ii) {
          return '<div class="art-editor__list-item">' +
            '<input class="art-editor__input" type="text" placeholder="Пункт списка…" value="' + item + '" oninput="artUpdateListItem(' + idx + ',' + ii + ',this.value)">' +
            '</div>';
        }).join('');
        wrap.innerHTML = deleteBtn + '<div class="art-editor__list-wrap">' + itemsHtml +
          '<button class="art-editor__add-item" onclick="artAddListItem(' + idx + ')">+ Добавить пункт</button></div>';
      }
      editor.appendChild(wrap);
    });
  }

  window.artUpdateBlock = function(idx, key, val) {
    if (editorBlocks[idx]) editorBlocks[idx][key] = val;
  };
  window.artUpdateListItem = function(idx, ii, val) {
    if (editorBlocks[idx] && editorBlocks[idx].items) editorBlocks[idx].items[ii] = val;
  };
  window.artAddListItem = function(idx) {
    if (editorBlocks[idx] && editorBlocks[idx].items) {
      editorBlocks[idx].items.push('');
      renderEditorBlocks();
    }
  };
  window.artDeleteBlock = function(idx) {
    editorBlocks.splice(idx, 1);
    renderEditorBlocks();
  };

  /* ── Slug generator ── */
  window.artUpdateSlug = function(title) {
    var slug = title.toLowerCase()
      .replace(/[а-яёА-ЯЁ]/g, function(c) {
        var map = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
        return map[c.toLowerCase()] || c;
      })
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 60);
    var pre = document.getElementById('composer-slug-preview');
    if (pre) pre.textContent = slug || '—';
  };

  /* ── Cover preview ── */
  window.artPreviewCover = function(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var preview = document.getElementById('composer-cover-preview');
      var ph = document.getElementById('composer-cover-ph');
      if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
      if (ph) ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  /* ── Save / Publish ── */
  window.artSaveDraft = function() {
    var draft = {
      title:  document.getElementById('composer-title').value,
      lead:   document.getElementById('composer-lead').value,
      blocks: editorBlocks
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert('Черновик сохранён локально.\nProd: POST /articles { published: false }');
  };

  window.artPublish = function() {
    var title  = document.getElementById('composer-title').value.trim();
    var author = document.getElementById('composer-author').value.trim();
    if (!title)  { alert('Введите заголовок'); return; }
    if (!author) { alert('Укажите автора'); return; }
    /* Mock: add to local array */
    var newArt = {
      id: 'art-' + Date.now(),
      slug: title.toLowerCase().replace(/\s+/g,'-').slice(0,60),
      title: title,
      lead:  document.getElementById('composer-lead').value || 'Нет описания',
      tag:   document.getElementById('composer-tag').value,
      tagLabel: document.getElementById('composer-tag').options[document.getElementById('composer-tag').selectedIndex].text,
      cover: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
      readMin: parseInt(document.getElementById('composer-read').value) || 5,
      published: true,
      views: 0, likes: 0,
      createdAt: new Date().toISOString().slice(0,10),
      author: { name: author, role: 'Автор', avatarUrl: '', initials: author.slice(0,2).toUpperCase() },
      content: editorBlocks
    };
    ARTICLES.unshift(newArt);
    localStorage.removeItem(DRAFT_KEY);
    alert('✅ Статья "' + title + '" опубликована!\nProd: POST http://localhost:4000/articles');
    artShowView('list');
  };

  /* ── Init — загружаем из API, затем рендерим ── */
  loadArticlesFromAPI(function() {
    renderList();
  });
  /* При переключении на страницу статей — перезагружаем если ещё нет данных */
  var _origArtShowView = window.artShowView;
  window.artShowView = function(name) {
    if (name === 'list' && !_articlesLoaded) {
      loadArticlesFromAPI(function() { _origArtShowView(name); });
      return;
    }
    _origArtShowView(name);
  };

})();
