const PORTAL_PAGE_IDS = ['home', 'art', 'articles', 'projects', 'news', 'initiative', 'register', 'login', 'account'];

export function getTopLevelMenu(items = []) {
  return items.filter((item) => !item.parent);
}

export function resolvePortalPageId(url = '') {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    const hash = parsed.hash.replace(/^#/, '').toLowerCase();
    const path = parsed.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();

    if (PORTAL_PAGE_IDS.includes(hash)) {
      return hash;
    }

    const lastSegment = path.split('/').pop();

    if (PORTAL_PAGE_IDS.includes(lastSegment)) {
      return lastSegment;
    }

    if (path === '') {
      return 'home';
    }
  } catch (_error) {
    return null;
  }

  return null;
}
