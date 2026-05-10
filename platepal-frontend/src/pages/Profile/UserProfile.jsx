import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-xl mx-auto px-5 pt-24 pb-12">
        <div className="animate-fade-in-up">
          <h1 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-6">Profile</h1>
        </div>

        {/* Avatar + Name */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-6 text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary font-['Epilogue'] font-bold text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="font-['Epilogue'] font-bold text-xl text-on-surface">{user?.name}</h2>
          <p className="text-sm text-outline font-['Manrope']">{user?.email}</p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {user?.city}
          </div>
          {user?.created_at && (
            <p className="text-xs text-outline mt-2">
              Member since {new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })}
            </p>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { to: '/favorites', icon: 'favorite', label: 'My Favorites', desc: 'View saved restaurants' },
            { to: '/health-history', icon: 'monitor_heart', label: 'Health History', desc: 'View your health data' },
            { to: '/log-health', icon: 'add_circle', label: 'Log Health Data', desc: 'Record your vitals' },
            { to: '/filter-calories', icon: 'local_fire_department', label: 'Diet Planner', desc: 'Filter dishes by calories' },
          ].map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-surface-container transition-colors ${i > 0 ? 'border-t border-outline-variant/20' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary-container">{link.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface">{link.label}</p>
                <p className="text-xs text-outline">{link.desc}</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full mt-6 h-12 border border-error/30 text-error rounded-xl text-sm font-semibold hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Logout
        </button>
      </main>
    </div>
  );
}
