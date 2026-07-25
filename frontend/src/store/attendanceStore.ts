import { create } from 'zustand';
import { AttendanceRecord } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  updateRecord: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getRecordsByEmployeeAndPeriod: (employeeId: string, startDate: string, endDate: string) => AttendanceRecord[];
  getActiveDays: (employeeId: string, startDate: string, endDate: string) => { active: number; absent: number; total: number };
  clearError: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<AttendanceRecord[]>('/attendance');
      set({ records: data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch attendance';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addRecord: async (record) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<AttendanceRecord>('/attendance', record);
      set((s) => ({ records: [...s.records, created], loading: false }));
      toast.success('Attendance recorded');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to record attendance';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateRecord: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<AttendanceRecord>(`/attendance/${id}`, data);
      set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }));
      toast.success('Attendance updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update attendance';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeRecord: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/attendance/${id}`);
      set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      toast.success('Attendance record deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete attendance record';
      set({ error: msg });
      toast.error(msg);
    }
  },

  getRecordsByDate: (date) => get().records.filter((r) => r.date === date),

  getRecordsByEmployeeAndPeriod: (employeeId, startDate, endDate) =>
    get().records.filter((r) => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate),

  getActiveDays: (employeeId, startDate, endDate) => {
    const empRecords = get().records.filter(
      (r) => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate
    );
    const active = empRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const absent = empRecords.filter((r) => r.status === 'Absent').length;
    return { active, absent, total: empRecords.length };
  },
}));
