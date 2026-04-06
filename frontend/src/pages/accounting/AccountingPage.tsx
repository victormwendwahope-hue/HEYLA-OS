import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText, Plus, X, CreditCard, Receipt, PieChart as PieIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { toast } from 'sonner';

const monthlyData = [
  { month: 'Jul', income: 1200000, expenses: 800000 },
  { month: 'Aug', income: 1450000, expenses: 900000 },
  { month: 'Sep', income: 1350000, expenses: 850000 },
  { month: 'Oct', income: 1800000, expenses: 1100000 },
  { month: 'Nov', income: 2100000, expenses: 1200000 },
  { month: 'Dec', income: 2400000, expenses: 1350000 },
  { month: 'Jan', income: 2200000, expenses: 1250000 },
  { month: 'Feb', income: 2650000, expenses: 1400000 },
];

const expenseCategories = [
  { name: 'Salaries', value: 3200000 },
  { name: 'Rent', value: 800000 },
  { name: 'Marketing', value: 450000 },
  { name: 'Utilities', value: 180000 },
  { name: 'Software', value: 320000 },
  { name: 'Travel', value: 250000 },
];

const cashFlowData = [
  { month: 'Sep', inflow: 1800000, outflow: 1200000 },
  { month: 'Oct', inflow: 2200000, outflow: 1500000 },
  { month: 'Nov', inflow: 2600000, outflow: 1700000 },
  { month: 'Dec', inflow: 3000000, outflow: 1900000 },
  { month: 'Jan', inflow: 2800000, outflow: 1800000 },
  { month: 'Feb', inflow: 3200000, outflow: 2000000 },
];

const COLORS = ['hsl(24, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(210, 90%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(280, 70%, 55%)', 'hsl(0, 84%, 60%)'];

interface Invoice {
  id: string; client: string; amount: number; status: 'Paid' | 'Sent' | 'Overdue' | 'Draft'; date: string;
}

interface Expense {
  id: string; description: string; category: string; amount: number; date: string; status: 'Approved' | 'Pending' | 'Rejected';
}

interface Payment {
  id: string; from: string; amount: number; method: string; date: string; reference: string;
}

const statusVariant = (s: string) => {
  const m: Record<string, 'success' | 'info' | 'destructive' | 'default' | 'warning'> = { Paid: 'success', Sent: 'info', Overdue: 'destructive', Draft: 'default', Approved: 'success', Pending: 'warning', Rejected: 'destructive' };
  return m[s] || 'default';
};

type Tab = 'dashboard' | 'invoices' | 'expenses' | 'payments' | 'reports';

export default function AccountingPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2024-047', client: 'Safaricom PLC', amount: 850000, status: 'Paid', date: '2024-01-15' },
    { id: 'INV-2024-048', client: 'KCB Group', amount: 420000, status: 'Sent', date: '2024-01-20' },
    { id: 'INV-2024-049', client: 'Twiga Foods', amount: 175000, status: 'Overdue', date: '2024-01-05' },
    { id: 'INV-2024-050', client: 'M-KOPA Solar', amount: 1200000, status: 'Draft', date: '2024-02-01' },
    { id: 'INV-2024-051', client: 'Equity Bank', amount: 560000, status: 'Sent', date: '2024-02-05' },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', description: 'Office Rent - February', category: 'Rent', amount: 180000, date: '2024-02-01', status: 'Approved' },
    { id: '2', description: 'Google Workspace', category: 'Software', amount: 25000, date: '2024-02-03', status: 'Approved' },
    { id: '3', description: 'Marketing Campaign Q1', category: 'Marketing', amount: 150000, date: '2024-02-05', status: 'Pending' },
    { id: '4', description: 'Client Lunch - KCB', category: 'Travel', amount: 8500, date: '2024-02-08', status: 'Approved' },
    { id: '5', description: 'Server Hosting', category: 'Software', amount: 45000, date: '2024-02-10', status: 'Pending' },
  ]);
  const [payments] = useState<Payment[]>([
    { id: '1', from: 'Safaricom PLC', amount: 850000, method: 'M-Pesa', date: '2024-01-16', reference: 'MPESA-ABC123' },
    { id: '2', from: 'KCB Group', amount: 200000, method: 'Bank Transfer', date: '2024-01-25', reference: 'BT-DEF456' },
    { id: '3', from: 'M-KOPA Solar', amount: 600000, method: 'Cheque', date: '2024-02-02', reference: 'CHQ-789012' },
  ]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [iForm, setIForm] = useState({ client: '', amount: 0, date: '' });
  const [eForm, setEForm] = useState({ description: '', category: 'Rent', amount: 0, date: '' });

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iForm.client || !iForm.amount) { toast.error('Client and amount required'); return; }
    setInvoices(prev => [...prev, { ...iForm, id: `INV-${Date.now().toString().slice(-7)}`, status: 'Draft' as const }]);
    setShowInvoiceForm(false); setIForm({ client: '', amount: 0, date: '' });
    toast.success('Invoice created');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eForm.description || !eForm.amount) { toast.error('Description and amount required'); return; }
    setExpenses(prev => [...prev, { ...eForm, id: Date.now().toString(), status: 'Pending' as const }]);
    setShowExpenseForm(false); setEForm({ description: '', category: 'Rent', amount: 0, date: '' });
    toast.success('Expense added');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' }, { key: 'invoices', label: 'Invoices' },
    { key: 'expenses', label: 'Expenses' }, { key: 'payments', label: 'Payments' },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Accounting" description="Revenue, expenses, invoices, and financial reports">
        <div className="flex gap-2">
          <button onClick={() => setShowExpenseForm(true)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Add Expense
          </button>
          <button onClick={() => setShowInvoiceForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </PageHeader>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} change="+22% YoY" changeType="positive" icon={ArrowUpRight} iconColor="gradient-primary" />
            <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} change="+8% YoY" changeType="negative" icon={ArrowDownRight} />
            <StatCard title="Net Profit" value={formatCurrency(totalRevenue - totalExpenses)} change="+41% YoY" changeType="positive" icon={DollarSign} />
            <StatCard title="Pending Invoices" value={String(invoices.filter(i => i.status !== 'Paid').length)} change={formatCurrency(invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0))} changeType="neutral" icon={FileText} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Revenue vs Expenses (KES)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="income" stroke="hsl(142, 71%, 45%)" fill="url(#incGrad2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" fill="url(#expGrad2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name }) => name}>
                    {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {expenseCategories.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Cash Flow (KES)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="inflow" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Cash In" />
                <Bar dataKey="outflow" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Cash Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'invoices' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Invoices ({invoices.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Invoice', 'Client', 'Amount', 'Status', 'Date', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">{inv.id}</td>
                    <td className="px-4 py-3">{inv.client}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} variant={statusVariant(inv.status)} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3">
                      {inv.status !== 'Paid' && <button onClick={() => { setInvoices(p => p.map(i => i.id === inv.id ? { ...i, status: 'Paid' as const } : i)); toast.success('Marked as paid'); }} className="text-xs text-success font-medium hover:underline">Mark Paid</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Expenses ({expenses.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Description', 'Category', 'Amount', 'Date', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{exp.description}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-muted rounded-full text-xs">{exp.category}</span></td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={exp.status} variant={statusVariant(exp.status)} /></td>
                    <td className="px-4 py-3">
                      {exp.status === 'Pending' && <button onClick={() => { setExpenses(p => p.map(e => e.id === exp.id ? { ...e, status: 'Approved' as const } : e)); toast.success('Approved'); }} className="text-xs text-success font-medium hover:underline">Approve</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Payment History ({payments.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['From', 'Amount', 'Method', 'Date', 'Reference'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.from}</td>
                    <td className="px-4 py-3 font-semibold text-success">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-muted-foreground" />{p.method}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Profit & Loss Statement', desc: 'Monthly P&L for the current fiscal year', icon: FileText },
            { title: 'Balance Sheet', desc: 'Assets, liabilities, and equity snapshot', icon: PieIcon },
            { title: 'Cash Flow Statement', desc: 'Operating, investing, and financing activities', icon: ArrowUpRight },
            { title: 'Tax Report', desc: 'VAT/withholding tax summary for filing', icon: Receipt },
          ].map((r) => (
            <div key={r.title} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><r.icon className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                  <button className="text-sm text-primary font-medium mt-2 hover:underline">Generate Report →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">New Invoice</h2>
              <button onClick={() => setShowInvoiceForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddInvoice} className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Client Name*</label>
                <input value={iForm.client} onChange={(e) => setIForm({ ...iForm, client: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (KES)*</label>
                <input type="number" value={iForm.amount || ''} onChange={(e) => setIForm({ ...iForm, amount: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                <input type="date" value={iForm.date} onChange={(e) => setIForm({ ...iForm, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Add Expense</h2>
              <button onClick={() => setShowExpenseForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description*</label>
                <input value={eForm.description} onChange={(e) => setEForm({ ...eForm, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                  <select value={eForm.category} onChange={(e) => setEForm({ ...eForm, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Rent', 'Salaries', 'Marketing', 'Utilities', 'Software', 'Travel', 'Other'].map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Amount*</label>
                  <input type="number" value={eForm.amount || ''} onChange={(e) => setEForm({ ...eForm, amount: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                <input type="date" value={eForm.date} onChange={(e) => setEForm({ ...eForm, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowExpenseForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
