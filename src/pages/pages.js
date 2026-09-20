/**
 * PAGES — single source of truth for the "Your Life, In Receipts" experience.
 * Routes now map to the 4 interactive experience modules.
 */
export const PAGES = [
  {
    id: 'story',
    title: 'Life Chapters',
    subtitle: '11.4 years in four acts',
    palette: ['#1a0a2e', '#a78bfa', '#e2d9f3'],
    art: 'arc',
    icon: '📖',
  },
  {
    id: 'receipts',
    title: 'Receipt Printer',
    subtitle: 'Your moments, itemised',
    palette: ['#0a1628', '#22d3ee', '#cffafe'],
    art: 'stripes',
    icon: '🧾',
  },
  {
    id: 'connections',
    title: 'Co-Occurrences',
    subtitle: 'When sound met spending',
    palette: ['#0f1a12', '#4ade80', '#dcfce7'],
    art: 'grid',
    icon: '🔗',
  },
  {
    id: 'patterns',
    title: 'Behavioural Radar',
    subtitle: 'Rhythms hidden in the data',
    palette: ['#1a0f0a', '#fb923c', '#ffedd5'],
    art: 'circle',
    icon: '📡',
  },
];
