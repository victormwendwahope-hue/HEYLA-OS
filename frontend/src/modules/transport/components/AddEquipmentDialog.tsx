import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { HeavyEquipment, EquipmentCategory, FuelType } from '@/modules/transport/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddEquipmentDialog({ open, onClose }: Props) {
  const addEquipment = useFleetStore((s) => s.addEquipment);
  const [form, setForm] = useState({
    name: '', model: '', category: 'Excavator', serialNo: '', engineHours: '',
    hourlyRate: '', purchaseCost: '', depot: '', fuelType: 'Diesel', tankCapacity: '',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.model || !form.serialNo) {
      toast.error('Please fill name, model, and serial number');
      return;
    }
    const equipment: HeavyEquipment = {
      id: `eq-${Date.now()}`,
      name: form.name.trim(),
      model: form.model.trim(),
      category: form.category as EquipmentCategory,
      serialNo: form.serialNo.trim().toUpperCase(),
      engineHours: Number(form.engineHours) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      fuelType: form.fuelType as FuelType,
      tankCapacity: Number(form.tankCapacity) || 0,
      status: 'Available',
      depot: form.depot || 'Embakasi',
      lastService: new Date().toISOString().split('T')[0],
      acquisitionDate: new Date().toISOString().split('T')[0],
      purchaseCost: Number(form.purchaseCost) || 0,
      operatorId: '',
    };
    addEquipment(equipment);
    toast.success(`${equipment.name} added to heavy equipment`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Add Heavy Equipment</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Equipment Name <span className="text-destructive">*</span></label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="e.g. Caterpillar 320" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Model <span className="text-destructive">*</span></label>
              <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)} className={inputCls} placeholder="CAT 320D2" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Serial No <span className="text-destructive">*</span></label>
              <input type="text" value={form.serialNo} onChange={(e) => update('serialNo', e.target.value)} className={inputCls} placeholder="CAT320D2026" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputCls}>
                {['Excavator', 'Loader', 'Crane', 'Forklift', 'Grader', 'Dozer', 'Compactor'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Depot</label>
              <input type="text" value={form.depot} onChange={(e) => update('depot', e.target.value)} className={inputCls} placeholder="Embakasi" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Type</label>
              <select value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)} className={inputCls}>
                {['Diesel', 'Petrol', 'Electric'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tank Capacity (L)</label>
              <input type="number" value={form.tankCapacity} onChange={(e) => update('tankCapacity', e.target.value)} className={inputCls} placeholder="400" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Engine Hours</label>
              <input type="number" value={form.engineHours} onChange={(e) => update('engineHours', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Hourly Rate (KES)</label>
              <input type="number" value={form.hourlyRate} onChange={(e) => update('hourlyRate', e.target.value)} className={inputCls} placeholder="6500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Purchase Cost (KES)</label>
              <input type="number" value={form.purchaseCost} onChange={(e) => update('purchaseCost', e.target.value)} className={inputCls} placeholder="8500000" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Equipment</button>
          </div>
        </form>
      </div>
    </div>
  );
}