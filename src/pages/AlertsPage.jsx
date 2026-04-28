import { useState, useEffect } from 'react';
import { alertService } from '../lib/firebase.js';
import { Button, Card, EmptyState, Spinner } from '../components/ui/index.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { timeSince } from '../lib/utils.js';

const ALERT_STYLES = {
  critical: { bg: 'bg-red-50 border-red-200',    icon: '🚨', badge: 'bg-red-100 text-red-700' },
  warning:  { bg: 'bg-yellow-50 border-yellow-200', icon: '⚠️', badge: 'bg-yellow-100 text-yellow-700' },
  info:     { bg: 'bg-blue-50 border-blue-200',   icon: 'ℹ️', badge: 'bg-blue-100 text-blue-700' },
};

export default function AlertsPage() {
  const { showToast } = useApp();
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    alertService.getAll().then(data => { setAlerts(data); setLoading(false); });
  }, []);

  const handleMarkRead = async (id) => {
    await alertService.markRead(id);
    setAlerts(p => p.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleMarkAllRead = async () => {
    setMarking(true);
    await alertService.markAllRead();
    setAlerts(p => p.map(a => ({ ...a, isRead: true })));
    showToast('Barcha ogohlantirishlar o\'qildi ✅', 'success');
    setMarking(false);
  };

  const unread = alerts.filter(a => !a.isRead);

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">🔔 Ogohlantirishlar</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unread.length > 0 ? `${unread.length} ta o'qilmagan` : 'Hammasi o\'qilgan'}
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead} loading={marking} size="sm">
            ✅ Barchasini o'qildi deb belgilash
          </Button>
        )}
      </div>

      {alerts.length === 0 ? (
        <EmptyState icon="🔔" title="Ogohlantirishlar yo'q" subtitle="Hozircha hech qanday ogohlantirish yo'q" />
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
            return (
              <Card
                key={alert.id}
                className={`p-4 border ${style.bg} ${alert.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {alert.type === 'critical' ? 'Kritik' : alert.type === 'warning' ? 'Ogohlantirish' : "Ma'lumot"}
                        </span>
                        <p className="font-semibold text-slate-800 mt-1.5">{alert.message}</p>
                        {alert.productName && (
                          <p className="text-xs text-slate-500 mt-0.5">Mahsulot: {alert.productName}</p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex-shrink-0">{timeSince(alert.createdAt)}</p>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="text-xs font-semibold text-blue-600 hover:underline mt-2"
                      >
                        O'qildi deb belgilash
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
