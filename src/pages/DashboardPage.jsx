import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sampleService, labService, STATUS, STATUS_LABELS } from '../lib/firebase.js';
import { StatCard, Card, EmptyState, SkeletonStats } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import { timeSince, isOverdue, getLoadBarColor } from '../lib/utils.js';
import { useApp } from '../contexts/AppContext.jsx';
import { cn } from '../lib/utils.js';
import {
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  FlaskConical, Building2, ArrowRight, BarChart3,
} from 'lucide-react';

/* ── Mini SVG Donut ──────────────────────────────────────── */
function DonutChart({ data, size = 110 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return (
    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 text-slate-400 text-xs">
      Yo'q
    </div>
  );
  const r    = 42;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {data.map((d, i) => {
        if (!d.value) return null;
        const pct  = d.value / total;
        const dash = pct * circ;
        const el   = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth="13"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={36} fill="white" />
    </svg>
  );
}

/* ── Mini bar chart ──────────────────────────────────────── */
function MiniBar({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={cn('w-full rounded-t transition-all', d.color || 'bg-blue-500')}
            style={{ height: `${(d.value / max) * 52}px`, minHeight: d.value ? 4 : 0 }}
          />
          <span className="text-[9px] text-slate-400 leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { userProfile, isSuperAdmin, isLabManager } = useApp();
  const [stats,   setStats]   = useState(null);
  const [labs,    setLabs]    = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [trend,   setTrend]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sampleService.getStats(),
      labService.getAll(),
      sampleService.getOverdue(48),
      sampleService.getMonthlyTrend(6),
    ]).then(([s, l, ov, tr]) => {
      setStats(s); setLabs(l); setOverdue(ov); setTrend(tr);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filter = (isSuperAdmin || isLabManager) ? {} : { labId: userProfile?.labId };
    const unsub  = sampleService.subscribeToAll(
      samples => setRecent(samples.slice(0, 8)),
      filter
    );
    return unsub;
  }, [userProfile, isSuperAdmin, isLabManager]);

  const labLoad = labs
    .map(l => ({ ...l, pct: Math.min(100, Math.round(((l.currentLoad || 0) / (l.capacity || 50)) * 100)) }))
    .sort((a, b) => b.pct - a.pct);

  const donutData = stats ? [
    { label: 'Muvofiq',   value: (stats.compliant || 0) + (stats.completed || 0), color: '#22c55e' },
    { label: 'Nomuvofiq', value: stats.non_compliant || 0,                         color: '#ef4444' },
    { label: 'Jarayonda', value: stats.activeCount   || 0,                         color: '#3b82f6' },
    { label: 'Navbatda',  value: stats.waiting       || 0,                         color: '#f59e0b' },
  ] : [];

  const barData = trend.slice(-6).map(t => ({ label: t.month, value: t.total, color: 'bg-blue-500' }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-8 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">Xush kelibsiz 👋</p>
          <h1 className="text-2xl font-black">
            {userProfile?.displayName?.split(' ')[0] || 'Foydalanuvchi'}
          </h1>
          <p className="text-blue-200 text-sm mt-1">Real-vaqt namuna kuzatuv paneli</p>

          {overdue.length > 0 && (
            <Link to="/samples"
              className="mt-4 inline-flex items-center gap-2 bg-red-500/30 hover:bg-red-500/40 border border-red-400/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-red-300" />
              {overdue.length} ta namuna muddati o'tgan!
              <ArrowRight className="w-3.5 h-3.5 text-red-300" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      {loading ? <SkeletonStats /> : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<FlaskConical className="w-6 h-6 text-blue-600" />}
            label="Jami namuna"
            value={stats.total}
            sub={`${stats.activeCount || 0} ta faol`}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            label="Sinovda"
            value={stats.testing || 0}
            color="purple"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            label="Muvofiq"
            value={(stats.compliant || 0) + (stats.completed || 0)}
            sub={`${stats.complianceRate}% muvofiqlik`}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            label="Nomuvofiq"
            value={stats.non_compliant || 0}
            color="red"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: Charts + Recent ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                Status taqsimoti
              </p>
              {stats && (
                <div className="flex items-center gap-4">
                  <DonutChart data={donutData} size={110} />
                  <div className="space-y-2 flex-1 min-w-0">
                    {donutData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-slate-600 truncate">{d.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Oylik trend
              </p>
              {barData.length > 0
                ? <MiniBar data={barData} />
                : <p className="text-xs text-slate-400 text-center py-6">Ma'lumot yo'q</p>
              }
            </Card>
          </div>

          {/* Recent samples */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">So'nggi namunalar</h2>
              <Link to="/samples" className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors">
                Barchasini ko'rish <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <EmptyState
                icon="🧪"
                title="Namunalar yo'q"
                subtitle="Hali hech qanday namuna qo'shilmagan"
              />
            ) : (
              <div className="space-y-2">
                {recent.map(s => {
                  const od = isOverdue(s.updatedAt) && ['received', 'waiting', 'testing'].includes(s.currentStatus);
                  return (
                    <Card key={s.id} className={cn('px-4 py-3 flex items-center gap-3', od && 'border-red-200 bg-red-50/30')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm', od ? 'bg-red-100' : 'bg-blue-50')}>
                        {STATUS_LABELS[s.currentStatus]?.icon || '🧪'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-700">{s.barcode}</span>
                          <StatusBadge status={s.currentStatus} size="xs" />
                          {od && (
                            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Kechikkan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{s.productName}</p>
                      </div>
                      <p className="text-xs text-slate-400 flex-shrink-0">{timeSince(s.updatedAt)}</p>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-red-700 text-sm">Muddati o'tgan ({overdue.length})</h3>
              </div>
              <div className="space-y-2">
                {overdue.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-red-700 text-xs">{s.barcode}</span>
                      <p className="text-xs text-red-500 truncate">{s.productName}</p>
                    </div>
                  </div>
                ))}
                {overdue.length > 5 && (
                  <Link to="/samples" className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1">
                    +{overdue.length - 5} ta boshqa <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </Card>
          )}

          {/* Lab load */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm">Laboratoriya yuklanishi</h3>
            </div>
            <div className="space-y-4">
              {labLoad.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-3">Laboratoriyalar yo'q</p>
              )}
              {labLoad.map(l => (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <p className="text-xs font-semibold text-slate-700 truncate flex-1">{l.name}</p>
                    <span className={cn(
                      'text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0',
                      l.pct >= 90 ? 'bg-red-100 text-red-600' :
                      l.pct >= 70 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    )}>
                      {l.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={cn('h-1.5 rounded-full transition-all duration-500', getLoadBarColor(l.pct))}
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {l.currentLoad || 0} / {l.capacity || 50} namuna
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance gauge */}
          {stats && (
            <Card className="p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Muvofiqlik darajasi
              </h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-black text-green-600">{stats.complianceRate}%</span>
                <span className="text-xs text-slate-400 pb-1">muvofiq</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                  style={{ width: `${stats.complianceRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
