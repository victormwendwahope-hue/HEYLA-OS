import { create } from 'zustand';
import {
  Company, Contact, Lead, Opportunity, Quotation, Communication, Ticket,
  Contract, SalesRep, AutomationRule, Activity, RevenueRecord,
} from '@/modules/crm/types';
import { mockData, AUTOMATION_RULES } from '@/modules/crm/data/mockData';
import { iso } from '@/modules/crm/utils/format';

interface CrmState {
  initialized: boolean;
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  opportunities: Opportunity[];
  quotations: Quotation[];
  communications: Communication[];
  tickets: Ticket[];
  contracts: Contract[];
  reps: SalesRep[];
  automationRules: AutomationRule[];
  activities: Activity[];
  revenue: RevenueRecord[];

  init: () => void;

  addCompany: (c: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  removeCompany: (id: string) => void;

  addLead: (l: Omit<Lead, 'id' | 'ref' | 'createdAt' | 'score' | 'scoreColor' | 'scoreParts'>) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  convertLead: (id: string, customerId: string) => void;
  removeLead: (id: string) => void;

  addOpportunity: (o: Omit<Opportunity, 'id' | 'createdAt' | 'lastActivity'>) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  moveStage: (id: string, stage: Opportunity['stage']) => void;
  removeOpportunity: (id: string) => void;

  addQuotation: (q: Omit<Quotation, 'id' | 'number' | 'createdAt'>) => void;
  updateQuotation: (id: string, patch: Partial<Quotation>) => void;
  removeQuotation: (id: string) => void;

  addTicket: (t: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'slaBreached'>) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;

  acknowledgeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  addRule: (r: Omit<AutomationRule, 'id' | 'runCount' | 'runsToday' | 'createdAt'>) => void;

  addCommunication: (c: Omit<Communication, 'id' | 'sentAt'>) => void;
  addActivity: (a: Omit<Activity, 'id' | 'createdAt'>) => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const useCrmStore = create<CrmState>((set, get) => ({
  initialized: false,
  companies: [],
  contacts: [],
  leads: [],
  opportunities: [],
  quotations: [],
  communications: [],
  tickets: [],
  contracts: [],
  reps: [],
  automationRules: [],
  activities: [],
  revenue: [],

  init: () => {
    if (get().initialized) return;
    set({
      initialized: true,
      companies: [...mockData.companies],
      contacts: [...mockData.contacts],
      leads: [...mockData.leads],
      opportunities: [...mockData.opportunities],
      quotations: [...mockData.quotations],
      communications: [...mockData.communications],
      tickets: [...mockData.tickets],
      contracts: [...mockData.contracts],
      reps: [...mockData.reps],
      automationRules: [...AUTOMATION_RULES],
      activities: [...mockData.activities],
      revenue: [...mockData.revenue],
    });
  },

  addCompany: (c: Partial<Company> & { name: string }) => set((s) => ({
    companies: [{
      id: uid('cmp'), createdAt: iso(new Date()),
      shortName: (c.name).split(' ')[0].slice(0, 6).toUpperCase(),
      industry: 'Retail', size: '11-50', status: 'Lead' as Company['status'],
      email: '', phone: '', website: '', address: '', city: '', country: 'Kenya',
      linkedin: '', foundedYear: 2000, notes: '', ownerId: 'rep-1',
      annualRevenue: 0, employees: 0, healthScore: 60, healthBand: 'attention',
      linkedVehicleIds: [], linkedProjectIds: [],
      ...c,
    }, ...s.companies],
  })),
  updateCompany: (id, patch) => set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  removeCompany: (id) => set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),

  addLead: (l) => {
    const id = uid('lead');
    const score = 60; // default pending enrich
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : score >= 40 ? 'orange' : 'red';
    set((s) => ({
      leads: [{
        ...l, id, ref: `LD-${1000 + s.leads.length + 1}`, createdAt: iso(new Date()),
        score, scoreColor: color as Lead['scoreColor'],
        scoreParts: { industryFit: 50, budget: 50, engagement: 50, response: 50, companySize: 50, history: 50 },
      }, ...s.leads],
    }));
  },
  updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
  convertLead: (id, customerId) => set((s) => ({
    leads: s.leads.map((l) => (l.id === id ? { ...l, status: 'Qualified', convertedToCustomerId: customerId } : l)),
  })),
  removeLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

  addOpportunity: (o) => set((s) => ({ opportunities: [{ ...o, id: uid('opp'), createdAt: iso(new Date()), lastActivity: iso(new Date()) }, ...s.opportunities] })),
  updateOpportunity: (id, patch) => set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
  moveStage: (id, stage) => set((s) => ({
    opportunities: s.opportunities.map((o) => {
      if (o.id !== id) return o;
      const prob = { 'New Lead': 10, 'Qualified': 20, 'Meeting': 30, 'Proposal': 45, 'Negotiation': 60, 'Review': 70, 'Contract Sent': 80, 'Contracted': 85, 'Onboarding': 90, 'Closed - Won': 100, 'Closed - Lost': 0 }[stage];
      return { ...o, stage, probability: prob, status: stage === 'Closed - Won' ? 'Won' : stage === 'Closed - Lost' ? 'Lost' : 'Open', amountTotal: stage === 'Closed - Won' ? o.value : o.amountTotal, isClosedWon: stage === 'Closed - Won' };
    }),
  })),
  removeOpportunity: (id) => set((s) => ({ opportunities: s.opportunities.filter((o) => o.id !== id) })),

  addQuotation: (q) => set((s) => ({ quotations: [{ ...q, id: uid('quo'), number: `QT-${202600 + s.quotations.length + 1}`, createdAt: iso(new Date()) }, ...s.quotations] })),
  updateQuotation: (id, patch) => set((s) => ({ quotations: s.quotations.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
  removeQuotation: (id) => set((s) => ({ quotations: s.quotations.filter((q) => q.id !== id) })),

  addTicket: (t) => set((s) => ({ tickets: [{ ...t, id: uid('tic'), number: `TK-${7000 + s.tickets.length + 1}`, createdAt: iso(new Date()), updatedAt: iso(new Date()) }, ...s.tickets] })),
  updateTicket: (id, patch) => set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  acknowledgeRule: (id) => set((s) => ({ automationRules: s.automationRules.map((r) => (r.id === id ? { ...r, runCount: r.runCount + 1, runsToday: r.runsToday + 1, lastRunAt: iso(new Date()) } : r)) })),
  toggleRule: (id) => set((s) => ({ automationRules: s.automationRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
  addRule: (r) => set((s) => ({ automationRules: [{ ...r, id: uid('ar'), runCount: 0, runsToday: 0, createdAt: iso(new Date()) }, ...s.automationRules] })),

  addCommunication: (c) => set((s) => ({ communications: [{ ...c, id: uid('com'), sentAt: iso(new Date()) }, ...s.communications] })),
  addActivity: (a) => set((s) => ({ activities: [{ ...a, id: uid('act'), createdAt: iso(new Date()) }, ...s.activities] })),
}));