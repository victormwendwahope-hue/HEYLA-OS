import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, HardHat, Compass, Shield } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, RiskBadge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import AddHazardDialog from '@/modules/ehs/components/AddHazardDialog';
import { formatDate } from '@/modules/ehs/utils/format';
import { RiskAssessment } from '@/modules/ehs/types';
import { NAMES } from '@/modules/ehs/data/mockData';

export default function HazardRegisterPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [band, setBand] = useState('');
  const [open, setOpen] = useState(false);

  const hazards = store.hazards;
  const bands = ['low', 'medium', 'high', 'critical'];

  const rows = useMemo(() =>
    hazards
      .filter((h) => !query || `${h.title} ${h.reference} ${h.category}`.toLowerCase().includes(query.toLowerCase()))
      .filter((h) => !band || h.band === band)
      .sort((a, b) => b.score - a.score),
  [hazards, query, band]);

  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  hazards.forEach((h) => { counts[h.band]++; });

  const openHazards = hazards.filter((h) => h.status !== 'Closed');

  const assessments: RiskAssessment[] = hazards
    .filter((h) => h.status === 'Open' || h.status === 'Mitigating')
    .slice(0, 4)
    .map((h, idx) => ({
      id: `ra-${idx}`,
      reference: `RA-${100 + idx}`,
      activity: h.title,
      site: h.location,
      assessor: NAMES[idx % NAMES.length],
      date: h.createdAt,
      overallScore: h.score,
      band: h.band,
      status: 'Approved' as const,
      reviewer: NAMES[1],
      reviewedAt: h.createdAt,
    }));

  return (
    <div className="space-y-6">
      <PageHeader title="Hazard Register & Risk Assessments" description="Register hazards, rate risk and plan controls">
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Register Hazard</button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          ['low', 'Low', counts.low, 'bg-success/10 text-success'],
          ['medium', 'Medium', counts.medium, 'bg-warning/10 text-warning'],
          ['high', 'High', counts.high, 'bg-orange-500/10 text-orange-500'],
          ['critical', 'Critical', counts.critical, 'bg-destructive/10 text-destructive'],
        ] as const).map(([k, label, value, cls]) => (
          <button key={k} onClick={() => setBand(band === k ? '' : k)} className="glass rounded-xl px-5 py-4 flex items-center gap-3 text-left">
            <span className={`p-3 rounded-xl ${cls}`}><HardHat className="w-5 h-5" /></span>
            <div><p className="text-xs text-muted-foreground">{label} Risk</p><p className="text-lg font-bold">{value}</p></div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Recent Risk Assessments" subtitle="Derived from open hazards" className="lg:col-span-1">
          <div className="space-y-3">
            {assessments.map((ra) => (
              <div key={ra.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{ra.reference}</span>
                  <Badge text={ra.status} variant="success" />
                </div>
                <p className="text-sm font-medium mt-1">{ra.activity}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{ra.site} · {formatDate(ra.date)}</span>
                  <RiskBadge band={ra.band} score={ra.overallScore} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Hazard Register" subtitle={`${rows.length} hazards · ${openHazards} open`} className="lg:col-span-2" actions={
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search hazards..." />
            <FilterSelect value={band} onChange={setBand} options={bands.map((b) => ({ value: b, label: b }))} label="Risk band" />
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Ref</th>
                  <th className="px-4 py-3 font-medium">Hazard</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">L×S</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id} className="border-b border-border hover:bg-muted/30 cursor-pointer">
                    <td className="px-4 py-3 font-medium">{h.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{h.title}</p>
                      <p className="text-xs text-muted-foreground">{h.location}</p>
                    </td>
                    <td className="px-4 py-3">{h.category}</td>
                    <td className="px-4 py-3 tabular-nums">{h.likelihood}×{h.severity}</td>
                    <td className="px-4 py-3"><RiskBadge band={h.band} score={h.score} /></td>
                    <td className="px-4 py-3"><Badge text={h.status} variant={h.status === 'Closed' ? 'success' : h.status === 'Mitigating' ? 'warning' : 'default'} /></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={h.ownerId} size="sm" /><span className="text-xs">{h.ownerId.replace('emp-', 'Emp ')}</span></div></td>
                  </tr>
                ))}
                {rows.length === 0 && <EmptyRow colSpan={7} message="No hazards found." />}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <AddHazardDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}