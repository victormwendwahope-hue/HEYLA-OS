import { useState } from 'react';
import { useEmployeeStore } from '@/store/employeeStore';
import { Employee } from '@/types';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/countries';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddEmployeeDialog({ open, onClose }: Props) {
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', nationalId: '', kraPin: '',
    nssfNo: '', nhifNo: '', department: '', position: '', employmentType: 'Full-time' as Employee['employmentType'],
    baseSalary: 0, housingAllowance: 0, transportAllowance: 0, medicalAllowance: 0, otherAllowances: 0,
    address: '', city: '', country: 'Kenya', emergencyContact: '', emergencyPhone: '',
    bankName: '', bankAccount: '',
  });

  if (!open) return null;

  const gross = form.baseSalary + form.housingAllowance + form.transportAllowance + form.medicalAllowance + form.otherAllowances;

  const update = (field: string, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Please fill required fields');
      return;
    }
    addEmployee({
      ...form,
      id: Date.now().toString(),
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
    });
    toast.success(`${form.firstName} ${form.lastName} added!`);
    onClose();
  };

  const Field = ({ label, field, type = 'text', required = false, half = false }: { label: string; field: string; type?: string; required?: boolean; half?: boolean }) => (
    <div className={half ? 'col-span-1' : 'col-span-2 sm:col-span-1'}>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}{required && <span className="text-destructive">*</span>}</label>
      <input type={type} value={(form as any)[field]} onChange={(e) => update(field, type === 'number' ? +e.target.value : e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );

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
              <Field label="First Name" field="firstName" required />
              <Field label="Last Name" field="lastName" required />
              <Field label="Email" field="email" type="email" required />
              <Field label="Phone" field="phone" />
              <Field label="National ID" field="nationalId" />
              <Field label="KRA PIN" field="kraPin" />
              <Field label="NSSF No" field="nssfNo" />
              <Field label="NHIF No" field="nhifNo" />
            </div>
          </div>

          {/* Employment */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Employment Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department" field="department" />
              <Field label="Position" field="position" />
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Employment Type</label>
                <select value={form.employmentType} onChange={(e) => update('employmentType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Full-time', 'Part-time', 'Contract', 'Intern'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Compensation (KES)</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Base Salary" field="baseSalary" type="number" />
              <Field label="Housing Allowance" field="housingAllowance" type="number" />
              <Field label="Transport Allowance" field="transportAllowance" type="number" />
              <Field label="Medical Allowance" field="medicalAllowance" type="number" />
              <Field label="Other Allowances" field="otherAllowances" type="number" />
            </div>
            <div className="mt-3 p-3 rounded-lg bg-accent border border-primary/20">
              <p className="text-sm font-semibold text-accent-foreground">Gross Salary: {formatCurrency(gross)}</p>
            </div>
          </div>

          {/* Address & Emergency */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Address & Emergency</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Address" field="address" />
              <Field label="City" field="city" />
              <Field label="Country" field="country" />
              <Field label="Emergency Contact" field="emergencyContact" />
              <Field label="Emergency Phone" field="emergencyPhone" />
            </div>
          </div>

          {/* Banking */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Banking Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bank Name" field="bankName" />
              <Field label="Account Number" field="bankAccount" />
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
