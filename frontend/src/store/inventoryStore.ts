import { create } from 'zustand';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

interface InventoryState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (p: Omit<Product, 'id' | 'status'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Product[]>('/products');
      set({ products: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addProduct: async (p) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Product>('/products', p);
      set((s) => ({ products: [created, ...s.products], loading: false }));
      toast.success('Product added');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateProduct: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<Product>(`/products/${id}`, data);
      set((s) => ({ products: s.products.map((p) => (p.id === id ? updated : p)) }));
      toast.success('Product updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update product';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeProduct: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/products/${id}`);
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      toast.success('Product deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
