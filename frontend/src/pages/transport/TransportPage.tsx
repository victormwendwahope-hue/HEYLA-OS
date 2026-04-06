import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useTransportStore } from '@/store/transportStore';
import { formatCurrency } from '@/utils/countries';
import { Truck, Users, Package, MapPin, Plus, X, AlertTriangle, Fuel, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

const tripData = [
  { month: 'Sep', trips: 42 }, { month: 'Oct', trips: 56 }, { month: 'Nov', trips: 48 },
  { month: 'Dec', trips: 61 }, { month: 'Jan', trips: 53 }, { month: 'Feb', trips: 67 },
];
const costData = [
  { month: 'Sep', fuel: 120000, maintenance: 45000 }, { month: 'Oct', fuel: 145000, maintenance: 30000 },
  { month: 'Nov', fuel: 135000, maintenance: 65000 }, { month: 'Dec', fuel: 160000, maintenance: 35000 },
  { month: 'Jan', fuel: 150000, maintenance: 50000 }, { month: 'Feb', fuel: 170000, maintenance: 40000 },
];
const statusColors = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(210, 90%, 55%)'];

const vehicleStatusVariant = (s: string) => {
  const m: Record<string, 'success' | 'warning' | 'info'> = { Active: 'success', Maintenance: 'warning', Idle: 'info' };
  return m[s] || 'info';
};
const shipmentStatusVariant = (s: string) => {
  const m: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'default'> = { Delivered: 'success', 'In Transit': 'info', 'Picked Up': 'warning', Pending: 'default', Cancelled: 'destructive' };
  return m[s] || 'default';
};

type Tab = 'overview' | 'fleet' | 'drivers' | 'shipments';

export default function TransportPage() {
  const { vehicles, drivers, shipments, addVehicle, addShipment, updateShipment } = useTransportStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [vForm, setVForm] = useState({ name: '', plate: '', type: 'Truck' as const, fuelType: 'Diesel' as const });
  const [sForm, setSForm] = useState({ origin: '', destination: '', weight: '', driver: '', vehicle: '' });

  const activeVehicles = vehicles.filter((v) => v.status === 'Active').length;
  const activeDrivers = drivers.filter((d) => d.status !== 'Off Duty').length;
  const inTransit = shipments.filter((s) => s.status === 'In Transit').length;
  const pieData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'Active').length },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'Maintenance').length },
    { name: 'Idle', value: vehicles.filter(v => v.status === 'Idle').length },
  ];

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vForm.name || !vForm.plate) { toast.error('Name and plate required'); return; }
    addVehicle({ id: Date.now().toString(), ...vForm, status: 'Idle', driver: '', mileage: 0, lastService: new Date().toISOString().split('T')[0] });
    setShowVehicleForm(false);
    setVForm({ name: '', plate: '', type: 'Truck', fuelType: 'Diesel' });
    toast.success('Vehicle added');
  };

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sForm.origin || !sForm.destination) { toast.error('Origin and destination required'); return; }
    addShipment({ id: Date.now().toString(), trackingNo: `SHP-${Date.now().toString().slice(-7)}`, ...sForm, status: 'Pending', estimatedDelivery: '', createdAt: new Date().toISOString().split('T')[0] });
    setShowShipmentForm(false);
    setSForm({ origin: '', destination: '', weight: '', driver: '', vehicle: '' });
    toast.success('Shipment created');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' }, { key: 'fleet', label: 'Fleet' },
    { key: 'drivers', label: 'Drivers' }, { key: 'shipments', label: 'Shipments' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transport & Logistics" description="Fleet management, deliveries, and route tracking">
        <button onClick={() => setShowShipmentForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Shipment
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Fleet Size" value={String(vehicles.length)} change={`${activeVehicles} active`} changeType="positive" icon={Truck} iconColor="gradient-primary" />
            <StatCard title="Drivers" value={String(drivers.length)} change={`${activeDrivers} on duty`} changeType="positive" icon={Users} />
            <StatCard title="In Transit" value={String(inTransit)} change="shipments moving" changeType="neutral" icon={Package} />
            <StatCard title="Monthly Cost" value={formatCurrency(210000)} change="+5% from last month" changeType="negative" icon={Fuel} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Monthly Trip Analytics</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tripData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="trips" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Fleet Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={statusColors[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[i] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="ml-auto font-medium">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Fuel & Maintenance Costs (KES)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Line type="monotone" dataKey="fuel" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="maintenance" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'fleet' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Vehicles ({vehicles.length})</h3>
            <button onClick={() => setShowVehicleForm(true)} className="text-sm text-primary font-medium hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Vehicle</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Vehicle', 'Plate', 'Type', 'Status', 'Driver', 'Mileage', 'Fuel'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.plate}</td>
                    <td className="px-4 py-3">{v.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} variant={vehicleStatusVariant(v.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{v.driver || '—'}</td>
                    <td className="px-4 py-3">{v.mileage.toLocaleString()} km</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.fuelType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'drivers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((d) => (
            <div key={d.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.phone}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={d.status} variant={d.status === 'Available' ? 'success' : d.status === 'On Trip' ? 'info' : 'default'} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Trips</span><span className="font-medium">{d.trips}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">⭐ {d.rating}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-mono text-xs">{d.license}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'shipments' && (
        <div className="space-y-4">
          {/* Timeline shipments */}
          {shipments.map((s) => (
            <div key={s.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold flex items-center gap-2">{s.trackingNo} <StatusBadge status={s.status} variant={shipmentStatusVariant(s.status)} /></p>
                  <p className="text-sm text-muted-foreground mt-1">{s.weight} • Created {s.createdAt}</p>
                </div>
                {s.status === 'Pending' && (
                  <button onClick={() => updateShipment(s.id, { status: 'Picked Up' })} className="text-sm text-primary font-medium hover:underline">Mark Picked Up</button>
                )}
                {s.status === 'Picked Up' && (
                  <button onClick={() => updateShipment(s.id, { status: 'In Transit' })} className="text-sm text-primary font-medium hover:underline">Mark In Transit</button>
                )}
                {s.status === 'In Transit' && (
                  <button onClick={() => { updateShipment(s.id, { status: 'Delivered' }); toast.success('Shipment delivered!'); }} className="text-sm text-success font-medium hover:underline">Mark Delivered</button>
                )}
              </div>
              {/* Route timeline */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{s.origin}</span>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-border relative">
                  {s.status === 'In Transit' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Truck className="w-4 h-4 text-primary animate-pulse" /></div>}
                  {s.status === 'Delivered' && <div className="absolute top-1/2 right-0 -translate-y-1/2"><Package className="w-4 h-4 text-success" /></div>}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <span>{s.destination}</span>
                </div>
              </div>
              {s.driver && <p className="text-xs text-muted-foreground mt-2">Driver: {s.driver} • Vehicle: {s.vehicle}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Add Vehicle</h2>
              <button onClick={() => setShowVehicleForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Name*</label>
                <input value={vForm.name} onChange={(e) => setVForm({ ...vForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Plate Number*</label>
                <input value={vForm.plate} onChange={(e) => setVForm({ ...vForm, plate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select value={vForm.type} onChange={(e) => setVForm({ ...vForm, type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Truck', 'Van', 'Motorcycle', 'Car'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Type</label>
                  <select value={vForm.fuelType} onChange={(e) => setVForm({ ...vForm, fuelType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Diesel', 'Petrol', 'Electric'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowVehicleForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      {showShipmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">New Shipment</h2>
              <button onClick={() => setShowShipmentForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddShipment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Origin*</label>
                  <input value={sForm.origin} onChange={(e) => setSForm({ ...sForm, origin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Destination*</label>
                  <input value={sForm.destination} onChange={(e) => setSForm({ ...sForm, destination: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Weight</label>
                <input value={sForm.weight} onChange={(e) => setSForm({ ...sForm, weight: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 500 kg" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowShipmentForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
