import { useState, useEffect } from 'react';
import { sampleService, historyService, STATUS, STATUS_LABELS, LAB_TYPES } from '../../lib/firebase.js';
import { Modal, Button, Select, Textarea, Tabs, AlertBanner } from '../ui/index.jsx';
import StatusBadge from './StatusBadge.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { formatDate, timeSince } from '../../lib/utils.js';
import { cn } from '../../lib/utils.js';
import {
  FlaskConical, Building2, User, Phone, Calendar,
  ArrowRight, Loader2, CheckCircle2, Clock,
} from 'lucide-react';

const STATUS_TRANSITIONS = {
  received:      ['waiting', 'testing'],
  waiting:       ['testing'],
  testing:       ['compliant', 'non_compliant'],
  compliant:     ['transferred', 'completed'],
  non_compliant: ['transferred', 'completed'],
  transferred:   ['received'],
  completed:     [],
};

const TABS = [
  { id: 'info',    label: "Ma'lumot",  icon: '📋' },
  { id: 'history', label: 'Tarix',     icon: '📜' },
  { id: 'actions', label: 'Amallar',   icon: '⚡' },
];

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-sm font-semibold text-slate-800 break-words">{value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

export default function SampleDetail({ sampleId, onClose, labs = [] }) {
  const { user, canEdit, showToast } = useApp();
  const [sample,  setSample]  = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState('info');

  const [newStatus,    setNewStatus]    = useState('');
  const [note,         setNote]         = useState('');
  const [transferLabId, setTransferLabId] = useState('');

  useEffect(() => {
    if (!sampleId) return;
    setLoading(true);
    const unsub = sampleService.subscribeToOne(sampleId, s => {
      setSample(s);
      setLoading(false);
    });
    historyService.getBySample(sampleId).then(setHistory);
    return unsub;
  }, [sampleId]);

  const currentLab  = labs.find(l => l.id === sample?.currentLabId);
  const nextStatuses = STATUS_TRANSITIONS[sample?.currentStatus] || [];

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSaving(true);
    try {
      await sampleService.updateStatus(sampleId, newStatus, user.uid, sample.currentLabId, note);
      const hist = await historyService.getBySample(sampleId);
      setHistory(hist);
      setNewStatus(''); setNote('');
      showToast('Status muvaffaqiyatli yangilandi', 'success');
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
      setTransferLabId(''); setNote('');
      showToast("Namuna muvaffaqiyatli ko'chirildi", 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  if (loading || !sample) {
    return (
      <Modal open onClose={onClose} title="Namuna ma'lumotlari" size="lg">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} size="lg" title={null}>
      {/* Custom header */}
      <div className="-mx-6 -mt-6 px-6 pt-6 pb-5 border-b border-slate-100 mb-5 bg-gradient-to-br from-slate-50 to-white rounded-t-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all text-xl">×</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <FlaskConical className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-mono font-black text-slate-900 text-lg">{sample.barcode}</span>
              <StatusBadge status={sample.currentStatus} size="lg" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 truncate">{sample.productName}</h2>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <User className="w-3.5 h-3.5" /> {sample.applicantName}
              </span>
              {sample.applicantPhone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5" /> {sample.applicantPhone}
                </span>
              )}
              {currentLab && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Building2 className="w-3.5 h-3.5" /> {currentLab.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <Tabs
          tabs={TABS.map(t => ({ ...t }))}
          active={tab}
          onChange={setTab}
          className="-mb-5 border-0"
        />
      </div>

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="space-y-4 animate-fade-in">
          <InfoGrid items={[
            ['Barcode', sample.barcode],
            ['Mahsulot nomi', sample.productName],
            ['Ariza beruvchi', sample.applicantName],
            ['Telefon', sample.applicantPhone],
            ['Mahsulot turi', sample.productType],
            ['Laboratoriyalar soni', `${sample.labsVisited?.length || 0} ta`],
            ['Yaratilgan', formatDate(sample.createdAt)],
            ['Oxirgi yangilanish', formatDate(sample.updatedAt)],
          ]} />

          {sample.note && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1.5">Izoh</p>
              <p className="text-sm text-slate-700 leading-relaxed">{sample.note}</p>
            </div>
          )}

          {sample.labsVisited?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ko'rilgan laboratoriyalar</p>
              <div className="flex flex-wrap gap-2">
                {sample.labsVisited.map(labId => {
                  const l = labs.find(x => x.id === labId);
                  const isCurrent = labId === sample.currentLabId;
                  return (
                    <span key={labId} className={cn(
                      'text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5',
                      isCurrent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {l?.name || labId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="animate-fade-in">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tarix mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-0">
              {history.map((h, i) => {
                const lab = labs.find(l => l.id === h.labId);
                return (
                  <div key={h.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5',
                        h.isTransfer ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                      )}>
                        {h.isTransfer ? '🔄' : STATUS_LABELS[h.newStatus]?.icon || '•'}
                      </div>
                      {i < history.length - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {h.oldStatus && (
                          <>
                            <StatusBadge status={h.oldStatus} size="xs" />
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                        <StatusBadge status={h.newStatus} size="xs" />
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" />
                        {lab?.name || h.labId}
                        <span className="text-slate-300">·</span>
                        {timeSince(h.timestamp)}
                      </p>
                      {h.note && (
                        <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 rounded-lg px-2.5 py-1.5">
                          "{h.note}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions Tab */}
      {tab === 'actions' && (
        <div className="space-y-4 animate-fade-in">
          {!canEdit && (
            <AlertBanner type="warning" message="Sizda status o'zgartirish huquqi yo'q" />
          )}

          {/* Status update */}
          {canEdit && nextStatuses.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Status o'zgartirish
              </h4>
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
              <Button
                onClick={handleStatusUpdate}
                loading={saving}
                disabled={!newStatus}
                className="w-full"
              >
                Statusni yangilash
              </Button>
            </div>
          )}

          {/* Transfer */}
          {canEdit && sample.currentStatus !== STATUS.COMPLETED && (
            <div className="bg-blue-50 rounded-2xl p-4 space-y-3 border border-blue-100">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Boshqa laboratoriyaga ko'chirish
              </h4>
              <Select
                label="Laboratoriya"
                value={transferLabId}
                onChange={e => setTransferLabId(e.target.value)}
              >
                <option value="">— Laboratoriya tanlang —</option>
                {labs.filter(l => l.id !== sample.currentLabId && l.isActive !== false).map(l => (
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
              <Button
                variant="outline"
                onClick={handleTransfer}
                loading={saving}
                disabled={!transferLabId}
                className="w-full"
              >
                Ko'chirish
              </Button>
            </div>
          )}

          {sample.currentStatus === STATUS.COMPLETED && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🏁</div>
              <p className="font-bold text-slate-700">Barcha sinovlar yakunlandi</p>
              <p className="text-sm text-slate-500 mt-1">Bu namuna uchun boshqa amal qilish mumkin emas</p>
            </div>
          )}

          {nextStatuses.length === 0 && sample.currentStatus !== STATUS.COMPLETED && !canEdit && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Hozircha hech qanday amal mavjud emas
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
