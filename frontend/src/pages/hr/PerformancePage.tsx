import { PageHeader } from '@/components/shared/CommonUI';
import { useEmployees } from '@/store/employeeStore';
import { useState } from 'react';
import { Star, TrendingUp, Target, Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Review {
  employeeId: string;
  quarter: string;
  rating: number;
  goals: { title: string; progress: number }[];
  feedback: string;
}

const mockReviews: Review[] = [
  { employeeId: '1', quarter: 'Q4 2024', rating: 4.5, goals: [{ title: 'Ship M-Pesa integration', progress: 100 }, { title: 'Mentor 2 juniors', progress: 80 }, { title: 'Reduce API latency by 20%', progress: 60 }], feedback: 'Exceptional work on payment systems.' },
  { employeeId: '2', quarter: 'Q4 2024', rating: 4.2, goals: [{ title: 'Close 5 enterprise deals', progress: 100 }, { title: 'Grow pipeline by 30%', progress: 90 }], feedback: 'Consistently exceeds targets.' },
  { employeeId: '3', quarter: 'Q4 2024', rating: 3.8, goals: [{ title: 'Automate monthly reports', progress: 70 }, { title: 'Implement new tax compliance', progress: 50 }], feedback: 'Good progress, needs to complete automation.' },
];

export default function PerformancePage() {
  const { data: employees = [] } = useEmployees();
  const [reviews] = useState<Review[]>(mockReviews);

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Performance" description="Track goals, reviews, and employee performance" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-warning fill-warning" />
          <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{reviews.reduce((s, r) => s + r.goals.length, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Goals</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold">{reviews.reduce((s, r) => s + r.goals.filter((g) => g.progress === 100).length, 0)}</p>
          <p className="text-xs text-muted-foreground">Goals Completed</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-info" />
          <p className="text-2xl font-bold">{reviews.filter((r) => r.rating >= 4.5).length}</p>
          <p className="text-xs text-muted-foreground">Top Performers</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const emp = employees.find((e) => e.id === review.employeeId);
          if (!emp) return null;
          return (
            <div key={review.employeeId} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">{emp.firstName[0]}{emp.lastName[0]}</div>
                  <div>
                    <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-muted-foreground">{emp.position} · {review.quarter}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-bold">{review.rating}</span>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                {review.goals.map((goal, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{goal.title}</span>
                      <span className="text-muted-foreground">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">"{review.feedback}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
