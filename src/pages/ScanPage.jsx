import { useState, useRef } from 'react';
import { sampleService, labService, STATUS, STATUS_LABELS } from '../lib/firebase.js';
import { Button, Input, Select, Textarea, Card } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate } from '../lib/utils.js';
import { useEffect } from 'react';

export default function ScanPage() {
  const { user, canScan, showToast } = useApp();
  const [barcode, setBarcode]     = useState('');
  const [sample, setSample]       = useState(null);
  const [labs, setLabs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searching, setSearching] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mode, setMode]           = useState('scan'); // 'scan' | 'quick'

  // Quick update state
  const [quickStatus, setQuickStatus]   = useState('');
  const [quickNote, setQuickNote]       = useState('');
  const [quickLabId, setQuickLabId]     = useState('');
  const [saving, setSaving]             = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    labService.getAll().then(setLabs);
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const STATUS_TRANSITIONS = {
    received:      ['waiting', 'testing'],
    waiting:       ['testing'],
    testing:       ['compliant', 'non_compliant'],
    compliant:     ['transferred', 'completed'],
    non_compliant: ['transferred', 'completed'],
    transferred:   ['received'],
    completed:     [],
  };

  const handleScan = async () => {
    if (!barcode.trim()) return;
    setSearching(true);
    setSample(null);
    try {
      const s = await sampleService.getByBarcode(barcode.trim());
      if (!s) {
        showToast('Namuna topilmadi! Barcode tekshiring.', 'error');
      } else {
        setSample(s);
        setQuickStatus('');
        setQuickNote('');
        setQuickLabId('');
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan();
  };

  const handleQuickUpdate = async () => {
    if (!quickStatus && !quickLabId) return;
    setSaving(true);
    try {
      if (quickLabId) {
        await sampleService.transfer(sample.id, quickLabId, user.uid, quickNote);
        showToast("Ko'chirildi ✅", 'success');
      } else {
        await sampleService.updateStatus(sample.id, quickStatus, user.uid, sample.currentLabId, quickNote);
        showToast('Status yangilandi ✅', 'success');
      }
      // Refresh sample
      const updated = await sampleService.get(sample.id);
      setSample(updated);
      setQuickStatus('');
      setQuickNote('');
      setQuickLabId('');
      // Clear barcode and focus for next scan
      setBarcode('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setSaving(false);
  };

  const currentLab = labs.find(l => l.id === sample?.currentLabId);
  const nextStatuses = STATUS_TRANSITIONS[sample?.currentStatus] || [];

  if (!canScan) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Kirish taqiqlangan</h2>
        <p className="text-slate-500">Skaner foydalanish uchun Texnik yoki undan yuqori rol kerak</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-800">📱 QR / Barcode Skaner</h1>
        <p className="text-slate-500 text-sm mt-1">Namuna barcodeini skanerlang yoki kiriting</p>
      </div>

      {/* Scanner input */}
      <Card className="p-5">
        {/* Simulated QR viewfinder */}
        <div className="relative w-full h-40 bg-slate-900 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-4 border-2 border-blue-400 rounded-lg opacity-60" />
          {/* Corner marks */}
          {[['top-4 left-4', 'border-l-2 border-t-2'], ['top-4 right-4', 'border-r-2 border-t-2'],
            ['bottom-4 left-4', 'border-l-2 border-b-2'], ['bottom-4 right-4', 'border-r-2 border-b-2']].map(([pos, cls], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 border-blue-400 ${cls}`} />
          ))}
          <div className="scan-line" />
          <div className="text-center z-10">
            <p className="text-4xl mb-1">📷</p>
            <p className="text-slate-400 text-xs">Kamera integratsiyasi</p>
            <p className="text-slate-500 text-xs">Quyida qo'lda kiriting</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Barcode kiriting (Enter bosing)..."
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-mono flex-1"
            icon="🔍"
          />
          <Button onClick={handleScan} loading={searching} disabled={!barcode.trim()}>
            Qidirish
          </Button>
        </div>
      </Card>

      {/* Sample found */}
      {sample && (
        <Card className="p-5 border-blue-200 bg-blue-50/30">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono font-black text-xl text-slate-800">{sample.barcode}</span>
                <StatusBadge status={sample.currentStatus} size="lg" />
              </div>
              <p className="font-bold text-slate-700">{sample.productName}</p>
              <p className="text-sm text-slate-500">{sample.applicantName}</p>
              <p className="text-xs text-slate-400 mt-1">
                🏢 {currentLab?.name || 'Laboratoriya yo\'q'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDetailOpen(true)}>
              📋 Batafsil
            </Button>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            {nextStatuses.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Tezkor status o'zgartirish</p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map(s => {
                    const info = STATUS_LABELS[s];
                    return (
                      <button
                        key={s}
                        onClick={() => { setQuickStatus(s); setQuickLabId(''); }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          quickStatus === s
                            ? 'border-blue-500 bg-blue-100 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {info?.icon} {info?.uz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transfer */}
            {sample.currentStatus !== STATUS.COMPLETED && (
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Ko'chirish</p>
                <Select
                  value={quickLabId}
                  onChange={e => { setQuickLabId(e.target.value); setQuickStatus(''); }}
                >
                  <option value="">— Laboratoriya tanlang —</option>
                  {labs.filter(l => l.id !== sample.currentLabId).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {(quickStatus || quickLabId) && (
              <>
                <Textarea
                  placeholder="Izoh (ixtiyoriy)..."
                  value={quickNote}
                  onChange={e => setQuickNote(e.target.value)}
                  rows={2}
                />
                <Button onClick={handleQuickUpdate} loading={saving} className="w-full" size="lg">
                  {quickLabId ? '🔄 Ko\'chirish' : '✅ Yangilash'}
                </Button>
              </>
            )}

            {sample.currentStatus === STATUS.COMPLETED && (
              <div className="text-center py-3 bg-green-50 rounded-xl">
                <p className="font-bold text-green-700">🏁 Barcha sinovlar yakunlandi</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Detail modal */}
      {detailOpen && sample && (
        <SampleDetail
          sampleId={sample.id}
          onClose={() => setDetailOpen(false)}
          labs={labs}
        />
      )}

      {/* Instructions */}
      {!sample && (
        <Card className="p-4 bg-slate-50">
          <h3 className="font-bold text-slate-700 mb-3">📖 Qo'llanma</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span>1️⃣</span><span>Namuna barcodeini skanerlang yoki qo'lda kiriting</span></li>
            <li className="flex items-start gap-2"><span>2️⃣</span><span>Namuna ma'lumotlari ko'rinadi</span></li>
            <li className="flex items-start gap-2"><span>3️⃣</span><span>Yangi status tanlang yoki boshqa laboratoriyaga ko'chiring</span></li>
            <li className="flex items-start gap-2"><span>4️⃣</span><span>O'zgarish avtomatik saqlanadi</span></li>
          </ul>
        </Card>
      )}
    </div>
  );
}
