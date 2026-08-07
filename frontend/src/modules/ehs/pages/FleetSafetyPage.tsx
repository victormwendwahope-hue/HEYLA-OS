import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Truck, Gauge, ShieldCheck, CarFront } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, RiskBadge, Bar } from '@/modules/ehs/components/Common';
import { formatDate } from '@/modules/ehs/utils/format';

export default function FleetSafetyPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const vehicles = store.vehicleSafety;

  const avg = vehicles.length ? Math.round(vehicles.reduce((s, v) => s + v.score, 0) / vehicles.length) : 0;
  const atRisk = vehicles.filter((v) => v.score < 75).length;
  const fails = vehicles.filter((v) => v.inspectionStatus === 'Fail').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Fleet Safety" description="Vehicle inspection and driver performance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Vehicles</p><p className="text-lg font-bold">{vehicles.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Gauge className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Avg Safety Score</p><p className="text-lg font-bold">{avg}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CarFront className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Failed Inspection</p><p className="text-lg font-bold">{fails}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">At Risk (&lt;75)</p><p className="text-lg font-bold">{atRisk}</p></div>
        </div>
      </div>

      <SectionCard title="Fleet Safety Register" subtitle="ROM tracking fusion with EHS">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Plate</th>
                <th className="px-4 py-3 font-medium">Inspection</th>
                <th className="px-4 py-3 font-medium">Safety Score</th>
                <th className="px-4 py-3 font-medium">Fatigue</th>
                <th className="px-4 py-3 font-medium">Speed</th>
                <th className="px-4 py-3 font-medium">Braking</th>
                <th className="px-4 py-3 font-medium">Accidents</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{v.plate}</td>
                  <td className="px-4 py-3">{formatDate(v.inspectionDate)} <Badge text={v.inspectionStatus} variant={v.inspectionStatus === 'Pass' ? 'success' : 'destructive'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${v.score >= 85 ? 'bg-success' : v.score >= 70 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${v.score}%` }} />
                      </div>
                      <span className="text-xs">{v.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Bar pct={v.driverFatigue} color={v.driverFatigue > 60 ? 'bg-destructive' : 'bg-warning'} /></td>
                  <td className="px-4 py-3 tabular-nums">{v.speedViolations}</td>
                  <td className="px-4 py-3 tabular-nums">{v.harshBraking}</td>
                  <td className="px-4 py-3 tabular-nums">{v.accidentCount}</td>
                  <td className="px-4 py-3"><RiskBadge band={v.band} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}