import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import { cn } from '../../lib/utils.js';

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',    icon: '📊', role: null },
  { path: '/samples',   label: 'Namunalar',    icon: '🧪', role: null },
  { path: '/scan',      label: 'Skaner',       icon: '📱', role: 'canScan' },
  { path: '/labs',      label: 'Laboratoriyalar', icon: '🏢', role: null },
  { path: '/alerts',    label: 'Ogohlantirishlar', icon: '🔔', role: null },
  { path: '/admin',     label: 'Boshqaruv',    icon: '⚙️', role: 'isSuperAdmin' },
];

export default function Navbar() {
  const { user, userProfile, unreadAlerts, logout, isSuperAdmin, canScan, showToast } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast("Tizimdan chiqildi", 'info');
    navigate('/auth');
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.role) return true;
    if (item.role === 'isSuperAdmin') return isSuperAdmin;
    if (item.role === 'canScan') return canScan;
    return true;
  });

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hide-mobile fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16 gap-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 font-black text-blue-600 text-xl flex-shrink-0">
            🔬 <span>NamunaKuzatuv</span>
          </NavLink>

          {/* Nav links */}
          <div className="flex items-center gap-1 flex-1">
            {user && visibleItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {item.path === '/alerts' && unreadAlerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(p => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {(userProfile?.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{userProfile?.displayName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ROLE_LABELS[userProfile?.role] || userProfile?.role}</p>
                  </div>
                  <span className="text-slate-400 text-xs">▾</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg w-48 py-1 z-50">
                    <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                      👤 Profil
                    </NavLink>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      🚪 Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                Kirish
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      {user && (
        <div className="bottom-nav hide-desktop">
          {visibleItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all relative',
                isActive ? 'text-blue-600' : 'text-slate-500'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="leading-none">{item.label.split(' ')[0]}</span>
              {item.path === '/alerts' && unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}

      {/* Click outside handler */}
      {menuOpen && <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  lab_manager: 'Lab Menejeri',
  technician:  'Texnik',
  observer:    'Kuzatuvchi',
};
