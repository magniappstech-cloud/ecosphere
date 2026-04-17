import { useState } from 'react';

function buildPortalPageUrl(siteUrl, pageId) {
  return `${siteUrl || '/'}#${pageId}`;
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

export function AccountPage({ data }) {
  const users = data?.stats?.participants || 0;
  const countries = data?.stats?.countries || 0;
  const projects = data?.stats?.projects || 0;
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const loginUrl = buildPortalPageUrl(data?.site?.url, 'login');
  const [form, setForm] = useState({
    fullName: data?.user?.displayName || [data?.user?.firstName, data?.user?.lastName].filter(Boolean).join(' '),
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

      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось обновить профиль.',
      });
    }
  };

  return (
    <div id="reg-inner" className="reg-inner-grid page-inner-pad">
      <div className="reg-visual">
        <div className="reg-visual-deco" aria-hidden="true">
          ЛК
        </div>
        <div className="reg-visual-tag">Личный кабинет</div>
        <h2 className="reg-visual-h">
          УПРАВЛЯЙТЕ
          <br />
          ПРОФИЛЕМ
        </h2>
        <p className="reg-visual-body">
          Обновите имя, email, пароль и настройки рассылки. Все изменения сохраняются в вашем WordPress-профиле.
        </p>
        <div className="reg-visual-stats">
          <div>
            <span className="reg-stat-val">{users.toLocaleString('ru-RU')}</span>
            <span className="reg-stat-label">Участников</span>
          </div>
          <div>
            <span className="reg-stat-val">{countries}</span>
            <span className="reg-stat-label">Стран</span>
          </div>
          <div>
            <span className="reg-stat-val">{projects}</span>
            <span className="reg-stat-label">Проектов</span>
          </div>
        </div>
      </div>

      <div className="reg-form-wrap">
        <form className="reg-form-inner" onSubmit={handleSubmit}>
          <h1 className="reg-form-h">Личный кабинет</h1>
          <p className="reg-form-sub">
            {isLoggedIn ? 'Изменения доступны сразу после сохранения.' : <>Чтобы открыть кабинет, нужно <a href={loginUrl}>войти</a>.</>}
          </p>

          {isLoggedIn ? (
            <>
              <div className="form-group">
                <label className="form-label">Имя и фамилия *</label>
                <input
                  className={getFieldClassName('fullName')}
                  type="text"
                  placeholder="Александр Петров"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className={getFieldClassName('email')}
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange('email')}
                />
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

              {submitState.message ? (
                <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p>
              ) : null}

              <div className="account-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={submitState.status === 'submitting'}
                >
                  {submitState.status === 'submitting' ? 'Сохраняем...' : 'Сохранить изменения →'}
                </button>
                <button type="button" className="btn btn-ghost btn-full btn-lg" onClick={handleLogout}>
                  Выйти из аккаунта
                </button>
              </div>
            </>
          ) : (
            <div className="art-submit-message art-submit-message--error">Доступ к личному кабинету есть только после входа.</div>
          )}
        </form>
      </div>
    </div>
  );
}
