import { create } from 'zustand';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: () => void;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; company: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  hydrate: () => {
    const token = localStorage.getItem('heyla_token');
    const userStr = localStorage.getItem('heyla_user');
    if (token && userStr) {
      set({ 
        token,
        user: JSON.parse(userStr), 
        isAuthenticated: true 
      });
    }
  },

  initAuth: async () => {
    set({ isLoading: true });
    try {
      // Instant hydrate from localStorage
      get().hydrate();
      
      // Optional fresh /auth/me (don't fail session on error)
      const response = await api.get('/auth/me');
      if (response.data.data.user) {
        localStorage.setItem('heyla_user', JSON.stringify(response.data.data.user));
        set({ user: response.data.data.user });
      }
    } catch (error) {
      console.warn('[AUTH] /auth/me failed - using cached session:', error.response?.status);
      // Don't clear storage - keep hydrated state
    } finally {
      set({ isLoading: false });
    }
  },

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

