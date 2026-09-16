export const COLORS = [
  'linear-gradient(135deg,#10b981,#065f46)',
  'linear-gradient(135deg,#3b82f6,#1e3a8a)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#ef4444,#991b1b)',
  'linear-gradient(135deg,#8b5cf6,#4c1d95)',
  'linear-gradient(135deg,#06b6d4,#164e63)',
  'linear-gradient(135deg,#ec4899,#831843)',
  'linear-gradient(135deg,#84cc16,#365314)',
];

export const initialState = {
  committees: [],
  members: [],
  payments: [],
  nextId: { committee: 1, member: 1, payment: 1 },
  filters: { member: 'all', payment: 'all' },
};

export const formatRs = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

export const initials = (name = '') =>
  name
    .trim()
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
