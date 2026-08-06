import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Wrench, CircleDollarSign, PackageOpen, Gauge, ChevronRight, AlertCircle } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, statusVariantMap } from '@/modules/transport/components/Common';
import AddWorkOrderDialog from '@/modules/transport/components/AddWorkOrderDialog';
import { formatCurrency, formatDate } from '@/modules/transport/utils/format';

export default function WorkshopPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioFilter, setPrioFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  const wos = useMemo(() => [...store.workOrders].sort((a, b) => b.createdDate.localeCompare(a.createdDate)), [store.workOrders]);

  const filtered = wos.filter((w) => {
    if (statusFilter && w.status !== statusFilter) return false;
    if (prioFilter && w.priority !== prioFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const v = store.vehicles.find((x) => x.id === w.vehicleId);
      return [w.reference, w.title, w.assignedTo, v?.name, v?.plate].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const openCount = wos.filter((w) => w.status === 'Open' || w.status === 'In Progress').length;
  const awaiting = wos.filter((w) => w.status === 'Waiting on Parts').length;
  const partsCost = wos.reduce((a, w) => a + w.partsCost, 0);
  const laborCost = wos.reduce((a, w) => a + w.laborCost, 0);
  const critical = wos.filter((w) => w.priority === 'Critical' && w.status !== 'Completed').length;

  const lowStock = store.spareParts.filter((p) => p.quantityOnHand <= p.reorderLevel);

  const selected = filtered.find((w) => w.id === selectedId) || null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Workshop & Work Orders" description="Repair lifecycle, part usage, and technician workload">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">New Work Order</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Work Orders" value={String(openCount)} change={`${critical} critical priority`} changeType={critical ? 'negative' : 'positive'} icon={Wrench} />
        <StatCard title="Awaiting Parts" value={String(awaiting)} change="blocked on stock" changeType={awaiting ? 'warning' : 'neutral'} icon={PackageOpen} />
        <StatCard title="Parts Spend" value={formatCurrency(partsCost)} change="all work orders" changeType="neutral" icon={CircleDollarSign} />
        <StatCard title="Labor Spend" value={formatCurrency(laborCost)} change="shop labor" changeType="neutral" icon={Gauge} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionCard title={`Work Orders (${filtered.length})`}
            actions={
              <>
                <FilterSelect value={prioFilter} onChange={setPrioFilter} label="All priorities"
                  options={['Low', 'Medium', 'High', 'Critical'].map((p) => ({ value: p, label: p }))} />
                <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
                  options={['Open', 'In Progress', 'Waiting on Parts', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: s }))} />
                <SearchInput value={search} onChange={setSearch} placeholder="Search ref, vehicle..." />
              </>
            }>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Ref', 'Title', 'Vehicle', 'Priority', 'Status', 'Cost', ''].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.length ? filtered.map((w) => {
                    const v = store.vehicles.find((x) => x.id === w.vehicleId);
                    return (
                      <tr key={w.id} onClick={() => setSelectedId(w.id === selectedId ? null : w.id)}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                        <td className="px-3 py-3 font-mono text-xs">{w.reference}</td>
                        <td className="px-3 py-3 font-medium">{w.title}</td>
                        <td className="px-3 py-3 text-muted-foreground">{v?.name} <span className="font-mono text-xs">({v?.plate})</span></td>
                        <td className="px-3 py-3"><Badge text={w.priority} variant={statusVariantMap.priority[w.priority]} /></td>
                        <td className="px-3 py-3"><Badge text={w.status} variant={statusVariantMap.workOrder[w.status]} /></td>
                        <td className="px-3 py-3 font-medium">{formatCurrency(w.totalCost)}</td>
                        <td className="px-3 py-3"><ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedId === w.id ? 'rotate-90' : ''}`} /></td>
                      </tr>
                    );
                  }) : <EmptyRow colSpan={7} message="No work orders match the filters." />}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {selected && (
            <SectionCard title={`${selected.reference} — ${selected.title}`} subtitle={`Created ${formatDate(selected.createdDate)} · Assigned to ${selected.assignedTo}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{selected.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Labor</p>
                      <p className="font-semibold">{formatCurrency(selected.laborCost)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Parts</p>
                      <p className="font-semibold">{formatCurrency(selected.partsCost)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">{formatCurrency(selected.totalCost)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                      <p className="font-semibold">{formatDate(selected.scheduledDate)}</p>
                    </div>
                  </div>
                  {selected.parts.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Parts Used</p>
                      {selected.parts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                          <span>{p.partName} × {p.quantity}</span>
                          <span className="font-medium">{formatCurrency(p.totalCost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border p-4 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Timeline</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(selected.createdDate)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span>{formatDate(selected.scheduledDate)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span>{selected.completedDate ? formatDate(selected.completedDate) : '—'}</span></div>
                    <div className="pt-2 border-t border-border space-y-2">
                      <div className="flex gap-2">
                        {selected.status !== 'Completed' && (
                          <button
                            onClick={() => store.updateWorkOrder({ ...selected, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] })}
                            className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20">
                            Mark Complete
                          </button>
                        )}
                        {selected.status === 'Completed' && (
                          <button
                            onClick={() => store.updateWorkOrder({ ...selected, status: 'Open', completedDate: undefined })}
                            className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/60">
                            Reopen
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button
                          onClick={() => {
                            if (!noteDraft.trim()) return;
                            store.updateWorkOrder({ ...selected, notes: [selected.notes, noteDraft.trim()].filter(Boolean).join('\n') });
                            setNoteDraft('');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                          Add Note
                        </button>
                      </div>
                      {selected.notes && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap border-t border-border pt-2">{selected.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Low Stock Parts">
            {lowStock.length ? (
              <div className="space-y-3">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0"><AlertCircle className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku} · {p.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-warning">{p.quantityOnHand}</p>
                      <p className="text-xs text-muted-foreground">reorder {p.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground py-6 text-center">All parts above reorder level.</p>}
          </SectionCard>
          <SectionCard title="Spare Parts Inventory">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {store.spareParts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(p.unitCost)}</p>
                  </div>
                  <span className={`font-bold ${p.quantityOnHand <= p.reorderLevel ? 'text-warning' : 'text-muted-foreground'}`}>{p.quantityOnHand}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <AddWorkOrderDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}