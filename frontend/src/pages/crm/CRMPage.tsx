import { useState } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Plus, Search, GripVertical, X, Edit2, Phone, Mail, Calendar, TrendingUp, Users, DollarSign, Target, Headphones } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const;
const statusVariant = (s: string) => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'default'> = { New: 'info', Contacted: 'warning', Qualified: 'default', Proposal: 'warning', Won: 'success', Lost: 'destructive' };
  return map[s] || 'default';
};
const COLORS = ['hsl(210, 90%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(280, 70%, 55%)', 'hsl(24, 95%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)'];

const emptyForm = { name: '', email: '', phone: '', company: '', status: 'New' as Lead['status'], value: 0, source: '', assignedTo: '', notes: '' };

// Service tickets
interface Ticket {
  id: string; client: string; subject: string; priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'; assignedTo: string; createdAt: string;
}

const mockTickets: Ticket[] = [
  { id: '1', client: 'Safaricom PLC', subject: 'Integration API not responding', priority: 'High', status: 'In Progress', assignedTo: 'Grace W.', createdAt: '2024-02-10' },
  { id: '2', client: 'KCB Group', subject: 'Invoice discrepancy for Q4', priority: 'Medium', status: 'Open', assignedTo: '', createdAt: '2024-02-12' },
  { id: '3', client: 'M-KOPA Solar', subject: 'Feature request: bulk export', priority: 'Low', status: 'Resolved', assignedTo: 'James M.', createdAt: '2024-02-05' },
  { id: '4', client: 'Twiga Foods', subject: 'Account access issues', priority: 'Critical', status: 'Open', assignedTo: '', createdAt: '2024-02-14' },
];

type Tab = 'sales' | 'service' | 'pipeline';
const priorityVariant = (p: string) => ({ Low: 'default' as const, Medium: 'warning' as const, High: 'destructive' as const, Critical: 'destructive' as const }[p] || 'default' as const);
const ticketStatusVariant = (s: string) => ({ Open: 'warning' as const, 'In Progress': 'info' as const, Resolved: 'success' as const, Closed: 'default' as const }[s] || 'default' as const);

export default function CRMPage() {
  const { leads, addLead, updateLead } = useLeadStore();
  const [tab, setTab] = useState<Tab>('sales');
  const [view, setView] = useState<'table' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tickets, setTickets] = useState(mockTickets);

  const filtered = leads.filter(l => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(search.toLowerCase()));
  const totalPipeline = leads.filter(l => !['Won', 'Lost'].includes(l.status)).reduce((s, l) => s + l.value, 0);
  const wonDeals = leads.filter(l => l.status === 'Won');
  const conversionRate = leads.length ? ((wonDeals.length / leads.length) * 100).toFixed(0) : '0';

  const pipelineData = statusOrder.map(s => ({ status: s, count: leads.filter(l => l.status === s).length, value: leads.filter(l => l.status === s).reduce((sum, l) => sum + l.value, 0) }));
  const sourceData: Record<string, number> = {};
  leads.forEach(l => { sourceData[l.source || 'Direct'] = (sourceData[l.source || 'Direct'] || 0) + 1; });
  const sourcePie = Object.entries(sourceData).map(([name, value]) => ({ name, value }));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (lead: Lead) => { setForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: lead.status, value: lead.value, source: lead.source, assignedTo: lead.assignedTo, notes: lead.notes }); setEditId(lead.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company) { toast.error('Name and company required'); return; }
    if (editId) { updateLead(editId, form); toast.success('Lead updated'); }
    else { addLead({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] }); toast.success('Lead added'); }
    setShowForm(false);
  };

  const tabs = [
    { key: 'sales' as const, label: '💼 Sales Portal', icon: Target },
    { key: 'service' as const, label: '🎧 Service Portal', icon: Headphones },
    { key: 'pipeline' as const, label: '📊 Pipeline', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="CRM" description={`${leads.length} leads — ${formatCurrency(totalPipeline)} pipeline`}>
        <button onClick={openAdd} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </PageHeader>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Pipeline" value={formatCurrency(totalPipeline)} change={`${leads.filter(l => l.status === 'Proposal').length} proposals`} changeType="neutral" icon={Target} iconColor="gradient-primary" />
            <StatCard title="Won Deals" value={String(wonDeals.length)} change={formatCurrency(wonDeals.reduce((s, l) => s + l.value, 0))} changeType="positive" icon={DollarSign} />
            <StatCard title="Conversion Rate" value={`${conversionRate}%`} change="All time" changeType="positive" icon={TrendingUp} />
            <StatCard title="Active Leads" value={String(leads.filter(l => !['Won', 'Lost'].includes(l.status)).length)} change="In pipeline" changeType="neutral" icon={Users} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(['kanban', 'table'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>{v}</button>
              ))}
            </div>
          </div>

          {view === 'kanban' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
              {statusOrder.map(status => {
                const items = filtered.filter(l => l.status === status);
                return (
                  <div key={status} className="min-w-[200px]">
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={status} variant={statusVariant(status)} />
                      <span className="text-xs text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(l => (
                        <div key={l.id} onClick={() => openEdit(l)} className="glass rounded-lg p-3 hover:shadow-elevated transition-shadow cursor-pointer">
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{l.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{l.company}</p>
                              <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(l.value)}</p>
                              {l.phone && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{l.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/30">
                    {['Lead', 'Company', 'Contact', 'Status', 'Value', 'Source', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtered.map(l => (
                      <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{l.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.company}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {l.email && <Mail className="w-3 h-3 text-muted-foreground" />}
                            {l.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={l.status} variant={statusVariant(l.status)} /></td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(l.value)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEdit(l)} className="text-primary text-xs font-medium hover:underline flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'service' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Open Tickets" value={String(tickets.filter(t => t.status === 'Open').length)} change="Need attention" changeType="negative" icon={Headphones} iconColor="gradient-primary" />
            <StatCard title="In Progress" value={String(tickets.filter(t => t.status === 'In Progress').length)} change="Being worked on" changeType="neutral" icon={Calendar} />
            <StatCard title="Resolved" value={String(tickets.filter(t => t.status === 'Resolved').length)} change="This month" changeType="positive" icon={TrendingUp} />
            <StatCard title="Critical" value={String(tickets.filter(t => t.priority === 'Critical').length)} change="Urgent" changeType="negative" icon={Target} />
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border"><h3 className="font-semibold">Support Tickets</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Client', 'Subject', 'Priority', 'Status', 'Assigned', 'Date', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{t.client}</td>
                      <td className="px-4 py-3">{t.subject}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.priority} variant={priorityVariant(t.priority)} /></td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} variant={ticketStatusVariant(t.status)} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{t.assignedTo || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.createdAt}</td>
                      <td className="px-4 py-3">
                        {t.status === 'Open' && (
                          <button onClick={() => { setTickets(p => p.map(x => x.id === t.id ? { ...x, status: 'In Progress', assignedTo: 'You' } : x)); toast.success('Ticket assigned'); }} className="text-xs text-primary font-medium hover:underline">Take</button>
                        )}
                        {t.status === 'In Progress' && (
                          <button onClick={() => { setTickets(p => p.map(x => x.id === t.id ? { ...x, status: 'Resolved' } : x)); toast.success('Resolved'); }} className="text-xs text-success font-medium hover:underline">Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Pipeline by Stage</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-4">Leads by Source</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sourcePie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {sourcePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Pipeline Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {pipelineData.map((p, i) => (
                <div key={p.status} className="text-center p-3 rounded-lg bg-muted/50">
                  <StatusBadge status={p.status} variant={statusVariant(p.status)} />
                  <p className="text-2xl font-bold mt-2">{p.count}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(p.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">{editId ? 'Edit Lead' : 'Add Lead'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: 'Contact Name*', field: 'name' }, { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone' }, { label: 'Company*', field: 'company' },
                { label: 'Source', field: 'source' }, { label: 'Assigned To', field: 'assignedTo' },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input type={f.type || 'text'} value={(form as any)[f.field]} onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Value (KES)</label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: +e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Lead['status'] })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {statusOrder.map(s => <option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editId ? 'Update' : 'Add Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
