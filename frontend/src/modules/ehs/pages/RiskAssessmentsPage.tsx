import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Compass, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, RiskBadge, Avatar, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import { NAMES } from '@/modules/ehs/data/mockData';
import { formatDate } from '@/modules/ehs/utils/format';

export default function RiskAssessmentsPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [band, setBand] = useState('');
  const hazards = store.hazards.filter((h) => h.status !== 'Closed');

  const assessments = useMemo(() =>
    hazards.map((h, idx) => ({
      id: `ra-${idx}`,
      reference: `RA-${100 + idx}`,
      activity: h.title,
      site: h.location,
      assessor: NAMES[idx % NAMES.length],
      date: h.createdAt,
      overallScore: h.score,
      band: h.band,
      status: h.band === 'critical' ? 'Review' : 'Approved' as 'Approved' | 'Review',
      reviewer: NAMES[(idx + 5) % NAMES.length],
      reviewedAt: h.createdAt,
      hazard: h,
    }))
      .filter((a) => !band || a.band === band)
      .sort((a, b) => b.overallScore - a.overallScore),
  [hazards, band]);

  const bands = ['low', 'medium', 'high', 'critical'];

  const counts = { low: 0, medium: 0, high: 0, critical: 0 };
  hazards.forEach((h) => { counts[h.band]++; });

  return (
    <div className="space-y-6">
      <PageHeader title="Risk Assessments" description="Activity-level risk assessments for open hazards" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          ['low', 'Low', counts.low, 'bg-success/10 text-success', Compass],
          ['medium', 'Medium', counts.medium, 'bg-warning/10 text-warning', Compass],
          ['high', 'High', counts.high, 'bg-orange-500/10 text-orange-500', TriangleAlert],
          ['critical', 'Critical', counts.critical, 'bg-destructive/10 text-destructive', ShieldCheck],
        ] as const).map(([k, label, value, cls, Icon]) => (
          <button key={k} onClick={() => setBand(band === k ? '' : k)} className="glass rounded-xl px-5 py-4 flex items-center gap-3 text-left">
            <span className={`p-3 rounded-xl ${cls}`}><Icon className="w-5 h-5" /></span>
            <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div>
          </button>
        ))}
      </div>

      <SectionCard title="Assessment Register" subtitle={`${assessments.length} assessments`} actions={
        <FilterSelect value={band} onChange={setBand} options={bands.map((b) => ({ value: b, label: b }))} label="Risk band" />
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Assessor</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.reference}</td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <p className="truncate font-medium">{a.activity}</p>
                    <p className="text-xs text-muted-foreground">{a.hazard.likelihood}×{a.hazard.severity} rating</p>
                  </td>
                  <td className="px-4 py-3">{a.site}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={a.assessor} size="sm" /><span className="text-xs">{a.assessor}</span></div></td>
                  <td className="px-4 py-3 tabular-nums">{a.overallScore}</td>
                  <td className="px-4 py-3"><RiskBadge band={a.band} /></td>
                  <td className="px-4 py-3"><Badge text={a.status} variant={a.status === 'Approved' ? 'success' : 'warning'} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
                </tr>
              ))}
              {assessments.length === 0 && <EmptyRow colSpan={8} message="No assessments found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}