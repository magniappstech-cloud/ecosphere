import { getTopLevelMenu, resolvePortalPageId } from '@/lib/navigation';

export function PortalHeader({ activePage, changePage, mobileOpen, navScrolled, openMobileMenu, pageLabels, navigation }) {
  const menuItems = getTopLevelMenu(navigation?.headerPrimary || navigation?.primary || []);
  const visibleItems = menuItems.length
    ? menuItems
    : Object.entries(pageLabels).map(([pageId, label]) => ({ id: pageId, title: label, url: `#${pageId}` }));

  return (
    <nav id="sticky-nav" role="navigation" aria-label="Основная навигация" className={navScrolled ? 'scrolled' : ''}>
      <button type="button" className="nav-logo" onClick={() => changePage('home')} aria-label="На главную">
        <span className="nav-dot" aria-hidden="true" />
        ЭкоСфера
      </button>
      <div className="nav-links">
        {visibleItems.map((item) => {
          const pageId = resolvePortalPageId(item.url);
          const className = `${activePage === pageId ? 'active ' : ''}${pageId === 'register' ? 'nav-cta' : ''}`.trim();

          if (pageId) {
            return (
              <button key={item.id} type="button" id={`nl-${pageId}`} className={className} onClick={() => changePage(pageId)}>
                {item.title}
              </button>
            );
          }

          return (
            <a key={item.id} href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined} className={className}>
              {item.title}
            </a>
          );
        })}
      </div>
      <button
        className="nav-burger"
        id="burger"
        type="button"
        aria-label="Открыть меню"
        aria-expanded={mobileOpen ? 'true' : 'false'}
        aria-controls="mob-menu"
        onClick={openMobileMenu}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}

