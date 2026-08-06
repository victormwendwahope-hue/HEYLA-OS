import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Tyre, TyrePosition } from '@/modules/transport/types';

interface Props { open: boolean; onClose: () => void; }

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddTyreDialog({ open, onClose }: Props) {
  const addTyre = useFleetStore((s) => s.addTyre);
  const vehicles = useFleetStore((s) => s.vehicles);
  const [form, setForm] = useState({
    vehicleId: '', brand: '', size: '', position: 'Front Left', serialNo: '', purchaseCost: '', initialTreadMm: '', currentTreadMm: '',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.brand || !form.size) {
      toast.error('Please select a vehicle and enter brand and size');
      return;
    }
    const tread = Number(form.initialTreadMm) || 16;
    const t: Tyre = {
      id: `tyre-${Date.now()}`,
      serialNo: form.serialNo.trim() || `TYR-${Date.now().toString().slice(-6)}`,
      brand: form.brand.trim(),
      size: form.size.trim(),
      vehicleId: form.vehicleId,
      position: form.position as TyrePosition,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: Number(form.purchaseCost) || 0,
      initialTreadMm: tread,
      currentTreadMm: Number(form.currentTreadMm) || tread,
      kmDriven: 0,
      status: 'Good',
      lastInspection: new Date().toISOString().split('T')[0],
    };
    addTyre(t);
    toast.success('Tyre added to fleet');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Fit Tyre</h2>
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
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Brand <span className="text-destructive">*</span></label>
              <input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} className={inputCls} placeholder="Michelin" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Size <span className="text-destructive">*</span></label>
              <input type="text" value={form.size} onChange={(e) => update('size', e.target.value)} className={inputCls} placeholder="315/80R22.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Position</label>
              <select value={form.position} onChange={(e) => update('position', e.target.value)} className={inputCls}>
                {['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Serial No</label>
              <input type="text" value={form.serialNo} onChange={(e) => update('serialNo', e.target.value)} className={inputCls} placeholder="Auto-generated if blank" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Purchase Cost (KES)</label>
              <input type="number" value={form.purchaseCost} onChange={(e) => update('purchaseCost', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Initial Tread (mm)</label>
              <input type="number" value={form.initialTreadMm} onChange={(e) => update('initialTreadMm', e.target.value)} className={inputCls} placeholder="16" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Tread (mm)</label>
              <input type="number" value={form.currentTreadMm} onChange={(e) => update('currentTreadMm', e.target.value)} className={inputCls} placeholder="16" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Fit Tyre</button>
          </div>
        </form>
      </div>
    </div>
  );
}