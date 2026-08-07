import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/shared/CommonUI';
import {
  ShieldAlert, ClipboardList, HardHat, FileCheck2, Activity, TrendingDown, Target, Sparkles, AlertTriangle, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, RiskBadge, Avatar, Bar } from '@/modules/ehs/components/Common';
import { ltifr, trifr, nearMissRatio, complianceScore, pct, daysUntil, formatCompact } from '@/modules/ehs/utils/format';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 70%, 55%)', 'hsl(210, 90%, 55%)', 'hsl(24, 95%, 53%)'];

export default function EHSDashboard() {
  const store = useEhsStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const { incidents, hazards, inspections, permits, training, ppe, correctiveActions, vehicleSafety, hoursWorked } = store;

  const openIncidents = incidents.filter((i) => i.status === 'Reported' || i.status === 'Investigating');
  const ltid = incidents.filter((i) => i.type === 'Lost Time Injury').length;
  const recordable = incidents.filter((i) => ['Lost Time Injury', 'Medical Treatment Injury'].includes(i.type)).length;
  const nearMisses = incidents.filter((i) => i.type === 'Near Miss').length;
  const criticalHazards = hazards.filter((h) => h.band === 'critical' || h.band === 'high').length;

  const openHazards = hazards.filter((h) => h.status !== 'Closed').length;
  const trainingPct = pct(training.filter((t) => t.status === 'Valid').length, training.length);
  const inspectionPct = pct(inspections.filter((i) => i.result === 'Pass').length, inspections.length);
  const ppePct = pct(ppe.filter((p) => p.compliance === 'Compliant').length, ppe.length);
  const caPct = pct(correctiveActions.filter((c) => c.status === 'Completed' || c.status === 'Verified').length, correctiveActions.length);
  const permitPct = pct(permits.filter((p) => p.status === 'Approved' || p.status === 'Active' || p.status === 'Closed').length, permits.length);
  const compScore = complianceScore({ trainingPct, inspectionPct, ppePct, correctivePct: caPct, permitPct });

  const LTF = ltifr(ltid, hoursWorked);
  const TRF = trifr(recordable, hoursWorked);
  const ratio = nearMissRatio(nearMisses, incidents.length);

  const byType = useMemo(() => {
    const buckets: Record<string, number> = {};
    incidents.forEach((i) => { buckets[i.type] = (buckets[i.type] || 0) + 1; });
    return Object.entries(buckets).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [incidents]);

  const byMonth = useMemo(() => {
    const buckets: Record<string, number> = {};
    incidents.forEach((i) => { const m = i.createdAt.slice(0, 7); buckets[m] = (buckets[m] || 0) + 1; });
    return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).slice(-8).map(([m, v]) => ({ month: m.slice(5), count: v }));
  }, [incidents]);

  const hazardByBand = useMemo(() => {
    const b = { low: 0, medium: 0, high: 0, critical: 0 };
    hazards.forEach((h) => { b[h.band]++; });
    return Object.entries(b).map(([name, value]) => ({ name, value }));
  }, [hazards]);

  const recentIncidents = [...incidents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const overdueCA = correctiveActions.filter((c) => c.status !== 'Completed' && c.status !== 'Verified' && daysUntil(c.dueDate) < 0).length;

  const compliancePillars = [
    { label: 'Training', pct: trainingPct, weight: 25 },
    { label: 'Inspections', pct: inspectionPct, weight: 25 },
    { label: 'PPE', pct: ppePct, weight: 20 },
    { label: 'Corrective Actions', pct: caPct, weight: 20 },
    { label: 'Permits', pct: permitPct, weight: 10 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="EHS Dashboard" description="Safety performance across all sites">
        <button onClick={() => navigate({ to: '/ehs/incidents' })} className="btn btn-primary">
          <AlertTriangle className="w-4 h-4" /> Report Incident
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Compliance Score</p>
              <p className="text-3xl font-bold tracking-tight">{compScore}<span className="text-lg text-muted-foreground">/100</span></p>
              <p className="text-xs font-medium text-success">Across 5 pillars</p>
            </div>
            <div className="p-3 rounded-xl bg-success/10"><ClipboardList className="w-5 h-5 text-success" /></div>
          </div>
        </div>
        <div className="rounded-xl p-5 glass">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Open Incidents</p>
              <p className="text-2xl font-bold tracking-tight">{openIncidents}</p>
              <p className="text-xs font-medium text-destructive">{incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Closed').length} critical open</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10"><Activity className="w-5 h-5 text-destructive" /></div>
          </div>
        </div>
        <div className="rounded-xl p-5 glass">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Uncontrolled Hazards</p>
              <p className="text-2xl font-bold tracking-tight">{openHazards}</p>
              <p className="text-xs font-medium text-orange-500">{criticalHazards} high/critical</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10"><HardHat className="w-5 h-5 text-orange-500" /></div>
          </div>
        </div>
        <div className="rounded-xl p-5 glass">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Overdue Actions</p>
              <p className="text-2xl font-bold tracking-tight text-destructive">{overdueCA}</p>
              <p className="text-xs font-medium text-muted-foreground">need attention</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10"><TrendingDown className="w-5 h-5 text-warning" /></div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">LTIFR</p>
            <p className="text-lg font-bold tabular-nums">{LTF.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">TRIFR</p>
            <p className="text-lg font-bold tabular-nums">{TRF.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Near-Miss Ratio</p>
            <p className="text-lg font-bold tabular-nums">{ratio.toFixed(0)}%</p>
          </div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Incidents (12 mo)</p>
            <p className="text-lg font-bold tabular-nums">{incidents.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Compliance Pillars" subtitle="Weighted score drivers" className="lg:col-span-2">
          {compliancePillars.map((c) => (
            <div key={c.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{c.label} <span className="text-xs text-muted-foreground">({c.weight}%)</span></span>
                <span className="text-muted-foreground">{c.pct}%</span>
              </div>
              <Bar pct={c.pct} color={c.pct >= 80 ? 'bg-success' : c.pct >= 60 ? 'bg-warning' : 'bg-destructive'} />
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Risk Register" subtitle="Hazards by band">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={hazardByBand} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2}>
                {hazardByBand.map((s) => <Cell key={s.name} fill={({ low: '#16A34A', medium: '#F59E0B', high: '#F97316', critical: '#DC2626' } as Record<string, string>)[s.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {hazardByBand.map((s) => (
              <div key={s.name} className="text-center">
                <div className="text-lg font-bold" style={{ color: ({ low: '#16A34A', medium: '#F59E0B', high: '#F97316', critical: '#DC2626' } as Record<string, string>)[s.name] }}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{s.name}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Incidents by Type" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0A66FF" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Monthly Incident Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0A66FF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Recent Incidents" subtitle="Latest 5">
          <div className="space-y-3">
            {recentIncidents.map((i) => (
              <button key={i.id} onClick={() => navigate({ to: '/ehs/incidents/$id', params: { id: i.id } })} className="w-full text-left flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/40 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`p-1.5 rounded-lg ${i.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : i.severity === 'High' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{i.type}</p>
                    <p className="text-xs text-muted-foreground">{i.number} · {i.site}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text={i.status} variant={i.status === 'Closed' ? 'success' : i.status === 'Investigating' ? 'warning' : 'default'} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Hazards" subtitle="Highest risk registered">
          <div className="space-y-3">
            {[...hazards].sort((a, b) => b.score - a.score).slice(0, 5).map((h) => (
              <button key={h.id} onClick={() => navigate({ to: '/ehs/hazards' })} className="w-full text-left flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/40 transition">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{h.reference} · {h.category}</p>
                </div>
                <RiskBadge band={h.band} score={h.score} />
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Insights" className="bg-gradient-to-br from-primary/10 to-transparent">
          <Sparkles className="w-6 h-6 text-primary mb-2" />
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><span className="text-primary">•</span> <span><strong>{criticalHazards}</strong> high/critical hazards are open — prioritise controls this week.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span>LTIFR is <strong>{LTF.toFixed(2)}</strong>; the {ltid} lost-time cases predominantly involve unguarded plant and manual handling.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span>Near-miss ratio <strong>{ratio.toFixed(0)}%</strong> signals strong reporting culture — acting on reported near-misses prevents repeat incidents.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span><strong>{overdueCA}</strong> corrective actions are overdue — prioritise closure to protect the compliance score.</span></li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}