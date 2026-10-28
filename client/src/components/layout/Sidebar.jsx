import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Bookmark, User, Play, LogOut, Settings, PlusSquare, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const CurioLogo = () => (
  <Link to="/" className="flex items-center gap-2.5 group px-3">
    <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-float shrink-0 group-hover:scale-105 transition-transform">
      <span className="text-white font-bold text-sm">C</span>
    </div>
    <div>
      <span className="font-bold text-lg text-ink tracking-tight">Curio</span>
      <p className="text-[10px] text-muted leading-none -mt-0.5">Discover something new</p>
    </div>
  </Link>
);

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/reels', icon: Play, label: 'Reels' },
  { to: '/saved', icon: Bookmark, label: 'Saved', auth: true },
];

export const Sidebar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 w-56 lg:w-64 shrink-0 border-r border-sage py-5 bg-offwhite">
      <div className="mb-6">
        <CurioLogo />
      </div>

      <nav className="flex-1 px-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label, end, auth }) => {
          if (auth && !isAuthenticated) return null;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
              aria-label={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          );
        })}

        {isAuthenticated && (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <LayoutDashboard size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="px-3 mt-4 border-t border-sage pt-4">
        {isAuthenticated ? (
          <div className="space-y-0.5">
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sage/60 transition-colors"
            >
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-sage"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink truncate">{user.displayName}</p>
                <p className="text-xs text-muted truncate">@{user.username}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="sidebar-link text-muted hover:text-red-600 hover:bg-red-50 w-full">
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="btn-primary w-full justify-center">Log in</Link>
            <Link to="/register" className="btn-secondary w-full justify-center">Sign up</Link>
          </div>
        )}
      </div>
    </aside>
  );
};

// Mobile bottom navigation
export const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();

  const mobileNavItems = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/reels', icon: Play, label: 'Reels' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    isAuthenticated
      ? { to: `/profile/${user?.username}`, icon: User, label: 'Profile' }
      : { to: '/login', icon: User, label: 'Login' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-offwhite/90 glass border-t border-sage"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-forest-900' : 'text-muted'
              }`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

// Mobile top header
export const MobileHeader = () => {
  const { isAdmin } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 bg-offwhite/90 glass border-b border-sage px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
          <span className="text-white font-bold text-xs">C</span>
        </div>
        <span className="font-bold text-base text-ink">Curio</span>
      </Link>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link to="/admin" className="btn-icon">
            <LayoutDashboard size={18} />
          </Link>
        )}
      </div>
    </header>
  );
};
