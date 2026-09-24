export const LOCALES = ['fa', 'en', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DIRECTIONS: Record<Locale, 'rtl' | 'ltr'> = {
  fa: 'rtl',
  en: 'ltr',
  zh: 'ltr',
};

export const ARTICLE_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'FACT_CHECK',
  'COPY_EDIT',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'UPDATED',
  'CORRECTED',
  'ARCHIVED',
] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const WORKFLOW_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['IN_REVIEW', 'DRAFT'],
  IN_REVIEW: ['FACT_CHECK', 'COPY_EDIT', 'DRAFT'],
  FACT_CHECK: ['COPY_EDIT', 'APPROVED', 'IN_REVIEW'],
  COPY_EDIT: ['APPROVED', 'IN_REVIEW'],
  APPROVED: ['SCHEDULED', 'PUBLISHED'],
  SCHEDULED: ['PUBLISHED', 'APPROVED'],
  PUBLISHED: ['UPDATED', 'CORRECTED', 'ARCHIVED'],
  UPDATED: ['PUBLISHED', 'CORRECTED', 'ARCHIVED'],
  CORRECTED: ['UPDATED', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

export type ThemePreset = 'system' | 'light' | 'dark' | 'red' | 'blue';

export interface OperatingHourRule {
  day: number;
  open: string;
  close: string;
  enabled: boolean;
}

export interface AvailabilityResult {
  timezone: string;
  now: string;
  state: 'open' | 'closed';
  currentWindow?: { open: string; close: string; day: number };
  nextOpenAt?: string;
  secondsUntilNextOpen?: number;
  secondsUntilClose?: number;
}
