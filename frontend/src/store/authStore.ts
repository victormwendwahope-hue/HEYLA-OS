import { create } from 'zustand';
import { User } from '@/types';
import { api, apiEnabled, setToken, setRefreshToken, getRefreshToken, ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; company: string; accountType?: 'company' | 'individual' }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  hasRole: (...roles: User['role'][]) => boolean;
}

function mapUser(raw: any): User {
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.name,
    company: raw.company || '',
    role: (raw.role || 'employee') as User['role'],
    avatar: raw.avatar,
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

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      if (apiEnabled()) {
        const { token, refreshToken, user } = await api.auth.login(email, password);
        const mapped = mapUser(user);
        persist(mapped, token, refreshToken);
        set({ user: mapped, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (err) {
      if (err instanceof ApiError && err.status > 0) {
        set({ isLoading: false });
        throw err;
      }
      console.warn('[auth] backend unreachable, using mock login', err);
    }
    await new Promise((r) => setTimeout(r, 400));
    const mock: User = { id: '1', email, name: email.split('@')[0], company: 'Heyla Corp', role: 'admin' };
    persist(mock, 'mock-jwt-token');
    set({ user: mock, isAuthenticated: true, isLoading: false });
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      if (apiEnabled()) {
        const { token, refreshToken, user } = await api.auth.register({
          email: data.email, password: data.password, name: data.name,
          company: data.company, accountType: data.accountType || 'company',
        });
        const mapped = mapUser(user);
        persist(mapped, token, refreshToken);
        set({ user: mapped, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (err) {
      if (err instanceof ApiError && err.status > 0) {
        set({ isLoading: false });
        throw err;
      }
      console.warn('[auth] backend unreachable, using mock register', err);
    }
    await new Promise((r) => setTimeout(r, 600));
    const mock: User = { id: '1', email: data.email, name: data.name, company: data.company, role: 'admin' };
    persist(mock, 'mock-jwt-token');
    set({ user: mock, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const rt = getRefreshToken();
    if (apiEnabled()) {
      try { await api.auth.logout(rt || undefined); } catch { /* ignore */ }
    }
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false });
  },

  logoutAll: async () => {
    if (apiEnabled()) {
      try { await api.auth.logoutAll(); } catch { /* ignore */ }
    }
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (...roles) => {
    const u = get().user;
    return !!u && roles.includes(u.role);
  },
}));
