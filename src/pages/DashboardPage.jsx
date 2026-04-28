import { useState, useEffect } from 'react';
import { sampleService, labService, STATUS, STATUS_LABELS } from '../lib/firebase.js';
import { StatCard, Card, EmptyState } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import { timeSince, isOverdue, getLoadBarColor, calcPercent } from '../lib/utils.js';
import { useApp } from '../contexts/AppContext.jsx';

// Lab rasmlari turi bo'yicha
const LAB_TYPE_IMAGES = {
  oziq_ovqat:     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=48&h=48&q=80&fit=crop',
  elektrotexnika: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=48&h=48&q=80&fit=crop',
  qurilish:       'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=48&h=48&q=80&fit=crop',
  mashinasozlik:  'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=48&h=48&q=80&fit=crop',
  polimer:        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=48&h=48&q=80&fit=crop',
  yengil:         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=48&h=48&q=80&fit=crop',
  bolalar:        'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=48&h=48&q=80&fit=crop',
};

const DEFAULT_LAB_IMG = 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=48&h=48&q=80&fit=crop';

// Mini donut chart (SVG)
function DonutChart({ data, size = 100 }) {
  const total  = data.reduce((s, d) => s + d.value, 0);
  if (!total)  return <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Ma'lumot yo'q</div>;
  let offset   = 0;
  const r      = 38;
  const cx     = size / 2;
  const cy     = size / 2;
  const circ   = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {data.map((d, i) => {
        const pct   = d.value / total;
        const dash  = pct * circ;
        const gap   = circ - dash;
        const el    = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={30} fill="white" />
    </svg>
  );
}

// Mini bar chart
function MiniBarChart({ data, height = 60 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-md transition-all ${d.color || 'bg-blue-500'}`}
            style={{ height: `${(d.value / max) * (height - 16)}px`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { userProfile, isSuperAdmin, isLabManager } = useApp();
  const [stats, setStats]     = useState(null);
  const [labs, setLabs]       = useState([]);
  const [recent, setRecent]   = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [trend, setTrend]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, l, ov, tr] = await Promise.all([
        sampleService.getStats(),
        labService.getAll(),
        sampleService.getOverdue(48),
        sampleService.getMonthlyTrend(6),
      ]);
      setStats(s); setLabs(l); setOverdue(ov); setTrend(tr);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const filter = (isSuperAdmin || isLabManager) ? {} : { labId: userProfile?.labId };
    const unsub  = sampleService.subscribeToAll(samples => {
      setRecent(samples.slice(0, 8));
    }, filter);
    return unsub;
  }, [userProfile, isSuperAdmin, isLabManager]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=80&h=80&q=80&fit=crop"
          alt="loading" className="w-16 h-16 rounded-2xl object-cover animate-pulse" />
        <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  const labLoad = labs.map(l => ({
    ...l,
    pct: Math.min(100, Math.round(((l.currentLoad || 0) / (l.capacity || 50)) * 100)),
  })).sort((a, b) => b.pct - a.pct);

  const donutData = stats ? [
    { label: 'Muvofiq',    value: (stats.compliant  || 0) + (stats.completed || 0), color: '#22c55e' },
    { label: 'Nomuvofiq',  value: stats.non_compliant || 0,                          color: '#ef4444' },
    { label: 'Jarayonda',  value: stats.activeCount   || 0,                          color: '#3b82f6' },
    { label: 'Navbatda',   value: stats.waiting       || 0,                          color: '#f59e0b' },
  ] : [];

  const barData = trend.slice(-6).map(t => ({
    label: t.month, value: t.total, color: 'bg-blue-500',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <img
          src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=200&q=80&fit=crop"
          alt="lab banner"
          className="absolute right-0 top-0 h-full w-64 object-cover opacity-20"
        />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">Xush kelibsiz 👋</p>
          <h1 className="text-2xl font-black">{userProfile?.displayName?.split(' ')[0] || 'Foydalanuvchi'}</h1>
          <p className="text-blue-200 text-sm mt-1">Real vaqt namuna kuzatuv paneli</p>
          {overdue.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-red-500/30 border border-red-300/30 rounded-xl px-3 py-1.5">
              <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=20&h=20&q=80&fit=crop"
                alt="warn" className="w-5 h-5 rounded-md object-cover" />
              <span className="text-sm font-bold">{overdue.length} ta namuna muddati o'tgan!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            img="https://images.unsplash.com/photo-1563213126-a4273aed2016?w=48&h=48&q=80&fit=crop"
            label="Jami namuna" value={stats.total} color="blue"
            sub={`${stats.activeCount || 0} ta faol`}
          />
          <StatCard
            img="https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=48&h=48&q=80&fit=crop"
            label="Sinovda" value={stats.testing || 0} color="purple"
          />
          <StatCard
            img="https://images.unsplash.com/photo-1576086476234-1103be98f096?w=48&h=48&q=80&fit=crop"
            label="Muvofiq" value={(stats.compliant || 0) + (stats.completed || 0)} color="green"
            sub={`${stats.complianceRate}% muvofiqlik`}
          />
          <StatCard
            img="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=48&h=48&q=80&fit=crop"
            label="Nomuvofiq" value={stats.non_compliant || 0} color="red"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent samples */}
        <div className="lg:col-span-2 space-y-4">

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Donut */}
            <Card className="p-4">
              <p className="text-sm font-bold text-slate-700 mb-3">Status taqsimoti</p>
              <div className="flex items-center gap-4">
                <DonutChart data={donutData} size={90} />
                <div className="space-y-1.5 flex-1">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-slate-600">{d.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bar chart */}
            <Card className="p-4">
              <p className="text-sm font-bold text-slate-700 mb-3">Oylik trend</p>
              {barData.length > 0
                ? <MiniBarChart data={barData} height={80} />
                : <p className="text-xs text-slate-400 text-center py-6">Ma'lumot yo'q</p>
              }
            </Card>
          </div>

          {/* Recent list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">So'nggi namunalar</h2>
              <a href="/samples" className="text-sm text-blue-600 font-semibold hover:underline">Barchasini ko'rish →</a>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                img="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&h=80&q=80&fit=crop"
                title="Namunalar yo'q"
                subtitle="Hali hech qanday namuna qo'shilmagan"
              />
            ) : (
              <div className="space-y-2">
                {recent.map(s => {
                  const od = isOverdue(s.updatedAt) && ['received','waiting','testing'].includes(s.currentStatus);
                  return (
                    <Card key={s.id} className={`px-4 py-3 flex items-center gap-3 ${od ? 'border-red-200 bg-red-50/40' : ''}`}>
                      <img
                        src={`https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=40&h=40&q=80&fit=crop&sig=${s.id}`}
                        alt="sample"
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-700">{s.barcode}</span>
                          <StatusBadge status={s.currentStatus} />
                          {od && <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-lg">⚠ Kechikkan</span>}
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

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Overdue */}
          {overdue.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=32&h=32&q=80&fit=crop"
                  alt="alert" className="w-8 h-8 rounded-lg object-cover" />
                <h3 className="font-bold text-red-700">Muddati o'tgan ({overdue.length})</h3>
              </div>
              <div className="space-y-2">
                {overdue.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-red-700 text-sm">{s.barcode}</span>
                      <p className="text-xs text-red-500 truncate">{s.productName}</p>
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
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=32&h=32&q=80&fit=crop"
                alt="labs" className="w-8 h-8 rounded-lg object-cover" />
              <h3 className="font-bold text-slate-800">Laboratoriya yuklanganligi</h3>
            </div>
            <div className="space-y-4">
              {labLoad.map(l => (
                <div key={l.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={LAB_TYPE_IMAGES[l.type] || DEFAULT_LAB_IMG}
                      alt={l.name}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700 truncate">{l.name}</p>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ml-1 flex-shrink-0 ${
                          l.pct >= 90 ? 'bg-red-100 text-red-600' :
                          l.pct >= 70 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>{l.pct}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${getLoadBarColor(l.pct)}`}
                      style={{ width: `${l.pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{l.currentLoad || 0} / {l.capacity || 50} namuna</p>
                </div>
              ))}
              {labLoad.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-3">Laboratoriyalar yo'q</p>
              )}
            </div>
          </Card>

          {/* Compliance rate */}
          {stats && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img src="https://images.unsplash.com/photo-1576086476234-1103be98f096?w=32&h=32&q=80&fit=crop"
                  alt="stats" className="w-8 h-8 rounded-lg object-cover" />
                <h3 className="font-bold text-slate-800">Muvofiqlik darajasi</h3>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-black text-green-600">{stats.complianceRate}%</span>
                <span className="text-xs text-slate-500">muvofiq namunalar</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                  style={{ width: `${stats.complianceRate}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>0%</span>
                <span>100%</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
