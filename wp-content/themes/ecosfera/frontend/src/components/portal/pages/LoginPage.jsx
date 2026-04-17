import { useState } from 'react';

function buildPortalPageUrl(siteUrl, pageId) {
  return `${siteUrl || '/'}#${pageId}`;
}

function validateForm(form) {
  const nextInvalidFields = {};

  if (!form.login.trim()) {
    nextInvalidFields.login = 'Укажите email.';
  }

  if (!form.password) {
    nextInvalidFields.password = 'Укажите пароль.';
  }

  return nextInvalidFields;
}

export function LoginPage({ data }) {
  const users = data?.stats?.participants || 0;
  const countries = data?.stats?.countries || 0;
  const projects = data?.stats?.projects || 0;
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const registerUrl = buildPortalPageUrl(data?.site?.url, 'register');
  const accountUrl = buildPortalPageUrl(data?.site?.url, 'account');
  const [form, setForm] = useState({
    login: '',
    password: '',
    remember: true,
  });
  const [invalidFields, setInvalidFields] = useState({});
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  const getFieldClassName = (field) => `form-input${invalidFields[field] ? ' form-input--invalid' : ''}`;

  const handleChange = (field) => (event) => {
    const value = field === 'remember' ? event.target.checked : event.target.value;

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoggedIn) {
      setSubmitState({
        status: 'success',
        message: 'Вы уже вошли в аккаунт.',
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
      message: 'Выполняем вход...',
    });

    try {
      const response = await fetch(data?.rest?.loginUser, {
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
        throw new Error(result?.message || 'Не удалось выполнить вход.');
      }

      setSubmitState({
        status: 'success',
        message: 'Вход выполнен. Обновляем страницу...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось выполнить вход.',
      });
    }
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

      window.location.reload();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось выйти из аккаунта.',
      });
    }
  };

  return (
    <div id="reg-inner" className="reg-inner-grid page-inner-pad">
      <div className="reg-visual">
        <div className="reg-visual-deco" aria-hidden="true">
          В
        </div>
        <div className="reg-visual-tag">Сообщество безопасности</div>
        <h2 className="reg-visual-h">
          ВЕРНИТЕСЬ В
          <br />
          СООБЩЕСТВО
        </h2>
        <p className="reg-visual-body">
          Войдите в аккаунт, чтобы публиковать инициативы, отправлять статьи и работать с материалами платформы.
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
          <h1 className="reg-form-h">Войти</h1>
          <p className="reg-form-sub">
            Нет аккаунта? <a href={registerUrl}>Зарегистрироваться</a>
          </p>

          {isLoggedIn ? (
            <>
              <div className="art-submit-message art-submit-message--success">
                Вы уже вошли как <strong>{data?.user?.displayName || 'пользователь'}</strong>.
              </div>
              <div className="account-actions">
                <a className="btn btn-primary btn-full btn-lg" href={accountUrl}>
                  Открыть личный кабинет →
                </a>
                <button type="button" className="btn btn-ghost btn-full btn-lg" onClick={handleLogout}>
                  Выйти из аккаунта
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className={getFieldClassName('login')}
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  value={form.login}
                  onChange={handleChange('login')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Пароль *</label>
                <input
                  className={getFieldClassName('password')}
                  type="password"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange('password')}
                />
              </div>

              <label className="checkbox-wrap">
                <input type="checkbox" checked={form.remember} onChange={handleChange('remember')} />
                <span className="checkbox-label">Запомнить меня на этом устройстве</span>
              </label>

              {submitState.message ? (
                <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p>
              ) : null}

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 'var(--sp-6)' }}
                disabled={submitState.status === 'submitting'}
              >
                {submitState.status === 'submitting' ? 'Входим...' : 'Войти →'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
