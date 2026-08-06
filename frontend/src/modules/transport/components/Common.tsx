import { ReactNode } from 'react';
import { HealthBand, bandMeta } from '@/modules/transport/utils/health';
import { VehicleStatus, WorkOrderStatus, DriverStatus, ComplianceSeverity, WorkOrderPriority } from '@/modules/transport/types';

export function HealthBadge({ band, score, size = 'md' }: { band: HealthBand; score: number; size?: 'sm' | 'md' | 'lg' }) {
  const meta = bandMeta[band];
  const px = size === 'lg' ? 'px-4 py-2' : size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const text = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px} ${text} ${meta.color} ${meta.bg}`}>
      <span>{meta.emoji}</span> {score}{size === 'lg' && <span className="text-xs font-medium opacity-80">{meta.label}</span>}
    </span>
  );
}

export function ScoreBar({ value, label }: { value: number; label: string }) {
  const color = value >= 90 ? 'bg-success' : value >= 70 ? 'bg-warning' : value >= 50 ? 'bg-orange-500' : 'bg-destructive';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, icon, accent }: { label: string; value: ReactNode; icon?: ReactNode; accent?: string }) {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && <div className={`p-3 rounded-xl ${accent || 'bg-primary/10'}`}>{icon}</div>}
      </div>
    </div>
  );
}

const vehicleStatusVariant: Record<VehicleStatus, 'success' | 'warning' | 'info' | 'destructive'> = {
  Active: 'success', Maintenance: 'warning', Idle: 'info', 'Out of Service': 'destructive',
};
const woVariant: Record<WorkOrderStatus, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Completed: 'success', 'In Progress': 'info', Open: 'warning', 'Waiting on Parts': 'warning', Cancelled: 'default',
};
const prioVariant: Record<WorkOrderPriority, 'success' | 'warning' | 'info' | 'destructive'> = {
  Low: 'success', Medium: 'info', High: 'warning', Critical: 'destructive',
};
const driverStatusVariant: Record<DriverStatus, 'success' | 'info' | 'default' | 'destructive'> = {
  Available: 'success', 'On Trip': 'info', 'Off Duty': 'default', Suspended: 'destructive',
};
const sevVariant: Record<ComplianceSeverity, 'success' | 'warning' | 'info' | 'destructive'> = {
  Low: 'success', Medium: 'info', High: 'warning', Critical: 'destructive',
};

export const statusVariantMap = {
  vehicle: vehicleStatusVariant,
  workOrder: woVariant,
  priority: prioVariant,
  driver: driverStatusVariant,
  severity: sevVariant,
};

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
      <div className="p-5">{children}</div>
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
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
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