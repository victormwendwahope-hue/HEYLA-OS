import { create } from 'zustand';
import { Product } from '@/types';

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
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: mockProducts,
  addProduct: (p) => set((s) => ({ products: [...s.products, p] })),
  updateProduct: (id, data) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
}));
