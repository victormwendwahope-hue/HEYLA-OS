import { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { healthMeta, scoreMeta, initialsOf, avatarHue } from '@/modules/crm/utils/scoring';
import { HealthBand, Lead } from '@/modules/crm/types';
import { formatMoney } from '@/modules/crm/utils/format';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'default' | 'destructive';

export function Badge({ text, variant = 'default' }: { text: string; variant?: BadgeVariant }) {
  const styles: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-info/10 text-info border-info/20',
    default: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {text}
    </span>
  );
}

export function HealthBadge({ band, score }: { band: HealthBand; score: number }) {
  const meta = healthMeta[band];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${meta.text} ${meta.bg}`}>
      <span>{meta.emoji}</span>
      <span>{score}/100</span>
      <span className="text-xs font-medium opacity-80">{meta.label}</span>
    </span>
  );
}

export function LeadScoreBadge({ score, color }: { score: number; color: Lead['scoreColor'] }) {
  const meta = scoreMeta[color];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.text} ${meta.bg}`}>
      <span>{meta.emoji}</span>
      {score} · {meta.label}
    </span>
  );
}

export function Avatar({ name, color, size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const bg = color || avatarHue(name);
  const dim = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-sm';
  return (
    <span className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${dim}`} style={{ backgroundColor: bg }}>
      {initialsOf(name)}
    </span>
  );
}

export function Stat({ label, value, icon, accent = 'bg-primary/10' }: { label: string; value: ReactNode; icon?: ReactNode; accent?: string }) {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>}
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, actions, children, className }: {
  title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`glass rounded-xl ${className || ''}`}>
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children && <div className="p-5">{children}</div>}
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {label && <option value="">{label}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      className="px-3 py-2 rounded-lg border border-input bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">{message}</td>
    </tr>
  );
}

export function Money({ amount, currency = 'KES' }: { amount: number; currency?: string }) {
  return <span className="font-medium tabular-nums">{formatMoney(amount, currency)}</span>;
}

export function Bar({ pct, color = 'bg-primary' }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export { PageHeader };