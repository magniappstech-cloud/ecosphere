function getProjectBackUrl() {
  if (typeof window === 'undefined') {
    return '/#projects';
  }

  return `${window.location.origin}/#projects`;
}

function getStatusClass(status) {
  const normalized = String(status || '').trim().toLowerCase();

  if (['finish', 'done', 'completed', 'finished', 'завершен', 'завершён'].includes(normalized)) {
    return 'status-done';
  }

  return 'status-active';
}

export function ProjectDetailPage({ project }) {
  const statusLabel = project?.statusLabel || project?.status || 'В работе';
  const formatLabel = project?.formatLabel || project?.format || 'Инициатива';
  const statusClass = getStatusClass(project?.status);

  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">{formatLabel}</div>
            <h1 className="art-header__title">{project?.title || 'Проект'}</h1>
            {project?.excerpt ? <p className="art-header__sub">{project.excerpt}</p> : null}
          </div>
        </div>
      </header>

      <section className="page-inner-pad">
        <div className="container project-detail">
          <a className="art-back" href={getProjectBackUrl()}>
            Все проекты
          </a>

          <div className="project-detail__hero">
            <div
              className="project-detail__media"
              style={{
                backgroundImage: `url('${project?.featuredImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80'}')`,
              }}
            >
              <span className={`project-status ${statusClass}`}>{statusLabel}</span>
            </div>
            <div className="project-detail__aside">
              <div className="project-detail__meta-card">
                <div className="project-detail__meta-label">Статус</div>
                <div className="project-detail__meta-value">{statusLabel}</div>
              </div>
              <div className="project-detail__meta-card">
                <div className="project-detail__meta-label">Формат</div>
                <div className="project-detail__meta-value">{formatLabel}</div>
              </div>
              <div className="project-detail__meta-card">
                <div className="project-detail__meta-label">Автор</div>
                <div className="project-detail__meta-value">{project?.authorName || 'Команда проекта'}</div>
              </div>
              <div className="project-detail__meta-card">
                <div className="project-detail__meta-label">Дата</div>
                <div className="project-detail__meta-value">{project?.dateDisplay || ''}</div>
              </div>
            </div>
          </div>

          <div className="project-detail__content">
            <div
              className="art-body"
              dangerouslySetInnerHTML={{ __html: project?.content || '<p>Описание проекта пока не заполнено.</p>' }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
