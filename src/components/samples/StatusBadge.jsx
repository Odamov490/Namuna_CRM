import { STATUS_LABELS } from '../../lib/firebase.js';
import { cn } from '../../lib/utils.js';

const SIZE_CLASSES = {
  xs: 'text-[10px] px-2 py-0.5 gap-1',
  sm: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const info = STATUS_LABELS[status] || { uz: status, color: 'bg-gray-100 text-gray-600', icon: '❓' };
  return (
    <span className={cn('status-badge', info.color, SIZE_CLASSES[size])}>
      <span className="leading-none">{info.icon}</span>
      <span>{info.uz}</span>
    </span>
  );
}
