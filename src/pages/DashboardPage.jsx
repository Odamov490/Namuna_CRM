import { useState, useEffect, useMemo } from 'react';
import { sampleService, labService, STATUS, STATUS_LABELS } from '../lib/firebase.js';
import { StatCard, Card, EmptyState, Spinner, Badge } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import { timeSince, isOverdue, getLoadBarColor } from '../lib/utils.js';
import { useApp } from '../contexts/AppContext.jsx';

// ── Mini SVG Donut ───────────────────────────────────────────────────────────
function DonutChart({ data, size = 96 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return (
    <div style={{ width: size, height: size }} className="rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
      —
    </div>
  );
  let offset = 0;
  const r = 38, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {data.map((d, i) => {
        const pct  = d.value / total;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el   = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={30} fill="white" />
    </svg>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data, height = 72 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-blue-500 transition-all"
            style={{ height: `${(d.value / max) * (height - 20)}px`, minHeight: d.value > 0 ? 4 : 0, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5 }}
          />
          <span className="text-[9px] text-slate-400 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sample row in recents list ─────────────────────────────────────────────────
function SampleRow({ sample }) {
  const overdue = isOverdue(sample.updatedAt) && ['received','waiting','testing'].includes(sample.currentStatus);
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50 ${overdue ? 'bg-red-50/60' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${overdue ? 'bg-red-100' : 'bg-blue-50'}`}>
        🧪
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-slate-700 text-xs">{sample.barcode}</span>
          <StatusBadge status={sample.currentStatus} />
          {overdue && <Badge color="red">⚠ Kechikkan</Badge>}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{sample.productName}</p>
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0">{timeSince(sample.updatedAt)}</span>
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
    const unsub = sampleService.subscribeToAll(samples => setRecent(samples.slice(0, 10)), filter);
    return unsub;
  }, [userProfile, isSuperAdmin, isLabManager]);

  const labLoad = useMemo(() =>
    labs.map(l => ({
      ...l, pct: Math.min(100, Math.round(((l.currentLoad || 0) / (l.capacity || 50)) * 100)),
    })).sort((a, b) => b.pct - a.pct),
  [labs]);

  const donutData = useMemo(() => stats ? [
    { label: 'Muvofiq',    value: (stats.compliant || 0) + (stats.completed || 0), color: '#10b981' },
    { label: 'Nomuvofiq',  value: stats.non_compliant || 0,                         color: '#ef4444' },
    { label: 'Jarayonda',  value: stats.activeCount || 0,                            color: '#3b82f6' },
    { label: 'Navbatda',   value: stats.waiting || 0,                                color: '#f59e0b' },
  ] : [], [stats]);

  const barData = useMemo(() => trend.slice(-6).map(t => ({ label: t.month, value: t.total })), [trend]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">🔬</div>
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">Ma'lumotlar yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="page-body space-y-6">

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-16 -bottom-12 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">Xush kelibsiz 👋</p>
          <h1 className="text-2xl font-black">{userProfile?.displayName?.split(' ')[0] || 'Foydalanuvchi'}</h1>
          <p className="text-blue-200 text-sm mt-1 opacity-80">Real vaqt namuna kuzatuv paneli</p>
          {overdue.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-red-500/30 border border-red-300/30 rounded-xl px-3 py-1.5 backdrop-blur-sm">
              <span>⚠️</span>
              <span className="text-sm font-bold">{overdue.length} ta namuna muddati o'tgan</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🧪" label="Jami namuna"  value={stats.total}            color="blue"   sub={`${stats.activeCount || 0} ta faol`} />
          <StatCard icon="⚗️" label="Sinovda"      value={stats.testing || 0}     color="purple" />
          <StatCard icon="✅" label="Muvofiq"       value={(stats.compliant||0)+(stats.completed||0)} color="green" sub={`${stats.complianceRate}% muvofiqlik`} />
          <StatCard icon="❌" label="Nomuvofiq"     value={stats.non_compliant||0} color="red"    />
        </div>
      )}

      {/* ── Main grid ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left column: charts + recent */}
        <div className="lg:col-span-2 space-y-5">

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Donut chart */}
            <Card className="p-5">
              <p className="text-sm font-bold text-slate-700 mb-4">Status taqsimoti</p>
              <div className="flex items-center gap-4">
                <DonutChart data={donutData} size={90} />
                <div className="space-y-1.5 flex-1">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-slate-500">{d.label}</span>
                      </div>
                      <span className="text-xs font-black text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bar chart */}
            <Card className="p-5">
              <p className="text-sm font-bold text-slate-700 mb-4">Oylik trend</p>
              {barData.length > 0
                ? <BarChart data={barData} height={80} />
                : <p className="text-xs text-slate-400 text-center py-6">Ma'lumot yo'q</p>
              }
            </Card>
          </div>

          {/* Recent samples */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">So'nggi namunalar</h2>
              <a href="/samples" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Barchasini ko'rish →
              </a>
            </div>
            {recent.length === 0
              ? <EmptyState icon="🧪" title="Namunalar yo'q" subtitle="Hali hech qanday namuna qo'shilmagan" />
              : <div className="space-y-0.5">{recent.map(s => <SampleRow key={s.id} sample={s} />)}</div>
            }
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Overdue alerts */}
          {overdue.length > 0 && (
            <Card className="p-5 border-red-100 bg-red-50/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-red-700">Muddati o'tgan ({overdue.length})</h3>
              </div>
              <div className="space-y-2">
                {overdue.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-red-700 text-xs">{s.barcode}</span>
                      <p className="text-xs text-red-400 truncate">{s.productName}</p>
                    </div>
                  </div>
                ))}
                {overdue.length > 5 && (
                  <a href="/samples" className="text-xs text-red-600 font-bold hover:underline">
                    +{overdue.length - 5} ta boshqa →
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* Lab load */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏢</span>
              <h3 className="font-bold text-slate-800">Laboratoriya yuklanishi</h3>
            </div>
            <div className="space-y-4">
              {labLoad.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Laboratoriyalar yo'q</p>}
              {labLoad.map(l => (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-slate-700 truncate flex-1">{l.name}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ml-2 flex-shrink-0 ${
                      l.pct >= 90 ? 'bg-red-100 text-red-600' :
                      l.pct >= 70 ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>{l.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${getLoadBarColor(l.pct)}`} style={{ width: `${l.pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{l.currentLoad || 0} / {l.capacity || 50} namuna</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance rate */}
          {stats && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📈</span>
                <h3 className="font-bold text-slate-800">Muvofiqlik</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-emerald-600">{stats.complianceRate}%</span>
                <span className="text-xs text-slate-400">muvofiq namunalar</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-emerald-500" style={{ width: `${stats.complianceRate}%` }} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
