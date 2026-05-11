function getEsgBackUrl() {
  if (typeof window === 'undefined') {
    return '/#esgpage';
  }

  return `${window.location.origin}/#esgpage`;
}

export function EsgDetailPage({ article }) {
  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">{article?.topics?.[0] || 'ESG'}</div>
            <h1 className="art-header__title">{article?.title || 'ESG'}</h1>
            {article?.excerpt ? <p className="art-header__sub">{article.excerpt}</p> : null}
          </div>
        </div>
      </header>

      <section className="art-view">
        <div className="art-reader container">
          <a className="art-back" href={getEsgBackUrl()}>
            ESG
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
                <div className="art-author__name">{article?.authorName || 'ESG'}</div>
                <div className="art-author__role">ESG</div>
              </div>
            </div>
            <div className="art-meta-right">
              <span className="art-reading-time">{article?.readingTime ? `${article.readingTime} РјРёРЅ` : '1 РјРёРЅ'}</span>
              <span className="art-date">{article?.dateDisplay || ''}</span>
            </div>
          </div>

          <div
            className="art-body"
            dangerouslySetInnerHTML={{ __html: article?.content || '<p>ESG content is empty.</p>' }}
          />
        </div>
      </section>
    </>
  );
}
