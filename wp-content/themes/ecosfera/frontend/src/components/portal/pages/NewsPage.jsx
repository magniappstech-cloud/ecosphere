import { useState } from 'react';
import { newsItems, newsSections } from '@/data/portalData';

export function NewsPage() {
  const [filter, setFilter] = useState('Все');

  const filtered = filter === 'Все' ? newsItems : newsItems.filter((item) => item.category === filter);
  const splash = filtered[0] || newsItems[0];
  const left = filtered.slice(1, 4);
  const center = filtered.slice(4, 6);
  const right = filtered.slice(1, 5);
  const bottom = filtered.slice(0, 4);

  return (
    <>
      <header className="np-masthead">
        <div className="np-masthead-inner">
          <div className="np-masthead-left">
            <span className="np-edition">Выпуск № 47</span>
            <span className="np-gutter-v" />
            <span className="np-edition">Вторник, 24 марта 2026</span>
          </div>
          <div className="np-masthead-title">
            <div className="np-title-label">ЭкоСфера</div>
            <div className="np-title-sub">ВЕСТНИК БЕЗОПАСНОСТИ</div>
          </div>
          <div className="np-masthead-right">
            <span className="np-edition">12 400 подписчиков</span>
            <span className="np-gutter-v" />
            <span className="np-edition">{filtered.length} сюжетов</span>
          </div>
        </div>
        <nav className="np-sections" aria-label="Разделы газеты">
          {newsSections.map((section) => (
            <button key={section} className={`np-sec-btn${filter === section ? ' active' : ''}`} type="button" onClick={() => setFilter(section)}>
              {section}
            </button>
          ))}
        </nav>
      </header>

      <main className="np-body" aria-label="Главная страница газеты">
        <aside className="np-col np-col-left" aria-label="Второстепенные новости">
          {left.map((item) => (
            <article key={item.id} className="np-offlead">
              <div className="np-offlead-img-wrap">
                <img src={item.image} alt={item.title} />
                <div className="np-kicker">{item.category}</div>
              </div>
              <div className="np-offlead-body">
                <h3 className="np-offlead-headline">{item.title}</h3>
                <p className="np-offlead-deck">{item.deck}</p>
              </div>
            </article>
          ))}
        </aside>

        <section className="np-col np-col-center" aria-label="Главная новость">
          <article className="np-splash" tabIndex="0" aria-label="Главная новость">
            <div className="np-splash-img-wrap">
              <img src={splash.image} alt={splash.title} loading="eager" />
              <div className="np-splash-img-overlay" />
              <div className="np-splash-kicker">{splash.category}</div>
            </div>
            <div className="np-splash-body">
              <h2 className="np-splash-headline">{splash.title}</h2>
              <p className="np-splash-deck">{splash.deck}</p>
              <div className="np-splash-byline">{splash.author}</div>
            </div>
          </article>
          <div className="np-center-secondary">
            {center.map((item) => (
              <article key={item.id} className="np-secondary">
                <div className="np-secondary-img-wrap">
                  <img src={item.image} alt={item.title} />
                  <div className="np-kicker">{item.category}</div>
                </div>
                <h3 className="np-secondary-headline">{item.title}</h3>
                <p className="np-secondary-deck">{item.deck}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="np-col np-col-right" aria-label="Краткие новости">
          <div className="np-briefs-label">Кратко</div>
          {right.map((item) => (
            <article key={item.id} className="np-brief">
              <div className="np-brief-img-wrap">
                <img src={item.image} alt={item.title} />
              </div>
              <div>
                <div className="np-kicker">{item.category}</div>
                <h3 className="np-brief-headline">{item.title}</h3>
                <p className="np-brief-deck">{item.deck}</p>
              </div>
            </article>
          ))}
        </aside>
      </main>

      <section className="np-bottom" aria-label="Больше новостей">
        <div className="np-bottom-label">Ещё по теме</div>
        <div className="np-bottom-grid">
          {bottom.map((item) => (
            <article key={item.id} className="np-bottom-card">
              <img src={item.image} alt={item.title} />
              <div className="np-kicker">{item.category}</div>
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
