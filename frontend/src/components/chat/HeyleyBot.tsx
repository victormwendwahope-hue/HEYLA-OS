import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { getToken, apiBaseUrl } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
}

const responses: Record<string, string> = {
  'hello': "Hello! 👋 Welcome to **HEYLA-OS CHAT ASSISTANT**. I'm here to help you with all HEYLA OS features including HR, Accounting, Transport, Inventory, CRM, Jobs, and more. How can I assist you today?",
  'hi': "Hi there! 👋 Welcome to HEYLA OS. I can help you with:\n• 👥 HR & Employee Management\n• 💰 Accounting & Payroll\n• 🚛 Transport & Fleet\n• 📦 Inventory Management\n• 📈 CRM & Sales\n• 💼 Jobs & Recruitment\n• 🏗️ Engineering Projects\n• ⚠️ EHS Compliance\n\nWhat would you like to know about?",
  'help': "I can help you with all HEYLA OS features! Try asking about:\n• 👥 **HR** — Employees, payroll, leave, attendance\n• 💰 **Accounting** — Invoices, expenses, reports\n• 🚛 **Transport** — Fleet, drivers, shipments, fuel\n• 📦 **Inventory** — Products, stock management\n• 📈 **CRM** — Leads, pipeline, support tickets\n• 💼 **Jobs** — Postings, applicants, interviews\n• 🏗️ **Engineering** — Projects, contracts, claims\n• ⚠️ **EHS** — Safety, compliance, inspections\n• ⚙️ **Settings** — Profile, security, appearance\n\nWhat would you like to explore?",
  'hr': "**HR Module** — Manage your workforce:\n• **Employee Directory** — View all employees, search, filter by department\n• **Add Employee** — Register new employees with full Kenyan compliance (KRA PIN, NSSF, NHIF)\n• **Payroll Setup** — Set salary structures, hourly rates, allowances\n• **Leave Management** — Request and approve leave\n• **Attendance** — Track daily attendance\n• **Performance** — Reviews and goal tracking\n• **WIBA Benefits** — Work injury benefits claims\n• **Blacklist** — Track restricted individuals\n• **Documents** — Store contracts, certificates, and policies",
  'payroll': "**Payroll Module** — Process employee salaries:\n• Go to HR → Payroll Setup to configure salaries and allowances\n• Push processed payroll to Accounting for final computation\n• Kenyan tax deductions calculated automatically: PAYE (30% above 24,000), NSSF (6% up to 2,160), NHIF (1,700 standard)\n• Export payslips as CSV from the Accounting Payroll page\n• View payroll history by period",
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
};

function getReply(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, reply] of Object.entries(responses)) {
    if (lower.includes(key)) return reply;
  }
  return "I'm here to help with **HEYLA OS** features only. 😊\n\nPlease ask me about HR, Accounting, Transport, Inventory, CRM, Jobs, Marketplace, Engineering, EHS, or Settings.";
}

function fireAndForget(msg: string) {
  const token = getToken();
  if (!token) return;
  fetch(`${apiBaseUrl()}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: msg }),
  }).catch(() => {});
}

export function HeyleyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', content: "👋 Hi! I'm **HEYLA-OS CHAT ASSISTANT**. I can help with HR, Accounting, Transport, Inventory, CRM, Jobs, Engineering, EHS, and more. How can I help you today?", time: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, time: now };
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: getReply(msg), time: now };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    fireAndForget(msg);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:opacity-90 transition-all hover:scale-105 animate-fade-in"
        title="Chat with HEYLA-OS CHAT ASSISTANT"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[360px] ${isMinimized ? 'h-14' : 'h-[500px]'} bg-card border border-border rounded-2xl shadow-elevated flex flex-col animate-fade-in overflow-hidden transition-all duration-300`}>
      <div className="flex items-center gap-3 px-4 py-3 gradient-primary text-primary-foreground rounded-t-2xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">HEYLA-OS CHAT ASSISTANT</p>
          <p className="text-xs opacity-80">Online • Instant</p>
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 rounded hover:bg-primary-foreground/20 transition-colors">
          <Minimize2 className="w-4 h-4" />
        </button>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-primary-foreground/20 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          <div className="border-t border-border p-3 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}