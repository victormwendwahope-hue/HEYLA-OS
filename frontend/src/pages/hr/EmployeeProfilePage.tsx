import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Trash2, Download, FileText, Upload, Loader2, Trash, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api, apiBaseUrl, getToken } from '@/lib/api';
import { EmployeeDocument } from '@/types';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EmployeeProfilePage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const employee = employees.find((e) => e.id === id);
  const removeEmployee = useEmployeeStore((s) => s.removeEmployee);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const { records: attRecords, fetchRecords: fetchAttRecords } = useAttendanceStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const openEdit = () => {
    if (!employee) return;
    setEditForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      baseSalary: employee.baseSalary,
      hourlyRate: employee.hourlyRate,
      housingAllowance: employee.housingAllowance,
      transportAllowance: employee.transportAllowance,
      medicalAllowance: employee.medicalAllowance,
      otherAllowances: employee.otherAllowances,
      address: employee.address,
      city: employee.city,
      country: employee.country,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      bankName: employee.bankName,
      bankAccount: employee.bankAccount,
    });
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!employee) return;
    updateEmployee(employee.id, editForm);
    setEditDialogOpen(false);
  };

  const fetchDocs = async () => {
    setDocsLoading(true);
    try {
      const data = await api.get<EmployeeDocument[]>(`/employee-documents/list/${id}`);
      setDocs(data);
    } catch {} finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttRecords();
  }, []);

  useEffect(() => {
    if (tab === 'documents') fetchDocs();
  }, [tab]);

  const handleDocUpload = async () => {
    if (uploadingFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of uploadingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        await api.post(`/employee-documents/upload-multiple/${id}`, fd);
      }
      await fetchDocs();
      setUploadingFiles([]);
      toast.success('Documents uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocDelete = async (docId: string) => {
    try {
      await api.delete(`/employee-documents/${docId}`);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDocDownload = async (doc: EmployeeDocument) => {
    try {
      const res = await fetch(`${apiBaseUrl()}/employee-documents/download/${doc.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  if (!employee) return (
    <div className="flex items-center justify-center h-96 text-muted-foreground">Employee not found.</div>
  );

  const gross = employee.baseSalary + employee.housingAllowance + employee.transportAllowance + employee.medicalAllowance + employee.otherAllowances;
  const tabs = ['overview', 'payroll', 'attendance', 'documents'];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/hr" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to HR
      </Link>

      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
              <StatusBadge status={employee.status} variant={employee.status === 'Active' ? 'success' : 'warning'} />
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{employee.payrollNumber}</span>
            </div>
            <p className="text-muted-foreground">{employee.position} · {employee.department}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {employee.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {employee.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {employee.city}, {employee.country}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {employee.startDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openEdit} className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to delete {employee.firstName} {employee.lastName}? This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { removeEmployee(employee.id); navigate({ to: '/hr' }); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Employee</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First Name</Label><Input value={editForm.firstName || ''} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
            <div><Label>Last Name</Label><Input value={editForm.lastName || ''} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
            <div className="col-span-2"><Label>Email</Label><Input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div><Label>Position</Label><Input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} /></div>
            <div><Label>Department</Label><Input value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} /></div>
            <div><Label>Base Salary</Label><Input type="number" value={editForm.baseSalary || 0} onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })} /></div>
            <div><Label>Hourly Rate</Label><Input type="number" value={editForm.hourlyRate || 0} onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })} /></div>
            <div><Label>Housing Allowance</Label><Input type="number" value={editForm.housingAllowance || 0} onChange={(e) => setEditForm({ ...editForm, housingAllowance: Number(e.target.value) })} /></div>
            <div><Label>Transport Allowance</Label><Input type="number" value={editForm.transportAllowance || 0} onChange={(e) => setEditForm({ ...editForm, transportAllowance: Number(e.target.value) })} /></div>
            <div><Label>Medical Allowance</Label><Input type="number" value={editForm.medicalAllowance || 0} onChange={(e) => setEditForm({ ...editForm, medicalAllowance: Number(e.target.value) })} /></div>
            <div><Label>Other Allowances</Label><Input type="number" value={editForm.otherAllowances || 0} onChange={(e) => setEditForm({ ...editForm, otherAllowances: Number(e.target.value) })} /></div>
            <div className="col-span-2"><Label>Address</Label><Input value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
            <div><Label>City</Label><Input value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></div>
            <div><Label>Country</Label><Input value={editForm.country || ''} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} /></div>
            <div><Label>Emergency Contact</Label><Input value={editForm.emergencyContact || ''} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} /></div>
            <div><Label>Emergency Phone</Label><Input value={editForm.emergencyPhone || ''} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} /></div>
            <div><Label>Bank Name</Label><Input value={editForm.bankName || ''} onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })} /></div>
            <div><Label>Bank Account</Label><Input value={editForm.bankAccount || ''} onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })} /></div>
          </div>
          <Button onClick={saveEdit} className="w-full mt-2">Save Changes</Button>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="font-semibold">Personal Details</h3>
            {[
              ['National ID', employee.nationalId],
              ['KRA PIN', employee.kraPin],
              ['NSSF No', employee.nssfNo],
              ['NHIF No', employee.nhifNo],
              ['Employment Type', employee.employmentType],
              ['Address', `${employee.address}, ${employee.city}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="font-semibold">Emergency & Banking</h3>
            {[
              ['Emergency Contact', employee.emergencyContact],
              ['Emergency Phone', employee.emergencyPhone],
              ['Bank', employee.bankName],
              ['Account', employee.bankAccount],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payroll' && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Compensation Breakdown</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">{employee.payType} Rate</span>
          </div>
          <div className="space-y-3">
            {employee.payType === 'Hourly' ? (
              <>
                <div className="flex justify-between text-sm py-2 border-b border-border">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium">{formatCurrency(employee.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t-2 border-primary/20">
                  <span className="font-bold">Monthly Est. (160hrs)</span>
                  <span className="font-bold text-primary">{formatCurrency(employee.hourlyRate * 160)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-sm py-2 border-b border-border">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">{formatCurrency(employee.baseSalary)}</span>
                </div>
                {employee.payType === 'Salary' && (
                  <>
                    <div className="flex justify-between text-sm py-2 border-b border-border">
                      <span className="text-muted-foreground">Housing Allowance</span>
                      <span className="font-medium">{formatCurrency(employee.housingAllowance)}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-border">
                      <span className="text-muted-foreground">Medical Allowance</span>
                      <span className="font-medium">{formatCurrency(employee.medicalAllowance)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm py-2 border-b border-border">
                  <span className="text-muted-foreground">Transport Allowance</span>
                  <span className="font-medium">{formatCurrency(employee.transportAllowance)}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">Other Allowances</span>
                  <span className="font-medium">{formatCurrency(employee.otherAllowances)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t-2 border-primary/20">
                  <span className="font-bold">Gross Salary</span>
                  <span className="font-bold text-primary">{formatCurrency(gross)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && (() => {
        const employeeAttendance = attRecords
          .filter(r => r.employeeId === employee.id)
          .slice(-30)
          .reverse();
        return (
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Attendance Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Date</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-left py-2 px-3 font-medium">Time In</th>
                    <th className="text-left py-2 px-3 font-medium">Time Out</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAttendance.map((record) => (
                    <tr key={record.date} className="border-b border-border/50">
                      <td className="py-2.5 px-3">{record.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'Present' ? 'bg-green-500/10 text-green-500' :
                          record.status === 'Late' ? 'bg-yellow-500/10 text-yellow-500' :
                          record.status === 'Absent' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{record.checkIn || '-'}</td>
                      <td className="py-2.5 px-3">{record.checkOut || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {tab === 'documents' && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Documents</h3>
            <div className="flex items-center gap-2">
              {uploadingFiles.length > 0 && (
                <button onClick={handleDocUpload} disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload {uploadingFiles.length}
                </button>
              )}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Add Files
                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.csv,.txt"
                  onChange={(e) => setUploadingFiles(Array.from(e.target.files || []))}
                  className="hidden" />
              </label>
            </div>
          </div>
          {uploadingFiles.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-muted space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{uploadingFiles.length} pending</p>
              {uploadingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> {f.name}
                </div>
              ))}
            </div>
          )}
          {docsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="w-8 h-8 text-primary/60 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.originalName}</p>
                      <p className="text-xs text-muted-foreground">{doc.category} · {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleDocDownload(doc)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete {doc.originalName}?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDocDelete(doc.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
