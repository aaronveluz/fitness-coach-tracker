// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/navigation.config.ts
// Config-driven Navigation for Fitness Coach Tracker
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  group?: string;
  badge?: string;
  badgeColor?: string;
  roleRequired?: 'client' | 'coach' | 'staff';
}

export const navigationItems: NavItem[] = [
  // ── Core Tracking ───────────────────────────────────────────────────────────
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    group: 'Main',
  },
  {
    label: 'Food & Nutrition',
    path: '/food',
    icon: '🥗',
    group: 'Tracking',
    badge: 'Macros',
    badgeColor: 'emerald',
  },
  {
    label: 'Weightlifting Log',
    path: '/workouts',
    icon: '🏋️‍♂️',
    group: 'Tracking',
    badge: '1RM',
    badgeColor: 'cyan',
  },
  {
    label: 'Physique Progress',
    path: '/physique',
    icon: '📸',
    group: 'Tracking',
    badge: 'Compare',
    badgeColor: 'purple',
  },
  {
    label: 'Workout Frequency',
    path: '/frequency',
    icon: '🔥',
    group: 'Tracking',
    badge: 'Streak',
    badgeColor: 'amber',
  },
  {
    label: 'Body Weight',
    path: '/weight',
    icon: '⚖️',
    group: 'Tracking',
  },

  // ── Knowledge & Training ──────────────────────────────────────────────────
  {
    label: 'Form Correction',
    path: '/form-correction',
    icon: '🎯',
    group: 'Technique',
    badge: 'Visuals',
    badgeColor: 'emerald',
  },
  {
    label: 'Exercise Library',
    path: '/exercises',
    icon: '📚',
    group: 'Technique',
  },

  // ── Coaching & Subscriptions ──────────────────────────────────────────────
  {
    label: 'Coach Monitoring',
    path: '/coach-dashboard',
    icon: '🏆',
    group: 'Coaching',
    badge: 'Bi-Weekly',
    badgeColor: 'rose',
  },
  {
    label: 'QR Payments & Plans',
    path: '/payments',
    icon: '💳',
    group: 'Coaching',
    badge: 'QR Pay',
    badgeColor: 'cyan',
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  {
    label: 'App Settings',
    path: '/settings',
    icon: '⚙️',
    group: 'Account',
  },
];
