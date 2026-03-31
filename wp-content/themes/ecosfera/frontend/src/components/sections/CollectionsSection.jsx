function CollectionCard({ title, description, items, urlPrefix }) {
  return (
    <article className="card">
      <p className="eyebrow">{title}</p>
      <p className="card-text">{description}</p>
      <div className="card-list">
        {(items || []).slice(0, 3).map((item) => (
          <a key={`${urlPrefix}-${item.id}`} className="card-link" href={item.url}>
            <strong>{item.title}</strong>
            <span>{item.excerpt || 'Контент заполняется через WordPress.'}</span>
          </a>
        ))}
      </div>
    </article>
  );
}

export function CollectionsSection({ collections = {} }) {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Контентные блоки</p>
        <h2 className="section-title">Что уже готово в теме</h2>
        <p className="section-lead">
          На главной можно свободно собирать React-секции из данных WordPress. Ниже уже подключены основные источники.
        </p>
        <div className="cards-grid">
          <CollectionCard
            title="Новости и статьи"
            description="Берем обычные записи WordPress. Они хорошо подходят под ленту новостей, аналитические материалы и редакционные подборки."
            items={collections.posts}
            urlPrefix="posts"
          />
          <CollectionCard
            title="Проекты"
            description="Отдельный тип записей для кейсов, карточек проектов, географии и статусов реализации."
            items={collections.projects}
            urlPrefix="projects"
          />
          <CollectionCard
            title="Инициативы и искусство"
            description="Независимые сущности, чтобы фронтенд не зависел от одного универсального типа записи."
            items={[...(collections.initiatives || []), ...(collections.art || [])]}
            urlPrefix="mixed"
          />
        </div>
      </div>
    </section>
  );
}

