export function RegisterPage({ data }) {
  const users = 12400;
  const countries = Math.max(data?.collections?.projects?.length || 0, 12);
  const projects = data?.collections?.projects?.length || 24;

  return (
    <div id="reg-inner" className="reg-inner-grid page-inner-pad">
      <div className="reg-visual">
        <div className="reg-visual-deco" aria-hidden="true">Б</div>
        <div className="reg-visual-tag">Сообщество безопасности</div>
        <h2 className="reg-visual-h">СТАНЬТЕ ЧАСТЬЮ<br />СООБЩЕСТВА</h2>
        <p className="reg-visual-body">Присоединяйтесь к 12 400+ экспертам, волонтёрам и лидерам, которые строят культуру безопасности будущего.</p>
        <div className="reg-visual-stats">
          <div><span className="reg-stat-val">{users.toLocaleString('ru-RU')}</span><span className="reg-stat-label">Участников</span></div>
          <div><span className="reg-stat-val">{countries}</span><span className="reg-stat-label">Стран</span></div>
          <div><span className="reg-stat-val">{projects}</span><span className="reg-stat-label">Проектов</span></div>
        </div>
      </div>
      <div className="reg-form-wrap">
        <div className="reg-form-inner">
          <h1 className="reg-form-h">Создать аккаунт</h1>
          <p className="reg-form-sub">Уже есть аккаунт? <a href="#login">Войти</a></p>
          <div className="form-group"><label className="form-label">Имя и фамилия *</label><input className="form-input" type="text" placeholder="Александр Петров" autoComplete="name" /></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="alex@example.com" autoComplete="email" /></div>
          <div className="form-group"><label className="form-label">Пароль *</label><input className="form-input" type="password" placeholder="Минимум 8 символов" autoComplete="new-password" /></div>
          <label className="checkbox-wrap">
            <input type="checkbox" defaultChecked />
            <span className="checkbox-label">Подписаться на еженедельный дайджест с лучшими материалами платформы</span>
          </label>
          <button type="button" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 'var(--sp-6)' }}>Создать аккаунт →</button>
        </div>
      </div>
    </div>
  );
}

