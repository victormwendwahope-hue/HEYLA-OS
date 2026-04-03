import { useState } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Plus, Search, GripVertical } from 'lucide-react';

const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const;
const statusVariant = (s: string) => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'default'> = {
    New: 'info', Contacted: 'warning', Qualified: 'default', Proposal: 'warning', Won: 'success', Lost: 'destructive',
  };
  return map[s] || 'default';
};

export default function CRMPage() {
  const leads = useLeadStore((s) => s.leads);
  const [view, setView] = useState<'table' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');

  const filtered = leads.filter((l) => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="CRM" description={`${leads.length} leads in pipeline — ${formatCurrency(leads.reduce((s, l) => s + l.value, 0))} total value`}>
        <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['kanban', 'table'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {statusOrder.map((status) => {
            const items = filtered.filter((l) => l.status === status);
            return (
              <div key={status} className="min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={status} variant={statusVariant(status)} />
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} className="glass rounded-lg p-3 hover:shadow-elevated transition-shadow cursor-grab">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{l.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{l.company}</p>
                          <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(l.value)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Lead', 'Company', 'Status', 'Value', 'Source', 'Assigned'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.company}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} variant={statusVariant(l.status)} /></td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(l.value)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
