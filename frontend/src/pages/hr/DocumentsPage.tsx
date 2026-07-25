import { PageHeader } from '@/components/shared/CommonUI';
import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, Trash2, Upload, FolderOpen, Loader2, Search } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useEmployeeStore } from '@/store/employeeStore';
import { EmployeeDocument } from '@/types';

const categories = ['All', 'Contract', 'Policy', 'ID Document', 'Certificate', 'Payslip', 'Other'];

export default function DocumentsPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState('Other');
  const [uploading, setUploading] = useState(false);
  const [uploadEmpId, setUploadEmpId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllDocs = async () => {
    setLoading(true);
    try {
      const data = await api.get<EmployeeDocument[]>('/employee-documents/list/all');
      setDocs(data);
    } catch {
      const results: EmployeeDocument[] = [];
      for (const emp of employees) {
        try {
          const data = await api.get<EmployeeDocument[]>(`/employee-documents/list/${emp.id}`);
          results.push(...data);
        } catch { /* skip */ }
      }
      setDocs(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); fetchAllDocs(); }, []);

  const employeeName = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : empId;
  };

  const filtered = docs.filter((d) => {
    if (filter !== 'All' && d.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = employeeName(d.employeeId).toLowerCase();
      if (!d.originalName.toLowerCase().includes(q) && !name.includes(q)) return false;
    }
    return true;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFiles.length === 0) { toast.error('Select files'); return; }
    if (!uploadEmpId) { toast.error('Select employee'); return; }
    const empId = uploadEmpId;
    setUploading(true);
    try {
      const results: EmployeeDocument[] = [];
      for (const file of uploadFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', uploadCategory);
        const doc = await api.post<EmployeeDocument>(`/employee-documents/upload-multiple/${empId}`, fd);
        results.push(doc);
      }
      setDocs((prev) => [...results, ...prev]);
      toast.success(`${results.length} file(s) uploaded`);
      setShowUpload(false);
      setUploadFiles([]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.delete(`/employee-documents/${docId}`);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = (doc: EmployeeDocument) => {
    window.open(`/api/employee-documents/download/${doc.id}`, '_blank');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Employee Documents" description="Manage employee documents and records" icon={FolderOpen} actions={
        <button onClick={() => setShowUpload(true)} className="btn-primary"><Upload className="w-4 h-4" /> Upload Documents</button>
      } />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents or employee..." className="w-full rounded-lg border bg-background pl-9 p-2.5 text-sm" />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{c}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No documents found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="rounded-xl bg-card border p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2"><FileText className="w-5 h-5 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground">{employeeName(doc.employeeId)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-0.5">{doc.category}</span>
                <span>{formatSize(doc.size)}</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => handleDownload(doc)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"><Download className="w-3.5 h-3.5" /> Download</button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete {doc.originalName}? This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Upload Documents</h2><button onClick={() => setShowUpload(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Employee</label>
                <select value={uploadEmpId} onChange={(e) => setUploadEmpId(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                  <option value="">Select employee</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                  {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Files</label>
                <input ref={fileInputRef} type="file" multiple onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} className="w-full text-sm" />
              </div>
              <button type="submit" disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} file(s)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
