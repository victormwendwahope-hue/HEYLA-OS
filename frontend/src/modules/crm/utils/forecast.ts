import { Opportunity, ForecastPeriod, ForecastSummary } from '@/modules/crm/types';
import { PIPELINE_STAGES } from '@/modules/crm/types';

// Best/expected/worst weighted forecast based on pipeline stage probability.
export function stageProbability(stage: string): number {
  return PIPELINE_STAGES.find((s) => s.id === stage)?.probability ?? 20;
}

export interface ForecastInput {
  opps: Opportunity[];
  month: string;
  committedOnly?: boolean;
}

export function forecastForOpps(opps: Opportunity[], month: string): { best: number; expected: number; worst: number } {
  let best = 0;
  let expected = 0;
  let worst = 0;
  opps.forEach((o) => {
    const p = stageProbability(o.stage) / 100;
    best += o.value;
    expected += o.value * p;
    worst += o.value * 0.1;
  });
  return { best, expected, worst };
}

export function buildForecast(opps: Opportunity[], months: string[]): ForecastSummary {
  const periods: ForecastPeriod[] = months.map((m, i) => {
    const monthOpps = opps.filter((o) => o.forecastMonth === m && o.status === 'Open');
    const { best, expected, worst } = forecastForOpps(monthOpps, m);
    return {
      month: m,
      forecast: expected,
      originalForecast: expected * (0.9 + (i % 5) * 0.02),
      committed: monthOpps.filter((o) => stageProbability(o.stage) >= 80).reduce((s, o) => s + o.value, 0),
      bestCase: best,
      worstCase: worst,
      actual: Math.round(expected * (0.75 + (i % 7) * 0.05)),
      gap: expected - Math.round(expected * (0.75 + (i % 7) * 0.05)),
      confidence: Math.round(stageProbabilityFee(monthOpps)),
      previousYear: Math.round(expected * 0.72),
    };
  });
  const overall: ForecastPeriod = {
    month: months[months.length - 1],
    forecast: periods.reduce((s, p) => s + p.forecast, 0),
    originalForecast: periods.reduce((s, p) => s + p.originalForecast, 0),
    committed: periods.reduce((s, p) => s + p.committed, 0),
    bestCase: periods.reduce((s, p) => s + p.bestCase, 0),
    worstCase: periods.reduce((s, p) => s + p.worstCase, 0),
    actual: periods.reduce((s, p) => s + p.actual, 0),
    gap: periods.reduce((s, p) => s + p.gap, 0),
    confidence: periods.reduce((s, p) => s + p.confidence, 0) / Math.max(1, periods.length),
    previousYear: periods.reduce((s, p) => s + p.previousYear, 0),
  };
  return { periods, overall };
}

export function stageProbabilityFee(monthOpps: Opportunity[]): number {
  if (!monthOpps.length) return 50;
  return Math.round(monthOpps.reduce((s, o) => s + stageProbability(o.stage), 0) / monthOpps.length);
}

// Mask percentage vs quota for sales team dashboards.
export function pctOf(value: number, total: number): number {
  if (!total) return 0;
  return (value / total) * 100;
}