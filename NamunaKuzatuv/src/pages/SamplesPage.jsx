import { useState, useEffect, useCallback } from 'react';
import { sampleService, labService, STATUS_LABELS } from '../lib/firebase.js';
import {
  Button, SearchInput, Select, EmptyState, Spinner,
  FilterChip, SectionHeader, SkeletonCard,
} from '../components/ui/index.jsx';
import SampleCard from '../components/samples/SampleCard.jsx';
import SampleDetail from '../components/samples/SampleDetail.jsx';
import AddSampleModal from '../components/samples/AddSampleModal.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { cn, debounce } from '../lib/utils.js';
import { Plus, SlidersHorizontal, X, FlaskConical } from 'lucide-react';

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: 'updatedAt_desc', label: 'So\'nggi yangilangan' },
  { value: 'createdAt_desc', label: 'Eng yangi' },
  { value: 'barcode_asc',    label: 'Barcode A-Z' },
];

export default function SamplesPage() {
  const { canEdit, userProfile, isSuperAdmin, isLabManager } = useApp();
  const [samples,      setSamples]      = useState([]);
  const [labs,         setLabs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLab,    setFilterLab]    = useState('');
  const [selected,     setSelected]     = useState(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);
  const [page,         setPage]         = useState(1);

  useEffect(() => { labService.getAll().then(setLabs); }, []);

  useEffect(() => {
    setLoading(true);
    const labFilter = (!isSuperAdmin && !isLabManager && userProfile?.labId)
      ? userProfile.labId
      : (filterLab || undefined);
    const unsub = sampleService.subscribeToAll(data => {
      setSamples(data);
      setLoading(false);
      setPage(1);
    }, { labId: labFilter });
    return unsub;
  }, [filterLab, userProfile, isSuperAdmin, isLabManager]);

  // Filtered + searched
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

  // Paginated
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = paginated.length < filtered.length;

  // Status counts for chips
  const statusCounts = {};
  samples.forEach(s => { statusCounts[s.currentStatus] = (statusCounts[s.currentStatus] || 0) + 1; });

  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterLab(''); };
  const hasFilters   = search || filterStatus || filterLab;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ── Header ── */}
      <SectionHeader
        icon="🧪"
        title="Namunalar"
        subtitle={`${filtered.length} ta namuna${hasFilters ? ' (filtrlangan)' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(p => !p)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className={cn(showFilters && 'bg-blue-50 text-blue-700 border-blue-200')}
            >
              Filtr
            </Button>
            {canEdit && (
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Yangi namuna
              </Button>
            )}
          </div>
        }
      />

      {/* ── Search bar ── */}
      <SearchInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Barcode, mahsulot nomi yoki ariza beruvchi..."
        className="mb-3"
      />

      {/* ── Filters panel ── */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-card p-4 mb-4 grid sm:grid-cols-2 gap-3 animate-fade-in">
          <Select
            label="Status bo'yicha"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Barcha statuslar</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.uz} ({statusCounts[k] || 0})</option>
            ))}
          </Select>

          {(isSuperAdmin || isLabManager) && (
            <Select
              label="Laboratoriya bo'yicha"
              value={filterLab}
              onChange={e => setFilterLab(e.target.value)}
            >
              <option value="">Barcha laboratoriyalar</option>
              {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          )}

          {hasFilters && (
            <div className="sm:col-span-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X className="w-3.5 h-3.5" />}>
                Filtrlarni tozalash
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Status quick-filter chips ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 hide-scrollbar">
        <FilterChip active={!filterStatus} onClick={() => setFilterStatus('')} count={samples.length}>
          Barchasi
        </FilterChip>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          statusCounts[k] > 0 && (
            <FilterChip
              key={k}
              active={filterStatus === k}
              onClick={() => setFilterStatus(filterStatus === k ? '' : k)}
              count={statusCounts[k]}
            >
              {v.icon} {v.uz}
            </FilterChip>
          )
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search ? '🔍' : '🧪'}
          title={search ? 'Namuna topilmadi' : "Namunalar yo'q"}
          subtitle={
            search
              ? `"${search}" bo'yicha hech narsa topilmadi`
              : "Hali hech qanday namuna qo'shilmagan"
          }
          action={
            hasFilters
              ? <Button variant="secondary" onClick={clearFilters}>Filtrlarni tozalash</Button>
              : canEdit && <Button onClick={() => setAddOpen(true)} icon={<Plus className="w-4 h-4" />}>Namuna qo'shish</Button>
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map(s => (
              <SampleCard
                key={s.id}
                sample={s}
                labs={labs}
                onClick={setSelected}
                selected={selected?.id === s.id}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="secondary"
                onClick={() => setPage(p => p + 1)}
              >
                Ko'proq yuklash ({filtered.length - paginated.length} ta qoldi)
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-4">
            {paginated.length} / {filtered.length} ta ko'rsatilmoqda
          </p>
        </>
      )}

      {/* Modals */}
      {selected && (
        <SampleDetail
          sampleId={selected.id}
          onClose={() => setSelected(null)}
          labs={labs}
        />
      )}
      <AddSampleModal open={addOpen} onClose={() => setAddOpen(false)} labs={labs} />
    </div>
  );
}
