import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2 } from 'lucide-react';
import { getToken, apiBaseUrl } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
}

export function HeyleyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'bot', content: "👋 Hi! I'm **HEYLA-OS CHAT ASSISTANT**. I can help with HR, Accounting, Transport, Inventory, CRM, Jobs, Engineering, EHS, and more. How can I help you today?", time: 'Now' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, time: now };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error('No token');
      const res = await fetch(`${apiBaseUrl()}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.reply || "I couldn't process that. Please try asking about HR, Accounting, Transport, or another HEYLA OS feature.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I'm having trouble connecting to the server. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
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
      <div className="flex items-center gap-3 px-4 py-3 gradient-primary text-primary-foreground rounded-t-2xl shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">HEYLA-OS CHAT ASSISTANT</p>
          <p className="text-xs opacity-80">Online • {loading ? 'Thinking...' : 'AI Powered'}</p>
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
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm bg-muted text-foreground rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
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
              <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2.5 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}