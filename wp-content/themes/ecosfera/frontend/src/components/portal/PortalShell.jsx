import { useEffect, useState } from 'react';
import { pageIds } from '@/data/portalData';
import { PortalHeader } from './PortalHeader';
import { PortalMobileMenu } from './PortalMobileMenu';
import { PortalFooter } from './PortalFooter';
import { HomePage } from './pages/HomePage';
import { ArtPage } from './pages/ArtPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewsPage } from './pages/NewsPage';
import { InitiativePage } from './pages/InitiativePage';
import { RegisterPage } from './pages/RegisterPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';

const PORTAL_PAGE_STORAGE_KEY = 'ecosfera-active-page';

const PAGE_LABELS = {
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

export function PortalShell({ data }) {
  const [activePage, setActivePage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  useEffect(() => {
    const syncPageWithHash = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();

      if (pageIds.includes(hash)) {
        setActivePage(hash);
        window.sessionStorage.setItem(PORTAL_PAGE_STORAGE_KEY, hash);
        return;
      }

      const savedPage = window.sessionStorage.getItem(PORTAL_PAGE_STORAGE_KEY)?.toLowerCase();

      if (savedPage && pageIds.includes(savedPage)) {
        setActivePage(savedPage);
        window.location.hash = savedPage;
        return;
      }

      setActivePage('home');
      window.sessionStorage.setItem(PORTAL_PAGE_STORAGE_KEY, 'home');
    };

    syncPageWithHash();
    window.addEventListener('hashchange', syncPageWithHash);

    return () => window.removeEventListener('hashchange', syncPageWithHash);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      const heroBackground = document.getElementById('hero-bg');

      setScrollProgress(progress);
      setNavScrolled(window.scrollY > 10);

      if (activePage === 'home' && heroBackground) {
        heroBackground.style.transform = `translateY(${window.scrollY * 0.2}px)`;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [activePage]);

  useEffect(() => {
    const activeRoot = document.getElementById(`p-${activePage}`);

    if (!activeRoot) {
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );

    activeRoot.querySelectorAll('.reveal:not(.in)').forEach((element) => {
      revealObserver.observe(element);
    });

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.staggerFired) {
            return;
          }

          const items = entry.target.querySelectorAll('.stagger-item');

          items.forEach((item) => {
            const index = Number.parseInt(item.getAttribute('data-stagger') || '0', 10);
            const delay = index * 120;

            item.style.transitionDelay = `${delay}ms`;

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                item.classList.add('stagger-item--in');
              });
            });
          });

          entry.target.dataset.staggerFired = '1';
          staggerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    activeRoot.querySelectorAll('.stagger-section:not([data-stagger-fired])').forEach((section) => {
      staggerObserver.observe(section);
    });

    const sectionEnterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('section-enter--in');
          sectionEnterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.06 }
    );

    activeRoot.querySelectorAll('#metrics, #leaders, #footer, #art-gallery, #video-sec, #photo-slider, #radar').forEach((section) => {
      section.classList.add('section-enter');
      sectionEnterObserver.observe(section);
    });

    return () => {
      revealObserver.disconnect();
      staggerObserver.disconnect();
      sectionEnterObserver.disconnect();
    };
  }, [activePage]);

  useEffect(() => {
    document.body.classList.toggle('mob-open', mobileOpen);
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.classList.remove('mob-open');
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!lightboxImage) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxImage('');
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [lightboxImage]);

  const changePage = (pageId) => {
    setActivePage(pageId);
    setMobileOpen(false);
    window.sessionStorage.setItem(PORTAL_PAGE_STORAGE_KEY, pageId);
    window.location.hash = pageId === 'home' ? 'home' : pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = [
    { id: 'home', element: <HomePage data={data} changePage={changePage} /> },
    { id: 'art', element: <ArtPage data={data} openLightbox={setLightboxImage} /> },
    { id: 'projects', element: <ProjectsPage data={data} /> },
    { id: 'news', element: <NewsPage data={data} /> },
    { id: 'initiative', element: <InitiativePage data={data} /> },
    { id: 'register', element: <RegisterPage data={data} /> },
    { id: 'login', element: <LoginPage data={data} /> },
    { id: 'account', element: <AccountPage data={data} /> },
    { id: 'articles', element: <ArticlesPage data={data} /> },
  ];

  return (
    <>
      <PortalHeader
        activePage={activePage}
        changePage={changePage}
        mobileOpen={mobileOpen}
        navScrolled={navScrolled}
        navigation={data?.navigation}
        pageLabels={PAGE_LABELS}
        openMobileMenu={() => setMobileOpen(true)}
      />
      <PortalMobileMenu
        activePage={activePage}
        changePage={changePage}
        mobileOpen={mobileOpen}
        navigation={data?.navigation}
        pageLabels={PAGE_LABELS}
        closeMobileMenu={() => setMobileOpen(false)}
      />
      <div id="scroll-progress" aria-hidden="true" style={{ width: `${scrollProgress}%` }} />
      {pages.map((page) => (
        <div key={page.id} className={`page${activePage === page.id ? ' active' : ''}`} id={`p-${page.id}`}>
          {page.element}
          <PortalFooter data={data} changePage={changePage} />
        </div>
      ))}
      <div
        id="gallery-lb"
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр изображения"
        className={lightboxImage ? 'show' : ''}
        onClick={() => setLightboxImage('')}
      >
        <button
          id="gallery-lb-close"
          onClick={(event) => {
            event.stopPropagation();
            setLightboxImage('');
          }}
          aria-label="Закрыть просмотр"
        >
          ✕
        </button>
        {lightboxImage ? <img id="lb-img" src={lightboxImage} alt="Увеличенное изображение" /> : null}
      </div>
      <div hidden>
        {pageIds.map((pageId) => (
          <span key={pageId}>{PAGE_LABELS[pageId]}</span>
        ))}
      </div>
    </>
  );
}
