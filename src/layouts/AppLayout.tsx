import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MarketTicker } from '../components/MarketTicker';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/portfolio', label: 'Portafolios' },
  { to: '/analytics', label: 'Analítica' },
  { to: '/market', label: 'Mercado' },
  { to: '/alerts', label: 'Alertas' },
  { to: '/profile', label: 'Perfil' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#e8eef6] text-slate-900 dark:bg-[#070d18] dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-white/10 dark:bg-[#0b1220]">
          <div className="px-5 py-5 text-lg font-semibold tracking-tight">InvestAI</div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `min-h-11 rounded-xl px-3 py-2 text-sm leading-7 ${isActive ? 'bg-teal-800 text-white dark:bg-teal-700' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-3 border-t border-slate-200 p-4 dark:border-white/10">
            <button type="button" onClick={toggleTheme} className="min-h-11 text-xs text-slate-500">
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
            <div>
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              <button type="button" className="mt-2 min-h-11 text-xs font-medium text-teal-800 dark:text-teal-300" onClick={signOut}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <MarketTicker />
          <main className="px-3 py-4 pb-24 sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-[#0b1220] text-[11px] text-slate-300 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {links.slice(0, 3).map((link) => (
          <NavLink key={link.to} to={link.to} className="flex min-h-14 items-center justify-center px-1 text-center" onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
        <button type="button" className="min-h-14" onClick={() => setMenuOpen((open) => !open)}>
          Más
        </button>
      </nav>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
          <div className="panel absolute inset-x-0 bottom-0 space-y-2 rounded-b-none p-4 pb-8">
            {links.slice(3).map((link) => (
              <NavLink key={link.to} to={link.to} className="block min-h-11 rounded-xl px-3 py-2" onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <button type="button" className="block min-h-11 px-3 text-left" onClick={toggleTheme}>
              {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            </button>
            <p className="px-3 text-sm">{user?.firstName} {user?.lastName}</p>
            <button type="button" className="block min-h-11 px-3 text-left text-rose-300" onClick={signOut}>
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
