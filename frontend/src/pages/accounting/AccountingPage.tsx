import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jul', income: 1200000, expenses: 800000 },
  { month: 'Aug', income: 1450000, expenses: 900000 },
  { month: 'Sep', income: 1350000, expenses: 850000 },
  { month: 'Oct', income: 1800000, expenses: 1100000 },
  { month: 'Nov', income: 2100000, expenses: 1200000 },
  { month: 'Dec', income: 2400000, expenses: 1350000 },
];

const invoices = [
  { id: 'INV-2024-047', client: 'Safaricom PLC', amount: 850000, status: 'Paid', date: '2024-01-15' },
  { id: 'INV-2024-048', client: 'KCB Group', amount: 420000, status: 'Sent', date: '2024-01-20' },
  { id: 'INV-2024-049', client: 'Twiga Foods', amount: 175000, status: 'Overdue', date: '2024-01-05' },
  { id: 'INV-2024-050', client: 'M-KOPA Solar', amount: 1200000, status: 'Draft', date: '2024-02-01' },
];

const statusVariant = (s: string) => {
  const m: Record<string, 'success' | 'info' | 'destructive' | 'default'> = { Paid: 'success', Sent: 'info', Overdue: 'destructive', Draft: 'default' };
  return m[s] || 'default';
};

export default function AccountingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Accounting" description="Revenue, expenses, and invoice management" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(8300000)} change="+22% YoY" changeType="positive" icon={ArrowUpRight} iconColor="gradient-primary" />
        <StatCard title="Total Expenses" value={formatCurrency(5200000)} change="+8% YoY" changeType="negative" icon={ArrowDownRight} />
        <StatCard title="Net Profit" value={formatCurrency(3100000)} change="+41% YoY" changeType="positive" icon={DollarSign} />
        <StatCard title="Pending Invoices" value="3" change={formatCurrency(1795000)} changeType="neutral" icon={FileText} />
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
          <h3 className="font-semibold">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Invoice', 'Client', 'Amount', 'Status', 'Date'].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
