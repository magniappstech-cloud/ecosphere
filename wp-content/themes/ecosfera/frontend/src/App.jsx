import { useState } from 'react';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { PortalShell } from './components/portal/PortalShell';
import { getBootstrapData } from './lib/wp';

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

const SECTION_MAP = {
  'front-page': 'portal',
  home: 'portal',
  singular: 'content',
  archive: 'content',
  search: 'content',
  index: 'content',
  '404': 'not-found',
};

export default function App() {
  const [data] = useState(() => getBootstrapData());
  const view = SECTION_MAP[data?.current?.template] || 'portal';

  if (view === 'portal') {
    return <PortalShell data={data} />;
  }

  if (view === 'content') {
    return (
      <>
        <SiteHeader site={data?.site} navigation={data?.navigation} />
        <ContentView currentPost={data?.current?.post} />
        <SiteFooter site={data?.site} navigation={data?.navigation} />
      </>
    );
  }

  return (
    <>
      <SiteHeader site={data?.site} navigation={data?.navigation} />
      <NotFoundView />
      <SiteFooter site={data?.site} navigation={data?.navigation} />
    </>
  );
}
