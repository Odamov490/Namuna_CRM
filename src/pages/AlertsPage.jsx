import { useState, useEffect } from 'react';
import { alertService } from '../lib/firebase.js';
import {
  Button, Card, EmptyState, Spinner, SectionHeader, FilterChip,
} from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { timeSince } from '../lib/utils.js';
import { cn } from '../lib/utils.js';
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Info, ShieldAlert,
} from 'lucide-react';

const ALERT_CONFIG = {
  critical: {
    bg:    'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    dot:   'bg-red-500',
    icon:  ShieldAlert,
    color: 'text-red-600',
    label: 'Kritik',
  },
  warning: {
    bg:    'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    dot:   'bg-amber-500',
    icon:  AlertTriangle,
    color: 'text-amber-600',
    label: 'Ogohlantirish',
  },
  info: {
    bg:    'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot:   'bg-blue-500',
    icon:  Info,
    color: 'text-blue-600',
    label: "Ma'lumot",
  },
};

export default function AlertsPage() {
  const { showToast } = useApp();
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    const unsub = alertService.subscribeToAll(data => {
      setAlerts(data);
      setLoading(false);
    }, 100);
    return unsub;
  }, []);

  const handleMarkRead    = id  => alertService.markRead(id);
  const handleMarkAllRead = async () => {
    setMarking(true);
    await alertService.markAllRead();
    showToast("Barcha ogohlantirishlar o'qildi", 'success');
    setMarking(false);
  };
  const handleDeleteRead  = async () => {
    setDeleting(true);
    await alertService.deleteAllRead();
    showToast("O'qilganlar o'chirildi", 'success');
    setDeleting(false);
  };
  const handleDelete      = async id => {
    await alertService.delete(id);
  };

  const filtered = alerts.filter(a => {
    if (filter === 'unread')   return !a.isRead;
    if (filter === 'critical') return a.type === 'critical';
    return true;
  });

  const unreadCount   = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader
        icon="🔔"
        title="Ogohlantirishlar"
        subtitle={unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Hammasi o'qilgan"}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead} loading={marking}
                icon={<CheckCheck className="w-4 h-4" />}>
                Barchasini o'qildi
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDeleteRead} loading={deleting}
              icon={<Trash2 className="w-4 h-4" />}>
              Tozalash
            </Button>
          </div>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <FilterChip active={filter === 'all'}      onClick={() => setFilter('all')}      count={alerts.length}>Barchasi</FilterChip>
        <FilterChip active={filter === 'unread'}   onClick={() => setFilter('unread')}   count={unreadCount}>O'qilmagan</FilterChip>
        <FilterChip active={filter === 'critical'} onClick={() => setFilter('critical')} count={criticalCount}>Kritik</FilterChip>
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Ogohlantirishlar yo'q"
          subtitle={filter !== 'all' ? 'Bu filtr bo\'yicha hech narsa topilmadi' : "Hozircha hech qanday ogohlantirish yo'q"}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => {
            const c   = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
            const Icon = c.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  'relative flex items-start gap-3.5 px-4 py-3.5 rounded-xl border transition-all',
                  c.bg,
                  !alert.isRead ? 'shadow-sm' : 'opacity-70'
                )}
              >
                {/* Unread dot */}
                {!alert.isRead && (
                  <div className={cn('absolute top-3.5 right-3.5 w-2 h-2 rounded-full flex-shrink-0', c.dot)} />
                )}

                {/* Icon */}
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', alert.type === 'critical' ? 'bg-red-100' : alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100')}>
                  <Icon className={cn('w-4 h-4', c.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', c.badge)}>
                      {c.label}
                    </span>
                    {alert.barcode && (
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white/60 px-2 py-0.5 rounded-md">
                        {alert.barcode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{timeSince(alert.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-7 flex gap-1">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-white/70 text-slate-500 hover:text-slate-700 transition-all"
                      title="O'qildi deb belgilash"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-1.5 rounded-lg hover:bg-white/70 text-slate-400 hover:text-red-600 transition-all"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
