export function PortalHeader({ activePage, changePage, mobileOpen, navScrolled, openMobileMenu, pageLabels }) {
  return (
    <nav id="sticky-nav" role="navigation" aria-label="Основная навигация" className={navScrolled ? 'scrolled' : ''}>
      <button type="button" className="nav-logo" onClick={() => changePage('home')} aria-label="На главную">
        <span className="nav-dot" aria-hidden="true" />
        ЭкоСфера
      </button>
      <div className="nav-links">
        {Object.entries(pageLabels).map(([pageId, label]) => (
          <button
            key={pageId}
            type="button"
            id={`nl-${pageId}`}
            className={`${activePage === pageId ? 'active ' : ''}${pageId === 'register' ? 'nav-cta' : ''}`.trim()}
            onClick={() => changePage(pageId)}
          >
            {label}
          </button>
        ))}
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
