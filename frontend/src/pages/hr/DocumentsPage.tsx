import { PageHeader } from '@/components/shared/CommonUI';
import { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, Trash2, Upload, FolderOpen, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getToken, apiBaseUrl } from '@/lib/api';
import { useEmployeeStore } from '@/store/employeeStore';
import { EmployeeDocument } from '@/types';

const categories = ['All', 'Contract', 'Policy', 'ID Document', 'Certificate', 'Payslip', 'Other'];

export default function DocumentsPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState('Other');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = getToken();
  const baseUrl = apiBaseUrl();

  const fetchAllDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/employee-documents/list/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setDocs(await res.json()); return; }
    } catch {}
    try {
      const results: EmployeeDocument[] = [];
      for (const emp of employees) {
        const r = await fetch(`${baseUrl}/employee-documents/list/${emp.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) results.push(...(await r.json()));
      }
      setDocs(results);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllDocs(); }, []);

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
    const empId = (document.getElementById('doc-emp-select') as HTMLSelectElement)?.value;
    if (!empId) { toast.error('Select employee'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      uploadFiles.forEach((f) => fd.append('files', f));
      fd.append('category', uploadCategory);
      const res = await fetch(`${baseUrl}/employee-documents/upload-multiple/${empId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success('Documents uploaded');
      setShowUpload(false);
      setUploadFiles([]);
      fetchAllDocs();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document permanently?')) return;
    try {
      const res = await fetch(`${baseUrl}/employee-documents/${docId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const res = await fetch(`${baseUrl}/employee-documents/download/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = doc.originalName;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Employee Documents" description={`${docs.length} documents across ${new Set(docs.map((d) => d.employeeId)).size} employees`}>
        <button onClick={() => setShowUpload(true)}
          className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 items-center">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {cat}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search docs or employee..."
            className="w-56 pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><FolderOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No documents found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="glass rounded-xl p-4 hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-primary"><FileText className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.originalName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.category} · {(doc.size / 1024).toFixed(0)} KB</p>
                  <p className="text-xs text-muted-foreground">by <strong>{employeeName(doc.employeeId)}</strong> · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => handleDownload(doc)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(doc.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Upload Documents</h2>
              <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Employee</label>
                <select id="doc-emp-select" required
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {employees.filter((e) => e.status === 'Active').map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.payrollNumber}</option>
                  ))}
                </select>
              </div>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                {uploadFiles.length > 0 ? (
                  <div className="space-y-1">
                    {uploadFiles.map((f, i) => <p key={i} className="text-sm font-medium text-foreground">{f.name}</p>)}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Click to select files</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, Images up to 10MB each</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.csv,.txt" className="hidden"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Contract', 'Policy', 'ID Document', 'Certificate', 'Payslip', 'Other'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Cancel</button>
                <button type="submit" disabled={uploading || uploadFiles.length === 0}
                  className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : `Upload (${uploadFiles.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}