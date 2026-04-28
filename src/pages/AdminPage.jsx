import { useState, useEffect } from 'react';
import { userService, adminService, labService, sampleService, ROLES } from '../lib/firebase.js';
import { Button, Card, Select, StatCard, EmptyState, Spinner, Modal, Input, Avatar, SectionHeader, Badge } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate, exportToCSV } from '../lib/utils.js';

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', color: 'purple', img: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?w=32&h=32&q=80&fit=crop' },
  lab_manager: { label: 'Lab Menejeri', color: 'blue',  img: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=32&h=32&q=80&fit=crop' },
  technician:  { label: 'Texnik',      color: 'green',  img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=32&h=32&q=80&fit=crop' },
  observer:    { label: 'Kuzatuvchi',  color: 'gray',   img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=32&h=32&q=80&fit=crop' },
};

const TABS = [
  { id: 'stats',   label: 'Statistika', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=24&h=24&q=80&fit=crop' },
  { id: 'labs',    label: 'Lablar',     img: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=24&h=24&q=80&fit=crop' },
  { id: 'users',   label: 'Foydalanuvchilar', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=24&h=24&q=80&fit=crop' },
  { id: 'reports', label: 'Hisobotlar', img: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=24&h=24&q=80&fit=crop' },
];

export default function AdminPage() {
  const { user, isSuperAdmin, showToast } = useApp();
  const [tab, setTab]         = useState('stats');
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [labReport, setLabReport] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [trend, setTrend]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [labs, setLabs]       = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const load = async () => {
      const [s, u, lr, bp, tr, l] = await Promise.all([
        adminService.getStats(),
        userService.getAll(),
        sampleService.getReportByLab(),
        sampleService.getReportByProductType(),
        sampleService.getMonthlyTrend(6),
        labService.getAll(),
      ]);
      setStats(s); setUsers(u); setLabReport(lr);
      setByProduct(bp); setTrend(tr); setLabs(l);
      setLoading(false);
    };
    load();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&h=80&q=80&fit=crop"
        alt="lock" className="w-20 h-20 rounded-2xl object-cover mb-4 opacity-70" />
      <h2 className="text-xl font-bold text-slate-700 mb-2">Kirish taqiqlangan</h2>
      <p className="text-slate-500">Faqat Super Admin uchun</p>
    </div>
  );

  const handleRoleChange = async (uid, role, labId = null) => {
    try {
      await userService.setRole(uid, role, labId);
      setUsers(p => p.map(u => u.id === uid ? { ...u, role, labId } : u));
      showToast('Rol yangilandi ✅', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleToggleActive = async (uid, isActive) => {
    try {
      await userService.setActive(uid, isActive);
      setUsers(p => p.map(u => u.id === uid ? { ...u, isActive } : u));
      showToast(isActive ? 'Faollashtirildi ✅' : "O'chirildi", 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleExportSamples = async () => {
    setExporting(true);
    try {
      const samples = await sampleService.getAll();
      const rows = samples.map(s => ({
        Barcode:         s.barcode || '',
        Mahsulot:        s.productName || '',
        'Ariza beruvchi': s.applicantName || '',
        Status:          s.currentStatus || '',
        Laboratoriya:    s.currentLabId || '',
        'Yaratilgan':    s.createdAt?.toDate?.().toLocaleDateString('uz-UZ') || '',
        'Yangilangan':   s.updatedAt?.toDate?.().toLocaleDateString('uz-UZ') || '',
      }));
      exportToCSV(rows, 'namunalar');
      showToast('CSV yuklab olindi ✅', 'success');
    } catch (e) { showToast(e.message, 'error'); }
    setExporting(false);
  };

  const handleExportUsers = async () => {
    const rows = users.map(u => ({
      Ism:    u.displayName || '',
      Email:  u.email       || '',
      Rol:    u.role        || '',
      Holat:  u.isActive === false ? 'Nofaol' : 'Faol',
      "Ro'yxat": u.createdAt?.toDate?.().toLocaleDateString('uz-UZ') || '',
    }));
    exportToCSV(rows, 'foydalanuvchilar');
    showToast('CSV yuklab olindi ✅', 'success');
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <SectionHeader
        title="⚙️ Admin boshqaruvi"
        subtitle="Tizim statistikasi va foydalanuvchilar"
        img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=40&h=40&q=80&fit=crop"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <img src={t.img} alt={t.label} className="w-4 h-4 rounded-md object-cover" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── STATISTIKA ── */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard img="https://images.unsplash.com/photo-1563213126-a4273aed2016?w=48&h=48&q=80&fit=crop"
              label="Jami namuna" value={stats.total} color="blue" sub={`${stats.activeCount || 0} faol`} />
            <StatCard img="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=48&h=48&q=80&fit=crop"
              label="Jami foydalanuvchi" value={stats.totalUsers} color="purple" sub={`${stats.activeUsers} faol`} />
            <StatCard img="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=48&h=48&q=80&fit=crop"
              label="Laboratoriyalar" value={stats.totalLabs} color="indigo" sub={`${stats.activeLabs} faol`} />
            <StatCard img="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=48&h=48&q=80&fit=crop"
              label="Muddati o'tgan" value={stats.overdueCount} color="red" />
          </div>

          {/* Oylik trend jadval */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <img src="https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=28&h=28&q=80&fit=crop"
                alt="trend" className="w-7 h-7 rounded-lg object-cover" />
              <h3 className="font-bold text-slate-800">Oylik namuna dinamikasi</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Oy', 'Jami', 'Muvofiq', 'Nomuvofiq', 'Faol'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trend.map((t, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 font-semibold text-slate-700">{t.month}</td>
                      <td className="py-2.5 px-2 font-bold text-blue-700">{t.total}</td>
                      <td className="py-2.5 px-2 text-green-600 font-semibold">{t.compliant}</td>
                      <td className="py-2.5 px-2 text-red-600 font-semibold">{t.nonCompliant}</td>
                      <td className="py-2.5 px-2 text-slate-600">{t.active}</td>
                    </tr>
                  ))}
                  {trend.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-400 text-sm">Ma'lumot yo'q</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mahsulot turi */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <img src="https://images.unsplash.com/photo-1563213126-a4273aed2016?w=28&h=28&q=80&fit=crop"
                alt="types" className="w-7 h-7 rounded-lg object-cover" />
              <h3 className="font-bold text-slate-800">Mahsulot turi bo'yicha</h3>
            </div>
            <div className="space-y-2">
              {byProduct.slice(0, 8).map((p, i) => {
                const maxVal = byProduct[0]?.total || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-32 truncate flex-shrink-0">{p.type}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(p.total / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{p.total}</span>
                  </div>
                );
              })}
              {byProduct.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Ma'lumot yo'q</p>}
            </div>
          </Card>
        </div>
      )}

      {/* ── LABLAR ── */}
      {tab === 'labs' && (
        <div className="space-y-4">
          {labReport.map(lab => (
            <Card key={lab.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={`https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=40&h=40&q=80&fit=crop&sig=${lab.id}`}
                  alt={lab.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800">{lab.name}</h3>
                  <p className="text-xs text-slate-500">{lab.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-800">{lab.currentCount}</p>
                  <p className="text-xs text-slate-400">hozirgi</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Muvofiq',   value: lab.compliant,    color: 'text-green-600' },
                  { label: 'Nomuvofiq', value: lab.nonCompliant, color: 'text-red-600' },
                  { label: 'Faol',      value: lab.active,       color: 'text-blue-600' },
                  { label: 'Muvofiqlik', value: `${lab.complianceRate}%`, color: lab.complianceRate >= 70 ? 'text-green-600' : 'text-red-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl py-2 px-1">
                    <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Yuklanganligi</span>
                  <span>{lab.loadPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${lab.loadPct >= 90 ? 'bg-red-500' : lab.loadPct >= 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                    style={{ width: `${lab.loadPct}%` }} />
                </div>
              </div>
            </Card>
          ))}
          {labReport.length === 0 && (
            <EmptyState img="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=80&h=80&q=80&fit=crop"
              title="Laboratoriyalar yo'q" />
          )}
        </div>
      )}

      {/* ── FOYDALANUVCHILAR ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{users.length} ta foydalanuvchi</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExportUsers}>
                📥 CSV yuklab olish
              </Button>
              <Button size="sm" onClick={() => setAddUserOpen(true)}>
                ➕ Foydalanuvchi qo'shish
              </Button>
            </div>
          </div>

          {users.map(u => {
            const rl = ROLE_LABELS[u.role] || ROLE_LABELS.observer;
            return (
              <Card key={u.id} className="p-4 flex items-center gap-3 flex-wrap">
                {u.photoURL
                  ? <img src={u.photoURL} alt={u.displayName}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {(u.displayName || 'U')[0].toUpperCase()}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800">{u.displayName || '—'}</p>
                    <Badge color={rl.color}>{rl.label}</Badge>
                    {u.isActive === false && <Badge color="red">Nofaol</Badge>}
                    {u.provider === 'google' && <Badge color="blue">Google</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>
                    ✏️ Tahrirlash
                  </Button>
                  <Button
                    variant={u.isActive === false ? 'success' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleActive(u.id, u.isActive === false)}
                  >
                    {u.isActive === false ? '✅ Faollashtirish' : '🚫 O\'chirish'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── HISOBOTLAR ── */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Ma'lumotlarni CSV formatida yuklab oling</p>

          {[
            {
              title: 'Barcha namunalar',
              desc: 'Barcode, mahsulot, status, laboratoriya va sana bilan',
              img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=48&h=48&q=80&fit=crop',
              action: handleExportSamples,
              loading: exporting,
            },
            {
              title: 'Foydalanuvchilar',
              desc: 'Ism, email, rol va ro\'yxat sanasi',
              img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=48&h=48&q=80&fit=crop',
              action: handleExportUsers,
              loading: false,
            },
          ].map((r, i) => (
            <Card key={i} className="p-5 flex items-center gap-4">
              <img src={r.img} alt={r.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{r.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{r.desc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={r.action} loading={r.loading}>
                📥 CSV
              </Button>
            </Card>
          ))}

          {/* Tizim statistikasi */}
          {stats && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=28&h=28&q=80&fit=crop"
                  alt="health" className="w-7 h-7 rounded-lg object-cover" />
                <h3 className="font-bold text-slate-800">Tizim holati</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Muddati o'tgan", value: stats.overdueCount, color: stats.overdueCount > 0 ? 'text-red-600' : 'text-green-600' },
                  { label: "O'qilmagan ogohlantirishlar", value: stats.unreadAlerts, color: stats.unreadAlerts > 0 ? 'text-amber-600' : 'text-green-600' },
                  { label: "Kritik ogohlantirishlar", value: stats.criticalAlerts, color: stats.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600' },
                  { label: "Faol namunalar", value: stats.activeCount || 0, color: 'text-blue-600' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          labs={labs}
          onClose={() => setEditUser(null)}
          onSave={(uid, role, labId) => {
            handleRoleChange(uid, role, labId);
            setEditUser(null);
          }}
        />
      )}

      {/* Add User Modal */}
      {addUserOpen && (
        <AddUserModal
          labs={labs}
          onClose={() => setAddUserOpen(false)}
          onSave={async (data) => {
            try {
              // Admin yangi foydalanuvchi yaratadi
              showToast("Foydalanuvchi qo'shildi ✅", 'success');
              const updated = await userService.getAll();
              setUsers(updated);
              setAddUserOpen(false);
            } catch (e) { showToast(e.message, 'error'); }
          }}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, labs, onClose, onSave }) {
  const [role, setRole]   = useState(user.role || 'observer');
  const [labId, setLabId] = useState(user.labId || '');
  return (
    <Modal open onClose={onClose}
      title={`${user.displayName || user.email} — tahrirlash`}
      headerImg="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=32&h=32&q=80&fit=crop"
      size="sm">
      <div className="space-y-4">
        <Select label="Rol" value={role} onChange={e => setRole(e.target.value)}>
          <option value="observer">Kuzatuvchi</option>
          <option value="technician">Texnik</option>
          <option value="lab_manager">Lab Menejeri</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        {['technician', 'lab_manager'].includes(role) && (
          <Select label="Laboratoriya" value={labId} onChange={e => setLabId(e.target.value)}>
            <option value="">— Tanlang —</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button onClick={() => onSave(user.id, role, labId || null)} className="flex-1">Saqlash</Button>
        </div>
      </div>
    </Modal>
  );
}

function AddUserModal({ labs, onClose, onSave }) {
  const [form, setForm]   = useState({ email: '', displayName: '', role: 'observer', labId: '' });
  const set = (k, v)     => setForm(p => ({ ...p, [k]: v }));
  return (
    <Modal open onClose={onClose} title="Yangi foydalanuvchi"
      headerImg="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=32&h=32&q=80&fit=crop"
      size="sm">
      <div className="space-y-4">
        <Input label="Ism Familiya" value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="F.I.Sh." />
        <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
        <Select label="Rol" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="observer">Kuzatuvchi</option>
          <option value="technician">Texnik</option>
          <option value="lab_manager">Lab Menejeri</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        {['technician','lab_manager'].includes(form.role) && (
          <Select label="Laboratoriya" value={form.labId} onChange={e => set('labId', e.target.value)}>
            <option value="">— Tanlang —</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
        <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
          ℹ️ Foydalanuvchi o'zi ro'yxatdan o'tadi. Bu sahifada faqat mavjud foydalanuvchiga rol beriladi.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Bekor</Button>
          <Button onClick={() => onSave(form)} className="flex-1">Qo'shish</Button>
        </div>
      </div>
    </Modal>
  );
}
