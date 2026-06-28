import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getToken, apiBaseUrl } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
}

const fallbackResponses: Record<string, string> = {
  'hello': "Hello! 👋 Welcome to **HEYLA-OS CHAT ASSISTANT**. I'm here to help you with all HEYLA OS features including HR, Accounting, Transport, Inventory, CRM, Jobs, and more. How can I assist you today?",
  'hi': "Hi there! 👋 Welcome to HEYLA OS. I can help you with:\n• 👥 HR & Employee Management\n• 💰 Accounting & Payroll\n• 🚛 Transport & Fleet\n• 📦 Inventory Management\n• 📈 CRM & Sales\n• 💼 Jobs & Recruitment\n• 🏗️ Engineering Projects\n• ⚠️ EHS Compliance\n\nWhat would you like to know about?",
  'help': "I can help you with all HEYLA OS features! Try asking about:\n• 👥 **HR** — Employees, payroll, leave, attendance\n• 💰 **Accounting** — Invoices, expenses, reports\n• 🚛 **Transport** — Fleet, drivers, shipments, fuel\n• 📦 **Inventory** — Products, stock management\n• 📈 **CRM** — Leads, pipeline, support tickets\n• 💼 **Jobs** — Postings, applicants, interviews\n• 🏗️ **Engineering** — Projects, contracts, claims\n• ⚠️ **EHS** — Safety, compliance, inspections\n• ⚙️ **Settings** — Profile, security, appearance\n\nWhat would you like to explore?",
  'job': "**Jobs & Recruitment** — Manage hiring:\n• **Job Listings** — Post and manage open positions\n• **Applicants** — Track candidates through screening → interview → offer → hired\n• **Interview Management** — Schedule and track interviews\n• **Careers Portal** — Public job board for candidates\n• Match candidates to jobs based on skills",
  'salary': "For salary information, check the Payroll section under Accounting. You can view salary breakdowns, tax deductions (PAYE, NSSF, NHIF), and generate payslips.",
  'leave': "To apply for leave, go to HR → Leave Management. You can submit leave requests, check your balance, and track approval status.",
  'invoice': "To create an invoice, go to Accounting → Invoices and click 'New Invoice'. You can add line items, set payment terms, and send to clients.",
  'wiba': "WIBA (Work Injury Benefits Act) covers all employees for workplace injuries. Go to HR → WIBA Benefits to file claims or check coverage status.",
  'fuel': "**Fuel Tracking** — Vehicle fuel management:\n• Log fuel purchases by vehicle\n• Track loaded vs unloaded fuel efficiency\n• Analyze cost per kilometer\n• Compare fuel types (Diesel/Petrol) and vehicle models",
  'transport': "**Transport Module** — Fleet and logistics:\n• **Fleet** — Manage vehicles, track mileage and service history\n• **Drivers** — Driver profiles with ratings and trip history\n• **Shipments** — Track deliveries from pickup to delivery\n• **Fuel Tracking** — Log fuel consumption, analyze efficiency\n• View cost analytics and trip statistics",
};

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lower.includes(key)) return response;
  }
  return "I'm here to help with **HEYLA OS** features only. 😊\n\nPlease ask me about HR, Accounting, Transport, Inventory, CRM, Jobs, Marketplace, Engineering, EHS, or Settings.";
}

export function HeyleyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', content: "👋 Hi! I'm **HEYLA-OS CHAT ASSISTANT**. I can help with HR, Accounting, Transport, Inventory, CRM, Jobs, Engineering, EHS, and more. How can I help you today?", time: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${apiBaseUrl()}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: getFallbackResponse(msg), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 gradient-primary text-primary-foreground rounded-t-2xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">HEYLA-OS CHAT ASSISTANT</p>
          <p className="text-xs opacity-80">Online • AI Assistant</p>
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
          {/* Messages */}
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
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm bg-muted text-foreground rounded-bl-md">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2.5 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
