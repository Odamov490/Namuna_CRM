import { cn } from '../../lib/utils.js';

// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning:   'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
    outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };
  const sizes = {
    xs:  'text-xs px-2 py-1',
    sm:  'text-sm px-3 py-1.5',
    md:  'text-sm px-4 py-2',
    lg:  'text-base px-5 py-2.5',
    xl:  'text-base px-6 py-3',
    icon:'p-2',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, icon, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
            icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, className, hover, ...props }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-sm', hover && 'card-hover cursor-pointer', className)} {...props}>
      {children}
    </div>
  );
}

// ─── Badge / Status ───────────────────────────────────────────
export function Badge({ children, color = 'blue', className }) {
  const colors = {
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    gray:   'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={cn('status-badge text-xs font-bold', colors[color] || colors.gray, className)}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <svg className={cn('animate-spin text-blue-600', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full mx-4' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────
export function ToastContainer({ toasts }) {
  if (!toasts?.length) return null;
  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    warning: 'bg-yellow-500',
    info:    'bg-blue-600',
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.id} className={cn('text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2', colors[t.type] || colors.info)}>
          {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    gray:   'bg-slate-50 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0', colors[color])}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    blue:   'bg-blue-500',
    green:  'bg-green-500',
    red:    'bg-red-500',
    yellow: 'bg-yellow-400',
  };
  const barColor = pct >= 90 ? colors.red : pct >= 70 ? colors.yellow : colors[color];
  return (
    <div className="w-full">
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={cn('h-2 rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <p className="text-xs text-slate-500 mt-1 text-right">{pct}%</p>}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Ha, tasdiqlash", confirmVariant = 'danger', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor</Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
      </div>
    </Modal>
  );
}

// ─── Loading Page ─────────────────────────────────────────────
export function LoadingPage({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-medium">{text}</p>
    </div>
  );
}
