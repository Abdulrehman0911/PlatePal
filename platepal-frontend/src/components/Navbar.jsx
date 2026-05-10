import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/favorites', label: 'Favorites', icon: 'favorite' },
  { path: '/filter-calories', label: 'Diet', icon: 'local_dining' },
  { path: '/health-history', label: 'Health', icon: 'monitor_heart' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-outline-variant/40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-on-primary text-xl">restaurant</span>
            </div>
            <span className="font-['Epilogue'] font-bold text-xl text-primary-container hidden sm:inline">PlatePal</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${active ? 'filled' : ''}`}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-secondary-container text-on-surface font-['Epilogue'] font-bold text-sm flex items-center justify-center hover:shadow-md transition-shadow"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-outline-variant/30 py-2 animate-slide-down">
                  <div className="px-4 py-3 border-b border-outline-variant/30">
                    <p className="text-sm font-semibold text-on-surface font-['Epilogue']">{user?.name}</p>
                    <p className="text-xs text-outline">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Profile
                  </Link>
                  <Link to="/log-health" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Log Health Data
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-outline-variant/30 bg-white animate-slide-down">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                    active ? 'bg-primary-container/10 text-primary-container' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Click-outside overlay for profile dropdown */}
      {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
    </>
  );
}
