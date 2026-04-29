import { useState, useEffect } from 'react';
import { labService, sampleService, LAB_TYPES } from '../lib/firebase.js';
import { Button, Input, Select, Modal, Textarea, Card, EmptyState, Spinner, ConfirmDialog, SectionHeader } from '../components/ui/index.jsx';
import LabCard from '../components/labs/LabCard.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import SampleCard from '../components/samples/SampleCard.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';

export default function LabsPage() {
  const { isSuperAdmin, showToast } = useApp();
  const [labs, setLabs]           = useState([]);
  const [allLabs, setAllLabs]     = useState([]);
  const [samples, setSamples]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);
  const [addOpen, setAddOpen]     = useState(false);
  const [editLab, setEditLab]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    const unsub = labService.subscribeToAll(data => {
      setLabs(data); setAllLabs(data); setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!selectedLab) { setSamples([]); return; }
    const unsub = sampleService.subscribeToAll(setSamples, { labId: selectedLab.id });
    return unsub;
  }, [selectedLab]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await labService.delete(deleteConfirm.id);
      showToast("Laboratoriya o'chirildi", 'success');
      if (selectedLab?.id === deleteConfirm.id) setSelectedLab(null);
      setDeleteConfirm(null);
    } catch (e) { showToast(e.message, 'error'); }
    setDeleting(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="page-body">
      <SectionHeader
        icon="🏢"
        title="Laboratoriyalar"
        subtitle={`${labs.length} ta laboratoriya ro'yxatda`}
        action={isSuperAdmin && (
          <Button onClick={() => setAddOpen(true)}>+ Laboratoriya qo'shish</Button>
        )}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Lab list */}
        <div className="space-y-2">
          {labs.length === 0 ? (
            <EmptyState icon="🏢" title="Laboratoriyalar yo'q" />
          ) : (
            labs.map(l => (
              <div key={l.id} onClick={() => setSelectedLab(l)}
                className={`cursor-pointer rounded-2xl ring-2 transition-all ${selectedLab?.id === l.id ? 'ring-blue-500 ring-offset-1' : 'ring-transparent'}`}>
                <LabCard lab={l} sampleCount={selectedLab?.id === l.id ? samples.length : undefined} />
              </div>
            ))
          )}
        </div>

        {/* Lab detail panel */}
        <div className="lg:col-span-2">
          {!selectedLab ? (
            <Card className="flex items-center justify-center min-h-[300px] p-8">
              <div className="text-center">
                <div className="text-4xl mb-3 opacity-30">🏢</div>
                <p className="text-slate-400 text-sm">Ko'rish uchun laboratoriyani tanlang</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4 animate-fade">
              <Card className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-black text-xl text-slate-800">{selectedLab.name}</h2>
                      {selectedLab.isActive
                        ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Faol</span>
                        : <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Nofaol</span>
                      }
                    </div>
                    <p className="text-slate-500 text-sm">{LAB_TYPES[selectedLab.type] || selectedLab.type}</p>
                    {selectedLab.description && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedLab.description}</p>
                    )}
                    <div className="flex gap-5 mt-3">
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-800">{selectedLab.capacity}</p>
                        <p className="text-xs text-slate-400">Sig'im</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div className="text-center">
                        <p className="text-xl font-black text-blue-600">{selectedLab.currentLoad || 0}</p>
                        <p className="text-xs text-slate-400">Hozir</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-800">{samples.length}</p>
                        <p className="text-xs text-slate-400">Namunalar</p>
                      </div>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => setEditLab(selectedLab)}>✏️ Tahrir</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(selectedLab)}>🗑</Button>
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <h3 className="font-bold text-slate-700 mb-3 text-sm">Bu laboratoriyada ({samples.length} ta namuna)</h3>
                {samples.length === 0 ? (
                  <EmptyState icon="🧪" title="Namuna yo'q" subtitle="Bu laboratoriyada hozir namuna mavjud emas" />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {samples.slice(0, 20).map(s => (
                      <SampleCard key={s.id} sample={s} labs={allLabs} onClick={setSelectedSample} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <LabFormModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={() => setAddOpen(false)} />
      {editLab && (
        <LabFormModal open lab={editLab} onClose={() => setEditLab(null)} onSuccess={() => { setEditLab(null); setSelectedLab(null); }} />
      )}
      <ConfirmDialog
        open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Laboratoriyani o'chirish"
        message={`"${deleteConfirm?.name}" ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        loading={deleting}
      />
      {selectedSample && (
        <SampleDetail sampleId={selectedSample.id} onClose={() => setSelectedSample(null)} labs={allLabs} />
      )}
    </div>
  );
}

function LabFormModal({ open, onClose, onSuccess, lab }) {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lab?.name || '', type: lab?.type || '',
    capacity: lab?.capacity || 50, description: lab?.description || '',
    isActive: lab?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom kiritilishi shart";
    if (!form.type) e.type = "Tur tanlanishi shart";
    if (form.capacity < 1 || form.capacity > 1000) e.capacity = "1-1000 orasida bo'lishi kerak";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (lab) { await labService.update(lab.id, form); showToast('Laboratoriya yangilandi ✓', 'success'); }
      else      { await labService.create(form);         showToast("Laboratoriya qo'shildi ✓", 'success'); }
      onSuccess();
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}
      title={lab ? '✏️ Laboratoriyani tahrirlash' : '+ Yangi laboratoriya'} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor</Button>
          <Button onClick={handleSubmit} loading={loading}>{lab ? 'Saqlash' : "Qo'shish"}</Button>
        </>
      }>
      <div className="space-y-4">
        <Input label="Laboratoriya nomi *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="Masalan: Oziq-ovqat sinash lab" />
        <Select label="Tur *" value={form.type} onChange={e => set('type', e.target.value)} error={errors.type}>
          <option value="">— Tanlang —</option>
          {Object.entries(LAB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="Sig'im (namunalar soni)" type="number" value={form.capacity} onChange={e => set('capacity', +e.target.value)} error={errors.capacity} min={1} max={1000} />
        <Textarea label="Tavsif (ixtiyoriy)" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Qisqacha tavsif..." />
        <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-blue-600" />
          Faol holat
        </label>
      </div>
    </Modal>
  );
}
