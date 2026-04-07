import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useFuelStore, FuelEntry } from '@/store/fuelStore';
import { formatCurrency } from '@/utils/countries';
import { Fuel, TrendingUp, AlertTriangle, Plus, X, Truck, BarChart3, Gauge, Weight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

const COLORS = ['hsl(24, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(210, 90%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(280, 70%, 55%)'];

export default function FuelPage() {
  const { entries, addEntry, removeEntry } = useFuelStore();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'overview' | 'by-vehicle' | 'load-analysis' | 'logs'>('overview');
  const [form, setForm] = useState({ vehicleName: '', vehicleModel: '', plate: '', driver: '', liters: 0, costPerLiter: 210, station: '', fuelType: 'Diesel' as 'Diesel' | 'Petrol', loadState: 'Unloaded' as 'Loaded' | 'Unloaded', cargoWeight: 0, tripDistance: 0 });

  const totalCost = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const avgKmPerLiter = entries.reduce((s, e) => s + e.kmPerLiter, 0) / entries.length;
  const loadedEntries = entries.filter(e => e.loadState === 'Loaded');
  const unloadedEntries = entries.filter(e => e.loadState === 'Unloaded');
  const avgLoadedKpl = loadedEntries.length ? loadedEntries.reduce((s, e) => s + e.kmPerLiter, 0) / loadedEntries.length : 0;
  const avgUnloadedKpl = unloadedEntries.length ? unloadedEntries.reduce((s, e) => s + e.kmPerLiter, 0) / unloadedEntries.length : 0;
  const alerts = entries.filter((e) => e.kmPerLiter < 4);

  // By vehicle model aggregation
  const byModel: Record<string, { model: string; totalLiters: number; totalCost: number; entries: number; avgKpl: number; avgLoadedKpl: number; avgUnloadedKpl: number }> = {};
  entries.forEach(e => {
    if (!byModel[e.vehicleModel]) byModel[e.vehicleModel] = { model: e.vehicleModel, totalLiters: 0, totalCost: 0, entries: 0, avgKpl: 0, avgLoadedKpl: 0, avgUnloadedKpl: 0 };
    byModel[e.vehicleModel].totalLiters += e.liters;
    byModel[e.vehicleModel].totalCost += e.totalCost;
    byModel[e.vehicleModel].entries++;
  });
  Object.values(byModel).forEach(m => {
    const modelEntries = entries.filter(e => e.vehicleModel === m.model);
    m.avgKpl = modelEntries.reduce((s, e) => s + e.kmPerLiter, 0) / modelEntries.length;
    const loaded = modelEntries.filter(e => e.loadState === 'Loaded');
    const unloaded = modelEntries.filter(e => e.loadState === 'Unloaded');
    m.avgLoadedKpl = loaded.length ? loaded.reduce((s, e) => s + e.kmPerLiter, 0) / loaded.length : 0;
    m.avgUnloadedKpl = unloaded.length ? unloaded.reduce((s, e) => s + e.kmPerLiter, 0) / unloaded.length : 0;
  });
  const modelData = Object.values(byModel);

  // Consumption over time
  const consumptionData = entries.slice().reverse().map(e => ({ date: e.date.slice(5), liters: e.liters, kpl: e.kmPerLiter, cost: e.totalCost }));

  // Load comparison
  const loadCompare = [
    { state: 'Loaded', avgKpl: avgLoadedKpl, count: loadedEntries.length, avgCost: loadedEntries.length ? loadedEntries.reduce((s, e) => s + e.totalCost, 0) / loadedEntries.length : 0 },
    { state: 'Unloaded', avgKpl: avgUnloadedKpl, count: unloadedEntries.length, avgCost: unloadedEntries.length ? unloadedEntries.reduce((s, e) => s + e.totalCost, 0) / unloadedEntries.length : 0 },
  ];

  // Cost by plate
  const byPlate: Record<string, number> = {};
  entries.forEach(e => { byPlate[e.plate] = (byPlate[e.plate] || 0) + e.totalCost; });
  const plateData = Object.entries(byPlate).map(([plate, cost]) => ({ plate, cost }));

  // Fuel type breakdown
  const fuelTypeData = [
    { name: 'Diesel', value: entries.filter(e => e.fuelType === 'Diesel').length },
    { name: 'Petrol', value: entries.filter(e => e.fuelType === 'Petrol').length },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleName || !form.liters) { toast.error('Vehicle and liters required'); return; }
    const kmPerLiter = form.tripDistance && form.liters ? form.tripDistance / form.liters : 0;
    addEntry({
      id: Date.now().toString(), vehicleId: '', ...form,
      date: new Date().toISOString().split('T')[0],
      totalCost: form.liters * form.costPerLiter,
      mileage: 0, kmPerLiter, tripDistance: form.tripDistance,
    });
    setShowForm(false);
    setForm({ vehicleName: '', vehicleModel: '', plate: '', driver: '', liters: 0, costPerLiter: 210, station: '', fuelType: 'Diesel', loadState: 'Unloaded', cargoWeight: 0, tripDistance: 0 });
    toast.success('Fuel entry added');
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'by-vehicle' as const, label: 'By Vehicle Model' },
    { key: 'load-analysis' as const, label: 'Load Analysis' },
    { key: 'logs' as const, label: 'Fuel Logs' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fuel Tracking" description="Monitor consumption, efficiency by vehicle model, and loaded vs unloaded analysis">
        <button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Fuel
        </button>
      </PageHeader>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fuel Cost" value={formatCurrency(totalCost)} change="This period" changeType="neutral" icon={Fuel} iconColor="gradient-primary" />
        <StatCard title="Avg Efficiency" value={`${avgKmPerLiter.toFixed(1)} km/L`} change="All vehicles" changeType="neutral" icon={Gauge} />
        <StatCard title="Loaded Avg" value={`${avgLoadedKpl.toFixed(1)} km/L`} change={`${loadedEntries.length} entries`} changeType="neutral" icon={Weight} />
        <StatCard title="Unloaded Avg" value={`${avgUnloadedKpl.toFixed(1)} km/L`} change={`${unloadedEntries.length} entries`} changeType="positive" icon={TrendingUp} />
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Fuel Consumption Over Time</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={consumptionData}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="liters" stroke="hsl(var(--primary))" fill="url(#fuelGrad)" strokeWidth={2} name="Liters" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Cost by Vehicle</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={plateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="plate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="cost" fill="hsl(var(--warning))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Fuel Type Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={fuelTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {fuelTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Efficiency (km/L) Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="kpl" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} strokeWidth={2} name="km/L" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="glass rounded-xl p-5 border-l-4 border-warning">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-warning"><AlertTriangle className="w-4 h-4" /> Low Efficiency Alerts (below 4 km/L)</h3>
              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{a.vehicleName} ({a.vehicleModel})</span>
                    <StatusBadge status={a.loadState} variant={a.loadState === 'Loaded' ? 'warning' : 'info'} />
                    <span className="ml-auto font-semibold text-warning">{a.kmPerLiter} km/L</span>
                    <span className="text-muted-foreground">{a.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'by-vehicle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelData.map((m, i) => (
              <div key={m.model} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}>
                    <Truck className="w-5 h-5" style={{ color: COLORS[i % COLORS.length] }} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{m.model}</h4>
                    <p className="text-xs text-muted-foreground">{m.entries} entries</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Fuel</span><span className="font-medium">{m.totalLiters.toLocaleString()} L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span className="font-semibold">{formatCurrency(m.totalCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg Efficiency</span><span className="font-medium">{m.avgKpl.toFixed(1)} km/L</span></div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Loaded</span><span className="font-medium text-warning">{m.avgLoadedKpl.toFixed(1)} km/L</span></div>
                    <div className="flex justify-between mt-1"><span className="text-muted-foreground">Unloaded</span><span className="font-medium text-success">{m.avgUnloadedKpl.toFixed(1)} km/L</span></div>
                    {m.avgLoadedKpl > 0 && m.avgUnloadedKpl > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Efficiency drop when loaded: <span className="font-semibold text-destructive">{((1 - m.avgLoadedKpl / m.avgUnloadedKpl) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Model Efficiency Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} label={{ value: 'km/L', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="avgLoadedKpl" fill="hsl(38, 92%, 50%)" name="Loaded" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgUnloadedKpl" fill="hsl(142, 71%, 45%)" name="Unloaded" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'load-analysis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadCompare.map(lc => (
              <div key={lc.state} className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${lc.state === 'Loaded' ? 'bg-warning/10' : 'bg-success/10'}`}>
                    {lc.state === 'Loaded' ? <Weight className="w-6 h-6 text-warning" /> : <Gauge className="w-6 h-6 text-success" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{lc.state}</h3>
                    <p className="text-sm text-muted-foreground">{lc.count} trips recorded</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{lc.avgKpl.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">km/L average</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{formatCurrency(Math.round(lc.avgCost))}</p>
                    <p className="text-xs text-muted-foreground">avg cost/trip</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Loaded vs Unloaded — All Trips</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Date', 'Vehicle', 'Model', 'Load State', 'Cargo (kg)', 'Liters', 'km/L', 'Trip (km)', 'Cost'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {entries.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-3 font-medium">{e.vehicleName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.vehicleModel}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.loadState} variant={e.loadState === 'Loaded' ? 'warning' : 'success'} /></td>
                      <td className="px-4 py-3">{e.cargoWeight > 0 ? `${e.cargoWeight.toLocaleString()} kg` : '—'}</td>
                      <td className="px-4 py-3">{e.liters}L</td>
                      <td className="px-4 py-3 font-semibold">{e.kmPerLiter.toFixed(1)}</td>
                      <td className="px-4 py-3">{e.tripDistance} km</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(e.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-2">Efficiency Impact Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Loaded vehicles consume <span className="font-semibold text-warning">{avgUnloadedKpl > 0 ? ((1 - avgLoadedKpl / avgUnloadedKpl) * 100).toFixed(0) : 0}% more fuel</span> per kilometer compared to unloaded runs. Optimizing cargo distribution can save up to <span className="font-semibold text-success">{formatCurrency(Math.round(totalCost * 0.12))}/month</span>.</p>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Fuel Log ({entries.length} entries)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Date', 'Vehicle', 'Model', 'Plate', 'Driver', 'Load', 'Liters', 'km/L', 'Cost', ''].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3 font-medium">{e.vehicleName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.vehicleModel}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.plate}</td>
                    <td className="px-4 py-3">{e.driver}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.loadState} variant={e.loadState === 'Loaded' ? 'warning' : 'success'} /></td>
                    <td className="px-4 py-3">{e.liters}L</td>
                    <td className="px-4 py-3 font-semibold">{e.kmPerLiter.toFixed(1)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(e.totalCost)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { removeEntry(e.id); toast.success('Entry removed'); }} className="text-xs text-destructive hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">Log Fuel Entry</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Name*</label>
                  <input value={form.vehicleName} onChange={e => setForm({ ...form, vehicleName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Model</label>
                  <input value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} placeholder="e.g. FRR 90N" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Plate</label>
                  <input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver</label>
                  <input value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Liters*</label>
                  <input type="number" value={form.liters || ''} onChange={e => setForm({ ...form, liters: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cost/L (KES)</label>
                  <input type="number" value={form.costPerLiter} onChange={e => setForm({ ...form, costPerLiter: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Trip Distance (km)</label>
                  <input type="number" value={form.tripDistance || ''} onChange={e => setForm({ ...form, tripDistance: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Load State</label>
                  <select value={form.loadState} onChange={e => setForm({ ...form, loadState: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option>Unloaded</option><option>Loaded</option>
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cargo Weight (kg)</label>
                  <input type="number" value={form.cargoWeight || ''} onChange={e => setForm({ ...form, cargoWeight: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Station</label>
                <input value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Log Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
