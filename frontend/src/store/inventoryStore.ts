import { create } from 'zustand';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const mockProducts: Product[] = [
  { id: '1', name: 'Solar Panel 300W', sku: 'SOL-300', category: 'Energy', price: 45000, cost: 32000, stock: 24, minStock: 10, status: 'In Stock' },
  { id: '2', name: 'Inverter 5KVA', sku: 'INV-5K', category: 'Energy', price: 85000, cost: 60000, stock: 8, minStock: 5, status: 'In Stock' },
  { id: '3', name: 'Battery 200Ah', sku: 'BAT-200', category: 'Energy', price: 35000, cost: 25000, stock: 3, minStock: 5, status: 'Low Stock' },
  { id: '4', name: 'Ethernet Cable 100m', sku: 'NET-100', category: 'Networking', price: 3500, cost: 2000, stock: 0, minStock: 20, status: 'Out of Stock' },
  { id: '5', name: 'Laptop Stand', sku: 'ACC-LS1', category: 'Accessories', price: 4500, cost: 2500, stock: 45, minStock: 10, status: 'In Stock' },
  { id: '6', name: 'USB-C Hub', sku: 'ACC-HUB', category: 'Accessories', price: 6500, cost: 3800, stock: 12, minStock: 8, status: 'In Stock' },
];

interface InventoryState {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: mockProducts,
  loading: false,
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Product[]>('/products');
      set({ products: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addProduct: async (p) => {
    try {
      const created = await api.post<Product>('/products', p);
      set((s) => ({ products: [...s.products, created] }));
      toast.success('Product created');
    } catch {
      set((s) => ({ products: [...s.products, p] }));
      toast.error('Failed to create product');
    }
  },
  updateProduct: async (id, data) => {
    try {
      const updated = await api.patch<Product>(`/products/${id}`, data);
      set((s) => ({ products: s.products.map((p) => (p.id === id ? updated : p)) }));
      toast.success('Product updated');
    } catch {
      set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
      toast.error('Failed to update product');
    }
  },
  removeProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      toast.success('Product deleted');
    } catch {
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      toast.error('Failed to delete product');
    }
  },
}));
