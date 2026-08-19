// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/app/router/index.tsx
// Central Route Configuration for IronPulse Fitness Coach Tracker
// ─────────────────────────────────────────────────────────────────────────────

import React, { Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useFitnessStore } from '../store';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage            = React.lazy(() => import('../../features/auth/pages/LoginPage'));
const AppShell             = React.lazy(() => import('../../core/layout/AppShell'));
const DashboardPage        = React.lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const FoodTrackerPage      = React.lazy(() => import('../../features/food/pages/FoodTrackerPage'));
const PhysiqueTrackerPage  = React.lazy(() => import('../../features/physique/pages/PhysiqueTrackerPage'));
const WeightliftingPage    = React.lazy(() => import('../../features/workouts/pages/WeightliftingPage'));
const FrequencyPage        = React.lazy(() => import('../../features/frequency/pages/FrequencyPage'));
const BodyWeightPage       = React.lazy(() => import('../../features/weight/pages/BodyWeightPage'));
const FormCorrectionPage   = React.lazy(() => import('../../features/form-correction/pages/FormCorrectionPage'));
const ExerciseLibraryPage  = React.lazy(() => import('../../features/exercises/pages/ExerciseLibraryPage'));
const CoachDashboardPage   = React.lazy(() => import('../../features/coach/pages/CoachDashboardPage'));
const UsersPage            = React.lazy(() => import('../../features/users/pages/UsersPage'));
const PaymentPage          = React.lazy(() => import('../../features/payments/pages/PaymentPage'));
const SettingsPage         = React.lazy(() => import('../../features/settings/pages/SettingsPage'));
const NotFoundPage         = React.lazy(() => import('../../core/components/NotFoundPage'));

// ── Protected Route Wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useFitnessStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// ── Page Loading Fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── App Router ───────────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes inside AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="food" element={<FoodTrackerPage />} />
            <Route path="physique" element={<PhysiqueTrackerPage />} />
            <Route path="workouts" element={<WeightliftingPage />} />
            <Route path="frequency" element={<FrequencyPage />} />
            <Route path="weight" element={<BodyWeightPage />} />
            <Route path="form-correction" element={<FormCorrectionPage />} />
            <Route path="exercises" element={<ExerciseLibraryPage />} />
            <Route path="coach-dashboard" element={<CoachDashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
