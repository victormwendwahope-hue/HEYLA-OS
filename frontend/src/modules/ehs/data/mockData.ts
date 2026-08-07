import {
  Incident, Hazard, Investigation, CorrectiveAction, PpeItem, Inspection, PermitToWork,
  TrainingRecord, EnvironmentalRecord, VehicleSafety, OccupationalHealthRecord, WibaClaim,
  ToolboxTalk, ContractorScore, IncidentType, Likelihood, Severity,
} from '@/modules/ehs/types';
import { iso, addDays, seeded, riskScore, riskBandOf } from '@/modules/ehs/utils/format';

const NOW = new Date();

const FIRST = ['Grace', 'James', 'Mercy', 'David', 'Amina', 'Samuel', 'Wanjiru', 'Peter', 'Faith', 'Kevin', 'Rose', 'Brian', 'Linet', 'Tom', 'Esther', 'Joshua', 'Naomi', 'Isaac', 'Cynthia', 'Vincent'];
const LAST = ['Kariuki', 'Otieno', 'Mwangi', 'Njuguna', 'Achieng', 'Chepkemoi', 'Wanjala', 'Omondi', 'Ndungu', 'Kiprotich', 'Ali', 'Mutua', 'Wairimu', 'Odhiambo', 'Barasa', 'Langat', 'Kosgey', 'Njeri', 'Muchiri', 'Sawe'];

export const NAMES = Array.from({ length: 60 }, (_, i) => `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`);
export const EMPLOYEES = NAMES.map((name, i) => ({ id: `emp-${i + 1}`, name }));
export const SITES = ['Nairobi HQ', 'Mombasa Depot', 'Kisumu Site', 'Nakuru Yard', 'Thika Warehouse', 'Eldoret Workshop'];
export const VEHICLE_PLATES = ['KCA 123A', 'KDA 456B', 'KCB 789C', 'KDD 321D', 'KCA 654E', 'KCB 987F', 'KDC 246G', 'KDA 135H'];
export const PPE_TYPES = ['Hard Hat', 'Safety Boots', 'Reflective Vest', 'Gloves', 'Goggles', 'Face Shield', 'Respirator', 'Ear Protection', 'Harness', 'FR Clothing', 'Chemical Suit'];
export const COURSES = ['Site Induction', 'First Aid', 'Fire Fighting', 'Working at Height', 'Confined Space Entry', 'Defensive Driving', 'HazMat Handling', 'Forklift Operation', 'Crane Operation', 'Environmental Awareness', 'ISO 45001 Awareness', 'DOSH Compliance'];

const ri = (i: number, min: number, max: number) => min + Math.floor(seeded(i * 3 + 7) * (max - min + 1));
const pick = <T,>(arr: readonly T[], i: number): T => arr[i % arr.length];
const ago = (i: number, days: number) => iso(addDays(NOW, -ri(i, 0, Math.max(days, 0))));

const INCIDENT_TYPES: IncidentType[] = [
  'Fatality', 'Lost Time Injury', 'Medical Treatment Injury', 'First Aid Case', 'Near Miss', 'Unsafe Condition',
  'Unsafe Act', 'Property Damage', 'Vehicle Accident', 'Environmental Spill', 'Fire Incident', 'Security Incident', 'Occupational Illness',
];
const HAZARD_CATS: Hazard['category'][] = ['Physical', 'Chemical', 'Biological', 'Ergonomic', 'Electrical', 'Mechanical', 'Fire & Explosion', 'Environmental', 'Psychosocial', 'Traffic & Transport', 'Working at Height', 'Confined Space', 'Excavation', 'Lifting Operations'];
const INSPECTION_TYPES: Inspection['type'][] = ['Daily Site', 'Vehicle', 'Workshop', 'Warehouse', 'Office', 'Environmental', 'Fire Safety', 'Electrical', 'Lifting Equipment', 'Contractor', 'ISO 45001 Audit', 'DOSH Compliance'];
const PTW_TYPES: PermitToWork['type'][] = ['Hot Work', 'Confined Space', 'Working at Height', 'Excavation', 'Electrical Isolation', 'Lifting', 'Radiation Work', 'Chemical Handling', 'Environmental Discharge'];
const ENV_CATS: EnvironmentalRecord['category'][] = ['Waste', 'Hazardous Waste', 'Fuel Spill', 'Oil Leak', 'Water', 'Energy', 'Emissions', 'Dust', 'Noise', 'Wastewater', 'Recycling', 'Permit'];
const EXAM_TYPES: OccupationalHealthRecord['exam'][] = ['Pre-Employment', 'Periodic', 'Hearing', 'Vision', 'Lung Function', 'Vaccination', 'Fitness for Work'];
const INSP_CHECKS = ['PPE worn correctly', 'Housekeeping clear', 'Fire extinguisher charged', 'Emergency exit accessible', 'Guarding in place', 'Electrical cables safe', 'Permit valid', 'Spill kit available'];
const CONTRACTOR_NAMES = ['Kevis Builders', 'Kengen Utilities', 'Summit Construct', 'Adonai Projects', 'Uplift Civil', 'Meridian Scaffold'];

// ---- Incidents ----
const incidents: Incident[] = [];
for (let i = 0; i < 25; i++) {
  const type = pick(INCIDENT_TYPES, i);
  const recallable = type === 'Lost Time Injury' || type === 'Medical Treatment Injury' || type === 'Occupational Illness';
  incidents.push({
    id: `inc-${i}`,
    number: `EHS-${4100 + i}`,
    type,
    severity: pick(['Low', 'Medium', 'High', 'Critical'] as const, i),
    status: pick(['Reported', 'Investigating', 'Resolved', 'Closed'] as const, i),
    site: pick(SITES, i),
    location: pick(['Sector A', 'Loading Bay', 'Workshop', 'Store Yard', 'Site Office', 'Rooftop Works'], i),
    gps: `-1.2${ri(i, 0, 9)}, 36.8${ri(i, 0, 9)}`,
    reportedBy: pick(NAMES, i),
    involved: [pick(NAMES, i + 2), pick(NAMES, i + 5)],
    witnesses: [pick(NAMES, i + 8)],
    bodyPart: pick(['Head', 'Hand', 'Leg', 'Back', 'Eye', 'Foot', 'None'], i),
    description: `${type} at ${pick(SITES, i)} during ${pick(['excavation', 'lifting', 'welding', 'vehicle movement', 'stacking'], i)}. Relayed to shift supervisor.`,
    immediateActions: 'Section secured, first aid administered, escalated to supervisor.',
    environmentalImpact: type === 'Environmental Spill' ? 'Minor contained spill, cleaned up.' : 'None',
    costImpact: ri(i, 0, 1500000),
    wibaApplicable: recallable || type === 'Fatality',
    doshNotificationRequired: recallable || type === 'Fatality',
    createdAt: ago(i, 200),
    updatedAt: ago(i, 5),
    ownerId: pick(NAMES, i + 4),
  });
}

// ---- hazards ----
const hazards: Hazard[] = [];
for (let i = 0; i < 50; i++) {
  const lh = ri(i, 1, 5) as Likelihood;
  const sv = ri(i, 1, 5) as Severity;
  hazards.push({
    id: `haz-${i}`,
    reference: `HZ-${3300 + i}`,
    title: pick(['Unguarded machine', 'Poor housekeeping', 'Live exposed wires', 'Slippery walkway', 'Confined space entry', 'Chemical store access', 'Heavy load movement'], i),
    category: pick(HAZARD_CATS, i),
    location: pick(SITES, i),
    source: pick(['Construction', 'Operations', 'Maintenance', 'Logistics'], i),
    likelyHarm: pick(['Fracture', 'Burn', 'Electric shock', 'Respiratory irritation', 'Crush injury'], i),
    controls: pick(['Guard fitted', 'Permit required', 'PPE mandatory', 'Isolation procedure', 'Barrier in place'], i),
    likelihood: lh,
    severity: sv,
    score: riskScore(lh, sv),
    band: riskBandOf(riskScore(lh, sv)),
    status: pick(['Open', 'Mitigating', 'Closed'] as const, i),
    ownerId: `emp-${(i % 60) + 1}`,
    createdAt: ago(i, 120),
  });
}

// ---- inspections ----
const inspections: Inspection[] = [];
for (let i = 0; i < 120; i++) {
  const checklist = INSP_CHECKS.map((item, idx) => {
    const r: 'Pass' | 'Fail' | 'N/A' = seeded(i * 10 + idx) > 0.82 ? 'Fail' : seeded(i * 10 + idx) > 0.5 ? 'N/A' : 'Pass';
    return { item, result: r, comment: r === 'Fail' ? 'Corrective created.' : '' };
  });
  const passed = checklist.filter((c) => c.result === 'Pass').length;
  const fails = checklist.filter((c) => c.result === 'Fail').length;
  inspections.push({
    id: `ins-${i}`,
    reference: `INS-${5200 + i}`,
    type: pick(INSPECTION_TYPES, i),
    site: pick(SITES, i),
    inspector: pick(NAMES, i + 2),
    date: ago(i, 90),
    status: pick(['Completed', 'In Progress', 'Scheduled'] as const, i),
    result: fails === 0 ? 'Pass' : fails <= 1 ? 'Conditional' : 'Fail',
    score: Math.max(20, Math.round((passed / checklist.length) * 100)),
    checklist,
    signature: seeded(i) > 0.25 ? 'Signed' : '',
    createdAt: ago(i, 90),
  });
}

// ---- permits ----
const permits: PermitToWork[] = [];
for (let i = 0; i < 40; i++) {
  const start = addDays(NOW, ri(i, -15, 15));
  permits.push({
    id: `ptw-${i}`,
    reference: `PTW-${6100 + i}`,
    type: pick(PTW_TYPES, i),
    site: pick(SITES, i),
    task: pick(['Routine maintenance', 'Welding on frame', 'Vessel entry', 'Cable pull', 'Overhead hoist work'], i),
    requester: pick(NAMES, i),
    holder: pick(NAMES, i + 1),
    approver: pick(NAMES, i + 5),
    status: pick(['Requested', 'Risk Review', 'Approved', 'Active', 'Suspended', 'Closed'], i),
    startAt: iso(start),
    endAt: iso(addDays(start, ri(i, 1, 3))),
    controls: ['Isolate energy', 'Gas test', 'Standby person', 'Full PPE'],
    signature: seeded(i) > 0.2 ? 'Signed' : '',
    createdById: `emp-${(i % 60) + 1}`,
  });
}

// ---- training ----
const training: TrainingRecord[] = [];
for (let i = 0; i < 75; i++) {
  const expiry = new Date(addDays(NOW, ri(i, -30, 365)));
  const expired = expiry.getTime() < NOW.getTime();
  training.push({
    id: `trn-${i}`,
    employeeId: `emp-${(i % 60) + 1}`,
    course: pick(COURSES, i),
    provider: pick(['HEYLA Academy', 'NITA', 'Safety First', 'EHS Training'], i),
    certNumber: `CERT-${7300 + i}`,
    issueDate: ago(i, 700),
    expiryDate: iso(expiry),
    refresherDue: iso(expiry),
    competence: pick(['Trainee', 'Competent', 'Expert'] as const, i),
    status: expired ? 'Expired' : seeded(i) > 0.85 ? 'Expiring' : 'Valid',
    department: pick(['Construction', 'Ops', 'Maintenance', 'Logistics', 'Admin'], i),
    site: pick(SITES, i),
  });
}

// ---- PPE ----
const ppe: PpeItem[] = [];
for (let i = 0; i < 200; i++) {
  const exp = addDays(NOW, ri(i, -10, 300));
  const expired = new Date(exp).getTime() < NOW.getTime();
  ppe.push({
    id: `ppe-${i}`,
    employeeId: `emp-${(i % 60) + 1}`,
    type: pick(PPE_TYPES, i),
    size: pick(['S', 'M', 'L', 'XL'], i),
    issueDate: ago(i, 700),
    expiryDate: iso(exp),
    inspectionStatus: expired ? 'Expired' : seeded(i) > 0.85 ? 'Needs Replacement' : 'Good',
    replacementHistory: ['None'],
    compliance: expired ? 'Action Required' : 'Compliant',
    stockAvailable: ri(i, 1, 40),
    issuedBy: pick(NAMES, i + 6),
  });
}

// ---- corrective actions ----
const correctiveActions: CorrectiveAction[] = [];
for (let i = 0; i < 30; i++) {
  const status = pick(['Open', 'In Progress', 'Completed', 'Verified'] as const, i);
  correctiveActions.push({
    id: `ca-${i}`,
    reference: `CA-${8400 + i}`,
    title: pick(['Install machine guard', 'Train crew on rescue', 'Replace defective sling', 'Update work procedure', 'Deep clean work area'], i),
    description: 'Action raised from a finding during the most recent assessment.',
    source: pick(['Inspection', 'Investigation', 'Hazard', 'Audit', 'Incident'], i),
    sourceRef: `${'Closed'}`,
    priority: pick(['Low', 'Medium', 'High', 'Critical'] as const, i),
    status,
    assignedTo: pick(NAMES, i + 1),
    dueDate: ago(-i, 2),
    completedAt: status === 'Completed' || status === 'Verified' ? ago(i, 4) : '',
    verification: status === 'Verified' ? 'Effectiveness confirmed at site re-check.' : '',
    createdById: `emp-${(i % 60) + 1}`,
  });
}

// ---- investigations ----
const investigations: Investigation[] = [];
for (let i = 0; i < 8; i++) {
  investigations.push({
    id: `inv-${i}`,
    incidentId: `inc-${i}`,
    incidentNumber: `EHS-${4100 + i}`,
    method: pick(['5 Whys', 'Fishbone', 'Root Cause Analysis', '5 Whys'] as const, i),
    immediateCause: 'Unguarded moving part caught the operative.',
    rootCause: pick(['Lack of training', 'Inadequate guarding', 'Weak permit control', 'Design fault'], i),
    contributingFactors: [pick(['Fatigue', 'Schedule pressure', 'Poor supervision'], i)],
    whys: ['Why did the guard fail?', 'Why was guarding not inspected?', 'Why was the permit waived?', 'Root: no guarding standard in place.'],
    status: pick(['Open', 'In Progress', 'Verified', 'Closed'] as const, i),
    investigateBy: pick(NAMES, i),
    startedAt: ago(i, 30),
    dueAt: ago(-i, 3),
  });
}

// ---- environmental ----
const environmental: EnvironmentalRecord[] = [];
for (let i = 0; i < 15; i++) {
  const value = ri(i, 30, 110);
  environmental.push({
    id: `env-${i}`,
    reference: `ENV-${9500 + i}`,
    category: pick(ENV_CATS, i),
    site: pick(SITES, i),
    value,
    unit: pick(['kg', 'm³', 'kWh', 'dB', 'l'], i),
    threshold: 85,
    status: value >= 100 ? 'Exceeded' : value >= 85 ? 'At Limit' : 'Compliant',
    recordedAt: ago(i, 60),
    ownerId: `emp-${(i % 60) + 1}`,
  });
}

// ---- vehicle safety ----
const vehicleSafety: VehicleSafety[] = [];
for (let i = 0; i < VEHICLE_PLATES.length; i++) {
  const score = ri(i, 60, 98);
  vehicleSafety.push({
    id: `vs-${i}`,
    vehicleId: `veh-${i}`,
    plate: VEHICLE_PLATES[i],
    inspectionDate: ago(i, 30),
    inspectionStatus: seeded(i) > 0.88 ? 'Fail' : 'Pass',
    driverFatigue: ri(i, 5, 85),
    speedViolations: ri(i, 0, 12),
    harshBraking: ri(i, 0, 14),
    seatbeltCompliance: ri(i, 70, 100),
    extinguisherOk: seeded(i) > 0.08,
    speedGovernor: seeded(i) > 0.12,
    defensiveTraining: seeded(i) > 0.2,
    score,
    band: riskBandOf(score),
    accidentCount: ri(i, 0, 5),
  });
}

// ---- occupational health ----
const occupationalHealth: OccupationalHealthRecord[] = [];
for (let i = 0; i < 30; i++) {
  occupationalHealth.push({
    id: `oh-${i}`,
    employeeId: `emp-${(i % 60) + 1}`,
    exam: pick(EXAM_TYPES, i),
    date: ago(i, 200),
    result: pick(['Fit', 'Fit', 'Fit', 'Fit'] as const, i),
    notes: 'On-track programme completion pending follow-up.',
    confidential: true,
    provider: pick(['Avenue Medical', 'Nairobi Clinic', 'Corporate Health'], i),
  });
}

// ---- contractors ----
const contractors: ContractorScore[] = [];
for (let i = 0; i < CONTRACTOR_NAMES.length; i++) {
  const score = ri(i, 58, 96);
  contractors.push({
    id: `c-${i}`,
    name: CONTRACTOR_NAMES[i],
    score,
    band: riskBandOf(score),
    incidents: ri(i, 0, 9),
    trainingCompliance: ri(i, 65, 100),
    permits: ri(i, 2, 12),
    lastAudit: pick(['Compliant', 'Conditional', 'Compliant'], i),
  });
}

// ---- WIBA claims ----
const wibaClaims: WibaClaim[] = [];
for (let i = 0; i < 6; i++) {
  wibaClaims.push({
    id: `wba-${i}`,
    reference: `WIB-${10300 + i}`,
    employeeId: `emp-${(i % 60) + 1}`,
    injury: pick(['Fracture', 'Burn', 'Laceration', 'Occupational illness'], i),
    claimDate: ago(i, 90),
    policyNumber: `VIBA-POL-${4100 + i}`,
    medicalCost: ri(i, 18000, 600000),
    compensation: ri(i, 200000, 1500000),
    status: pick(['Submitted', 'Under Review', 'Approved', 'Settled'] as const, i),
    supportingDocs: ['MedicalReport', 'PoliceStatement'],
    incidentNumber: `EHS-${4100 + i}`,
  });
}

// ---- toolbox talks ----
const toolboxTalks: ToolboxTalk[] = [];
for (let i = 0; i < 12; i++) {
  const topic = pick(['Lifting safety', 'Confined space', 'Fire evacuation', 'Hand safety', 'PPE', 'Vehicle movement', 'Working at height'], i);
  toolboxTalks.push({
    id: `tbt-${i}`,
    reference: `TBT-${11400 + i}`,
    topic,
    site: pick(SITES, i),
    leader: pick(NAMES, i + 2),
    date: ago(i, 25),
    attendees: ri(i, 8, 45),
    topics: [topic, 'Points of hazard registration'],
    durationMins: ri(i, 10, 30),
  });
}

export const mockData = {
  incidents,
  hazards,
  inspections,
  permits,
  training,
  ppe,
  correctiveActions,
  investigations,
  environmental,
  vehicleSafety,
  occupationalHealth,
  contractors,
  wibaClaims,
  toolboxTalks,
  employees: EMPLOYEES,
  hoursWorked: 920000,
};