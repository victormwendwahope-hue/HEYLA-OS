import {
  Company, Contact, Lead, Opportunity, Quotation, QuotationLine, Communication,
  Ticket, Contract, ContractItem, ServiceLevelMetric, SalesRep, AutomationRule,
  Activity, LeadScoreParts, PipelineStage, CompanyStatus,
} from '@/modules/crm/types';
import { seeded, iso, addMonths, addDays, monthKey } from '@/modules/crm/utils/format';
import { leadScoreOf, healthOf, emptyLeadParts } from '@/modules/crm/utils/scoring';

const NOW = new Date('2026-03-20');

const NAMES = [
  'Safaricom', 'KCB Group', 'Equity Bank', 'M-KOPA Solar', 'Twiga Foods', 'Kenya Airways',
  'Bamburi Cement', 'East African Breweries', 'Jumia Kenya', 'KenGen', 'NCBA Bank',
  'iHub Nairobi', 'Sendy Logistics', 'Kobo360', 'SunCulture', 'Koko Networks',
  'Rentco Electric', 'BasiGo', 'Waya Energy', 'Coca-Cola Beverages Africa', 'Brookside Dairy',
  'Athi River Mining', 'Kenya Power', 'Airtel Kenya', 'Telkom Kenya', 'Zuku Ltd',
  'Liquid Telecom', 'Hass Petroleum', 'Tatu City', 'Konza Technopolis', 'Umeme Ltd',
  'Vivo Energy', 'Total Kenya', 'DHL Kenya', 'Portside Terminal', 'Nairobi Cargo Hub',
  'Lake Basin Logistics', 'Unga Mills', 'Deco Chemical', 'Saidia Healthcare', 'Aga Khan Hospital',
  'PharmaPoint', 'Karen Hospital', 'Sidian Bank', 'Paramount Bank', 'Family Bank', 'Co-op Bank',
  'Standard Chartered KE', 'Absa Kenya', 'Samsung EA', 'Tinga Logistics', 'Metropol Corp',
  'Bolt Kenya', 'Uber Kenya', 'Little Cabs', 'Neo Travel', 'Zuri Hotel Group', 'Sarit Center',
  'Village Market', 'Two Rivers Mall', 'Naivas Supermarket', 'QuickMart', 'Carrefour KE',
];

const CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Nyeri', 'Naivasha', 'Garissa', 'Malindi', 'Kitale'];
const INDUSTRIES: Company['industry'][] = ['Retail', 'Telecom', 'Banking', 'Logistics', 'Agriculture', 'Manufacturing', 'Healthcare', 'Construction', 'Technology', 'Hospitality', 'Energy', 'Government'];
const SIZES: Company['size'][] = ['1-10', '11-50', '51-200', '201-500', '500+'];
const SOURCES: Lead['source'][] = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Partner', 'Inbound Email', 'Advertisement'];
const LEAD_STATUS: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Disqualified'];
const STAGES: PipelineStage[] = ['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding', 'Closed - Won', 'Closed - Lost'];
const QUOTE_STATUSES: Quotation['status'][] = ['Draft', 'Sent', 'Approved', 'Accepted', 'Rejected', 'Expired'];
const TICKET_STATUSES: Ticket['status'][] = ['Open', 'In Progress', 'On Hold', 'Escalated', 'Resolved', 'Closed'];
const TICKET_CATEGORIES: Ticket['category'][] = ['Billing', 'Technical', 'Complaint', 'Request', 'Feature', 'Support'];
const CONTRACT_KINDS: Contract['kind'][] = ['Service Level', 'Lease', 'Distribution', 'Maintenance', 'Subscription', 'Project'];
const ROLES: Contact['role'][] = ['Owner', 'Decision Maker', 'Accounts', 'Operations', 'HR', 'IT', 'Procurement'];
const FIRST = ['Purity', 'James', 'Grace', 'Mohamed', 'Wanjiru', 'Samuel', 'Faith', 'Mary', 'Joseph', 'Nancy', 'Mark', 'Lydia', 'Elias', 'Ruth', 'Hassan', 'Beatrice', 'Kevin', 'Zainab', 'Paul', 'Alice'];
const LAST = ['Kamau', 'Odhiambo', 'Mwangi', 'Wekesa', 'Chebet', 'Ali', 'Omondi', 'Gitau', 'Njeru', 'Barasa', 'Karimi', 'Said', 'Njenga', 'Wambui', 'Otieno', 'Kiprop'];

const pick = <T,>(arr: readonly T[], i: number): T => arr[Math.floor(seeded(i) * arr.length) % arr.length];
const ri = (i: number, min: number, max: number): number => Math.round(min + seeded(i) * (max - min));

const domainFor = (industry: string) => ({
  Telecom: 'co.ke', Banking: 'ke', Retail: 'co.ke', Logistics: 'co.ke', Agriculture: 'org',
  Manufacturing: 'com', Healthcare: 'org', Construction: 'co.ke', Technology: 'io',
  Hospitality: 'com', Energy: 'co.ke', Government: 'go.ke',
}[industry] || 'com');

function repPool(): SalesRep[] {
  const base: Omit<SalesRep, 'id' | 'name' | 'email' | 'avatarColor' | 'quota' | 'achieved' | 'revenue' | 'winRate'>[] = [
    { phone: '+254722110001', role: 'Account Executive', region: 'Nairobi', managerId: 'rep-m', target: 2500000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Enterprise', 'FinTech'] },
    { phone: '+254722110002', role: 'SDR', region: 'Coast', managerId: 'rep-m', target: 1200000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Outbound', 'Discovery'] },
    { phone: '+254722110003', role: 'Account Executive', region: 'Rift Valley', managerId: 'rep-m', target: 1800000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Logistics', 'SaaS'] },
    { phone: '+254722110004', role: 'Sales Manager', region: 'Kenya', managerId: '', target: 5000000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Leadership', 'Strategy'] },
    { phone: '+254722110005', role: 'Customer Success', region: 'Nairobi', managerId: 'rep-m', target: 800000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Onboarding', 'Retention'] },
    { phone: '+254722110006', role: 'Account Executive', region: 'Central', managerId: 'rep-m', target: 2100000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'Active', skills: ['Agriculture', 'Government'] },
    { phone: '+254722110007', role: 'SDR', region: 'Western', managerId: 'rep-m', target: 1000000, tickets: 0, dealsWon: 0, pipelineValue: 0, lastSaleAt: '', status: 'On Leave', skills: ['Qualification'] },
  ];
  return base.map((b, i) => {
    const name = ['Amina Wanjiru', 'Brian Otieno', 'Cynthia Moraa', 'Daniel Mwangi', 'Esther Achieng', 'Frank Kamau', 'Grace Nduta'][i];
    return {
      ...b,
      id: `rep-${i + 1}`,
      name,
      email: name.toLowerCase().replace(/\s/g, '.') + '@heylaos.co.ke',
      avatarColor: ['#0A66FF', '#7C3AED', '#DB2777', '#16A34A', '#EA580C', '#0891B2', '#DC2626'][i],
      quota: b.target,
      achieved: Math.round(b.target * (0.72 + seeded(i + 9) * 0.5)),
      revenue: Math.round(b.target * (0.7 + seeded(i + 4) * 0.6)),
      winRate: Math.round(18 + seeded(i + 7) * 45),
      dealsWon: ri(i, 4, 30),
      tickets: ri(i, 5, 40),
      pipelineValue: ri(i, 800000, 9000000),
      lastSaleAt: iso(addDays(NOW, -ri(i, 0, 60))),
    };
  });
}

const REP_POOL: SalesRep[] = repPool();

export function generateMockData() {
  const companies: Company[] = [];
  const contacts: Contact[] = [];
  const leads: Lead[] = [];
  const opps: Opportunity[] = [];
  const quotations: Quotation[] = [];
  const communications: Communication[] = [];
  const tickets: Ticket[] = [];
  const contracts: Contract[] = [];
  const activities: Activity[] = [];
  const revenue: RevenueRecord[] = [];

  const ownerFor = (i: number) => REP_POOL[i % REP_POOL.length].id;

  const makeCompany = (i: number): Company => {
    const industry = pick(INDUSTRIES, i + 5);
    const size = pick(SIZES, i + 1);
    const statusR = seeded(i * 1.7);
    const status: CompanyStatus = statusR < 0.34 ? 'Active' : statusR < 0.6 ? 'VIP' : statusR < 0.78 ? 'Prospect' : statusR < 0.9 ? 'Lead' : 'Dormant';
    const founded = 1965 + ri(i, 0, 55);
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${CITIES[i % CITIES.length]}` : '');
    const health = healthOf({ revenue: ri(i, 30, 98), payment: ri(i, 40, 100), support: ri(i, 35, 100), engagement: ri(i, 25, 100), contract: ri(i, 45, 100) });
    return {
      id: `cmp-${i}`,
      name,
      shortName: name.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase(),
      industry,
      size,
      status,
      email: `info@${name.toLowerCase().replace(/[^a-z]/g, '')}.${domainFor(industry)}`,
      phone: `+254 7${(i % 9) + 1}${String(10000000 + i * 7919).slice(0, 7)}`,
      website: `https://${name.toLowerCase().replace(/[^a-z]/g, '')}.${domainFor(industry)}`,
      address: `${100 + i} Moi Avenue`,
      city: pick(CITIES, i),
      country: 'Kenya',
      linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/[^a-z]/g, '')}`,
      foundedYear: founded,
      notes: 'Managed under HEYLAOS enterprise platform.',
      ownerId: ownerFor(i),
      createdAt: iso(addMonths(NOW, -ri(i, 1, 48))),
      annualRevenue: ri(i, 500000, 50000000),
      employees: ri(i, 8, 800),
      healthScore: health.total,
      healthBand: health.band,
      linkedVehicleIds: [`veh-${(i % 20) + 1}`, `veh-${(i % 20) + 2}`],
      linkedProjectIds: [`prj-${(i % 14) + 1}`],
    };
  };

  // 500 companies (mix of real EA names + generated).
  for (let i = 0; i < 500; i++) companies.push(makeCompany(i));

  // Contacts: 1-3 per company for a subset.
  for (let i = 0; i < 700; i++) {
    const cmp = companies[i % companies.length];
    const name = `${pick(FIRST, i + 3)} ${pick(LAST, i + 1)}`;
    const role = pick(ROLES, i);
    contacts.push({
      id: `con-${i}`,
      companyId: cmp.id,
      name,
      title: role === 'Owner' ? 'Founder & CEO' : role === 'Accounts' ? 'Finance Director' : role === 'IT' ? 'Head of IT' : 'Operations Lead',
      role,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@${cmp.name.toLowerCase().replace(/[^a-z]/g, '')}.${domainFor(cmp.industry)}`,
      phone: `+254 7${(i % 9) + 1}${String(5000000 + i * 613).slice(0, 7)}`,
      isPrimary: i % 3 === 0,
      notes: '',
      lastContact: iso(addDays(NOW, -ri(i, 0, 90))),
      linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s/g, '-')}`,
      avatar: '',
    });
  }

  // Leads: 220.
  for (let i = 0; i < 220; i++) {
    const industry = pick(INDUSTRIES, i + 7);
    const size = pick(SIZES, i + 2);
    const parts: LeadScoreParts = {
      industryFit: ri(i, 40, 100),
      budget: ri(i, 45, 100),
      engagement: ri(i, 20, 100),
      response: ri(i, 30, 100),
      companySize: ri(i, 35, 100),
      history: ri(i, 20, 100),
    };
    const { score, color } = leadScoreOf(parts);
    const statusR = seeded(i * 3.1);
    const status: Lead['status'] = statusR < 0.3 ? 'New' : statusR < 0.6 ? 'Contacted' : statusR < 0.85 ? 'Qualified' : 'Disqualified';
    const created = addDays(NOW, -ri(i, 0, 90));
    const person = `${pick(FIRST, i + 8)} ${pick(LAST, i + 4)}`;
    const companyName = NAMES[(i * 3 + 2) % NAMES.length] + ' ' + (i % 4 === 0 ? 'Holding' : '');
    leads.push({
      id: `lead-${i}`,
      ref: `LD-${String(1000 + i)}`,
      name: person,
      email: `${person.toLowerCase().replace(/\s/g, '.')}@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+254 7${(i % 9) + 1}${String(8000000 + i * 977).slice(0, 7)}`,
      companyName,
      industry,
      companySize: size,
      source: pick(SOURCES, i),
      status,
      rating: score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold',
      value: ri(i, 50000, 8000000),
      budgetRange: ri(i, 5, 80) > 40 ? '250K-1M' : '50K-250K',
      decisionRole: pick(['Owner', 'CFO', 'Procurement', 'COO', 'CTO'], i),
      needs: pick(['Fleet telematics', 'CRM automation', 'Route optimization', 'Fuel management', 'Driver safety', 'Compliance reporting'], i),
      urgency: ri(i, 2, 10),
      engagement: parts.engagement,
      score,
      scoreParts: parts,
      scoreColor: color,
      assignedTo: ownerFor(i),
      convertedToCustomerId: status === 'Qualified' && seeded(i) > 0.7 ? `cmp-${i % 500}` : undefined,
      createdAt: iso(created),
      lastContact: iso(addDays(created, ri(i, 0, 30))),
      notes: '',
    });
  }

  // Opportunities: 160.
  let oppIdx = 0;
  for (let i = 0; i < 160; i++) {
    const cmp = companies[i % companies.length];
    const stageR = seeded(i * 5.5);
    const isWon = stageR > 0.86;
    const isLost = stageR > 0.72 && stageR <= 0.86;
    const stage: PipelineStage = isWon ? 'Closed - Won' : isLost ? 'Closed - Lost' : STAGES[Math.floor(stageR * 9) % 9];
    const value = ri(i, 200000, 12000000);
    const created = addDays(NOW, -ri(i, 10, 300));
    const expectedClose = addDays(created, ri(i, 15, 120));
    const prob = { 'New Lead': 10, 'Qualified': 20, 'Meeting': 30, 'Proposal': 45, 'Negotiation': 60, 'Review': 70, 'Contract Sent': 80, 'Contracted': 85, 'Onboarding': 90, 'Closed - Won': 100, 'Closed - Lost': 0 }[stage];
    opps.push({
      id: `opp-${oppIdx++}`,
      companyId: cmp.id,
      leadId: `lead-${i % 220}`,
      title: `${cmp.shortName} — ${pick(['Fleet Renewal', 'CRM Rollout', 'Telematics Upgrade', 'Fuel Analytics', 'Driver Program', 'Compliance Suite'], i)}`,
      stage,
      status: isWon ? 'Won' : isLost ? 'Lost' : 'Open',
      value,
      currency: 'KES',
      probability: prob,
      ownerId: ownerFor(i),
      expectedCloseDate: iso(expectedClose),
      createdAt: iso(created),
      lastActivity: iso(addDays(created, ri(i, 1, 20))),
      forecastable: !isWon && !isLost,
      amountTotal: isWon ? value : 0,
      isClosedWon: isWon,
      forecastMonth: monthKey(expectedClose),
      priority: value > 5000000 ? 'High' : value > 2000000 ? 'Medium' : 'Low',
      reason: isLost ? pick(['Budget', 'Competitor', 'Timeline', 'No decision'], i) : '',
      activities: ['Discovery call', 'Demo'],
      comments: '',
    });
  }

  // Quotations: 90.
  for (let i = 0; i < 90; i++) {
    const cmp = companies[i % companies.length];
    const opp = opps[i % opps.length];
    const lines: QuotationLine[] = [
      {
        id: `qtl-${i}-1`,
        description: 'Fleet telematics subscription (12 months)',
        quantity: ri(i, 5, 40),
        unitPrice: ri(i, 4000, 18000),
        discountPct: i % 4 === 0 ? 10 : 0,
        taxPct: 16,
        productId: 'prod-telematics',
        productName: 'HEYLAOS Telematics',
        category: 'Subscription',
        lineTotal: 0,
      },
      {
        id: `qtl-${i}-2`,
        description: 'Fuel management module',
        quantity: 1,
        unitPrice: ri(i, 120000, 900000),
        discountPct: 0,
        taxPct: 16,
        productId: 'prod-fuel',
        productName: 'HEYLAOS Fuel Analytics',
        category: 'One-time',
        lineTotal: 0,
      },
    ];
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discountPct / 100), 0);
    const taxTotal = subtotal * 0.16;
    const discountTotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.discountPct / 100), 0);
    const total = subtotal + taxTotal;
    quotations.push({
      id: `quo-${i}`,
      number: `QT-${String(202600 + i)}`,
      companyId: cmp.id,
      opportunityId: opp.id,
      title: `${cmp.shortName} Quotation`,
      status: pick(QUOTE_STATUSES, i),
      issueDate: iso(addDays(NOW, -ri(i, 0, 60))),
      validUntil: iso(addDays(NOW, 30 - (i % 60))),
      currency: 'KES',
      exchangeRate: 1,
      subtotal,
      taxTotal,
      discountTotal,
      total,
      totalCurrency: total,
      lines,
      version: 1,
      revisionId: '',
      createdBy: ownerFor(i),
      approvedBy: i % 3 === 0 ? ownerFor(i) : '',
      approvalState: i % 5 === 0 ? 'Pending' : 'None',
      signerName: '',
      signerEmail: '',
      signedAt: '',
      notes: '',
      terms: 'Payment due within 30 days. Prices in KES.',
      createdAt: iso(addDays(NOW, -ri(i, 1, 60))),
    });
  }

  // Tickets: 70.
  for (let i = 0; i < 70; i++) {
    const cmp = companies[i % companies.length];
    const contact = contacts.find((c) => c.companyId === cmp.id);
    const status = pick(TICKET_STATUSES, i);
    const priority: Ticket['priority'] = i % 7 === 0 ? 'Critical' : i % 5 === 0 ? 'High' : i % 3 === 0 ? 'Medium' : 'Low';
    const created = addDays(NOW, -ri(i, 0, 45));
    tickets.push({
      id: `tic-${i}`,
      number: `TK-${String(7000 + i)}`,
      companyId: cmp.id,
      contactId: contact?.id || '',
      subject: pick(['API rate limits', 'Billing dispute', 'Onboarding support', 'Feature request: exports', 'Route data not syncing', 'Password reset', 'SLA breach question', 'New integration request'], i),
      description: 'Customer reported issue via portal.',
      status,
      priority,
      category: pick(TICKET_CATEGORIES, i),
      assignedTo: ownerFor(i),
      tags: ['crm', pick(['urgent', 'billing', 'tech'], i)],
      createdAt: iso(created),
      updatedAt: iso(addDays(created, ri(i, 0, 10))),
      resolvedAt: status === 'Resolved' || status === 'Closed' ? iso(addDays(created, ri(i, 1, 8))) : '',
      slaDue: iso(addDays(created, priority === 'Critical' ? 1 : priority === 'High' ? 2 : 5)),
      slaBreached: seeded(i) > 0.85,
      satisfaction: status === 'Resolved' || status === 'Closed' ? ri(i, 1, 5) : 0,
      channel: 'email',
      escalationLevel: priority === 'Critical' ? 2 : priority === 'High' ? 1 : 0,
      linkedOrderId: `quo-${i % 90}`,
      internalNotes: '',
    });
  }

  // Contracts: 45.
  for (let i = 0; i < 45; i++) {
    const cmp = companies[i % companies.length];
    const opp = opps[i % opps.length];
    const start = addMonths(NOW, -ri(i, 1, 20));
    const end = addMonths(start, ri(i, 6, 36));
    const value = ri(i, 1000000, 20000000);
    const items: ContractItem[] = [
      { id: `cti-${i}-1`, contractId: `ctr-${i}`, description: 'Fleet management services', quantity: ri(i, 5, 40), rate: ri(i, 5000, 30000), total: 0, deliveryWeek: 1, assetRef: `veh-${(i % 20) + 1}` },
      { id: `cti-${i}-2`, contractId: `ctr-${i}`, description: 'Telematics hardware + install', quantity: 1, rate: ri(i, 150000, 2500000), total: 0, deliveryWeek: 2, assetRef: '' },
    ];
    items.forEach((it) => { it.total = it.quantity * it.rate; });
    const sls: ServiceLevelMetric[] = [
      { id: `sla-${i}-1`, contractId: `ctr-${i}`, metric: 'Uptime', target: 99.5, actual: 99.2 + seeded(i) * 0.6, unit: '%', achieved: true },
      { id: `sla-${i}-2`, contractId: `ctr-${i}`, metric: 'Response time', target: 2, actual: 1 + seeded(i) * 2, unit: 'h', achieved: seeded(i) > 0.2 },
      { id: `sla-${i}-3`, contractId: `ctr-${i}`, metric: 'Resolution', target: 24, actual: 12 + seeded(i) * 24, unit: 'h', achieved: seeded(i) > 0.3 },
    ];
    const status: Contract['status'] = new Date(end) < NOW ? 'Expired' : new Date(end).getTime() - NOW.getTime() < 90 * 86400000 ? 'Expiring' : 'Active';
    contracts.push({
      id: `ctr-${i}`,
      reference: `CTR-${String(4100 + i)}`,
      companyId: cmp.id,
      opportunityId: opp.id,
      title: `${cmp.shortName} Service Contract`,
      kind: pick(CONTRACT_KINDS, i),
      status,
      startDate: iso(start),
      endDate: iso(end),
      autoRenew: i % 3 !== 0,
      value,
      currency: 'KES',
      ownerId: ownerFor(i),
      items,
      serviceLevels: sls,
      createdAt: iso(addMonths(start, -1)),
      signedAt: iso(addDays(start, 5)),
      dueForRenewal: iso(end),
    });
  }

  // Communications + activities.
  for (let i = 0; i < 90; i++) {
    const cmp = companies[i % companies.length];
    const dir = seeded(i) > 0.5 ? 'outbound' : 'inbound';
    communications.push({
      id: `com-${i}`,
      companyId: cmp.id,
      channel: pick(['email', 'phone', 'whatsapp', 'meeting', 'sms'], i),
      direction: dir,
      status: pick(['Sent', 'Delivered', 'Read', 'Scheduled'], i),
      type: 'email',
      subject: pick(['Quarterly review', 'Proposal follow-up', 'Welcome to HEYLAOS', 'Renewal reminder', 'Meeting notes'], i),
      body: 'Automated communication entry.',
      fromName: dir === 'outbound' ? 'HEYLAOS Sales' : cmp.shortName,
      toName: dir === 'outbound' ? cmp.shortName : 'HEYLAOS Sales',
      sentAt: iso(addDays(NOW, -ri(i, 0, 60))),
      ownerId: ownerFor(i),
      attachments: seeded(i) > 0.8 ? ['invoice.pdf'] : [],
      hashtags: ['#crm', '#heylaos'],
      threadId: `thr-${i % 30}`,
      isScheduled: false,
    });
    activities.push({
      id: `act-${i}`,
      companyId: cmp.id,
      type: pick(['Call', 'Email', 'Meeting', 'Note', 'Task', 'Message'], i),
      subject: pick(['Discovery call', 'Send proposal', 'Book demo', 'Follow up', 'Site visit'], i),
      description: '',
      ownerId: ownerFor(i),
      createdAt: iso(addDays(NOW, -ri(i, 0, 40))),
      scheduledAt: iso(addDays(NOW, -ri(i, -10, 20))),
      done: seeded(i) > 0.4,
      related: `opp-${i % 160}`,
    });
  }

  // Revenue records: 12 months x ~20 companies.
  for (let m = 0; m < 12; m++) {
    const monthDate = addMonths(new Date(NOW.getFullYear(), 3, 1), m - 11);
    const key = monthKey(monthDate);
    for (let c = 0; c < 20; c++) {
      const cmp = companies[(c * 7 + m) % companies.length];
      const amount = ri(c + m, 150000, 2500000) * (0.9 + seeded(m + c) * 0.3);
      revenue.push({
        id: `rev-${m}-${c}`,
        companyId: cmp.id,
        source: 'Subscription',
        month: key,
        year: monthDate.getFullYear(),
        amount,
        weeks: String(4),
        currency: 'KES',
        dealType: 'recurring',
      });
    }
  }

  return {
    companies, contacts, leads, opportunities: opps, quotations, communications, tickets,
    contracts, activities, revenue, reps: REP_POOL,
  };
}

export const mockData = generateMockData();

export const AUTOMATION_RULES: AutomationRule[] = [
  { id: 'ar-1', name: 'Hot lead notify', description: 'When lead score > 80, notify team in #leads', trigger: 'lead.score', triggerField: 'score', triggerCondition: '>', triggerValue: '80', actionType: 'Notify Team', actionPayload: '#leads', enabled: true, runCount: 148, runsToday: 3, lastRunAt: iso(NOW), createdAt: iso(addMonths(NOW, -6)), ownerId: 'rep-4' },
  { id: 'ar-2', name: 'Auto-assign new lead', description: 'Round-robin assign fresh leads to SDRs', trigger: 'lead.status', triggerField: 'status', triggerCondition: '=', triggerValue: 'New', actionType: 'Assign', actionPayload: 'rep-2', enabled: true, runCount: 412, runsToday: 9, lastRunAt: iso(NOW), createdAt: iso(addMonths(NOW, -8)), ownerId: 'rep-4' },
  { id: 'ar-3', name: 'Follow-up reminder', description: 'Send follow-up email 3 days after last activity', trigger: 'opp.lastActivity', triggerField: 'lastActivity', triggerCondition: 'older_than', triggerValue: '3d', actionType: 'Send Email', actionPayload: 'templates/followup', enabled: true, runCount: 87, runsToday: 2, lastRunAt: iso(addDays(NOW, -1)), createdAt: iso(addMonths(NOW, -4)), ownerId: 'rep-1' },
  { id: 'ar-4', name: 'Quote expiry chase', description: 'Remind owner when accepted quote nears expiry', trigger: 'quote.validUntil', triggerField: 'validUntil', triggerCondition: 'soon', triggerValue: '5d', actionType: 'Create Task', actionPayload: 'Chase quote', enabled: false, runCount: 34, runsToday: 0, lastRunAt: iso(addDays(NOW, -9)), createdAt: iso(addMonths(NOW, -3)), ownerId: 'rep-3' },
  { id: 'ar-5', name: 'SLA breach alert', description: 'Escalate tickets breaching SLA to manager', trigger: 'ticket.slaBreached', triggerField: 'slaBreached', triggerCondition: '=', triggerValue: 'true', actionType: 'Notify Team', actionPayload: 'rep-4', enabled: true, runCount: 22, runsToday: 1, lastRunAt: iso(NOW), createdAt: iso(addMonths(NOW, -5)), ownerId: 'rep-4' },
  { id: 'ar-6', name: 'Renewal pipeline', description: 'Create opportunity 60 days before contract end', trigger: 'contract.endDate', triggerField: 'endDate', triggerCondition: 'soon', triggerValue: '60d', actionType: 'Change Stage', actionPayload: 'Contract Sent', enabled: true, runCount: 51, runsToday: 0, lastRunAt: iso(addDays(NOW, -2)), createdAt: iso(addMonths(NOW, -7)), ownerId: 'rep-5' },
];