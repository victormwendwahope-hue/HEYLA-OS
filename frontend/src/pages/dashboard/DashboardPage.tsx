import { StatCard, PageHeader } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { useLeadStore } from '@/store/leadStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatCurrency } from '@/utils/countries';
import { Users, DollarSign, TrendingUp, Package, ArrowUpRight, ArrowDownRight, Activity, Search, ExternalLink, BookOpen, Building2, Scale, Wrench } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState, useRef, useEffect } from 'react';

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
  { dept: 'Engineering', count: 12 }, { dept: 'Sales', count: 8 }, { dept: 'Marketing', count: 5 },
  { dept: 'Finance', count: 4 }, { dept: 'HR', count: 3 }, { dept: 'Ops', count: 6 },
];

const activities = [
  { text: 'Wanjiku Mwangi added to Engineering', time: '2 min ago', type: 'hr' },
  { text: 'Invoice #INV-2024-047 paid — KSh 85,000', time: '15 min ago', type: 'finance' },
  { text: 'New lead: Safaricom PLC — KSh 2.5M', time: '1 hour ago', type: 'crm' },
  { text: 'Battery 200Ah stock low (3 remaining)', time: '2 hours ago', type: 'inventory' },
  { text: 'Payroll for January processed', time: '5 hours ago', type: 'finance' },
];

// Resource library for search bar
const resources = [
  { category: 'Labour Laws', icon: Scale, items: [
    { title: 'Employment Act 2007 (Kenya)', desc: 'Working hours, leave, termination, wages', url: '#' },
    { title: 'OSHA 2007 — Occupational Safety', desc: 'Workplace safety standards & compliance', url: '#' },
    { title: 'WIBA 2007 — Work Injury Benefits', desc: 'Employee injury compensation guidelines', url: '#' },
    { title: 'Labour Relations Act', desc: 'Trade unions, collective bargaining, strikes', url: '#' },
    { title: 'NSSF Act 2013', desc: 'Social security fund contributions', url: '#' },
    { title: 'NHIF Act', desc: 'National hospital insurance fund guidelines', url: '#' },
  ]},
  { category: 'Construction & Infrastructure', icon: Building2, items: [
    { title: 'NCA Building Regulations', desc: 'National Construction Authority standards', url: '#' },
    { title: 'Kenya Roads Board Standards', desc: 'Road construction specifications', url: '#' },
    { title: 'Environmental Impact Assessment', desc: 'NEMA guidelines for construction projects', url: '#' },
    { title: 'Public Procurement Guidelines', desc: 'Government project tender procedures', url: '#' },
    { title: 'County Building Permits', desc: 'Local authority approval procedures', url: '#' },
  ]},
  { category: 'General Specifications', icon: Wrench, items: [
    { title: 'Kenya Bureau of Standards (KEBS)', desc: 'Product standards and certifications', url: '#' },
    { title: 'ISO Quality Management', desc: 'ISO 9001 quality system requirements', url: '#' },
    { title: 'Fire Safety Standards', desc: 'Fire prevention and safety regulations', url: '#' },
    { title: 'Electrical Installation Standards', desc: 'Wiring regulations and compliance', url: '#' },
    { title: 'Tax Compliance (KRA)', desc: 'iTax filing, VAT, PAYE guidelines', url: '#' },
  ]},
  { category: 'Business Guides', icon: BookOpen, items: [
    { title: 'Company Registration (BRS)', desc: 'Business Registration Service procedures', url: '#' },
    { title: 'Single Business Permit', desc: 'County government licensing requirements', url: '#' },
    { title: 'Import/Export Licensing', desc: 'KRA customs and trade facilitation', url: '#' },
    { title: 'Data Protection Act 2019', desc: 'Personal data handling compliance', url: '#' },
  ]},
];

export default function DashboardPage() {
  const { employees, fetchEmployees } = useEmployeeStore();
  const { leads, fetchLeads } = useLeadStore();
  const { products, fetchProducts } = useInventoryStore();
  const [resourceSearch, setResourceSearch] = useState('');
  const [showResources, setShowResources] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmployees();
    fetchLeads();
    fetchProducts();
  }, [fetchEmployees, fetchLeads, fetchProducts]);

  const totalSalary = employees.reduce((s, e) => s + e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances, 0);
  const activeLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status)).length;
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  // Filter resources
  const filteredResources = resourceSearch.trim()
    ? resources.map(cat => ({
        ...cat,
        items: cat.items.filter(i => `${i.title} ${i.desc} ${cat.category}`.toLowerCase().includes(resourceSearch.toLowerCase())),
      })).filter(cat => cat.items.length > 0)
    : resources;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Welcome back! Here's your business overview." />

      {/* Resource Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={resourceSearch}
                onChange={e => { setResourceSearch(e.target.value); setShowResources(true); }}
                onFocus={() => setShowResources(true)}
                placeholder="Search labour laws, construction specs, business guides, tax compliance..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Quick category pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {resources.map(cat => (
              <button
                key={cat.category}
                onClick={() => { setResourceSearch(cat.category); setShowResources(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-xs font-medium text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                <cat.icon className="w-3.5 h-3.5" /> {cat.category}
              </button>
            ))}
          </div>
        </div>

        {showResources && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-elevated z-40 max-h-[400px] overflow-y-auto">
            {filteredResources.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No results found for "{resourceSearch}"</div>
            ) : (
              filteredResources.map(cat => (
                <div key={cat.category}>
                  <div className="px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <cat.icon className="w-3.5 h-3.5" /> {cat.category}
                  </div>
                  {cat.items.map((item, i) => (
                    <button key={i} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

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
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
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
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.type === 'hr' ? 'bg-info' : a.type === 'finance' ? 'bg-success' : a.type === 'crm' ? 'bg-primary' : 'bg-warning'}`} />
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
