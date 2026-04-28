import { useState, useEffect } from 'react';
import { sampleService, historyService, STATUS, STATUS_LABELS, LAB_TYPES } from '../../lib/firebase.js';
import { Modal, Button, Select, Textarea } from '../ui/index.jsx';
import StatusBadge from './StatusBadge.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { formatDate, timeSince } from '../../lib/utils.js';

const STATUS_TRANSITIONS = {
  received:      ['waiting', 'testing'],
  waiting:       ['testing'],
  testing:       ['compliant', 'non_compliant'],
  compliant:     ['transferred', 'completed'],
  non_compliant: ['transferred', 'completed'],
  transferred:   ['received'],
  completed:     [],
};

export default function SampleDetail({ sampleId, onClose, labs = [] }) {
  const { user, userProfile, canEdit, showToast } = useApp();
  const [sample, setSample]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [tab, setTab]         = useState('info');

  // Status update state
  const [newStatus, setNewStatus]   = useState('');
  const [note, setNote]             = useState('');
  const [transferLabId, setTransferLabId] = useState('');

  useEffect(() => {
    if (!sampleId) return;
    setLoading(true);
    // Real-time listen
    const unsub = sampleService.subscribeToOne(sampleId, s => { setSample(s); setLoading(false); });
    historyService.getBySample(sampleId).then(setHistory);
    return unsub;
  }, [sampleId]);

  const currentLab = labs.find(l => l.id === sample?.currentLabId);
  const nextStatuses = STATUS_TRANSITIONS[sample?.currentStatus] || [];

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSaving(true);
    try {
      await sampleService.updateStatus(sampleId, newStatus, user.uid, sample.currentLabId, note);
      const hist = await historyService.getBySample(sampleId);
      setHistory(hist);
      setNewStatus('');
      setNote('');
      showToast('Status yangilandi ✅', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  const handleTransfer = async () => {
    if (!transferLabId) return;
    setSaving(true);
    try {
      await sampleService.transfer(sampleId, transferLabId, user.uid, note);
      const hist = await historyService.getBySample(sampleId);
      setHistory(hist);
      setTransferLabId('');
      setNote('');
      showToast("Namuna ko'chirildi 🔄", 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  if (loading) return (
    <Modal open onClose={onClose} title="Namuna ma'lumotlari" size="lg">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    </Modal>
  );

  if (!sample) return null;

  return (
    <Modal open onClose={onClose} title="Namuna ma'lumotlari" size="lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black font-mono text-slate-800 text-xl">{sample.barcode}</span>
            <StatusBadge status={sample.currentStatus} size="lg" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mt-1">{sample.productName}</h2>
          <p className="text-sm text-slate-500">{sample.applicantName} · {sample.applicantPhone}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-500">Hozirgi laboratoriya</p>
          <p className="font-semibold text-slate-700 text-sm">{currentLab?.name || '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 mb-4">
        {[['info', "📋 Ma'lumot"], ['history', '📜 Tarix'], ['actions', '⚡ Amallar']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Barcode', sample.barcode],
            ['Mahsulot nomi', sample.productName],
            ['Ariza beruvchi', sample.applicantName],
            ['Telefon', sample.applicantPhone || '—'],
            ['Mahsulot turi', sample.productType || '—'],
            ['Umumiy laboratoriyalar', (sample.labsVisited?.length || 0) + ' ta'],
            ['Yaratilgan', formatDate(sample.createdAt)],
            ['Oxirgi yangilanish', formatDate(sample.updatedAt)],
          ].map(([k, v]) => (
            <div key={k} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{k}</p>
              <p className="text-sm font-semibold text-slate-800">{v}</p>
            </div>
          ))}
          {sample.note && (
            <div className="col-span-2 bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Izoh</p>
              <p className="text-sm text-slate-700">{sample.note}</p>
            </div>
          )}
          {/* Labs visited */}
          {sample.labsVisited?.length > 0 && (
            <div className="col-span-2 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-2">Ko'rilgan laboratoriyalar</p>
              <div className="flex flex-wrap gap-2">
                {sample.labsVisited.map(labId => {
                  const l = labs.find(x => x.id === labId);
                  return (
                    <span key={labId} className={`text-xs px-2 py-1 rounded-lg font-semibold ${labId === sample.currentLabId ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                      {l?.name || labId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && <p className="text-slate-500 text-sm text-center py-8">Tarix mavjud emas</p>}
          {history.map((h, i) => {
            const lab = labs.find(l => l.id === h.labId);
            return (
              <div key={h.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                    {h.isTransfer ? '🔄' : STATUS_LABELS[h.newStatus]?.icon || '•'}
                  </div>
                  {i < history.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.oldStatus && (
                      <>
                        <StatusBadge status={h.oldStatus} />
                        <span className="text-slate-400 text-xs">→</span>
                      </>
                    )}
                    <StatusBadge status={h.newStatus} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    🏢 {lab?.name || h.labId} · {timeSince(h.timestamp)}
                  </p>
                  {h.note && <p className="text-xs text-slate-600 mt-1 italic">"{h.note}"</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions tab */}
      {tab === 'actions' && (
        <div className="space-y-5">
          {!canEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
              ⚠️ Sizda status o'zgartirish huquqi yo'q
            </div>
          )}

          {/* Status update */}
          {canEdit && nextStatuses.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-700">Status o'zgartirish</h4>
              <Select
                label="Yangi status"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
              >
                <option value="">— Tanlang —</option>
                {nextStatuses.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]?.icon} {STATUS_LABELS[s]?.uz}</option>
                ))}
              </Select>
              <Textarea
                label="Izoh (ixtiyoriy)"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Qisqacha izoh..."
              />
              <Button onClick={handleStatusUpdate} loading={saving} disabled={!newStatus} className="w-full">
                ✅ Statusni yangilash
              </Button>
            </div>
          )}

          {/* Transfer */}
          {canEdit && sample.currentStatus !== STATUS.COMPLETED && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-700">Boshqa laboratoriyaga ko'chirish</h4>
              <Select
                label="Laboratoriya"
                value={transferLabId}
                onChange={e => setTransferLabId(e.target.value)}
              >
                <option value="">— Laboratoriya tanlang —</option>
                {labs.filter(l => l.id !== sample.currentLabId).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
              <Textarea
                label="Ko'chirish sababi"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Nima uchun ko'chirilmoqda..."
              />
              <Button variant="outline" onClick={handleTransfer} loading={saving} disabled={!transferLabId} className="w-full">
                🔄 Ko'chirish
              </Button>
            </div>
          )}

          {sample.currentStatus === STATUS.COMPLETED && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">🏁</p>
              <p className="font-bold text-green-700">Barcha sinovlar yakunlandi</p>
              <p className="text-sm text-green-600 mt-1">Bu namuna uchun boshqa amal qilish mumkin emas</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
