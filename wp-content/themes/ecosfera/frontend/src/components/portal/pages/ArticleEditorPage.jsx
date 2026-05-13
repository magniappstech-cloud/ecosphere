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

export function ArticleEditorPage({ data, routeParams = {}, changePage }) {
  const draftId = Number.parseInt(routeParams.id || '0', 10) || 0;
  const drafts = data?.userDashboard?.articles?.drafts || [];
  const editableArticle = drafts.find((item) => item.id === draftId) || null;
  const articlesUrl = buildPortalPageUrl(data?.site?.url, 'articles');
  const loginUrl = buildPortalPageUrl(data?.site?.url, 'login');
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
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
      title: editableArticle?.title || '',
      excerpt: editableArticle?.excerpt || '',
      content: editableArticle?.content ? String(editableArticle.content).replace(/<[^>]+>/g, '').trim() : '',
    });
  }, [editableArticle]);

  const pageTitle = useMemo(() => (editableArticle ? 'Редактирование черновика статьи' : 'Новая статья'), [editableArticle]);

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

  const submitArticle = async (mode) => {
    setSubmitState({
      status: 'submitting',
      message: mode === 'draft' ? 'Сохраняем черновик...' : 'Отправляем статью на модерацию...',
    });

    try {
      const response = await fetch(data?.rest?.articleSubmission, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
        body: JSON.stringify({
          postId: editableArticle?.id || 0,
          mode,
          ...form,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || 'Не удалось сохранить статью.');
      }

      setSubmitState({
        status: 'success',
        message: payload?.message || 'Изменения сохранены.',
      });

      window.setTimeout(() => {
        if (mode === 'draft') {
          const nextId = payload?.postId || editableArticle?.id || draftId;

          if (typeof changePage === 'function') {
            changePage('article-editor', { id: nextId });
            return;
          }

          window.location.href = buildPortalPageUrl(data?.site?.url, 'article-editor', { id: nextId });
          return;
        }

        window.location.href = articlesUrl;
      }, 900);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось сохранить статью.',
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="account-page page-inner-pad">
        <div className="account-guest art-submit-message art-submit-message--error">
          Чтобы работать со статьями, сначала <a href={loginUrl}>войдите в аккаунт</a>.
        </div>
      </div>
    );
  }

  if (draftId > 0 && !editableArticle) {
    return (
      <AccountShell
        data={data}
        sections={sections}
        activeSection="articles"
        onSelectSection={handleSidebarSelect}
        onLogout={handleLogout}
      >
        <div className="account-section-stack">
          <div className="editor-guard art-submit-message art-submit-message--error">Черновик статьи не найден или недоступен для редактирования.</div>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      data={data}
      sections={sections}
      activeSection="articles"
      onSelectSection={handleSidebarSelect}
      onLogout={handleLogout}
    >
      <div className="account-section-stack">
        <section className="account-section-card editor-shell editor-shell--embedded">
          <div className="editor-shell__top">
            <a className="art-back" href={articlesUrl}>
              К списку статей
            </a>
            <div className="sec-label">Редактор статей</div>
            <h1 className="editor-shell__title">{pageTitle}</h1>
            <p className="editor-shell__sub">Можно сохранить материал как черновик и вернуться к нему позже, либо сразу отправить на модерацию.</p>
          </div>

          <div className="editor-form">
            <div className="form-group">
              <label className="form-label">Заголовок</label>
              <input className="form-input" value={form.title} onChange={handleChange('title')} placeholder="Введите заголовок статьи..." />
            </div>
            <div className="form-group">
              <label className="form-label">Лид-абзац</label>
              <textarea className="form-input" rows="4" value={form.excerpt} onChange={handleChange('excerpt')} placeholder="Краткое описание статьи..." />
            </div>
            <div className="form-group">
              <label className="form-label">Полный текст</label>
              <textarea className="form-input editor-form__textarea" rows="16" value={form.content} onChange={handleChange('content')} placeholder="Основной текст статьи..." />
            </div>

            {submitState.message ? <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p> : null}

            <div className="editor-actions">
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => submitArticle('draft')} disabled={submitState.status === 'submitting'}>
                Сохранить черновик
              </button>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => submitArticle('pending')} disabled={submitState.status === 'submitting'}>
                Отправить на модерацию →
              </button>
            </div>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
