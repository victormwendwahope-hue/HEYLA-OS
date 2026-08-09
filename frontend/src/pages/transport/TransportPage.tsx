import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useTransportStore, type Vehicle, type Driver, type Shipment } from '@/store/transportStore';
import { useFuelStore } from '@/store/fuelStore';
import { formatCurrency } from '@/utils/countries';
import { Truck, Users, Package, MapPin, Plus, X, AlertTriangle, Fuel, BarChart3, Trash2, Edit3, Search, Loader2, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

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
  const { vehicles, drivers, shipments, loading, fetchVehicles, fetchDrivers, fetchShipments, addVehicle, updateVehicle, removeVehicle, addDriver, updateDriver, removeDriver, addShipment, updateShipment, removeShipment } = useTransportStore();
  const { analytics, fetchAnalytics } = useFuelStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editDriverId, setEditDriverId] = useState<string | null>(null);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [editingShip, setEditingShip] = useState<string | null>(null);
  const [shipSearch, setShipSearch] = useState('');
  const [shipStatus, setShipStatus] = useState('');

  useEffect(() => { fetchVehicles(); fetchDrivers(); fetchShipments(); fetchAnalytics(); }, []);

  const [vForm, setVForm] = useState({ name: '', plate: '', type: 'Truck' as string, status: 'Idle' as string, driver: '', mileage: 0, fuelType: 'Diesel' as string, tankCapacity: 0, lastService: '' });
  const [dForm, setDForm] = useState({ name: '', phone: '', license: '', status: 'Available' as string, trips: 0, rating: 0 });
  const [sForm, setSForm] = useState({ trackingNo: '', origin: '', destination: '', status: 'Pending' as string, driver: '', vehicle: '', weight: '', estimatedDelivery: '' });

  const activeVehicles = vehicles.filter((v) => v.status === 'Active').length;
  const activeDrivers = drivers.filter((d) => d.status !== 'Off Duty').length;
  const inTransit = shipments.filter((s) => s.status === 'In Transit').length;

  const monthlyData = shipments.reduce((acc: Record<string, { delivered: number; created: number; cost: number }>, s) => {
    const month = (s.createdAt || '').slice(0, 7);
    if (!month) return acc;
    if (!acc[month]) acc[month] = { delivered: 0, created: 0, cost: 0 };
    acc[month].created++;
    if (s.status === 'Delivered') acc[month].delivered++;
    return acc;
  }, {});
  const tripData = Object.entries(monthlyData).sort().slice(-6).map(([month, d]) => ({
    month: month.slice(5), delivered: d.delivered, created: d.created,
  }));
  const pieData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'Active').length },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'Maintenance').length },
    { name: 'Idle', value: vehicles.filter(v => v.status === 'Idle').length },
  ];

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      if (shipStatus && s.status !== shipStatus) return false;
      if (!shipSearch) return true;
      const q = shipSearch.toLowerCase();
      return [s.trackingNo, s.origin, s.destination, s.driver, s.vehicle].join(' ').toLowerCase().includes(q);
    }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [shipments, shipSearch, shipStatus]);

  const fuelSpend = analytics?.summary?.totalCost || 0;
  const fuelAnomalies = analytics?.summary?.anomalyCount || 0;

  const openVehicleForm = (v?: any) => {
    if (v) { setVForm({ name: v.name, plate: v.plate, type: v.type, status: v.status, driver: v.driver || '', mileage: v.mileage, fuelType: v.fuelType, tankCapacity: v.tankCapacity || 0, lastService: v.lastService || '' }); setEditVehicleId(v.id); }
    else { setVForm({ name: '', plate: '', type: 'Truck', status: 'Idle', driver: '', mileage: 0, fuelType: 'Diesel', tankCapacity: 0, lastService: '' }); setEditVehicleId(null); }
    setShowVehicleForm(true);
  };
  const openDriverForm = (d?: any) => {
    if (d) { setDForm({ name: d.name, phone: d.phone, license: d.license, status: d.status, trips: d.trips, rating: d.rating }); setEditDriverId(d.id); }
    else { setDForm({ name: '', phone: '', license: '', status: 'Available', trips: 0, rating: 0 }); setEditDriverId(null); }
    setShowDriverForm(true);
  };
  const openShipmentForm = (s?: any) => {
    if (s) { setSForm({ trackingNo: s.trackingNo, origin: s.origin, destination: s.destination, status: s.status, driver: s.driver || '', vehicle: s.vehicle || '', weight: s.weight || '', estimatedDelivery: s.estimatedDelivery || '' }); setEditingShip(s.id); }
    else { setSForm({ trackingNo: `SHP-${Date.now().toString().slice(-7)}`, origin: '', destination: '', status: 'Pending', driver: '', vehicle: '', weight: '', estimatedDelivery: '' }); setEditingShip(null); }
    setShowShipmentForm(true);
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vForm.name || !vForm.plate) { toast.error('Name and plate required'); return; }
    try {
      if (editVehicleId) await updateVehicle(editVehicleId, { ...vForm, type: vForm.type as Vehicle['type'], status: vForm.status as Vehicle['status'], fuelType: vForm.fuelType as Vehicle['fuelType'] });
      else await addVehicle({ ...vForm, type: vForm.type as Vehicle['type'], status: vForm.status as Vehicle['status'], fuelType: vForm.fuelType as Vehicle['fuelType'] });
      setShowVehicleForm(false);
    } catch { }
  };  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dForm.name) { toast.error('Driver name required'); return; }
    try {
      if (editDriverId) await updateDriver(editDriverId, { ...dForm, status: dForm.status as Driver['status'] });
      else await addDriver({ ...dForm, status: dForm.status as Driver['status'] });
      setShowDriverForm(false);
    } catch { }
  };
  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sForm.origin || !sForm.destination) { toast.error('Origin and destination required'); return; }
    try {
      if (editingShip) await updateShipment(editingShip, { ...sForm, status: sForm.status as Shipment['status'] });
      else await addShipment({ ...sForm, status: sForm.status as Shipment['status'] });
      setShowShipmentForm(false);
    } catch { }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' }, { key: 'fleet', label: 'Fleet' },
    { key: 'drivers', label: 'Drivers' }, { key: 'shipments', label: 'Shipments' },
  ];

  if (loading && vehicles.length === 0 && drivers.length === 0 && shipments.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading transport data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transport & Logistics" description="Fleet management, deliveries, and route tracking">
        <div className="flex gap-2">
          <button onClick={() => openShipmentForm()} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Shipment
          </button>
        </div>
      </PageHeader>

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
            <StatCard title="Fuel Spend" value={fuelSpend ? formatCurrency(fuelSpend) : '—'} change={fuelAnomalies ? `${fuelAnomalies} anomalies flagged` : 'No anomalies'} changeType={fuelAnomalies ? 'negative' : 'positive'} icon={Fuel} />
          </div>
          {fuelAnomalies > 0 && (
            <div className="glass rounded-xl p-4 border-l-4 border-warning flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-warning">{fuelAnomalies} fuel anomalies</span> detected across the fleet (over-capacity fills, odometer gaps, variance).{' '}
                <button onClick={() => navigate({ to: '/fuel' })} className="text-primary font-medium hover:underline inline-flex items-center gap-1">Review in Fuel Tracking <ExternalLink className="w-3 h-3" /></button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Monthly Shipments</h3>
              {tripData.length > 0 ? <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tripData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="created" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Created" />
                  <Bar dataKey="delivered" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Delivered" />
                </BarChart>
              </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No shipment data yet</p>}
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Fleet Status</h3>
              {vehicles.length > 0 ? <>
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
              </> : <p className="text-sm text-muted-foreground py-12 text-center">No vehicles yet</p>}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Shipments by Month</h3>
            {tripData.length > 0 ? <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tripData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Line type="monotone" dataKey="created" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Created" />
                <Line type="monotone" dataKey="delivered" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} name="Delivered" />
              </LineChart>
            </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No shipment data yet</p>}
          </div>
        </>
      )}

      {tab === 'fleet' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Vehicles ({vehicles.length})</h3>
            <button onClick={() => openVehicleForm()} className="text-sm text-primary font-medium hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Vehicle</button>
          </div>
          {vehicles.length > 0 ? <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Vehicle', 'Plate', 'Type', 'Status', 'Driver', 'Mileage', 'Tank (L)', 'Fuel', ''].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.plate}</td>
                    <td className="px-4 py-3">{v.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={v.status} variant={vehicleStatusVariant(v.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{v.driver || '\u2014'}</td>
                    <td className="px-4 py-3">{v.mileage.toLocaleString()} km</td>
                    <td className="px-4 py-3">{v.tankCapacity ? `${v.tankCapacity} L` : '\u2014'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.fuelType}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate({ to: '/fuel' })} className="text-xs text-primary hover:underline flex items-center gap-1"><Fuel className="w-3 h-3" /> Fuel</button>
                        <button onClick={() => openVehicleForm(v)} className="text-xs text-primary hover:underline"><Edit3 className="w-3 h-3 inline" /> Edit</button>
                        <button onClick={() => { removeVehicle(v.id); }} className="text-xs text-destructive hover:underline"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> : <p className="text-sm text-muted-foreground text-center py-8">No vehicles in fleet. Add your first vehicle.</p>}
        </div>
      )}

      {tab === 'drivers' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Drivers ({drivers.length})</h3>
            <button onClick={() => openDriverForm()} className="text-sm text-primary font-medium hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Driver</button>
          </div>
          {drivers.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {drivers.map((d) => (
              <div key={d.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {(d.name || 'D').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.phone}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={d.status} variant={d.status === 'Available' ? 'success' : d.status === 'On Trip' ? 'info' : 'default'} /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trips</span><span className="font-medium">{d.trips}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">{d.rating} / 5</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-mono text-xs truncate max-w-[120px]">{d.license}</span></div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button onClick={() => openDriverForm(d)} className="text-xs text-primary hover:underline"><Edit3 className="w-3 h-3 inline" /> Edit</button>
                  <button onClick={() => { removeDriver(d.id); }} className="text-xs text-destructive hover:underline"><Trash2 className="w-3 h-3 inline" /> Delete</button>
                </div>
              </div>
            ))}
          </div> : <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-muted-foreground">No drivers yet. Add your first driver.</p></div>}
        </div>
      )}

      {tab === 'shipments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={shipSearch} onChange={e => setShipSearch(e.target.value)} placeholder="Search tracking no, route..."
                className="pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <select value={shipStatus} onChange={e => setShipStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option value="">All statuses</option>
              {['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{filteredShipments.length} of {shipments.length} shipments</span>
          </div>
          {filteredShipments.length > 0 ? filteredShipments.map((s) => (
            <div key={s.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold flex items-center gap-2">{s.trackingNo} <StatusBadge status={s.status} variant={shipmentStatusVariant(s.status)} /></p>
                  <p className="text-sm text-muted-foreground mt-1">{s.weight} {s.createdAt ? `\u2022 Created ${s.createdAt}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'Pending' && <button onClick={() => updateShipment(s.id, { status: 'Picked Up' })} className="text-sm text-primary font-medium hover:underline">Mark Picked Up</button>}
                  {s.status === 'Picked Up' && <button onClick={() => updateShipment(s.id, { status: 'In Transit' })} className="text-sm text-primary font-medium hover:underline">Mark In Transit</button>}
                  {s.status === 'In Transit' && <button onClick={() => { updateShipment(s.id, { status: 'Delivered' }); toast.success('Shipment delivered!'); }} className="text-sm text-success font-medium hover:underline">Mark Delivered</button>}
                  <button onClick={() => openShipmentForm(s)} className="text-xs text-primary hover:underline"><Edit3 className="w-3 h-3 inline" /></button>
                  <button onClick={() => { removeShipment(s.id); }} className="text-xs text-destructive hover:underline"><Trash2 className="w-3 h-3 inline" /></button>
                </div>
              </div>
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
              {(s.driver || s.vehicle) && <p className="text-xs text-muted-foreground mt-2">Driver: {s.driver || '\u2014'} \u2022 Vehicle: {s.vehicle || '\u2014'}</p>}
            </div>
          )) : <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-muted-foreground">{shipments.length ? 'No shipments match the current filters.' : 'No shipments yet. Create your first shipment.'}</p></div>}
        </div>
      )}

      {showVehicleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowVehicleForm(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">{editVehicleId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button onClick={() => setShowVehicleForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleVehicleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Name*</label>
                  <input value={vForm.name} onChange={(e) => setVForm({ ...vForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Plate Number*</label>
                  <input value={vForm.plate} onChange={(e) => setVForm({ ...vForm, plate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select value={vForm.type} onChange={(e) => setVForm({ ...vForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Truck', 'Van', 'Motorcycle', 'Car'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select value={vForm.status} onChange={(e) => setVForm({ ...vForm, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Active', 'Maintenance', 'Idle'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Type</label>
                  <select value={vForm.fuelType} onChange={(e) => setVForm({ ...vForm, fuelType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Diesel', 'Petrol', 'Electric'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver</label>
                  <input value={vForm.driver} onChange={(e) => setVForm({ ...vForm, driver: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="Driver name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Tank Capacity (L)</label>
                  <input type="number" value={vForm.tankCapacity || ''} onChange={(e) => setVForm({ ...vForm, tankCapacity: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="e.g. 300" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Mileage (km)</label>
                  <input type="number" value={vForm.mileage || ''} onChange={(e) => setVForm({ ...vForm, mileage: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Last Service</label>
                <input type="date" value={vForm.lastService} onChange={(e) => setVForm({ ...vForm, lastService: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowVehicleForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editVehicleId ? 'Update' : 'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDriverForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowDriverForm(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">{editDriverId ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => setShowDriverForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDriverSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver Name*</label>
                  <input value={dForm.name} onChange={(e) => setDForm({ ...dForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <input value={dForm.phone} onChange={(e) => setDForm({ ...dForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">License Number</label>
                  <input value={dForm.license} onChange={(e) => setDForm({ ...dForm, license: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select value={dForm.status} onChange={(e) => setDForm({ ...dForm, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Available', 'On Trip', 'Off Duty'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDriverForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editDriverId ? 'Update' : 'Add Driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShipmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowShipmentForm(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">{editingShip ? 'Edit Shipment' : 'New Shipment'}</h2>
              <button onClick={() => setShowShipmentForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleShipmentSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Origin*</label>
                  <input value={sForm.origin} onChange={(e) => setSForm({ ...sForm, origin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Destination*</label>
                  <input value={sForm.destination} onChange={(e) => setSForm({ ...sForm, destination: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Weight</label>
                  <input value={sForm.weight} onChange={(e) => setSForm({ ...sForm, weight: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="e.g. 500 kg" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Tracking No</label>
                  <input value={sForm.trackingNo} onChange={(e) => setSForm({ ...sForm, trackingNo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver</label>
                  <select value={sForm.driver} onChange={(e) => setSForm({ ...sForm, driver: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option value="">Select driver</option>
                    {drivers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle</label>
                  <select value={sForm.vehicle} onChange={(e) => setSForm({ ...sForm, vehicle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={`${v.name} (${v.plate})`}>{v.name} ({v.plate})</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Delivery</label>
                <input type="date" value={sForm.estimatedDelivery} onChange={(e) => setSForm({ ...sForm, estimatedDelivery: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowShipmentForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editingShip ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
