function getNewsBackUrl() {
  if (typeof window === 'undefined') {
    return '/#news';
  }

  return `${window.location.origin}/#news`;
}

export function NewsDetailPage({ news }) {
  return (
    <>
      <header className="art-header">
        <div className="art-header__inner container">
          <div>
            <div className="sec-label">{news?.newsCategory || 'Новости'}</div>
            <h1 className="art-header__title">{news?.title || 'Новость'}</h1>
            {news?.excerpt ? <p className="art-header__sub">{news.excerpt}</p> : null}
          </div>
        </div>
      </header>

      <section className="art-view">
        <div className="art-reader container">
          <a className="art-back" href={getNewsBackUrl()}>
            Все новости
          </a>

          {news?.featuredImage ? (
            <div className="art-cover">
              <img src={news.featuredImage} alt={news.title} loading="lazy" />
              <div className="art-cover__tint" />
            </div>
          ) : null}

          <div className="art-meta-row">
            <div className="art-author">
              <div className="art-author__avatar">{(news?.authorName || '?').slice(0, 1)}</div>
              <div>
                <div className="art-author__name">{news?.authorName || 'Редакция'}</div>
                <div className="art-author__role">{news?.newsCategory || 'Новости'}</div>
              </div>
            </div>
            <div className="art-meta-right">
              <span className="art-date">{news?.dateDisplay || ''}</span>
            </div>
          </div>

          <div
            className="art-body"
            dangerouslySetInnerHTML={{ __html: news?.content || '<p>Текст новости пока не заполнен.</p>' }}
          />
        </div>
      </section>
    </>
  );
}
