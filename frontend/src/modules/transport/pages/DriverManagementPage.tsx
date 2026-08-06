import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Users, Star, IdCard, CalendarCheck, Plus } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, SectionCard, statusVariantMap } from '@/modules/transport/components/Common';
import AddDriverDialog from '@/modules/transport/components/AddDriverDialog';
import { daysUntil, formatDate, formatKm } from '@/modules/transport/utils/format';

export default function DriverManagementPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const drivers = store.drivers;
  const filtered = drivers.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const v = d.assignedVehicleId ? store.vehicles.find((x) => x.id === d.assignedVehicleId) : null;
      return [d.name, d.phone, d.license, v?.name, v?.plate].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const available = drivers.filter((d) => d.status === 'Available').length;
  const onTrip = drivers.filter((d) => d.status === 'On Trip').length;
  const avgRating = drivers.length ? Math.round((drivers.reduce((a, d) => a + d.rating, 0) / drivers.length) * 10) / 10 : 0;
  const licenseIssues = drivers.filter((d) => daysUntil(d.licenseExpiry) < 60).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Driver Management" description="Licenses, availability, and performance profiles">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Drivers" value={String(drivers.length)} change={`${available} available now`} changeType="positive" icon={Users} />
        <StatCard title="On Trip" value={String(onTrip)} change="currently dispatched" changeType="neutral" icon={CalendarCheck} />
        <StatCard title="Avg Rating" value={`${avgRating} / 5`} change="fleet average" changeType="positive" icon={Star} />
        <StatCard title="License Expiring" value={String(licenseIssues)} change="within 60 days" changeType={licenseIssues ? 'negative' : 'positive'} icon={IdCard} />
      </div>

      <SectionCard title={`Drivers (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
              options={['Available', 'On Trip', 'Off Duty', 'Suspended'].map((s) => ({ value: s, label: s }))} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, license, vehicle..." />
          </>
        }>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => {
            const v = d.assignedVehicleId ? store.vehicles.find((x) => x.id === d.assignedVehicleId) : null;
            const licDays = daysUntil(d.licenseExpiry);
            const avgScore = Math.round((d.scores.fuelEfficiency + d.scores.maintenance + d.scores.breakdowns + d.scores.tyres + d.scores.behavior) / 5);
            return (
              <div key={d.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 gradient-primary text-primary-foreground">
                    {d.avatar ? (
                      <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                    ) : (
                      (d.name || 'D').charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.phone}</p>
                  </div>
                  <Badge text={d.status} variant={statusVariantMap.driver[d.status]} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-mono text-xs truncate max-w-[130px]">{d.license}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">License expiry</span>
                    <span className={licDays < 60 ? 'text-warning font-medium' : 'text-muted-foreground'}>{formatDate(d.licenseExpiry)}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Assigned</span><span className="font-medium truncate max-w-[140px]">{v ? `${v.name} (${v.plate})` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trips</span><span className="font-medium">{d.trips}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium flex items-center gap-1"><Star className="w-3 h-3 text-warning" />{d.rating}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Health score</span><span className="font-semibold">{avgScore}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Hired</span><span className="text-muted-foreground">{formatDate(d.hiredDate)}</span></div>
                </div>
              </div>
            );
          })}
          {!filtered.length && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No drivers match the filters.</div>}
        </div>
      </SectionCard>

      <AddDriverDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}