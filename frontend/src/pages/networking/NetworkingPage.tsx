import { PageHeader } from '@/components/shared/CommonUI';
import { Heart, MessageCircle, Share2, Send, Users } from 'lucide-react';
import { useState } from 'react';

const posts = [
  { id: '1', author: 'Wanjiku Mwangi', role: 'Senior Developer', avatar: 'WM', content: 'Just shipped the new payment integration for M-PESA! 🚀 Excited to see how this scales across East Africa.', time: '2 hours ago', likes: 24, comments: 8 },
  { id: '2', author: 'Ochieng Otieno', role: 'Sales Manager', avatar: 'OO', content: 'Closed the biggest deal this quarter with Safaricom PLC. Team effort! 🎉', time: '5 hours ago', likes: 45, comments: 12 },
  { id: '3', author: 'Amina Hassan', role: 'Accountant', avatar: 'AH', content: 'Reminder: Q4 reports are due next Friday. Please submit your department expenses.', time: '1 day ago', likes: 8, comments: 3 },
];

export default function NetworkingPage() {
  const [newPost, setNewPost] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <PageHeader title="Networking" description="Connect with your team and business network" />

      {/* New Post */}
      <div className="glass rounded-xl p-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">JK</div>
          <div className="flex-1">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share an update..."
              className="w-full resize-none bg-transparent text-sm focus:outline-none" rows={3} />
            <div className="flex justify-end mt-2">
              <button className="gradient-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
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
            <div>
              <p className="font-medium text-sm">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.role} · {post.time}</p>
            </div>
          </div>
          <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-6 pt-3 border-t border-border">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Heart className="w-4 h-4" /> {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" /> {post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
