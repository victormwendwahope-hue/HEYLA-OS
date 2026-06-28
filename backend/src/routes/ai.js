import { Router } from 'express';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const responses = {
  'hello': "Hello! 👋 Welcome to **HEYLA-OS CHAT ASSISTANT**. I'm here to help you with all HEYLA OS features including HR, Accounting, Transport, Inventory, CRM, Jobs, and more. How can I assist you today?",
  'hi': "Hi there! 👋 Welcome to HEYLA OS. I can help you with:\n• 👥 HR & Employee Management\n• 💰 Accounting & Payroll\n• 🚛 Transport & Fleet\n• 📦 Inventory Management\n• 📈 CRM & Sales\n• 💼 Jobs & Recruitment\n• 🏗️ Engineering Projects\n• ⚠️ EHS Compliance\n\nWhat would you like to know about?",
  'hr': "**HR Module** — Manage your workforce:\n• **Employee Directory** — View all employees, search, filter by department\n• **Add Employee** — Register new employees with full Kenyan compliance (KRA PIN, NSSF, NHIF)\n• **Payroll Setup** — Set salary structures, hourly rates, allowances\n• **Leave Management** — Request and approve leave\n• **Attendance** — Track daily attendance\n• **Performance** — Reviews and goal tracking\n• **WIBA Benefits** — Work injury benefits claims\n• **Blacklist** — Track restricted individuals\n• **Documents** — Store contracts, certificates, and policies",
  'payroll': "**Payroll Module** — Process employee salaries:\n• Go to HR → Payroll Setup to configure salaries and allowances\n• Contract terms: paid leave days, unpaid absent days, sick leave days\n• Push processed payroll to Accounting for final computation\n• Kenyan tax deductions: PAYE (30% above 24,000), NSSF (6% up to 2,160), NHIF (1,700 standard)\n• Export payslips as CSV from the Accounting Payroll page\n• View payroll history by period",
  'salary': "**Salary & Payroll** — Salary structures:\n• **Hourly Rate** — For part-time/contract workers paid by the hour with overtime tracking\n• **Basic/Salary** — Fixed monthly salary with allowances (housing, transport, medical, other)\n• **Contract Terms** — Per-employee: paid leave days, unpaid absent days, sick leave days\n• Push to Accounting for PAYE/NSSF/NHIF deductions and payslip generation",
  'accounting': "**Accounting Module** — Financial management:\n• **Dashboard** — Revenue vs expenses charts, cash flow analysis\n• **Invoices** — Create, send, and track invoices\n• **Expenses** — Log and approve business expenses\n• **Payments** — Record incoming payments\n• **Payroll** — View processed payroll records\n• **Reports** — Generate P&L, Balance Sheet, Cash Flow, and Tax reports",
  'inventory': "**Inventory Module** — Stock management:\n• **Products** — Add and manage product catalog\n• Track stock levels with low stock alerts\n• Minimum stock thresholds with automatic status updates\n• View inventory value and stock statistics",
  'transport': "**Transport Module** — Fleet and logistics:\n• **Fleet** — Manage vehicles, track mileage and service history\n• **Drivers** — Driver profiles with ratings and trip history\n• **Shipments** — Track deliveries from pickup to delivery\n• **Fuel Tracking** — Log fuel consumption, analyze efficiency\n• View cost analytics and trip statistics",
  'crm': "**CRM Module** — Customer relationships:\n• **Sales Portal** — Kanban and table views of your sales pipeline\n• **Service Portal** — Support ticket management\n• **Pipeline Analytics** — Track deals by stage and source\n• Lead tracking from New → Contacted → Qualified → Proposal → Won/Lost",
  'job': "**Jobs & Recruitment** — Manage hiring:\n• **Job Listings** — Post and manage open positions\n• **Applicants** — Track candidates through screening → interview → offer → hired\n• **Interview Management** — Schedule and track interviews\n• **Careers Portal** — Public job board for candidates\n• Match candidates to jobs based on skills",
  'marketplace': "**Marketplace** — Talent marketplace:\n• Browse job listings from various companies\n• Freelancer profiles with ratings and skills\n• Track applicants and manage hiring pipeline\n• Connect job seekers with employers",
  'engineering': "**Engineering Module** — Project management:\n• **Projects** — Track engineering projects with budgets and progress\n• **Contracts** — FIDIC contract management (Red, Yellow, Silver, Gold Books)\n• **Claims** — Time and payment claims with notice tracking\n• **Variations** — Change order management\n• **Payment Certificates** — Track milestone payments\n• **Disputes** — Notice of Dispute and DAB referral management\n• **Early Warnings** — Risk identification and mitigation",
  'ehs': "**EHS Module** — Environment, Health & Safety:\n• **Incidents** — Report and investigate workplace incidents\n• **Inspections** — Schedule and conduct safety inspections\n• **Compliance** — Track DOSH and WIBA compliance items\n• **Safety Alerts** — Automated alerts for expiring certifications and high-risk items",
  'fuel': "**Fuel Tracking** — Vehicle fuel management:\n• Log fuel purchases by vehicle\n• Track loaded vs unloaded fuel efficiency\n• Analyze cost per kilometer\n• Compare fuel types (Diesel/Petrol) and vehicle models",
  'leave': "**Leave Management** — Employee leave tracking:\n• Request annual leave, sick leave, or other time off\n• Each employee has contract terms: paid leave days, unpaid absent days, sick leave days\n• Approve or reject leave requests from HR\n• Track leave balances and history per employee",
  'settings': "**Settings** — Account configuration:\n• **Profile** — Update your personal information\n• **Company** — Company details and tax information\n• **Notifications** — Configure email, push, and SMS alerts\n• **Security** — Change password\n• **Appearance** — Toggle between Light and Dark theme",
  'help': "I can help you with all HEYLA OS features! Try asking about:\n• 👥 **HR** — Employees, payroll, leave, attendance\n• 💰 **Accounting** — Invoices, expenses, reports\n• 🚛 **Transport** — Fleet, drivers, shipments, fuel\n• 📦 **Inventory** — Products, stock management\n• 📈 **CRM** — Leads, pipeline, support tickets\n• 💼 **Jobs** — Postings, applicants, interviews\n• 🏗️ **Engineering** — Projects, contracts, claims\n• ⚠️ **EHS** — Safety, compliance, inspections\n• ⚙️ **Settings** — Profile, security, appearance\n\nWhat would you like to explore?",
};

const keywords = Object.keys(responses);

function getReply(input) {
  const lower = input.toLowerCase();
  for (const key of keywords) {
    if (lower.includes(key)) return responses[key];
  }
  return "I'm here to help with **HEYLA OS** features only. 😊\n\nI can assist you with:\n• 👥 **HR** — Employees, payroll, leave, attendance\n• 💰 **Accounting** — Invoices, expenses, reports\n• 🚛 **Transport** — Fleet, drivers, shipments, fuel\n• 📦 **Inventory** — Products, stock management\n• 📈 **CRM** — Leads, pipeline, support tickets\n• 💼 **Jobs** — Postings, applicants, interviews\n• 🏗️ **Engineering** — Projects, contracts, claims\n• ⚠️ **EHS** — Safety, compliance, inspections\n\nPlease ask me about any of these HEYLA OS features!";
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    res.json({ reply: getReply(message.trim()) });
  } catch (e) {
    console.error('AI chat error:', e);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;