import { useState } from 'react'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_CONNECTIONS = [
  { id: 1, name: 'Grace Wanjiku', title: 'Electrical Engineer @ PowerGen', skills: ['Wiring', 'Solar'], mutual: 12, avatar: 'GW', connected: true },
  { id: 2, name: 'Brian Kiprop', title: 'Welder & Fabricator @ SteelMakers', skills: ['MIG Welding', 'Arc Welding'], mutual: 8, avatar: 'BK', connected: true },
  { id: 3, name: 'Faith Nyambura', title: 'Plumber @ AquaTech', skills: ['Pipe Fitting', 'PPR Welding'], mutual: 5, avatar: 'FN', connected: true },
  { id: 4, name: 'Kevin Mwangi', title: 'Carpentry Student @ KTTI', skills: ['Wood Joinery', 'Furniture'], mutual: 3, avatar: 'KM', connected: false },
  { id: 5, name: 'Sarah Akinyi', title: 'Solar Technician @ SunCulture', skills: ['Solar PV', 'Installation'], mutual: 7, avatar: 'SA', connected: false },
]

const MOCK_SUGGESTIONS = [
  { id: 6, name: 'Dr. Kamau Mwangi', title: 'Lecturer, Electrical Eng @ KTTI', mutual: 15, avatar: 'DM', skills: ['Training', 'Mentorship'] },
  { id: 7, name: 'PowerBuild Contractors', title: 'Construction Company', mutual: 20, avatar: 'P', skills: ['Electrical', 'Construction'] },
  { id: 8, name: 'Jane Wambui', title: 'HR Lead @ SteelMakers Ltd', mutual: 4, avatar: 'JW', skills: ['Recruitment', 'Trades'] },
]

export default function NetworkTapConnections() {
  const [connections, setConnections] = useState(MOCK_CONNECTIONS)
  const [tab, setTab] = useState<'connections' | 'suggestions'>('connections')

  const toggleConnect = (id: number) => {
    setConnections(connections.map(c => c.id === id ? { ...c, connected: !c.connected } : c))
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: DN }}>My Network</h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>Connect with skilled professionals and employers</p>

        <div className="flex gap-2 mb-6">
          {(['connections', 'suggestions'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? 'text-white shadow-sm' : 'bg-white border hover:bg-gray-50'}`} style={{ background: tab === t ? PB : 'white', borderColor: '#E2E8F0', color: tab === t ? 'white' : '#475569' }}>
              {t} {t === 'connections' ? `(${connections.filter(c => c.connected).length})` : ''}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {(tab === 'connections' ? connections : MOCK_SUGGESTIONS).map((person) => (
            <div key={person.id} className="bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: PB }}>{person.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: DN }}>{person.name}</p>
                <p className="text-xs truncate" style={{ color: '#64748B' }}>{person.title}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{person.mutual} mutual connections</p>
                <div className="flex gap-1 mt-1">
                  {person.skills.slice(0, 2).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#F1F5F9', color: '#475569' }}>{s}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => 'connected' in person && toggleConnect(person.id)} className={`px-4 py-1.5 rounded-xl text-sm font-medium shrink-0 border-2 transition-colors`} style={{ borderColor: PB, color: 'connected' in person && person.connected ? 'white' : PB, background: 'connected' in person && person.connected ? PB : 'transparent' }}>
                {'connected' in person ? person.connected ? 'Connected' : 'Connect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
