import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import { Avatar } from '../ui/index.jsx';
import { cn } from '../../lib/utils.js';
import {
  LayoutDashboard, FlaskConical, ScanLine, Building2,
  Bell, Settings2, User, LogOut, ChevronDown, Menu, X,
  Beaker,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',        icon: LayoutDashboard, role: null },
  { path: '/samples', label: 'Namunalar',         icon: FlaskConical,    role: null },
  { path: '/scan',    label: 'Skaner',            icon: ScanLine,        role: 'canScan' },
  { path: '/labs',    label: 'Laboratoriyalar',   icon: Building2,       role: null },
  { path: '/alerts',  label: 'Ogohlantirishlar',  icon: Bell,            role: null },
  { path: '/admin',   label: 'Boshqaruv',         icon: Settings2,       role: 'isSuperAdmin' },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  lab_manager: 'Lab Menejeri',
  technician:  'Texnik',
  observer:    'Kuzatuvchi',
};

export default function Navbar() {
  const { user, userProfile, unreadAlerts, logout, isSuperAdmin, canScan, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [sideOpen,  setSideOpen]  = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => setSideOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    showToast('Tizimdan chiqildi', 'info');
    navigate('/auth');
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!user) return false;
    if (!item.role) return true;
    if (item.role === 'isSuperAdmin') return isSuperAdmin;
    if (item.role === 'canScan')      return canScan;
    return true;
  });

  if (!user) return null;

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hide-mobile fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-100 shadow-nav flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-none">NamunaKuzatuv</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Lab boshqaruv tizimi</p>
            </div>
          </NavLink>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} size={18} />
                  <span className="flex-1">{label}</span>
                  {path === '/alerts' && unreadAlerts.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User panel */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
          >
            <Avatar user={userProfile} size="sm" />
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-none truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{ROLE_LABELS[userProfile?.role]}</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="mt-1 bg-white border border-slate-100 rounded-xl shadow-lg py-1 overflow-hidden">
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 text-slate-400" /> Profil
              </NavLink>
              <hr className="my-1 border-slate-100" />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Chiqish
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <header className="hide-desktop fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3">
        <button onClick={() => setSideOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Beaker className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-sm">NamunaKuzatuv</span>
        </div>
        {unreadAlerts.length > 0 && (
          <NavLink to="/alerts" className="relative p-1.5">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
              {unreadAlerts.length}
            </span>
          </NavLink>
        )}
        <NavLink to="/profile">
          <Avatar user={userProfile} size="xs" />
        </NavLink>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      {sideOpen && (
        <div className="hide-desktop fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSideOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col h-full animate-slide-in shadow-modal">
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
              <span className="font-black text-slate-900">NamunaKuzatuv</span>
              <button onClick={() => setSideOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {visibleItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={() => setSideOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon size={18} />
                  {label}
                  {path === '/alerts' && unreadAlerts.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                      {unreadAlerts.length}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={userProfile} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{userProfile?.displayName}</p>
                  <p className="text-xs text-slate-400">{ROLE_LABELS[userProfile?.role]}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Tizimdan chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ─────────────────────────────── */}
      <nav className="bottom-nav hide-desktop">
        {visibleItems.slice(0, 5).map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-medium transition-all relative',
              isActive ? 'text-blue-600' : 'text-slate-400'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{label.split(' ')[0]}</span>
                {path === '/alerts' && unreadAlerts.length > 0 && (
                  <span className="absolute -top-0.5 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                    {unreadAlerts.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
