import { useState, useEffect } from 'react';
import { userService, adminService, authService, ROLES } from '../lib/firebase.js';
import { Button, Card, Select, StatCard, EmptyState, Spinner, Modal, Input } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate } from '../lib/utils.js';

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700', icon: '👑' },
  lab_manager: { label: 'Lab Menejeri', color: 'bg-blue-100 text-blue-700',   icon: '🏢' },
  technician:  { label: 'Texnik',      color: 'bg-green-100 text-green-700',  icon: '🔬' },
  observer:    { label: 'Kuzatuvchi',  color: 'bg-gray-100 text-gray-700',    icon: '👁' },
};

export default function AdminPage() {
  const { user, isSuperAdmin, showToast } = useApp();
  const [tab, setTab]       = useState('stats');
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const load = async () => {
      const [s, u] = await Promise.all([adminService.getStats(), userService.getAll()]);
      setStats(s);
      setUsers(u);
      setLoading(false);
    };
    load();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Kirish taqiqlangan</h2>
      <p className="text-slate-500">Faqat Super Admin uchun</p>
    </div>
  );

  const handleRoleChange = async (uid, role) => {
    try {
      await userService.setRole(uid, role);
      setUsers(p => p.map(u => u.id === uid ? { ...u, role } : u));
      showToast('Rol yangilandi ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">⚙️ Admin boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">Tizim sozlamalari va foydalanuvchilar</p>
        </div>
        <Button onClick={() => setAddUserOpen(true)}>➕ Foydalanuvchi qo'shish</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 mb-6">
        {[['stats', '📊 Statistika'], ['users', '👥 Foydalanuvchilar']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon="🧪" label="Jami namuna"    value={stats.total || 0}     color="blue" />
            <StatCard icon="🏢" label="Laboratoriyalar" value={stats.totalLabs || 0}  color="indigo" />
            <StatCard icon="👥" label="Foydalanuvchilar" value={stats.totalUsers || 0} color="purple" />
            <StatCard icon="🏁" label="Yakunlangan"    value={stats.completed || 0}  color="green" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard icon="📥" label="Qabul qilindi"  value={stats.received || 0}      color="blue" />
            <StatCard icon="⏳" label="Navbatda"        value={stats.waiting || 0}       color="yellow" />
            <StatCard icon="🔬" label="Sinovda"         value={stats.testing || 0}       color="purple" />
            <StatCard icon="✅" label="Muvofiq"          value={stats.compliant || 0}     color="green" />
            <StatCard icon="❌" label="Nomuvofiq"        value={stats.non_compliant || 0} color="red" />
            <StatCard icon="🔄" label="Ko'chirildi"     value={stats.transferred || 0}   color="indigo" />
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <EmptyState icon="👥" title="Foydalanuvchilar yo'q" />
          ) : (
            users.map(u => {
              const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.observer;
              const isCurrentUser = u.id === user?.uid;
              return (
                <Card key={u.id} className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {(u.displayName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">{u.displayName}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                          {roleInfo.icon} {roleInfo.label}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Siz</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                      <p className="text-xs text-slate-400">Ro'yxatdan: {formatDate(u.createdAt)}</p>
                    </div>
                    {!isCurrentUser && (
                      <Select
                        value={u.role || 'observer'}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="w-40"
                      >
                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </Select>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSuccess={u => { setUsers(p => [u, ...p]); setAddUserOpen(false); }}
      />
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────
function AddUserModal({ open, onClose, onSuccess }) {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', password: '', role: 'observer', labId: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.displayName) return showToast("Barcha maydonlarni to'ldiring", 'error');
    setLoading(true);
    try {
      await authService.registerWithEmail(form.email, form.password, form.displayName, form.role, form.labId || null);
      showToast("Foydalanuvchi qo'shildi ✅", 'success');
      setForm({ displayName: '', email: '', password: '', role: 'observer', labId: '' });
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="➕ Yangi foydalanuvchi" size="sm">
      <div className="space-y-4">
        <Input label="Ism Familiya *" value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="F.I.Sh." />
        <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        <Input label="Parol *" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Kamida 6 ta belgi" />
        <Select label="Rol" value={form.role} onChange={e => set('role', e.target.value)}>
          {Object.entries({ super_admin: '👑 Super Admin', lab_manager: '🏢 Lab Menejeri', technician: '🔬 Texnik', observer: '👁 Kuzatuvchi' }).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Bekor</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Qo'shish</Button>
        </div>
      </div>
    </Modal>
  );
}
