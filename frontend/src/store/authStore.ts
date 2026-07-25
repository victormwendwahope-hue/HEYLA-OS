import { create } from 'zustand';
import { User } from '@/types';
import { api, apiEnabled, setToken, setRefreshToken, getRefreshToken, ApiError } from '@/lib/api';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    company: string;
    accountType?: 'company' | 'individual';
    facilityName?: string;
    facilityLogo?: string;
  }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  googleRegister: (data: {
    credential: string;
    password: string;
    facilityName?: string;
    facilityLogo?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; company?: string; avatar?: string; facilityName?: string; facilityLogo?: string }) => Promise<void>;
  updateFacility: (data: { facilityName?: string; facilityLogo?: string }) => Promise<void>;
  hasRole: (...roles: User['role'][]) => boolean;
  clearError: () => void;
}

function mapUser(raw: any): User {
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.name,
    company: raw.company || '',
    role: (raw.role || 'employee') as User['role'],
    avatar: raw.avatar,
    facilityName: raw.facilityName || raw.facility_name || '',
    facilityLogo: raw.facilityLogo || raw.facility_logo || '',
    accountId: raw.accountId || raw.account_id || raw.id || String(raw.id),
  };
}

function persist(user: User, token: string, refresh?: string) {
  setToken(token);
  if (refresh) setRefreshToken(refresh);
  localStorage.setItem('heyla_user', JSON.stringify(user));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('heyla_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('heyla_token'),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (!apiEnabled()) throw new ApiError('API not configured (set VITE_API_URL)', 0, null);
      const { token, refreshToken, user } = await api.auth.login(email, password);
      const mapped = mapUser(user);
      persist(mapped, token, refreshToken);
      set({ user: mapped, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${mapped.name}!`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (!apiEnabled()) throw new ApiError('API not configured (set VITE_API_URL)', 0, null);
      const { token, refreshToken, user } = await api.auth.register({
        email: data.email,
        password: data.password,
        name: data.name,
        company: data.company || data.facilityName || '',
        accountType: data.accountType || 'company',
        facilityName: data.facilityName,
        facilityLogo: data.facilityLogo,
      });
      const mapped = mapUser(user);
      persist(mapped, token, refreshToken);
      set({ user: mapped, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const rt = getRefreshToken();
    if (apiEnabled()) {
      try {
        await api.auth.logout(rt || undefined);
      } catch {
        /* ignore */
      }
    }
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false, error: null });
    toast.success('Logged out');
  },

  logoutAll: async () => {
    if (apiEnabled()) {
      try {
        await api.auth.logoutAll();
      } catch {
        /* ignore */
      }
    }
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    localStorage.setItem('heyla_user', JSON.stringify(updated));
    set({ user: updated });
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ error: null });
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      toast.success('Password changed. Please log in again.');
      get().logout();
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Failed to change password';
      set({ error: msg });
      toast.error(msg);
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      if (!apiEnabled()) throw new ApiError('API not configured', 0, null);
      const { token, refreshToken, user } = await api.auth.googleLogin(credential);
      const mapped = mapUser(user);
      persist(mapped, token, refreshToken);
      set({ user: mapped, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${mapped.name}!`);
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Google login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  googleRegister: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (!apiEnabled()) throw new ApiError('API not configured', 0, null);
      const { token, refreshToken, user } = await api.auth.googleRegister(data);
      const mapped = mapUser(user);
      persist(mapped, token, refreshToken);
      set({ user: mapped, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Google registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (data) => {
    set({ error: null });
    try {
      const res = await api.auth.updateProfile(data);
      const mapped = mapUser(res.user);
      const current = get().user;
      const updated = { ...current, ...mapped };
      localStorage.setItem('heyla_user', JSON.stringify(updated));
      set({ user: updated });
      toast.success('Profile updated');
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Failed to update profile';
      set({ error: msg });
      toast.error(msg);
    }
  },

  updateFacility: async (data) => {
    set({ error: null });
    try {
      const res = await api.auth.updateProfile(data);
      const mapped = mapUser(res.user);
      const current = get().user;
      const updated = { ...current, ...mapped };
      localStorage.setItem('heyla_user', JSON.stringify(updated));
      set({ user: updated });
      toast.success('Facility updated');
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as any)?.error || err.message : 'Failed to update facility';
      toast.error(msg);
    }
  },

  hasRole: (...roles) => {
    const u = get().user;
    return !!u && roles.includes(u.role);
  },
}));
