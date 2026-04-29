import { useState, useEffect } from 'react';
import { sampleService, labService, STATUS_LABELS } from '../lib/firebase.js';
import { Button, Input, Select, EmptyState, Spinner } from '../components/ui/index.jsx';
import SampleCard from '../components/samples/SampleCard.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import AddSampleModal from '../components/samples/AddSampleModal.jsx';
import { useApp } from '../contexts/AppContext.jsx';

export default function SamplesPage() {
  const { canEdit, userProfile, isSuperAdmin, isLabManager } = useApp();
  const [samples, setSamples]       = useState([]);
  const [labs, setLabs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLab, setFilterLab]   = useState('');
  const [selected, setSelected]     = useState(null);
  const [addOpen, setAddOpen]       = useState(false);

  useEffect(() => {
    labService.getAll().then(setLabs);
  }, []);

  useEffect(() => {
    setLoading(true);
    const labFilter = (!isSuperAdmin && !isLabManager && userProfile?.labId) ? userProfile.labId : (filterLab || undefined);
    const unsub = sampleService.subscribeToAll(data => {
      setSamples(data);
      setLoading(false);
    }, { labId: labFilter });
    return unsub;
  }, [filterLab, userProfile, isSuperAdmin, isLabManager]);

  const filtered = samples.filter(s => {
    if (filterStatus && s.currentStatus !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.barcode?.toLowerCase().includes(q) ||
        s.productName?.toLowerCase().includes(q) ||
        s.applicantName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800">🧪 Namunalar</h1>
          <p className="text-slate-500 text-sm mt-1">{samples.length} ta namuna</p>
        </div>
        {canEdit && (
          <Button onClick={() => setAddOpen(true)}>
            ➕ Yangi namuna
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Input
          placeholder="🔍 Barcode, mahsulot yoki ariza beruvchi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Barcha statuslar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.uz}</option>
          ))}
        </Select>
        {(isSuperAdmin || isLabManager) && (
          <Select value={filterLab} onChange={e => setFilterLab(e.target.value)}>
            <option value="">Barcha laboratoriyalar</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Namuna topilmadi"
          subtitle={search ? `"${search}" bo'yicha hech narsa topilmadi` : "Hali namuna qo'shilmagan"}
          action={canEdit && <Button onClick={() => setAddOpen(true)}>➕ Namuna qo'shish</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => (
            <SampleCard key={s.id} sample={s} labs={labs} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <SampleDetail
          sampleId={selected.id}
          onClose={() => setSelected(null)}
          labs={labs}
        />
      )}

      {/* Add Modal */}
      <AddSampleModal open={addOpen} onClose={() => setAddOpen(false)} labs={labs} />
    </div>
  );
}
