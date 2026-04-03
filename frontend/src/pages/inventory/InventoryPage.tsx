import { useInventoryStore } from '@/store/inventoryStore';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Plus, Search, Package } from 'lucide-react';
import { useState } from 'react';

export default function InventoryPage() {
  const products = useInventoryStore((s) => s.products);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const statusVariant = (s: string) => s === 'In Stock' ? 'success' : s === 'Low Stock' ? 'warning' : 'destructive';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Inventory" description={`${products.length} products — ${formatCurrency(products.reduce((s, p) => s + p.price * p.stock, 0))} total value`}>
        <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
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
          </div>
        ))}
      </div>
    </div>
  );
}
