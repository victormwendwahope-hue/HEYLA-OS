import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Trip, TripStatus } from '@/modules/transport/types';

interface Props { open: boolean; onClose: () => void; }

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddTripDialog({ open, onClose }: Props) {
  const addTrip = useFleetStore((s) => s.addTrip);
  const vehicles = useFleetStore((s) => s.vehicles);
  const drivers = useFleetStore((s) => s.drivers);
  const trips = useFleetStore((s) => s.trips);
  const [form, setForm] = useState({
    vehicleId: '', driverId: '', origin: '', destination: '', distanceKm: '', revenue: '', loadWeightT: '', status: 'Pending',
  });

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      toast.error('Please fill vehicle, driver, origin, and destination');
      return;
    }
    const now = new Date();
    const t: Trip = {
      id: `trip-${Date.now()}`,
      reference: `TRP-${String(1000 + trips.length).padStart(4, '0')}`,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      status: form.status as TripStatus,
      distanceKm: Number(form.distanceKm) || 0,
      loadWeightT: Number(form.loadWeightT) || 0,
      revenue: Number(form.revenue) || 0,
      plannedDistanceKm: Number(form.distanceKm) || 0,
      actualCost: 0,
    };
    addTrip(t);
    toast.success(`Trip ${t.reference} dispatched`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Dispatch Trip</h2>
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
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Driver <span className="text-destructive">*</span></label>
              <select value={form.driverId} onChange={(e) => update('driverId', e.target.value)} className={inputCls}>
                <option value="">Select driver...</option>
                {drivers.filter((d) => d.status === 'Available').map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Origin <span className="text-destructive">*</span></label>
              <input type="text" value={form.origin} onChange={(e) => update('origin', e.target.value)} className={inputCls} placeholder="Nairobi" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination <span className="text-destructive">*</span></label>
              <input type="text" value={form.destination} onChange={(e) => update('destination', e.target.value)} className={inputCls} placeholder="Mombasa" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Distance (km)</label>
              <input type="number" value={form.distanceKm} onChange={(e) => update('distanceKm', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Load (t)</label>
              <input type="number" value={form.loadWeightT} onChange={(e) => update('loadWeightT', e.target.value)} className={inputCls} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Revenue (KES)</label>
              <input type="number" value={form.revenue} onChange={(e) => update('revenue', e.target.value)} className={inputCls} placeholder="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Dispatch Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
}