export const formatCurrency = (amount: number): string =>
  `KSh ${Math.round(amount).toLocaleString('en-KE')}`;

export const formatNumber = (n: number): string => n.toLocaleString('en-KE');

export const formatCompact = (n: number): string =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};

export const formatKm = (km: number): string => `${Math.round(km).toLocaleString('en-KE')} km`;

export const formatKpl = (kpl: number | null): string =>
  kpl == null ? '—' : `${kpl.toFixed(1)} km/L`;

export const formatHours = (h: number): string => `${Math.round(h * 10) / 10} h`;

export const timeAgo = (iso: string): string => {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
};

export const daysUntil = (iso: string): number => {
  if (!iso) return 999;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};
