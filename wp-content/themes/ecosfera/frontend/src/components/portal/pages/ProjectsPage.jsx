export function ProjectsPage({ data }) {
  const projects = data?.collections?.projects || [];
  const visibleProjects = projects.length
    ? projects
    : [
        { id: 1, title: 'Безопасный район', excerpt: 'Локальные сценарии оценки рисков городской среды.', featuredImage: '' },
        { id: 2, title: 'Чистая энергия', excerpt: 'Пилоты по безопасной энергетической инфраструктуре.', featuredImage: '' },
        { id: 3, title: 'Открытая лаборатория', excerpt: 'Образовательные программы и полевые исследования.', featuredImage: '' },
      ];

  return (
    <div className="page-inner-pad">
      <section className="sec" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 0%,rgba(42,245,152,.04),transparent 60%)' }}>
        <div className="container">
          <div className="sec-label reveal">Инициативы</div>
          <h1 className="sec-h2 reveal" style={{ fontSize: 'clamp(32px,5vw,56px)', marginBottom: 'var(--sp-3)' }}>Проекты платформы</h1>
          <p className="sec-sub reveal">Реальные инициативы реальных людей. Нажмите на карточку для деталей.</p>
          <div className="g3" id="proj-grid" role="list">
            {visibleProjects.map((project) => (
              <article key={project.id} className="project-card">
                <div
                  className="project-card-img"
                  style={{ backgroundImage: `url('${project.featuredImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80'}')` }}
                >
                  <span className="project-status status-active">Активен</span>
                </div>
                <div className="project-body">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.excerpt || 'Описание проекта будет заполняться из WordPress.'}</p>
                  <div className="project-meta">
                    <span>Статус: в работе</span>
                    <span>Формат: инициатива</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
