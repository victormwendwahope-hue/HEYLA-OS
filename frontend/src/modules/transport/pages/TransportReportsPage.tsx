import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { FileText, Download, Printer, BarChart3, ArrowDownUp } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { SectionCard, Badge, FilterSelect } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate, formatKm } from '@/modules/transport/utils/format';

// Transport Reports: summary views that can be exported or printed.

export default function TransportReportsPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [period, setPeriod] = useState('latest');

  const periods = useMemo(() => [...new Set(store.profitability.map((p) => p.period))].sort(), [store.profitability]);
  const currentPeriod = period === 'latest' ? periods[periods.length - 1] : period;

  const periodProfit = store.profitability.filter((p) => p.period === currentPeriod);
  const periodFuel = store.fuelTransactions.filter((f) => f.date.slice(0, 7) === currentPeriod);
  const periodTrips = store.trips.filter((t) => t.startTime.slice(0, 7) === currentPeriod);

  const revenue = periodProfit.reduce((a, p) => a + p.revenue, 0);
  const cost = periodProfit.reduce((a, p) => a + p.totalCost, 0);
  const fuelCost = periodFuel.reduce((a, f) => a + f.totalCost, 0);
  const fuelLiters = periodFuel.reduce((a, f) => a + f.liters, 0);
  const tripsDone = periodTrips.filter((t) => t.status === 'Completed').length;
  const kmDone = periodTrips.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.distanceKm, 0);
  const maintenanceCost = periodProfit.reduce((a, p) => a + p.maintenanceCost, 0);
  const anomalies = periodFuel.filter((f) => f.flagged).length;

  const topVehicles = useMemo(() => {
    return [...periodProfit].sort((a, b) => b.netProfit - a.netProfit).slice(0, 5);
  }, [periodProfit]);

  const downloadSummary = () => {
    const lines = [
      ['HEYLAOS — Fleet Transport Report', ''],
      ['Period', currentPeriod],
      ['Generated', new Date().toLocaleString()],
      ['', ''],
      ['Revenue', formatCurrency(revenue)],
      ['Total Cost', formatCurrency(cost)],
      ['Net Profit', formatCurrency(revenue - cost)],
      ['Fuel Spend', formatCurrency(fuelCost)],
      ['Fuel Volume (L)', fuelLiters.toLocaleString('en-KE')],
      ['Trips Completed', String(tripsDone)],
      ['Distance Covered', formatKm(kmDone)],
      ['Maintenance Cost', formatCurrency(maintenanceCost)],
      ['Fuel Anomalies', String(anomalies)],
      ['', ''],
      ['Top Vehicles', ''],
      ...topVehicles.map((p) => {
        const v = store.vehicles.find((x) => x.id === p.vehicleId);
        return [v?.name || 'Unknown', formatCurrency(p.netProfit)];
      }),
    ];
    const csv = lines.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-report-${currentPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const margin = revenue ? ((revenue - cost) / revenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transport Reports" description="Consolidated fleet performance snapshots">
        <div className="flex items-center gap-2">
          <FilterSelect value={period} onChange={setPeriod}
            options={[{ value: 'latest', label: `Latest (${periods[periods.length - 1]})` }, ...periods.map((p) => ({ value: p, label: p }))]} />
          <button onClick={downloadSummary} className="px-3 py-2 rounded-lg border border-input text-sm flex items-center gap-1.5 hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={printReport} className="px-3 py-2 rounded-lg border border-input text-sm flex items-center gap-1.5 hover:bg-muted transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={formatCurrency(revenue)} change={currentPeriod} changeType="positive" icon={FileText} />
        <StatCard title="Net Profit" value={formatCurrency(revenue - cost)} change={`${margin.toFixed(1)}% margin`} changeType={revenue - cost >= 0 ? 'positive' : 'negative'} icon={BarChart3} />
        <StatCard title="Fuel Spend" value={formatCurrency(fuelCost)} change={`${anomalies} anomalies`} changeType={anomalies ? 'negative' : 'positive'} icon={ArrowDownUp} />
        <StatCard title="Utilization" value={`${tripsDone} trips`} change={formatKm(kmDone)} changeType="neutral" icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Cost Summary" subtitle={`${currentPeriod}`}>
          <div className="space-y-3">
            {[
              { label: 'Fuel', value: fuelCost },
              { label: 'Maintenance', value: maintenanceCost },
              { label: 'Other direct costs', value: Math.max(0, cost - fuelCost - maintenanceCost) },
              { label: 'Total Cost', value: cost, strong: true },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className={r.strong ? 'font-semibold' : 'text-muted-foreground'}>{r.label}</span>
                <span className={r.strong ? 'font-bold' : 'font-medium'}>{formatCurrency(r.value)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Top Performing Vehicles">
          <div className="space-y-3">
            {topVehicles.map((p, i) => {
              const v = store.vehicles.find((x) => x.id === p.vehicleId);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="font-medium">{v?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{p.marginPct}% margin · {formatCurrency(p.revenuePerKm)}/km</p>
                    </div>
                  </div>
                  <Badge text={formatCurrency(p.netProfit)} variant={p.netProfit >= 0 ? 'success' : 'destructive'} />
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Report Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Fuel.</span> Spend is tracked per transaction with anomaly flags feeding the theft-detection module.</p>
          <p><span className="font-semibold text-foreground">Costs.</span> Maintenance and other direct costs are allocated per vehicle per period from work orders and expenses.</p>
          <p><span className="font-semibold text-foreground">Margin.</span> Net margin = (revenue − total cost) / revenue. Use the Flexible Costing tool to model changes.</p>
        </div>
      </div>
    </div>
  );
}