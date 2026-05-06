import { Moon, Sun, X } from 'lucide-react';

const Sidebar = ({ navItems, user, currentPath, theme, toggleTheme, logout, isOpen, onClose }) => {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-sm lg:flex">
        <SidebarContent
          navItems={navItems}
          user={user}
          currentPath={currentPath}
          theme={theme}
          toggleTheme={toggleTheme}
          logout={logout}
        />
      </aside>

      {/* Mobile sidebar — off-canvas slide */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] shadow-xl transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--sidebar-active)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          navItems={navItems}
          user={user}
          currentPath={currentPath}
          theme={theme}
          toggleTheme={toggleTheme}
          logout={logout}
        />
      </aside>
    </>
  );
};

const SidebarContent = ({ navItems, user, currentPath, theme, toggleTheme, logout }) => {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm">
            <span className="text-lg font-bold">+</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">CareOS</p>
            <h1 className="truncate text-base font-semibold leading-tight text-[var(--text-primary)]">Hospital Management</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-active)]/50 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isActive ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] px-4 py-5">
        {/* User profile */}
        <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-secondary)] px-3 py-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-white">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'User Name'}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">{user?.role || 'Staff'}</p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-secondary)] px-3 py-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bg-primary)] text-[var(--accent)]">
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Appearance</p>
              <p className="text-[11px] text-[var(--text-secondary)]">{theme === 'dark' ? 'Dark' : 'Light'} mode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--accent)]' : 'bg-slate-300'}`}
          >
            <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
