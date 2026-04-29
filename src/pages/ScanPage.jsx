import { useState, useRef, useEffect } from 'react';
import { sampleService, labService, STATUS_LABELS } from '../lib/firebase.js';
import {
  Button, Input, Select, Textarea, Card, AlertBanner,
} from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate } from '../lib/utils.js';
import { cn } from '../lib/utils.js';
import {
  ScanLine, Search, Loader2, Building2, User, Calendar,
  ArrowRight, CheckCircle2,
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

export default function ScanPage() {
  const { user, canScan, showToast } = useApp();
  const [barcode,      setBarcode]      = useState('');
  const [sample,       setSample]       = useState(null);
  const [labs,         setLabs]         = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [quickStatus,  setQuickStatus]  = useState('');
  const [quickNote,    setQuickNote]    = useState('');
  const [transferLabId, setTransferLabId] = useState('');
  const [scanError,    setScanError]    = useState('');
  const inputRef = useRef();

  useEffect(() => {
    labService.getAll().then(setLabs);
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const handleScan = async () => {
    if (!barcode.trim()) return;
    setSearching(true);
    setSample(null);
    setScanError('');
    try {
      const s = await sampleService.getByBarcode(barcode.trim());
      if (!s) {
        setScanError(`"${barcode}" barcode bilan namuna topilmadi`);
      } else {
        setSample(s);
        setQuickStatus('');
        setQuickNote('');
        setTransferLabId('');
      }
    } catch (e) {
      setScanError(e.message);
    }
    setSearching(false);
  };

  const handleQuickUpdate = async () => {
    if (!quickStatus && !transferLabId) return;
    setSaving(true);
    try {
      if (transferLabId) {
        await sampleService.transfer(sample.id, transferLabId, user.uid, quickNote);
        showToast("Ko'chirildi ✅", 'success');
      } else {
        await sampleService.updateStatus(sample.id, quickStatus, user.uid, sample.currentLabId, quickNote);
        showToast('Status yangilandi ✅', 'success');
      }
      const updated = await sampleService.get(sample.id);
      setSample(updated);
      setQuickStatus('');
      setQuickNote('');
      setTransferLabId('');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  const nextStatuses = STATUS_TRANSITIONS[sample?.currentStatus] || [];
  const currentLab   = labs.find(l => l.id === sample?.currentLabId);

  if (!canScan) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Ruxsat yo'q</h2>
        <p className="text-slate-500">Skanerlash funksiyasi faqat texniklar uchun mavjud</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">Barcode Skaner</h1>
        <p className="text-slate-500 text-sm">Barcode skanerlang yoki qo'lda kiriting</p>
      </div>

      {/* Scan area */}
      <Card className="p-6 mb-5">
        {/* Animated scan frame */}
        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-5 flex items-center justify-center">
          {/* Corner markers */}
          {['tl', 'tr', 'bl', 'br'].map(pos => (
            <div key={pos} className={cn(
              'absolute w-6 h-6 border-blue-500 border-2',
              pos === 'tl' ? 'top-3 left-3 border-r-0 border-b-0 rounded-tl-lg' :
              pos === 'tr' ? 'top-3 right-3 border-l-0 border-b-0 rounded-tr-lg' :
              pos === 'bl' ? 'bottom-3 left-3 border-r-0 border-t-0 rounded-bl-lg' :
              'bottom-3 right-3 border-l-0 border-t-0 rounded-br-lg'
            )} />
          ))}
          {/* Scan line */}
          <div className="scan-line" />
          <div className="text-center relative z-10">
            <ScanLine className="w-12 h-12 text-blue-400 mx-auto mb-2 opacity-60" />
            <p className="text-slate-400 text-sm">QR / Barcode kameraga ko'rsating</p>
          </div>
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={barcode}
              onChange={e => { setBarcode(e.target.value.toUpperCase()); setScanError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Barcode kiriting (NK240001)"
              className="font-mono tracking-widest"
            />
          </div>
          <Button
            onClick={handleScan}
            loading={searching}
            disabled={!barcode.trim()}
            icon={<Search className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Izlash
          </Button>
        </div>

        {scanError && (
          <div className="mt-3">
            <AlertBanner type="error" message={scanError} onDismiss={() => setScanError('')} />
          </div>
        )}
      </Card>

      {/* Sample result */}
      {sample && (
        <div className="space-y-4 animate-fade-in">
          {/* Sample info */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono font-black text-slate-900">{sample.barcode}</span>
                  <StatusBadge status={sample.currentStatus} />
                </div>
                <h3 className="font-bold text-slate-800">{sample.productName}</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailOpen(true)}
              >
                Batafsil
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {sample.applicantName}
              </div>
              {currentLab && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {currentLab.name}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(sample.createdAt)}
              </div>
            </div>
          </Card>

          {/* Quick actions */}
          {nextStatuses.length > 0 && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Tezkor yangilash
              </h3>

              <div className="space-y-3">
                <Select
                  label="Yangi status"
                  value={quickStatus}
                  onChange={e => { setQuickStatus(e.target.value); setTransferLabId(''); }}
                >
                  <option value="">— Status tanlang —</option>
                  {nextStatuses.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]?.icon} {STATUS_LABELS[s]?.uz}</option>
                  ))}
                </Select>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-400">yoki</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <Select
                  label="Ko'chirish"
                  value={transferLabId}
                  onChange={e => { setTransferLabId(e.target.value); setQuickStatus(''); }}
                >
                  <option value="">— Laboratoriya tanlang —</option>
                  {labs.filter(l => l.id !== sample.currentLabId && l.isActive !== false).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </Select>

                <Textarea
                  label="Izoh (ixtiyoriy)"
                  value={quickNote}
                  onChange={e => setQuickNote(e.target.value)}
                  rows={2}
                  placeholder="Qisqacha izoh..."
                />

                <Button
                  onClick={handleQuickUpdate}
                  loading={saving}
                  disabled={!quickStatus && !transferLabId}
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {transferLabId ? "Ko'chirish" : 'Yangilash'}
                </Button>
              </div>
            </Card>
          )}

          {sample.currentStatus === 'completed' && (
            <Card className="p-5 text-center border-green-200 bg-green-50">
              <div className="text-3xl mb-2">🏁</div>
              <p className="font-bold text-green-700">Barcha sinovlar yakunlandi</p>
              <p className="text-sm text-green-600 mt-1">Bu namuna uchun boshqa amal yo'q</p>
            </Card>
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailOpen && sample && (
        <SampleDetail
          sampleId={sample.id}
          onClose={() => setDetailOpen(false)}
          labs={labs}
        />
      )}
    </div>
  );
}
