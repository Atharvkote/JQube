export const THEME = {
  background: '#09090B',
  sidebar: '#0F1117',
  card: '#151922',
  primary: '#FF3B3B',
  border: 'rgba(255,59,59,.15)',
  hover: 'rgba(255,59,59,.08)',
  active: 'rgba(255,59,59,.12)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
} as const;

export const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#FF3B3B',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#3B82F6',
} as const;


