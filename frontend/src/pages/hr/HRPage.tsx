import { useState } from 'react';
import { useEmployeeStore } from '@/store/employeeStore';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { Search, Plus, Download, Filter, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/countries';
import { Link } from 'react-router-dom';
import AddEmployeeDialog from '@/components/hr/AddEmployeeDialog';

export default function HRPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const departments = ['All', ...new Set(employees.map((e) => e.department))];
  const filtered = employees.filter((e) => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email} ${e.position}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const statusVariant = (s: string) => s === 'Active' ? 'success' : s === 'On Leave' ? 'warning' : 'destructive';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="HR & People" description={`${employees.length} employees across ${new Set(employees.map(e => e.department)).size} departments`}>
        <button onClick={() => setShowAdd(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {departments.map((d) => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${deptFilter === d ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Position</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Gross Salary</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const gross = e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances;
                return (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                          {e.firstName[0]}{e.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{e.firstName} {e.lastName}</p>
                          <p className="text-xs text-muted-foreground">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{e.department}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{e.position}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={e.status} variant={statusVariant(e.status)} /></td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell font-medium">{formatCurrency(gross)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/hr/employee/${e.id}`} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No employees found matching your criteria.</div>
        )}
      </div>

      <AddEmployeeDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
