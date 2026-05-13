import { getTopLevelMenu, resolvePortalPageId } from '@/lib/navigation';

export function PortalMobileMenu({ activePage, changePage, mobileOpen, closeMobileMenu, pageLabels, navigation, user }) {
  const handleNavigate = (pageId) => {
    changePage(pageId);
    closeMobileMenu();
  };

  const menuItems = getTopLevelMenu(navigation?.headerPrimary || navigation?.primary || []);
  const visibleItems = menuItems.length
    ? menuItems
    : Object.entries(pageLabels).map(([pageId, label]) => ({ id: pageId, title: label, url: `#${pageId}` }));

  return (
    <>
      <div id="mob-menu" role="dialog" aria-modal="true" aria-label="Мобильное меню" className={mobileOpen ? 'open' : ''}>
        <button id="mob-close" type="button" aria-label="Закрыть меню" onClick={closeMobileMenu}>
          ✕
        </button>
        {visibleItems.map((item) => {
          const pageId = resolvePortalPageId(item.url);
          const isAuthSwitch = pageId === 'register' && user?.loggedIn;
          const targetPageId = isAuthSwitch ? 'account' : pageId;
          const title = isAuthSwitch ? 'Личный кабинет' : item.title;

          if (targetPageId) {
            return (
              <button key={item.id} type="button" className={activePage === targetPageId ? 'active' : ''} onClick={() => handleNavigate(targetPageId)}>
                {title}
              </button>
            );
          }

          return (
            <a key={item.id} href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined} onClick={closeMobileMenu}>
              {item.title}
            </a>
          );
        })}
      </div>
      <div id="mob-overlay" aria-hidden="true" onClick={closeMobileMenu} />
    </>
  );
}
