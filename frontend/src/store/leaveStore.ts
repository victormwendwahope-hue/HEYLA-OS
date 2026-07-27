import { create } from 'zustand';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Compassionate' | 'Study';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  days: number;
}

interface LeaveState {
  leaves: LeaveRequest[];
  loading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  addLeave: (l: Omit<LeaveRequest, 'id' | 'days' | 'status'>) => Promise<void>;
  updateLeave: (id: string, data: Partial<LeaveRequest>) => Promise<void>;
  removeLeave: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchLeaves: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<LeaveRequest[]>('/leave');
      set({ leaves: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leaves';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addLeave: async (l) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<LeaveRequest>('/leave', l);
      set((s) => ({ leaves: [created, ...s.leaves], loading: false }));
      toast.success('Leave request submitted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit leave';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateLeave: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<LeaveRequest>(`/leave/${id}`, data);
      set((s) => ({ leaves: s.leaves.map((l) => (l.id === id ? updated : l)) }));
      toast.success('Leave updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update leave';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeLeave: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/leave/${id}`);
      set((s) => ({ leaves: s.leaves.filter((l) => l.id !== id) }));
      toast.success('Leave deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete leave';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
