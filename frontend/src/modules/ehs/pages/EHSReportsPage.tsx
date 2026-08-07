import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { FileDown, FileSpreadsheet, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, RiskBadge, Money } from '@/modules/ehs/components/Common';
import { ltifr, trifr, pct, complianceScore, formatCompact } from '@/modules/ehs/utils/format';
import { toast } from 'sonner';

export default function EHSReportsPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const { incidents, hazards, inspections, training, ppe, correctiveActions, permits, vehicleSafety, hoursWorked, environmental } = store;

  const ltid = incidents.filter((i) => i.type === 'Lost Time Injury').length;
  const recordable = incidents.filter((i) => ['Lost Time Injury', 'Medical Treatment Injury'].includes(i.type)).length;
  const compPillars = {
    trainingPct: pct(training.filter((t) => t.status === 'Valid').length, training.length),
    inspectionPct: pct(inspections.filter((i) => i.result === 'Pass').length, inspections.length),
    ppePct: pct(ppe.filter((p) => p.compliance === 'Compliant').length, ppe.length),
    correctivePct: pct(correctiveActions.filter((c) => c.status === 'Completed' || c.status === 'Verified').length, correctiveActions.length),
    permitPct: pct(permits.filter((p) => p.status === 'Approved' || p.status === 'Active' || p.status === 'Closed').length, permits.length),
  };

  const lagging = useMemo(() => {
    const m: Record<string, number> = {};
    incidents.forEach((i) => { const k = i.createdAt.slice(0, 7); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
  }, [incidents]);

  const exposure = vehicleSafety.reduce((s, v) => s + v.accidentCount, 0);
  const compScore = complianceScore(compPillars);

  const exportPDF = () => {
    toast.success('PDF report generated (demo)');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="EHS Reports" description="Exportable compliance and performance reports" actions={
        <>
          <button onClick={exportPDF} className="btn btn-primary"><FileDown className="w-4 h-4" /> Download PDF</button>
          <button onClick={() => toast.success('Spreadsheet exported')} className="btn btn-outline"><FileSpreadsheet className="w-4 h-4" /> Excel</button>
          <button onClick={() => window.print()} className="btn btn-outline"><Printer className="w-4 h-4" /> Print</button>
        </>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4"><p className="text-xs text-muted-foreground">Hours Worked</p><p className="text-lg font-bold">{formatCompact(hoursWorked)}</p></div>
        <div className="glass rounded-xl px-5 py-4"><p className="text-xs text-muted-foreground">LTIFR</p><p className="text-lg font-bold tabular-nums">{ltifr(ltid, hoursWorked).toFixed(2)}</p></div>
        <div className="glass rounded-xl px-5 py-4"><p className="text-xs text-muted-foreground">TRIFR</p><p className="text-lg font-bold tabular-nums">{trifr(recordable, hoursWorked).toFixed(2)}</p></div>
        <div className="glass rounded-xl px-5 py-4"><p className="text-xs text-muted-foreground">Compliance Score</p><p className="text-lg font-bold">{compScore}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Period-on-Period Incidents" subtitle="Transe of incidents over last 12 months">
          <div className="flex items-end gap-1 h-40">
            {lagging.map(([k, v]) => (
              <div key={k} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium">{v}</span>
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(6, (v / Math.max(...lagging.map((x) => x[1]))) * 100)}px` }} />
                <span className="text-[10px] text-muted-foreground">{k.slice(5)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Leadership Summary" className="bg-gradient-to-br from-primary/10 to-transparent">
          <Sparkles className="w-6 h-6 text-primary mb-2" />
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              Buy the way you run — with {incidents.length} incidents recorded over the trailing period, leadership focus should remain on controls, investigations and corrective-action closure. Your projected compliance score is {compScore}%.
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-primary">•</span> <span>{hazards.filter((h) => h.band === 'critical' || h.band === 'high').length} high/critical hazards open.</span></li>
              <li className="flex gap-2"><span className="text-primary">•</span> <span>{exposure} fleet accidents recorded across the vehicle fleet.</span></li>
              <li className="flex gap-2"><span className="text-primary">•</span> <span>{training.length} certification records across {training.length > 0 ? 'multiple' : '0'} workers covered by the training matrix.</span></li>
            </ul>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Table Export Preview" subtitle="Snapshot of key exposing lines">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Indicator</th>
                <th className="px-4 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border"><td className="px-4 py-2">Incidents</td><td className="px-4 py-2">{incidents.length}</td></tr>
              <tr className="border-b border-border"><td className="px-4 py-2">Lost-time injuries</td><td className="px-4 py-2">{ltid}</td></tr>
              <tr className="border-b border-border"><td className="px-4 py-2">Registered hazards</td><td className="px-4 py-2">{hazards.length}</td></tr>
              <tr className="border-b border-border"><td className="px-4 py-2">Inspections completed</td><td className="px-4 py-2">{inspections.filter((i) => i.status === 'Completed').length}</td></tr>
              <tr className="border-b border-border"><td className="px-4 py-2">Certifications valid</td><td className="px-4 py-2">{training.filter((t) => t.status === 'Valid').length}</td></tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}