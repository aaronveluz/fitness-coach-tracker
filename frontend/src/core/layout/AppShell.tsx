// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/layout/AppShell.tsx
// Main layout container for the Fitness Coach Tracker with Theme Engine & Modals
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { QuickAddModal } from '../components/QuickAddModal';
import { PaymentModal } from '../components/PaymentModal';
import DonateModal from '../components/DonateModal';
import { useFitnessStore } from '../../app/store';

export default function AppShell() {
  const { sidebarCollapsed, isRestTimerRunning, tickRestTimer, theme } = useFitnessStore();

  // Apply Theme Attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Rest Timer Interval Hook
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, tickRestTimer]);

  return (
    <div className="app-shell">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar />

        {/* Dynamic Page Router Outlet */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Modals */}
      <QuickAddModal />
      <PaymentModal />
      <DonateModal />
    </div>
  );
}
