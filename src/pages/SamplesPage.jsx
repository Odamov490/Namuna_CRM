import { useState, useEffect, useMemo } from 'react';
import { sampleService, labService, STATUS_LABELS } from '../lib/firebase.js';
import { Button, SearchInput, Select, EmptyState, Spinner, Pagination, SectionHeader } from '../components/ui/index.jsx';
import SampleCard from '../components/samples/SampleCard.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import AddSampleModal from '../components/samples/AddSampleModal.jsx';
import { useApp } from '../contexts/AppContext.jsx';

const PER_PAGE = 12;

export default function SamplesPage() {
  const { canEdit, userProfile, isSuperAdmin, isLabManager } = useApp();
  const [samples, setSamples]     = useState([]);
  const [labs, setLabs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLab, setFilterLab] = useState('');
  const [sortBy, setSortBy]       = useState('newest');
  const [selected, setSelected]   = useState(null);
  const [addOpen, setAddOpen]     = useState(false);
  const [page, setPage]           = useState(1);

  useEffect(() => { labService.getAll().then(setLabs); }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const labFilter = (!isSuperAdmin && !isLabManager && userProfile?.labId) ? userProfile.labId : (filterLab || undefined);
    const unsub = sampleService.subscribeToAll(data => {
      setSamples(data);
      setLoading(false);
    }, { labId: labFilter });
    return unsub;
  }, [filterLab, userProfile, isSuperAdmin, isLabManager]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterStatus, sortBy]);

  const filtered = useMemo(() => {
    let result = samples.filter(s => {
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

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sortBy === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      if (sortBy === 'barcode') return (a.barcode || '').localeCompare(b.barcode || '');
      if (sortBy === 'product') return (a.productName || '').localeCompare(b.productName || '');
      return 0;
    });

    return result;
  }, [samples, search, filterStatus, sortBy]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasActiveFilters = search || filterStatus || filterLab;

  return (
    <div className="page-body">
      <SectionHeader
        icon="🧪"
        title="Namunalar"
        subtitle={`${samples.length} ta namuna ro'yxatda`}
        action={canEdit && (
          <Button onClick={() => setAddOpen(true)}>
            + Yangi namuna
          </Button>
        )}
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Barcode, mahsulot yoki ariza beruvchi..."
          className="flex-1 min-w-[220px]"
        />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-44">
          <option value="">Barcha statuslar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.uz}</option>
          ))}
        </Select>
        {(isSuperAdmin || isLabManager) && (
          <Select value={filterLab} onChange={e => setFilterLab(e.target.value)} className="w-44">
            <option value="">Barcha lablar</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
        <Select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-40">
          <option value="newest">Eng yangi</option>
          <option value="oldest">Eng eski</option>
          <option value="barcode">Barcode bo'yicha</option>
          <option value="product">Mahsulot bo'yicha</option>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm"
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterLab(''); setSortBy('newest'); }}>
            ✕ Tozalash
          </Button>
        )}
      </div>

      {/* Results count */}
      {!loading && filtered.length > 0 && (
        <p className="text-sm text-slate-500 mb-3">
          {search || filterStatus ? `${filtered.length} ta natija topildi` : `Jami ${filtered.length} ta`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? '🔍' : '🧪'}
          title={hasActiveFilters ? 'Namuna topilmadi' : "Namunalar yo'q"}
          subtitle={
            search ? `"${search}" so'rovi bo'yicha hech narsa topilmadi`
            : filterStatus ? 'Bu status bo\'yicha namuna yo\'q'
            : "Hali hech qanday namuna qo'shilmagan"
          }
          action={canEdit && !hasActiveFilters && (
            <Button onClick={() => setAddOpen(true)}>+ Birinchi namunani qo'shish</Button>
          )}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(s => (
              <SampleCard key={s.id} sample={s} labs={labs} onClick={setSelected} />
            ))}
          </div>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </>
      )}

      {selected && (
        <SampleDetail sampleId={selected.id} onClose={() => setSelected(null)} labs={labs} />
      )}
      <AddSampleModal open={addOpen} onClose={() => setAddOpen(false)} labs={labs} />
    </div>
  );
}
