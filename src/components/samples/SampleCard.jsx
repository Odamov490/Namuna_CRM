import { formatDate, isOverdue, timeSince } from '../../lib/utils.js';
import { Card } from '../ui/index.jsx';
import StatusBadge from './StatusBadge.jsx';
import { STATUS } from '../../lib/firebase.js';
import { Clock, Building2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function SampleCard({ sample, labs = [], onClick, selected }) {
  const lab     = labs.find(l => l.id === sample.currentLabId);
  const overdue = isOverdue(sample.updatedAt) &&
    [STATUS.RECEIVED, STATUS.WAITING, STATUS.TESTING].includes(sample.currentStatus);

  return (
    <Card
      hover
      onClick={() => onClick?.(sample)}
      className={cn(
        'p-4 transition-all',
        overdue    && 'border-red-200 bg-red-50/30',
        selected   && 'ring-2 ring-blue-500 border-blue-200',
      )}
    >
      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-red-600 bg-red-100 rounded-lg px-2.5 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          Muddati o'tgan (48 soat+)
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Barcode + status */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono font-bold text-slate-800 text-sm">{sample.barcode}</span>
            <StatusBadge status={sample.currentStatus} />
          </div>

          {/* Product name */}
          <p className="font-semibold text-slate-700 text-sm leading-snug truncate">{sample.productName}</p>

          {/* Applicant */}
          <p className="text-xs text-slate-500 mt-0.5 truncate">{sample.applicantName}</p>
        </div>

        {/* Right side */}
        <div className="text-right flex-shrink-0 space-y-1">
          {lab && (
            <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{lab.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
            <Clock className="w-3 h-3" />
            {timeSince(sample.updatedAt)}
          </div>
        </div>
      </div>

      {/* Note */}
      {sample.note && (
        <p className="text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 truncate italic">
          "{sample.note}"
        </p>
      )}
    </Card>
  );
}
