import { PageHeader } from '@/components/shared/CommonUI';
import { useNetworkStore, UserSearchResult } from '@/store/networkStore';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, UserPlus, Loader2, MapPin, Briefcase, Check, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkingDiscoverPage() {
  const { searchUsers, searchResults, sendConnectionRequest, fetchConnections, connections } = useNetworkStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    setConnectedIds(new Set(connections.map((c) => c.userId)));
  }, [connections]);

  const handleSearch = () => {
    if (!query.trim()) return;
    searchUsers(query);
  };

  const handleConnect = async (userId: string) => {
    await sendConnectionRequest(userId);
    setSent((prev) => new Set(prev).add(userId));
    toast.success('Connection request sent!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <PageHeader title="Discover People" description="Find and connect with professionals" />

      {/* Search */}
      <div className="glass rounded-xl p-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search by name, skill, or location..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={handleSearch}
            className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Search</button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {searchResults.map((user) => {
          const isConnected = connectedIds.has(user.id);
          const requestSent = sent.has(user.id);
          return (
            <div key={user.id} className="glass rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.company || user.role || 'Professional'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate({ to: `/networking/profile/${user.id}` })}
                  className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">View</button>
                {isConnected ? (
                  <span className="px-3 py-1.5 text-xs rounded-lg bg-primary/10 text-primary flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Connected
                  </span>
                ) : requestSent ? (
                  <span className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground">Request Sent</span>
                ) : (
                  <button onClick={() => handleConnect(user.id)}
                    className="px-3 py-1.5 text-xs gradient-primary text-primary-foreground rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
                    <UserPlus className="w-3 h-3" /> Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {searchResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
          </div>
        )}
        {!query && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Search for people by name, skill, or location to connect</p>
          </div>
        )}
      </div>
    </div>
  );
}
