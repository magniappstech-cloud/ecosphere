function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'ES';
}

export function AccountShell({
  data,
  title = 'ЭкоСфера',
  sections = [],
  activeSection = '',
  onSelectSection,
  onLogout,
  children,
}) {
  const displayName = data?.user?.displayName || [data?.user?.firstName, data?.user?.lastName].filter(Boolean).join(' ');

  return (
    <div className="account-page page-inner-pad">
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-sidebar__brand">
            <span className="account-sidebar__dot" aria-hidden="true" />
            <span>{title}</span>
          </div>

          <nav className="account-sidebar__nav" aria-label="Разделы личного кабинета">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`account-sidebar__link${activeSection === section.id ? ' is-active' : ''}`}
                onClick={() => onSelectSection?.(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="account-sidebar__footer">
            <div className="account-sidebar__user">
              <div className="account-sidebar__avatar">{getInitials(displayName)}</div>
              <div>
                <div className="account-sidebar__user-name">{displayName || 'Участник'}</div>
                <div className="account-sidebar__user-role">{data?.user?.isAdmin ? 'ADMIN' : 'MEMBER'}</div>
              </div>
            </div>
            <button type="button" className="account-sidebar__logout" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </aside>

        <main className="account-content">
          {children}
        </main>
      </div>
    </div>
  );
}
