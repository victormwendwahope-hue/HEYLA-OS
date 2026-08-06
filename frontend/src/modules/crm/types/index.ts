// HEYLAOS CRM — domain types.

export type CompanyStatus = 'Lead' | 'Prospect' | 'Active' | 'VIP' | 'Dormant' | 'Blacklisted';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type Industry =
  | 'Retail' | 'Telecom' | 'Banking' | 'Logistics' | 'Agriculture' | 'Manufacturing'
  | 'Healthcare' | 'Construction' | 'Technology' | 'Hospitality' | 'Energy' | 'Government';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  industry: Industry;
  size: CompanySize;
  status: CompanyStatus;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  linkedin: string;
  foundedYear: number;
  notes: string;
  ownerId: string;
  createdAt: string;
  annualRevenue: number;
  employees: number;
  healthScore: number;
  healthBand: HealthBand;
  linkedVehicleIds: string[];
  linkedProjectIds: string[];
}

export type ContactRole = 'Owner' | 'Decision Maker' | 'Accounts' | 'Operations' | 'HR' | 'IT' | 'Procurement' | 'Other';

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  role: ContactRole;
  email: string;
  phone: string;
  avatar?: string;
  isPrimary: boolean;
  notes: string;
  lastContact: string;
  linkedin: string;
}

export type LeadSource =
  | 'Website' | 'Referral' | 'Cold Call' | 'Trade Show' | 'Social Media'
  | 'Partner' | 'Inbound Email' | 'Advertisement' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
export type LeadRating = 'Cold' | 'Warm' | 'Hot';

export interface LeadScoreParts {
  industryFit: number; // 20
  budget: number;      // 25
  engagement: number;  // 20
  response: number;    // 10
  companySize: number; // 15
  history: number;     // 10
}

export interface Lead {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  industry: Industry;
  companySize: CompanySize;
  source: LeadSource;
  status: LeadStatus;
  rating: LeadRating;
  value: number;
  budgetRange: string;
  decisionRole: string;
  needs: string;
  urgency: number;      // 0-10
  engagement: number;   // 0-100
  score: number;        // 0-100
  scoreParts: LeadScoreParts;
  scoreColor: 'green' | 'yellow' | 'orange' | 'red';
  assignedTo: string;
  convertedToCustomerId?: string;
  createdAt: string;
  lastContact: string;
  notes: string;
}

export type PipelineStage =
  | 'New Lead' | 'Qualified' | 'Meeting' | 'Proposal' | 'Negotiation' | 'Review'
  | 'Contract Sent' | 'Contracted' | 'Onboarding' | 'Closed - Won' | 'Closed - Lost';
export type OpportunityStatus = 'Open' | 'Won' | 'Lost';

export interface Opportunity {
  id: string;
  companyId: string;
  leadId: string;
  title: string;
  stage: PipelineStage;
  status: OpportunityStatus;
  value: number;
  currency: string;
  probability: number;
  ownerId: string;
  expectedCloseDate: string;
  createdAt: string;
  lastActivity: string;
  forecastable: boolean;
  amountTotal: number;
  isClosedWon: boolean;
  forecastMonth: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  activities: string[];
  comments: string;
}

export interface OpportunityLine {
  id: string;
  opportunityId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  total: number;
}

export type PipelineStageDef = { id: PipelineStage; probability: number; label: string };

export const PIPELINE_STAGES: PipelineStageDef[] = [
  { id: 'New Lead', probability: 10, label: 'New Lead' },
  { id: 'Qualified', probability: 20, label: 'Qualified' },
  { id: 'Meeting', probability: 30, label: 'Meeting' },
  { id: 'Proposal', probability: 45, label: 'Proposal' },
  { id: 'Negotiation', probability: 60, label: 'Negotiation' },
  { id: 'Review', probability: 70, label: 'Review' },
  { id: 'Contract Sent', probability: 80, label: 'Contract Sent' },
  { id: 'Contracted', probability: 85, label: 'Contracted' },
  { id: 'Onboarding', probability: 90, label: 'Onboarding' },
  { id: 'Closed - Won', probability: 100, label: 'Closed - Won' },
  { id: 'Closed - Lost', probability: 0, label: 'Closed - Lost' },
];

export type QuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired' | 'Accepted' | 'Revoked';
export type QuoteApprovalState = 'None' | 'Pending' | 'Approved' | 'Rejected';
export type QuoteApproval = QuoteApprovalState;

export interface QuotationLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxPct: number;
  lineTotal: number;
  productId: string;
  productName: string;
  category: string;
}

export interface Quotation {
  id: string;
  number: string;
  companyId: string;
  opportunityId: string;
  title: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  currency: string;
  exchangeRate: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  totalCurrency: number;
  lines: QuotationLine[];
  version: number;
  revisionId: string;
  createdBy: string;
  approvedBy: string;
  approvalState: QuoteApproval;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  notes: string;
  terms: string;
  createdAt: string;
}

export type CommChannel = 'email' | 'phone' | 'whatsapp' | 'meeting' | 'sms' | 'linkedin';
export type CommDirection = 'inbound' | 'outbound';
export type CommStatus = 'Draft' | 'Sent' | 'Delivered' | 'Read' | 'Scheduled' | 'Failed';
export type CommType = 'note' | 'email' | 'call' | 'meeting' | 'message' | 'task';

export interface Communication {
  id: string;
  companyId: string;
  channel: CommChannel;
  direction: CommDirection;
  status: CommStatus;
  type: CommType;
  subject: string;
  body: string;
  fromName: string;
  toName: string;
  sentAt: string;
  ownerId: string;
  attachments: string[];
  hashtags: string[];
  threadId: string;
  isScheduled: boolean;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  companyId: string;
  authorName: string;
  channel: CommChannel;
  direction: CommDirection;
  contentType: 'text' | 'html';
  content: string;
  createdAt: string;
  attachments: string[];
  mentions: string[];
}

export interface CommunicationThread {
  id: string;
  companyId: string;
  subject: string;
  participants: string[];
  channel: CommChannel;
  status: 'Open' | 'Archived';
  lastMessageAt: string;
  messageCount: number;
  unread: number;
  messages: ThreadMessage[];
}

export type TicketStatus = 'Open' | 'In Progress' | 'On Hold' | 'Escalated' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Billing' | 'Technical' | 'Complaint' | 'Request' | 'Feature' | 'Support' | 'Other';

export interface Ticket {
  id: string;
  number: string;
  companyId: string;
  contactId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
  slaDue: string;
  slaBreached: boolean;
  satisfaction: number; // 1-5, 0 unrated
  channel: CommChannel;
  escalationLevel: number;
  linkedOrderId: string;
  internalNotes: string;
}

export type ContractStatus = 'Draft' | 'Approved' | 'Signed' | 'Active' | 'Expiring' | 'Expired' | 'Terminated';
export type ContractKind = 'Service Level' | 'Lease' | 'Distribution' | 'Maintenance' | 'Subscription' | 'Project';

export interface RevenueRecord {
  id: string;
  companyId: string;
  source: string;
  month: string;
  year: number;
  amount: number;
  weeks: string;
  currency: string;
  dealType: string;
}

export interface ContractItem {
  id: string;
  contractId: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
  deliveryWeek: number;
  assetRef: string;
}

export interface ServiceLevelMetric {
  id: string;
  contractId: string;
  metric: string;
  target: number;
  actual: number;
  unit: string;
  achieved: boolean;
}

export interface Contract {
  id: string;
  reference: string;
  companyId: string;
  opportunityId: string;
  title: string;
  kind: ContractKind;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  value: number;
  currency: string;
  ownerId: string;
  items: ContractItem[];
  serviceLevels: ServiceLevelMetric[];
  createdAt: string;
  signedAt: string;
  dueForRenewal: string;
}

export type SalesRepRole = 'Account Executive' | 'Sales Manager' | 'SDR' | 'Customer Success';

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SalesRepRole;
  avatarColor: string;
  region: string;
  managerId: string;
  quota: number;
  target: number;
  achieved: number;
  tickets: number;
  dealsWon: number;
  pipelineValue: number;
  winRate: number;
  lastSaleAt: string;
  status: 'Active' | 'On Leave' | 'Backfill' | 'Not Available';
  skills: string[];
  revenue: number;
}

export interface SalesTarget {
  id: string;
  repId: string;
  period: string;
  forecastable: boolean;
  target: number;
  revenue: number;
  met: boolean;
  quarter: string;
}

export type HealthBand = 'excellent' | 'good' | 'attention' | 'risk';
export interface CustomerHealth {
  revenueScore: number;   // 25
  paymentScore: number;   // 20
  supportScore: number;   // 20
  engagementScore: number;// 15
  contractScore: number;  // 20
  total: number;
  band: HealthBand;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerField: string;
  triggerCondition: string;
  triggerValue: string;
  actionType: 'Send Email' | 'Assign' | 'Create Task' | 'Send SMS' | 'Notify Team' | 'Change Stage';
  actionPayload: string;
  enabled: boolean;
  runCount: number;
  runsToday: number;
  lastRunAt: string;
  createdAt: string;
  ownerId: string;
}

export interface Activity {
  id: string;
  companyId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task' | 'Message';
  subject: string;
  description: string;
  ownerId: string;
  createdAt: string;
  scheduledAt: string;
  done: boolean;
  related: string; // opportunity / quote / ticket ref
}

export interface SatisfactionSurvey {
  id: string;
  companyId: string;
  ticketId: string;
  score: number;
  comment: string;
  submittedAt: string;
  csatRange: number;
  npsRange: number;
  tags: string[];
}

export interface ForecastPeriod {
  month: string;
  forecast: number;
  originalForecast: number;
  committed: number;
  bestCase: number;
  worstCase: number;
  actual: number;
  gap: number;
  confidence: number;
  previousYear: number;
}

export interface ForecastSummary {
  periods: ForecastPeriod[];
  overall: ForecastPeriod;
}