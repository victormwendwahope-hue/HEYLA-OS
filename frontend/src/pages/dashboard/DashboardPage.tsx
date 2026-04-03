import { StatCard, PageHeader } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { useLeadStore } from '@/store/leadStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatCurrency } from '@/utils/countries';
import { Users, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const revenueData = [
  { month: 'Jul', revenue: 1200000, expenses: 800000 },
  { month: 'Aug', revenue: 1450000, expenses: 900000 },
  { month: 'Sep', revenue: 1350000, expenses: 850000 },
  { month: 'Oct', revenue: 1800000, expenses: 1100000 },
  { month: 'Nov', revenue: 2100000, expenses: 1200000 },
  { month: 'Dec', revenue: 2400000, expenses: 1350000 },
  { month: 'Jan', revenue: 2200000, expenses: 1250000 },
  { month: 'Feb', revenue: 2650000, expenses: 1400000 },
];

const deptData = [
  { dept: 'Engineering', count: 12 },
  { dept: 'Sales', count: 8 },
  { dept: 'Marketing', count: 5 },
  { dept: 'Finance', count: 4 },
  { dept: 'HR', count: 3 },
  { dept: 'Ops', count: 6 },
];

const activities = [
  { text: 'Wanjiku Mwangi added to Engineering', time: '2 min ago', type: 'hr' },
  { text: 'Invoice #INV-2024-047 paid — KSh 85,000', time: '15 min ago', type: 'finance' },
  { text: 'New lead: Safaricom PLC — KSh 2.5M', time: '1 hour ago', type: 'crm' },
  { text: 'Battery 200Ah stock low (3 remaining)', time: '2 hours ago', type: 'inventory' },
  { text: 'Payroll for January processed', time: '5 hours ago', type: 'finance' },
];

export default function DashboardPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const leads = useLeadStore((s) => s.leads);
  const products = useInventoryStore((s) => s.products);

  const totalSalary = employees.reduce((s, e) => s + e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances, 0);
  const activeLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status)).length;
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Welcome back! Here's your business overview." />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={String(employees.length)} change="+2 this month" changeType="positive" icon={Users} />
        <StatCard title="Monthly Revenue" value={formatCurrency(2650000)} change="+17% from last month" changeType="positive" icon={DollarSign} iconColor="gradient-primary" />
        <StatCard title="Active Leads" value={String(activeLeads)} change={`${leads.filter(l => l.status === 'Won').length} won`} changeType="positive" icon={TrendingUp} />
        <StatCard title="Inventory Value" value={formatCurrency(inventoryValue)} change="3 items low stock" changeType="negative" icon={Package} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Revenue vs Expenses (KES)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 53%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeWidth={1.5} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Team by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Bar dataKey="count" fill="hsl(24, 95%, 53%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  a.type === 'hr' ? 'bg-info' : a.type === 'finance' ? 'bg-success' : a.type === 'crm' ? 'bg-primary' : 'bg-warning'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'Monthly Payroll', value: formatCurrency(totalSalary), icon: ArrowUpRight, color: 'text-primary' },
              { label: 'Pipeline Value', value: formatCurrency(leads.reduce((s, l) => s + l.value, 0)), icon: ArrowUpRight, color: 'text-success' },
              { label: 'Low Stock Items', value: String(products.filter(p => p.status !== 'In Stock').length), icon: ArrowDownRight, color: 'text-warning' },
              { label: 'Active Departments', value: String(new Set(employees.map(e => e.department)).size), icon: ArrowUpRight, color: 'text-info' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="flex items-center gap-1 font-semibold text-sm">
                  {s.value} <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
