import { PageHeader } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { usePerformanceStore, type PerformanceReview } from '@/store/performanceStore';
import { useState, useEffect } from 'react';
import { Star, TrendingUp, Target, Award, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const defaultForm = { employeeId: '', quarter: '', rating: 5, feedback: '' };

export default function PerformancePage() {
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const { reviews, loading, fetchReviews, addReview, updateReview, deleteReview } = usePerformanceStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalReviewId, setGoalReviewId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState('');

  useEffect(() => { fetchEmployees(); fetchReviews(); }, []);

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);

  const openAdd = () => {
    setEditingReview(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (review: PerformanceReview) => {
    setEditingReview(review);
    setForm({ employeeId: review.employeeId, quarter: review.quarter, rating: review.rating, feedback: review.feedback });
    setDialogOpen(true);
  };

  const saveReview = () => {
    if (editingReview) {
      updateReview(editingReview.id, { ...form, rating: Number(form.rating) });
    } else {
      addReview({
        employeeId: form.employeeId,
        quarter: form.quarter,
        rating: Number(form.rating),
        feedback: form.feedback,
        goals: [],
      });
    }
    setDialogOpen(false);
    setEditingReview(null);
    setForm(defaultForm);
  };

  const addGoal = (reviewId: string) => {
    setGoalReviewId(reviewId);
    setGoalTitle('');
    setGoalDialogOpen(true);
  };

  const confirmAddGoal = () => {
    if (!goalTitle.trim() || !goalReviewId) return;
    const review = reviews.find(r => r.id === goalReviewId);
    if (!review) return;
    const updatedGoals = [...review.goals, { title: goalTitle.trim(), progress: 0 }];
    updateReview(goalReviewId, { goals: updatedGoals });
    setGoalDialogOpen(false);
    setGoalReviewId(null);
    setGoalTitle('');
  };

  const deleteGoal = (reviewId: string, goalIndex: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    const updatedGoals = review.goals.filter((_, i) => i !== goalIndex);
    updateReview(reviewId, { goals: updatedGoals });
  };

  const updateGoalProgress = (reviewId: string, goalIndex: number, progress: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    const updatedGoals = review.goals.map((g, i) =>
      i === goalIndex ? { ...g, progress: Math.max(0, Math.min(100, progress)) } : g
    );
    updateReview(reviewId, { goals: updatedGoals });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Performance" description="Track goals, reviews, and employee performance">
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" />Add Review
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingReview(null); setForm(defaultForm); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingReview ? 'Edit Review' : 'Add Review'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm((p) => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quarter</Label>
              <Input value={form.quarter} onChange={(e) => setForm((p) => ({ ...p, quarter: e.target.value }))} placeholder="e.g. Q1 2025" />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: +e.target.value }))} />
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea value={form.feedback} onChange={(e) => setForm((p) => ({ ...p, feedback: e.target.value }))} />
            </div>
            <Button onClick={saveReview} className="w-full">{editingReview ? 'Update Review' : 'Create Review'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal input dialog (replaces prompt()) */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Goal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Goal Title</Label>
              <Input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Enter goal title" autoFocus />
            </div>
            <Button onClick={confirmAddGoal} className="w-full">Add Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading && <div className="flex items-center justify-center py-4 text-muted-foreground">Loading...</div>}

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
            <div key={review.id} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">{emp.firstName[0]}{emp.lastName[0]}</div>
                  <div>
                    <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-muted-foreground">{emp.position} · {review.quarter}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-bold">{review.rating}</span>
                  </div>
                  <button onClick={() => openEdit(review)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this review for {emp.firstName} {emp.lastName}? This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteReview(review.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                {review.goals.map((goal, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span>{goal.title}</span>
                        <button onClick={() => deleteGoal(review.id, i)} className="p-0.5 rounded hover:bg-muted transition-colors">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={goal.progress}
                          onChange={(e) => updateGoalProgress(review.id, i, +e.target.value)}
                          className="w-16 h-7 text-xs text-right"
                        />
                        <span className="text-muted-foreground w-8 text-right">%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addGoal(review.id)} className="w-full">
                  <Plus className="w-3 h-3 mr-1" />Add Goal
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic">"{review.feedback}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
