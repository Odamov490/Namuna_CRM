import { useState, useEffect } from 'react';
import { sampleService, labService, historyService, STATUS, STATUS_LABELS } from '../lib/firebase.js';
import { StatCard, Card, EmptyState } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import { timeSince, isOverdue } from '../lib/utils.js';
import { useApp } from '../contexts/AppContext.jsx';

export default function DashboardPage() {
  const { userProfile, isSuperAdmin, isLabManager } = useApp();
  const [stats, setStats]       = useState(null);
  const [labs, setLabs]         = useState([]);
  const [recent, setRecent]     = useState([]);
  const [overdue, setOverdue]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, l, ov] = await Promise.all([
        sampleService.getStats(),
        labService.getAll(),
        sampleService.getOverdue(48),
      ]);
      setStats(s);
      setLabs(l);
      setOverdue(ov);
      setLoading(false);
    };
    load();

  }, []);

  // Real-time samples
  useEffect(() => {
    const filter = (isSuperAdmin || isLabManager) ? {} : { labId: userProfile?.labId };
    const unsub = sampleService.subscribeToAll(samples => {
      setRecent(samples.slice(0, 8));
    }, filter);
    return unsub;
  }, [userProfile, isSuperAdmin, isLabManager]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const labLoad = labs.map(l => ({
    ...l,
    pct: Math.round(((l.currentLoad || 0) / (l.capacity || 50)) * 100),
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          Xush kelibsiz, {userProfile?.displayName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real vaqt namuna kuzatuv paneli</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="🧪" label="Jami namuna" value={stats.total} color="blue" />
          <StatCard icon="🔬" label="Sinovda" value={stats.testing || 0} color="purple" />
          <StatCard icon="✅" label="Muvofiq" value={stats.compliant || 0} color="green" />
          <StatCard icon="❌" label="Nomuvofiq" value={stats.non_compliant || 0} color="red" />
        </div>
      )}

      {/* Status breakdown */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="📥" label="Qabul qilindi" value={stats.received || 0} color="blue" />
          <StatCard icon="⏳" label="Navbatda" value={stats.waiting || 0} color="yellow" />
          <StatCard icon="🔄" label="Ko'chirildi" value={stats.transferred || 0} color="indigo" />
          <StatCard icon="🏁" label="Yakunlandi" value={stats.completed || 0} color="gray" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent samples */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">So'nggi namunalar</h2>
            <a href="/samples" className="text-sm text-blue-600 font-semibold hover:underline">Barchasini ko'rish →</a>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon="🧪" title="Namunalar yo'q" subtitle="Hali hech qanday namuna qo'shilmagan" />
          ) : (
            <div className="space-y-2">
              {recent.map(s => (
                <Card key={s.id} className={`px-4 py-3 flex items-center gap-3 ${isOverdue(s.updatedAt) && ['received','waiting','testing'].includes(s.currentStatus) ? 'border-red-200 bg-red-50/30' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-700">{s.barcode}</span>
                      <StatusBadge status={s.currentStatus} />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{s.productName}</p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">{timeSince(s.updatedAt)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Overdue alerts */}
          {overdue.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                ⚠️ Muddati o'tgan ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.slice(0, 5).map(s => (
                  <div key={s.id} className="text-sm">
                    <span className="font-mono font-bold text-red-700">{s.barcode}</span>
                    <p className="text-xs text-red-500 truncate">{s.productName}</p>
                  </div>
                ))}
                {overdue.length > 5 && (
                  <p className="text-xs text-red-500 font-semibold">+{overdue.length - 5} ta boshqa</p>
                )}
              </div>
            </Card>
          )}

          {/* Lab load */}
          <Card className="p-4">
            <h3 className="font-bold text-slate-800 mb-3">Laboratoriya yuklanganligi</h3>
            <div className="space-y-3">
              {labLoad.map(l => (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-600 truncate">{l.name}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${l.pct >= 90 ? 'bg-red-100 text-red-600' : l.pct >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {l.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${l.pct >= 90 ? 'bg-red-500' : l.pct >= 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              {labLoad.length === 0 && <p className="text-sm text-slate-500 text-center py-2">Laboratoriyalar yo'q</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
