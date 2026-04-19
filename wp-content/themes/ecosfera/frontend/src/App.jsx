import { useEffect, useState } from 'react';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { PortalShell } from './components/portal/PortalShell';
import { PortalFooter } from './components/portal/PortalFooter';
import { PortalHeader } from './components/portal/PortalHeader';
import { PortalMobileMenu } from './components/portal/PortalMobileMenu';
import { ArticleDetailPage } from './components/portal/pages/ArticleDetailPage';
import { NewsDetailPage } from './components/portal/pages/NewsDetailPage';
import { ProjectDetailPage } from './components/portal/pages/ProjectDetailPage';
import { getBootstrapData } from './lib/wp';

const PORTAL_PAGE_LABELS = {
  home: 'Главная',
  art: 'Искусство',
  articles: 'Статьи',
  projects: 'Проекты',
  news: 'Новости',
  initiative: 'Инициатива',
  register: 'Регистрация',
  login: 'Вход',
  account: 'Кабинет',
};

function ContentView({ currentPost }) {
  return (
    <section className="section section-content">
      <div className="container narrow">
        <p className="eyebrow">Текущий материал</p>
        <h1 className="section-title">{currentPost?.title || 'Контент не найден'}</h1>
        {currentPost?.excerpt ? <p className="section-lead">{currentPost.excerpt}</p> : null}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: currentPost?.content || '<p>Добавьте контент в WordPress.</p>' }}
        />
      </div>
    </section>
  );
}

function NotFoundView() {
  return (
    <section className="section section-content">
      <div className="container narrow">
        <p className="eyebrow">404</p>
        <h1 className="section-title">Страница не найдена</h1>
        <p className="section-lead">
          WordPress уже отдаёт корректный статус, а React показывает единый интерфейс для ошибок и внутренних страниц.
        </p>
      </div>
    </section>
  );
}

function PortalArticleView({ data }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const changePage = (pageId) => {
    window.location.href = `${data?.site?.url || '/'}#${pageId}`;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onScroll = () => {
      setNavScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.toggle('mob-open', mobileOpen);
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <PortalHeader
        activePage="articles"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navScrolled={navScrolled}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        openMobileMenu={() => setMobileOpen(true)}
      />
      <PortalMobileMenu
        activePage="articles"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        closeMobileMenu={() => setMobileOpen(false)}
      />
      <ArticleDetailPage article={data?.current?.post} />
      <PortalFooter data={data} changePage={changePage} />
    </>
  );
}

function PortalProjectView({ data }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const changePage = (pageId) => {
    window.location.href = `${data?.site?.url || '/'}#${pageId}`;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onScroll = () => {
      setNavScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.toggle('mob-open', mobileOpen);
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <PortalHeader
        activePage="projects"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navScrolled={navScrolled}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        openMobileMenu={() => setMobileOpen(true)}
      />
      <PortalMobileMenu
        activePage="projects"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        closeMobileMenu={() => setMobileOpen(false)}
      />
      <ProjectDetailPage project={data?.current?.post} />
      <PortalFooter data={data} changePage={changePage} />
    </>
  );
}

function PortalNewsView({ data }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const changePage = (pageId) => {
    window.location.href = `${data?.site?.url || '/'}#${pageId}`;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onScroll = () => {
      setNavScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.toggle('mob-open', mobileOpen);
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <PortalHeader
        activePage="news"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navScrolled={navScrolled}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        openMobileMenu={() => setMobileOpen(true)}
      />
      <PortalMobileMenu
        activePage="news"
        changePage={changePage}
        mobileOpen={mobileOpen}
        navigation={data?.navigation}
        pageLabels={PORTAL_PAGE_LABELS}
        closeMobileMenu={() => setMobileOpen(false)}
      />
      <NewsDetailPage news={data?.current?.post} />
      <PortalFooter data={data} changePage={changePage} />
    </>
  );
}

const SECTION_MAP = {
  'front-page': 'portal',
  home: 'portal',
  singular: 'content',
  archive: 'content',
  search: 'content',
  index: 'content',
  '404': 'not-found',
};

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-top-button${visible ? ' is-visible' : ''}`}
      aria-label="Вернуться наверх"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}

export default function App() {
  const [data] = useState(() => getBootstrapData());
  const view = SECTION_MAP[data?.current?.template] || 'portal';

  if (view === 'portal') {
    return (
      <>
        <PortalShell data={data} />
        <ScrollToTopButton />
      </>
    );
  }

  if (view === 'content') {
    if (data?.current?.post?.type === 'article') {
      return (
        <>
          <PortalArticleView data={data} />
          <ScrollToTopButton />
        </>
      );
    }

    if (data?.current?.post?.type === 'project') {
      return (
        <>
          <PortalProjectView data={data} />
          <ScrollToTopButton />
        </>
      );
    }

    if (data?.current?.post?.type === 'news_item') {
      return (
        <>
          <PortalNewsView data={data} />
          <ScrollToTopButton />
        </>
      );
    }

    return (
      <>
        <SiteHeader site={data?.site} navigation={data?.navigation} />
        <ContentView currentPost={data?.current?.post} />
        <SiteFooter site={data?.site} navigation={data?.navigation} />
        <ScrollToTopButton />
      </>
    );
  }

  return (
    <>
      <SiteHeader site={data?.site} navigation={data?.navigation} />
      <NotFoundView />
      <SiteFooter site={data?.site} navigation={data?.navigation} />
      <ScrollToTopButton />
    </>
  );
}
