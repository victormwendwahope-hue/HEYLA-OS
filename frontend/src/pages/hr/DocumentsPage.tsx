import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useState } from 'react';
import { Plus, X, FileText, Download, Trash2, Upload, File, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  category: 'Contract' | 'Policy' | 'ID Document' | 'Certificate' | 'Payslip' | 'Other';
  uploadedBy: string;
  uploadDate: string;
  size: string;
  employeeId?: string;
}

const mockDocs: Document[] = [
  { id: '1', name: 'Employee Handbook 2024.pdf', category: 'Policy', uploadedBy: 'Njeri Kariuki', uploadDate: '2024-01-05', size: '2.4 MB' },
  { id: '2', name: 'Wanjiku Mwangi - Employment Contract.pdf', category: 'Contract', uploadedBy: 'Njeri Kariuki', uploadDate: '2023-01-15', size: '890 KB', employeeId: '1' },
  { id: '3', name: 'KRA Compliance Certificate.pdf', category: 'Certificate', uploadedBy: 'Amina Hassan', uploadDate: '2024-01-20', size: '1.1 MB' },
  { id: '4', name: 'Leave Policy - Updated.pdf', category: 'Policy', uploadedBy: 'Njeri Kariuki', uploadDate: '2024-02-01', size: '540 KB' },
  { id: '5', name: 'January 2024 Payslips.zip', category: 'Payslip', uploadedBy: 'Amina Hassan', uploadDate: '2024-02-05', size: '3.2 MB' },
  { id: '6', name: 'Safety Training Certificate.pdf', category: 'Certificate', uploadedBy: 'Kiprop Kosgei', uploadDate: '2024-01-28', size: '780 KB' },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(mockDocs);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ name: '', category: 'Other' as Document['category'] });

  const categories = ['All', 'Contract', 'Policy', 'ID Document', 'Certificate', 'Payslip', 'Other'];
  const filtered = filter === 'All' ? docs : docs.filter((d) => d.category === filter);

  const categoryIcon = (cat: string) => {
    const m: Record<string, string> = { Contract: 'text-info', Policy: 'text-warning', 'ID Document': 'text-primary', Certificate: 'text-success', Payslip: 'text-primary', Other: 'text-muted-foreground' };
    return m[cat] || 'text-muted-foreground';
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Enter document name'); return; }
    setDocs((prev) => [...prev, { ...form, id: Date.now().toString(), uploadedBy: 'John Kamau', uploadDate: new Date().toISOString().split('T')[0], size: '1.0 MB' }]);
    setShowUpload(false);
    setForm({ name: '', category: 'Other' });
    toast.success('Document uploaded');
  };

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document deleted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Documents" description={`${docs.length} documents stored`}>
        <button onClick={() => setShowUpload(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="glass rounded-xl p-4 hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-muted ${categoryIcon(doc.category)}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{doc.category} · {doc.size}</p>
                <p className="text-xs text-muted-foreground">Uploaded {doc.uploadDate} by {doc.uploadedBy}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
              <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No documents found</p>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Upload Document</h2>
              <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <File className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop or click to select</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX up to 10MB</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Document Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Document['category'] })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Contract', 'Policy', 'ID Document', 'Certificate', 'Payslip', 'Other'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
