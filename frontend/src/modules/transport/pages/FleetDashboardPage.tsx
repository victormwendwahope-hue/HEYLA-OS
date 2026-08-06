import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import {
  Truck, Fuel, AlertTriangle, Wallet, Gauge, Users, Wrench, CalendarClock, ArrowUpRight,
  Activity, ShieldAlert, Droplets, CircleDot,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { HealthBadge, ScoreBar, Badge } from '@/modules/transport/components/Common';
import { formatCurrency, formatCompact, timeAgo, formatDateShort } from '@/modules/transport/utils/format';
import { bandOf } from '@/modules/transport/utils/health';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(210, 90%, 55%)', 'hsl(0, 84%, 60%)'];
const bandColor: Record<string, string> = {
  excellent: 'hsl(142, 71%, 45%)',
  good: 'hsl(38, 92%, 50%)',
  fair: 'hsl(25, 95%, 53%)',
  critical: 'hsl(0, 84%, 60%)',
};

export default function FleetDashboardPage() {
  const store = useFleetStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const vehicles = store.vehicles;
  const healthList = useMemo(() => Object.values(store.health), [store.health]);

  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const inMaintenance = vehicles.filter((v) => v.status === 'Maintenance').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;

  const monthlyFuel = useMemo(() => {
    const m: Record<string, { month: string; cost: number; liters: number }> = {};
    for (const f of store.fuelTransactions) {
      const key = f.date.slice(0, 7);
      if (!m[key]) m[key] = { month: key, cost: 0, liters: 0 };
      m[key].cost += f.totalCost;
      m[key].liters += f.liters;
    }
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [store.fuelTransactions]);

  const monthlyProfit = useMemo(() => {
    const m: Record<string, { month: string; revenue: number; cost: number }> = {};
    for (const p of store.profitability) {
      if (!m[p.period]) m[p.period] = { month: p.period, revenue: 0, cost: 0 };
      m[p.period].revenue += p.revenue;
      m[p.period].cost += p.totalCost;
    }
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month)).slice(-6).map((x) => ({ ...x, profit: x.revenue - x.cost }));
  }, [store.profitability]);

  const statusPie = useMemo(() => {
    const counts = vehicles.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Active', value: counts.Active || 0 },
      { name: 'Maintenance', value: counts.Maintenance || 0 },
      { name: 'Idle', value: counts.Idle || 0 },
      { name: 'Out of Service', value: counts['Out of Service'] || 0 },
    ];
  }, [vehicles]);

  const avgHealth = useMemo(() => {
    if (!healthList.length) return 0;
    return Math.round(healthList.reduce((a, h) => a + h.score, 0) / healthList.length);
  }, [healthList]);
  const criticalCount = healthList.filter((h) => h.score < 50).length;
  const fairCount = healthList.filter((h) => h.score >= 50 && h.score < 70).length;

  const totalFuelCost = store.fuelTransactions.reduce((a, f) => a + f.totalCost, 0);
  const anomalies = store.fuelTransactions.filter((f) => f.flagged).length;
  const openAlerts = store.complianceAlerts.filter((a) => a.status === 'Open').length;
  const overdueMaint = store.maintenance.filter((m) => m.status === 'Overdue').length;
  const openWOs = store.workOrders.filter((w) => w.status === 'Open' || w.status === 'In Progress').length;

  const dueSoonDocs = store.documents.filter((d) => d.status === 'Expiring Soon').length;

  const fleetEfficiency = useMemo(() => {
    const k = store.fuelTransactions.filter((f) => f.kmPerLiter > 0);
    if (!k.length) return 0;
    return Math.round((k.reduce((a, f) => a + f.kmPerLiter, 0) / k.length) * 10) / 10;
  }, [store.fuelTransactions]);

  const fuelTrend = monthlyFuel.length >= 2
    ? ((monthlyFuel[monthlyFuel.length - 1].cost - monthlyFuel[monthlyFuel.length - 2].cost) / Math.max(1, monthlyFuel[monthlyFuel.length - 2].cost)) * 100
    : 0;

  const recentBreakdowns = [...store.breakdowns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const topWOs = [...store.workOrders].filter((w) => w.status !== 'Completed').sort((a, b) => b.priority.localeCompare(a.priority)).slice(0, 5);

  const topVehicles = useMemo(() => [...healthList].sort((a, b) => b.score - a.score).slice(0, 6), [healthList]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Fleet & Transport Intelligence"
        description="Live fleet health, fuel economics, and operational control"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">Avg fleet health</span>
          <HealthBadge band={bandOf(avgHealth)} score={avgHealth} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Fleet Size" value={String(vehicles.length)} change={`${activeCount} active`} changeType="positive" icon={Truck} />
        <StatCard title="Avg Fleet Efficiency" value={`${fleetEfficiency} km/L`} change="fleet-wide average" changeType="neutral" icon={Gauge} />
        <StatCard title="Fuel Spend (90d)" value={formatCompact(totalFuelCost)} change={`${anomalies} anomalies`} changeType={anomalies ? 'negative' : 'positive'} icon={Fuel} />
        <StatCard title="Critical Health" value={String(criticalCount)} change={`${fairCount} in fair zone`} changeType={criticalCount ? 'negative' : 'positive'} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /> Profitability Trend</h3>
            <button onClick={() => navigate({ to: '/transport/profitability' })} className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(value, name) => [formatCurrency(Number(value)), name]} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Revenue" />
              <Bar dataKey="cost" fill="hsl(0, 40%, 60%)" radius={[6, 6, 0, 0]} name="Costs" />
              <Bar dataKey="profit" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><CircleDot className="w-4 h-4 text-primary" /> Fleet Status</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ value }) => value}>
                {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {statusPie.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{p.name}</span>
                <span className="ml-auto font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Droplets className="w-4 h-4 text-primary" /> Monthly Fuel Consumption</h3>
            <span className="text-xs text-muted-foreground">{fuelTrend >= 0 ? '+' : ''}{fuelTrend.toFixed(1)}% vs prev month</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyFuel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} name="Cost" dot={false} />
              <Line type="monotone" dataKey="liters" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="Liters" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-warning" /> Operational Alerts</h3>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Fuel anomalies', value: anomalies, to: '/transport/fuel' },
              { label: 'Open compliance alerts', value: openAlerts, to: '/transport/compliance' },
              { label: 'Overdue maintenance', value: overdueMaint, to: '/transport/maintenance' },
              { label: 'Open work orders', value: openWOs, to: '/transport/workshop' },
              { label: 'Documents expiring', value: dueSoonDocs, to: '/transport/compliance' },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate({ to: a.to })} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted transition-colors text-sm">
                <span className="text-muted-foreground">{a.label}</span>
                <span className={`font-bold ${a.value > 0 ? 'text-warning' : 'text-success'}`}>{a.value}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning" />
            {overdueMaint + anomalies > 0 ? `${overdueMaint + anomalies} items need attention today` : 'All systems nominal'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Vehicle Health Scores</h3>
            <button onClick={() => navigate({ to: '/transport/vehicles' })} className="text-xs text-primary hover:underline">View fleet</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Vehicle', 'Plate', 'Score', 'Status', 'Efficiency', 'Maintenance', 'Breakdowns', 'Tyres', 'Driver'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {topVehicles.map((h) => (
                  <tr key={h.vehicle.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3 font-medium">{h.vehicle.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{h.vehicle.plate}</td>
                    <td className="px-3 py-3"><HealthBadge band={h.band} score={h.score} size="sm" /></td>
                    <td className="px-3 py-3"><Badge text={h.vehicle.status} variant={h.vehicle.status === 'Active' ? 'success' : h.vehicle.status === 'Maintenance' ? 'warning' : 'default'} /></td>
                    <td className="px-3 py-3 text-muted-foreground">{h.fuelEfficiencyScore}</td>
                    <td className="px-3 py-3 text-muted-foreground">{h.maintenanceScore}</td>
                    <td className="px-3 py-3 text-muted-foreground">{h.breakdownScore}</td>
                    <td className="px-3 py-3 text-muted-foreground">{h.tyreScore}</td>
                    <td className="px-3 py-3 text-muted-foreground">{h.driverScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> Recent Breakdowns</h3>
          <div className="space-y-3">
            {recentBreakdowns.length ? recentBreakdowns.map((b) => {
              const v = vehicles.find((x) => x.id === b.vehicleId);
              return (
                <div key={b.id} className="flex items-center gap-3 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${b.status === 'Resolved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{v?.name || 'Unknown'} · {b.type}</p>
                    <p className="text-xs text-muted-foreground">{b.location} · {timeAgo(b.date)}</p>
                  </div>
                  <Badge text={b.status} variant={b.status === 'Resolved' ? 'success' : 'destructive'} />
                </div>
              );
            }) : <p className="text-sm text-muted-foreground py-8 text-center">No breakdowns recorded</p>}
          </div>
          <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-primary" /> Top Open Work Orders</h3>
          <div className="space-y-2">
            {topWOs.map((w) => {
              const v = vehicles.find((x) => x.id === w.vehicleId);
              return (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{w.title}</p>
                    <p className="text-xs text-muted-foreground">{v?.plate}</p>
                  </div>
                  <Badge text={w.priority} variant={w.priority === 'Critical' ? 'destructive' : w.priority === 'High' ? 'warning' : 'info'} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
