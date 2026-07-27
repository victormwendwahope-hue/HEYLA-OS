import { PageHeader } from '@/components/shared/CommonUI';
import { useNetworkStore } from '@/store/networkStore';
import { useEffect } from 'react';
import { Users, UserPlus, Check, X, Clock, UserMinus, Loader2 } from 'lucide-react';

export default function NetworkingNetworkPage() {
  const { connections, pendingRequests, fetchConnections, acceptConnection, removeConnection } = useNetworkStore();

  useEffect(() => { fetchConnections(); }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <PageHeader title="My Network" description="Manage your professional connections" />

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-primary" /> Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {(r.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptConnection(r.id)}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeConnection(r.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" /> Connections ({connections.length})
        </h3>
        {connections.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No connections yet. Discover people to connect with!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {(c.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Connected {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
                <button onClick={() => removeConnection(c.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
