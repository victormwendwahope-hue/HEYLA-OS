import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Wallet, Percent, TrendingUp, Layers, ChevronRight } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { FilterSelect, SearchInput, SectionCard, Badge, EmptyRow } from '@/modules/transport/components/Common';
import { formatCurrency, formatKm } from '@/modules/transport/utils/format';

// Flexible Costing: lets operators model per-trip economics with toggles for
// fuel price, load factor, route, and vehicle class, then compare actuals.

export default function FlexibleCostingPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [scenarioName, setScenarioName] = useState('Nairobi → Mombasa (1x truck)');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [loadT, setLoadT] = useState(24);
  const [distance, setDistance] = useState(490);
  const [fuelPrice, setFuelPrice] = useState(231);
  const [ratePerKm, setRatePerKm] = useState(320);

  const vehicle = store.vehicles.find((v) => v.type === vehicleType && v.status === 'Active');

  const kpl = vehicleType === 'Truck' ? 5 : vehicleType === 'Pickup' ? 12 : vehicleType === 'Excavator' ? 3 : vehicleType === 'Van' ? 9 : 9;
  const fuelLiters = distance / kpl;
  const fuelCost = fuelLiters * fuelPrice;
  const driverCost = distance * 8;
  const maintCost = distance * 12;
  const tolls = vehicleType === 'Truck' ? 3000 : 1500;
  const tyreCost = distance * 4;
  const totalCost = fuelCost + driverCost + maintCost + tolls + tyreCost;
  const revenue = ratePerKm * distance;
  const profit = revenue - totalCost;
  const margin = (profit / revenue) * 100;

  const actualTrips = store.trips.filter((t) => t.status === 'Completed' && t.vehicleId === vehicle?.id);
  const actualRevenue = actualTrips.reduce((a, t) => a + t.revenue, 0);
  const actualKm = actualTrips.reduce((a, t) => a + t.distanceKm, 0);
  const actualCost = actualTrips.reduce((a, t) => a + t.actualCost, 0);

  const costBreakdown = [
    { label: 'Fuel', value: fuelCost, pct: (fuelCost / totalCost) * 100 },
    { label: 'Driver', value: driverCost, pct: (driverCost / totalCost) * 100 },
    { label: 'Maintenance', value: maintCost, pct: (maintCost / totalCost) * 100 },
    { label: 'Tolls', value: tolls, pct: (tolls / totalCost) * 100 },
    { label: 'Tyres', value: tyreCost, pct: (tyreCost / totalCost) * 100 },
  ];

  const breakeven = totalCost / Math.max(1, distance);

  const marginColor = margin >= 20 ? 'text-success' : margin >= 10 ? 'text-warning' : 'text-destructive';

  const fleetCostPerKm = useMemo(() => {
    const k = store.fuelTransactions.filter((f) => f.costPerKm > 0);
    return k.length ? k.reduce((a, f) => a + f.costPerKm, 0) / k.length : 0;
  }, [store.fuelTransactions]);

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Flexible Costing" description="Model trip economics live — fuel price, load, distance, and rate to hit your target margin" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Scenario Builder" subtitle="Adjust inputs to model a trip">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Scenario</label>
              <input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Vehicle Class</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputCls}>
                  {['Truck', 'Pickup', 'Van', 'Excavator', 'Car'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Load (tonnes)</label>
                <input type="number" value={loadT} onChange={(e) => setLoadT(+e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Distance (km)</label>
                <input type="number" value={distance} onChange={(e) => setDistance(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Fuel Price (KSh/L)</label>
                <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(+e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Rate (KSh/km)</label>
              <input type="number" value={ratePerKm} onChange={(e) => setRatePerKm(+e.target.value)} className={inputCls} />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              Assumes ~{kpl} km/L for {vehicleType}. Fuel is the dominant cost — small price moves swing margin quickly.
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cost Breakdown">
          <div className="space-y-4">
            {costBreakdown.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-medium">{formatCurrency(c.value)} <span className="text-xs text-muted-foreground">({c.pct.toFixed(1)}%)</span></span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.label === 'Fuel' ? 'bg-primary' : c.label === 'Driver' ? 'bg-info' : c.label === 'Tolls' ? 'bg-warning' : 'bg-muted-foreground/50'}`} style={{ width: `${Math.min(100, c.pct)}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span className="font-semibold">{formatCurrency(totalCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Breakeven rate</span><span className="font-semibold">{formatCurrency(breakeven)}/km</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fuel economy</span><span className="font-semibold">{kpl} km/L</span></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Outcome">
          <div className="space-y-3">
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-1">Projected Revenue</p>
              <p className="text-3xl font-bold tracking-tight">{formatCurrency(revenue)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                <p className={`text-xl font-bold ${marginColor}`}>{profit >= 0 ? formatCurrency(profit) : `-${formatCurrency(Math.abs(profit))}`}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Margin</p>
                <p className={`text-xl font-bold ${marginColor}`}>{margin.toFixed(1)}%</p>
              </div>
            </div>
            <div className="rounded-xl p-3 text-xs border border-border space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Cost per km</span><span className="font-semibold">{formatCurrency(totalCost / distance)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Revenue per km</span><span className="font-semibold">{formatCurrency(ratePerKm)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fleet actual cost/km</span><span className="font-semibold">{formatCurrency(fleetCostPerKm)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Load factor</span><span className="font-semibold">{loadT} t</span></div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3">
          <SectionCard title={`Actual vs Scenario — ${vehicle?.name || 'Active ' + vehicleType} (${vehicle?.plate || ''})`}>
            {actualTrips.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Actual Revenue" value={formatCurrency(actualRevenue)} change={`${actualTrips.length} trips`} changeType="positive" icon={TrendingUp} />
                <StatCard title="Actual Cost" value={formatCurrency(actualCost)} change={formatKm(actualKm)} changeType="neutral" icon={Layers} />
                <StatCard title="Actual Margin" value={`${actualTrips.length ? ((actualRevenue - actualCost) / Math.max(1, actualRevenue) * 100).toFixed(1) : 0}%`} change="vs model above" changeType="neutral" icon={Percent} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No completed trips for this vehicle class yet.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}