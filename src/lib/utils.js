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

export const timeSince = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds} soniya oldin`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
};

export const isOverdue = (ts, hours = 48) => {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return (Date.now() - d.getTime()) > hours * 60 * 60 * 1000;
};

export const generateBarcode = () => {
  const prefix = 'NK';
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}${year}${random}`;
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
