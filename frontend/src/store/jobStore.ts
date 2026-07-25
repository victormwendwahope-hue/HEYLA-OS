import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Job {
  id: string; title: string; department: string; location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'Open' | 'Closed' | 'Draft'; salary: string;
  description: string; requirements: string[];
  postedDate: string; applicants: number;
}

export interface Applicant {
  id: string; jobId: string; name: string; email: string; phone: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  appliedDate: string; resumeUrl?: string; rating: number; notes: string;
}

export interface Interview {
  id: string; applicantId: string; applicantName: string; jobTitle: string;
  date: string; time: string; type: 'Phone' | 'Video' | 'In-Person';
  interviewer: string; status: 'Scheduled' | 'Completed' | 'Cancelled'; notes: string;
}

interface JobState {
  jobs: Job[]; applicants: Applicant[]; interviews: Interview[];
  loading: boolean; error: string | null;
  fetchJobs: () => Promise<void>;
  fetchApplicants: () => Promise<void>;
  fetchInterviews: () => Promise<void>;
  addJob: (j: Omit<Job, 'id' | 'postedDate' | 'applicants'>) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  addApplicant: (a: Omit<Applicant, 'id' | 'appliedDate'>) => Promise<void>;
  updateApplicant: (id: string, data: Partial<Applicant>) => Promise<void>;
  addInterview: (i: Omit<Interview, 'id'>) => Promise<void>;
  updateInterview: (id: string, data: Partial<Interview>) => Promise<void>;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [], applicants: [], interviews: [],
  loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try { set({ jobs: await api.get<Job[]>('/jobs'), loading: false }); }
    catch (err) { set({ error: (err as Error).message, loading: false }); toast.error('Failed to fetch jobs'); }
  },
  fetchApplicants: async () => {
    try { set({ applicants: await api.get<Applicant[]>('/applicants') }); }
    catch { toast.error('Failed to fetch applicants'); }
  },
  fetchInterviews: async () => {
    try { set({ interviews: await api.get<Interview[]>('/interviews') }); }
    catch { toast.error('Failed to fetch interviews'); }
  },

  addJob: async (j) => {
    try { const created = await api.post<Job>('/jobs', j); set((s) => ({ jobs: [...s.jobs, created] })); toast.success('Job created'); }
    catch { toast.error('Failed to create job'); }
  },
  updateJob: async (id, data) => {
    try { const updated = await api.patch<Job>(`/jobs/${id}`, data); set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? updated : j)) })); toast.success('Job updated'); }
    catch { toast.error('Failed to update job'); }
  },
  removeJob: async (id) => {
    try { await api.delete(`/jobs/${id}`); set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })); toast.success('Job removed'); }
    catch { toast.error('Failed to remove job'); }
  },

  addApplicant: async (a) => {
    try { const created = await api.post<Applicant>('/applicants', a); set((s) => ({ applicants: [...s.applicants, created] })); toast.success('Applicant added'); }
    catch { toast.error('Failed to add applicant'); }
  },
  updateApplicant: async (id, data) => {
    try { const updated = await api.patch<Applicant>(`/applicants/${id}`, data); set((s) => ({ applicants: s.applicants.map((a) => (a.id === id ? updated : a)) })); toast.success('Applicant updated'); }
    catch { toast.error('Failed to update applicant'); }
  },

  addInterview: async (i) => {
    try { const created = await api.post<Interview>('/interviews', i); set((s) => ({ interviews: [...s.interviews, created] })); toast.success('Interview scheduled'); }
    catch { toast.error('Failed to schedule interview'); }
  },
  updateInterview: async (id, data) => {
    try { const updated = await api.patch<Interview>(`/interviews/${id}`, data); set((s) => ({ interviews: s.interviews.map((i) => (i.id === id ? updated : i)) })); toast.success('Interview updated'); }
    catch { toast.error('Failed to update interview'); }
  },
}));
