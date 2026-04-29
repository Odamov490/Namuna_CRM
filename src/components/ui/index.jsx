import { cn } from '../../lib/utils.js';

// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm shadow-blue-200',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm shadow-red-200',
    ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
    outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    google:    'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 bg-white',
  };
  const sizes = {
    xs:   'text-xs px-2.5 py-1.5',
    sm:   'text-sm px-3 py-1.5',
    md:   'text-sm px-4 py-2',
    lg:   'text-base px-5 py-2.5',
    xl:   'text-base px-6 py-3',
    icon: 'p-2',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, icon, className, hint, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>}
        <input
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
            icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400 bg-red-50/30',
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

// ─── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer',
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
      {error && <span className="text-xs text-red-500">⚠ {error}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────
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

// ─── Badge ────────────────────────────────────────────────────
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
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold', colors[color] || colors.gray, className)}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-[3px]' };
  return (
    <div className={cn('animate-spin rounded-full border-blue-600 border-t-transparent', sizes[size], className)} />
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', headerImg }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full mx-4' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-3xl shadow-2xl w-full flex flex-col max-h-[90vh]', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {headerImg && (
                <img src={headerImg} alt="" className="w-9 h-9 rounded-xl object-cover" />
              )}
              <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all text-xl">
              ×
            </button>
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
  const styles = {
    success: { bg: 'bg-emerald-600', icon: '✅' },
    error:   { bg: 'bg-red-600',     icon: '❌' },
    warning: { bg: 'bg-amber-500',   icon: '⚠️' },
    info:    { bg: 'bg-blue-600',    icon: 'ℹ️' },
  };
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => {
        const s = styles[t.type] || styles.info;
        return (
          <div key={t.id}
            className={cn('text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-3', s.bg)}>
            <span className="text-base flex-shrink-0">{s.icon}</span>
            <span className="flex-1">{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Empty State — rasm bilan ─────────────────────────────────
export function EmptyState({ icon, img, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {img
        ? <img src={img} alt={title} className="w-20 h-20 rounded-2xl object-cover mb-4 opacity-70" />
        : <div className="text-5xl mb-4">{icon || '📭'}</div>
      }
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mb-4 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}

// ─── Stat Card — rasm bilan ───────────────────────────────────
export function StatCard({ icon, img, label, value, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50',
    green:  'bg-green-50',
    red:    'bg-red-50',
    yellow: 'bg-yellow-50',
    purple: 'bg-purple-50',
    gray:   'bg-slate-50',
    indigo: 'bg-indigo-50',
  };
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {img
          ? <img src={img} alt={label} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
          : <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0', colors[color])}>
              {icon}
            </div>
        }
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true, height = 2 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-blue-500';
  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full`} style={{ height: `${height * 4}px` }}>
        <div className={cn('rounded-full transition-all', barColor)} style={{ width: `${pct}%`, height: '100%' }} />
      </div>
      {showLabel && <p className="text-xs text-slate-500 mt-1 text-right font-medium">{pct}%</p>}
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
      <img
        src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=80&h=80&q=80&fit=crop"
        alt="loading"
        className="w-16 h-16 rounded-2xl object-cover shadow-lg animate-pulse"
      />
      <Spinner size="lg" />
      <p className="text-slate-500 text-sm font-medium">{text}</p>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-3xl' };
  if (user?.photoURL) {
    return (
      <img src={user.photoURL} alt={user.displayName || 'Avatar'}
        className={cn('rounded-full object-cover ring-2 ring-white shadow-sm', sizes[size])} />
    );
  }
  const initial = (user?.displayName || user?.email || 'U')[0].toUpperCase();
  return (
    <div className={cn('rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black ring-2 ring-white shadow-sm', sizes[size])}>
      {initial}
    </div>
  );
}

// ─── Info Row (profil, detail uchun) ──────────────────────────
export function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800 text-right max-w-[55%] truncate">{value || '—'}</span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, img }) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div className="flex items-center gap-3">
        {img && <img src={img} alt={title} className="w-10 h-10 rounded-xl object-cover" />}
        <div>
          <h1 className="text-2xl font-black text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
