import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Vehicle, VehicleType, VehicleStatus, FuelType } from '@/modules/transport/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddVehicleDialog({ open, onClose }: Props) {
  const addVehicle = useFleetStore((s) => s.addVehicle);
  const [form, setForm] = useState({
    name: '', plate: '', type: 'Truck', status: 'Active', driverId: '',
    mileage: '', fuelType: 'Diesel', tankCapacity: '', costPerKm: '', depot: '', nextServiceKm: '',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.plate) {
      toast.error('Please enter a vehicle name and plate number');
      return;
    }
    const vehicle: Vehicle = {
      id: `v-${Date.now()}`,
      name: form.name.trim(),
      plate: form.plate.trim().toUpperCase(),
      type: form.type as VehicleType,
      status: form.status as VehicleStatus,
      driverId: form.driverId || '',
      mileage: Number(form.mileage) || 0,
      fuelType: form.fuelType as FuelType,
      tankCapacity: Number(form.tankCapacity) || 0,
      costPerKm: Number(form.costPerKm) || 0,
      depot: form.depot || 'Embakasi',
      nextServiceKm: Number(form.nextServiceKm) || 5000,
      lastService: new Date().toISOString().split('T')[0],
      acquisitionDate: new Date().toISOString().split('T')[0],
    };
    addVehicle(vehicle);
    toast.success(`${vehicle.name} (${vehicle.plate}) added to fleet`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Add New Vehicle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Name <span className="text-destructive">*</span></label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="e.g. Scania R450" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Plate <span className="text-destructive">*</span></label>
              <input type="text" value={form.plate} onChange={(e) => update('plate', e.target.value)} className={inputCls} placeholder="KBX 1234" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Depot</label>
              <input type="text" value={form.depot} onChange={(e) => update('depot', e.target.value)} className={inputCls} placeholder="Embassy" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className={inputCls}>
                {['Truck', 'Pickup', 'Van', 'Excavator', 'Car', 'Motorcycle'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
                {['Active', 'Maintenance', 'Idle', 'Out of Service'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Type</label>
              <select value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)} className={inputCls}>
                {['Diesel', 'Petrol', 'Electric'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tank Capacity (L)</label>
              <input type="number" value={form.tankCapacity} onChange={(e) => update('tankCapacity', e.target.value)} className={inputCls} placeholder="300" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mileage (km)</label>
              <input type="number" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cost / km</label>
              <input type="number" value={form.costPerKm} onChange={(e) => update('costPerKm', e.target.value)} className={inputCls} placeholder="45" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Next Service (km)</label>
              <input type="number" value={form.nextServiceKm} onChange={(e) => update('nextServiceKm', e.target.value)} className={inputCls} placeholder="5000" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Vehicle</button>
          </div>
        </form>
      </div>
    </div>
  );
}