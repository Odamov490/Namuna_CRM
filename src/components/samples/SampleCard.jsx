import { formatDate, isOverdue, timeSince } from '../../lib/utils.js';
import { Card } from '../ui/index.jsx';
import StatusBadge from './StatusBadge.jsx';
import { STATUS } from '../../lib/firebase.js';

export default function SampleCard({ sample, labs = [], onClick }) {
  const lab = labs.find(l => l.id === sample.currentLabId);
  const overdue = isOverdue(sample.updatedAt) &&
    [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING].includes(sample.currentStatus);

  return (
    <Card
      hover
      onClick={() => onClick?.(sample)}
      className={`p-4 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}
    >
      {overdue && (
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-red-600 bg-red-100 rounded-lg px-2 py-1 w-fit">
          ⚠️ Muddati o'tgan (48 soat+)
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-black text-slate-800 text-sm font-mono">{sample.barcode}</span>
            <StatusBadge status={sample.currentStatus} />
          </div>
          <p className="font-semibold text-slate-700 text-sm truncate">{sample.productName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sample.applicantName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-slate-500">
            {lab ? `🏢 ${lab.name}` : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{timeSince(sample.updatedAt)}</p>
        </div>
      </div>
      {sample.note && (
        <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2 truncate">
          💬 {sample.note}
        </p>
      )}
    </Card>
  );
}
