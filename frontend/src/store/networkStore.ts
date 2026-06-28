import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  image?: string;
  time: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  salary: string;
  posted: string;
  skills: string[];
  description: string;
  applicants: Applicant[];
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string;
  notes: string;
}

interface NetworkState {
  posts: Post[];
  jobs: JobPost[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  addPost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  addJob: (job: JobPost) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  updateApplicant: (jobId: string, applicantId: string, data: Partial<Applicant>) => void;
  addApplicant: (jobId: string, applicant: Applicant) => void;
}

const mockPosts: Post[] = [
  { id: '1', author: 'Wanjiku Mwangi', role: 'Senior Developer', avatar: 'WM', content: 'Just shipped the new payment integration for M-PESA! 🚀 Excited to see how this scales across East Africa.', time: '2 hours ago', likes: 24, comments: 8, liked: false },
  { id: '2', author: 'Ochieng Otieno', role: 'Sales Manager', avatar: 'OO', content: 'Closed the biggest deal this quarter with Safaricom PLC. Team effort! 🎉', time: '5 hours ago', likes: 45, comments: 12, liked: false },
  { id: '3', author: 'Amina Hassan', role: 'Accountant', avatar: 'AH', content: 'Reminder: Q4 reports are due next Friday. Please submit your department expenses.', time: '1 day ago', likes: 8, comments: 3, liked: false },
];

const mockJobs: JobPost[] = [
  {
    id: '1', title: 'Full Stack Developer', company: 'Heyla Corp', location: 'Nairobi, Kenya',
    type: 'Full-time', salary: '180K - 250K KES', posted: '2 days ago',
    skills: ['React', 'Node.js', 'TypeScript'],
    description: 'We are looking for a skilled full stack developer to join our growing team.',
    applicants: [
      { id: 'a1', name: 'Grace Wambui', email: 'grace@email.com', avatar: 'GW', status: 'Interview', appliedDate: '2024-01-18', notes: 'Strong React skills' },
      { id: 'a2', name: 'Kevin Odhiambo', email: 'kevin@email.com', avatar: 'KO', status: 'Screening', appliedDate: '2024-01-20', notes: '' },
    ],
  },
  {
    id: '2', title: 'Sales Executive', company: 'TechVentures', location: 'Mombasa, Kenya',
    type: 'Full-time', salary: '100K - 150K KES', posted: '1 week ago',
    skills: ['B2B Sales', 'CRM', 'Negotiation'],
    description: 'Looking for an experienced sales executive to drive growth in the coastal region.',
    applicants: [
      { id: 'a3', name: 'Fatuma Ali', email: 'fatuma@email.com', avatar: 'FA', status: 'Applied', appliedDate: '2024-01-22', notes: '' },
    ],
  },
  {
    id: '3', title: 'UI/UX Designer', company: 'DesignHub', location: 'Remote',
    type: 'Contract', salary: '120K - 180K KES', posted: '3 days ago',
    skills: ['Figma', 'User Research', 'Prototyping'],
    description: 'Contract position for a talented UI/UX designer.',
    applicants: [],
  },
];

export const useNetworkStore = create<NetworkState>((set) => ({
  posts: mockPosts,
  jobs: mockJobs,
  loading: false,
  fetchPosts: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Post[]>('/network-posts');
      set({ posts: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchJobs: async () => {
    set({ loading: true });
    try {
      const data = await api.get<JobPost[]>('/network-jobs');
      set({ jobs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addPost: async (post) => {
    try {
      const created = await api.post<Post>('/network-posts', post);
      set((s) => ({ posts: [created, ...s.posts] }));
      toast.success('Post created');
    } catch {
      set((s) => ({ posts: [post, ...s.posts] }));
      toast.error('Failed to create post');
    }
  },
  deletePost: async (id) => {
    try {
      await api.delete(`/network-posts/${id}`);
      set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
      toast.success('Post deleted');
    } catch {
      set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
      toast.error('Failed to delete post');
    }
  },
  toggleLike: (id) => set((s) => ({
    posts: s.posts.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p),
  })),
  addJob: async (job) => {
    try {
      const created = await api.post<JobPost>('/network-jobs', job);
      set((s) => ({ jobs: [created, ...s.jobs] }));
      toast.success('Job created');
    } catch {
      set((s) => ({ jobs: [job, ...s.jobs] }));
      toast.error('Failed to create job');
    }
  },
  deleteJob: async (id) => {
    try {
      await api.delete(`/network-jobs/${id}`);
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
      toast.success('Job deleted');
    } catch {
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
      toast.error('Failed to delete job');
    }
  },
  updateApplicant: (jobId, applicantId, data) => set((s) => ({
    jobs: s.jobs.map((j) => j.id === jobId ? {
      ...j,
      applicants: j.applicants.map((a) => a.id === applicantId ? { ...a, ...data } : a),
    } : j),
  })),
  addApplicant: (jobId, applicant) => set((s) => ({
    jobs: s.jobs.map((j) => j.id === jobId ? { ...j, applicants: [...j.applicants, applicant] } : j),
  })),
}));
