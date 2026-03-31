export function PortalMobileMenu({ activePage, changePage, mobileOpen, closeMobileMenu, pageLabels }) {
  const handleNavigate = (pageId) => {
    changePage(pageId);
    closeMobileMenu();
  };

  return (
    <>
      <div id="mob-menu" role="dialog" aria-modal="true" aria-label="Мобильное меню" className={mobileOpen ? 'open' : ''}>
        <button id="mob-close" type="button" aria-label="Закрыть меню" onClick={closeMobileMenu}>
          ✕
        </button>
        {Object.entries(pageLabels).map(([pageId, label]) => (
          <button
            key={pageId}
            type="button"
            className={activePage === pageId ? 'active' : ''}
            onClick={() => handleNavigate(pageId)}
          >
            {label}
          </button>
        ))}
      </div>
      <div id="mob-overlay" aria-hidden="true" onClick={closeMobileMenu} />
    </>
  );
}

