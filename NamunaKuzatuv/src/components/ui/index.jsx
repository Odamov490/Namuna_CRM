import { cn } from '../../lib/utils.js';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, loading, icon, ...props }) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
    'transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
    'select-none whitespace-nowrap',
  ].join(' ');

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    ghost:     'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400 shadow-sm',
    outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500',
    'outline-danger': 'border-2 border-red-500 text-red-600 hover:bg-red-50 focus-visible:ring-red-400',
    google:    'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 bg-white shadow-sm',
  };
  const sizes = {
    xs:   'text-xs px-2.5 py-1.5 gap-1',
    sm:   'text-sm px-3 py-1.5',
    md:   'text-sm px-4 py-2',
    lg:   'text-base px-5 py-2.5',
    xl:   'text-base px-6 py-3',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, icon, className, hint, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          className={cn(
            'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            error
              ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
              : 'border-slate-200 focus:ring-blue-500 hover:border-slate-300',
            icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900',
          'transition-all duration-150 cursor-pointer appearance-none',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 focus:ring-blue-500 hover:border-slate-300',
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '20px', paddingRight: '36px' }}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {error}</span>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────
export function Textarea({ label, error, className, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900',
          'placeholder:text-slate-400 resize-none transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-slate-200 focus:ring-blue-500 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {error}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, className, hover, onClick, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-card',
        hover && 'card-hover',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = 'blue', size = 'sm', className }) {
  const colors = {
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    gray:   'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
    orange: 'bg-orange-100 text-orange-700',
    teal:   'bg-teal-100 text-teal-700',
  };
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-semibold', colors[color] || colors.gray, sizes[size], className)}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return <Loader2 className={cn('animate-spin text-blue-600', sizes[size], className)} />;
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-modal w-full flex flex-col max-h-[90vh] animate-scale-in', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts?.length) return null;

  const config = {
    success: { icon: CheckCircle,    bg: 'bg-emerald-600', ring: 'ring-emerald-700' },
    error:   { icon: AlertCircle,    bg: 'bg-red-600',     ring: 'ring-red-700' },
    warning: { icon: AlertTriangle,  bg: 'bg-amber-500',   ring: 'ring-amber-600' },
    info:    { icon: Info,           bg: 'bg-blue-600',    ring: 'ring-blue-700' },
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const c = config[t.type] || config.info;
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={cn(
              'text-white px-4 py-3 rounded-xl shadow-toast text-sm font-medium',
              'flex items-center gap-3 animate-slide-in pointer-events-auto',
              c.bg
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{t.msg}</span>
            <button
              onClick={() => onDismiss?.(t.id)}
              className="opacity-70 hover:opacity-100 transition-opacity ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="text-5xl mb-4 opacity-60">{icon || '📭'}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mb-5 max-w-xs leading-relaxed">{subtitle}</p>}
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, trend, color = 'blue' }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600' },
    green:  { bg: 'bg-green-50',   icon: 'text-green-600' },
    red:    { bg: 'bg-red-50',     icon: 'text-red-600' },
    yellow: { bg: 'bg-yellow-50',  icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50',  icon: 'text-purple-600' },
    gray:   { bg: 'bg-slate-50',   icon: 'text-slate-500' },
    teal:   { bg: 'bg-teal-50',    icon: 'text-teal-600' },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0', c.bg)}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ value, max = 100, showLabel = true, height = 2, className }) {
  const pct      = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-slate-100 rounded-full" style={{ height: `${height * 4}px` }}>
        <div
          className={cn('rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%`, height: '100%' }}
        />
      </div>
      {showLabel && <p className="text-xs text-slate-500 mt-1 text-right font-medium">{pct}%</p>}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Ha, tasdiqlash', confirmVariant = 'danger', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-600 leading-relaxed">{message}</p>
      <div className="flex gap-3 justify-end mt-6">
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
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-lg">
        🔬
      </div>
      <Spinner size="xl" />
      <p className="text-slate-500 text-sm font-medium">{text}</p>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ user, size = 'md' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-3xl' };
  if (user?.photoURL) {
    return <img src={user.photoURL} alt={user.displayName || 'Avatar'} className={cn('rounded-full object-cover ring-2 ring-white shadow-sm', sizes[size])} />;
  }
  const initial = (user?.displayName || user?.email || 'U')[0].toUpperCase();
  return (
    <div className={cn('rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold ring-2 ring-white shadow-sm', sizes[size])}>
      {initial}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────
export function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 gap-4">
      <span className="text-sm text-slate-500 flex items-center gap-1.5 flex-shrink-0">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800 text-right truncate max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start sm:items-center justify-between mb-6 gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────
import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'Qidirish...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-all"
      />
    </div>
  );
}

// ─── Filter chip ──────────────────────────────────────────────
export function FilterChip({ active, children, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500')}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex border-b border-slate-100', className)}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            active === t.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
          )}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.label}
          {t.badge !== undefined && (
            <span className={cn('text-xs rounded-full px-1.5 py-0.5 font-bold', active === t.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
      <div className="skeleton h-5 w-1/3 rounded-lg" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded-lg', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
          <div className="skeleton h-11 w-11 rounded-xl" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="skeleton h-8 w-1/3 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Alert Banner (inline) ────────────────────────────────────
export function AlertBanner({ type = 'info', message, onDismiss }) {
  const config = {
    info:    { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',   icon: Info },
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800',  icon: CheckCircle },
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800',  icon: AlertTriangle },
    error:   { bg: 'bg-red-50 border-red-200',     text: 'text-red-800',    icon: AlertCircle },
  };
  const c = config[type] || config.info;
  const Icon = c.icon;
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-xl border', c.bg, c.text)}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
