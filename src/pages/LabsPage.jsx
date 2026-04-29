import { useState, useEffect } from 'react';
import { labService, sampleService, LAB_TYPES } from '../lib/firebase.js';
import {
  Button, Input, Select, Modal, Textarea, Card, EmptyState,
  Spinner, ConfirmDialog, SectionHeader, ProgressBar, Badge,
} from '../components/ui/index.jsx';
import LabCard from '../components/labs/LabCard.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import SampleCard from '../components/samples/SampleCard.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import { cn, getLoadPercent } from '../lib/utils.js';
import { Plus, Pencil, Trash2, Building2, FlaskConical, Package } from 'lucide-react';

export default function LabsPage() {
  const { isSuperAdmin, showToast } = useApp();
  const [labs,          setLabs]          = useState([]);
  const [samples,       setSamples]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedLab,   setSelectedLab]   = useState(null);
  const [addOpen,       setAddOpen]       = useState(false);
  const [editLab,       setEditLab]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    const unsub = labService.subscribeToAll(data => {
      setLabs(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!selectedLab) { setSamples([]); return; }
    const unsub = sampleService.subscribeToAll(setSamples, { labId: selectedLab.id });
    return unsub;
  }, [selectedLab?.id]);

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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );

  const pct = selectedLab ? getLoadPercent(selectedLab.currentLoad || 0, selectedLab.capacity || 50) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SectionHeader
        icon="🏢"
        title="Laboratoriyalar"
        subtitle={`${labs.length} ta laboratoriya`}
        action={
          isSuperAdmin && (
            <Button size="sm" onClick={() => setAddOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Laboratoriya qo'shish
            </Button>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Labs list ── */}
        <div className="space-y-2">
          {labs.length === 0 ? (
            <EmptyState icon="🏢" title="Laboratoriyalar yo'q" />
          ) : (
            labs.map(l => (
              <LabCard
                key={l.id}
                lab={l}
                sampleCount={selectedLab?.id === l.id ? samples.length : l.currentLoad || 0}
                onClick={lab => setSelectedLab(lab.id === selectedLab?.id ? null : lab)}
                selected={selectedLab?.id === l.id}
              />
            ))
          )}
        </div>

        {/* ── Lab detail ── */}
        <div className="lg:col-span-2">
          {!selectedLab ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
              <Building2 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Laboratoriya tanlang</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">

              {/* Lab info card */}
              <Card className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                      🏢
                    </div>
                    <div>
                      <h2 className="font-black text-xl text-slate-900">{selectedLab.name}</h2>
                      <p className="text-slate-500 text-sm">{LAB_TYPES[selectedLab.type] || selectedLab.type}</p>
                      {!selectedLab.isActive && (
                        <Badge color="red" className="mt-1.5">Faol emas</Badge>
                      )}
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditLab(selectedLab)}
                        icon={<Pencil className="w-3.5 h-3.5" />}
                      >
                        Tahrir
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(selectedLab)}
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        O'chirish
                      </Button>
                    </div>
                  )}
                </div>

                {selectedLab.description && (
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{selectedLab.description}</p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">Sig'im</p>
                    <p className="text-lg font-black text-slate-800">{selectedLab.capacity || 50}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 mb-1">Hozir</p>
                    <p className="text-lg font-black text-blue-700">{selectedLab.currentLoad || 0}</p>
                  </div>
                  <div className={cn('rounded-xl p-3 text-center', pct >= 90 ? 'bg-red-50' : pct >= 70 ? 'bg-yellow-50' : 'bg-green-50')}>
                    <p className={cn('text-xs mb-1', pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-yellow-600' : 'text-green-600')}>Yuklanganligi</p>
                    <p className={cn('text-lg font-black', pct >= 90 ? 'text-red-700' : pct >= 70 ? 'text-yellow-700' : 'text-green-700')}>{pct}%</p>
                  </div>
                </div>

                <ProgressBar value={selectedLab.currentLoad || 0} max={selectedLab.capacity || 50} />
              </Card>

              {/* Samples in lab */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-slate-400" />
                  Bu laboratoriyada ({samples.length})
                </h3>

                {samples.length === 0 ? (
                  <EmptyState
                    icon="🧪"
                    title="Namuna yo'q"
                    subtitle="Bu laboratoriyada hozir namuna yo'q"
                  />
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {samples.map(s => (
                      <SampleCard
                        key={s.id}
                        sample={s}
                        labs={labs}
                        onClick={setSelectedSample}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <LabFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => setAddOpen(false)}
      />

      {editLab && (
        <LabFormModal
          open
          lab={editLab}
          onClose={() => setEditLab(null)}
          onSuccess={() => { setEditLab(null); setSelectedLab(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Laboratoriyani o'chirish"
        message={`"${deleteConfirm?.name}" ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        loading={deleting}
      />

      {selectedSample && (
        <SampleDetail
          sampleId={selectedSample.id}
          onClose={() => setSelectedSample(null)}
          labs={labs}
        />
      )}
    </div>
  );
}

/* ── Lab Form Modal ─────────────────────────────────────────── */
function LabFormModal({ open, onClose, onSuccess, lab }) {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [form, setForm] = useState({
    name:        lab?.name        || '',
    type:        lab?.type        || '',
    capacity:    lab?.capacity    || 50,
    description: lab?.description || '',
    isActive:    lab?.isActive    ?? true,
  });

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Nom kiritilishi shart';
    if (!form.type)         e.type = 'Tur tanlanishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
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
    <Modal
      open={open}
      onClose={onClose}
      title={lab ? 'Laboratoriyani tahrirlash' : "Yangi laboratoriya qo'shish"}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Laboratoriya nomi"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          error={errors.name}
          placeholder="Masalan: Oziq-ovqat sinash lab"
        />

        <Select
          label="Tur"
          required
          value={form.type}
          onChange={e => set('type', e.target.value)}
          error={errors.type}
        >
          <option value="">— Tanlang —</option>
          {Object.entries(LAB_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>

        <Input
          label="Sig'im (nechta namuna)"
          type="number"
          value={form.capacity}
          onChange={e => set('capacity', Math.max(1, +e.target.value))}
          min={1} max={1000}
        />

        <Textarea
          label="Tavsif"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={2}
          placeholder="Qisqacha tavsif..."
        />

        <label className="flex items-center gap-3 cursor-pointer py-1">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="sr-only"
            />
            <div className={cn(
              'w-10 h-6 rounded-full transition-colors',
              form.isActive ? 'bg-blue-600' : 'bg-slate-200'
            )}>
              <div className={cn(
                'w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform',
                form.isActive ? 'translate-x-5' : 'translate-x-1'
              )} />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-700">Faol holat</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            Bekor
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {lab ? 'Saqlash' : "Qo'shish"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
