import { Card, ProgressBar } from '../ui/index.jsx';
import { getLoadPercent, getLoadColor, cn } from '../../lib/utils.js';
import { LAB_TYPES } from '../../lib/firebase.js';
import { FlaskConical, Users } from 'lucide-react';

const LAB_ICONS = {
  oziq_ovqat:     '🥩',
  elektrotexnika: '⚡',
  qurilish:       '🏗️',
  mashinasozlik:  '⚙️',
  polimer:        '🧪',
  yengil:         '👗',
  bolalar:        '🧸',
};

export default function LabCard({ lab, sampleCount = 0, onClick, selected }) {
  const pct    = getLoadPercent(lab.currentLoad || 0, lab.capacity || 50);
  const icon   = LAB_ICONS[lab.type] || '🔬';

  return (
    <Card
      hover
      onClick={() => onClick?.(lab)}
      className={cn(
        'p-4 transition-all',
        selected && 'ring-2 ring-blue-500 border-blue-200',
        !lab.isActive && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm leading-snug truncate">{lab.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{LAB_TYPES[lab.type] || lab.type}</p>
          </div>
        </div>
        <span className={cn('text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0', getLoadColor(pct))}>
          {pct}%
        </span>
      </div>

      <ProgressBar value={lab.currentLoad || 0} max={lab.capacity || 50} showLabel={false} height={1.5} />

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FlaskConical className="w-3.5 h-3.5" />
          {sampleCount || lab.currentLoad || 0} namuna
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {lab.currentLoad || 0}/{lab.capacity || 50}
        </span>
      </div>

      {!lab.isActive && (
        <div className="mt-2.5 bg-red-50 text-red-600 text-xs font-semibold px-2 py-1.5 rounded-lg text-center">
          ⛔ Faol emas
        </div>
      )}
    </Card>
  );
}
