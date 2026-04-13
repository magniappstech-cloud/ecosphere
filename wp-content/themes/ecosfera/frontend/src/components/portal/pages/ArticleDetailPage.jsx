function getArticleBackUrl() {
  if (typeof window === 'undefined') {
    return '/#articles';
  }

  return `${window.location.origin}/#articles`;
}

export function ArticleDetailPage({ article }) {
  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">{article?.topics?.[0] || 'Статьи'}</div>
            <h1 className="art-header__title">{article?.title || 'Статья'}</h1>
            {article?.excerpt ? <p className="art-header__sub">{article.excerpt}</p> : null}
          </div>
        </div>
      </header>

      <section className="art-view">
        <div className="art-reader container">
          <a className="art-back" href={getArticleBackUrl()}>
            Все статьи
          </a>

          {article?.featuredImage ? (
            <div className="art-cover">
              <img src={article.featuredImage} alt={article.title} loading="lazy" />
              <div className="art-cover__tint" />
            </div>
          ) : null}

          <div className="art-meta-row">
            <div className="art-author">
              <div className="art-author__avatar">{(article?.authorName || '?').slice(0, 1)}</div>
              <div>
                <div className="art-author__name">{article?.authorName || 'Редакция'}</div>
                <div className="art-author__role">Автор статьи</div>
              </div>
            </div>
            <div className="art-meta-right">
              <span className="art-reading-time">{article?.readingTime ? `${article.readingTime} мин` : '1 мин'}</span>
              <span className="art-date">{article?.dateDisplay || ''}</span>
            </div>
          </div>

          <div
            className="art-body"
            dangerouslySetInnerHTML={{ __html: article?.content || '<p>Содержимое статьи пока не заполнено.</p>' }}
          />
        </div>
      </section>
    </>
  );
}
