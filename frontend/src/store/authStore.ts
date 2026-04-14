import { create } from 'zustand';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';

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

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data.data;
      localStorage.setItem('heyla_token', access_token);
      localStorage.setItem('heyla_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      toast({
        description: 'Login failed. Check credentials.',
      });
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user } = response.data.data;
      localStorage.setItem('heyla_token', access_token);
      localStorage.setItem('heyla_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      toast({
        description: 'Registration failed.',
      });
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('heyla_token');
    localStorage.removeItem('heyla_user');
    set({ user: null, isAuthenticated: false });
  },
}));
