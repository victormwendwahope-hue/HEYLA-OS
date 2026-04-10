import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEmployees } from '@/store/employeeStore';
import { StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar } from 'lucide-react';
import { Employee } from '@/types';

export default function EmployeeProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: employees = [], isLoading } = useEmployees();
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  const employee = employees.find((e: Employee) => e.id === id);

  useEffect(() => {
    if (id && !employees.length && !isLoading) {
      // Query auto-fetches
    }
  }, [id, employees.length, isLoading]);

  if (isLoading) return <div className="flex items-center justify-center h-96 text-muted-foreground">Loading...</div>;
  if (!employee) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Employee Not Found</h2>
        <p className="text-muted-foreground mb-4">The employee profile you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/hr')} className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Back to Employees
        </button>
      </div>
    </div>
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
            </div>
            <p className="text-muted-foreground">{employee.position} · {employee.department}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {employee.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {employee.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {employee.city}, {employee.country}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {employee.startDate}</span>
            </div>
          </div>
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
                <span className="font-medium">{String(value)}</span>
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
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payroll' && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Compensation Breakdown</h3>
          <div className="space-y-3">
            {[
              ['Base Salary', employee.baseSalary],
              ['Housing Allowance', employee.housingAllowance],
              ['Transport Allowance', employee.transportAllowance],
              ['Medical Allowance', employee.medicalAllowance],
              ['Other Allowances', employee.otherAllowances],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{formatCurrency(Number(value), employee.country)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-3 border-t-2 border-primary/20">
              <span className="font-bold">Gross Salary</span>
              <span className="font-bold text-primary">{formatCurrency(gross, employee.country)}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="glass rounded-xl p-5 text-center py-16">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Attendance tracking integrated in Attendance page.</p>
        </div>
      )}

      {tab === 'documents' && (
        <div className="glass rounded-xl p-5 text-center py-16">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Document management coming soon.</p>
        </div>
      )}
    </div>
  );
}
