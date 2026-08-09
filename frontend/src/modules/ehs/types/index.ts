// HEYLAOS EHS — domain types.

export type EmployeeModel = { id: string; name: string };

export type IncidentType =
  | 'Fatality' | 'Lost Time Injury' | 'Medical Treatment Injury' | 'First Aid Case'
  | 'Near Miss' | 'Unsafe Condition' | 'Unsafe Act' | 'Property Damage'
  | 'Vehicle Accident' | 'Environmental Spill' | 'Fire Incident' | 'Security Incident'
  | 'Occupational Illness';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Reported' | 'Investigating' | 'Resolved' | 'Closed';

export interface Incident {
  id: string;
  number: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  site: string;
  location: string;
  gps: string;
  reportedBy: string;
  involved: string[];
  witnesses: string[];
  bodyPart: string;
  description: string;
  immediateActions: string;
  environmentalImpact: string;
  costImpact: number;
  wibaApplicable: boolean;
  doshNotificationRequired: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

export type HazardCategory =
  | 'Physical' | 'Chemical' | 'Biological' | 'Ergonomic' | 'Electrical' | 'Mechanical'
  | 'Fire & Explosion' | 'Environmental' | 'Psychosocial' | 'Traffic & Transport'
  | 'Working at Height' | 'Confined Space' | 'Excavation' | 'Lifting Operations';

export type Likelihood = 1 | 2 | 3 | 4 | 5;
export type Severity = 1 | 2 | 3 | 4 | 5;

export interface Hazard {
  id: string;
  reference: string;
  title: string;
  category: HazardCategory;
  location: string;
  source: string;
  likelyHarm: string;
  controls: string;
  likelihood: Likelihood;
  severity: Severity;
  score: number;
  band: RiskBand;
  status: 'Open' | 'Mitigating' | 'Closed';
  ownerId: string;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  reference: string;
  activity: string;
  site: string;
  assessor: string;
  date: string;
  hazards: Hazard[];
  overallScore: number;
  band: RiskBand;
  status: 'Draft' | 'Approved' | 'Review';
  reviewer: string;
  reviewedAt: string;
}

export interface Investigation {
  id: string;
  incidentId: string;
  incidentNumber: string;
  method: '5 Whys' | 'Fishbone' | 'Root Cause Analysis' | 'TapRooT';
  immediateCause: string;
  rootCause: string;
  contributingFactors: string[];
  whys: string[];
  status: 'Open' | 'In Progress' | 'Verified' | 'Closed';
  investigateBy: string;
  startedAt: string;
  dueAt: string;
}

export interface CorrectiveAction {
  id: string;
  reference: string;
  title: string;
  description: string;
  source: 'Investigation' | 'Inspection' | 'Audit' | 'Hazard' | 'Incident';
  sourceRef: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Overdue' | 'Completed' | 'Verified';
  assignedTo: string;
  dueDate: string;
  completedAt: string;
  verification: string;
  createdById: string;
}

export interface PpeItem {
  id: string;
  employeeId: string;
  type: string;
  size: string;
  issueDate: string;
  expiryDate: string;
  inspectionStatus: 'Good' | 'Needs Replacement' | 'Expired';
  replacementHistory: string[];
  compliance: 'Compliant' | 'Action Required';
  stockAvailable: number;
  issuedBy: string;
}

export type InspectionType =
  | 'Daily Site' | 'Vehicle' | 'Workshop' | 'Warehouse' | 'Office' | 'Environmental'
  | 'Fire Safety' | 'Electrical' | 'Lifting Equipment' | 'Contractor'
  | 'ISO 45001 Audit' | 'DOSH Compliance';

export interface ChecklistAnswer { item: string; result: 'Pass' | 'Fail' | 'N/A'; comment: string }
export interface Inspection {
  id: string;
  reference: string;
  type: InspectionType;
  site: string;
  inspector: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  result: 'Pass' | 'Fail' | 'Conditional';
  score: number;
  checklist: ChecklistAnswer[];
  signature: string;
  createdAt: string;
}

export type PermitStatus = 'Requested' | 'Risk Review' | 'Approved' | 'Active' | 'Suspended' | 'Closed';
export type PermitType =
  | 'Hot Work' | 'Confined Space' | 'Working at Height' | 'Excavation'
  | 'Electrical Isolation' | 'Lifting' | 'Radiation Work' | 'Chemical Handling' | 'Environmental Discharge';

export interface PermitToWork {
  id: string;
  reference: string;
  type: PermitType;
  site: string;
  task: string;
  requester: string;
  holder: string;
  approver: string;
  status: PermitStatus;
  startAt: string;
  endAt: string;
  controls: string[];
  signature: string;
  createdById: string;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  course: string;
  provider: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  refresherDue: string;
  competence: 'Trainee' | 'Competent' | 'Expert';
  status: 'Valid' | 'Expiring' | 'Expired';
  department: string;
  site: string;
}

export interface EnvironmentalRecord {
  id: string;
  reference: string;
  category: 'Waste' | 'Hazardous Waste' | 'Fuel Spill' | 'Oil Leak' | 'Water'
    | 'Energy' | 'Emissions' | 'Dust' | 'Noise' | 'Wastewater' | 'Recycling' | 'Permit';
  site: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'Compliant' | 'At Limit' | 'Exceeded';
  recordedAt: string;
  ownerId: string;
}

export interface VehicleSafety {
  id: string;
  vehicleId: string;
  plate: string;
  inspectionDate: string;
  inspectionStatus: 'Pass' | 'Fail';
  driverFatigue: number;
  speedViolations: number;
  harshBraking: number;
  seatbeltCompliance: number;
  extinguisherOk: boolean;
  speedGovernor: boolean;
  defensiveTraining: boolean;
  score: number;
  band: RiskBand;
  accidentCount: number;
}

export interface OccupationalHealthRecord {
  id: string;
  employeeId: string;
  exam: 'Pre-Employment' | 'Periodic' | 'Hearing' | 'Vision' | 'Lung Function' | 'Vaccination' | 'Fitness for Work';
  date: string;
  result: 'Fit' | 'Fit with Restrictions' | 'Unfit';
  notes: string;
  confidential: boolean;
  provider: string;
}

export interface DoshiItem {
  id: string;
  reference: string;
  title: string;
  category: 'DOSH' | 'WIBA';
  frequency: string;
  dueDate: string;
  status: 'Compliant' | 'Warning' | 'Overdue';
  ownerId: string;
}

export interface WibaClaim {
  id: string;
  reference: string;
  employeeId: string;
  injury: string;
  claimDate: string;
  policyNumber: string;
  medicalCost: number;
  compensation: number;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Settled' | 'Rejected';
  supportingDocs: string[];
  incidentNumber: string;
}

export interface ToolboxTalk {
  id: string;
  reference: string;
  topic: string;
  site: string;
  leader: string;
  date: string;
  attendees: number;
  topics: string[];
  durationMins: number;
}

export interface ContractorScore {
  id: string;
  name: string;
  score: number;
  band: RiskBand;
  incidents: number;
  trainingCompliance: number;
  permits: number;
  lastAudit: string;
}

export type EhsRole = 'Safety Officer' | 'Supervisor' | 'Manager' | 'Auditor' | 'Contractor' | 'Admin';