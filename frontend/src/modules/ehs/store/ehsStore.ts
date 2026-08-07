import { create } from 'zustand';
import {
  Incident, Hazard, Inspection, PermitToWork, TrainingRecord, PpeItem, CorrectiveAction,
  Investigation, EnvironmentalRecord, VehicleSafety, OccupationalHealthRecord, ContractorScore,
  WibaClaim, ToolboxTalk,
} from '@/modules/ehs/types';
import { mockData } from '@/modules/ehs/data/mockData';
import { iso } from '@/modules/ehs/utils/format';

interface EhsState {
  initialized: boolean;
  incidents: Incident[];
  hazards: Hazard[];
  inspections: Inspection[];
  permits: PermitToWork[];
  training: TrainingRecord[];
  ppe: PpeItem[];
  correctiveActions: CorrectiveAction[];
  investigations: Investigation[];
  environmental: EnvironmentalRecord[];
  vehicleSafety: VehicleSafety[];
  occupationalHealth: OccupationalHealthRecord[];
  contractors: ContractorScore[];
  wibaClaims: WibaClaim[];
  toolboxTalks: ToolboxTalk[];
  hoursWorked: number;

  init: () => void;

  addIncident: (i: Omit<Incident, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => void;
  updateIncident: (id: string, patch: Partial<Incident>) => void;

  addHazard: (h: Omit<Hazard, 'id' | 'reference' | 'createdAt' | 'score' | 'band'>) => void;
  updateHazard: (id: string, patch: Partial<Hazard>) => void;

  addInspection: (i: Omit<Inspection, 'id' | 'reference' | 'createdAt'>) => void;
  updateInspection: (id: string, patch: Partial<Inspection>) => void;

  addPermit: (p: Omit<PermitToWork, 'id' | 'reference' | 'signature'>) => void;
  updatePermit: (id: string, patch: Partial<PermitToWork>) => void;

  addCorrectiveAction: (c: Omit<CorrectiveAction, 'id' | 'reference' | 'createdById'>) => void;
  updateCorrectiveAction: (id: string, patch: Partial<CorrectiveAction>) => void;

  addToolboxTalk: (t: Omit<ToolboxTalk, 'id' | 'reference'>) => void;

  addPpeItem: (p: Omit<PpeItem, 'id' | 'replacementHistory'>) => void;
  updatePpeItem: (id: string, patch: Partial<PpeItem>) => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const useEhsStore = create<EhsState>((set, get) => ({
  initialized: false,
  incidents: [],
  hazards: [],
  inspections: [],
  permits: [],
  training: [],
  ppe: [],
  correctiveActions: [],
  investigations: [],
  environmental: [],
  vehicleSafety: [],
  occupationalHealth: [],
  contractors: [],
  wibaClaims: [],
  toolboxTalks: [],
  hoursWorked: 0,

  init: () => {
    if (get().initialized) return;
    set({
      initialized: true,
      incidents: [...mockData.incidents],
      hazards: [...mockData.hazards],
      inspections: [...mockData.inspections],
      permits: [...mockData.permits],
      training: [...mockData.training],
      ppe: [...mockData.ppe],
      correctiveActions: [...mockData.correctiveActions],
      investigations: [...mockData.investigations],
      environmental: [...mockData.environmental],
      vehicleSafety: [...mockData.vehicleSafety],
      occupationalHealth: [...mockData.occupationalHealth],
      contractors: [...mockData.contractors],
      wibaClaims: [...mockData.wibaClaims],
      toolboxTalks: [...mockData.toolboxTalks],
      hoursWorked: mockData.hoursWorked,
    });
  },

  addIncident: (i) => set((s) => ({
    incidents: [{
      ...i,
      id: uid('inc'),
      number: `EHS-${4100 + s.incidents.length + 1}`,
      createdAt: iso(new Date()),
      updatedAt: iso(new Date()),
    }, ...s.incidents],
  })),
  updateIncident: (id, patch) => set((s) => ({
    incidents: s.incidents.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: iso(new Date()) } : i)),
  })),

  addHazard: (h) => {
    const { riskScore, riskBandOf } = { riskScore: (l: number, se: number) => l * se, riskBandOf: (sc: number) => (sc >= 15 ? 'critical' : sc >= 10 ? 'high' : sc >= 5 ? 'medium' : 'low') as Hazard['band'] };
    const score = riskScore(h.likelihood, h.severity);
    set((s) => ({
      hazards: [{
        ...h,
        id: uid('haz'),
        reference: `HZ-${3300 + s.hazards.length + 1}`,
        createdAt: iso(new Date()),
        score,
        band: riskBandOf(score),
      }, ...s.hazards],
    }));
  },
  updateHazard: (id, patch) => set((s) => ({
    hazards: s.hazards.map((h) => {
      if (h.id !== id) return h;
      const score = patch.likelihood != null || patch.severity != null
        ? (patch.likelihood ?? h.likelihood) * (patch.severity ?? h.severity)
        : h.score;
      const band = score >= 15 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low';
      return { ...h, ...patch, score, band: band as Hazard['band'] };
    }),
  })),

  addInspection: (i) => set((s) => ({
    inspections: [{
      ...i,
      id: uid('ins'),
      reference: `INS-${5200 + s.inspections.length + 1}`,
      createdAt: iso(new Date()),
    }, ...s.inspections],
  })),
  updateInspection: (id, patch) => set((s) => ({
    inspections: s.inspections.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  })),

  addPermit: (p) => set((s) => ({
    permits: [{
      ...p,
      id: uid('ptw'),
      reference: `PTW-${6100 + s.permits.length + 1}`,
      signature: '',
    }, ...s.permits],
  })),
  updatePermit: (id, patch) => set((s) => ({
    permits: s.permits.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  })),

  addCorrectiveAction: (c) => set((s) => ({
    correctiveActions: [{
      ...c,
      id: uid('ca'),
      reference: `CA-${8400 + s.correctiveActions.length + 1}`,
      createdById: 'emp-1',
      completedAt: '',
      verification: '',
    }, ...s.correctiveActions],
  })),
  updateCorrectiveAction: (id, patch) => set((s) => ({
    correctiveActions: s.correctiveActions.map((c) => {
      if (c.id !== id) return c;
      const next = { ...c, ...patch };
      if (next.status === 'Completed' || next.status === 'Verified') next.completedAt = next.completedAt || iso(new Date());
      return next;
    }),
  })),

  addToolboxTalk: (t) => set((s) => ({
    toolboxTalks: [{
      ...t,
      id: uid('tbt'),
      reference: `TBT-${11400 + s.toolboxTalks.length + 1}`,
    }, ...s.toolboxTalks],
  })),

  addPpeItem: (p) => set((s) => ({
    ppe: [{ ...p, id: uid('ppe'), replacementHistory: [] }, ...s.ppe],
  })),
  updatePpeItem: (id, patch) => set((s) => ({
    ppe: s.ppe.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  })),
}));