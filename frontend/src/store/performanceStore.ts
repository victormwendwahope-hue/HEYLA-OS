import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface PerformanceGoal {
  id?: string;
  title: string;
  progress: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  quarter: string;
  rating: number;
  feedback: string;
  goals: PerformanceGoal[];
}

interface PerformanceState {
  reviews: PerformanceReview[];
  loading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  addReview: (r: Omit<PerformanceReview, 'id' | 'goals'> & { goals: PerformanceGoal[] }) => Promise<void>;
  updateReview: (id: string, data: Partial<PerformanceReview>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  reviews: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<PerformanceReview[]>('/performance-reviews');
      set({ reviews: data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch reviews';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addReview: async (r) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<PerformanceReview>('/performance-reviews', r);
      set((s) => ({ reviews: [created, ...s.reviews], loading: false }));
      toast.success('Review created');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create review';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateReview: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<PerformanceReview>(`/performance-reviews/${id}`, data);
      set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? updated : r)) }));
      toast.success('Review updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update review';
      set({ error: msg });
      toast.error(msg);
    }
  },

  deleteReview: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/performance-reviews/${id}`);
      set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
      toast.success('Review deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
