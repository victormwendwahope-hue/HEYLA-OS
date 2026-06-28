import { create } from 'zustand';
import { AttendanceRecord } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: AttendanceRecord) => Promise<void>;
  updateRecord: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getRecordsByEmployeeAndPeriod: (employeeId: string, startDate: string, endDate: string) => AttendanceRecord[];
  getActiveDays: (employeeId: string, startDate: string, endDate: string) => { active: number; absent: number; total: number };
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const data = await api.get<AttendanceRecord[]>('/attendance');
      set({ records: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const created = await api.post<AttendanceRecord>('/attendance', record);
      set((s) => ({ records: [...s.records, created] }));
      toast.success('Attendance recorded');
    } catch {
      set((s) => ({ records: [...s.records, record] }));
      toast.error('Failed to record attendance');
    }
  },
  updateRecord: async (id, data) => {
    try {
      const updated = await api.patch<AttendanceRecord>(`/attendance/${id}`, data);
      set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }));
      toast.success('Attendance updated');
    } catch {
      set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, ...data } : r)) }));
      toast.error('Failed to update attendance');
    }
  },
  getRecordsByDate: (date) => get().records.filter((r) => r.date === date),
  getRecordsByEmployeeAndPeriod: (employeeId, startDate, endDate) =>
    get().records.filter((r) => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate),
  getActiveDays: (employeeId, startDate, endDate) => {
    const empRecords = get().records.filter(
      (r) => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate
    );
    const active = empRecords.filter((r) => r.status !== 'Absent').length;
    const absent = empRecords.filter((r) => r.status === 'Absent').length;
    return { active, absent, total: empRecords.length };
  },
}));