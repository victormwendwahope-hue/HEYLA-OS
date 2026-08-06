import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { iso } from '@/modules/crm/utils/format';

interface Line { description: string; quantity: number; unitPrice: number; discountPct: number; taxPct: number; }

export default function AddQuotationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [validUntil, setValidUntil] = useState(iso(new Date(Date.now() + 30 * 86400000)));
  const [lines, setLines] = useState<Line[]>([{ description: '', quantity: 1, unitPrice: 0, discountPct: 0, taxPct: 16 }]);

  if (!open) return null;

  const addLine = () => setLines((l) => [...l, { description: '', quantity: 1, unitPrice: 0, discountPct: 0, taxPct: 16 }]);
  const setLine = (i: number, k: keyof Line, v: string | number) => setLines((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const remLine = (i: number) => setLines((l) => (l.length > 1 ? l.filter((_, j) => j !== i) : l));

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discountPct / 100), 0);
  const taxTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discountPct / 100) * (l.taxPct / 100), 0);
  const total = subtotal + taxTotal;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !title.trim()) {
      toast.error('Company and title required');
      return;
    }
    if (!lines.length || !lines[0].description.trim()) {
      toast.error('Add at least one item with a description');
      return;
    }
    store.addQuotation({
      companyId,
      opportunityId: '',
      title: title.trim(),
      status: 'Draft',
      issueDate: iso(new Date()),
      validUntil,
      currency,
      exchangeRate: 1,
      subtotal,
      taxTotal,
      discountTotal: lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.discountPct / 100), 0),
      total,
      totalCurrency: total,
      lines: lines.map((l, i) => ({
        id: `line-${i}`, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice,
        discountPct: l.discountPct, taxPct: l.taxPct,
        lineTotal: l.quantity * l.unitPrice * (1 - l.discountPct / 100),
        productId: '', productName: l.description, category: 'Product',
      })),
      version: 1,
      revisionId: '',
      createdBy: 'rep-1',
      approvedBy: '',
      approvalState: 'None',
      signerName: '',
      signerEmail: '',
      signedAt: '',
      notes: '',
      terms: 'Payment due within 30 days.',
    });
    toast.success('Quotation created');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">New Quotation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Multi-line, tax-aware proposal builder.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Company *</label>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm" required>
                <option value="">Select account...</option>
                {store.companies.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                <option>KES</option><option>USD</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Valid Until</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-primary flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add line</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="flex gap-2 items-center border border-border rounded-lg p-2">
                  <input value={l.description} onChange={(e) => setLine(i, 'description', e.target.value)} placeholder="Description" className="flex-1 min-w-32 px-2 py-1.5 rounded border border-border text-sm" />
                  <input type="number" value={l.quantity} onChange={(e) => setLine(i, 'quantity', Number(e.target.value))} className="w-16 px-2 py-1.5 rounded border border-border text-sm" title="Qty" />
                  <input type="number" value={l.unitPrice} onChange={(e) => setLine(i, 'unitPrice', Number(e.target.value))} className="w-24 px-2 py-1.5 rounded border border-border text-sm" title="Unit" />
                  <input type="number" value={l.discountPct} onChange={(e) => setLine(i, 'discountPct', Number(e.target.value))} className="w-14 px-2 py-1.5 rounded border border-border text-sm" title="Disc %" />
                  <input type="number" value={l.taxPct} onChange={(e) => setLine(i, 'taxPct', Number(e.target.value))} className="w-14 px-2 py-1.5 rounded border border-border text-sm" title="Tax %" />
                  <button type="button" onClick={() => remLine(i)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 text-sm border-t border-border pt-3 space-y-1 flex-col items-end">
              <div className="flex justify-between w-72"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{money(total)}</span></div>
              <div className="flex justify-between w-72"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">{money(taxTotal)}</span></div>
              <div className="flex justify-between w-72 text-base font-bold"><span>Total</span><span className="tabular-nums">{money(subtotal + taxTotal)}</span></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Create Quotation</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const moneyFmt = new Intl.NumberFormat('en', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
function money(v: number) { return moneyFmt.format(v); }