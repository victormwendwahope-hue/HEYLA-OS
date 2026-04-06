import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useFuelStore } from '@/store/fuelStore';
import { formatCurrency } from '@/utils/countries';
import { Fuel, TrendingUp, AlertTriangle, Plus, X, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

export default function FuelPage() {
  const { entries, addEntry, removeEntry } = useFuelStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleName: '', plate: '', driver: '', liters: 0, costPerLiter: 210, station: '', fuelType: 'Diesel' as 'Diesel' | 'Petrol' });

  const totalCost = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const avgCost = entries.length ? totalCost / entries.length : 0;

  // Aggregate by vehicle
  const byVehicle = entries.reduce((acc, e) => {
    acc[e.plate] = (acc[e.plate] || 0) + e.totalCost;
    return acc;
  }, {} as Record<string, number>);
  const vehicleChartData = Object.entries(byVehicle).map(([plate, cost]) => ({ plate, cost }));

  // Consumption over time
  const consumptionData = entries.slice().reverse().map((e) => ({
    date: e.date.slice(5),
    liters: e.liters,
    cost: e.totalCost,
  }));

  // High consumption alerts
  const alerts = entries.filter((e) => e.liters > 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleName || !form.liters) { toast.error('Vehicle and liters required'); return; }
    addEntry({
      id: Date.now().toString(), vehicleId: '', ...form,
      date: new Date().toISOString().split('T')[0],
      totalCost: form.liters * form.costPerLiter,
      mileage: 0,
    });
    setShowForm(false);
    setForm({ vehicleName: '', plate: '', driver: '', liters: 0, costPerLiter: 210, station: '', fuelType: 'Diesel' });
    toast.success('Fuel entry added');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fuel Tracking" description="Monitor fuel consumption, costs, and vehicle efficiency">
        <button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Fuel
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fuel Cost" value={formatCurrency(totalCost)} change="This period" changeType="neutral" icon={Fuel} iconColor="gradient-primary" />
        <StatCard title="Total Liters" value={`${totalLiters.toLocaleString()} L`} change={`${entries.length} entries`} changeType="neutral" icon={Fuel} />
        <StatCard title="Avg. Per Fill" value={formatCurrency(Math.round(avgCost))} icon={TrendingUp} />
        <StatCard title="High Usage Alerts" value={String(alerts.length)} change="vehicles > 60L" changeType={alerts.length > 0 ? 'negative' : 'positive'} icon={AlertTriangle} />
      </div>

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
            <BarChart data={vehicleChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="plate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Bar dataKey="cost" fill="hsl(var(--warning))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="glass rounded-xl p-5 border-l-4 border-warning">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-warning"><AlertTriangle className="w-4 h-4" /> High Consumption Alerts</h3>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{a.vehicleName}</span>
                <span className="text-muted-foreground">({a.plate})</span>
                <span className="ml-auto font-semibold text-warning">{a.liters}L</span>
                <span className="text-muted-foreground">on {a.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fuel Log Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Fuel Log ({entries.length} entries)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Date', 'Vehicle', 'Plate', 'Driver', 'Liters', 'Cost/L', 'Total', 'Station', ''].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3 font-medium">{e.vehicleName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.plate}</td>
                  <td className="px-4 py-3">{e.driver}</td>
                  <td className="px-4 py-3">{e.liters}L</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(e.costPerLiter)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(e.totalCost)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.station}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { removeEntry(e.id); toast.success('Entry removed'); }} className="text-xs text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Log Fuel Entry</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle*</label>
                  <input value={form.vehicleName} onChange={(e) => setForm({ ...form, vehicleName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Plate</label>
                  <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver</label>
                <input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Liters*</label>
                  <input type="number" value={form.liters || ''} onChange={(e) => setForm({ ...form, liters: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cost/Liter (KES)</label>
                  <input type="number" value={form.costPerLiter} onChange={(e) => setForm({ ...form, costPerLiter: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Station</label>
                <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
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
