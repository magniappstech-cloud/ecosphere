import { getTopLevelMenu, resolvePortalPageId } from '@/lib/navigation';

function MetricCard({ value, label, icon, delay }) {
  return (
    <div className="metric reveal" style={{ transitionDelay: delay }}>
      <span className="metric-icon" aria-hidden="true">{icon}</span>
      <span className="metric-val">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

function ProjectPins({ projects }) {
  const visibleProjects = (projects || []).slice(0, 5);

  return (
    <div className="map-pins">
      {visibleProjects.map((project, index) => (
        <button
          key={project.id}
          type="button"
          className="map-pin"
          style={{ left: `${18 + index * 16}%`, top: `${28 + (index % 3) * 16}%` }}
          title={project.title}
        />
      ))}
    </div>
  );
}

export function HomePage({ data, changePage }) {
  const projects = data?.collections?.projects || [];
  const posts = data?.collections?.posts || [];
  const initiatives = data?.collections?.initiatives || [];
  const pages = data?.collections?.pages || [];
  const footerPlatformMenu = getTopLevelMenu(data?.navigation?.footerPlatform || data?.navigation?.footer || []);
  const footerCommunityMenu = getTopLevelMenu(data?.navigation?.footerCommunity || []);
  const footerResourcesMenu = getTopLevelMenu(data?.navigation?.footerResources || []);

  const renderFooterItem = (item) => {
    const pageId = resolvePortalPageId(item.url);

    if (pageId) {
      return (
        <button type="button" onClick={() => changePage(pageId)}>
          {item.title}
        </button>
      );
    }

    return (
      <a href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined}>
        {item.title}
      </a>
    );
  };

  const metrics = [
    {
      label: 'Участников',
      value: (projects.length + initiatives.length + 12000).toLocaleString('ru-RU'),
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
      value: projects.length || 6,
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
      value: Math.max(projects.length, 4),
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
          <h1 className="hero__title">Культура безопасности<br /><em>нового уровня</em></h1>
          <p className="hero__sub">Объединяем экспертов, проекты и знания — создаём пространство, где безопасность становится частью жизни каждого.</p>
          <div className="hero__actions">
            <a className="btn-primary" href="#metrics">Начать</a>
            <button className="btn-secondary" type="button" onClick={() => changePage('projects')}>Подробнее</button>
          </div>
          <nav className="hero__nav" aria-label="Разделы платформы">
            {[
              ['art', 'Искусство', (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="art-icon">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              )],
              ['projects', 'Проекты', (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="projects-icon">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )],
              ['news', 'Новости', (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="news-icon">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
                  <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                  <path d="M4 22a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                </svg>
              )],
              ['initiative', 'Инициатива', (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="initiative-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              )],
              ['register', 'Регистрация', (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="register-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )],
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
        <h1 className="slogan-h1 stagger-item">Безопасность —<br />это <em>культура</em> будущего</h1>
        <p className="slogan-h2 stagger-item">Наука. Практика. Творчество.</p>
        <p className="slogan-body stagger-item">Объединяем экспертов, энтузиастов и лидеров вместе — создаём пространство, где знания о безопасности становятся частью жизни каждого.</p>
        <div className="slogan-btns stagger-item">
          <a className="btn btn-primary btn-lg" href="#metrics">Исследовать платформу →</a>
          <button className="btn btn-ghost btn-lg" type="button" onClick={() => changePage('initiative')}>Предложить инициативу</button>
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
              <p className="sec-sub stagger-item">Активные инициативы по всему миру. Нажмите на точку — узнайте подробности.</p>
              <button className="btn-primary stagger-item" type="button" onClick={() => changePage('projects')}>Все проекты →</button>
              <div className="map-legend stagger-item">
                <span className="map-legend__item map-legend__item--done">
                  <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="var(--accent)" /></svg>
                  Завершён
                </span>
                <span className="map-legend__item map-legend__item--active">
                  <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="var(--accent-danger)" /></svg>
                  В процессе
                </span>
              </div>
            </div>
            <div className="map-block stagger-item">
              <div className="map-placeholder" role="img" aria-label="Карта проектов по странам">
                <div className="map-placeholder__inner">
                  <ProjectPins projects={projects} />
                  <div className="map-placeholder__label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      <line x1="8" y1="2" x2="8" y2="18" />
                      <line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                    <span>{projects.length ? `${projects.length} проектов на карте` : 'Загрузка…'}</span>
                  </div>
                </div>
              </div>
            </div>
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

      <footer id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo"><span aria-hidden="true">🌿</span>ЭкоСфера</div>
              <p className="footer-desc">Портал культуры безопасности. Объединяем науку, практику и творчество ради безопасного будущего.</p>
              <address className="footer-contacts" style={{ fontStyle: 'normal' }}>
                <a className="footer-contact" href="tel:+74951234567">📞 +7 (495) 123-45-67</a>
                <a className="footer-contact" href="mailto:info@ecosfera.ru">✉️ info@ecosfera.ru</a>
              </address>
              <div className="footer-socials">
                <a className="footer-social" href="#telegram" aria-label="Telegram">✈️</a>
                <a className="footer-social" href="#vk" aria-label="VK">🔷</a>
                <a className="footer-social" href="#chat" aria-label="Мессенджер">💬</a>
                <a className="footer-social" href="#youtube" aria-label="YouTube">▶️</a>
              </div>
            </div>
            <nav className="footer-col" aria-label="Навигация: платформа">
              <div className="footer-col-h">Платформа</div>
              <ul>
                {footerPlatformMenu.map((item) => (
                  <li key={item.id}>{renderFooterItem(item)}</li>
                ))}
              </ul>
            </nav>
            <nav className="footer-col" aria-label="Навигация: сообщество">
              <div className="footer-col-h">Сообщество</div>
              <ul>
                {footerCommunityMenu.map((item) => (
                  <li key={item.id}>{renderFooterItem(item)}</li>
                ))}
              </ul>
            </nav>
            <nav className="footer-col" aria-label="Навигация: ресурсы">
              <div className="footer-col-h">Ресурсы</div>
              <ul>
                {footerResourcesMenu.map((item) => (
                  <li key={item.id}>{renderFooterItem(item)}</li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ЭкоСфера Безопасности. Все права защищены.</span>
            <div className="footer-dev">Разработано: <a href="#magniapps">MagniApps Tech</a></div>
          </div>
        </div>
      </footer>
    </>
  );
}
