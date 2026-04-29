import { useState, useEffect } from 'react';
import { labService, sampleService, LAB_TYPES } from '../lib/firebase.js';
import { Button, Input, Select, Modal, Textarea, Card, EmptyState, Spinner, ConfirmDialog } from '../components/ui/index.jsx';
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
      setLabs(data);
      setAllLabs(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Load samples when lab selected
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
    } catch (e) {
      showToast(e.message, 'error');
    }
    setDeleting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">🏢 Laboratoriyalar</h1>
          <p className="text-slate-500 text-sm mt-1">{labs.length} ta laboratoriya</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setAddOpen(true)}>➕ Laboratoriya qo'shish</Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Labs grid */}
        <div className="space-y-3">
          {labs.length === 0 ? (
            <EmptyState icon="🏢" title="Laboratoriyalar yo'q" />
          ) : (
            labs.map(l => (
              <div key={l.id} onClick={() => setSelectedLab(l)} className={`cursor-pointer rounded-2xl ring-2 transition-all ${selectedLab?.id === l.id ? 'ring-blue-500' : 'ring-transparent'}`}>
                <LabCard lab={l} sampleCount={selectedLab?.id === l.id ? samples.length : 0} />
              </div>
            ))
          )}
        </div>

        {/* Lab detail */}
        <div className="lg:col-span-2">
          {!selectedLab ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-slate-400 text-sm">← Laboratoriya tanlang</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lab header */}
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black text-xl text-slate-800">{selectedLab.name}</h2>
                    <p className="text-slate-500 text-sm">{LAB_TYPES[selectedLab.type] || selectedLab.type}</p>
                    {selectedLab.description && (
                      <p className="text-xs text-slate-500 mt-2">{selectedLab.description}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-sm">
                      <span>📦 Sig'im: <strong>{selectedLab.capacity}</strong></span>
                      <span>🔬 Hozir: <strong>{selectedLab.currentLoad || 0}</strong></span>
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditLab(selectedLab)}>✏️ Tahrir</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(selectedLab)}>🗑</Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Samples in this lab */}
              <div>
                <h3 className="font-bold text-slate-700 mb-3">Bu laboratoriyada ({samples.length})</h3>
                {samples.length === 0 ? (
                  <EmptyState icon="🧪" title="Namuna yo'q" subtitle="Bu laboratoriyada hozir namuna yo'q" />
                ) : (
                  <div className="space-y-2">
                    {samples.map(s => (
                      <SampleCard key={s.id} sample={s} labs={labs} onClick={setSelectedSample} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lab Modal */}
      <LabFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => setAddOpen(false)}
      />

      {/* Edit Lab Modal */}
      {editLab && (
        <LabFormModal
          open
          lab={editLab}
          onClose={() => setEditLab(null)}
          onSuccess={() => { setEditLab(null); setSelectedLab(null); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Laboratoriyani o'chirish"
        message={`"${deleteConfirm?.name}" ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        loading={deleting}
      />

      {/* Sample detail */}
      {selectedSample && (
        <SampleDetail sampleId={selectedSample.id} onClose={() => setSelectedSample(null)} labs={allLabs} />
      )}
    </div>
  );
}

// ─── Lab Form Modal ───────────────────────────────────────────
function LabFormModal({ open, onClose, onSuccess, lab }) {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lab?.name || '',
    type: lab?.type || '',
    capacity: lab?.capacity || 50,
    description: lab?.description || '',
    isActive: lab?.isActive ?? true,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.type) return showToast('Nom va tur kiritilishi shart', 'error');
    setLoading(true);
    try {
      if (lab) {
        await labService.update(lab.id, form);
        showToast('Laboratoriya yangilandi ✅', 'success');
      } else {
        await labService.create(form);
        showToast("Laboratoriya qo'shildi ✅", 'success');
      }
      onSuccess();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={lab ? '✏️ Laboratoriyani tahrirlash' : "➕ Yangi laboratoriya"} size="sm">
      <div className="space-y-4">
        <Input label="Laboratoriya nomi *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Masalan: Oziq-ovqat sinash lab" />
        <Select label="Tur *" value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="">— Tanlang —</option>
          {Object.entries(LAB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Input label="Sig'im (nechta namuna)" type="number" value={form.capacity} onChange={e => set('capacity', +e.target.value)} min={1} max={500} />
        <Textarea label="Tavsif" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Qisqacha tavsif..." />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4" />
          Faol holat
        </label>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>Bekor</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">{lab ? 'Saqlash' : "Qo'shish"}</Button>
        </div>
      </div>
    </Modal>
  );
}
