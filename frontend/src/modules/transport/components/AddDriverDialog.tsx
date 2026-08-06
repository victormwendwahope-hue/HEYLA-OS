import { useState } from 'react';
import { X, Upload, Camera, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Driver } from '@/modules/transport/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AddDriverDialog({ open, onClose }: Props) {
  const addDriver = useFleetStore((s) => s.addDriver);

  const [form, setForm] = useState({
    name: '', phone: '', license: '', licenseExpiry: '', hiredDate: '', days: '',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [docs, setDocs] = useState<{ id: string; name: string; mime: string; size: number; data: string }[]>([]);

  if (!open) return null;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const onPickPhoto = (file?: File) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast.error('Please upload an image file (JPG/PNG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onAddDocs = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        setDocs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, name: file.name, mime: file.type || 'application/octet-stream', size: file.size, data }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.license) {
      toast.error('Please fill the required fields: name, phone, and license');
      return;
    }
    const driver: Driver = {
      id: `d-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      license: form.license.trim(),
      licenseExpiry:
        form.licenseExpiry || new Date(Date.now() + (Number(form.days) || 365) * 86400000).toISOString().split('T')[0],
      status: 'Available',
      trips: 0,
      rating: 5,
      avatar: avatar || undefined,
      hiredDate: new Date().toISOString().split('T')[0],
      documents: docs.length ? docs : undefined,
      scores: { fuelEfficiency: 90, maintenance: 90, breakdowns: 90, tyres: 90, behavior: 90 },
    };
    addDriver(driver);
    toast.success(`${driver.name} added to the fleet`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-bold">Add New Driver</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Passport photo upload */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Passport Photo</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-border flex items-center justify-center shrink-0 bg-muted/40">
                {avatar ? (
                  <img src={avatar} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors text-center">
                <div className="flex items-center gap-2 text-primary">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload or take photo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">JPG/PNG — used as the driver&apos;s avatar</p>
                <input type="file" accept="image/*" capture="user"
                  onChange={(e) => onDropPhoto(e.target.files?.[0])}
                  className="hidden" />
              </label>
            </div>
            {avatar && (
              <button type="button" onClick={() => setAvatar(null)} className="mt-2 text-xs text-destructive hover:underline flex items-center gap-1">
                <Camera className="w-3 h-3" /> Remove photo
              </button>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Documents</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors text-center">
              <div className="flex items-center gap-2 text-primary">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload driving & ID documents</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">License, National ID, NTSA Certificate, Insurance...</p>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => onAddDocs(e.target.files)}
                className="hidden" />
            </label>
            {docs.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{docs.length} document(s)</p>
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{d.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(d.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setDocs((prev) => prev.filter((x) => x.id !== d.id))} className="text-destructive hover:underline text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-primary">Driver Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name <span className="text-destructive">*</span></label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="e.g. Peter Otieno" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone <span className="text-destructive">*</span></label>
                <input type="text" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} placeholder="+254 7..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">License No <span className="text-destructive">*</span></label>
                <input type="text" value={form.license} onChange={(e) => update('license', e.target.value)} className={inputCls} placeholder="DL-1234567" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">License Expiry</label>
                <input type="date" value={form.licenseExpiry} onChange={(e) => update('licenseExpiry', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Or validity (days)</label>
                <input type="number" value={form.days} onChange={(e) => update('days', e.target.value)} className={inputCls} placeholder="365" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
}