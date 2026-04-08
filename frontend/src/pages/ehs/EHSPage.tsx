import { useState } from 'react';
import { useEHSStore, Incident, ComplianceItem, Inspection } from '@/store/ehsStore';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertTriangle, Shield, ClipboardCheck, Bell, Plus, Search,
  ShieldCheck, ShieldAlert, ShieldX, Activity, FileWarning, Eye,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning, 45 93% 47%))', 'hsl(var(--muted-foreground))'];

const severityColor = (s: string) => {
  switch (s) {
    case 'Critical': return 'bg-destructive text-destructive-foreground';
    case 'High': return 'bg-orange-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case 'Compliant': case 'Pass': case 'Resolved': case 'Closed': case 'Completed': return 'bg-green-500/10 text-green-600 border-green-200';
    case 'Warning': case 'Conditional': case 'In Progress': case 'Investigating': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'Overdue': case 'Fail': case 'Critical': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function EHSPage() {
  const { incidents, compliance, inspections, alerts, addIncident, updateIncident, deleteIncident, addInspection, updateInspection, markAlertRead } = useEHSStore();
  const [search, setSearch] = useState('');
  const [incidentDialog, setIncidentDialog] = useState(false);
  const [inspectionDialog, setInspectionDialog] = useState(false);
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);
  const [viewInspection, setViewInspection] = useState<Inspection | null>(null);

  const [newIncident, setNewIncident] = useState({ type: 'Accident' as Incident['type'], location: '', description: '', severity: 'Medium' as Incident['severity'], reportedBy: '', assignedTo: '' });
  const [newInspection, setNewInspection] = useState({ title: '', location: '', inspector: '', date: '', checklist: [{ item: '', checked: false, notes: '' }] });

  const activeIncidents = incidents.filter(i => i.status !== 'Closed').length;
  const hazards = incidents.filter(i => i.type === 'Hazard').length;
  const compliant = compliance.filter(c => c.status === 'Compliant').length;
  const complianceScore = Math.round((compliant / compliance.length) * 100);
  const openInvestigations = incidents.filter(i => i.status === 'Investigating').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const incidentsByType = [
    { name: 'Accidents', value: incidents.filter(i => i.type === 'Accident').length },
    { name: 'Near-miss', value: incidents.filter(i => i.type === 'Near-miss').length },
    { name: 'Hazards', value: incidents.filter(i => i.type === 'Hazard').length },
  ];

  const monthlyData = [
    { month: 'Jan', incidents: 3, resolved: 3 },
    { month: 'Feb', incidents: 5, resolved: 4 },
    { month: 'Mar', incidents: 2, resolved: 2 },
    { month: 'Apr', incidents: 4, resolved: 1 },
  ];

  const handleAddIncident = () => {
    addIncident({ ...newIncident, status: 'Reported', reportedDate: new Date().toISOString().split('T')[0], attachments: [] });
    setNewIncident({ type: 'Accident', location: '', description: '', severity: 'Medium', reportedBy: '', assignedTo: '' });
    setIncidentDialog(false);
  };

  const handleAddInspection = () => {
    addInspection({ ...newInspection, status: 'Scheduled', checklist: newInspection.checklist.filter(c => c.item.trim()) });
    setNewInspection({ title: '', location: '', inspector: '', date: '', checklist: [{ item: '', checked: false, notes: '' }] });
    setInspectionDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Environmental Health & Safety</h1>
          <p className="text-muted-foreground text-sm">Monitor safety compliance, incidents, and inspections</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          {unreadAlerts > 0 && (
            <Badge variant="destructive" className="gap-1"><Bell className="w-3 h-3" />{unreadAlerts} alerts</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Incidents', value: activeIncidents, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Reported Hazards', value: hazards, icon: FileWarning, color: 'text-orange-500' },
          { label: 'Compliance Score', value: `${complianceScore}%`, icon: ShieldCheck, color: 'text-green-500' },
          { label: 'Open Investigations', value: openInvestigations, icon: Activity, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}><s.icon className="w-6 h-6" /></div>
              <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unreadAlerts})</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Incidents by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={incidentsByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {incidentsByType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="incidents" fill="hsl(var(--destructive))" radius={[4,4,0,0]} name="Reported" />
                    <Bar dataKey="resolved" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Compliance Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {compliance.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {c.status === 'Compliant' ? <ShieldCheck className="w-4 h-4 text-green-500" /> : c.status === 'Warning' ? <ShieldAlert className="w-4 h-4 text-yellow-500" /> : <ShieldX className="w-4 h-4 text-destructive" />}
                    <div>
                      <p className="text-sm font-medium">{c.item}</p>
                      <p className="text-xs text-muted-foreground">{c.category} • Due: {c.dueDate}</p>
                    </div>
                  </div>
                  <Badge className={statusColor(c.status)} variant="outline">{c.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Incident Reports</h3>
            <Dialog open={incidentDialog} onOpenChange={setIncidentDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Report Incident</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Report New Incident</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Type</Label>
                      <Select value={newIncident.type} onValueChange={v => setNewIncident(p => ({ ...p, type: v as Incident['type'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Accident">Accident</SelectItem><SelectItem value="Near-miss">Near-miss</SelectItem><SelectItem value="Hazard">Hazard</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Severity</Label>
                      <Select value={newIncident.severity} onValueChange={v => setNewIncident(p => ({ ...p, severity: v as Incident['severity'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Location</Label><Input value={newIncident.location} onChange={e => setNewIncident(p => ({ ...p, location: e.target.value }))} /></div>
                  <div><Label>Description</Label><Textarea value={newIncident.description} onChange={e => setNewIncident(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Reported By</Label><Input value={newIncident.reportedBy} onChange={e => setNewIncident(p => ({ ...p, reportedBy: e.target.value }))} /></div>
                    <div><Label>Assigned To</Label><Input value={newIncident.assignedTo} onChange={e => setNewIncident(p => ({ ...p, assignedTo: e.target.value }))} /></div>
                  </div>
                  <Button onClick={handleAddIncident} className="w-full">Submit Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.filter(i => !search || i.description.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase())).map(inc => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-xs">{inc.id}</TableCell>
                    <TableCell><Badge variant="outline">{inc.type}</Badge></TableCell>
                    <TableCell className="text-sm">{inc.location}</TableCell>
                    <TableCell><Badge className={severityColor(inc.severity)}>{inc.severity}</Badge></TableCell>
                    <TableCell><Badge className={statusColor(inc.status)} variant="outline">{inc.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inc.reportedDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewIncident(inc)}><Eye className="w-3.5 h-3.5" /></Button>
                        {inc.status === 'Reported' && <Button size="sm" variant="ghost" onClick={() => updateIncident(inc.id, { status: 'Investigating' })}>Investigate</Button>}
                        {inc.status === 'Investigating' && <Button size="sm" variant="ghost" onClick={() => updateIncident(inc.id, { status: 'Resolved' })}>Resolve</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          {/* View Incident Dialog */}
          <Dialog open={!!viewIncident} onOpenChange={() => setViewIncident(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Incident Details - {viewIncident?.id}</DialogTitle></DialogHeader>
              {viewIncident && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Type:</span> {viewIncident.type}</div>
                    <div><span className="text-muted-foreground">Severity:</span> <Badge className={severityColor(viewIncident.severity)}>{viewIncident.severity}</Badge></div>
                    <div><span className="text-muted-foreground">Location:</span> {viewIncident.location}</div>
                    <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColor(viewIncident.status)} variant="outline">{viewIncident.status}</Badge></div>
                    <div><span className="text-muted-foreground">Reported By:</span> {viewIncident.reportedBy}</div>
                    <div><span className="text-muted-foreground">Assigned To:</span> {viewIncident.assignedTo}</div>
                  </div>
                  <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{viewIncident.description}</p></div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">DOSH & WIBA Compliance</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Score:</span>
              <div className="flex items-center gap-2 w-40"><Progress value={complianceScore} /><span className="text-sm font-bold">{complianceScore}%</span></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {['DOSH', 'WIBA'].map(cat => (
              <Card key={cat}>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" />{cat} Compliance</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {compliance.filter(c => c.category === cat).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{c.item}</p>
                        <p className="text-xs text-muted-foreground">Cert: {c.certNumber} • Expires: {c.expiryDate}</p>
                      </div>
                      <Badge className={statusColor(c.status)} variant="outline">{c.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Safety Inspections</h3>
            <Dialog open={inspectionDialog} onOpenChange={setInspectionDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Inspection</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Inspection</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Title</Label><Input value={newInspection.title} onChange={e => setNewInspection(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Location</Label><Input value={newInspection.location} onChange={e => setNewInspection(p => ({ ...p, location: e.target.value }))} /></div>
                    <div><Label>Inspector</Label><Input value={newInspection.inspector} onChange={e => setNewInspection(p => ({ ...p, inspector: e.target.value }))} /></div>
                  </div>
                  <div><Label>Date</Label><Input type="date" value={newInspection.date} onChange={e => setNewInspection(p => ({ ...p, date: e.target.value }))} /></div>
                  <div>
                    <Label>Checklist Items</Label>
                    {newInspection.checklist.map((c, i) => (
                      <Input key={i} className="mt-1" placeholder={`Item ${i + 1}`} value={c.item} onChange={e => {
                        const cl = [...newInspection.checklist];
                        cl[i] = { ...cl[i], item: e.target.value };
                        if (i === cl.length - 1 && e.target.value) cl.push({ item: '', checked: false, notes: '' });
                        setNewInspection(p => ({ ...p, checklist: cl }));
                      }} />
                    ))}
                  </div>
                  <Button onClick={handleAddInspection} className="w-full">Create Inspection</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {inspections.map(ins => (
              <Card key={ins.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{ins.title}</h4>
                      <p className="text-xs text-muted-foreground">{ins.location} • {ins.inspector} • {ins.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColor(ins.status)} variant="outline">{ins.status}</Badge>
                      {ins.result && <Badge className={statusColor(ins.result)} variant="outline">{ins.result}</Badge>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {ins.checklist.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={c.checked} onCheckedChange={(v) => {
                          const cl = [...ins.checklist]; cl[i] = { ...cl[i], checked: !!v };
                          updateInspection(ins.id, { checklist: cl });
                        }} />
                        <span className={c.checked ? 'line-through text-muted-foreground' : ''}>{c.item}</span>
                        {c.notes && <span className="text-xs text-muted-foreground ml-auto">({c.notes})</span>}
                      </div>
                    ))}
                  </div>
                  {ins.status === 'In Progress' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => updateInspection(ins.id, { status: 'Completed', result: 'Pass' })}>Mark Pass</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateInspection(ins.id, { status: 'Completed', result: 'Fail' })}>Mark Fail</Button>
                    </div>
                  )}
                  {ins.status === 'Scheduled' && (
                    <Button size="sm" className="mt-3" onClick={() => updateInspection(ins.id, { status: 'In Progress' })}>Start Inspection</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <h3 className="font-semibold text-foreground">Safety Alerts & Notifications</h3>
          <div className="space-y-2">
            {alerts.map(a => (
              <Card key={a.id} className={a.read ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${a.severity === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      {a.severity === 'Critical' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.message}</p>
                      <p className="text-xs text-muted-foreground">{a.type} • {a.date}</p>
                    </div>
                  </div>
                  {!a.read && <Button size="sm" variant="ghost" onClick={() => markAlertRead(a.id)}>Mark Read</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
