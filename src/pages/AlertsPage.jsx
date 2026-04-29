import { useState, useEffect } from 'react';
import { alertService } from '../lib/firebase.js';
import { Button, Card, EmptyState, Spinner, SectionHeader } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { timeSince } from '../lib/utils.js';

const ALERT_STYLES = {
  critical: {
    bg:    'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: 'Kritik',
    img:   'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=48&h=48&q=80&fit=crop',
  },
  warning: {
    bg:    'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Ogohlantirish',
    img:   'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=48&h=48&q=80&fit=crop',
  },
  info: {
    bg:    'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    label: "Ma'lumot",
    img:   'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=48&h=48&q=80&fit=crop',
  },
};

export default function AlertsPage() {
  const { showToast } = useApp();
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [marking, setMarking]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter]     = useState('all'); // 'all' | 'unread' | 'critical'

  useEffect(() => {
    // Real-time subscription
    const unsub = alertService.subscribeToAll(data => {
      setAlerts(data);
      setLoading(false);
    }, 100);
    return unsub;
  }, []);

  const handleMarkRead = async (id) => {
    await alertService.markRead(id);
  };

  const handleMarkAllRead = async () => {
    setMarking(true);
    await alertService.markAllRead();
    showToast("Barcha ogohlantirishlar o'qildi ✅", 'success');
    setMarking(false);
  };

  const handleDeleteRead = async () => {
    setDeleting(true);
    await alertService.deleteAllRead();
    showToast("O'qilganlar o'chirildi", 'success');
    setDeleting(false);
  };

  const filtered = alerts.filter(a => {
    if (filter === 'unread')   return !a.isRead;
    if (filter === 'critical') return a.type === 'critical';
    return true;
  });

  const unreadCount   = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader
        title="🔔 Ogohlantirishlar"
        subtitle={unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Hammasi o'qilgan"}
        img="https://images.unsplash.com/photo-1531347669012-4b3f93b1b9b3?w=40&h=40&q=80&fit=crop"
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={handleMarkAllRead} loading={marking} size="sm">
                ✅ Barchasini o'qildi
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDeleteRead} loading={deleting}>
              🗑 O'qilganlarni tozalash
            </Button>
          </div>
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'all',      label: `Barchasi (${alerts.length})` },
          { id: 'unread',   label: `O'qilmagan (${unreadCount})` },
          { id: 'critical', label: `Kritik (${criticalCount})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          img="https://images.unsplash.com/photo-1531347669012-4b3f93b1b9b3?w=80&h=80&q=80&fit=crop"
          title="Ogohlantirishlar yo'q"
          subtitle="Hozircha hech qanday ogohlantirish yo'q"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
            return (
              <Card key={alert.id}
                className={`p-4 border ${style.bg} ${alert.isRead ? 'opacity-60' : ''} transition-all`}>
                <div className="flex items-start gap-3">
                  <img src={style.img} alt={style.label}
                    className={`w-12 h-12 rounded-xl object-cover flex-shrink-0 ${alert.isRead ? 'grayscale' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${style.badge}`}>
                        {style.label}
                      </span>
                      <p className="text-xs text-slate-400 flex-shrink-0">{timeSince(alert.createdAt)}</p>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{alert.message}</p>
                    {alert.productName && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        📦 {alert.productName}
                        {alert.barcode && <span className="ml-1 font-mono">({alert.barcode})</span>}
                      </p>
                    )}
                    {!alert.isRead && (
                      <button onClick={() => handleMarkRead(alert.id)}
                        className="text-xs font-semibold text-blue-600 hover:underline mt-2 block">
                        O'qildi deb belgilash →
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
