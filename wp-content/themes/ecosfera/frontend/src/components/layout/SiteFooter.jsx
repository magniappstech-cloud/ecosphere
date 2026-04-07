import { getTopLevelMenu } from '@/lib/navigation';

export function SiteFooter({ site, navigation }) {
  const platformMenu = getTopLevelMenu(navigation?.footerPlatform || navigation?.footer || []);
  const communityMenu = getTopLevelMenu(navigation?.footerCommunity || []);
  const resourcesMenu = getTopLevelMenu(navigation?.footerResources || []);

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
          <p className="eyebrow">Платформа</p>
          <div className="footer-links">
            {platformMenu.map((item) => (
              <a key={item.id} href={item.url}>
                {item.title}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Сообщество</p>
          <div className="footer-links">
            {communityMenu.map((item) => (
              <a key={item.id} href={item.url}>
                {item.title}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Ресурсы</p>
          <div className="footer-links">
            {resourcesMenu.map((item) => (
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

