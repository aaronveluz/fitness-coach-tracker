// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/layout/BottomNav.tsx
// Mobile Sticky Bottom Navigation Bar with Quick-Add Floating Action Trigger
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom';
import { useFitnessStore } from '../../app/store';

export function BottomNav() {
  const { openQuickAdd } = useFitnessStore();

  return (
    <nav className="mobile-nav-bar">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <span style={{ fontSize: 20 }}>📊</span>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/food"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <span style={{ fontSize: 20 }}>🥗</span>
        <span>Food</span>
      </NavLink>

      {/* Floating Center '+' Button */}
      <button
        onClick={openQuickAdd}
        className="mobile-fab-center"
        aria-label="Quick Log Entry"
      >
        ＋
      </button>

      <NavLink
        to="/workouts"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <span style={{ fontSize: 20 }}>🏋️‍♂️</span>
        <span>Lifts</span>
      </NavLink>

      <NavLink
        to="/coach-dashboard"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <span style={{ fontSize: 20 }}>🏆</span>
        <span>Coach</span>
      </NavLink>
    </nav>
  );
}
