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

const STATUS_OPTIONS = [
  { value: 'process', label: 'В процессе' },
  { value: 'finish', label: 'Завершён' },
];

const FORMAT_OPTIONS = [
  { value: 'initiative', label: 'Инициатива' },
  { value: 'research', label: 'Исследование' },
  { value: 'education', label: 'Образование' },
];

export function ProjectEditorPage({ data, routeParams = {}, changePage }) {
  const draftId = Number.parseInt(routeParams.id || '0', 10) || 0;
  const allProjects = data?.userDashboard?.projects?.items || [];
  const editableProject = allProjects.find((item) => item.id === draftId) || null;
  const projectsUrl = buildPortalPageUrl(data?.site?.url, 'projects');
  const loginUrl = buildPortalPageUrl(data?.site?.url, 'login');
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    city: '',
    status: 'process',
    format: 'initiative',
  });
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

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

  useEffect(() => {
    setForm({
      title: editableProject?.title || '',
      excerpt: editableProject?.excerpt || '',
      content: editableProject?.content ? String(editableProject.content).replace(/<[^>]+>/g, '').trim() : '',
      city: editableProject?.city || '',
      status: editableProject?.status || 'process',
      format: editableProject?.format || 'initiative',
    });
  }, [editableProject]);

  const pageTitle = useMemo(() => (editableProject ? 'Редактирование проекта' : 'Новый проект'), [editableProject]);

  const handleSidebarSelect = (sectionId) => {
    if (typeof changePage === 'function') {
      changePage('account', { section: sectionId });
      return;
    }

    window.location.href = buildPortalPageUrl(data?.site?.url, 'account', { section: sectionId });
  };

  const handleLogout = async () => {
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

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submitProject = async (mode) => {
    setSubmitState({
      status: 'submitting',
      message: mode === 'draft' ? 'Сохраняем черновик проекта...' : 'Отправляем проект на модерацию...',
    });

    try {
      const response = await fetch(data?.rest?.projectSubmission, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
        body: JSON.stringify({
          postId: editableProject?.id || 0,
          mode,
          ...form,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || 'Не удалось сохранить проект.');
      }

      setSubmitState({
        status: 'success',
        message: payload?.message || 'Изменения сохранены.',
      });

      window.setTimeout(() => {
        if (mode === 'draft') {
          const nextId = payload?.postId || editableProject?.id || draftId;

          if (typeof changePage === 'function') {
            changePage('project-editor', { id: nextId });
            return;
          }

          window.location.href = buildPortalPageUrl(data?.site?.url, 'project-editor', { id: nextId });
          return;
        }

        window.location.href = buildPortalPageUrl(data?.site?.url, 'account', { section: 'projects' });
      }, 900);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось сохранить проект.',
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="account-page page-inner-pad">
        <div className="account-guest art-submit-message art-submit-message--error">
          Чтобы работать с проектами, сначала <a href={loginUrl}>войдите в аккаунт</a>.
        </div>
      </div>
    );
  }

  if (draftId > 0 && !editableProject) {
    return (
      <AccountShell
        data={data}
        sections={sections}
        activeSection="projects"
        onSelectSection={handleSidebarSelect}
        onLogout={handleLogout}
      >
        <div className="account-section-stack">
          <div className="editor-guard art-submit-message art-submit-message--error">Проект не найден или недоступен для редактирования.</div>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      data={data}
      sections={sections}
      activeSection="projects"
      onSelectSection={handleSidebarSelect}
      onLogout={handleLogout}
    >
      <div className="account-section-stack">
        <section className="account-section-card editor-shell editor-shell--embedded">
          <div className="editor-shell__top">
            <a className="art-back" href={projectsUrl}>
              К проектам
            </a>
            <div className="sec-label">Редактор проектов</div>
            <h1 className="editor-shell__title">{pageTitle}</h1>
            <p className="editor-shell__sub">Проект можно сохранить как черновик для дальнейшей доработки или отправить на модерацию, когда всё будет готово.</p>
          </div>

          <div className="editor-form">
            <div className="form-group">
              <label className="form-label">Название проекта</label>
              <input className="form-input" value={form.title} onChange={handleChange('title')} placeholder="Введите название проекта..." />
            </div>

            <div className="editor-form__grid">
              <div className="form-group">
                <label className="form-label">Город</label>
                <input className="form-input" value={form.city} onChange={handleChange('city')} placeholder="Например, Москва" />
              </div>
              <div className="form-group">
                <label className="form-label">Статус</label>
                <select className="form-input" value={form.status} onChange={handleChange('status')}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Формат</label>
                <select className="form-input" value={form.format} onChange={handleChange('format')}>
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Краткое описание</label>
              <textarea className="form-input" rows="4" value={form.excerpt} onChange={handleChange('excerpt')} placeholder="Кратко опишите проект..." />
            </div>
            <div className="form-group">
              <label className="form-label">Полное описание</label>
              <textarea className="form-input editor-form__textarea" rows="16" value={form.content} onChange={handleChange('content')} placeholder="Расскажите о целях, ходе и результатах проекта..." />
            </div>

            {submitState.message ? <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p> : null}

            <div className="editor-actions">
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => submitProject('draft')} disabled={submitState.status === 'submitting'}>
                Сохранить черновик
              </button>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => submitProject('pending')} disabled={submitState.status === 'submitting'}>
                Отправить на модерацию →
              </button>
            </div>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
