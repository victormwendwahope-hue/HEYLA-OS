import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { MaintenanceSchedule, MaintenanceType } from '@/modules/transport/types';

interface Props { open: boolean; onClose: () => void; }

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddMaintenanceDialog({ open, onClose }: Props) {
  const addMaintenance = useFleetStore((s) => s.addMaintenance);
  const vehicles = useFleetStore((s) => s.vehicles);
  const [form, setForm] = useState({
    vehicleId: '', type: 'Full Service', intervalKm: '', lastCompletedKm: '', costEstimate: '', assignedTo: '',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.type) {
      toast.error('Please select a vehicle and service type');
      return;
    }
    const interval = Number(form.intervalKm) || 5000;
    const lastKm = Number(form.lastCompletedKm) || 0;
    const today = new Date();
    const m: MaintenanceSchedule = {
      id: `m-${Date.now()}`,
      vehicleId: form.vehicleId,
      type: form.type as MaintenanceType,
      intervalKm: interval,
      lastCompletedKm: lastKm,
      lastCompletedDate: today.toISOString().split('T')[0],
      nextDueKm: lastKm + interval,
      nextDueDate: new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0],
      status: 'Due Soon',
      costEstimate: Number(form.costEstimate) || 0,
      assignedTo: form.assignedTo || 'Workshop',
    };
    addMaintenance(m);
    toast.success('Maintenance schedule added');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Log Service</h2>
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
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className={inputCls}>
                {['Oil Change', 'Filter', 'Brakes', 'Tyre Rotation', 'Full Service', 'Inspection', 'Coolant', 'Battery'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={(e) => update('assignedTo', e.target.value)} className={inputCls} placeholder="Technician" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Interval (km)</label>
              <input type="number" value={form.intervalKm} onChange={(e) => update('intervalKm', e.target.value)} className={inputCls} placeholder="5000" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Done (km)</label>
              <input type="number" value={form.lastCompletedKm} onChange={(e) => update('lastCompletedKm', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Est. Cost (KES)</label>
              <input type="number" value={form.costEstimate} onChange={(e) => update('costEstimate', e.target.value)} className={inputCls} placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Log Service</button>
          </div>
        </form>
      </div>
    </div>
  );
}