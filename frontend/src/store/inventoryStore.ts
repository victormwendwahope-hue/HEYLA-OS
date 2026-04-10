import { create } from 'zustand';
import api from '@/lib/api';
import type { Product } from '@/types';

interface InventoryState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/inventory/products');
      set({ products: res.data.data || [], loading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: 'Failed to fetch products', loading: false });
    }
  },
  addProduct: async (p) => {
    try {
      await api.post('/inventory/products', p);
      get().fetchProducts();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to add product');
    }
  },
  updateProduct: async (id, data) => {
    try {
      await api.put(`/inventory/products/${id}`, data);
      get().fetchProducts();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to update product');
    }
  },
})); 
