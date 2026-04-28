import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...args) => twMerge(clsx(args));

export const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDateShort = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateInput = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toISOString().split('T')[0];
};

export const timeSince = (ts) => {
  if (!ts) return '—';
  const d       = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60)   return `${seconds} soniya oldin`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)   return `${minutes} daqiqa oldin`;
  const hours   = Math.floor(minutes / 60);
  if (hours < 24)     return `${hours} soat oldin`;
  const days    = Math.floor(hours / 24);
  if (days < 30)      return `${days} kun oldin`;
  const months  = Math.floor(days / 30);
  if (months < 12)    return `${months} oy oldin`;
  return `${Math.floor(months / 12)} yil oldin`;
};

export const timeUntil = (ts, hours = 48) => {
  if (!ts) return null;
  const d        = ts.toDate ? ts.toDate() : new Date(ts);
  const deadline = new Date(d.getTime() + hours * 60 * 60 * 1000);
  const diff     = deadline.getTime() - Date.now();
  if (diff <= 0)  return { overdue: true, text: "Muddati o'tgan" };
  const h = Math.floor(diff / (60 * 60 * 1000));
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return { overdue: false, text: `${h}s ${m}d qoldi`, hours: h };
};

export const isOverdue = (ts, hours = 48) => {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return (Date.now() - d.getTime()) > hours * 60 * 60 * 1000;
};

export const generateBarcode = () => {
  const prefix = 'NK';
  const year   = new Date().getFullYear().toString().slice(-2);
  const month  = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${year}${month}${random}`;
};

export const getLoadPercent = (current, capacity) => {
  if (!capacity) return 0;
  return Math.min(100, Math.round((current / capacity) * 100));
};

export const getLoadColor = (percent) => {
  if (percent >= 90) return 'text-red-600 bg-red-100';
  if (percent >= 70) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

export const getLoadBarColor = (percent) => {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 70) return 'bg-yellow-400';
  return 'bg-green-500';
};

// CSV eksport
export const exportToCSV = (data, filename = 'hisobot') => {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows    = data.map(row =>
    headers.map(h => {
      const v = row[h];
      if (v === null || v === undefined) return '';
      const str = String(v);
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}_${formatDateShort(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Foiz hisoblash
export const calcPercent = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

// Firebase xato xabarlarini o'zbekchalashtirish
export const firebaseErrorMsg = (code) => {
  const map = {
    'auth/user-not-found':        "Email yoki parol noto'g'ri",
    'auth/wrong-password':        "Email yoki parol noto'g'ri",
    'auth/email-already-in-use':  "Bu email allaqachon ro'yxatdan o'tgan",
    'auth/weak-password':         "Parol kamida 6 belgi bo'lishi kerak",
    'auth/invalid-email':         "Email formati noto'g'ri",
    'auth/too-many-requests':     "Juda ko'p urinish. Keyinroq qayta urinib ko'ring",
    'auth/popup-closed-by-user':  "Google kirish oynasi yopildi",
    'auth/network-request-failed':"Internet aloqasi yo'q",
    'permission-denied':          "Ruxsat yo'q",
  };
  return map[code] || "Noma'lum xato yuz berdi";
};

// Avatar rangi (initials uchun)
export const getAvatarColor = (name = '') => {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-purple-700',
    'from-emerald-500 to-green-700',
    'from-rose-500 to-red-700',
    'from-amber-500 to-orange-700',
    'from-cyan-500 to-teal-700',
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
};

// Barcode validatsiya
export const isValidBarcode = (barcode) => {
  return /^NK\d{9,}$/.test(barcode?.trim() || '');
};
