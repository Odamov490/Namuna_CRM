import { cn } from '../../lib/utils.js';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200/60',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-slate-600 hover:bg-slate-100',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700',
    warning:   'bg-amber-500 text-white hover:bg-amber-600',
    outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    google:    'border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white',
  };
  const sizes = {
    xs: 'text-xs px-3 py-1.5 rounded-lg',
    sm: 'text-sm px-3.5 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
    icon: 'p-2.5 rounded-lg',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, hint, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{icon}</span>}
        <input
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none',
            'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            icon && 'pl-10',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50/30',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none cursor-pointer transition-all',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">⚠ {error}</span>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none outline-none transition-all',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">⚠ {error}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, hover, ...props }) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-slate-100 shadow-sm',
      hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
      className
    )} {...props}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue', className }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    red:    'bg-red-50 text-red-700 ring-1 ring-red-100',
    yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
    gray:   'bg-slate-100 text-slate-600',
    cyan:   'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100',
    orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold', colors[color] || colors.gray, className)}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
  return <div className={cn('rounded-full border-blue-600 border-t-transparent animate-spin', sizes[size], className)} />;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className={cn('modal-box', sizes[size])}>
        {title && (
          <div className="modal-header">
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all text-lg leading-none"
            >×</button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Tasdiqlash", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor qilish</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </>
      }
    >
      <p className="text-slate-600 text-sm">{message}</p>
    </Modal>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  if (!toasts?.length) return null;
  const styles = {
    success: { bg: 'bg-emerald-600 text-white', icon: '✓' },
    error:   { bg: 'bg-red-600 text-white',     icon: '✕' },
    warning: { bg: 'bg-amber-500 text-white',   icon: '⚠' },
    info:    { bg: 'bg-blue-600 text-white',    icon: 'ℹ' },
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => {
        const s = styles[t.type] || styles.info;
        return (
          <div key={t.id} className={cn('toast-item', s.bg)}>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-black flex-shrink-0">{s.icon}</span>
            <span className="flex-1 leading-snug">{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">{icon}</div>}
        <div>
          <h1 className="text-xl font-black text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'blue', icon, trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: 'bg-blue-100' },
    green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    red:    { bg: 'bg-red-50',     text: 'text-red-600',     icon: 'bg-red-100' },
    purple: { bg: 'bg-violet-50',  text: 'text-violet-600',  icon: 'bg-violet-100' },
    amber:  { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: 'bg-amber-100' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0', c.icon)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={cn('text-2xl font-black', c.text)}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="text-5xl mb-4 opacity-50">{icon || '📭'}</div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mb-5 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}

// ─── Loading Page ─────────────────────────────────────────────────────────────
export function LoadingPage({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 gap-4 z-[200]">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-200">🔬</div>
      <Spinner size="lg" />
      <p className="text-sm text-slate-500 font-medium">{text}</p>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = 'blue', className }) {
  const colors = { blue: 'bg-blue-500', green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500' };
  return (
    <div className={cn('w-full h-1.5 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', colors[color] || colors.blue)} style={{ width: `${Math.min(100, value || 0)}%` }} />
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
export function DataTable({ columns, data, onRowClick, emptyState }) {
  if (!data?.length) return emptyState || <EmptyState icon="📋" title="Ma'lumot yo'q" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col, i) => (
              <th key={i} className="text-left p-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} onClick={() => onRowClick?.(row)}
              className={cn('border-b border-slate-50 transition-colors', onRowClick && 'hover:bg-blue-50/30 cursor-pointer')}>
              {columns.map((col, ci) => (
                <td key={ci} className="p-3 text-sm text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Qidirish...', className }) {
  return (
    <div className={cn('relative', className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
      />
      {value && (
        <button onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, total, perPage = 12, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
      <p className="text-sm text-slate-500">{start}–{end} / {total} ta</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          ‹
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let p = i + 1;
          if (pages > 5) {
            if (page <= 3) p = i + 1;
            else if (page >= pages - 2) p = pages - 4 + i;
            else p = page - 2 + i;
          }
          return (
            <button key={p} onClick={() => onChange(p)}
              className={cn('w-8 h-8 rounded-lg text-sm font-semibold transition-all', p === page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= pages}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          ›
        </button>
      </div>
    </div>
  );
}
