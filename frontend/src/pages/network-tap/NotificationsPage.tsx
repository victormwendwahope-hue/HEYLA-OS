import { useState } from 'react'
import { Link } from '@tanstack/react-router'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'application', user: 'PowerBuild Contractors', action: 'reviewed your application for Electrical Technician', time: '2h', avatar: 'P', read: false },
  { id: 2, type: 'connection', user: 'Grace Wanjiku', action: 'accepted your connection request', time: '4h', avatar: 'GW', read: false },
  { id: 3, type: 'like', user: 'Brian Kiprop', action: 'liked your project: Solar Panel Installation', time: '6h', avatar: 'BK', read: false },
  { id: 4, type: 'job', user: 'SunCulture Kenya', action: 'posted a new Solar Installation Trainee opportunity', time: '1d', avatar: 'S', read: true },
  { id: 5, type: 'comment', user: 'Faith Nyambura', action: 'commented on your project: "Great work on the wiring!"', time: '2d', avatar: 'FN', read: true },
  { id: 6, type: 'endorsement', user: 'Dr. Kamau Mwangi', action: 'endorsed your Electrical Wiring skill', time: '3d', avatar: 'DM', read: true },
]

export default function NetworkTapNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>Notifications</h1>
            {unreadCount > 0 && <p className="text-sm" style={{ color: '#64748B' }}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 rounded-xl text-sm font-medium border bg-white hover:bg-gray-50 transition-colors" style={{ borderColor: '#E2E8F0', color: PB }}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white rounded-2xl border p-4 flex items-start gap-4 shadow-sm transition-all ${n.read ? 'opacity-75' : ''}`} style={{ borderColor: '#E2E8F0', borderLeft: !n.read ? `4px solid ${PB}` : undefined }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: PB }}>{n.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: '#333' }}>
                  <span className="font-medium" style={{ color: DN }}>{n.user}</span> {n.action}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: PB }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
