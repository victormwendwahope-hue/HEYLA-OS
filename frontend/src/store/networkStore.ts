import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Post {
  id: string; author: string; role: string; avatar: string;
  content: string; image?: string; time: string;
  likes: number; comments: number; liked: boolean;
}

export interface NetworkApplicant {
  id: string; name: string; email: string; avatar: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string; notes: string;
}

export interface JobPost {
  id: string; title: string; company: string; location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  salary: string; posted: string; skills: string[];
  description: string; applicants: NetworkApplicant[];
}

interface NetworkState {
  posts: Post[]; jobs: JobPost[]; loading: boolean; error: string | null;
  fetchPosts: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  addPost: (p: Omit<Post, 'id'>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  addJob: (j: Omit<JobPost, 'id' | 'applicants'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  posts: [], jobs: [], loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try { set({ posts: await api.get<Post[]>('/network-posts'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch posts'); }
  },
  fetchJobs: async () => {
    try { set({ jobs: await api.get<JobPost[]>('/network-jobs') }); }
    catch { toast.error('Failed to fetch jobs'); }
  },

  addPost: async (p) => {
    try { const created = await api.post<Post>('/network-posts', p); set((s) => ({ posts: [created, ...s.posts] })); toast.success('Post created'); }
    catch { toast.error('Failed to create post'); }
  },
  deletePost: async (id) => {
    try { await api.delete(`/network-posts/${id}`); set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })); toast.success('Post deleted'); }
    catch { toast.error('Failed to delete post'); }
  },

  toggleLike: (id) => {
    set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p) }));
  },

  addJob: async (j) => {
    try { const created = await api.post<JobPost>('/network-jobs', j); set((s) => ({ jobs: [...s.jobs, created] })); toast.success('Job posted'); }
    catch { toast.error('Failed to post job'); }
  },
  deleteJob: async (id) => {
    try { await api.delete(`/network-jobs/${id}`); set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })); toast.success('Job removed'); }
    catch { toast.error('Failed to remove job'); }
  },
}));
