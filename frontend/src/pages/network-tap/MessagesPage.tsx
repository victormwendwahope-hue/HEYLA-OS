import { useState } from 'react'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_CONVOS = [
  { id: 1, name: 'Grace Wanjiku', avatar: 'GW', lastMsg: 'Thanks for connecting! I saw your electrical project — great work!', time: '5m', unread: 2, title: 'Electrical Engineer' },
  { id: 2, name: 'Brian Kiprop', avatar: 'BK', lastMsg: 'Sure, let me check the welding job posting and get back to you.', time: '1h', unread: 0, title: 'Welder & Fabricator' },
  { id: 3, name: 'PowerBuild HR', avatar: 'P', lastMsg: 'Your application for Electrical Technician has been received.', time: '2h', unread: 1, title: 'PowerBuild Contractors' },
  { id: 4, name: 'Faith Nyambura', avatar: 'FN', lastMsg: 'Would love to collaborate on the plumbing project!', time: '1d', unread: 0, title: 'Plumber @ AquaTech' },
]

export default function NetworkTapMessages() {
  const [activeConvo, setActiveConvo] = useState<number | null>(1)
  const [messageText, setMessageText] = useState('')

  const active = MOCK_CONVOS.find(c => c.id === activeConvo)

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4" style={{ color: DN }}>Messages</h1>
        <div className="bg-white rounded-2xl border flex h-[600px] shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="w-72 border-r shrink-0 overflow-y-auto hidden sm:block" style={{ borderColor: '#E2E8F0' }}>
            <div className="p-4 border-b" style={{ borderColor: '#E2E8F0' }}>
              <input placeholder="Search messages..." className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
            </div>
            {MOCK_CONVOS.map((c) => (
              <button key={c.id} onClick={() => setActiveConvo(c.id)} className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-gray-50 ${activeConvo === c.id ? 'bg-blue-50' : ''}`} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: PB }}>{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm" style={{ color: DN }}>{c.name}</p>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{c.time}</span>
                  </div>
                  <p className="text-xs" style={{ color: '#64748B' }}>{c.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: PB }}>{c.unread}</div>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col">
            {active ? (
              <>
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: PB }}>{active.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: DN }}>{active.name}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{active.title}</p>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex mb-4 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                      <div className={`max-w-[70%] p-3 rounded-xl text-sm ${i % 2 === 0 ? 'text-white' : ''}`} style={{ background: i % 2 === 0 ? PB : '#F1F5F9', color: i % 2 === 0 ? 'white' : '#333' }}>
                        {i === 1 && 'Hi! I saw your profile and would love to connect. I\'m looking for electrical work opportunities.'}
                        {i === 2 && 'Thanks for reaching out! We have an opening for an Electrical Technician.'}
                        {i === 3 && 'That sounds great! I can share my project portfolio and CV.'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex gap-2">
                    <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-gray-50" style={{ borderColor: '#E2E8F0', '--tw-ring-color': PB } as React.CSSProperties} />
                    <button disabled={!messageText.trim()} className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 shadow-sm" style={{ background: PB }}>Send</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm" style={{ color: '#64748B' }}>Select a conversation</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
