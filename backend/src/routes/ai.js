import { Router } from 'express';
import { requireAuth } from '../auth.js';
import OpenAI from 'openai';

const router = Router();
router.use(requireAuth);

const SYSTEM_PROMPT = `You are HEYLA-OS CHAT ASSISTANT, the official AI assistant for HEYLA OS — a comprehensive business management platform.

## HEYLA OS FEATURES

### HR Module
- Employee Directory: view all employees, search, filter by department
- Add Employee: register with Kenyan compliance (KRA PIN, NSSF, NHIF)
- Payroll Setup: salary structures, hourly rates, allowances, contract terms (paid leave days, unpaid absent days, sick leave days)
- Publish payroll to Accounting for payment processing and payslip generation
- Leave Management: request and approve leave
- Attendance: track daily attendance linked to payroll (active days prorate pay)
- Performance: reviews and goal tracking
- WIBA Benefits: work injury benefits claims
- Blacklist: track restricted individuals
- Documents: store contracts, certificates, policies

### Accounting Module
- Dashboard: revenue vs expenses charts, cash flow analysis
- Invoices: create, send, track invoices
- Expenses: log and approve business expenses
- Payments: record incoming payments
- Payroll: view processed payroll records, mark as paid, generate payslips
- Reports: P&L, Balance Sheet, Cash Flow, Tax reports
- Full-detail payroll CSV export

### Inventory Module
- Products: add and manage product catalog
- Track stock levels with low stock alerts
- Minimum stock thresholds with automatic status updates

### Transport Module
- Fleet: manage vehicles, track mileage and service history
- Drivers: driver profiles with ratings and trip history
- Shipments: track deliveries from pickup to delivery
- Fuel Tracking: log fuel consumption, analyze efficiency
- Cost analytics and trip statistics

### CRM Module
- Sales Portal: Kanban and table views of sales pipeline
- Service Portal: support ticket management
- Pipeline Analytics: track deals by stage and source
- Lead tracking: New → Contacted → Qualified → Proposal → Won/Lost

### Jobs & Recruitment
- Job Listings: post and manage open positions
- Applicants: track candidates through screening → interview → offer → hired
- Interview Management: schedule and track interviews
- Careers Portal: public job board

### Engineering Module
- Projects: track with budgets and progress
- Contracts: FIDIC contract management (Red, Yellow, Silver, Gold Books)
- Claims: time and payment claims with notice tracking
- Variations: change order management
- Payment Certificates: milestone payments
- Disputes: Notice of Dispute and DAB referral management
- Early Warnings: risk identification and mitigation

### EHS Module
- Incidents: report and investigate workplace incidents
- Inspections: schedule and conduct safety inspections
- Compliance: track DOSH and WIBA compliance items
- Safety Alerts: automated alerts for expiring certifications

### Settings
- Profile: update personal information
- Company: company details and tax information
- Notifications: email, push, SMS alerts
- Security: change password
- Appearance: light/dark theme toggle
- Admin panel: manage users, roles, reset passwords

## Rules
1. ONLY answer questions about HEYLA OS features and functionality.
2. Be helpful, concise, and use markdown formatting when appropriate.
3. If asked about something outside HEYLA OS (sports, weather, politics, etc.), politely redirect: "I'm designed to help with HEYLA OS features only. Let me know if you need assistance with HR, Accounting, Transport, or any other module!"
4. Do not mention that you're an AI or that you use GPT unless asked directly.
5. For payroll calculations, mention Kenyan tax: PAYE (30% above 24,000), NSSF (6% up to 2,160), NHIF (1,700 standard).
6. Keep responses under 300 words unless the user asks for detailed information.
7. Use emojis sparingly and professionally.`;

const localResponses = {
  'hello': "Hello! 👋 Welcome to **HEYLA-OS CHAT ASSISTANT**. I'm here to help you with all HEYLA OS features. How can I assist you today?",
  'hi': "Hi there! 👋 Welcome to HEYLA OS. I can help you with HR, Accounting, Transport, Inventory, CRM, Jobs, Engineering, EHS, and more. What would you like to know about?",
  'help': "I can help you with all HEYLA OS features! Try asking about HR, Accounting, Transport, Inventory, CRM, Jobs, Marketplace, Engineering, EHS, or Settings.",
};

function getLocalReply(input) {
  const lower = input.toLowerCase().trim();
  if (lower === 'hello' || lower === 'hey' || lower === 'hey there') return localResponses.hello;
  if (lower === 'hi' || lower === 'hi there' || lower === 'hello there') return localResponses.hi;
  if (lower === 'help' || lower === 'what can you do') return localResponses.help;
  return null;
}

async function getGptReply(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error('OpenAI API error:', e.message);
    return null;
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmed = message.trim();

    // Try local fast reply first (for simple greetings)
    const local = getLocalReply(trimmed);
    if (local) {
      return res.json({ reply: local, source: 'local' });
    }

    // Try GPT
    const gptReply = await getGptReply(trimmed);
    if (gptReply) {
      return res.json({ reply: gptReply, source: 'gpt' });
    }

    // Fallback keyword matching
    const fallback = "I'm here to help with **HEYLA OS** features only. 😊\n\nI can assist you with:\n• 👥 **HR** — Employees, payroll, leave, attendance\n• 💰 **Accounting** — Invoices, expenses, reports\n• 🚛 **Transport** — Fleet, drivers, shipments, fuel\n• 📦 **Inventory** — Products, stock management\n• 📈 **CRM** — Leads, pipeline, support tickets\n• 💼 **Jobs** — Postings, applicants, interviews\n• 🏗️ **Engineering** — Projects, contracts, claims\n• ⚠️ **EHS** — Safety, compliance, inspections\n\nPlease ask me about any of these HEYLA OS features!";

    const keywords = ['hr', 'payroll', 'accounting', 'inventory', 'transport', 'crm', 'job', 'marketplace', 'engineering', 'ehs', 'fuel', 'leave', 'salary', 'settings', 'help'];
    const lower = trimmed.toLowerCase();
    for (const key of keywords) {
      if (lower.includes(key)) {
        const keyResponses = {
          'hr': "**HR Module** — Manage your workforce:\n• **Employee Directory** — View all employees, search, filter by department\n• **Payroll Setup** — Salary structures, hourly rates, allowances, contract terms\n• **Leave Management** — Request and approve leave\n• **Attendance** — Track daily attendance linked to payroll\n• **Performance** — Reviews and goal tracking\n• **WIBA Benefits** — Work injury benefits claims\n• **Documents** — Store contracts, certificates, and policies",
          'payroll': "**Payroll Module** — Process employee salaries:\n• HR configures rates → publishes → Accounting pays → generates payslips\n• Pay prorated by active days from attendance\n• Kenyan deductions: PAYE (30% above 24,000), NSSF (6% up to 2,160), NHIF (1,700)\n• View payslips in HR → Payslips tab, print individually or all",
          'salary': "**Salary & Payroll**:\n• **Hourly Rate** — For part-time/contract workers by the hour with overtime\n• **Basic/Salary** — Fixed monthly salary with allowances\n• Contract terms: paid leave, unpaid absent, sick leave days per employee\n• Pay prorated by active attendance days",
          'leave': "**Leave Management** — Employee leave tracking:\n• Each employee has contract terms: paid leave days, unpaid absent days, sick leave days\n• Submit, approve, or reject leave requests\n• Track balances and history per employee",
          'accounting': "**Accounting Module** — Financial management:\n• **Dashboard** — Revenue vs expenses charts\n• **Invoices** — Create, send, track\n• **Expenses** — Log and approve\n• **Payroll** — Process published payroll, pay, generate payslips\n• **Reports** — P&L, Balance Sheet, Cash Flow, Tax",
          'inventory': "**Inventory Module** — Stock management:\n• Products catalog with stock levels\n• Low stock alerts with minimum thresholds\n• Automatic status updates (In Stock / Low Stock / Out of Stock)",
          'transport': "**Transport Module** — Fleet and logistics:\n• Fleet management with mileage and service history\n• Driver profiles with ratings and trip history\n• Shipment tracking from pickup to delivery\n• Fuel consumption tracking and efficiency analysis",
          'crm': "**CRM Module** — Customer relationships:\n• Sales Pipeline (Kanban + Table view)\n• Service Portal for support tickets\n• Lead tracking: New → Contacted → Qualified → Proposal → Won/Lost\n• Pipeline analytics by stage and source",
          'job': "**Jobs & Recruitment** — Hiring:\n• Job listings, applicant tracking\n• Pipeline: screening → interview → offer → hired\n• Interview scheduling\n• Public careers portal for candidates",
          'engineering': "**Engineering Module** — Project management:\n• Projects with budgets and progress tracking\n• FIDIC contracts (Red, Yellow, Silver, Gold Books)\n• Claims, variations, payment certificates\n• Dispute resolution and early warning system",
          'ehs': "**EHS Module** — Environment, Health & Safety:\n• Incident reporting and investigation\n• Safety inspections scheduling\n• DOSH/WIBA compliance tracking\n• Automated safety alerts for expiring certifications",
          'fuel': "**Fuel Tracking** — Vehicle fuel management:\n• Log fuel purchases by vehicle\n• Track loaded vs unloaded fuel efficiency\n• Cost per kilometer analysis\n• Compare fuel types and vehicle models",
          'settings': "**Settings** — Account configuration:\n• Profile: name, email, avatar\n• Company: details and tax info\n• Notifications: email, push, SMS\n• Security: change password\n• Appearance: light/dark theme",
        };
        return res.json({ reply: keyResponses[key] || fallback, source: 'fallback' });
      }
    }

    res.json({ reply: fallback, source: 'fallback' });
  } catch (e) {
    console.error('AI chat error:', e);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;