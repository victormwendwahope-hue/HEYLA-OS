import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Satellite, MapPin, Zap, BatteryCharging, Navigation } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, SectionCard, EmptyRow } from '@/modules/transport/components/Common';
import { formatDate } from '@/modules/transport/utils/format';

// Telematics / GPS: multi-vendor integration is future-ready.
// This page shows live tracking concepts, geofence-aware alerts, and idle detection.

export default function TelematicsPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const liveVehicles = useMemo(() => {
    // Simulate live telemetry from the mock fleet.
    return store.vehicles.filter((v) => v.type !== 'Excavator').map((v, i) => {
      const speed = v.status === 'Active' ? (i * 13) % 88 : 0;
      const battery = 40 + ((i * 7) % 55);
      const engine = v.status !== 'Idle';
      const idleMins = v.status === 'Idle' ? 15 + ((i * 9) % 90) : 0;
      const geofence = v.depot;
      return { ...v, speed, battery, engine, idleMins, geofence };
    });
  }, [store.vehicles]);

  const filtered = liveVehicles.filter((v) => {
    if (statusFilter === 'moving' && v.speed === 0) return false;
    if (statusFilter === 'idle' && v.speed > 0) return false;
    if (statusFilter === 'parked' && (v.speed > 0 || v.status === 'Active')) return false;
    if (search) {
      const q = search.toLowerCase();
      return [v.name, v.plate, v.depot].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const moving = liveVehicles.filter((v) => v.speed > 0).length;
  const idle = liveVehicles.filter((v) => v.idleMins > 20).length;
  const parked = liveVehicles.filter((v) => v.speed === 0 && v.idleMins === 0).length;
  const connected = liveVehicles.filter((v) => v.engine).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="GPS & Telematics" description="Live position, speed, and engine telemetry (multi-vendor ready)" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Live Connected" value={String(connected)} change={`${moving} moving`} changeType="positive" icon={Satellite} />
        <StatCard title="Moving" value={String(moving)} change="on the road" changeType="positive" icon={Navigation} />
        <StatCard title="Idling" value={String(idle)} change="> 20 min idle" changeType={idle ? 'negative' : 'positive'} icon={BatteryCharging} />
        <StatCard title="Parked" value={String(parked)} change="stationary" changeType="neutral" icon={MapPin} />
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><MapPin className="w-5 h-5" /></div>
          <div>
            <h3 className="font-semibold">Live Fleet Map</h3>
            <p className="text-xs text-muted-foreground">Real-time GPS visualization — telematics providers (Samsara, Motive, GPS Trackit) plug in via the adapter layer.</p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 h-64 flex flex-col items-center justify-center gap-2">
          <Satellite className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Map view placeholder — connect a GPS provider to enable live tracking.</p>
          <span className="text-xs text-primary font-medium">Providers: Samsara · Motive · GPS Trackit · Teltonika</span>
        </div>
      </div>

      <SectionCard title={`Live Telemetry (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All states"
              options={[{ value: 'moving', label: 'Moving' }, { value: 'idle', label: 'Idling' }, { value: 'parked', label: 'Parked' }]} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search vehicle, plate, depot..." />
          </>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Vehicle', 'Plate', 'Speed', 'Battery', 'Engine', 'Idle', 'Geofence', 'State'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length ? filtered.slice(0, 30).map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-3 font-medium">{v.name}</td>
                  <td className="px-3 py-3 font-mono text-xs">{v.plate}</td>
                  <td className="px-3 py-3">
                    <span className={`font-semibold ${v.speed > 70 ? 'text-destructive' : 'text-muted-foreground'}`}>{v.speed} km/h</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${v.battery < 40 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${v.battery}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{v.battery}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge text={v.engine ? 'Running' : 'Off'} variant={v.engine ? 'success' : 'default'} /></td>
                  <td className="px-3 py-3 text-muted-foreground">{v.idleMins ? `${v.idleMins} min` : '—'}</td>
                  <td className="px-3 py-3 text-muted-foreground">{v.geofence}</td>
                  <td className="px-3 py-3">
                    <Badge text={v.speed > 0 ? 'Moving' : v.idleMins > 20 ? 'Idling' : 'Parked'}
                      variant={v.speed > 0 ? 'info' : v.idleMins > 20 ? 'warning' : 'default'} />
                  </td>
                </tr>
              )) : <EmptyRow colSpan={8} message="No vehicles match the filters." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Adapters ready.</span> The telematics layer accepts standardized device events (position, ignition, battery, fuel, idle) so any provider can be onboarded without rework.
        </p>
      </div>
    </div>
  );
}