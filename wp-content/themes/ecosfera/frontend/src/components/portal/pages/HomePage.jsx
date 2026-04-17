import { useState } from 'react';

const RADAR_POINTS = {
  Москва: { x: 272, y: 132 },
  'Санкт-Петербург': { x: 142, y: 258 },
  Казань: { x: 318, y: 282 },
  Екатеринбург: { x: 96, y: 145 },
  Новосибирск: { x: 240, y: 326 },
  Краснодар: { x: 176, y: 95 },
  Ростов: { x: 332, y: 172 },
};

function MetricCard({ value, label, icon, delay }) {
  return (
    <div className="metric reveal" style={{ transitionDelay: delay }}>
      <span className="metric-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="metric-val">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

function getProjectStatusClass(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return ['finish', 'done', 'completed', 'finished', 'завершен', 'завершён'].includes(normalized) ? '1' : '0';
}

function getRadarPoint(cityName, index) {
  if (RADAR_POINTS[cityName]) {
    return RADAR_POINTS[cityName];
  }

  const fallbackPoints = [
    { x: 272, y: 132 },
    { x: 142, y: 258 },
    { x: 318, y: 282 },
    { x: 96, y: 145 },
    { x: 240, y: 326 },
    { x: 176, y: 95 },
    { x: 332, y: 172 },
  ];

  return fallbackPoints[index % fallbackPoints.length];
}

function RadarMap({ projects = [] }) {
  const [tooltipProject, setTooltipProject] = useState(null);
  const radarProjects = projects
    .filter((project) => project.city && project.url)
    .slice(0, 7)
    .map((project, index) => ({
      ...project,
      point: getRadarPoint(project.city, index),
      isDone: getProjectStatusClass(project.status) === '1',
      pulseDuration: `${2 + (index % 4) * 0.45}s`,
    }));

  const tooltipLeft = tooltipProject ? Math.max(16, tooltipProject.point.x - 30) : 110;
  const tooltipTop = tooltipProject ? Math.max(16, tooltipProject.point.y - 58) : 72;

  return (
    <div className="radar-wrap stagger-item" data-stagger="1">
      <div
        className={`radar-tooltip${tooltipProject ? ' show' : ''}`}
        id="r-tip"
        role="tooltip"
        aria-live="polite"
        style={{ left: `${tooltipLeft}px`, top: `${tooltipTop}px` }}
      >
        {tooltipProject ? (
          <>
            <span
              className={`radar-tooltip__status radar-tooltip__status--${tooltipProject.isDone ? 'done' : 'active'}`}
              aria-hidden="true"
            />
            <span>{tooltipProject.city}</span>
          </>
        ) : null}
      </div>
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="200" cy="200" r="185" stroke="rgba(42,245,152,.06)" strokeWidth="1" />
        <circle cx="200" cy="200" r="145" stroke="rgba(42,245,152,.08)" strokeWidth="1" />
        <circle cx="200" cy="200" r="105" stroke="rgba(42,245,152,.1)" strokeWidth="1" />
        <circle cx="200" cy="200" r="65" stroke="rgba(42,245,152,.13)" strokeWidth="1" />
        <line x1="15" y1="200" x2="385" y2="200" stroke="rgba(42,245,152,.05)" strokeWidth="1" />
        <line x1="200" y1="15" x2="200" y2="385" stroke="rgba(42,245,152,.05)" strokeWidth="1" />
        <line x1="69" y1="69" x2="331" y2="331" stroke="rgba(42,245,152,.04)" strokeWidth="1" strokeDasharray="4 6" />
        <line x1="331" y1="69" x2="69" y2="331" stroke="rgba(42,245,152,.04)" strokeWidth="1" strokeDasharray="4 6" />
        <path d="M200,200 L200,15 A185,185 0 0,1 385,200 Z" fill="rgba(42,245,152,.035)">
          <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="5s" repeatCount="indefinite" />
        </path>
        <circle cx="200" cy="200" r="5" fill="var(--c-green)" />
        <circle cx="200" cy="200" r="16" fill="rgba(42,245,152,.14)" />

        {radarProjects.map((project) => (
          <a key={project.id} href={project.url}>
            <g
              className="radar-dot"
              data-city={project.city}
              data-ok={project.isDone ? '1' : '0'}
              tabIndex="0"
              role="button"
              aria-label={`${project.city} — ${project.isDone ? 'завершён' : 'в процессе'}`}
              onMouseEnter={() => setTooltipProject(project)}
              onMouseLeave={() => setTooltipProject(null)}
              onFocus={() => setTooltipProject(project)}
              onBlur={() => setTooltipProject(null)}
            >
              <circle cx={project.point.x} cy={project.point.y} r="6" fill={project.isDone ? 'var(--c-green)' : 'var(--c-coral)'}>
                <animate attributeName="opacity" values="1;.15;1" dur={project.pulseDuration} repeatCount="indefinite" />
              </circle>
              <circle
                cx={project.point.x}
                cy={project.point.y}
                r="14"
                fill={project.isDone ? 'rgba(42,245,152,.14)' : 'rgba(255,107,107,.14)'}
              />
            </g>
          </a>
        ))}
      </svg>
    </div>
  );
}

export function HomePage({ data, changePage }) {
  const projects = data?.collections?.projects || [];
  const posts = data?.collections?.posts || [];
  const initiatives = data?.collections?.initiatives || [];
  const pages = data?.collections?.pages || [];
  const stats = data?.stats || {};
  const participantsCount = stats.participants || 0;
  const projectsCount = stats.projects || 0;
  const countriesCount = stats.countries || 0;

  const metrics = [
    {
      label: 'Участников',
      value: participantsCount.toLocaleString('ru-RU'),
      delay: '0s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Проектов',
      value: projectsCount,
      delay: '.1s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: 'Документов',
      value: posts.length || 8,
      delay: '.2s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: 'Стран',
      value: countriesCount,
      delay: '.3s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

  const leaders = (pages.length ? pages : posts).slice(0, 4);

  return (
    <>
      <section id="hero" aria-label="Главный экран">
        <div className="hero__bg" id="hero-bg" aria-hidden="true" />
        <div className="hero__content">
          <div className="hero__label">Портал культуры безопасности</div>
          <h1 className="hero__title">
            Культура безопасности
            <br />
            <em>нового уровня</em>
          </h1>
          <p className="hero__sub">Объединяем экспертов, проекты и знания — создаём пространство, где безопасность становится частью жизни каждого.</p>
          <div className="hero__actions">
            <a className="btn-primary" href="#metrics">
              Начать
            </a>
            <button className="btn-secondary" type="button" onClick={() => changePage('projects')}>
              Подробнее
            </button>
          </div>
          <nav className="hero__nav" aria-label="Разделы платформы">
            {[
              [
                'art',
                'Искусство',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="art-icon">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>,
              ],
              [
                'projects',
                'Проекты',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="projects-icon">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>,
              ],
              [
                'news',
                'Новости',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="news-icon">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
                  <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                  <path d="M4 22a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                </svg>,
              ],
              [
                'initiative',
                'Инициатива',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="initiative-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>,
              ],
              [
                'register',
                'Регистрация',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="register-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>,
              ],
            ].map(([pageId, label, icon]) => (
              <button key={pageId} className="hero-nav-item" type="button" onClick={() => changePage(pageId)}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section id="slogan" className="stagger-section">
        <div className="sec-label both stagger-item">Миссия платформы</div>
        <h1 className="slogan-h1 stagger-item">
          Безопасность —
          <br />
          это <em>культура</em> будущего
        </h1>
        <p className="slogan-h2 stagger-item">Наука. Практика. Творчество.</p>
        <p className="slogan-body stagger-item">Объединяем экспертов, энтузиастов и лидеров вместе — создаём пространство, где знания о безопасности становятся частью жизни каждого.</p>
        <div className="slogan-btns stagger-item">
          <a className="btn btn-primary btn-lg" href="#metrics">
            Исследовать платформу →
          </a>
          <button className="btn btn-ghost btn-lg" type="button" onClick={() => changePage('initiative')}>
            Предложить инициативу
          </button>
        </div>
      </section>

      <section id="metrics">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section id="radar" className="sec stagger-section">
        <div className="container">
          <div className="radar-layout">
            <div>
              <div className="sec-label stagger-item">География проектов</div>
              <h2 className="sec-h2 stagger-item">Карта безопасности</h2>
              <p className="sec-sub stagger-item">Активные инициативы по городам. Нажмите на точку радара, чтобы открыть соответствующий проект.</p>
              <button className="btn-primary stagger-item" type="button" onClick={() => changePage('projects')}>
                Все проекты →
              </button>
              <div className="map-legend stagger-item">
                <span className="map-legend__item map-legend__item--done">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" fill="var(--accent)" />
                  </svg>
                  Завершён
                </span>
                <span className="map-legend__item map-legend__item--active">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" fill="var(--accent-danger)" />
                  </svg>
                  В процессе
                </span>
              </div>
            </div>
            <RadarMap projects={projects} />
          </div>
        </div>
      </section>

      <section id="leaders" className="stagger-section">
        <div className="container" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="sec-label stagger-item">Сообщество</div>
          <h2 className="sec-h2 stagger-item">Лидеры платформы</h2>
        </div>
        <div className="leaders-outer stagger-item" style={{ padding: '0 var(--sp-8)' }}>
          <div className="leaders-track" id="ltck">
            {leaders.map((item) => (
              <article key={item.id} className="leader-card">
                <div className="leader-card__avatar">{item.title.slice(0, 1)}</div>
                <div className="leader-card__name">{item.title}</div>
                <div className="leader-card__role">{item.excerpt || 'Материал из WordPress'}</div>
              </article>
            ))}
          </div>
        </div>
        <div className="leader-dots" role="tablist" aria-label="Навигация по лидерам">
          {leaders.map((item) => (
            <span key={item.id} className="leader-dot" aria-hidden="true" />
          ))}
        </div>
      </section>
    </>
  );
}
