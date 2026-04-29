import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { sampleService, labService, STATUS_LABELS } from '../lib/firebase.js';
import { Button, Input, Select, Textarea, Card, AlertBanner } from '../components/ui/index.jsx';
import StatusBadge from '../components/samples/StatusBadge.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { formatDate } from '../lib/utils.js';
import { cn } from '../lib/utils.js';
import {
  ScanLine, Search, Building2, User, Calendar,
  ArrowRight, CheckCircle2, Camera, CameraOff, Keyboard,
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
  const [mode,          setMode]          = useState('camera');
  const [barcode,       setBarcode]       = useState('');
  const [sample,        setSample]        = useState(null);
  const [labs,          setLabs]          = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [quickStatus,   setQuickStatus]   = useState('');
  const [quickNote,     setQuickNote]     = useState('');
  const [transferLabId, setTransferLabId] = useState('');
  const [scanError,     setScanError]     = useState('');
  const [cameraActive,  setCameraActive]  = useState(false);
  const [cameraError,   setCameraError]   = useState('');

  const scannerRef = useRef(null);
  const inputRef   = useRef();
  const SCANNER_ID = 'html5qr-region';

  useEffect(() => {
    labService.getAll().then(setLabs);
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(() => {}); };
  }, []);

  const stopCamera = useCallback(() => {
    if (scannerRef.current) { scannerRef.current.clear().catch(() => {}); scannerRef.current = null; }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(() => {
    setCameraError('');
    setCameraActive(true);
    setTimeout(() => {
      try {
        if (scannerRef.current) { scannerRef.current.clear().catch(() => {}); }
        const scanner = new Html5QrcodeScanner(
          SCANNER_ID,
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.5, showTorchButtonIfSupported: true,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39] },
          false
        );
        scanner.render(
          (text) => { scanner.clear().catch(() => {}); scannerRef.current = null; setCameraActive(false); handleBarcodeFound(text.trim()); },
          () => {}
        );
        scannerRef.current = scanner;
      } catch (e) {
        setCameraError("Kamera ochib bo'lmadi. Brauzer ruxsatini tekshiring.");
        setCameraActive(false);
      }
    }, 150);
  }, []);

  const handleBarcodeFound = async (code) => {
    const upper = code.toUpperCase();
    setBarcode(upper); setSample(null); setScanError(''); setSearching(true);
    try {
      const s = await sampleService.getByBarcode(upper);
      if (!s) { setScanError(`"${upper}" barcode bilan namuna topilmadi`); }
      else { setSample(s); setQuickStatus(''); setQuickNote(''); setTransferLabId(''); showToast('Namuna topildi ✅', 'success'); }
    } catch (e) { setScanError(e.message); }
    setSearching(false);
  };

  const handleQuickUpdate = async () => {
    if (!quickStatus && !transferLabId) return;
    setSaving(true);
    try {
      if (transferLabId) { await sampleService.transfer(sample.id, transferLabId, user.uid, quickNote); showToast("Ko'chirildi ✅", 'success'); }
      else { await sampleService.updateStatus(sample.id, quickStatus, user.uid, sample.currentLabId, quickNote); showToast('Status yangilandi ✅', 'success'); }
      const updated = await sampleService.get(sample.id);
      setSample(updated); setQuickStatus(''); setQuickNote(''); setTransferLabId('');
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };

  const resetScan = () => {
    setSample(null); setBarcode(''); setScanError('');
    if (mode === 'camera') startCamera();
    else setTimeout(() => inputRef.current?.focus(), 100);
  };

  const nextStatuses = STATUS_TRANSITIONS[sample?.currentStatus] || [];
  const currentLab   = labs.find(l => l.id === sample?.currentLabId);

  if (!canScan) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Ruxsat yo'q</h2>
      <p className="text-slate-500">Skanerlash faqat Texnik va yuqori rollar uchun</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">Barcode Skaner</h1>
        <p className="text-slate-500 text-sm">Kamera yoki qo'lda barcode kiriting</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {[{ id:'camera', icon:<Camera className="w-4 h-4"/>, label:'Kamera' }, { id:'manual', icon:<Keyboard className="w-4 h-4"/>, label:"Qo'lda" }].map(t => (
          <button key={t.id} onClick={() => { stopCamera(); setMode(t.id); if(t.id==='manual') setTimeout(()=>inputRef.current?.focus(),100); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all', mode===t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <Card className="p-5 mb-5">
        {mode === 'camera' && (
          <>
            <div id={SCANNER_ID} className={cn(!cameraActive && 'hidden')} />
            {!cameraActive && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Kamerani yoqing</p>
                  <p className="text-xs text-slate-400 mt-1">Brauzer ruxsat so'raganda "Allow" bosing</p>
                </div>
                {cameraError && <AlertBanner type="error" message={cameraError} />}
                <Button onClick={startCamera} icon={<Camera className="w-4 h-4"/>}>Kamerani yoqish</Button>
              </div>
            )}
            {cameraActive && (
              <div className="mt-3 flex justify-center">
                <Button variant="secondary" size="sm" onClick={stopCamera} icon={<CameraOff className="w-4 h-4"/>}>O'chirish</Button>
              </div>
            )}
          </>
        )}

        {mode === 'manual' && (
          <div className="flex gap-2" onKeyDown={e => e.key==='Enter' && barcode.trim() && handleBarcodeFound(barcode.trim())}>
            <Input ref={inputRef} value={barcode} onChange={e=>{setBarcode(e.target.value.toUpperCase());setScanError('');}}
              placeholder="NK2405001" className="font-mono tracking-widest flex-1" />
            <Button onClick={()=>handleBarcodeFound(barcode.trim())} loading={searching} disabled={!barcode.trim()} icon={<Search className="w-4 h-4"/>} className="flex-shrink-0">
              Izlash
            </Button>
          </div>
        )}

        {scanError && <div className="mt-3"><AlertBanner type="error" message={scanError} onDismiss={()=>setScanError('')}/></div>}
        {searching && <p className="text-center text-sm text-slate-400 mt-3 animate-pulse">Namuna izlanmoqda...</p>}
      </Card>

      {sample && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono font-black text-slate-900">{sample.barcode}</span>
                  <StatusBadge status={sample.currentStatus} />
                </div>
                <h3 className="font-bold text-slate-800 truncate">{sample.productName}</h3>
              </div>
              <Button variant="secondary" size="sm" onClick={()=>setDetailOpen(true)}>Batafsil</Button>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600"><User className="w-3.5 h-3.5 text-slate-400"/>{sample.applicantName}{sample.applicantPhone&&<span className="text-slate-400 text-xs">· {sample.applicantPhone}</span>}</div>
              {currentLab && <div className="flex items-center gap-2 text-sm text-slate-600"><Building2 className="w-3.5 h-3.5 text-slate-400"/>{currentLab.name}</div>}
              <div className="flex items-center gap-2 text-xs text-slate-400"><Calendar className="w-3.5 h-3.5"/>{formatDate(sample.createdAt)}</div>
            </div>
          </Card>

          {nextStatuses.length > 0 && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600"/>Tezkor yangilash</h3>
              <div className="space-y-3">
                <Select label="Yangi status" value={quickStatus} onChange={e=>{setQuickStatus(e.target.value);setTransferLabId('');}}>
                  <option value="">— Status tanlang —</option>
                  {nextStatuses.map(s=><option key={s} value={s}>{STATUS_LABELS[s]?.icon} {STATUS_LABELS[s]?.uz}</option>)}
                </Select>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-slate-100"/><span className="text-xs text-slate-400">yoki</span><div className="flex-1 h-px bg-slate-100"/></div>
                <Select label="Ko'chirish" value={transferLabId} onChange={e=>{setTransferLabId(e.target.value);setQuickStatus('');}}>
                  <option value="">— Laboratoriya tanlang —</option>
                  {labs.filter(l=>l.id!==sample.currentLabId&&l.isActive!==false).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
                <Textarea label="Izoh (ixtiyoriy)" value={quickNote} onChange={e=>setQuickNote(e.target.value)} rows={2} placeholder="Qisqacha izoh..."/>
                <Button onClick={handleQuickUpdate} loading={saving} disabled={!quickStatus&&!transferLabId} className="w-full" icon={<ArrowRight className="w-4 h-4"/>}>
                  {transferLabId ? "Ko'chirish" : 'Yangilash'}
                </Button>
              </div>
            </Card>
          )}

          {sample.currentStatus === 'completed' && (
            <Card className="p-5 text-center border-green-200 bg-green-50">
              <div className="text-3xl mb-2">🏁</div>
              <p className="font-bold text-green-700">Barcha sinovlar yakunlandi</p>
            </Card>
          )}

          <Button variant="secondary" className="w-full" onClick={resetScan} icon={<ScanLine className="w-4 h-4"/>}>
            Yangi barcode skanerlash
          </Button>
        </div>
      )}

      {detailOpen && sample && <SampleDetail sampleId={sample.id} onClose={()=>setDetailOpen(false)} labs={labs}/>}
    </div>
  );
}
