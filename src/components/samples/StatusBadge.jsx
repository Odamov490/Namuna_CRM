import { STATUS_LABELS } from '../../lib/firebase.js';

export default function StatusBadge({ status }) {
  const config = STATUS_LABELS[status];
  if (!config) return null;

  const colors = {
    received:      'bg-slate-100 text-slate-600',
    waiting:       'bg-amber-50 text-amber-700',
    testing:       'bg-blue-50 text-blue-700',
    compliant:     'bg-emerald-50 text-emerald-700',
    non_compliant: 'bg-red-50 text-red-700',
    completed:     'bg-green-50 text-green-700',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      <span>{config.icon}</span>
      <span>{config.uz}</span>
    </span>
  );
}
