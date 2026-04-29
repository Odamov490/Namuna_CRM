import { useState, useEffect } from 'react';
import { userService, adminService, labService, sampleService, ROLES } from '../lib/firebase.js';
import {
  Button, Card, Select, StatCard, EmptyState, Spinner,
  Modal, Input, Avatar, SectionHeader, Badge, Tabs,
} from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate, exportToCSV } from '../lib/utils.js';
import { cn, getLoadBarColor } from '../lib/utils.js';
import {
  BarChart3, Users, Building2, FlaskConical,
  Download, RefreshCw, Shield, Pencil,
  CheckCircle, AlertTriangle, TrendingUp,
} from 'lucide-react';

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', color: 'purple' },
  lab_manager: { label: 'Lab Menejeri', color: 'blue' },
  technician:  { label: 'Texnik',       color: 'green' },
  observer:    { label: 'Kuzatuvchi',   color: 'gray' },
};

const PAGE_TABS = [
  { id: 'stats',   label: 'Statistika',          icon: '📊' },
  { id: 'users',   label: 'Foydalanuvchilar',     icon: '👥' },
  { id: 'labs',    label: 'Lablar hisoboti',      icon: '🏢' },
  { id: 'reports', label: 'Hisobotlar',           icon: '📋' },
];

export default function AdminPage() {
  const { isSuperAdmin, showToast } = useApp();
  const [tab,       setTab]       = useState('stats');
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [labReport, setLabReport] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [trend,     setTrend]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editUser,  setEditUser]  = useState(null);
  const [labs,      setLabs]      = useState([]);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
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

  useEffect(() => { load(); }, [isSuperAdmin]);

  if (!isSuperAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">🔒</div>
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

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === 'samples') {
        const data = await sampleService.getAll();
        exportToCSV(data.map(s => ({
          Barcode: s.barcode,
          Mahsulot: s.productName,
          Status: s.currentStatus,
          Ariza: s.applicantName,
          Telefon: s.applicantPhone || '',
          Tur: s.productType || '',
        })), 'namunalar');
      } else if (type === 'users') {
        exportToCSV(users.map(u => ({
          Ism: u.displayName,
          Email: u.email,
          Rol: u.role,
          Faol: u.isActive !== false ? 'Ha' : "Yo'q",
        })), 'foydalanuvchilar');
      }
      showToast('Eksport yakunlandi ✅', 'success');
    } catch (e) { showToast(e.message, 'error'); }
    setExporting(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    showToast('Ma\'lumotlar yangilandi', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionHeader
        icon="⚙️"
        title="Boshqaruv paneli"
        subtitle="Tizim statistikasi va sozlamalari"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Yangilash
          </Button>
        }
      />

      <Tabs tabs={PAGE_TABS} active={tab} onChange={setTab} className="mb-6" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : (
        <>
          {/* ── Stats tab ── */}
          {tab === 'stats' && stats && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<FlaskConical className="w-6 h-6 text-blue-600" />} label="Jami namuna"       value={stats.total}        sub={`${stats.activeCount} ta faol`} color="blue" />
                <StatCard icon={<Building2 className="w-6 h-6 text-purple-600" />}  label="Laboratoriyalar"  value={stats.activeLabs}   sub={`${stats.totalLabs} jami`}      color="purple" />
                <StatCard icon={<Users className="w-6 h-6 text-teal-600" />}        label="Foydalanuvchilar" value={stats.activeUsers}  sub={`${stats.totalUsers} jami`}      color="teal" />
                <StatCard icon={<CheckCircle className="w-6 h-6 text-green-600" />} label="Muvofiqlik"       value={`${stats.complianceRate}%`} color="green" />
              </div>

              {/* Alerts & overdue row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className={cn('p-4', stats.criticalAlerts > 0 ? 'border-red-200 bg-red-50' : '')}>
                  <p className="text-xs font-medium text-slate-500 mb-1">Kritik ogohlantirishlar</p>
                  <p className={cn('text-3xl font-black', stats.criticalAlerts > 0 ? 'text-red-600' : 'text-slate-800')}>{stats.criticalAlerts}</p>
                </Card>
                <Card className={cn('p-4', stats.overdueCount > 0 ? 'border-amber-200 bg-amber-50' : '')}>
                  <p className="text-xs font-medium text-slate-500 mb-1">Muddati o'tgan</p>
                  <p className={cn('text-3xl font-black', stats.overdueCount > 0 ? 'text-amber-600' : 'text-slate-800')}>{stats.overdueCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">O'qilmagan xabarlar</p>
                  <p className="text-3xl font-black text-slate-800">{stats.unreadAlerts}</p>
                </Card>
              </div>

              {/* Trend chart */}
              {trend.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    Oylik namuna trendi
                  </h3>
                  <div className="flex items-end gap-2 h-24">
                    {trend.map((t, i) => {
                      const max = Math.max(...trend.map(d => d.total), 1);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">{t.total || ''}</span>
                          <div className="w-full rounded-t-md bg-blue-500 transition-all"
                            style={{ height: `${(t.total / max) * 64}px`, minHeight: t.total ? 4 : 0 }} />
                          <span className="text-[9px] text-slate-400">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* By product type */}
              {byProduct.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Mahsulot turi bo'yicha</h3>
                  <div className="space-y-3">
                    {byProduct.slice(0, 6).map(p => {
                      const max = byProduct[0].total || 1;
                      const pct = Math.round((p.total / max) * 100);
                      return (
                        <div key={p.type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700 truncate flex-1">{p.type}</span>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-green-600 font-semibold">{p.compliant}✓</span>
                              <span className="text-xs text-red-500 font-semibold">{p.nonCompliant}✗</span>
                              <span className="text-xs font-bold text-slate-800 w-8 text-right">{p.total}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── Users tab ── */}
          {tab === 'users' && (
            <div className="animate-fade-in">
              <div className="flex justify-end mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('users')}
                  loading={exporting}
                  icon={<Download className="w-4 h-4" />}
                >
                  CSV eksport
                </Button>
              </div>

              {users.length === 0 ? (
                <EmptyState icon="👥" title="Foydalanuvchilar yo'q" />
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <Card key={u.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 text-sm truncate">{u.displayName}</p>
                            <Badge color={ROLE_LABELS[u.role]?.color || 'gray'} size="xs">
                              {ROLE_LABELS[u.role]?.label}
                            </Badge>
                            {u.isActive === false && <Badge color="red" size="xs">Nofaol</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditUser(u)}
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Labs report tab ── */}
          {tab === 'labs' && (
            <div className="animate-fade-in space-y-3">
              {labReport.map(l => (
                <Card key={l.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">{l.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">Jami: <strong>{l.currentCount}</strong></span>
                        <span className="text-xs text-green-600">Muvofiq: <strong>{l.compliant}</strong></span>
                        <span className="text-xs text-red-500">Nomuvofiq: <strong>{l.nonCompliant}</strong></span>
                        <span className="text-xs text-blue-600">Faol: <strong>{l.active}</strong></span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        'text-2xl font-black',
                        l.complianceRate >= 70 ? 'text-green-600' : l.complianceRate >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {l.complianceRate}%
                      </p>
                      <p className="text-xs text-slate-400">muvofiqlik</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={cn('h-2 rounded-full', getLoadBarColor(l.loadPct))}
                        style={{ width: `${l.loadPct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {l.currentLoad || 0}/{l.capacity || 50} ({l.loadPct}%)
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── Reports tab ── */}
          {tab === 'reports' && (
            <div className="animate-fade-in space-y-4">
              <Card className="p-6">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-slate-400" />
                  Ma'lumotlarni eksport qilish
                </h3>
                <p className="text-sm text-slate-500 mb-5">CSV formatida yuklab olish</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExport('samples')}
                    disabled={exporting}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Namunalar</p>
                      <p className="text-xs text-slate-500 mt-0.5">Barcha namunalar ro'yxati</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('users')}
                    disabled={exporting}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Foydalanuvchilar</p>
                      <p className="text-xs text-slate-500 mt-0.5">Foydalanuvchilar ro'yxati</p>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Edit user modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          labs={labs}
          onClose={() => setEditUser(null)}
          onRoleChange={handleRoleChange}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
}

function EditUserModal({ user, labs, onClose, onRoleChange, onToggleActive }) {
  const [role,   setRole]   = useState(user.role);
  const [labId,  setLabId]  = useState(user.labId || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onRoleChange(user.id, role, labId || null);
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Foydalanuvchi rolini o'zgartirish" size="sm">
      <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl">
        <Avatar user={user} size="sm" />
        <div>
          <p className="font-semibold text-slate-800 text-sm">{user.displayName}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <Select label="Rol" value={role} onChange={e => setRole(e.target.value)}>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>

        {['lab_manager', 'technician'].includes(role) && (
          <Select label="Laboratoriya" value={labId} onChange={e => setLabId(e.target.value)}>
            <option value="">— Tanlang —</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
      </div>

      <div className="flex items-center justify-between mb-5 py-3 border-y border-slate-100">
        <span className="text-sm font-medium text-slate-700">Faol holat</span>
        <button
          onClick={() => onToggleActive(user.id, user.isActive === false)}
          className={cn(
            'w-10 h-6 rounded-full relative transition-colors',
            user.isActive !== false ? 'bg-blue-600' : 'bg-slate-200'
          )}
        >
          <div className={cn(
            'w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform',
            user.isActive !== false ? 'translate-x-5' : 'translate-x-1'
          )} />
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={saving}>Bekor</Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">Saqlash</Button>
      </div>
    </Modal>
  );
}
