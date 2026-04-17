import { useState } from 'react';

const FALLBACK_ARTICLE_IMAGE = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200&q=80';

function buildLoginUrl(siteUrl) {
  return `${siteUrl || '/'}#login`;
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

export function ArticlesPage({ data }) {
  const articles = data?.collections?.articles || [];
  const topics = Array.from(new Set(articles.flatMap((article) => article.topics || [])));
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [sort, setSort] = useState('newest');
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
  });
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  const filtered = filterArticles(articles, topic, search, sort);
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const loginUrl = buildLoginUrl(data?.site?.url);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setSubmitState({
        status: 'error',
        message: 'Только зарегистрированные пользователи могут отправлять статьи.',
      });
      return;
    }

    setSubmitState({
      status: 'submitting',
      message: 'Отправляем статью на модерацию...',
    });

    try {
      const response = await fetch(data?.rest?.articleSubmission, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = payload?.message || 'Не удалось отправить статью.';
        throw new Error(message);
      }

      setForm({
        title: '',
        excerpt: '',
        content: '',
      });
      setSubmitState({
        status: 'success',
        message: 'Статья отправлена на модерацию. Она появится на сайте после одобрения администратором.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось отправить статью.',
      });
    }
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

      {view === 'list' ? (
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
              <button className="btn-secondary" type="button" onClick={() => setView('write')}>
                Предложить статью
              </button>
            ) : (
              <a className="btn-secondary" href={loginUrl}>
                Войти, чтобы отправить статью
              </a>
            )}
          </div>
        </div>
      ) : null}

      {view === 'write' ? (
        <div id="art-view-write" className="art-view">
          <form className="art-composer container" onSubmit={handleSubmit}>
            <button className="art-back" type="button" onClick={() => setView('list')}>
              Отмена
            </button>
            <div className="art-composer__header">
              <h2 className="art-composer__title">Новая статья</h2>
              <p className="art-composer__sub">
                После отправки статья создаётся в WordPress со статусом `pending` и не публикуется автоматически.
              </p>
            </div>

            {isLoggedIn ? (
              <>
                <div className="form-group">
                  <label className="form-label">Заголовок</label>
                  <input
                    className="form-input art-composer__title-input"
                    placeholder="Введите заголовок статьи..."
                    value={form.title}
                    onChange={handleChange('title')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Краткий анонс</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Краткое описание статьи..."
                    value={form.excerpt}
                    onChange={handleChange('excerpt')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Полный текст</label>
                  <textarea
                    className="form-input art-composer__content-input"
                    rows="12"
                    placeholder="Введите полный текст статьи..."
                    value={form.content}
                    onChange={handleChange('content')}
                    required
                  />
                </div>
                {submitState.message ? (
                  <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p>
                ) : null}
                <div className="art-composer__actions">
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={submitState.status === 'submitting'}
                  >
                    {submitState.status === 'submitting' ? 'Отправляем...' : 'Отправить на модерацию →'}
                  </button>
                </div>
              </>
            ) : (
              <div className="art-empty">
                Для отправки статьи нужно <a href={loginUrl}>войти в аккаунт</a>.
              </div>
            )}
          </form>
        </div>
      ) : null}
    </>
  );
}
