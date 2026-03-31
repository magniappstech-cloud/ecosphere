import { useState } from 'react';
import { articleLibrary } from '@/data/portalData';

function filterArticles(items, tag, search, sort) {
  let filtered = items.filter((item) => tag === 'all' || item.tag === tag);

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => `${item.title} ${item.excerpt}`.toLowerCase().includes(query));
  }

  if (sort === 'popular') {
    filtered = [...filtered].sort((a, b) => b.likes - a.likes);
  }

  if (sort === 'reading') {
    filtered = [...filtered].sort((a, b) => Number.parseInt(a.readingTime, 10) - Number.parseInt(b.readingTime, 10));
  }

  return filtered;
}

export function ArticlesPage() {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState('newest');
  const [activeArticle, setActiveArticle] = useState(articleLibrary[0]);
  const filtered = filterArticles(articleLibrary, tag, search, sort);

  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">Редакция · Экспертиза</div>
            <h1 className="art-header__title">Статьи</h1>
            <p className="art-header__sub">Глубокая аналитика от экспертов платформы — ISO, охрана труда, экология и культура безопасности.</p>
          </div>
        </div>
        <div className="art-filters container">
          <div className="art-search"><input type="search" placeholder="Поиск статей…" aria-label="Поиск статей" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="art-tags" role="list">
            {[
              ['all', 'Все'],
              ['iso', 'ISO / ГОСТ'],
              ['ecology', 'Экология'],
              ['safety', 'Охрана труда'],
              ['energy', 'Энергетика'],
              ['culture', 'Культура'],
            ].map(([value, label]) => (
              <button key={value} className={`art-tag${tag === value ? ' art-tag--active' : ''}`} type="button" onClick={() => setTag(value)}>
                {label}
              </button>
            ))}
          </div>
          <div className="art-sort">
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка статей">
              <option value="newest">Сначала новые</option>
              <option value="popular">Популярные</option>
              <option value="reading">Быстрые (до 5 мин)</option>
            </select>
          </div>
        </div>
      </header>

      {view === 'list' ? (
        <div id="art-view-list" className="art-view">
          <div className="art-grid container" role="list" aria-label="Список статей">
            {filtered.map((article) => (
              <article key={article.id} className="art-card">
                <img src={article.image} alt={article.title} />
                <div className="art-card__body">
                  <div className="art-kicker">{article.tag}</div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <button className="btn-secondary" type="button" onClick={() => { setActiveArticle(article); setView('article'); }}>Читать</button>
                </div>
              </article>
            ))}
          </div>
          <div className="art-load-more container"><button className="btn-secondary" type="button" onClick={() => setView('write')}>Открыть редактор</button></div>
        </div>
      ) : null}

      {view === 'article' ? (
        <div id="art-view-article" className="art-view">
          <div className="art-reader container">
            <button className="art-back" type="button" onClick={() => setView('list')}>Все статьи</button>
            <div className="art-cover">
              <img src={activeArticle.image} alt={activeArticle.title} loading="lazy" />
              <div className="art-cover__tint" />
            </div>
            <div className="art-meta-row">
              <div className="art-author">
                <div className="art-author__avatar">{activeArticle.author.slice(0, 1)}</div>
                <div>
                  <div className="art-author__name">{activeArticle.author}</div>
                  <div className="art-author__role">{activeArticle.role}</div>
                </div>
              </div>
              <div className="art-meta-right">
                <span className="art-reading-time">{activeArticle.readingTime}</span>
                <span className="art-date">{activeArticle.date}</span>
              </div>
            </div>
            <h1 className="art-title">{activeArticle.title}</h1>
            <p className="art-lead">{activeArticle.excerpt}</p>
            <div className="art-body">
              {activeArticle.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {view === 'write' ? (
        <div id="art-view-write" className="art-view">
          <div className="art-composer container">
            <button className="art-back" type="button" onClick={() => setView('list')}>Отмена</button>
            <div className="art-composer__header">
              <h2 className="art-composer__title">Новая статья</h2>
              <p className="art-composer__sub">Черновой интерфейс редактора уже перенесен в React и готов к интеграции с WordPress REST API.</p>
            </div>
            <div className="form-group"><label className="form-label">Заголовок</label><input className="form-input art-composer__title-input" placeholder="Введите заголовок статьи…" /></div>
            <div className="form-group"><label className="form-label">Лид-абзац</label><textarea className="form-input" rows="4" placeholder="Краткий анонс — 1-2 предложения…" /></div>
            <div className="form-group"><label className="form-label">Содержание</label><div className="art-editor">Здесь дальше можно подключить Gutenberg blocks, ACF Flexible Content или кастомный REST save endpoint.</div></div>
            <div className="art-composer__actions">
              <button className="btn-secondary" type="button">Сохранить черновик</button>
              <button className="btn-primary" type="button">Опубликовать →</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
