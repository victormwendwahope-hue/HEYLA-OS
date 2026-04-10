import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useEmployees } from '@/store/employeeStore';
import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Coffee, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AttendanceRecord } from '@/types'; // Assume type added or inline

const today = new Date().toISOString().split('T')[0];

export default function AttendancePage() {
  const { data: employees = [] } = useEmployees();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const { toast } = useToast();

  const statusVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'default'> = {
    Present: 'success', Late: 'warning', Absent: 'destructive', 'Half Day': 'info', 'On Leave': 'default',
  };

  const statusVariant = (s: string) => statusVariantMap[s] || 'default';

  const markAttendance = (employeeId: string, status: AttendanceRecord['status']) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setRecords((prev) => {
      const existing = prev.find((r) => r.employeeId === employeeId && r.date === selectedDate);
      if (existing) {
        return prev.map((r) => r.employeeId === employeeId && r.date === selectedDate ? { ...r, status, checkIn: status !== 'Absent' ? now : '' } : r);
      }
      return [...prev, { employeeId, date: selectedDate, checkIn: status !== 'Absent' ? now : '', checkOut: '', status }];
    });
    toast({ title: 'Success', description: 'Attendance updated' });
  };

  const present = records.filter((r) => r.date === selectedDate && r.status === 'Present').length;
  const late = records.filter((r) => r.date === selectedDate && r.status === 'Late').length;
  const absent = records.filter((r) => r.date === selectedDate && r.status === 'Absent').length;
  const onLeave = records.filter((r) => r.date === selectedDate && r.status === 'On Leave').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance" description="Track daily employee attendance">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', count: present, icon: CheckCircle2, color: 'text-success' },
          { label: 'Late', count: late, icon: Clock, color: 'text-warning' },
          { label: 'Absent', count: absent, icon: XCircle, color: 'text-destructive' },
          { label: 'On Leave', count: onLeave, icon: Coffee, color: 'text-info' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Check Out</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const record = records.find((r) => r.employeeId === emp.id && r.date === selectedDate);
                return (
                  <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">{emp.firstName[0]}{emp.lastName[0]}</div>
                        <div>
                          <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-muted-foreground">{emp.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{record?.checkIn || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{record?.checkOut || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record?.status || 'Not Marked'} variant={record ? statusVariant(record.status) : 'default'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {(['Present', 'Late', 'Absent', 'Half Day', 'On Leave'] as const).map((s) => (
                          <button key={s} onClick={() => markAttendance(emp.id, s)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              record?.status === s ? 'gradient-primary text-primary-foreground' : 'bg-muted hover:bg-accent text-muted-foreground'
                            }`}>{s}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
