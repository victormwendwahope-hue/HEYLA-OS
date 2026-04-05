import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText, Plus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

const monthlyData = [
  { month: 'Jul', income: 1200000, expenses: 800000 },
  { month: 'Aug', income: 1450000, expenses: 900000 },
  { month: 'Sep', income: 1350000, expenses: 850000 },
  { month: 'Oct', income: 1800000, expenses: 1100000 },
  { month: 'Nov', income: 2100000, expenses: 1200000 },
  { month: 'Dec', income: 2400000, expenses: 1350000 },
];

interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Sent' | 'Overdue' | 'Draft';
  date: string;
}

const statusVariant = (s: string) => {
  const m: Record<string, 'success' | 'info' | 'destructive' | 'default'> = { Paid: 'success', Sent: 'info', Overdue: 'destructive', Draft: 'default' };
  return m[s] || 'default';
};

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2024-047', client: 'Safaricom PLC', amount: 850000, status: 'Paid', date: '2024-01-15' },
    { id: 'INV-2024-048', client: 'KCB Group', amount: 420000, status: 'Sent', date: '2024-01-20' },
    { id: 'INV-2024-049', client: 'Twiga Foods', amount: 175000, status: 'Overdue', date: '2024-01-05' },
    { id: 'INV-2024-050', client: 'M-KOPA Solar', amount: 1200000, status: 'Draft', date: '2024-02-01' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: '', amount: 0, status: 'Draft' as Invoice['status'], date: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client || !form.amount) { toast.error('Client and amount required'); return; }
    setInvoices((prev) => [...prev, { ...form, id: `INV-${Date.now().toString().slice(-7)}` }]);
    setShowForm(false);
    setForm({ client: '', amount: 0, status: 'Draft', date: '' });
    toast.success('Invoice created');
  };

  const markPaid = (id: string) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: 'Paid' as const } : inv));
    toast.success('Marked as paid');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Accounting" description="Revenue, expenses, and invoice management">
        <button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(8300000)} change="+22% YoY" changeType="positive" icon={ArrowUpRight} iconColor="gradient-primary" />
        <StatCard title="Total Expenses" value={formatCurrency(5200000)} change="+8% YoY" changeType="negative" icon={ArrowDownRight} />
        <StatCard title="Net Profit" value={formatCurrency(3100000)} change="+41% YoY" changeType="positive" icon={DollarSign} />
        <StatCard title="Pending Invoices" value={String(invoices.filter((i) => i.status !== 'Paid').length)} change={formatCurrency(invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0))} changeType="neutral" icon={FileText} />
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4">Income vs Expenses (KES)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
            <Area type="monotone" dataKey="income" stroke="hsl(142, 71%, 45%)" fill="url(#incGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" fill="url(#expGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Invoice', 'Client', 'Amount', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{inv.id}</td>
                  <td className="px-4 py-3">{inv.client}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} variant={statusVariant(inv.status)} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3">
                    {inv.status !== 'Paid' && (
                      <button onClick={() => markPaid(inv.id)} className="text-xs text-success font-medium hover:underline">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">New Invoice</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Client Name*</label>
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (KES)*</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
