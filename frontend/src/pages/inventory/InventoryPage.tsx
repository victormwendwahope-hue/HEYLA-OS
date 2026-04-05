import { useInventoryStore } from '@/store/inventoryStore';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Plus, Search, Package, X, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types';

const emptyForm = { name: '', sku: '', category: '', price: 0, cost: 0, stock: 0, minStock: 5 };

export default function InventoryPage() {
  const { products, addProduct, updateProduct } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const statusVariant = (s: string) => s === 'In Stock' ? 'success' : s === 'Low Stock' ? 'warning' : 'destructive';

  const getStatus = (stock: number, minStock: number): Product['status'] => stock === 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => { setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, cost: p.cost, stock: p.stock, minStock: p.minStock }); setEditId(p.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) { toast.error('Name and SKU required'); return; }
    const status = getStatus(form.stock, form.minStock);
    if (editId) {
      updateProduct(editId, { ...form, status });
      toast.success('Product updated');
    } else {
      addProduct({ ...form, id: Date.now().toString(), status });
      toast.success('Product added');
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Inventory" description={`${products.length} products — ${formatCurrency(products.reduce((s, p) => s + p.price * p.stock, 0))} total value`}>
        <button onClick={openAdd} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-muted">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
              </div>
              <StatusBadge status={p.status} variant={statusVariant(p.status)} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-sm font-semibold">{formatCurrency(p.price)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-sm font-semibold">{formatCurrency(p.cost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className={`text-sm font-semibold ${p.stock <= p.minStock ? 'text-destructive' : ''}`}>{p.stock} units</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: 'Product Name*', field: 'name' },
                { label: 'SKU*', field: 'sku' },
                { label: 'Category', field: 'category' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.field]} onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Price', field: 'price' },
                  { label: 'Cost', field: 'cost' },
                  { label: 'Stock', field: 'stock' },
                  { label: 'Min Stock', field: 'minStock' },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                    <input type="number" value={(form as any)[f.field]} onChange={(e) => setForm({ ...form, [f.field]: +e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editId ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
