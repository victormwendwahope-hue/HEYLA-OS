import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { GraduationCap, BadgeCheck, Clock, TriangleAlert } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, FilterSelect, EmptyRow, Bar } from '@/modules/ehs/components/Common';
import { formatDate, daysUntil, pct } from '@/modules/ehs/utils/format';
import { useNavigate } from '@tanstack/react-router';

export default function SafetyTrainingPage() {
  const store = useEhsStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const training = store.training;
  const statuses = ['Valid', 'Expiring', 'Expired'];

  const rows = useMemo(() =>
    training
      .filter((t) => !query || `${t.employeeId} ${t.course} ${t.provider} ${t.certNumber}`.toLowerCase().includes(query.toLowerCase()))
      .filter((t) => !status || t.status === status)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate)),
  [training, query, status]);

  const valid = training.filter((t) => t.status === 'Valid').length;
  const expired = training.filter((t) => t.status === 'Expired').length;
  const expIn30 = training.filter((t) => daysUntil(t.expiryDate) >= 0 && daysUntil(t.expiryDate) <= 30).length;

  const byCourse = useMemo(() => {
    const buckets: Record<string, { total: number; valid: number }> = {};
    training.forEach((t) => {
      if (!buckets[t.course]) buckets[t.course] = { total: 0, valid: 0 };
      buckets[t.course].total++;
      if (t.status === 'Valid') buckets[t.course].valid++;
    });
    return Object.entries(buckets).map(([name, v]) => ({ name, rate: pct(v.valid, v.total) })).sort((a, b) => a.rate - b.rate);
  }, [training]);

  return (
    <div className="space-y-6">
      <PageHeader title="Safety Training" description="Competency and certification matrix">
        <button onClick={() => navigate({ to: '/ehs/training' })} className="btn btn-outline"><GraduationCap className="w-4 h-4" /> View Matrix</button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Valid</p><p className="text-lg font-bold">{valid}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Expiring ≤30d</p><p className="text-lg font-bold">{expIn30}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Expired</p><p className="text-lg font-bold">{expired}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Certificates</p><p className="text-lg font-bold">{training.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Compliance by Course" subtitle="Certification validity rates">
          <div className="space-y-3">
            {byCourse.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{c.name}</span>
                  <span className="text-muted-foreground">{c.rate}%</span>
                </div>
                <Bar pct={c.rate} color={c.rate >= 80 ? 'bg-success' : c.rate >= 60 ? 'bg-warning' : 'bg-destructive'} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Certification Records" subtitle={`${rows.length} records`} className="lg:col-span-2" actions={
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search training..." />
            <FilterSelect value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} label="Status" />
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Cert</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium">Competence</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={t.employeeId} size="sm" /><span className="text-xs">{t.employeeId}</span></div></td>
                    <td className="px-4 py-3">{t.course}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.certNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(t.expiryDate)}</td>
                    <td className="px-4 py-3"><Badge text={t.competence} variant={t.competence === 'Expert' ? 'info' : t.competence === 'Competent' ? 'success' : 'default'} /></td>
                    <td className="px-4 py-3"><Badge text={t.status} variant={t.status === 'Valid' ? 'success' : t.status === 'Expiring' ? 'warning' : 'destructive'} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <EmptyRow colSpan={6} message="No training records found." />}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}