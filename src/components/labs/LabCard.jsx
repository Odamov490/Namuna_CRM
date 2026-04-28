import { Card, ProgressBar } from '../ui/index.jsx';
import { getLoadPercent, getLoadColor } from '../../lib/utils.js';
import { LAB_TYPES } from '../../lib/firebase.js';

export default function LabCard({ lab, sampleCount = 0, onClick }) {
  const pct = getLoadPercent(lab.currentLoad || 0, lab.capacity || 50);

  return (
    <Card hover onClick={() => onClick?.(lab)} className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm leading-snug">{lab.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{LAB_TYPES[lab.type] || lab.type}</p>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-lg ${getLoadColor(pct)}`}>
          {pct}%
        </div>
      </div>

      <ProgressBar value={lab.currentLoad || 0} max={lab.capacity || 50} />

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span>🧪 {sampleCount} namuna</span>
        <span>Sig'im: {lab.currentLoad || 0}/{lab.capacity || 50}</span>
      </div>

      {!lab.isActive && (
        <div className="mt-2 bg-red-50 text-red-600 text-xs font-semibold px-2 py-1 rounded-lg text-center">
          ⛔ Faol emas
        </div>
      )}
    </Card>
  );
}
