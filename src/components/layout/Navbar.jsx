import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import { cn } from '../../lib/utils.js';

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',        icon: '📊', role: null },
  { path: '/samples', label: 'Namunalar',         icon: '🧪', role: null },
  { path: '/scan',    label: 'Skaner',            icon: '📷', role: 'canScan' },
  { path: '/labs',    label: 'Laboratoriyalar',   icon: '🏢', role: null },
  { path: '/alerts',  label: 'Ogohlantirishlar',  icon: '🔔', role: null },
  { path: '/admin',   label: 'Boshqaruv',         icon: '⚙️', role: 'isSuperAdmin' },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  lab_manager: 'Lab Menejeri',
  technician:  'Texnik',
  observer:    'Kuzatuvchi',
};

function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm' };
  return (
    <div className={cn('rounded-full flex items-center justify-center font-black text-white flex-shrink-0', color, sizes[size])}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, userProfile, unreadAlerts, logout, isSuperAdmin, canScan, showToast } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Close menu on outside click
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location]);

  const handleLogout = async () => {
    await logout();
    showToast('Tizimdan muvaffaqiyatli chiqildi', 'info');
    navigate('/auth');
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.role) return true;
    if (item.role === 'isSuperAdmin') return isSuperAdmin;
    if (item.role === 'canScan') return canScan;
    return true;
  });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg">🔬</div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-none">NamunaKuzatuv</p>
            <p className="text-xs text-slate-400 mt-0.5">Lab boshqaruv tizimi</p>
          </div>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {user && visibleItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <span className={cn('nav-icon', 'transition-colors')}>{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/alerts' && unreadAlerts.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(p => !p)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left">
              <Avatar name={userProfile?.displayName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-tight">{userProfile?.displayName || 'Foydalanuvchi'}</p>
                <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[userProfile?.role] || userProfile?.role}</p>
              </div>
              <span className="text-slate-300 text-xs">▾</span>
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50">
                <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => { setMenuOpen(false); }}>
                  👤 Profilni ko'rish
                </NavLink>
                <div className="h-px bg-slate-100 mx-2 my-1" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  🚪 Chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile: Top bar */}
      <div className="app-topbar hide-desktop">
        <button onClick={() => setSidebarOpen(p => !p)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
          ☰
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">🔬</span>
          <span className="font-black text-slate-800 text-sm">NamunaKuzatuv</span>
        </div>
        {user && <Avatar name={userProfile?.displayName} size="sm" />}
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[39] hide-desktop animate-fade" onClick={() => setSidebarOpen(false)} />
          <aside className="app-sidebar open hide-desktop">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile Bottom Nav */}
      {user && (
        <nav className="mobile-nav hide-desktop">
          {visibleItems.slice(0, 5).map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all relative',
                isActive ? 'text-blue-600' : 'text-slate-400'
              )}>
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label.split(' ')[0]}</span>
              {item.path === '/alerts' && unreadAlerts.length > 0 && (
                <span className="notif-badge">{unreadAlerts.length}</span>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
