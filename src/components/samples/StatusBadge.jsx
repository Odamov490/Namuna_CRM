import { STATUS_LABELS } from '../../lib/firebase.js';
import { cn } from '../../lib/utils.js';

export default function StatusBadge({ status, size = 'sm' }) {
  const info = STATUS_LABELS[status] || { uz: status, color: 'bg-gray-100 text-gray-600', icon: '❓' };
  return (
    <span className={cn('status-badge', info.color, size === 'lg' && 'text-sm px-3 py-1.5')}>
      <span>{info.icon}</span>
      <span>{info.uz}</span>
    </span>
  );
}
