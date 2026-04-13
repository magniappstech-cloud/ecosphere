import { getTopLevelMenu, resolvePortalPageId } from '@/lib/navigation';

export function PortalFooter({ data, changePage }) {
  const footerPlatformMenu = getTopLevelMenu(data?.navigation?.footerPlatform || data?.navigation?.footer || []);
  const footerCommunityMenu = getTopLevelMenu(data?.navigation?.footerCommunity || []);
  const footerResourcesMenu = getTopLevelMenu(data?.navigation?.footerResources || []);

  const renderFooterItem = (item) => {
    const pageId = resolvePortalPageId(item.url);

    if (pageId) {
      return (
        <button type="button" onClick={() => changePage(pageId)}>
          {item.title}
        </button>
      );
    }

    return (
      <a href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined}>
        {item.title}
      </a>
    );
  };

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo"><span aria-hidden="true">🌿</span>ЭкоСфера</div>
            <p className="footer-desc">Портал культуры безопасности. Объединяем науку, практику и творчество ради безопасного будущего.</p>
            <address className="footer-contacts" style={{ fontStyle: 'normal' }}>
              <a className="footer-contact" href="tel:+74951234567">📞 +7 (495) 123-45-67</a>
              <a className="footer-contact" href="mailto:info@ecosfera.ru">✉️ info@ecosfera.ru</a>
            </address>
            <div className="footer-socials">
              <a className="footer-social" href="#telegram" aria-label="Telegram">✈️</a>
              <a className="footer-social" href="#vk" aria-label="VK">🔷</a>
              <a className="footer-social" href="#chat" aria-label="Мессенджер">💬</a>
              <a className="footer-social" href="#youtube" aria-label="YouTube">▶️</a>
            </div>
          </div>
          <nav className="footer-col" aria-label="Навигация: платформа">
            <div className="footer-col-h">Платформа</div>
            <ul>
              {footerPlatformMenu.map((item) => (
                <li key={item.id}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Навигация: сообщество">
            <div className="footer-col-h">Сообщество</div>
            <ul>
              {footerCommunityMenu.map((item) => (
                <li key={item.id}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Навигация: ресурсы">
            <div className="footer-col-h">Ресурсы</div>
            <ul>
              {footerResourcesMenu.map((item) => (
                <li key={item.id}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ЭкоСфера Безопасности. Все права защищены.</span>
          <div className="footer-dev">Разработано: <a href="#magniapps">MagniApps Tech</a></div>
        </div>
      </div>
    </footer>
  );
}
