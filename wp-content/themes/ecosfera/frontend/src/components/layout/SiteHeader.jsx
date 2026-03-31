export function SiteHeader({ site, navigation }) {
  const menu = navigation?.length
    ? navigation
    : [
        { id: 'home', title: 'Главная', url: '/' },
        { id: 'projects', title: 'Проекты', url: '/projects/' },
        { id: 'news', title: 'Новости', url: '/category/news/' },
        { id: 'initiatives', title: 'Инициативы', url: '/initiatives/' },
      ];

  return (
    <header className="site-header">
      <div className="container header-row">
        <a className="brand" href={site?.url || '/'}>
          <span className="brand-mark" />
          <span>
            <strong>{site?.name || 'Ecosfera'}</strong>
            <small>{site?.description || 'WordPress backend + React frontend'}</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Основная навигация">
          {menu
            .filter((item) => !item.parent)
            .map((item) => (
              <a key={item.id} href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined}>
                {item.title}
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}

