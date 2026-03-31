export function HeroSection({ site }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">Архитектура проекта</p>
          <h1 className="hero-title">
            WordPress как backend.
            <br />
            React как frontend.
          </h1>
          <p className="hero-text">
            Для Ecosfera это самый устойчивый подход: редакторы наполняют сайт в админке, а мы строим современный интерфейс без привязки к устаревшему PHP-шаблону.
          </p>
        </div>
        <div className="hero-card">
          <h2>{site?.name || 'Ecosfera'}</h2>
          <ul className="check-list">
            <li>Отдельные типы записей под проекты, инициативы и искусство</li>
            <li>REST API для React-компонентов и секций</li>
            <li>Единая тема WordPress без смешивания верстки и логики</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

