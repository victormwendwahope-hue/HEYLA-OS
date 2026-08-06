import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '@/modules/transport/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddWorkOrderDialog({ open, onClose }: Props) {
  const addWorkOrder = useFleetStore((s) => s.addWorkOrder);
  const vehicles = useFleetStore((s) => s.vehicles);
  const workOrders = useFleetStore((s) => s.workOrders);
  const [form, setForm] = useState({
    vehicleId: '', title: '', description: '', priority: 'Medium', scheduledDate: '', laborCost: '', partsCost: '', assignedTo: '',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.title) {
      toast.error('Please select a vehicle and enter a title');
      return;
    }
    const v = vehicles.find((x) => x.id === form.vehicleId);
    const labor = Number(form.laborCost) || 0;
    const parts = Number(form.partsCost) || 0;
    const reference = `WO-${String(1000 + workOrders.length).padStart(4, '0')}`;
    const wo: WorkOrder = {
      id: `wo-${Date.now()}`,
      reference,
      vehicleId: form.vehicleId,
      title: form.title.trim(),
      description: form.description.trim(),
      status: 'Open',
      priority: form.priority as WorkOrderPriority,
      createdDate: new Date().toISOString().split('T')[0],
      scheduledDate: form.scheduledDate || new Date().toISOString().split('T')[0],
      assignedTo: form.assignedTo || (v?.name || 'Workshop'),
      laborCost: labor,
      partsCost: parts,
      totalCost: labor + parts,
      parts: [],
    };
    addWorkOrder(wo);
    toast.success(`${wo.reference} — work order created`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">New Work Order</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle <span className="text-destructive">*</span></label>
              <select value={form.vehicleId} onChange={(e) => update('vehicleId', e.target.value)} className={inputCls}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.plate}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title <span className="text-destructive">*</span></label>
              <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputCls} placeholder="e.g. Engine oil leak repair" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className={inputCls} placeholder="Describe the work needed..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => update('priority', e.target.value)} className={inputCls}>
                {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Scheduled Date</label>
              <input type="date" value={form.scheduledDate} onChange={(e) => update('scheduledDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Labor Cost (KES)</label>
              <input type="number" value={form.laborCost} onChange={(e) => update('laborCost', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Parts Cost (KES)</label>
              <input type="number" value={form.partsCost} onChange={(e) => update('partsCost', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)} className={inputCls} placeholder="Technician name" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Create Work Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}