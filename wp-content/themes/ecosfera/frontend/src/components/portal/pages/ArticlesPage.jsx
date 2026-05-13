import { useState } from 'react';

const FALLBACK_ARTICLE_IMAGE = '/images/unsplash/photo-1519125323398-675f0ddb6308-w1200-q80.jpg';

function buildPortalPageUrl(siteUrl, pageId, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();

  return `${siteUrl || '/'}#${pageId}${query ? `?${query}` : ''}`;
}

function filterArticles(items, topic, search, sort) {
  let filtered = items.filter((item) => topic === 'all' || (item.topics || []).includes(topic));

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) =>
      `${item.title} ${item.excerpt} ${(item.topics || []).join(' ')}`.toLowerCase().includes(query)
    );
  }

  if (sort === 'oldest') {
    filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  if (sort === 'title') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  if (sort === 'reading') {
    filtered = [...filtered].sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0));
  }

  if (sort === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return filtered;
}

export function ArticlesPage({ data, changePage }) {
  const articles = data?.collections?.articles || [];
  const topics = Array.from(new Set(articles.flatMap((article) => article.topics || [])));
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [sort, setSort] = useState('newest');
  const filtered = filterArticles(articles, topic, search, sort);
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const loginUrl = buildPortalPageUrl(data?.site?.url, 'login');

  const openEditor = () => {
    if (typeof changePage === 'function') {
      changePage('article-editor');
      return;
    }

    window.location.href = buildPortalPageUrl(data?.site?.url, 'article-editor');
  };

  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">Редакция · Экспертиза</div>
            <h1 className="art-header__title">Статьи</h1>
            <p className="art-header__sub">
              Публикации экспертов платформы и материалы участников сообщества. Новые статьи от пользователей
              сначала попадают на модерацию и появляются на сайте только после одобрения администратором.
            </p>
          </div>
        </div>
        <div className="art-filters container">
          <div className="art-search">
            <input
              type="search"
              placeholder="Поиск статей..."
              aria-label="Поиск статей"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="art-tags" role="list">
            <button
              className={`art-tag${topic === 'all' ? ' art-tag--active' : ''}`}
              type="button"
              onClick={() => setTopic('all')}
            >
              Все
            </button>
            {topics.map((topicName) => (
              <button
                key={topicName}
                className={`art-tag${topic === topicName ? ' art-tag--active' : ''}`}
                type="button"
                onClick={() => setTopic(topicName)}
              >
                {topicName}
              </button>
            ))}
          </div>
          <div className="art-sort">
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка статей">
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="title">По названию</option>
              <option value="reading">Быстрые к чтению</option>
            </select>
          </div>
        </div>
      </header>

      <div id="art-view-list" className="art-view">
        <div className="art-grid container" role="list" aria-label="Список статей">
          {filtered.length ? (
            filtered.map((article) => (
              <a key={article.id} className="art-card" href={article.url}>
                <img src={article.featuredImage || FALLBACK_ARTICLE_IMAGE} alt={article.title} />
                <div className="art-card__body">
                  <div className="art-kicker">{article.topics?.[0] || 'Статья'}</div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt || 'Полная версия статьи доступна по клику.'}</p>
                  <div className="art-card__meta">
                    <span>{article.authorName || 'Редакция'}</span>
                    <span>{article.readingTime ? `${article.readingTime} мин` : article.dateDisplay}</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="art-empty">Пока нет опубликованных статей. Добавьте первую запись в админке WordPress.</div>
          )}
        </div>
        <div className="art-load-more container">
          {isLoggedIn ? (
            <button className="btn-secondary" type="button" onClick={openEditor}>
              Написать статью
            </button>
          ) : (
            <a className="btn-secondary" href={loginUrl}>
              Войти, чтобы написать статью
            </a>
          )}
        </div>
      </div>
    </>
  );
}
