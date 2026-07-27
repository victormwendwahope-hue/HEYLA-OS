import { PageHeader } from '@/components/shared/CommonUI';
import { Heart, MessageCircle, Share2, Send, Briefcase, Image, Trash2, MapPin, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNetworkStore } from '@/store/networkStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from '@tanstack/react-router';

export default function NetworkingPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { posts, jobs, fetchPosts, fetchJobs, addPost, deletePost, toggleLike, addComment, addJob } = useNetworkStore();
  const [newPost, setNewPost] = useState('');
  const [tab, setTab] = useState<'feed' | 'jobs'>('feed');
  const [showJobForm, setShowJobForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoName, setPhotoName] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', company: user?.company || '', location: '', type: 'Full-time' as const, salary: '', skills: '', description: '' });
  const [commentInput, setCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => { fetchPosts(); fetchJobs(); }, []);

  const handlePost = () => {
    if (!newPost.trim()) return;
    addPost(newPost);
    setNewPost('');
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description) { toast.error('Fill required fields'); return; }
    addJob({
      ...jobForm,
      type: jobForm.type as any,
      posted: 'Just now',
      skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setShowJobForm(false);
    setJobForm({ title: '', company: user?.company || '', location: '', type: 'Full-time', salary: '', skills: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <PageHeader title="Networking" description="Connect, share updates, and post jobs" />

      {/* Quick Links */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => navigate({ to: '/networking/profile' })}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">My Profile</button>
        <button onClick={() => navigate({ to: '/networking/network' })}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">My Network</button>
        <button onClick={() => navigate({ to: '/networking/discover' })}
          className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">Discover People</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {(['feed', 'jobs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            {t === 'feed' ? 'Feed' : 'Jobs'}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <>
          {/* Compose */}
          <div className="glass rounded-xl p-5">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                {(user?.name || 'U').split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share an update with your network..."
                  className="w-full resize-none bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground" rows={3} />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPhotoName(f.name); toast.info(`Selected: ${f.name}`); }}} />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted">
                      <Image className="w-4 h-4" /> Photo
                    </button>
                    {photoName && <span className="text-xs text-muted-foreground self-center">{photoName}</span>}
                  </div>
                  <button onClick={handlePost} disabled={!newPost.trim()}
                    className="gradient-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50">
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          {posts.map((post) => (
            <div key={post.id} className="glass rounded-xl p-5 animate-fade-in">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">{post.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <button onClick={() => post.authorId && navigate({ to: `/networking/profile/${post.authorId}` })} className="font-medium text-sm hover:text-primary transition-colors text-left">{post.author}</button>
                      <p className="text-xs text-muted-foreground">{post.role} · {post.time}</p>
                    </div>
                    {post.author === (user?.name || 'You') && (
                      <button onClick={() => { deletePost(post.id); }} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-6 pt-3 border-t border-border">
                <button onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-primary' : ''}`} /> {post.likes}
                </button>
                <button onClick={() => setCommentInput(commentInput === post.id ? null : post.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" /> {post.commentList?.length || post.comments}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
              {commentInput === post.id && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {(post.commentList || []).map((c) => (
                    <div key={c.id} className="flex items-start gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {(c.userName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{c.userName}</p>
                        <p className="text-xs text-muted-foreground">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); if (!commentText.trim()) return; addComment(post.id, commentText); setCommentText(''); }} className="flex gap-2">
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button type="submit" disabled={!commentText.trim()} className="gradient-primary text-primary-foreground p-1.5 rounded-lg disabled:opacity-50"><Send className="w-3.5 h-3.5" /></button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {tab === 'jobs' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowJobForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Briefcase className="w-4 h-4" /> Post a Job
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Link to={`/marketplace`} className="font-semibold hover:text-primary transition-colors">{job.title}</Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-primary">{job.salary}</p>
                    <p className="text-xs text-muted-foreground">{job.applicants.length} applicants</p>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">{job.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showJobForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
                  <h2 className="text-lg font-bold">Post a Job</h2>
                  <button onClick={() => setShowJobForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><span className="text-lg">✕</span></button>
                </div>
                <form onSubmit={handlePostJob} className="p-5 space-y-4">
                  {[
                    { label: 'Job Title*', field: 'title', placeholder: 'e.g. Full Stack Developer' },
                    { label: 'Company', field: 'company', placeholder: 'Your company' },
                    { label: 'Location', field: 'location', placeholder: 'e.g. Nairobi, Kenya' },
                    { label: 'Salary Range', field: 'salary', placeholder: 'e.g. 150K - 200K KES' },
                    { label: 'Skills (comma separated)', field: 'skills', placeholder: 'React, Node.js, TypeScript' },
                  ].map((f) => (
                    <div key={f.field}>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                      <input value={(jobForm as any)[f.field]} onChange={(e) => setJobForm({ ...jobForm, [f.field]: e.target.value })} placeholder={f.placeholder}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Type</label>
                    <select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description*</label>
                    <textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowJobForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Post Job</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
