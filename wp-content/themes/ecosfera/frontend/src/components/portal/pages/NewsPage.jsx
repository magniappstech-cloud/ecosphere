import { useMemo, useState } from 'react';

const FILTER_ALL = 'Все';
const FILTER_ORDER = [FILTER_ALL, 'Экология', 'Энергетика', 'Наука', 'Города', 'Проекты', 'Культура'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=80';

const FALLBACK_ITEMS = [
  {
    id: 1,
    title: 'Новые регламенты мониторинга снижают аварийность на 18%',
    excerpt: 'Эксперты платформы собрали кейсы, где цифровой контроль превратился из отчета в практику.',
    authorName: 'Редакция Экосферы',
    featuredImage: FALLBACK_IMAGE,
    newsCategory: 'Наука',
    url: '#',
  },
];

function buildSections(items) {
  const splash = items[0] || FALLBACK_ITEMS[0];
  const left = items.slice(1, 4);
  const center = items.slice(4, 6);
  const right = items.slice(1, 5);
  const bottom = items.slice(0, 4);

  return { splash, left, center, right, bottom };
}

function NewsCardLink({ item, className, children }) {
  return (
    <a className={className} href={item.url || '#'}>
      {children}
    </a>
  );
}

export function NewsPage({ data }) {
  const newsItems = data?.collections?.news?.length ? data.collections.news : FALLBACK_ITEMS;
  const derivedSections = useMemo(() => {
    const categories = Array.from(new Set(newsItems.map((item) => item.newsCategory).filter(Boolean)));
    const visibleFilters = FILTER_ORDER.filter((filter) => filter === FILTER_ALL || categories.includes(filter));

    return {
      filters: visibleFilters.length ? visibleFilters : FILTER_ORDER,
    };
  }, [newsItems]);

  const [filter, setFilter] = useState(FILTER_ALL);
  const filtered = filter === FILTER_ALL ? newsItems : newsItems.filter((item) => item.newsCategory === filter);
  const source = filtered.length ? filtered : newsItems;
  const { splash, left, center, right, bottom } = buildSections(source);

  return (
    <>
      <header className="np-masthead">
        <div className="np-masthead-inner">
          <div className="np-masthead-left">
            <span className="np-edition">Лента новостей</span>
            <span className="np-gutter-v" />
            <span className="np-edition">{splash?.dateDisplay || ''}</span>
          </div>
          <div className="np-masthead-title">
            <div className="np-title-label">ЭкоСфера</div>
            <div className="np-title-sub">ВЕСТНИК БЕЗОПАСНОСТИ</div>
          </div>
          <div className="np-masthead-right">
            <span className="np-edition">{newsItems.length} новостей</span>
            <span className="np-gutter-v" />
            <span className="np-edition">{filter}</span>
          </div>
        </div>
        <nav className="np-sections" aria-label="Разделы новостей">
          {derivedSections.filters.map((section) => (
            <button
              key={section}
              className={`np-sec-btn${filter === section ? ' active' : ''}`}
              type="button"
              onClick={() => setFilter(section)}
            >
              {section}
            </button>
          ))}
        </nav>
      </header>

      <main className="np-body" aria-label="Страница новостей">
        <aside className="np-col np-col-left" aria-label="Второстепенные новости">
          {left.map((item) => (
            <NewsCardLink key={item.id} item={item} className="np-offlead">
              <div className="np-offlead-img-wrap">
                <img src={item.featuredImage || FALLBACK_IMAGE} alt={item.title} />
                <div className="np-kicker">{item.newsCategory}</div>
              </div>
              <div className="np-offlead-body">
                <h3 className="np-offlead-headline">{item.title}</h3>
                <p className="np-offlead-deck">{item.excerpt}</p>
              </div>
            </NewsCardLink>
          ))}
        </aside>

        <section className="np-col np-col-center" aria-label="Главная новость">
          <NewsCardLink item={splash} className="np-splash">
            <div className="np-splash-img-wrap">
              <img src={splash.featuredImage || FALLBACK_IMAGE} alt={splash.title} loading="eager" />
              <div className="np-splash-img-overlay" />
              <div className="np-splash-kicker">{splash.newsCategory}</div>
            </div>
            <div className="np-splash-body">
              <h2 className="np-splash-headline">{splash.title}</h2>
              <p className="np-splash-deck">{splash.excerpt}</p>
              <div className="np-splash-byline">{splash.authorName || 'Редакция Экосферы'}</div>
            </div>
          </NewsCardLink>
          <div className="np-center-secondary">
            {center.map((item) => (
              <NewsCardLink key={item.id} item={item} className="np-secondary">
                <div className="np-secondary-img-wrap">
                  <img src={item.featuredImage || FALLBACK_IMAGE} alt={item.title} />
                  <div className="np-kicker">{item.newsCategory}</div>
                </div>
                <h3 className="np-secondary-headline">{item.title}</h3>
                <p className="np-secondary-deck">{item.excerpt}</p>
              </NewsCardLink>
            ))}
          </div>
        </section>

        <aside className="np-col np-col-right" aria-label="Краткие новости">
          <div className="np-briefs-label">Кратко</div>
          {right.map((item) => (
            <NewsCardLink key={item.id} item={item} className="np-brief">
              <div className="np-brief-img-wrap">
                <img src={item.featuredImage || FALLBACK_IMAGE} alt={item.title} />
              </div>
              <div>
                <div className="np-kicker">{item.newsCategory}</div>
                <h3 className="np-brief-headline">{item.title}</h3>
                <p className="np-brief-deck">{item.excerpt}</p>
              </div>
            </NewsCardLink>
          ))}
        </aside>
      </main>

      <section className="np-bottom" aria-label="Больше новостей">
        <div className="np-bottom-label">Ещё по теме</div>
        <div className="np-bottom-grid">
          {bottom.map((item) => (
            <NewsCardLink key={item.id} item={item} className="np-bottom-card">
              <img src={item.featuredImage || FALLBACK_IMAGE} alt={item.title} />
              <div className="np-kicker">{item.newsCategory}</div>
              <h3>{item.title}</h3>
            </NewsCardLink>
          ))}
        </div>
      </section>
    </>
  );
}
