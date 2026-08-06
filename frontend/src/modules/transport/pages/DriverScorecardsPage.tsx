import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Users, Gauge, Star, AlertTriangle, Trophy } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, SectionCard, ScoreBar, EmptyRow, BadgeVariant } from '@/modules/transport/components/Common';
import { formatKm } from '@/modules/transport/utils/format';

const gradeVariant = (g: string): BadgeVariant => g === 'A' ? 'success' : g === 'B' ? 'info' : g === 'C' ? 'warning' : 'destructive';

export default function DriverScorecardsPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const latest = useMemo(() => {
    const byDriver: Record<string, typeof store.driverScores> = {};
    for (const s of store.driverScores) {
      (byDriver[s.driverId] ||= []).push(s);
    }
    return Object.values(byDriver).map((list) => [...list].sort((a, b) => b.period.localeCompare(a.period))[0]).sort((a, b) => b.score - a.score);
  }, [store.driverScores]);

  const filtered = latest.filter((s) => {
    if (gradeFilter && s.grade !== gradeFilter) return false;
    if (search) {
      const d = store.drivers.find((x) => x.id === s.driverId);
      return (d?.name || '').toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const avgScore = latest.length ? Math.round(latest.reduce((a, s) => a + s.score, 0) / latest.length) : 0;
  const gradeA = latest.filter((s) => s.grade === 'A').length;
  const needsCoaching = latest.filter((s) => s.grade === 'C' || s.grade === 'D').length;
  const topDriver = latest[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Driver Scorecards" description="Behavioral scoring — fuel efficiency, safety, and punctuality" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Drivers Scored" value={String(latest.length)} change={`avg ${avgScore} pts`} changeType="positive" icon={Users} />
        <StatCard title="Grade A" value={String(gradeA)} change="top performers" changeType="positive" icon={Trophy} />
        <StatCard title="Need Coaching" value={String(needsCoaching)} change="grade C or D" changeType={needsCoaching ? 'negative' : 'positive'} icon={AlertTriangle} />
        <StatCard title="Top Driver" value={topDriver ? store.drivers.find((d) => d.id === topDriver.driverId)?.name.split(' ')[0] || '—' : '—'} change={topDriver ? `${topDriver.score} pts` : ''} changeType="positive" icon={Star} />
      </div>

      <SectionCard title={`Scorecards (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={gradeFilter} onChange={setGradeFilter} label="All grades"
              options={['A', 'B', 'C', 'D'].map((g) => ({ value: g, label: `Grade ${g}` }))} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search driver..." />
          </>
        }>
        <div className="space-y-4">
          {filtered.length ? filtered.map((s) => {
            const d = store.drivers.find((x) => x.id === s.driverId);
            return (
              <div key={s.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {(d?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{d?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">Period {s.period} · {s.tripsCompleted} trips · {formatKm(s.tripsCompleted * 250)} est.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge text={`Grade ${s.grade}`} variant={gradeVariant(s.grade)} />
                    <span className="text-2xl font-bold">{s.score}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <ScoreBar value={s.fuelEfficiency} label="Fuel Efficiency" />
                    <ScoreBar value={s.safety} label="Safety" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">Idle Time</span>
                        <span className="font-semibold">{s.idleTime}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${s.idleTime > 12 ? 'bg-destructive' : s.idleTime > 7 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${s.idleTime * 5}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">Harsh Braking</span>
                        <span className="font-semibold">{s.harshBraking}/10</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${s.harshBraking > 5 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${s.harshBraking * 10}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground font-medium">Speeding</span>
                        <span className="font-semibold">{s.speeding}/10</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${s.speeding > 6 ? 'bg-destructive' : s.speeding > 3 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${s.speeding * 10}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">On-time delivery</span><span className="font-semibold">{s.onTimePct}%</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Attendance</span><span className="font-semibold">{s.attendance}%</span></div>
                  </div>
                </div>
              </div>
            );
          }) : <EmptyRow colSpan={1} message="No scorecards match the filters." />}
        </div>
      </SectionCard>

      <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4 flex items-start gap-3">
        <Gauge className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">How scores work.</span> Driver scorecards blend fuel efficiency, safety events (harsh braking, speeding), idle time, on-time delivery, and attendance. Scores drive coaching priorities and fuel theft risk review.
        </p>
      </div>
    </div>
  );
}