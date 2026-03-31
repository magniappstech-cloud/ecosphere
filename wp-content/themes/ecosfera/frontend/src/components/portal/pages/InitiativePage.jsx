export function InitiativePage({ data }) {
  const initiativeCount = data?.collections?.initiatives?.length || 4;
  const projectCount = data?.collections?.projects?.length || 6;

  return (
    <>
      <div className="initiative-hero">
        <div className="sec-label both reveal" style={{ justifyContent: 'center', marginBottom: 'var(--sp-5)' }}>Ваш голос</div>
        <h1 className="initiative-title reveal">ВАШ ГОЛОС: ПРЕДЛОЖИТЕ <span>ИНИЦИАТИВУ</span></h1>
        <p style={{ fontSize: '16px', color: 'var(--c-text-2)', maxWidth: '500px', margin: 'var(--sp-4) auto var(--sp-8)', lineHeight: 1.8 }} className="reveal">
          Каждая идея может изменить мир. Опишите проблему и решение — мы поможем воплотить.
        </p>
      </div>
      <div className="init-form-grid">
        <div>
          <div className="init-col-h">Как это работает</div>
          <ul className="init-instructions">
            <li data-n="1">Заполните все поля формы — они помогут нам правильно оценить инициативу</li>
            <li data-n="2">Прикрепите медиа-материалы — фото, видео, документы для наглядности</li>
            <li data-n="3">Укажите ресурсы и сроки — реалистичный план повышает шансы на реализацию</li>
            <li data-n="4">После отправки модератор свяжется с вами в течение 3 рабочих дней</li>
          </ul>
          <div style={{ background: 'var(--c-green-dim)', border: '1px solid rgba(42,245,152,.2)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
            <div style={{ fontFamily: 'var(--f-data)', fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--c-green)', marginBottom: 'var(--sp-3)' }}>Статистика</div>
            <div style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: 1.8 }}>{initiativeCount} инициатив подано<br />{projectCount} стран охвачено</div>
          </div>
        </div>
        <div>
          <div className="init-col-h">Заполните форму</div>
          {['Название инициативы *', 'Категория *', 'Краткое описание *', 'Описание проблемы *', 'Предлагаемое решение *', 'Ожидаемый результат'].map((label) => (
            <div className="form-group" key={label}>
              <label className="form-label">{label}</label>
              <input className="form-input" placeholder={label} />
            </div>
          ))}
          <button className="btn btn-primary btn-full btn-lg" type="button">Отправить инициативу →</button>
        </div>
        <div className="upload-col">
          <div className="init-col-h">Медиа-материалы</div>
          <div className="upload-zone" role="button" tabIndex="0" aria-label="Загрузить файлы перетаскиванием или нажатием">
            <div className="upload-icon" aria-hidden="true">📁</div>
            <div className="upload-text">Перетащите файлы сюда</div>
            <div className="upload-sub">или нажмите для выбора</div>
            <div style={{ marginTop: 'var(--sp-4)' }}><span className="btn btn-ghost btn-sm">Выбрать файлы</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
