import { create } from 'zustand';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

export interface Post {
  id: string; author: string; role: string; avatar: string;
  content: string; image?: string; time: string;
  likes: number; comments: number; liked: boolean;
  authorId: string;
}

export interface Comment {
  id: string; userId: string; userName: string; content: string; createdAt: string;
}

export interface PostWithComments extends Post {
  commentList: Comment[];
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

export interface NetworkSkill { id: string; name: string; endorsements: number; }
export interface NetworkExperience { id: string; title: string; company: string; location: string; startDate: string; endDate: string; current: boolean; description: string; }
export interface NetworkEducation { id: string; school: string; degree: string; field: string; startDate: string; endDate: string; description: string; }

export interface NetworkProfile {
  id: string; userId: string; name: string; email: string;
  headline: string; about: string; location: string;
  website: string; phone: string; photo: string;
  connectionCount: number;
  skills: NetworkSkill[];
  experience: NetworkExperience[];
  education: NetworkEducation[];
}

export interface UserSearchResult {
  id: string; name: string; email: string; company: string; role: string;
}

interface NetworkState {
  posts: PostWithComments[]; jobs: JobPost[]; loading: boolean; error: string | null;
  profile: NetworkProfile | null; profileLoading: boolean;
  connections: any[]; pendingRequests: any[];
  searchResults: UserSearchResult[];
  fetchPosts: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  addPost: (content: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  addJob: (j: Omit<JobPost, 'id' | 'applicants'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  updateApplicant: (jobId: string, applicantId: string, data: { status?: string; notes?: string }) => Promise<void>;
  applyJob: (jobId: string, data: { name: string; email: string; notes?: string }) => Promise<void>;
  fetchProfile: () => Promise<void>;
  saveProfile: (data: Partial<NetworkProfile>) => Promise<void>;
  fetchConnections: () => Promise<void>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
  searchUsers: (q: string) => Promise<void>;
  clearError: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  posts: [], jobs: [], loading: false, error: null,
  profile: null, profileLoading: false,
  connections: [], pendingRequests: [],
  searchResults: [],
  clearError: () => set({ error: null }),

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try { set({ posts: await api.get<PostWithComments[]>('/network-posts'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch posts'); }
  },
  fetchJobs: async () => {
    try { set({ jobs: await api.get<JobPost[]>('/network-jobs') }); }
    catch { toast.error('Failed to fetch jobs'); }
  },

  addPost: async (content) => {
    const user = JSON.parse(localStorage.getItem('heyla_user') || '{}');
    try {
      const created = await api.post<PostWithComments>('/network-posts', {
        author: user.name || 'You', content,
        avatar: (user.name || 'U').split(' ').map((n: string) => n[0]).join(''),
        role: user.role || 'Admin',
        time: 'Just now',
      });
      set((s) => ({ posts: [created, ...s.posts] }));
      toast.success('Post created');
    } catch { toast.error('Failed to create post'); }
  },
  deletePost: async (id) => {
    try { await api.delete(`/network-posts/${id}`); set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })); toast.success('Post deleted'); }
    catch { toast.error('Failed to delete post'); }
  },

  toggleLike: async (id) => {
    const prev = get().posts.find((p) => p.id === id);
    set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p) }));
    try {
      const res = await api.post<{ liked: boolean; likes: number }>(`/network-posts/${id}/like`, {});
      set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, liked: res.liked, likes: res.likes } : p) }));
    } catch {
      if (prev) set((s) => ({ posts: s.posts.map((p) => p.id === id ? prev : p) }));
      toast.error('Failed to update like');
    }
  },

  addComment: async (postId, content) => {
    try {
      const res = await api.post<Comment & { comments: number }>(`/network-posts/${postId}/comments`, { content });
      set((s) => ({
        posts: s.posts.map((p) => p.id === postId ? {
          ...p, comments: res.comments, commentList: [...(p.commentList || []), { id: res.id, userId: res.userId, userName: res.userName, content: res.content, createdAt: res.createdAt }],
        } : p),
      }));
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
  },

  addJob: async (j) => {
    try { const created = await api.post<JobPost>('/network-jobs', j); set((s) => ({ jobs: [...s.jobs, created] })); toast.success('Job posted'); }
    catch { toast.error('Failed to post job'); }
  },
  deleteJob: async (id) => {
    try { await api.delete(`/network-jobs/${id}`); set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })); toast.success('Job removed'); }
    catch { toast.error('Failed to remove job'); }
  },

  updateApplicant: async (jobId, applicantId, data) => {
    try {
      const updated = await api.patch<NetworkApplicant>(`/network-jobs/${jobId}/applicants/${applicantId}`, data);
      set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId ? { ...j, applicants: j.applicants.map((a) => a.id === applicantId ? updated : a) } : j),
      }));
      toast.success('Applicant updated');
    } catch { toast.error('Failed to update applicant'); }
  },

  applyJob: async (jobId, data) => {
    try {
      await api.post<NetworkApplicant>(`/network-jobs/${jobId}/applicants`, data);
      toast.success('Application submitted!');
    } catch { toast.error('Failed to apply'); }
  },

  fetchProfile: async () => {
    set({ profileLoading: true });
    try {
      const profile = await api.get<NetworkProfile | null>('/network/profile');
      set({ profile, profileLoading: false });
    } catch { set({ profileLoading: false }); toast.error('Failed to load profile'); }
  },

  saveProfile: async (data) => {
    try {
      const profile = await api.post<NetworkProfile>('/network/profile', data);
      set({ profile });
      toast.success('Profile saved');
    } catch { toast.error('Failed to save profile'); }
  },

  fetchConnections: async () => {
    try {
      const res = await api.get<{ connections: any[]; pendingRequests: any[] }>('/network/connections');
      set({ connections: res.connections, pendingRequests: res.pendingRequests });
    } catch { toast.error('Failed to load connections'); }
  },

  sendConnectionRequest: async (userId) => {
    try {
      await api.post('/network/connections/connect', { userId });
      toast.success('Connection request sent');
    } catch { toast.error('Failed to send request'); }
  },

  acceptConnection: async (connectionId) => {
    try {
      await api.post('/network/connections/accept', { connectionId });
      get().fetchConnections();
      toast.success('Connection accepted');
    } catch { toast.error('Failed to accept connection'); }
  },

  removeConnection: async (connectionId) => {
    try {
      await api.delete(`/network/connections/${connectionId}`);
      get().fetchConnections();
      toast.success('Connection removed');
    } catch { toast.error('Failed to remove connection'); }
  },

  searchUsers: async (q) => {
    try {
      const results = await api.get<UserSearchResult[]>(`/network/users?q=${encodeURIComponent(q)}`);
      set({ searchResults: results });
    } catch { toast.error('Search failed'); }
  },
}));
