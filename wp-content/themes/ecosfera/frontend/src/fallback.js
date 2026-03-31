const root = document.getElementById('ecosfera-app');
const data = window.ecosferaData || {};

if (root) {
  root.innerHTML = `
    <section style="padding: 48px 16px; font-family: Segoe UI, sans-serif;">
      <div style="max-width: 900px; margin: 0 auto; background: #fff; border-radius: 18px; padding: 32px; box-shadow: 0 24px 60px rgba(24,59,48,.08);">
        <p style="margin: 0 0 12px; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; color: #116242;">${data?.site?.name || 'Ecosfera'}</p>
        <h1 style="margin: 0 0 16px; color: #163328;">Тема активирована, осталось собрать React-фронтенд</h1>
        <p style="margin: 0 0 16px; color: #5f756d; line-height: 1.7;">
          WordPress уже работает как backend. Чтобы включить React-интерфейс, выполните в каталоге темы команды <code>npm install</code> и <code>npm run build</code>
          или запустите dev-сервер через <code>npm run dev</code>.
        </p>
        <p style="margin: 0; color: #5f756d; line-height: 1.7;">
          После сборки тема автоматически подхватит файлы из <code>assets/build</code>.
        </p>
      </div>
    </section>
  `;
}

