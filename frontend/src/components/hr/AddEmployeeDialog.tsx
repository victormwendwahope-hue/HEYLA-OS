import { useState } from 'react';
import { useEmployeeStore } from '@/store/employeeStore';
import { Employee } from '@/types';
import { X, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/countries';
import { getToken, apiBaseUrl } from '@/lib/api';

interface FieldProps {
  label: string;
  field: string;
  form: Record<string, any>;
  update: (field: string, value: string) => void;
  numeric?: boolean;
  required?: boolean;
  half?: boolean;
}

const Field = ({ label, field, form, update, numeric = false, required = false, half = false }: FieldProps) => (
  <div className={half ? 'col-span-1' : 'col-span-2 sm:col-span-1'}>
    <label className="text-xs font-medium text-muted-foreground mb-1 block">
      {label}
      {required && <span className="text-destructive">*</span>}
    </label>
    <input
      type="text"
      inputMode={numeric ? 'numeric' : 'text'}
      value={form[field] ?? ''}
      onChange={(e) => update(field, e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'form' | 'documents';

export default function AddEmployeeDialog({ open, onClose }: Props) {
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const employees = useEmployeeStore((s) => s.employees);
  const [step, setStep] = useState<Step>('form');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', nationalId: '', kraPin: '',
    nssfNo: '', nhifNo: '', department: '', position: '', employmentType: 'Full-time' as Employee['employmentType'],
    payType: 'Salary' as Employee['payType'], baseSalary: '', hourlyRate: '',
    housingAllowance: '', transportAllowance: '', medicalAllowance: '', otherAllowances: '',
    address: '', city: '', country: 'Kenya', emergencyContact: '', emergencyPhone: '',
    bankName: '', bankAccount: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  if (!open) return null;

  const gross = (Number(form.baseSalary) || 0) + (Number(form.housingAllowance) || 0) + (Number(form.transportAllowance) || 0) + (Number(form.medicalAllowance) || 0) + (Number(form.otherAllowances) || 0);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const generatePayrollNumber = () => {
    const max = employees.reduce((m, e) => {
      const num = parseInt((e.payrollNumber || '').replace('PAY-', ''), 10);
      return isNaN(num) ? m : Math.max(m, num);
    }, 0);
    return `PAY-${String(max + 1).padStart(3, '0')}`;
  };

  const reset = () => {
    setForm({
      firstName: '', lastName: '', email: '', phone: '', nationalId: '', kraPin: '',
      nssfNo: '', nhifNo: '', department: '', position: '', employmentType: 'Full-time' as Employee['employmentType'],
      payType: 'Salary' as Employee['payType'], baseSalary: '', hourlyRate: '',
      housingAllowance: '', transportAllowance: '', medicalAllowance: '', otherAllowances: '',
      address: '', city: '', country: 'Kenya', emergencyContact: '', emergencyPhone: '',
      bankName: '', bankAccount: '',
    });
    setStep('form');
    setCreatedId(null);
    setFiles([]);
    setUploadedCount(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill required fields');
      return;
    }

    const emp = {
      ...form,
      id: Date.now().toString(),
      payrollNumber: generatePayrollNumber(),
      baseSalary: Number(form.baseSalary) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      housingAllowance: Number(form.housingAllowance) || 0,
      transportAllowance: Number(form.transportAllowance) || 0,
      medicalAllowance: Number(form.medicalAllowance) || 0,
      otherAllowances: Number(form.otherAllowances) || 0,
      status: 'Active' as const,
      startDate: new Date().toISOString().split('T')[0],
    };
    addEmployee(emp);
    setCreatedId(emp.id);
    toast.success(`${form.firstName} ${form.lastName} added!`);
    setStep('documents');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.success('Employee saved. No documents uploaded.');
      reset();
      onClose();
      return;
    }
    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const res = await fetch(`${apiBaseUrl()}/employee-documents/upload-multiple/${createdId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const docs = await res.json();
      setUploadedCount(docs.length);
      toast.success(`${docs.length} document(s) uploaded`);
      reset();
      onClose();
    } catch {
      toast.error('Document upload failed. Employee was saved.');
      reset();
      onClose();
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    reset();
    onClose();
  };

  if (step === 'documents') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
        <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4 animate-scale-in">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold">Upload Supporting Documents</h2>
            <button onClick={handleSkip} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground">Attach contracts, IDs, certificates, or other documents for this employee.</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to select files</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, Images — up to 10 MB each</p>
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.csv,.txt"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden" />
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{files.length} file(s) selected</p>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}
            {uploadedCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> {uploadedCount} document(s) uploaded
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-border">
            <button onClick={handleSkip} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Skip</button>
            <button onClick={handleUpload} disabled={uploading || files.length === 0}
              className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <>Upload {files.length > 0 ? `(${files.length})` : ''}</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Add New Employee</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Personal */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" field="firstName" form={form} update={update} required />
              <Field label="Last Name" field="lastName" form={form} update={update} required />
              <Field label="Email" field="email" form={form} update={update} required />
              <Field label="Phone" field="phone" form={form} update={update} />
              <Field label="National ID" field="nationalId" form={form} update={update} />
              <Field label="KRA PIN" field="kraPin" form={form} update={update} />
              <Field label="NSSF No" field="nssfNo" form={form} update={update} />
              <Field label="NHIF No" field="nhifNo" form={form} update={update} />
            </div>
          </div>

          {/* Employment */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Employment Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department" field="department" form={form} update={update} />
              <Field label="Position" field="position" form={form} update={update} />
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Employment Type</label>
                <select value={form.employmentType} onChange={(e) => update('employmentType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Pay Type</label>
                <select value={form.payType} onChange={(e) => update('payType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Salary', 'Hourly', 'Basic'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {form.payType === 'Hourly' && <Field label="Hourly Rate" field="hourlyRate" form={form} update={update} numeric />}
            </div>
          </div>

          {/* Salary */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Compensation ({form.payType === 'Hourly' ? 'Per Hour' : 'KES'})</h3>
            <div className="grid grid-cols-2 gap-3">
              {form.payType !== 'Hourly' && <Field label="Base Salary" field="baseSalary" form={form} update={update} numeric />}
              {form.payType === 'Hourly' && <Field label="Hourly Rate" field="hourlyRate" form={form} update={update} numeric />}
              {form.payType === 'Salary' && <Field label="Housing Allowance" field="housingAllowance" form={form} update={update} numeric />}
              {form.payType !== 'Hourly' && <Field label="Transport Allowance" field="transportAllowance" form={form} update={update} numeric />}
              {form.payType === 'Salary' && <Field label="Medical Allowance" field="medicalAllowance" form={form} update={update} numeric />}
              {form.payType !== 'Hourly' && <Field label="Other Allowances" field="otherAllowances" form={form} update={update} numeric />}
            </div>
            {form.payType !== 'Hourly' && (
              <div className="mt-3 p-3 rounded-lg bg-accent border border-primary/20">
                <p className="text-sm font-semibold text-accent-foreground">Gross Salary: {formatCurrency(gross)}</p>
              </div>
            )}
          </div>

          {/* Address & Emergency */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Address & Emergency</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Address" field="address" form={form} update={update} />
              <Field label="City" field="city" form={form} update={update} />
              <Field label="Country" field="country" form={form} update={update} />
              <Field label="Emergency Contact" field="emergencyContact" form={form} update={update} />
              <Field label="Emergency Phone" field="emergencyPhone" form={form} update={update} />
            </div>
          </div>

          {/* Banking */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Banking Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bank Name" field="bankName" form={form} update={update} />
              <Field label="Account Number" field="bankAccount" form={form} update={update} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}