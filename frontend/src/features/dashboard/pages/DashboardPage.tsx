// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/dashboard/pages/DashboardPage.tsx
// Comprehensive Fitness Overview & Coach Monitoring Center
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../../app/store';

export default function DashboardPage() {
  const {
    currentUser,
    foodLogs,
    waterIntakeTodayMl,
    logWater,
    workouts,
    weightLogs,
    meetups,
    openQuickAdd,
    openPaymentModal,
    openDonateModal,
    setActiveQuickAddTab,
  } = useFitnessStore();

  const navigate = useNavigate();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFoodLogs = foodLogs.filter(f => f.date === todayStr);

  const totalCaloriesToday = todayFoodLogs.reduce((sum, f) => sum + f.totalCalories, 0);
  const totalProteinToday = Number(todayFoodLogs.reduce((sum, f) => sum + f.totalProtein, 0).toFixed(1));
  const totalCarbsToday = Number(todayFoodLogs.reduce((sum, f) => sum + f.totalCarbs, 0).toFixed(1));
  const totalFatToday = Number(todayFoodLogs.reduce((sum, f) => sum + f.totalFat, 0).toFixed(1));

  // Workout Frequency this week (last 7 days)
  const workoutsThisWeek = workouts.length;
  const targetWorkouts = currentUser.targetWorkoutsPerWeek;
  const frequencyPercent = Math.min(100, Math.round((workoutsThisWeek / targetWorkouts) * 100));

  // Next Coach Pat meetup
  const nextMeetup = meetups.find(m => m.status === 'Scheduled') || meetups[0];

  // Quick log helpers
  const handleQuickLog = (tab: 'food' | 'workout' | 'weight' | 'physique') => {
    setActiveQuickAddTab(tab);
    openQuickAdd();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Welcome back, {currentUser.name.split(' ')[0]}</span>
            <span style={{ fontSize: 24 }}>🔥</span>
          </h1>
          <p className="page-subtitle">
            Phase: <strong style={{ color: 'var(--text-main)' }}>Hypertrophy & Strength</strong> • Assigned Coach: <strong style={{ color: 'var(--color-primary)' }}>{currentUser.assignedCoach}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-donate btn-sm" onClick={openDonateModal}>
            <span>💖</span> Tip Coach Pat
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/form-correction')}>
            <span>🎯</span> Form Guides
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleQuickLog('workout')}>
            <span>＋</span> Start Workout
          </button>
        </div>
      </div>

      {/* ── Bi-Weekly Meetup Reminder Banner with Coach Pat ─────────────────── */}
      {nextMeetup && (
        <div className="meetup-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                flexShrink: 0,
              }}
            >
              📅
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-rose" style={{ fontSize: 10 }}>
                  BI-WEEKLY PHYSICAL MEET-UP #5
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 700 }}>
                  Upcoming with {nextMeetup.coachName}
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 3 }}>
                Physical Assessment & Program Progression Review
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                📍 {nextMeetup.location} • ⏰ {nextMeetup.date} at {nextMeetup.time}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/coach-dashboard')}
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              View Meet-Up Agenda & InBody History →
            </button>
          </div>
        </div>
      )}

      {/* ── 4 Top KPI Stats ─────────────────────────────────────────────────── */}
      <div className="grid-4">
        {/* Stat 1: Calories */}
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-primary)' } as any}>
          <div>
            <div className="stat-label">Daily Calories</div>
            <div className="stat-value">{totalCaloriesToday} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetCalories} kcal</span></div>
            <div className="stat-sub" style={{ color: totalCaloriesToday <= currentUser.targetCalories ? '#34d399' : '#fb7185' }}>
              <span>{currentUser.targetCalories - totalCaloriesToday >= 0 ? `${currentUser.targetCalories - totalCaloriesToday} kcal remaining` : `${totalCaloriesToday - currentUser.targetCalories} kcal over target`}</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-primary-light)', '--icon-color': 'var(--color-primary)' } as any}>
            🔥
          </div>
        </div>

        {/* Stat 2: Protein */}
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-cyan)' } as any}>
          <div>
            <div className="stat-label">Protein Target</div>
            <div className="stat-value">{totalProteinToday} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetProteinG}g</span></div>
            <div className="stat-sub" style={{ color: '#38bdf8' }}>
              <span>{Math.max(0, currentUser.targetProteinG - totalProteinToday)}g to goal today</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-cyan-light)', '--icon-color': 'var(--color-cyan)' } as any}>
            🥩
          </div>
        </div>

        {/* Stat 3: Workout Consistency */}
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-amber)' } as any}>
          <div>
            <div className="stat-label">Weekly Frequency</div>
            <div className="stat-value">{workoutsThisWeek} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/ {targetWorkouts} workouts</span></div>
            <div className="stat-sub" style={{ color: '#fbbf24' }}>
              <span>8-Week Consistency Streak: 🔥 Active</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-amber-light)', '--icon-color': 'var(--color-amber)' } as any}>
            🏋️‍♂️
          </div>
        </div>

        {/* Stat 4: Body Weight */}
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-purple)' } as any}>
          <div>
            <div className="stat-label">Body Weight</div>
            <div className="stat-value">{currentUser.currentWeightKg} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>kg</span></div>
            <div className="stat-sub" style={{ color: '#c084fc' }}>
              <span>Goal: {currentUser.goalWeightKg} kg (+2.6kg lean gain)</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-purple-light)', '--icon-color': 'var(--color-purple)' } as any}>
            ⚖️
          </div>
        </div>
      </div>

      {/* ── Main Grid: Nutrition Rings & Lifting Progress ───────────────────── */}
      <div className="grid-2">
        {/* Left Column: Daily Nutrition & Macro Rings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span>🥗</span> Daily Nutrition & Macros
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/food')}>
              Detailed Food Log →
            </button>
          </div>

          {/* Macro Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
            {/* Calories Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Energy (Calories)</span>
                <span style={{ color: 'var(--text-muted)' }}>{totalCaloriesToday} / {currentUser.targetCalories} kcal</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalCaloriesToday / currentUser.targetCalories) * 100))}%`,
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
              </div>
            </div>

            {/* Protein Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>Protein</span>
                <span style={{ color: 'var(--text-muted)' }}>{totalProteinToday}g / {currentUser.targetProteinG}g ({Math.round((totalProteinToday / currentUser.targetProteinG) * 100)}%)</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalProteinToday / currentUser.targetProteinG) * 100))}%`,
                    background: 'linear-gradient(90deg, #06b6d4, #0284c7)',
                  }}
                />
              </div>
            </div>

            {/* Carbs Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>Carbohydrates</span>
                <span style={{ color: 'var(--text-muted)' }}>{totalCarbsToday}g / {currentUser.targetCarbsG}g ({Math.round((totalCarbsToday / currentUser.targetCarbsG) * 100)}%)</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalCarbsToday / currentUser.targetCarbsG) * 100))}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  }}
                />
              </div>
            </div>

            {/* Fats Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#fb7185' }}>Fats</span>
                <span style={{ color: 'var(--text-muted)' }}>{totalFatToday}g / {currentUser.targetFatG}g ({Math.round((totalFatToday / currentUser.targetFatG) * 100)}%)</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalFatToday / currentUser.targetFatG) * 100))}%`,
                    background: 'linear-gradient(90deg, #f43f5e, #e11d48)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Water Log Widget */}
          <div
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💧</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Hydration Intake</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>
                  {waterIntakeTodayMl} / {currentUser.targetWaterMl} ml
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => logWater(250)}
              >
                +250ml
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => logWater(500)}
              >
                +500ml
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Workouts & Frequency */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span>🏋️‍♂️</span> Training & Weightlifting
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/workouts')}>
              Workout History →
            </button>
          </div>

          {/* Weekly frequency bar */}
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#fbbf24' }}>
                Weekly Target: {workoutsThisWeek} of {targetWorkouts} Sessions Completed
              </span>
              <span className="badge badge-amber" style={{ fontSize: 10 }}>
                {frequencyPercent}% ON TRACK
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${frequencyPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #eab308)' }}
              />
            </div>
          </div>

          {/* Recent Workout Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workouts.slice(0, 2).map(wo => (
              <div
                key={wo.id}
                style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{wo.title}</span>
                    <span className="badge badge-emerald" style={{ fontSize: 9 }}>{wo.splitType}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    📅 {wo.date} • ⏱️ {wo.durationMinutes} min • 📊 {wo.totalVolumeKg.toLocaleString()} kg Total Volume
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/workouts')}
                >
                  View Log
                </button>
              </div>
            ))}
          </div>

          {/* Form Correction CTA */}
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>Exercise Form Correction</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Illustrated anatomy cues & dangerous mistakes</div>
              </div>
            </div>
            <button className="btn btn-cyan btn-sm" onClick={() => navigate('/form-correction')}>
              Explore Guides
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Action Shortcuts ─────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 14 }}>
          <span>⚡</span> Quick Action Loggers
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleQuickLog('food')}
            style={{ padding: '14px 16px', justifyContent: 'flex-start', gap: 12 }}
          >
            <span style={{ fontSize: 22 }}>🥗</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Log Food Meal</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Add food & calculate macros</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleQuickLog('workout')}
            style={{ padding: '14px 16px', justifyContent: 'flex-start', gap: 12 }}
          >
            <span style={{ fontSize: 22 }}>🏋️‍♂️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Log Workout Set</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Record sets, reps, and weights</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleQuickLog('weight')}
            style={{ padding: '14px 16px', justifyContent: 'flex-start', gap: 12 }}
          >
            <span style={{ fontSize: 22 }}>⚖️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Record Body Weight</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Track daily weigh-ins</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleQuickLog('physique')}
            style={{ padding: '14px 16px', justifyContent: 'flex-start', gap: 12 }}
          >
            <span style={{ fontSize: 22 }}>📸</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Physique Photo Check-in</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload front/side/back poses</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
