import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useFuelStore, FuelEntry, FuelAnomaly } from '@/store/fuelStore';
import { useTransportStore } from '@/store/transportStore';
import { formatCurrency } from '@/utils/countries';
import { Fuel, TrendingUp, AlertTriangle, Plus, X, Truck, Gauge, Weight, Loader2, Download, Search, Users, Wallet, ShieldAlert, ChevronRight, Route } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const FLAG_LABELS: Record<string, string> = {
  OVER_CAPACITY: 'Over Capacity', ODOMETER_GAP: 'Odometer Gap', VARIANCE_HIGH: 'Fuel Variance',
  LOW_EFFICIENCY: 'Low Efficiency', HIGH_PRICE: 'High Price', NO_DISTANCE: 'No Distance',
};
const severityVariant = (s: string) => s === 'high' ? 'destructive' as const : s === 'medium' ? 'warning' as const : 'default' as const;
const vehicleStatusVariant = (s: string) => s === 'ok' ? 'success' as const : s === 'watch' ? 'warning' as const : s === 'concern' ? 'destructive' as const : 'default' as const;

type Tab = 'overview' | 'vehicles' | 'drivers' | 'anomalies' | 'logs';

interface FormState {
  vehicleId: string; vehicleName: string; vehicleModel: string; vehicleType: string;
  plate: string; driver: string; date: string; liters: number; costPerLiter: number;
  mileage: number; station: string; fuelType: 'Diesel' | 'Petrol'; loadState: 'Loaded' | 'Unloaded';
  cargoWeight: number; tripDistance: number; tankCapacity: number; notes: string;
}

const emptyForm = (): FormState => ({
  vehicleId: '', vehicleName: '', vehicleModel: '', vehicleType: 'Truck', plate: '', driver: '',
  date: new Date().toISOString().split('T')[0], liters: 0, costPerLiter: 210, mileage: 0,
  station: '', fuelType: 'Diesel', loadState: 'Unloaded', cargoWeight: 0, tripDistance: 0,
  tankCapacity: 0, notes: '',
});

export default function FuelPage() {
  const { entries, analytics, loading, fetchEntries, fetchAnalytics, addEntry, updateEntry, removeEntry } = useFuelStore();
  const { vehicles, fetchVehicles } = useTransportStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEntries(); fetchAnalytics(); fetchVehicles(); }, []);

  const filtered = useMemo(() => {
    return [...entries]
      .filter(e => !vehicleFilter || e.plate === vehicleFilter)
      .filter(e => !driverFilter || e.driver === driverFilter)
      .filter(e => (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo))
      .filter(e => {
        if (!search) return true;
        const q = search.toLowerCase();
        return [e.vehicleName, e.vehicleModel, e.plate, e.driver, e.station, e.notes].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, vehicleFilter, driverFilter, dateFrom, dateTo, search]);

  const totalCost = filtered.reduce((s, e) => s + e.totalCost, 0);
  const totalLiters = filtered.reduce((s, e) => s + e.liters, 0);
  const totalKm = filtered.reduce((s, e) => s + (e.tripDistance || 0), 0);
  const avgKpl = totalLiters ? totalKm / totalLiters : 0;
  const costPerKm = totalKm ? totalCost / totalKm : 0;
  const anomalies = analytics?.anomalies || [];
  const highAnomalies = anomalies.filter(a => a.severity === 'high').length;

  const plateOptions = useMemo(() => {
    const fromFleet = vehicles.map(v => ({ plate: v.plate, label: `${v.name} (${v.plate})` }));
    const extra = new Map<string, string>();
    entries.forEach(e => { if (e.plate && !fromFleet.some(f => f.plate === e.plate)) extra.set(e.plate, `${e.vehicleName} (${e.plate})`); });
    return [...fromFleet, ...Array.from(extra, ([plate, label]) => ({ plate, label }))];
  }, [vehicles, entries]);
  const driverOptions = useMemo(() => Array.from(new Set(entries.map(e => e.driver).filter(Boolean))), [entries]);

  const consumptionData = useMemo(() =>
    [...filtered].sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date.slice(5), liters: e.liters, cost: e.totalCost, kpl: e.kmPerLiter, costPerKm: e.costPerKm }))
  , [filtered]);
  const monthlyData = useMemo(() =>
    (analytics?.monthly || []).map(m => ({ label: m.label.slice(5) || m.label, costPerKm: +m.costPerKm.toFixed(1), avgKpl: +m.avgKpl.toFixed(1), totalCost: Math.round(m.totalCost) }))
  , [analytics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleName && !form.plate) { toast.error('Vehicle name or plate required'); return; }
    if (!form.liters || form.liters <= 0) { toast.error('Valid liters required'); return; }
    if (form.tankCapacity && form.liters > form.tankCapacity) {
      toast.warning(`Warning: ${form.liters}L exceeds tank capacity (${form.tankCapacity}L)`);
    }
    try {
      const payload = { ...form };
      if (editingId) await updateEntry(editingId, payload);
      else await addEntry(payload);
      setShowForm(false); setEditingId(null); setForm(emptyForm());
      fetchAnalytics(); fetchVehicles();
    } catch { }
  };

  const selectVehicle = (vehicleId: string) => {
    const v = vehicles.find(x => x.id === vehicleId);
    if (!v) return;
    setForm({
      ...form, vehicleId: v.id, vehicleName: v.name, plate: v.plate,
      vehicleType: v.type, vehicleModel: '', driver: v.driver || '', fuelType: v.fuelType === 'Electric' ? form.fuelType : v.fuelType,
      tankCapacity: v.tankCapacity || 0, mileage: v.mileage || 0,
    });
  };

  const openEdit = (e: FuelEntry) => {
    setEditingId(e.id);
    setForm({
      vehicleId: e.vehicleId || '', vehicleName: e.vehicleName, vehicleModel: e.vehicleModel,
      vehicleType: e.vehicleType || 'Truck', plate: e.plate, driver: e.driver, date: e.date,
      liters: e.liters, costPerLiter: e.costPerLiter, mileage: e.mileage, station: e.station,
      fuelType: e.fuelType, loadState: e.loadState, cargoWeight: e.cargoWeight,
      tripDistance: e.tripDistance, tankCapacity: e.tankCapacity || 0, notes: e.notes || '',
    });
    setShowForm(true);
  };

  const exportCSV = () => {
    const header = 'Date,Vehicle,Model,Plate,Driver,Fuel Type,Liters,Cost/L,Total Cost (KES),Odometer (km),Trip (km),km/L,Cost/km,Station,Load State,Cargo (kg),Notes';
    const rows = filtered.map(e => [e.date, e.vehicleName, e.vehicleModel, e.plate, e.driver, e.fuelType, e.liters, e.costPerLiter, e.totalCost, e.mileage, e.tripDistance, e.kmPerLiter.toFixed(2), e.costPerKm.toFixed(2), e.station, e.loadState, e.cargoWeight, (e.notes || '').replace(/,/g, ' ')].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fuel-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} entries`);
  };

  const clearFilters = () => { setVehicleFilter(''); setDriverFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); };

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'drivers', label: 'Drivers' },
    { key: 'anomalies', label: 'Anomalies', badge: anomalies.length },
    { key: 'logs', label: 'Fuel Logs' },
  ];

  if (loading && entries.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading fuel data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fuel Tracking" description="Fill-to-fill efficiency, cost per km, variance analysis and anomaly detection">
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={!filtered.length} className="px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setEditingId(null); setForm(emptyForm()); setShowForm(true); }} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Log Fuel
          </button>
        </div>
      </PageHeader>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicle, plate, station..."
            className="pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <option value="">All vehicles</option>
          {plateOptions.map(o => <option key={o.plate} value={o.plate}>{o.label}</option>)}
        </select>
        <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <option value="">All drivers</option>
          {driverOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <span className="text-xs text-muted-foreground">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        {(vehicleFilter || driverFilter || dateFrom || dateTo || search) && (
          <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear filters</button>
        )}
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
            {t.badge ? <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${t.badge > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fuel Cost" value={formatCurrency(totalCost)} change={`${filtered.length} entries`} changeType="neutral" icon={Fuel} iconColor="gradient-primary" />
        <StatCard title="Cost per km" value={costPerKm ? formatCurrency(costPerKm) : '—'} change={`${totalKm.toLocaleString()} km logged`} changeType="neutral" icon={Route} />
        <StatCard title="Avg Efficiency" value={totalLiters ? `${avgKpl.toFixed(1)} km/L` : '—'} change={`${totalLiters.toLocaleString()} L total`} changeType="neutral" icon={Gauge} />
        <StatCard title="Anomalies" value={String(anomalies.length)} change={`${highAnomalies} high severity`} changeType={highAnomalies > 0 ? 'negative' : 'positive'} icon={ShieldAlert} />
      </div>

      {analytics && analytics.summary.estVarianceLoss > 500 && (
        <div className="glass rounded-xl p-4 border-l-4 border-warning flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-muted-foreground">
            Estimated <span className="font-semibold text-warning">{formatCurrency(Math.round(analytics.summary.estVarianceLoss))}</span> in unreconciled fuel (fills over expected consumption). Review the <button onClick={() => setTab('anomalies')} className="text-primary font-medium hover:underline">anomalies tab</button> — this is typically 2–5% of fuel spend.
          </p>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Fuel Consumption Over Time</h3>
              {consumptionData.length ? <ResponsiveContainer width="100%" height={260}>
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
              </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No fuel entries in this range</p>}
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Monthly Cost per km</h3>
              {monthlyData.length ? <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v)}`} />
                  <Tooltip formatter={(v: number) => `KES ${v.toFixed(1)}`} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Line type="monotone" dataKey="costPerKm" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="KES/km" />
                </LineChart>
              </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No monthly data yet</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Efficiency Trend (km/L)</h3>
              {consumptionData.length ? <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="kpl" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} strokeWidth={2} name="km/L" />
                </AreaChart>
              </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No data</p>}
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Cost by Vehicle</h3>
              {analytics?.vehicles.length ? <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.vehicles.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="plate" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="totalCost" fill="hsl(var(--warning))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer> : <p className="text-sm text-muted-foreground py-12 text-center">No data</p>}
            </div>
          </div>
        </>
      )}

      {tab === 'vehicles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(analytics?.vehicles || []).map(v => (
              <div key={v.plate} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${v.status === 'concern' ? 'bg-destructive/10' : v.status === 'watch' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{v.name || v.plate}</h4>
                    <p className="text-xs text-muted-foreground truncate">{v.model || v.type} {v.plate && `• ${v.plate}`}</p>
                  </div>
                  <StatusBadge status={v.status === 'no-data' ? 'No data' : v.status === 'concern' ? 'Concern' : v.status === 'watch' ? 'Watch' : 'Good'} variant={vehicleStatusVariant(v.status)} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Fills</span><span className="font-medium">{v.fills}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Fuel</span><span className="font-medium">{v.totalLiters.toLocaleString()} L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span className="font-semibold">{formatCurrency(v.totalCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span className="font-medium">{v.kmDriven.toLocaleString()} km</span></div>
                  <div className="border-t border-border pt-2 mt-2 space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Efficiency</span><span className="font-medium">{v.avgKpl ? `${v.avgKpl.toFixed(1)} km/L` : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cost / km</span><span className="font-medium">{v.costPerKm ? formatCurrency(v.costPerKm) : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg price</span><span className="font-medium">{v.avgPrice ? `${v.avgPrice.toFixed(0)} KES/L` : '—'}</span></div>
                    {v.varianceLiters > 0 && (
                      <div className="flex justify-between text-warning"><span className="text-muted-foreground">Unreconciled fuel</span><span className="font-semibold">{v.varianceLiters.toFixed(1)} L</span></div>
                    )}
                    {v.tankCapacity > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tank capacity</span><span className="font-medium">{v.tankCapacity} L</span></div>}
                  </div>
                </div>
                <button onClick={() => { setVehicleFilter(v.plate); setTab('logs'); }}
                  className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-primary font-medium hover:underline py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                  View entries <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {(!analytics || analytics.vehicles.length === 0) && (
            <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-muted-foreground">No fuel data yet — log your first fill.</p></div>
          )}
        </div>
      )}

      {tab === 'drivers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(analytics?.drivers || []).map(d => (
              <div key={d.driver} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">{(d.driver || 'D').charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{d.driver}</p>
                    <p className="text-xs text-muted-foreground">{d.fills} fills</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span className="font-semibold">{formatCurrency(d.totalCost)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fuel Used</span><span className="font-medium">{d.totalLiters.toLocaleString()} L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span className="font-medium">{d.kmDriven.toLocaleString()} km</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Efficiency</span><span className="font-medium">{d.avgKpl ? `${d.avgKpl.toFixed(1)} km/L` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost / km</span><span className="font-medium">{d.costPerKm ? formatCurrency(d.costPerKm) : '—'}</span></div>
                </div>
                <button onClick={() => { setDriverFilter(d.driver); setTab('logs'); }}
                  className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-primary font-medium hover:underline py-2 rounded-lg border border-border hover:bg-muted/40 transition-colors">
                  View fills <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {analytics?.drivers.length ? (
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Driver Cost per km Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.drivers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="driver" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={v => `KES ${Math.round(v)}`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="costPerKm" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="KES/km" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center"><p className="text-sm text-muted-foreground">No driver data yet</p></div>
          )}
        </div>
      )}

      {tab === 'anomalies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-5 border-l-4 border-destructive">
              <p className="text-2xl font-bold">{anomalies.filter(a => a.severity === 'high').length}</p>
              <p className="text-sm text-muted-foreground">High — investigate now</p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-warning">
              <p className="text-2xl font-bold">{anomalies.filter(a => a.severity === 'medium').length}</p>
              <p className="text-sm text-muted-foreground">Medium — review this week</p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-info">
              <p className="text-2xl font-bold">{anomalies.filter(a => a.severity === 'low').length}</p>
              <p className="text-sm text-muted-foreground">Low — watch for trends</p>
            </div>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            {anomalies.length ? <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Severity', 'Flag', 'Vehicle', 'Date', 'Detail', 'Liters', 'km/L', 'Cost', ''].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {anomalies.map(a => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3"><StatusBadge status={a.severity.toUpperCase()} variant={severityVariant(a.severity)} /></td>
                      <td className="px-4 py-3 font-medium">{FLAG_LABELS[a.flag] || a.flag}</td>
                      <td className="px-4 py-3">{a.vehicleName || a.plate || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[320px]">{a.message}</td>
                      <td className="px-4 py-3">{a.liters}L</td>
                      <td className="px-4 py-3">{a.kmPerLiter ? a.kmPerLiter.toFixed(1) : '—'}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(a.totalCost)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { const e = entries.find(x => x.id === a.id); if (e) openEdit(e); }} className="text-xs text-primary hover:underline">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> : (
              <div className="p-8 text-center">
                <ShieldAlert className="w-10 h-10 text-success mx-auto mb-3" />
                <p className="text-sm font-medium text-success">No anomalies detected</p>
                <p className="text-xs text-muted-foreground mt-1">All fills are within expected consumption, capacity, efficiency and price bounds.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Fuel Log ({filtered.length} entries)</h3>
            <button onClick={exportCSV} className="text-sm text-primary font-medium hover:underline flex items-center gap-1"><Download className="w-3.5 h-3.5" /> CSV</button>
          </div>
          {filtered.length ? <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Date', 'Vehicle', 'Plate', 'Driver', 'Load', 'Liters', 'km/L', 'Cost/km', 'Cost', 'Anomaly', ''].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(e => {
                  const entryAnoms = anomalies.filter(a => a.id === e.id);
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-3 font-medium">{e.vehicleName} <span className="text-xs text-muted-foreground">{e.vehicleModel}</span></td>
                      <td className="px-4 py-3 font-mono text-xs">{e.plate}</td>
                      <td className="px-4 py-3">{e.driver || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.loadState} variant={e.loadState === 'Loaded' ? 'warning' : 'success'} /></td>
                      <td className="px-4 py-3">{e.liters}L</td>
                      <td className="px-4 py-3 font-semibold">{e.kmPerLiter ? e.kmPerLiter.toFixed(1) : '—'}</td>
                      <td className="px-4 py-3">{e.costPerKm ? formatCurrency(e.costPerKm) : '—'}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(e.totalCost)}</td>
                      <td className="px-4 py-3">
                        {entryAnoms.length ? <StatusBadge status={FLAG_LABELS[entryAnoms[0].flag]} variant={severityVariant(entryAnoms[0].severity)} /> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(e)} className="text-xs text-primary hover:underline">Edit</button>
                          <button onClick={() => { removeEntry(e.id); fetchAnalytics(); }} className="text-xs text-destructive hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div> : (
            <div className="p-8 text-center">
              <Fuel className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{entries.length ? 'No entries match the current filters.' : 'No fuel entries yet. Log your first fill to start tracking.'}</p>
              {entries.length ? <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">Clear filters</button> : null}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-2xl m-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Fuel Entry' : 'Log Fuel Entry'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingId && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fleet Vehicle</label>
                  <select value={form.vehicleId} onChange={e => selectVehicle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">— Select from fleet (auto-fills details) —</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) • {v.type}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Name*</label>
                  <input value={form.vehicleName} onChange={e => setForm({ ...form, vehicleName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Plate</label>
                  <input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Model</label>
                  <input value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} placeholder="e.g. FRR 90N" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Truck', 'Van', 'Car', 'Motorcycle'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Date*</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Driver</label>
                  <input value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Odometer (km)</label>
                  <input type="number" value={form.mileage || ''} onChange={e => setForm({ ...form, mileage: +e.target.value })} placeholder="Current odometer" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Tank Capacity (L)</label>
                  <input type="number" value={form.tankCapacity || ''} onChange={e => setForm({ ...form, tankCapacity: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Liters*</label>
                  <input type="number" min="0" step="0.1" value={form.liters || ''} onChange={e => setForm({ ...form, liters: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cost/L (KES)</label>
                  <input type="number" min="0" step="0.5" value={form.costPerLiter || ''} onChange={e => setForm({ ...form, costPerLiter: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Trip Distance (km)</label>
                  <input type="number" min="0" step="0.1" value={form.tripDistance || ''} onChange={e => setForm({ ...form, tripDistance: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Type</label>
                  <select value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option>Diesel</option><option>Petrol</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Load State</label>
                  <select value={form.loadState} onChange={e => setForm({ ...form, loadState: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option>Unloaded</option><option>Loaded</option>
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cargo Weight (kg)</label>
                  <input type="number" min="0" value={form.cargoWeight || ''} onChange={e => setForm({ ...form, cargoWeight: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div className="col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1 block">Station</label>
                  <input value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} placeholder="Fuel station name" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. trip to Mombasa" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
              {form.tankCapacity > 0 && form.liters > form.tankCapacity && (
                <p className="text-xs text-destructive flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> This fill exceeds the vehicle's tank capacity — it will be flagged as an anomaly.</p>
              )}
              {form.mileage > 0 && (
                <p className="text-xs text-muted-foreground">Efficiency is auto-calculated fill-to-fill using odometer readings.</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editingId ? 'Update Entry' : 'Log Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
