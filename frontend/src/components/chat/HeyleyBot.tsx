import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

const KEYWORDS: Record<string, string[]> = {
  hr: ['hr', 'human resource', 'employee', 'staff', 'hiring', 'onboard', 'people', 'personnel', 'worker', 'team'],
  payroll: ['payroll', 'salary', 'wage', 'pay', 'compensation', 'payslip', 'pay slip', 'remuneration', 'income', 'earnings', 'deduction'],
  attendance: ['attendance', 'check in', 'check out', 'clock', 'present', 'absent', 'time', 'timesheet'],
  leave: ['leave', 'vacation', 'holiday', 'time off', 'sick day', 'absence', 'annual leave', 'sick leave'],
  performance: ['performance', 'review', 'appraisal', 'evaluation', 'kpi', 'goal', 'rating', 'feedback'],
  crm: ['crm', 'lead', 'customer', 'client', 'sales', 'pipeline', 'deal', 'prospect', 'opportunity'],
  accounting: ['accounting', 'account', 'invoice', 'bill', 'payment', 'revenue', 'expense', 'tax', 'finance', 'financial', 'bookkeep'],
  inventory: ['inventory', 'stock', 'product', 'warehouse', 'supply', 'equipment', 'asset'],
  ehs: ['ehs', 'safety', 'incident', 'hazard', 'compliance', 'inspection', 'environment', 'health', 'alert', 'accident'],
  engineering: ['engineering', 'project', 'contract', 'fidic', 'construction', 'claim', 'variation', 'dispute'],
  transport: ['transport', 'vehicle', 'fleet', 'driver', 'shipment', 'logistics', 'delivery', 'fuel'],
  fuel: ['fuel', 'diesel', 'petrol', 'gas', 'refuel', 'consumption', 'mileage'],
  jobs: ['job', 'recruit', 'applicant', 'interview', 'hiring', 'career', 'position', 'vacancy'],
  networking: ['network', 'social', 'post', 'feed', 'connect', 'professional', 'marketplace'],
  admin: ['admin', 'setting', 'user', 'role', 'permission', 'account', 'profile', 'config'],
  general: ['feature', 'module', 'capability', 'overview', 'what can', 'help', 'guide', 'tutorial', 'how to', 'what is'],
};

const RESPONSES: Record<string, string> = {
  hr: "**HR & People Management** — Manage your workforce end-to-end:\n• Employee records & profiles\n• Onboarding & document management\n• Department & position tracking\n• Blacklist management\n• Injury & WIBA benefits tracking",
  payroll: "**Payroll Management** — Full payroll processing:\n• Salary & wage computation\n• Tax & statutory deductions (KRA, NSSF, NHIF)\n• Payslip generation\n• Payroll history & reports\n• Multi-currency support",
  attendance: "**Attendance Tracking** — Real-time attendance:\n• Check-in / Check-out\n• Daily attendance logs\n• Late & early-out tracking\n• Attendance reports & summaries\n• Integration with payroll",
  leave: "**Leave Management** — Streamlined leave requests:\n• Annual, sick, emergency leave types\n• Leave balance tracking\n• Manager approval workflow\n• Leave calendar\n• Carry-forward rules",
  performance: "**Performance Management** — Drive team excellence:\n• KPI & goal setting\n• Performance reviews & appraisals\n• 360-degree feedback\n• Rating & scoring\n• Improvement plans",
  crm: "**CRM & Sales** — Manage customer relationships:\n• Lead tracking & scoring\n• Pipeline management\n• Won/Proposal/Lost status\n• Source attribution\n• Sales analytics",
  accounting: "**Accounting & Finance** — Full financial control:\n• Invoicing & billing\n• Expense tracking\n• Tax computation\n• Financial reports\n• Multi-currency support",
  inventory: "**Inventory Management** — Track your stock:\n• Product catalog & SKU tracking\n• Stock levels & reorder alerts\n• Category management\n• Cost & price tracking\n• Low-stock notifications",
  ehs: "**EHS Management** — Environment, Health & Safety:\n• Incident reporting & investigation\n• Compliance checklists\n• Safety inspections\n• Hazard alerts & notifications\n• Severity tracking",
  engineering: "**Engineering Project Management** — FIDIC-based:\n• Project tracking & budgets\n• Contract management\n• Variation orders & claims\n• Payment certificates\n• Dispute resolution & early warnings",
  transport: "**Transport & Logistics** — Fleet management:\n• Vehicle registry & tracking\n• Driver management\n• Shipment scheduling\n• Mileage tracking\n• Maintenance alerts",
  fuel: "**Fuel Tracking** — Monitor fuel usage:\n• Fuel entry logging\n• Cost per liter tracking\n• Mileage vs consumption\n• Station & driver tracking\n• Trip distance recording",
  jobs: "**Jobs & Recruitment** — Find top talent:\n• Job posting & management\n• Applicant tracking\n• Interview scheduling\n• Candidate scoring\n• Job board integration",
  networking: "**Professional Networking** — Build connections:\n• Company feed & posts\n• Job sharing\n• Professional profiles\n• Marketplace listings\n• Business connections",
  admin: "**Admin & Settings** — System configuration:\n• User management & roles\n• Account settings\n• Security & permissions\n• Audit logs\n• Profile management",
};

const FALLBACKS = [
  "I am here to help with **HEYLAOS**, the all-in-one business management platform for SMEs and enterprises. I can assist with HR, Payroll, CRM, Accounting, Inventory, EHS, Engineering, Transport, Fuel, Jobs, and Networking. Try asking something like \"How does payroll work?\" or \"Tell me about HR features.\"",
  "I specialize in **HEYLAOS** business tools. Ask me about managing employees, tracking inventory, processing payroll, or any HEYLAOS module.",
  "I focus on **HEYLAOS** features only. You can ask about attendance tracking, leave management, CRM leads, or engineering project management.",
  "I can answer questions about **HEYLAOS** business management suite. Try \"How do I create an invoice?\" or \"What EHS features are available?\"",
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();

  for (const [key, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lower.includes(w))) {
      return RESPONSES[key];
    }
  }

  if (/\b(hi|hello|hey|greetings?|sup|howdy)\b/.test(lower)) {
    return "Hello. Welcome to **HEYLAOS** support. Ask me about any module including HR, Payroll, CRM, Accounting, Inventory, EHS, Engineering, Transport, Fuel, Jobs, or Networking. How can I help?";
  }

  if (/\b(thank|thanks|appreciate|helpful|great|awesome)\b/.test(lower)) {
    return "You are welcome. If you have more questions about **HEYLAOS** features, feel free to ask.";
  }

  if (/\b(bye|goodbye|see you|later|exit)\b/.test(lower)) {
    return "Thank you for chatting. If you need help with **HEYLAOS** later, I am available. Have a productive day.";
  }

  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

const SUGGESTIONS = [
  'How does HR work?',
  'Tell me about Payroll',
  'What is CRM?',
  'Explain Inventory',
  'EHS features',
  'Engineering tools',
];

export function HeyleyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', content: "Hello. I am the **HEYLAOS** assistant. I can help you with HR, Payroll, CRM, Accounting, Inventory, EHS, Engineering, Transport, Fuel, Jobs, and Networking. What would you like to know?" },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: getResponse(msg) };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    setShowSuggestions(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          aria-label="Open HEYLAOS chat"
        >
          <img src="/logo.png" alt="HEYLA" className="w-7 h-7" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className={`fixed z-50 flex flex-col bg-white dark:bg-gray-900 shadow-2xl overflow-hidden transition-all duration-300
          inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:rounded-2xl sm:w-[380px] sm:max-h-[600px]`}>
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shrink-0 sm:rounded-t-2xl">
            <img src="/logo.png" alt="HEYLA" className="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">HEYLAOS Assistant</p>
              <p className="text-xs text-white/70">Online</p>
            </div>
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      msg.role === 'bot'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {msg.role === 'bot' ? (
                        <img src="/logo.png" alt="HEYLA" className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                    }`}>
                      <p className="whitespace-pre-line [&_strong]:font-semibold">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {showSuggestions && messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="px-3 py-1.5 text-xs rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEnd} />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask about HEYLAOS..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
                  />
                  <button onClick={() => handleSend()} disabled={!input.trim()} className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
