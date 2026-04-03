import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; company: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('heyla_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('heyla_token'),
  isLoading: false,

  login: async (email, _password) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    const user: User = {
      id: '1',
      email,
      name: 'John Kamau',
      company: 'Heyla Corp',
      role: 'admin',
    };
    localStorage.setItem('heyla_token', 'mock-jwt-token');
    localStorage.setItem('heyla_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (data) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1000));
    const user: User = {
      id: '1',
      email: data.email,
      name: data.name,
      company: data.company,
      role: 'admin',
    };
    localStorage.setItem('heyla_token', 'mock-jwt-token');
    localStorage.setItem('heyla_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('heyla_token');
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false });
  },
}));
