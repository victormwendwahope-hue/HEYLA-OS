import { LeadScoreParts, CustomerHealth, HealthBand, Lead } from '@/modules/crm/types';

export const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, n));

// ---- Lead Score ----
// Industry Fit 20 + Budget 25 + Engagement 20 + Response 10 + Company Size 15 + History 10
// Bands: 🟢 80-100 / 🟡 60-79 / 🟠 40-59 / 🔴 <40

export const LEAD_WEIGHTS = { industryFit: 20, budget: 25, engagement: 20, response: 10, companySize: 15, history: 10 };

export function leadScoreOf(parts: LeadScoreParts): { score: number; color: 'green' | 'yellow' | 'orange' | 'red' } {
  const score = Math.round(
    clamp(parts.industryFit) * LEAD_WEIGHTS.industryFit / 20 +
    clamp(parts.budget) * LEAD_WEIGHTS.budget / 25 +
    clamp(parts.engagement) * LEAD_WEIGHTS.engagement / 20 +
    clamp(parts.response) * LEAD_WEIGHTS.response / 10 +
    clamp(parts.companySize) * LEAD_WEIGHTS.companySize / 15 +
    clamp(parts.history) * LEAD_WEIGHTS.history / 10,
  );
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : score >= 40 ? 'orange' : 'red';
  return { score: clamp(score), color };
}

export const scoreMeta: Record<'green' | 'yellow' | 'orange' | 'red', { label: string; text: string; bg: string; emoji: string }> = {
  green: { label: 'Hot', text: 'text-success', bg: 'bg-success/10', emoji: '🟢' },
  yellow: { label: 'Warm', text: 'text-warning', bg: 'bg-warning/10', emoji: '🟡' },
  orange: { label: 'Cool', text: 'text-orange-500', bg: 'bg-orange-500/10', emoji: '🟠' },
  red: { label: 'Cold', text: 'text-destructive', bg: 'bg-destructive/10', emoji: '🔴' },
};

// ---- Customer Health ----
// Revenue 25 + Payment 20 + Support 20 + Engagement 15 + Contract 20
// Bands: Excellent >=85 / Good 70-84 / Attention 50-69 / At Risk <50

export function healthOf(inputs: { revenue: number; payment: number; support: number; engagement: number; contract: number }): CustomerHealth {
  const total = Math.round(
    clamp(inputs.revenue) * 25 / 100 +
    clamp(inputs.payment) * 20 / 100 +
    clamp(inputs.support) * 20 / 100 +
    clamp(inputs.engagement) * 15 / 100 +
    clamp(inputs.contract) * 20 / 100,
  );
  const band: HealthBand = total >= 85 ? 'excellent' : total >= 70 ? 'good' : total >= 50 ? 'attention' : 'risk';
  return { revenueScore: clamp(inputs.revenue), paymentScore: clamp(inputs.payment), supportScore: clamp(inputs.support), engagementScore: clamp(inputs.engagement), contractScore: clamp(inputs.contract), total, band };
}

export const healthMeta: Record<HealthBand, { label: string; text: string; bg: string; emoji: string }> = {
  excellent: { label: 'Excellent', text: 'text-success', bg: 'bg-success/10', emoji: '🟢' },
  good: { label: 'Good', text: 'text-primary', bg: 'bg-primary/10', emoji: '🔵' },
  attention: { label: 'Attention', text: 'text-warning', bg: 'bg-warning/10', emoji: '🟠' },
  risk: { label: 'At Risk', text: 'text-destructive', bg: 'bg-destructive/10', emoji: '🔴' },
};

// Empty weighted score for building a new part.
export const emptyLeadParts = (): LeadScoreParts => ({ industryFit: 50, budget: 50, engagement: 50, response: 50, companySize: 50, history: 50 });

export function initialsOf(name: string): string {
  return name.split(' ').map((p) => p[0] || '').join('').slice(0, 2).toUpperCase();
}

export function avatarHue(seed: string): string {
  const colors = ['#0A66FF', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2', '#DC2626', '#6D28D9'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return colors[h % colors.length];
}