import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Search as SearchIcon, Users, ListChecks, ShieldCheck } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput } from '@/modules/ehs/components/Common';
import { formatDate } from '@/modules/ehs/utils/format';
import { useState } from 'react';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Open: 'default', 'In Progress': 'info', Verified: 'success', Closed: 'success',
};

const METHOD_EMOJI: Record<string, string> = { '5 Whys': '🔍', Fishbone: '🐟', 'Root Cause Analysis': '🏛️', TapRooT: '🌳' };

export default function InvestigationsPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const investigations = store.investigations;

  const rows = useMemo(() =>
    investigations
      .filter((inv) => !query || `${inv.incidentNumber} ${inv.method} ${inv.rootCause} ${inv.investigateBy}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
  [investigations, query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Investigations" description="Root-cause analysis for incidents" actions={
        <SearchInput value={query} onChange={setQuery} placeholder="Search investigations..." />
      } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{investigations.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">In Progress</p><p className="text-lg font-bold">{investigations.filter((i) => i.status === 'In Progress').length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ListChecks className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Closed</p><p className="text-lg font-bold">{investigations.filter((i) => i.status === 'Closed').length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Verified</p><p className="text-lg font-bold">{investigations.filter((i) => i.status === 'Verified').length}</p></div>
        </div>
      </div>

      <SectionCard title="Investigation Register" subtitle={`${rows.length} investigations`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((inv) => (
            <div key={inv.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{METHOD_EMOJI[inv.method] || '🔎'}</span>
                  <div>
                    <p className="font-medium">{inv.method}</p>
                    <p className="text-xs text-muted-foreground">{inv.incidentNumber} · by {inv.investigateBy}</p>
                  </div>
                </div>
                <Badge text={inv.status} variant={STATUS_VARIANT[inv.status] || 'default'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Immediate Cause</p>
                  <p className="font-medium">{inv.immediateCause}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Root Cause</p>
                  <p className="font-medium">{inv.rootCause}</p>
                </div>
              </div>
              {inv.whys.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Analysis chain</p>
                  <div className="space-y-1.5">
                    {inv.whys.map((w, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{idx + 1}</span>
                        <span className="text-muted-foreground">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>Started {formatDate(inv.startedAt)}</span>
                <span>Due {formatDate(inv.dueAt)}</span>
                <div className="flex items-center gap-1"><Avatar name={inv.investigateBy} size="sm" />{inv.investigateBy}</div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center col-span-full">No investigations found.</p>}
        </div>
      </SectionCard>
    </div>
  );
}