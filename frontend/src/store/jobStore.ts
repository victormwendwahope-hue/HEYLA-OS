import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'Open' | 'Closed' | 'Draft';
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applicants: number;
}

export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  appliedDate: string;
  resumeUrl?: string;
  rating: number;
  notes: string;
}

export interface Interview {
  id: string;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  date: string;
  time: string;
  type: 'Phone' | 'Video' | 'In-Person';
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
}

const mockJobs: Job[] = [
  { id: '1', title: 'Senior Frontend Developer', department: 'Engineering', location: 'Nairobi', type: 'Full-time', status: 'Open', salary: 'KSh 180,000 - 250,000', description: 'Build modern web applications', requirements: ['React/TypeScript', '3+ years experience', 'TailwindCSS'], postedDate: '2024-02-01', applicants: 12 },
  { id: '2', title: 'Sales Executive', department: 'Sales', location: 'Mombasa', type: 'Full-time', status: 'Open', salary: 'KSh 80,000 - 120,000', description: 'Drive B2B sales in the coastal region', requirements: ['2+ years sales', 'B2B experience', 'CRM proficiency'], postedDate: '2024-02-05', applicants: 8 },
  { id: '3', title: 'Marketing Intern', department: 'Marketing', location: 'Nairobi', type: 'Contract', status: 'Open', salary: 'KSh 25,000 - 35,000', description: 'Support digital marketing campaigns', requirements: ['Marketing degree', 'Social media skills', 'Creative writing'], postedDate: '2024-02-10', applicants: 24 },
  { id: '4', title: 'Financial Analyst', department: 'Finance', location: 'Nairobi', type: 'Full-time', status: 'Closed', salary: 'KSh 120,000 - 160,000', description: 'Financial modeling and reporting', requirements: ['CPA/CFA', '3+ years experience', 'Excel/Power BI'], postedDate: '2024-01-15', applicants: 6 },
];

const mockApplicants: Applicant[] = [
  { id: '1', jobId: '1', name: 'Grace Wambui', email: 'grace@email.com', phone: '+254 712 000 111', stage: 'Interview', appliedDate: '2024-02-03', rating: 4, notes: 'Strong React portfolio' },
  { id: '2', jobId: '1', name: 'David Kiprotich', email: 'david@email.com', phone: '+254 733 000 222', stage: 'Screening', appliedDate: '2024-02-05', rating: 3, notes: 'Needs TypeScript assessment' },
  { id: '3', jobId: '1', name: 'Fatuma Ali', email: 'fatuma@email.com', phone: '+254 700 000 333', stage: 'Applied', appliedDate: '2024-02-10', rating: 0, notes: '' },
  { id: '4', jobId: '2', name: 'Joseph Ndungu', email: 'joseph@email.com', phone: '+254 711 000 444', stage: 'Offer', appliedDate: '2024-02-06', rating: 5, notes: 'Excellent B2B track record' },
  { id: '5', jobId: '1', name: 'Lucy Chebet', email: 'lucy@email.com', phone: '+254 745 000 555', stage: 'Hired', appliedDate: '2024-02-02', rating: 5, notes: 'Started onboarding' },
  { id: '6', jobId: '3', name: 'Kevin Onyango', email: 'kevin@email.com', phone: '+254 722 000 666', stage: 'Applied', appliedDate: '2024-02-11', rating: 0, notes: '' },
];

const mockInterviews: Interview[] = [
  { id: '1', applicantId: '1', applicantName: 'Grace Wambui', jobTitle: 'Senior Frontend Developer', date: '2024-02-20', time: '10:00 AM', type: 'Video', interviewer: 'Njeri Kariuki', status: 'Scheduled', notes: 'Technical round' },
  { id: '2', applicantId: '4', applicantName: 'Joseph Ndungu', jobTitle: 'Sales Executive', date: '2024-02-18', time: '2:00 PM', type: 'In-Person', interviewer: 'Ochieng Otieno', status: 'Completed', notes: 'Final round - passed' },
];

interface JobState {
  jobs: Job[];
  applicants: Applicant[];
  interviews: Interview[];
  loading: boolean;
  fetchJobs: () => Promise<void>;
  fetchApplicants: () => Promise<void>;
  fetchInterviews: () => Promise<void>;
  addJob: (j: Job) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  addApplicant: (a: Applicant) => Promise<void>;
  updateApplicant: (id: string, data: Partial<Applicant>) => Promise<void>;
  addInterview: (i: Interview) => Promise<void>;
  updateInterview: (id: string, data: Partial<Interview>) => Promise<void>;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: mockJobs,
  applicants: mockApplicants,
  interviews: mockInterviews,
  loading: false,
  fetchJobs: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Job[]>('/jobs');
      set({ jobs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchApplicants: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Applicant[]>('/applicants');
      set({ applicants: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchInterviews: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Interview[]>('/interviews');
      set({ interviews: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addJob: async (j) => {
    try {
      const created = await api.post<Job>('/jobs', j);
      set((s) => ({ jobs: [...s.jobs, created] }));
      toast.success('Job created');
    } catch {
      set((s) => ({ jobs: [...s.jobs, j] }));
      toast.error('Failed to create job');
    }
  },
  updateJob: async (id, data) => {
    try {
      const updated = await api.patch<Job>(`/jobs/${id}`, data);
      set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? updated : j) }));
      toast.success('Job updated');
    } catch {
      set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, ...data } : j) }));
      toast.error('Failed to update job');
    }
  },
  removeJob: async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
      toast.success('Job deleted');
    } catch {
      set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
      toast.error('Failed to delete job');
    }
  },
  addApplicant: async (a) => {
    try {
      const created = await api.post<Applicant>('/applicants', a);
      set((s) => ({ applicants: [...s.applicants, created] }));
      toast.success('Applicant added');
    } catch {
      set((s) => ({ applicants: [...s.applicants, a] }));
      toast.error('Failed to add applicant');
    }
  },
  updateApplicant: async (id, data) => {
    try {
      const updated = await api.patch<Applicant>(`/applicants/${id}`, data);
      set((s) => ({ applicants: s.applicants.map((a) => a.id === id ? updated : a) }));
      toast.success('Applicant updated');
    } catch {
      set((s) => ({ applicants: s.applicants.map((a) => a.id === id ? { ...a, ...data } : a) }));
      toast.error('Failed to update applicant');
    }
  },
  addInterview: async (i) => {
    try {
      const created = await api.post<Interview>('/interviews', i);
      set((s) => ({ interviews: [...s.interviews, created] }));
      toast.success('Interview scheduled');
    } catch {
      set((s) => ({ interviews: [...s.interviews, i] }));
      toast.error('Failed to schedule interview');
    }
  },
  updateInterview: async (id, data) => {
    try {
      const updated = await api.patch<Interview>(`/interviews/${id}`, data);
      set((s) => ({ interviews: s.interviews.map((i) => i.id === id ? updated : i) }));
      toast.success('Interview updated');
    } catch {
      set((s) => ({ interviews: s.interviews.map((i) => i.id === id ? { ...i, ...data } : i) }));
      toast.error('Failed to update interview');
    }
  },
}));
