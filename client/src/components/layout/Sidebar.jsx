import { useContext } from 'react';
import { Moon, Sun, X, Lock, Shield } from 'lucide-react';
import { RBACContext, DEMO_ROLES, ROLE_LABELS } from '../../context/RBACContext';

const Sidebar = ({ navItems, user, currentPath, theme, toggleTheme, logout, isOpen, onClose }) => {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col p-4 lg:flex">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow)]">
          <SidebarContent
            navItems={navItems}
            user={user}
            currentPath={currentPath}
            theme={theme}
            toggleTheme={toggleTheme}
            logout={logout}
          />
        </div>
      </aside>

      {/* Mobile sidebar — off-canvas slide */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-72 flex-col p-3 transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow)]">
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
        </div>
      </aside>
    </>
  );
};

const RoleBadgeColor = {
  admin: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  doctor: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  labtech: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
  patient: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const SidebarContent = ({ navItems, user, currentPath, theme, toggleTheme, logout }) => {
  const rbac = useContext(RBACContext);
  const activeRole = rbac?.activeRole || user?.role || 'admin';
  const setActiveRole = rbac?.setActiveRole;
  const canAccess = rbac?.canAccess;

  const badgeStyle = RoleBadgeColor[activeRole] || RoleBadgeColor.admin;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-sm">
            <span className="text-lg font-bold">+</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">CareOS</p>
            <h1 className="truncate text-sm font-semibold leading-tight text-[var(--text-primary)]">Hospital Management</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const isLocked = canAccess ? !canAccess(item.path) : false;

            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                  title={isLocked ? `Access restricted for ${ROLE_LABELS[activeRole] || activeRole}` : item.label}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isLocked
                    ? 'cursor-not-allowed opacity-40'
                    : isActive
                      ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-active)]/50 hover:text-[var(--text-primary)]'
                    }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${isLocked
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    : isActive
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>

                  {/* Lock icon for restricted links */}
                  {isLocked && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                      <Lock size={11} className="text-[var(--text-secondary)]" />
                    </span>
                  )}

                  {/* Active indicator */}
                  {isActive && !isLocked && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] px-3 py-4 space-y-3">

        {/* User profile + Role Badge */}
        <div className="rounded-xl bg-[var(--bg-secondary)] px-3 py-3 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-white">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'User Name'}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">{user?.email || ''}</p>
            </div>
          </div>
          {/* Role Badge */}
          <div className="mt-2.5 flex items-center gap-2">
            <Shield size={12} className={badgeStyle.text} />
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyle.bg} ${badgeStyle.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
              Role: {ROLE_LABELS[activeRole] || activeRole}
            </span>
          </div>
        </div>

        {/* Demo Role Switcher */}
        <div className="rounded-xl bg-[var(--bg-secondary)] px-3 py-3 shadow-sm border border-[var(--border)] border-dashed">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Demo: Switch Role
          </p>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole && setActiveRole(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-2 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] cursor-pointer"
          >
            {DEMO_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg-secondary)] px-3 py-3 shadow-sm border border-[var(--border)]">
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
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
