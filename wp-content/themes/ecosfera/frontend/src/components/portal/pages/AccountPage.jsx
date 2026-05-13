import { useEffect, useMemo, useState } from 'react';
import { AccountShell } from '../AccountShell';

function buildPortalPageUrl(siteUrl, pageId, params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();

  return `${siteUrl || '/'}#${pageId}${query ? `?${query}` : ''}`;
}

function validateForm(form) {
  const nextInvalidFields = {};

  if (!form.fullName.trim()) {
    nextInvalidFields.fullName = 'Укажите имя и фамилию.';
  }

  if (!form.email.trim()) {
    nextInvalidFields.email = 'Укажите email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextInvalidFields.email = 'Введите корректный email.';
  }

  if (form.password && form.password.length < 8) {
    nextInvalidFields.password = 'Новый пароль должен содержать минимум 8 символов.';
  }

  if (form.password !== form.confirmPassword) {
    nextInvalidFields.confirmPassword = 'Пароли не совпадают.';
  }

  return nextInvalidFields;
}

function DashboardStat({ label, value, accent = 'default' }) {
  return (
    <div className={`account-stat-card account-stat-card--${accent}`}>
      <span className="account-stat-card__label">{label}</span>
      <span className="account-stat-card__value">{value}</span>
    </div>
  );
}

function DashboardItemCard({ item, actionLabel = 'Открыть', onAction, compact = false }) {
  return (
    <article className={`account-item-card${compact ? ' account-item-card--compact' : ''}`}>
      <div className="account-item-card__top">
        <span className={`account-item-card__status account-item-card__status--${item.status === 'finish' || item.status === 'done' ? 'done' : 'active'}`}>
          {item.statusLabel || item.postStatus}
        </span>
        <span className="account-item-card__date">{item.dateDisplay}</span>
      </div>
      <h3 className="account-item-card__title">{item.title}</h3>
      {item.excerpt ? <p className="account-item-card__excerpt">{item.excerpt}</p> : null}
      <div className="account-item-card__actions">
        <button type="button" className="account-text-link" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

function QuickActionCard({ title, description, onClick }) {
  return (
    <button type="button" className="account-quick-action" onClick={onClick}>
      <span className="account-quick-action__title">{title}</span>
      <span className="account-quick-action__description">{description}</span>
    </button>
  );
}

function EmptyPanel({ title, text }) {
  return (
    <div className="account-empty-panel">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ActivityChart({ points }) {
  const maxValue = Math.max(1, ...points.flatMap((point) => [point.articles || 0, point.projects || 0]));

  return (
    <div className="account-chart">
      <div className="account-chart__legend">
        <span><i className="account-chart__dot account-chart__dot--articles" /> Статьи</span>
        <span><i className="account-chart__dot account-chart__dot--projects" /> Проекты</span>
      </div>
      <div className="account-chart__bars">
        {points.map((point) => (
          <div key={point.label} className="account-chart__group">
            <div className="account-chart__columns">
              <span
                className="account-chart__bar account-chart__bar--articles"
                style={{ height: `${Math.max(10, ((point.articles || 0) / maxValue) * 100)}%` }}
                title={`Статьи: ${point.articles || 0}`}
              />
              <span
                className="account-chart__bar account-chart__bar--projects"
                style={{ height: `${Math.max(10, ((point.projects || 0) / maxValue) * 100)}%` }}
                title={`Проекты: ${point.projects || 0}`}
              />
            </div>
            <span className="account-chart__label">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountPage({ data, changePage, routeParams = {} }) {
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const siteUrl = data?.site?.url || '/';
  const loginUrl = buildPortalPageUrl(siteUrl, 'login');
  const dashboard = data?.userDashboard || {};
  const articleStats = dashboard.articles || {};
  const projectStats = dashboard.projects || {};
  const activity = dashboard.activity || [];
  const displayName = data?.user?.displayName || [data?.user?.firstName, data?.user?.lastName].filter(Boolean).join(' ');
  const [activeSection, setActiveSection] = useState(routeParams.section || 'profile');
  const [form, setForm] = useState({
    fullName: displayName,
    email: data?.user?.email || '',
    password: '',
    confirmPassword: '',
    newsletter: Boolean(data?.user?.newsletter),
  });
  const [invalidFields, setInvalidFields] = useState({});
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  const draftProjectItems = useMemo(
    () => (projectStats.items || []).filter((item) => item.postStatus === 'draft'),
    [projectStats.items]
  );

  const articleItems = useMemo(
    () => [
      ...(articleStats.drafts || []),
      ...(articleStats.pending || []),
      ...(articleStats.published || []),
    ],
    [articleStats.drafts, articleStats.pending, articleStats.published]
  );

  useEffect(() => {
    if (routeParams.section) {
      setActiveSection(routeParams.section);
    }
  }, [routeParams.section]);

  const openPortalPage = (pageId, params = {}) => {
    if (typeof changePage === 'function') {
      changePage(pageId, params);
      return;
    }

    window.location.href = buildPortalPageUrl(siteUrl, pageId, params);
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    openPortalPage('account', { section: sectionId });
  };

  const openArticleEditor = (id) => {
    openPortalPage('article-editor', id ? { id } : {});
  };

  const openProjectEditor = (id) => {
    openPortalPage('project-editor', id ? { id } : {});
  };

  const openArticleItem = (article) => {
    if (!article) {
      return;
    }

    if (article.postStatus === 'publish' && article.url) {
      window.location.href = article.url;
      return;
    }

    openArticleEditor(article.id);
  };

  const openProjectItem = (project) => {
    if (!project) {
      return;
    }

    if (project.postStatus === 'publish' && project.url) {
      window.location.href = project.url;
      return;
    }

    openProjectEditor(project.id);
  };

  const getArticleActionLabel = (article) => {
    if (article?.postStatus === 'publish') {
      return 'Открыть статью';
    }

    if (article?.postStatus === 'draft') {
      return 'Продолжить редактирование';
    }

    return 'Редактировать материал';
  };

  const sections = useMemo(
    () => [
      { id: 'profile', label: 'Профиль' },
      { id: 'articles', label: 'Мои статьи' },
      { id: 'drafts', label: 'Черновики' },
      { id: 'projects', label: 'Проекты' },
      { id: 'statistics', label: 'Статистика' },
      { id: 'settings', label: 'Настройки' },
    ],
    []
  );

  const getFieldClassName = (field) => `form-input${invalidFields[field] ? ' form-input--invalid' : ''}`;

  const handleChange = (field) => (event) => {
    const value = field === 'newsletter' ? event.target.checked : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setInvalidFields((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleLogout = async () => {
    setSubmitState({
      status: 'submitting',
      message: 'Выходим из аккаунта...',
    });

    try {
      const response = await fetch(data?.rest?.logoutUser, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || 'Не удалось выйти из аккаунта.');
      }

      window.location.href = loginUrl;
      window.location.reload();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось выйти из аккаунта.',
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setSubmitState({
        status: 'error',
        message: 'Чтобы изменить профиль, сначала войдите в аккаунт.',
      });
      return;
    }

    const nextInvalidFields = validateForm(form);
    setInvalidFields(nextInvalidFields);

    if (Object.keys(nextInvalidFields).length > 0) {
      setSubmitState({
        status: 'error',
        message: 'Проверьте поля, отмеченные подсветкой.',
      });
      return;
    }

    setSubmitState({
      status: 'submitting',
      message: 'Сохраняем изменения...',
    });

    try {
      const response = await fetch(data?.rest?.updateProfile, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || 'Не удалось обновить профиль.');
      }

      setSubmitState({
        status: 'success',
        message: 'Профиль обновлён. Обновляем страницу...',
      });

      window.setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось обновить профиль.',
      });
    }
  };

  const renderProfileSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Профиль</div>
            <h2 className="account-section-card__title">Привет, {displayName || 'участник'}</h2>
            <p className="account-section-card__sub">Вот что сейчас происходит в твоём личном кабинете и на твоей платформе.</p>
          </div>
        </div>
        <div className="account-stats-grid">
          <DashboardStat label="Опубликовано статей" value={articleStats.publishedCount || 0} accent="green" />
          <DashboardStat label="Статей на модерации" value={articleStats.pendingCount || 0} />
          <DashboardStat label="Черновиков" value={articleStats.draftCount || 0} />
          <DashboardStat label="Проектов" value={projectStats.count || 0} accent="soft" />
        </div>
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Проекты</div>
            <h2 className="account-section-card__title">Краткое содержание проектов</h2>
          </div>
        </div>
        {projectStats.items?.length ? (
          <div className="account-items-grid">
            {projectStats.items.slice(0, 3).map((project) => (
              <DashboardItemCard
                key={project.id}
                item={project}
                actionLabel={project.postStatus === 'publish' ? 'Открыть проект' : 'Продолжить редактирование'}
                onAction={() => openProjectItem(project)}
                compact
              />
            ))}
          </div>
        ) : (
          <EmptyPanel title="Пока нет проектов" text="Когда у тебя появятся собственные проекты, они будут собраны здесь в удобной сводке." />
        )}
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Быстрые действия</div>
            <h2 className="account-section-card__title">Что делаем дальше</h2>
          </div>
        </div>
        <div className="account-quick-actions">
          <QuickActionCard title="Написать статью" description="Открыть отдельный редактор статьи" onClick={() => openArticleEditor()} />
          <QuickActionCard title="Создать проект" description="Открыть отдельный редактор проекта" onClick={() => openProjectEditor()} />
          <QuickActionCard
            title="Продолжить черновик"
            description={articleStats.drafts?.[0]?.title || draftProjectItems[0]?.title || 'Открыть список черновиков'}
            onClick={() => {
              if (articleStats.drafts?.[0]) {
                openArticleEditor(articleStats.drafts[0].id);
                return;
              }

              if (draftProjectItems[0]) {
                openProjectEditor(draftProjectItems[0].id);
                return;
              }

              handleSectionSelect('drafts');
            }}
          />
        </div>
      </section>
    </div>
  );

  const renderArticlesSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-stats-grid">
          <DashboardStat label="Опубликованные статьи" value={articleStats.publishedCount || 0} accent="green" />
          <DashboardStat label="На модерации" value={articleStats.pendingCount || 0} />
          <DashboardStat label="Черновики" value={articleStats.draftCount || 0} />
        </div>
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Публикации</div>
            <h2 className="account-section-card__title">Все мои статьи</h2>
          </div>
          <button type="button" className="account-outline-button" onClick={() => openArticleEditor()}>
            Написать статью
          </button>
        </div>
        {articleItems.length ? (
          <div className="account-items-grid">
            {articleItems.map((article) => (
              <DashboardItemCard
                key={article.id}
                item={article}
                actionLabel={getArticleActionLabel(article)}
                onAction={() => openArticleItem(article)}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel title="Пока нет материалов" text="Как только ты создашь первую статью или черновик, они появятся в этом разделе." />
        )}
      </section>
    </div>
  );

  const renderDraftsSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-stats-grid">
          <DashboardStat label="Черновики статей" value={articleStats.draftCount || 0} accent="soft" />
          <DashboardStat label="Черновики проектов" value={projectStats.draftCount || 0} />
        </div>
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Статьи</div>
            <h2 className="account-section-card__title">Черновики статей</h2>
          </div>
          <button type="button" className="account-outline-button" onClick={() => openArticleEditor()}>
            Написать статью
          </button>
        </div>
        {articleStats.drafts?.length ? (
          <div className="account-items-grid">
            {articleStats.drafts.map((draft) => (
              <DashboardItemCard key={draft.id} item={draft} actionLabel="Продолжить редактирование" onAction={() => openArticleEditor(draft.id)} />
            ))}
          </div>
        ) : (
          <EmptyPanel title="Черновиков статей пока нет" text="Как только у тебя появятся сохранённые черновики статей, они будут доступны здесь." />
        )}
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Проекты</div>
            <h2 className="account-section-card__title">Черновики проектов</h2>
          </div>
          <button type="button" className="account-outline-button" onClick={() => openProjectEditor()}>
            Создать проект
          </button>
        </div>
        {draftProjectItems.length ? (
          <div className="account-items-grid">
            {draftProjectItems.map((project) => (
              <DashboardItemCard key={project.id} item={project} actionLabel="Продолжить редактирование" onAction={() => openProjectEditor(project.id)} />
            ))}
          </div>
        ) : (
          <EmptyPanel title="Черновиков проектов пока нет" text="Когда ты начнёшь сохранять проекты как черновики, они появятся в этом разделе." />
        )}
      </section>
    </div>
  );

  const renderProjectsSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-stats-grid">
          <DashboardStat label="Всего проектов" value={projectStats.count || 0} accent="green" />
          <DashboardStat label="Опубликованные" value={projectStats.publishedCount || 0} />
          <DashboardStat label="На модерации" value={projectStats.pendingCount || 0} />
          <DashboardStat label="Черновики" value={projectStats.draftCount || 0} />
        </div>
      </section>

      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Проекты</div>
            <h2 className="account-section-card__title">Мои проекты</h2>
          </div>
          <button type="button" className="account-outline-button" onClick={() => openProjectEditor()}>
            Создать проект
          </button>
        </div>
        {projectStats.items?.length ? (
          <div className="account-items-grid">
            {projectStats.items.map((project) => (
              <DashboardItemCard
                key={project.id}
                item={project}
                actionLabel={project.postStatus === 'publish' ? 'Открыть проект' : 'Продолжить редактирование'}
                onAction={() => openProjectItem(project)}
              />
            ))}
          </div>
        ) : (
          <EmptyPanel title="У тебя пока нет проектов" text="Как только ты создашь первый проект, здесь появится краткая сводка по каждому из них." />
        )}
      </section>
    </div>
  );

  const renderStatisticsSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Статистика</div>
            <h2 className="account-section-card__title">Активность пользователя</h2>
            <p className="account-section-card__sub">График показывает, сколько статей и проектов ты создавал за последние месяцы.</p>
          </div>
        </div>
        {activity.length ? <ActivityChart points={activity} /> : <EmptyPanel title="Пока нет активности" text="Когда начнут появляться статьи и проекты, здесь сформируется график." />}
      </section>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="account-section-stack">
      <section className="account-section-card">
        <div className="account-section-card__header">
          <div>
            <div className="account-section-card__eyebrow">Настройки</div>
            <h2 className="account-section-card__title">Данные профиля</h2>
            <p className="account-section-card__sub">Обновите имя, email, пароль и настройки рассылки. Все изменения сохраняются в вашем WordPress-профиле.</p>
          </div>
        </div>

        <form className="account-settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Имя и фамилия *</label>
            <input className={getFieldClassName('fullName')} type="text" placeholder="Александр Петров" autoComplete="name" value={form.fullName} onChange={handleChange('fullName')} />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className={getFieldClassName('email')} type="email" placeholder="alex@example.com" autoComplete="email" value={form.email} onChange={handleChange('email')} />
          </div>

          <div className="form-group">
            <label className="form-label">Новый пароль</label>
            <input
              className={getFieldClassName('password')}
              type="password"
              placeholder="Оставьте пустым, если менять не нужно"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange('password')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Подтверждение нового пароля</label>
            <input
              className={getFieldClassName('confirmPassword')}
              type="password"
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
            />
          </div>

          <label className="checkbox-wrap">
            <input type="checkbox" checked={form.newsletter} onChange={handleChange('newsletter')} />
            <span className="checkbox-label">Получать еженедельный дайджест платформы</span>
          </label>

          {submitState.message ? <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p> : null}

          <div className="account-actions">
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitState.status === 'submitting'}>
              {submitState.status === 'submitting' ? 'Сохраняем...' : 'Сохранить изменения →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  const sectionRenderer = {
    profile: renderProfileSection,
    articles: renderArticlesSection,
    drafts: renderDraftsSection,
    projects: renderProjectsSection,
    statistics: renderStatisticsSection,
    settings: renderSettingsSection,
  };

  if (!isLoggedIn) {
    return (
      <div className="account-page page-inner-pad">
        <div className="account-guest art-submit-message art-submit-message--error">
          Доступ к личному кабинету есть только после входа. <a href={loginUrl}>Войти в аккаунт</a>
        </div>
      </div>
    );
  }

  return (
    <AccountShell
      data={data}
      sections={sections}
      activeSection={activeSection}
      onSelectSection={handleSectionSelect}
      onLogout={handleLogout}
    >
      {sectionRenderer[activeSection]?.()}
    </AccountShell>
  );
}
