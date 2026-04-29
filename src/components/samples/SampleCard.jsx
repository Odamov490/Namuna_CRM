import { formatDate, isOverdue, timeSince } from '../../lib/utils.js';
import { Card, Badge } from '../ui/index.jsx';
import StatusBadge from './StatusBadge.jsx';
import { STATUS } from '../../lib/firebase.js';

export default function SampleCard({ sample, labs = [], onClick }) {
  const lab     = labs.find(l => l.id === sample.currentLabId);
  const overdue = isOverdue(sample.updatedAt) &&
    [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING].includes(sample.currentStatus);

  return (
    <Card hover onClick={() => onClick?.(sample)}
      className={`p-4 ${overdue ? 'border-red-200 bg-red-50/20' : ''}`}>

      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-red-600 bg-red-100 rounded-lg px-2.5 py-1.5">
          ⚠️ Muddati o'tgan (48 soat+)
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <code className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded-md">
              {sample.barcode}
            </code>
            <StatusBadge status={sample.currentStatus} />
          </div>
          <p className="font-semibold text-slate-700 text-sm leading-tight">{sample.productName}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
          🧪
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
        <span className="truncate">{sample.applicantName || '—'}</span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {lab && <span className="text-slate-400 truncate max-w-[80px]">🏢 {lab.name}</span>}
          <span>{timeSince(sample.updatedAt)}</span>
        </div>
      </div>

      {sample.note && (
        <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50 truncate">
          💬 {sample.note}
        </p>
      )}
    </Card>
  );
}
