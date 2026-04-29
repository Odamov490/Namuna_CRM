import { useState, useEffect, useMemo } from 'react';
import { alertService } from '../lib/firebase.js';
import { Button, Card, EmptyState, Spinner, SectionHeader, Badge, SearchInput } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { timeSince } from '../lib/utils.js';

const ALERT_CONFIG = {
  critical: { bg: 'bg-red-50 border-red-100',    badge: 'red',    label: 'Kritik',         icon: '🚨' },
  warning:  { bg: 'bg-amber-50 border-amber-100', badge: 'yellow', label: 'Ogohlantirish',  icon: '⚠️' },
  info:     { bg: 'bg-blue-50 border-blue-100',   badge: 'blue',   label: "Ma'lumot",       icon: 'ℹ️' },
};

export default function AlertsPage() {
  const { showToast } = useApp();
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const unsub = alertService.subscribeToAll(data => {
      setAlerts(data);
      setLoading(false);
    }, 100);
    return unsub;
  }, []);

  const handleMarkRead    = id => alertService.markRead(id);
  const handleMarkAllRead = async () => {
    setMarking(true);
    await alertService.markAllRead();
    showToast("Barcha ogohlantirishlar o'qildi ✓", 'success');
    setMarking(false);
  };

  const unreadCount   = useMemo(() => alerts.filter(a => !a.isRead).length, [alerts]);
  const criticalCount = useMemo(() => alerts.filter(a => a.type === 'critical').length, [alerts]);

  const filtered = useMemo(() => alerts.filter(a => {
    if (filter === 'unread'  && a.isRead) return false;
    if (filter === 'critical' && a.type !== 'critical') return false;
    if (search) {
      const q = search.toLowerCase();
      return a.message?.toLowerCase().includes(q) || a.productName?.toLowerCase().includes(q) || a.barcode?.toLowerCase().includes(q);
    }
    return true;
  }), [alerts, filter, search]);

  const filterTabs = [
    { id: 'all',      label: 'Barchasi',    count: alerts.length },
    { id: 'unread',   label: "O'qilmagan",  count: unreadCount },
    { id: 'critical', label: 'Kritik',      count: criticalCount },
  ];

  return (
    <div className="page-body">
      <SectionHeader
        icon="🔔"
        title="Ogohlantirishlar"
        subtitle={unreadCount > 0 ? `${unreadCount} ta o'qilmagan xabar` : "Barcha xabarlar o'qilgan"}
        action={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead} loading={marking}>
              ✓ Barchasini o'qildi
            </Button>
          )
        }
      />

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Ogohlantirishlarni qidirish..." className="flex-1 min-w-[200px]" />
        <div className="flex gap-1">
          {filterTabs.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`chip ${filter === f.id ? 'active' : ''}`}>
              {f.label}
              <span className={`text-xs font-black ml-0.5 ${filter === f.id ? 'text-blue-600' : 'text-slate-400'}`}>
                ({f.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔔" title="Ogohlantirishlar yo'q" subtitle="Hozircha hech qanday ogohlantirish mavjud emas" />
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => {
            const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
            return (
              <div key={alert.id}
                className={`card p-4 border transition-all animate-fade ${cfg.bg} ${alert.isRead ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    alert.isRead ? 'bg-slate-100 grayscale' : cfg.bg
                  }`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge color={cfg.badge}>{cfg.label}</Badge>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" title="O'qilmagan" />
                      )}
                      <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{timeSince(alert.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{alert.message}</p>
                    {alert.productName && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        📦 {alert.productName}
                        {alert.barcode && <span className="ml-1 font-mono text-slate-400">({alert.barcode})</span>}
                      </p>
                    )}
                    {!alert.isRead && (
                      <button onClick={() => handleMarkRead(alert.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1 hover:underline transition-colors">
                        ✓ O'qildi deb belgilash
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
