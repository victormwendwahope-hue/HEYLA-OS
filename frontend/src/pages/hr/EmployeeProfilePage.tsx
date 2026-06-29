import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/employeeStore';
import { StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Trash2, Download, FileText, Upload, Loader2, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getToken, apiBaseUrl } from '@/lib/api';
import { EmployeeDocument } from '@/types';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employee = useEmployeeStore((s) => s.employees.find((e) => e.id === id));
  const removeEmployee = useEmployeeStore((s) => s.removeEmployee);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const token = getToken();
  const baseUrl = apiBaseUrl();

  const fetchDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/employee-documents/list/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDocs(await res.json());
    } catch {} finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'documents') fetchDocs();
  }, [tab]);

  const handleDocUpload = async () => {
    if (uploadingFiles.length === 0) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      uploadingFiles.forEach((f) => fd.append('files', f));
      const res = await fetch(`${baseUrl}/employee-documents/upload-multiple/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
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
    if (!confirm('Delete this document?')) return;
    try {
      const res = await fetch(`${baseUrl}/employee-documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDocDownload = async (doc: EmployeeDocument) => {
    try {
      const res = await fetch(`${baseUrl}/employee-documents/download/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
          <button onClick={() => { if (confirm('Delete employee?')) { removeEmployee(employee.id); toast.success('Employee deleted'); navigate('/hr'); } }} className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Employee
          </button>
        </div>
      </div>

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
        const employeeAttendance = [
          { date: '2026-06-26', status: 'Present', timeIn: '08:00', timeOut: '17:00' },
          { date: '2026-06-25', status: 'Present', timeIn: '08:15', timeOut: '17:30' },
          { date: '2026-06-24', status: 'Late', timeIn: '09:30', timeOut: '17:00' },
          { date: '2026-06-23', status: 'Present', timeIn: '07:45', timeOut: '16:45' },
          { date: '2026-06-20', status: 'Absent', timeIn: '-', timeOut: '-' },
        ];
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
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{record.timeIn}</td>
                      <td className="py-2.5 px-3">{record.timeOut}</td>
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
                    <button onClick={() => handleDocDelete(doc.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
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
