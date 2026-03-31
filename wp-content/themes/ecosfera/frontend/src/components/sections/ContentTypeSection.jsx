export function ContentTypeSection({ eyebrow, title, description, items }) {
  return (
    <section className="section section-alt">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        <p className="section-lead">{description}</p>
        <div className="cards-grid">
          {(items || []).map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="card-text">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

