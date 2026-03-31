export function SiteFooter({ site, navigation }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="eyebrow">Ecosfera</p>
          <h2>{site?.name || 'Ecosfera'}</h2>
          <p className="footer-text">
            WordPress используется как CMS и API-источник, а React отвечает за фронтенд, секции и шаблонный рендеринг.
          </p>
        </div>
        <div>
          <p className="eyebrow">Навигация</p>
          <div className="footer-links">
            {(navigation?.length ? navigation : []).filter((item) => !item.parent).map((item) => (
              <a key={item.id} href={item.url}>
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

