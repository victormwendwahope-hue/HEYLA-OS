import { RiskBand, Likelihood, Severity, IncidentType, IncidentSeverity, Hazard } from '@/modules/ehs/types';

export function formatMoney(amount: number, currency = 'KES'): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `KES ${Math.round(amount).toLocaleString('en')}`;
  }
}

export function formatCompact(n: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en');
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function timeAgo(iso: string): string {
  if (!iso) return '—';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function daysUntil(iso: string): number {
  if (!iso) return 9999;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function addMonths(date: Date, m: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function initialsOf(name: string): string {
  return name.split(' ').map((p) => p[0] || '').join('').slice(0, 2).toUpperCase();
}

export function avatarHue(seed: string): string {
  const colors = ['#0A66FF', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2', '#DC2626', '#6D28D9'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return colors[h % colors.length];
}

// ---- Risk scoring ----
export const LIKELIHOODS: { label: string; value: Likelihood }[] = [
  { label: 'Rare', value: 1 },
  { label: 'Unlikely', value: 2 },
  { label: 'Possible', value: 3 },
  { label: 'Likely', value: 4 },
  { label: 'Almost Certain', value: 5 },
];

export const SEVERITIES: { label: string; value: Severity }[] = [
  { label: 'Insignificant', value: 1 },
  { label: 'Minor', value: 2 },
  { label: 'Moderate', value: 3 },
  { label: 'Major', value: 4 },
  { label: 'Catastrophic', value: 5 },
];

export function riskScore(likelihood: Likelihood, severity: Severity): number {
  return likelihood * severity;
}

export function riskBandOf(score: number): RiskBand {
  if (score >= 15) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export const riskMeta: Record<RiskBand, { label: string; emoji: string; text: string; bg: string; bar: string }> = {
  low: { label: 'Low', emoji: '🟢', text: 'text-success', bg: 'bg-success/10', bar: 'bg-success' },
  medium: { label: 'Medium', emoji: '🟡', text: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning' },
  high: { label: 'High', emoji: '🟠', text: 'text-orange-500', bg: 'bg-orange-500/10', bar: 'bg-orange-500' },
  critical: { label: 'Critical', emoji: '🔴', text: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' },
};

export function riskColor(band: RiskBand): string {
  return { low: '#16A34A', medium: '#F59E0B', high: '#F97316', critical: '#DC2626' }[band];
}

export const incidentTypeMeta: Record<IncidentType, { severity: IncidentSeverity; emoji: string }> = {
  Fatality: { severity: 'Critical', emoji: '🖤' },
  'Lost Time Injury': { severity: 'High', emoji: '🚑' },
  'Medical Treatment Injury': { severity: 'High', emoji: '🏥' },
  'First Aid Case': { severity: 'Medium', emoji: '🩹' },
  'Near Miss': { severity: 'Low', emoji: '⚠️' },
  'Unsafe Condition': { severity: 'Medium', emoji: '🚧' },
  'Unsafe Act': { severity: 'Medium', emoji: '🛑' },
  'Property Damage': { severity: 'Medium', emoji: '🏚️' },
  'Vehicle Accident': { severity: 'High', emoji: '🚗' },
  'Environmental Spill': { severity: 'Medium', emoji: '🛢️' },
  'Fire Incident': { severity: 'High', emoji: '🔥' },
  'Security Incident': { severity: 'Medium', emoji: '🚨' },
  'Occupational Illness': { severity: 'High', emoji: '🤒' },
};

export function severityVariant(s: IncidentSeverity): 'success' | 'warning' | 'info' | 'destructive' | 'default' {
  return s === 'Critical' ? 'destructive' : s === 'High' ? 'warning' : s === 'Medium' ? 'info' : 'default';
}

// ---- KPI calculations ----
export function ltifr(lostTimeInjuries: number, hoursWorked: number): number {
  return hoursWorked ? (lostTimeInjuries * 1000000) / hoursWorked : 0;
}

export function trifr(totalRecordable: number, hoursWorked: number): number {
  return hoursWorked ? (totalRecordable * 1000000) / hoursWorked : 0;
}

export function nearMissRatio(nearMisses: number, totalIncidents: number): number {
  return totalIncidents ? (nearMisses / totalIncidents) * 100 : 0;
}

// Compliance score: Training 25 + Inspections 25 + PPE 20 + Corrective actions 20 + Permits 10
export function complianceScore(inputs: {
  trainingPct: number; inspectionPct: number; ppePct: number; correctivePct: number; permitPct: number;
}): number {
  return Math.round(
    inputs.trainingPct * 0.25 +
    inputs.inspectionPct * 0.25 +
    inputs.ppePct * 0.20 +
    inputs.correctivePct * 0.20 +
    inputs.permitPct * 0.10,
  );
}

export function pct(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}
