import { PageHeader } from '@/components/shared/CommonUI';
import { useNetworkStore, NetworkProfile } from '@/store/networkStore';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { MapPin, Globe, Briefcase, GraduationCap, Check, UserPlus, Loader2, Award, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function NetworkingUserProfilePage() {
  const { slug: userId } = useParams({ from: '/protected/networking/profile/$slug' });
  const { sendConnectionRequest, connections, fetchConnections } = useNetworkStore();
  const [profile, setProfile] = useState<NetworkProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchConnections();
    loadProfile();
  }, [userId]);

  useEffect(() => {
    setIsConnected(connections.some((c) => c.userId === userId));
  }, [connections, userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get<NetworkProfile>(`/network/profiles/${userId}`);
      setProfile(res);
    } catch {
      toast.error('Profile not found');
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    await sendConnectionRequest(userId);
    setSent(true);
    toast.success('Connection request sent!');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Profile not found</p>
      <button onClick={() => navigate({ to: '/networking/discover' })} className="text-primary text-sm mt-2 hover:underline">Discover people</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <button onClick={() => navigate({ to: '/networking/discover' })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </button>

      {/* Header */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
            {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.headline}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="w-3 h-3" /> Website</a>}
              <span>{profile.connectionCount} connections</span>
            </div>
          </div>
          <div>
            {isConnected ? (
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Connected
              </span>
            ) : sent ? (
              <span className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium">Request Sent</span>
            ) : (
              <button onClick={handleConnect}
                className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <UserPlus className="w-4 h-4" /> Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {profile.about && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.about}</p>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-primary" /> Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {s.name} {s.endorsements > 0 && <span className="text-xs opacity-70">· {s.endorsements}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {profile.experience.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-primary" /> Experience</h3>
          <div className="space-y-4">
            {profile.experience.map((e, i) => (
              <div key={i} className="border-l-2 border-border pl-4 pb-4 last:pb-0">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.company} · {e.startDate}{e.current ? ' - Present' : e.endDate ? ` - ${e.endDate}` : ''}</p>
                {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4 text-primary" /> Education</h3>
          <div className="space-y-4">
            {profile.education.map((e, i) => (
              <div key={i} className="border-l-2 border-border pl-4 pb-4 last:pb-0">
                <p className="font-medium">{e.school}</p>
                <p className="text-sm text-muted-foreground">{e.degree}{e.field ? ` in ${e.field}` : ''} · {e.startDate}{e.endDate ? ` - ${e.endDate}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
