import { useState } from 'react';
import { useEngineeringStore, FIDICType, Contract, Claim, Variation, PaymentCertificate, Dispute, EarlyWarning, Project } from '@/store/engineeringStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Building2, FileText, Scale, Banknote, AlertTriangle, Plus, Search, Eye,
  Clock, TrendingUp, Hammer, DollarSign, Gavel, ShieldAlert,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(45 93% 47%)', 'hsl(var(--muted-foreground))'];
const fmtMoney = (v: number) => `KES ${(v / 1000000).toFixed(1)}M`;

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-500/10 text-green-600', Draft: 'bg-muted text-muted-foreground', Completed: 'bg-primary/10 text-primary',
    'In Progress': 'bg-primary/10 text-primary', Planning: 'bg-blue-500/10 text-blue-600', 'On Hold': 'bg-yellow-500/10 text-yellow-600',
    Approved: 'bg-green-500/10 text-green-600', Rejected: 'bg-destructive/10 text-destructive', Paid: 'bg-green-500/10 text-green-600',
    Submitted: 'bg-blue-500/10 text-blue-600', 'Under Review': 'bg-yellow-500/10 text-yellow-600', 'Notice Sent': 'bg-orange-500/10 text-orange-600',
    Requested: 'bg-blue-500/10 text-blue-600', Filed: 'bg-destructive/10 text-destructive', Open: 'bg-yellow-500/10 text-yellow-600',
    Mitigated: 'bg-green-500/10 text-green-600', Closed: 'bg-muted text-muted-foreground', Terminated: 'bg-destructive/10 text-destructive',
    Hearing: 'bg-orange-500/10 text-orange-600', Resolved: 'bg-green-500/10 text-green-600',
  };
  return map[s] || 'bg-muted text-muted-foreground';
};

const riskBadge = (r: string) => {
  switch (r) { case 'Critical': return 'bg-destructive text-destructive-foreground'; case 'High': return 'bg-orange-500 text-white'; case 'Medium': return 'bg-yellow-500 text-white'; default: return 'bg-muted text-muted-foreground'; }
};

const fdicDesc: Record<FIDICType, string> = {
  'Red Book': 'Construction – Employer-designed, re-measurement based',
  'Yellow Book': 'Plant & Design-Build – Contractor designs, lump sum',
  'Silver Book': 'EPC/Turnkey – Maximum risk on Contractor',
  'Gold Book': 'Design-Build-Operate – Long-term O&M included',
};

export default function EngineeringPage() {
  const store = useEngineeringStore();
  const { projects, contracts, claims, variations, payments, disputes, earlyWarnings } = store;
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [contractDialog, setContractDialog] = useState(false);
  const [claimDialog, setClaimDialog] = useState(false);
  const [variationDialog, setVariationDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [disputeDialog, setDisputeDialog] = useState(false);
  const [warningDialog, setWarningDialog] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);

  const [newContract, setNC] = useState({ projectId: '', name: '', type: 'Red Book' as FIDICType, employer: '', contractor: '', engineer: '', price: 0, startDate: '', endDate: '', currency: 'KES' });
  const [newClaim, setCL] = useState({ contractId: '', title: '', type: 'Payment' as Claim['type'], dateOfEvent: '', description: '', amount: 0, daysRequested: 0 });
  const [newVar, setNV] = useState({ contractId: '', description: '', costImpact: 0, timeImpact: 0 });
  const [newPay, setNP] = useState({ contractId: '', certNumber: 0, amountDue: 0, retentionDeducted: 0, dueDate: '' });
  const [newDisp, setND] = useState({ contractId: '', title: '', type: 'NOD' as Dispute['type'], description: '' });
  const [newEW, setNEW] = useState({ projectId: '', description: '', riskLevel: 'Medium' as EarlyWarning['riskLevel'], mitigationPlan: '' });

  const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const openClaims = claims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;

  const budgetData = projects.map(p => ({ name: p.name.substring(0, 15), budget: p.budget / 1e6, spent: p.spent / 1e6 }));
  const contractsByType = (['Red Book', 'Yellow Book', 'Silver Book', 'Gold Book'] as FIDICType[]).map(t => ({ name: t.replace(' Book', ''), value: contracts.filter(c => c.type === t).length }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Engineering & Construction</h1>
          <p className="text-muted-foreground text-sm">FIDIC contract management, claims, payments & disputes</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: activeProjects, icon: Building2, color: 'text-primary' },
          { label: 'Total Budget', value: fmtMoney(totalBudget), icon: DollarSign, color: 'text-green-500' },
          { label: 'Total Spent', value: fmtMoney(totalSpent), icon: TrendingUp, color: 'text-orange-500' },
          { label: 'Open Claims', value: openClaims, icon: Scale, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}><s.icon className="w-6 h-6" /></div>
              <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Budget vs Spent (Millions KES)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Budget" />
                    <Bar dataKey="spent" fill="hsl(var(--destructive))" radius={[4,4,0,0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Contracts by FIDIC Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={contractsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {contractsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Project Progress */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Project Progress</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={statusBadge(p.status)} variant="outline">{p.status}</Badge>
                      <span className="text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                  <Progress value={p.progress} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Early Warnings on Dashboard */}
          {earlyWarnings.filter(w => w.status === 'Open').length > 0 && (
            <Card className="border-orange-200">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-500" />Active Early Warnings</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {earlyWarnings.filter(w => w.status === 'Open').map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{w.description}</p>
                      <p className="text-xs text-muted-foreground">{projects.find(p => p.id === w.projectId)?.name} • {w.date}</p>
                    </div>
                    <Badge className={riskBadge(w.riskLevel)}>{w.riskLevel}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects" className="space-y-4">
          <h3 className="font-semibold text-foreground">Projects</h3>
          <div className="grid gap-4">
            {projects.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.client} • Manager: {p.manager}</p>
                    </div>
                    <Badge className={statusBadge(p.status)} variant="outline">{p.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                    <div><span className="text-muted-foreground">Budget:</span> {fmtMoney(p.budget)}</div>
                    <div><span className="text-muted-foreground">Spent:</span> {fmtMoney(p.spent)}</div>
                    <div><span className="text-muted-foreground">Start:</span> {p.startDate}</div>
                    <div><span className="text-muted-foreground">End:</span> {p.endDate}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2"><Progress value={p.progress} className="flex-1" /><span className="text-sm font-medium">{p.progress}%</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">FIDIC Contracts</h3>
            <Dialog open={contractDialog} onOpenChange={setContractDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Contract</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Project</Label>
                    <Select value={newContract.projectId} onValueChange={v => setNC(p => ({ ...p, projectId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Contract Name</Label><Input value={newContract.name} onChange={e => setNC(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><Label>FIDIC Type</Label>
                    <Select value={newContract.type} onValueChange={v => setNC(p => ({ ...p, type: v as FIDICType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(['Red Book','Yellow Book','Silver Book','Gold Book'] as FIDICType[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">{fdicDesc[newContract.type]}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Employer</Label><Input value={newContract.employer} onChange={e => setNC(p => ({ ...p, employer: e.target.value }))} /></div>
                    <div><Label>Contractor</Label><Input value={newContract.contractor} onChange={e => setNC(p => ({ ...p, contractor: e.target.value }))} /></div>
                    <div><Label>Engineer</Label><Input value={newContract.engineer} onChange={e => setNC(p => ({ ...p, engineer: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Price (KES)</Label><Input type="number" value={newContract.price} onChange={e => setNC(p => ({ ...p, price: +e.target.value }))} /></div>
                    <div><Label>Start</Label><Input type="date" value={newContract.startDate} onChange={e => setNC(p => ({ ...p, startDate: e.target.value }))} /></div>
                    <div><Label>End</Label><Input type="date" value={newContract.endDate} onChange={e => setNC(p => ({ ...p, endDate: e.target.value }))} /></div>
                  </div>
                  <Button onClick={() => { store.addContract({ ...newContract, status: 'Draft' }); setContractDialog(false); }} className="w-full">Create Contract</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* FIDIC Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['Red Book','Yellow Book','Silver Book','Gold Book'] as FIDICType[]).map(t => {
              const count = contracts.filter(c => c.type === t).length;
              const colors: Record<string, string> = { 'Red Book': 'border-red-300 bg-red-50 dark:bg-red-950/20', 'Yellow Book': 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20', 'Silver Book': 'border-gray-300 bg-gray-50 dark:bg-gray-800/20', 'Gold Book': 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' };
              return (
                <Card key={t} className={colors[t]}>
                  <CardContent className="p-4 text-center">
                    <p className="font-semibold text-foreground">{t}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fdicDesc[t]}</p>
                    <p className="text-2xl font-bold mt-2">{count}</p>
                    <p className="text-xs text-muted-foreground">contracts</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Employer</TableHead><TableHead>Contractor</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                    <TableCell className="text-sm">{c.employer}</TableCell>
                    <TableCell className="text-sm">{c.contractor}</TableCell>
                    <TableCell className="text-sm">{fmtMoney(c.price)}</TableCell>
                    <TableCell><Badge className={statusBadge(c.status)} variant="outline">{c.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => setViewContract(c)}><Eye className="w-3.5 h-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Dialog open={!!viewContract} onOpenChange={() => setViewContract(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{viewContract?.name}</DialogTitle></DialogHeader>
              {viewContract && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline">{viewContract.type}</Badge></div>
                    <div><span className="text-muted-foreground">Status:</span> <Badge className={statusBadge(viewContract.status)} variant="outline">{viewContract.status}</Badge></div>
                    <div><span className="text-muted-foreground">Employer:</span> {viewContract.employer}</div>
                    <div><span className="text-muted-foreground">Contractor:</span> {viewContract.contractor}</div>
                    <div><span className="text-muted-foreground">Engineer:</span> {viewContract.engineer}</div>
                    <div><span className="text-muted-foreground">Price:</span> {fmtMoney(viewContract.price)}</div>
                    <div><span className="text-muted-foreground">Start:</span> {viewContract.startDate}</div>
                    <div><span className="text-muted-foreground">End:</span> {viewContract.endDate}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium mb-1">FIDIC Type Info</p>
                    <p className="text-xs text-muted-foreground">{fdicDesc[viewContract.type]}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Claims */}
        <TabsContent value="claims" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Claims Management</h3>
            <Dialog open={claimDialog} onOpenChange={setClaimDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Claim</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit Claim</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Contract</Label>
                    <Select value={newClaim.contractId} onValueChange={v => setCL(p => ({ ...p, contractId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                      <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Claim Title</Label><Input value={newClaim.title} onChange={e => setCL(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Type</Label>
                      <Select value={newClaim.type} onValueChange={v => setCL(p => ({ ...p, type: v as Claim['type'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="EOT">Extension of Time</SelectItem><SelectItem value="Payment">Payment</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Date of Event</Label><Input type="date" value={newClaim.dateOfEvent} onChange={e => setCL(p => ({ ...p, dateOfEvent: e.target.value }))} /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={newClaim.description} onChange={e => setCL(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Amount (KES)</Label><Input type="number" value={newClaim.amount} onChange={e => setCL(p => ({ ...p, amount: +e.target.value }))} /></div>
                    <div><Label>Days Requested</Label><Input type="number" value={newClaim.daysRequested} onChange={e => setCL(p => ({ ...p, daysRequested: +e.target.value }))} /></div>
                  </div>
                  <Button onClick={() => { store.addClaim({ ...newClaim, status: 'Notice Sent', timeBarDays: 28, noticeDate: new Date().toISOString().split('T')[0], documents: [] }); setClaimDialog(false); }} className="w-full">Submit Claim</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Time Bar</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map(c => {
                  const daysSinceNotice = Math.floor((Date.now() - new Date(c.noticeDate).getTime()) / 86400000);
                  const remaining = c.timeBarDays - daysSinceNotice;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="text-sm font-medium">{c.title}</TableCell>
                      <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                      <TableCell className="text-sm">{c.amount ? fmtMoney(c.amount) : c.daysRequested ? `${c.daysRequested} days` : '-'}</TableCell>
                      <TableCell><Badge className={statusBadge(c.status)} variant="outline">{c.status}</Badge></TableCell>
                      <TableCell>
                        <Badge className={remaining <= 7 ? 'bg-destructive text-destructive-foreground' : remaining <= 14 ? 'bg-yellow-500 text-white' : 'bg-green-500/10 text-green-600'}>
                          <Clock className="w-3 h-3 mr-1" />{remaining}d left
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.status === 'Notice Sent' && <Button size="sm" variant="ghost" onClick={() => store.updateClaim(c.id, { status: 'Submitted' })}>Submit</Button>}
                        {c.status === 'Under Review' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => store.updateClaim(c.id, { status: 'Approved' })}>Approve</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => store.updateClaim(c.id, { status: 'Rejected' })}>Reject</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Variations */}
        <TabsContent value="variations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Variations</h3>
            <Dialog open={variationDialog} onOpenChange={setVariationDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Variation</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request Variation</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Contract</Label>
                    <Select value={newVar.contractId} onValueChange={v => setNV(p => ({ ...p, contractId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                      <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Textarea value={newVar.description} onChange={e => setNV(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Cost Impact (KES)</Label><Input type="number" value={newVar.costImpact} onChange={e => setNV(p => ({ ...p, costImpact: +e.target.value }))} /></div>
                    <div><Label>Time Impact (days)</Label><Input type="number" value={newVar.timeImpact} onChange={e => setNV(p => ({ ...p, timeImpact: +e.target.value }))} /></div>
                  </div>
                  <Button onClick={() => { store.addVariation({ ...newVar, status: 'Requested', requestDate: new Date().toISOString().split('T')[0] }); setVariationDialog(false); }} className="w-full">Submit Variation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>ID</TableHead><TableHead>Description</TableHead><TableHead>Cost Impact</TableHead><TableHead>Time Impact</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {variations.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id}</TableCell>
                    <TableCell className="text-sm">{v.description}</TableCell>
                    <TableCell className="text-sm">{fmtMoney(v.costImpact)}</TableCell>
                    <TableCell className="text-sm">{v.timeImpact} days</TableCell>
                    <TableCell><Badge className={statusBadge(v.status)} variant="outline">{v.status}</Badge></TableCell>
                    <TableCell>
                      {(v.status === 'Requested' || v.status === 'Under Review') && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => store.updateVariation(v.id, { status: 'Approved' })}>Approve</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => store.updateVariation(v.id, { status: 'Rejected' })}>Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Payment Certificates</h3>
            <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Certificate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Payment Certificate</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Contract</Label>
                    <Select value={newPay.contractId} onValueChange={v => setNP(p => ({ ...p, contractId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                      <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Cert #</Label><Input type="number" value={newPay.certNumber} onChange={e => setNP(p => ({ ...p, certNumber: +e.target.value }))} /></div>
                    <div><Label>Amount Due</Label><Input type="number" value={newPay.amountDue} onChange={e => setNP(p => ({ ...p, amountDue: +e.target.value }))} /></div>
                    <div><Label>Retention</Label><Input type="number" value={newPay.retentionDeducted} onChange={e => setNP(p => ({ ...p, retentionDeducted: +e.target.value }))} /></div>
                  </div>
                  <div><Label>Due Date</Label><Input type="date" value={newPay.dueDate} onChange={e => setNP(p => ({ ...p, dueDate: e.target.value }))} /></div>
                  <Button onClick={() => { store.addPayment({ ...newPay, netPayment: newPay.amountDue - newPay.retentionDeducted, status: 'Draft' }); setPaymentDialog(false); }} className="w-full">Create Certificate</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Cert #</TableHead><TableHead>Contract</TableHead><TableHead>Amount Due</TableHead><TableHead>Retention</TableHead><TableHead>Net Payment</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">IPC-{p.certNumber}</TableCell>
                    <TableCell className="text-sm">{contracts.find(c => c.id === p.contractId)?.name?.substring(0, 20)}</TableCell>
                    <TableCell className="text-sm">{fmtMoney(p.amountDue)}</TableCell>
                    <TableCell className="text-sm text-destructive">{fmtMoney(p.retentionDeducted)}</TableCell>
                    <TableCell className="text-sm font-medium">{fmtMoney(p.netPayment)}</TableCell>
                    <TableCell className="text-sm">{p.dueDate}</TableCell>
                    <TableCell><Badge className={statusBadge(p.status)} variant="outline">{p.status}</Badge></TableCell>
                    <TableCell>
                      {p.status === 'Draft' && <Button size="sm" variant="ghost" onClick={() => store.updatePayment(p.id, { status: 'Submitted' })}>Submit</Button>}
                      {p.status === 'Submitted' && <Button size="sm" variant="ghost" onClick={() => store.updatePayment(p.id, { status: 'Approved' })}>Approve</Button>}
                      {p.status === 'Approved' && <Button size="sm" variant="ghost" onClick={() => store.updatePayment(p.id, { status: 'Paid' })}>Mark Paid</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Disputes */}
        <TabsContent value="disputes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Dispute Resolution</h3>
            <Dialog open={disputeDialog} onOpenChange={setDisputeDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />File Dispute</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>File Dispute</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Contract</Label>
                    <Select value={newDisp.contractId} onValueChange={v => setND(p => ({ ...p, contractId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select contract" /></SelectTrigger>
                      <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Title</Label><Input value={newDisp.title} onChange={e => setND(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><Label>Type</Label>
                    <Select value={newDisp.type} onValueChange={v => setND(p => ({ ...p, type: v as Dispute['type'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="NOD">Notice of Dissatisfaction</SelectItem><SelectItem value="DAB Referral">DAB Referral</SelectItem><SelectItem value="Arbitration">Arbitration</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Textarea value={newDisp.description} onChange={e => setND(p => ({ ...p, description: e.target.value }))} /></div>
                  <Button onClick={() => { store.addDispute({ ...newDisp, status: 'Filed', filedDate: new Date().toISOString().split('T')[0] }); setDisputeDialog(false); }} className="w-full">File Dispute</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {disputes.map(d => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{d.title}</h4>
                      <p className="text-xs text-muted-foreground">{contracts.find(c => c.id === d.contractId)?.name} • Filed: {d.filedDate}</p>
                      <p className="text-sm mt-2">{d.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{d.type}</Badge>
                      <Badge className={statusBadge(d.status)} variant="outline">{d.status}</Badge>
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {['Filed', 'Under Review', 'Hearing', 'Resolved'].map((step, i) => (
                      <div key={step} className="flex items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${['Filed', 'Under Review', 'Hearing', 'Resolved'].indexOf(d.status) >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                        <span className="hidden sm:inline">{step}</span>
                        {i < 3 && <div className={`w-8 h-0.5 ${['Filed', 'Under Review', 'Hearing', 'Resolved'].indexOf(d.status) > i ? 'bg-primary' : 'bg-muted'}`} />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Early Warnings */}
        <TabsContent value="warnings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Early Warning System</h3>
            <Dialog open={warningDialog} onOpenChange={setWarningDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Warning</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Early Warning</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Project</Label>
                    <Select value={newEW.projectId} onValueChange={v => setNEW(p => ({ ...p, projectId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Textarea value={newEW.description} onChange={e => setNEW(p => ({ ...p, description: e.target.value }))} /></div>
                  <div><Label>Risk Level</Label>
                    <Select value={newEW.riskLevel} onValueChange={v => setNEW(p => ({ ...p, riskLevel: v as EarlyWarning['riskLevel'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Mitigation Plan</Label><Textarea value={newEW.mitigationPlan} onChange={e => setNEW(p => ({ ...p, mitigationPlan: e.target.value }))} /></div>
                  <Button onClick={() => { store.addEarlyWarning({ ...newEW, status: 'Open', date: new Date().toISOString().split('T')[0] }); setWarningDialog(false); }} className="w-full">Create Warning</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {earlyWarnings.map(w => (
              <Card key={w.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{w.description}</h4>
                      <p className="text-xs text-muted-foreground">{projects.find(p => p.id === w.projectId)?.name} • {w.date}</p>
                      <p className="text-sm mt-2 text-muted-foreground"><strong>Mitigation:</strong> {w.mitigationPlan}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={riskBadge(w.riskLevel)}>{w.riskLevel}</Badge>
                      <Badge className={statusBadge(w.status)} variant="outline">{w.status}</Badge>
                    </div>
                  </div>
                  {w.status === 'Open' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => store.updateEarlyWarning(w.id, { status: 'Mitigated' })}>Mark Mitigated</Button>
                      <Button size="sm" variant="ghost" onClick={() => store.updateEarlyWarning(w.id, { status: 'Closed' })}>Close</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
