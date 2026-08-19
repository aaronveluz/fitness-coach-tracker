// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/workouts/pages/WeightliftingPage.tsx
// Weightlifting Tracker with Sets/Reps/Weights, 1RM Calculator, and Rest Timer
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { SplitType, WeightliftingSet } from '../../../types/fitness';

export default function WeightliftingPage() {
  const {
    workouts,
    exercises,
    addWorkout,
    deleteWorkout,
    restTimerSeconds,
    isRestTimerRunning,
    startRestTimer,
    pauseRestTimer,
    resetRestTimer,
  } = useFitnessStore();

  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState(100);
  const [calcReps, setCalcReps] = useState(5);

  // New Workout Session Form State
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Push Power & Hypertrophy');
  const [splitType, setSplitType] = useState<SplitType>('Push');
  const [sessionDuration, setSessionDuration] = useState(65);
  const [sessionEnergy, setSessionEnergy] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [sessionNotes, setSessionNotes] = useState('');

  // Active exercises in the workout
  const [activeExercises, setActiveExercises] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      targetMuscle: string;
      sets: WeightliftingSet[];
    }>
  >([
    {
      exerciseId: 'ex_bench',
      exerciseName: 'Barbell Flat Bench Press',
      targetMuscle: 'Chest',
      sets: [
        { setNumber: 1, weightKg: 70, reps: 10, rpe: 7, completed: true },
        { setNumber: 2, weightKg: 85, reps: 8, rpe: 8, completed: true },
        { setNumber: 3, weightKg: 95, reps: 5, rpe: 9, completed: true, isPR: true },
      ],
    },
  ]);

  // Selected exercise to add to workout
  const [selectedExId, setSelectedExId] = useState(exercises[0]?.id || 'ex_squat');

  // Compute 1RM with Epley formula
  const calculated1RM = Math.round(calcWeight * (1 + calcReps / 30));

  // Rest Timer Formatter
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddExerciseToSession = () => {
    const ex = exercises.find(e => e.id === selectedExId) || exercises[0];
    setActiveExercises([
      ...activeExercises,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.muscleGroup,
        sets: [{ setNumber: 1, weightKg: 60, reps: 10, rpe: 8, completed: true }],
      },
    ]);
  };

  const handleAddSetToExercise = (exIndex: number) => {
    const updated = [...activeExercises];
    const targetEx = updated[exIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1];
    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 60,
      reps: lastSet ? lastSet.reps : 10,
      rpe: 8,
      completed: true,
    });
    setActiveExercises(updated);
  };

  const handleUpdateSet = (exIndex: number, setIndex: number, field: keyof WeightliftingSet, val: any) => {
    const updated = [...activeExercises];
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      [field]: val,
    };
    setActiveExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...activeExercises];
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
    // renumber
    updated[exIndex].sets.forEach((s, i) => (s.setNumber = i + 1));
    setActiveExercises(updated);
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();

    let totalVol = 0;
    let totalSets = 0;
    let totalReps = 0;

    activeExercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          totalVol += s.weightKg * s.reps;
          totalSets += 1;
          totalReps += s.reps;
        }
      });
    });

    addWorkout({
      date: new Date().toISOString().slice(0, 10),
      title: sessionTitle,
      splitType,
      durationMinutes: sessionDuration,
      energyLevel: sessionEnergy,
      completed: true,
      totalVolumeKg: totalVol,
      totalSets,
      totalReps,
      exercises: activeExercises,
      notes: sessionNotes || 'Workout logged successfully.',
    });

    setIsCreatingWorkout(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Weightlifting & Workout Tracker</span>
            <span style={{ fontSize: 24 }}>🏋️‍♂️</span>
          </h1>
          <p className="page-subtitle">Log exercises, sets, reps, estimated 1RM, and total volume load</p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsCreatingWorkout(true)}
        >
          <span>＋</span> Log New Workout Session
        </button>
      </div>

      {/* ── Top Grid: Rest Timer & 1RM Calculator ───────────────────────────── */}
      <div className="grid-2">
        {/* Widget 1: Integrated Rest Timer */}
        <div className="card card-glow-emerald">
          <div className="card-header">
            <h3 className="card-title">
              <span>⏱️</span> Gym Rest Countdown Timer
            </h3>
            <span className="badge badge-emerald">AUDIO/VISUAL READY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
            <div className="rest-timer-digits" style={{ fontSize: 44, marginBottom: 8 }}>
              {formatTimer(restTimerSeconds)}
            </div>

            {/* Quick Timer Preset Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[45, 60, 90, 120, 180].map(seconds => (
                <button
                  key={seconds}
                  onClick={() => startRestTimer(seconds)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  {seconds}s
                </button>
              ))}
            </div>

            {/* Control buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={pauseRestTimer}
                className="btn btn-primary btn-sm"
                disabled={restTimerSeconds === 0}
              >
                {isRestTimerRunning ? '⏸ Pause Timer' : '▶ Resume Timer'}
              </button>
              <button
                onClick={resetRestTimer}
                className="btn btn-secondary btn-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Widget 2: 1RM Auto-Calculator */}
        <div className="card card-glow-cyan">
          <div className="card-header">
            <h3 className="card-title">
              <span>🔢</span> 1RM (One Rep Max) Calculator
            </h3>
            <span className="badge badge-cyan">EPLEY FORMULA</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                Weight Lifted (kg)
              </label>
              <input
                type="number"
                value={calcWeight}
                onChange={e => setCalcWeight(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                Reps Performed
              </label>
              <input
                type="number"
                value={calcReps}
                onChange={e => setCalcReps(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* 1RM Result Banner */}
          <div
            style={{
              background: 'var(--bg-card-elevated)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700 }}>Estimated 1RM Max:</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>
              {calculated1RM} kg
            </span>
          </div>

          {/* Percentage breakdown table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center', fontSize: 11 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)' }}>90% (3 reps)</div>
              <div style={{ fontWeight: 800, color: '#fff' }}>{Math.round(calculated1RM * 0.9)} kg</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)' }}>80% (7 reps)</div>
              <div style={{ fontWeight: 800, color: '#fff' }}>{Math.round(calculated1RM * 0.8)} kg</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)' }}>70% (10 reps)</div>
              <div style={{ fontWeight: 800, color: '#fff' }}>{Math.round(calculated1RM * 0.7)} kg</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)' }}>60% (15 reps)</div>
              <div style={{ fontWeight: 800, color: '#fff' }}>{Math.round(calculated1RM * 0.6)} kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Workout Logging Modal / Panel ────────────────────────────── */}
      {isCreatingWorkout && (
        <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title">
              <span>📝</span> Record Workout Session
            </h3>
            <button onClick={() => setIsCreatingWorkout(false)} className="btn-icon">✕</button>
          </div>

          <form onSubmit={handleSaveWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Session Title
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={e => setSessionTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Split Type
                </label>
                <select value={splitType} onChange={e => setSplitType(e.target.value as SplitType)}>
                  <option value="Push">Push (Chest / Shoulders / Triceps)</option>
                  <option value="Pull">Pull (Back / Biceps)</option>
                  <option value="Legs">Legs (Quads / Hamstrings / Calves)</option>
                  <option value="Upper Body">Upper Body</option>
                  <option value="Lower Body">Lower Body</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Core & Cardio">Core & Cardio</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionDuration}
                  onChange={e => setSessionDuration(parseInt(e.target.value) || 45)}
                />
              </div>
            </div>

            {/* Exercises List in Session */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeExercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  style={{
                    background: 'var(--bg-card-elevated)',
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>
                      {exIdx + 1}. {ex.exerciseName}
                      <span className="badge badge-cyan" style={{ marginLeft: 8, fontSize: 10 }}>{ex.targetMuscle}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSetToExercise(exIdx)}
                      className="btn btn-secondary btn-sm"
                    >
                      ＋ Add Set
                    </button>
                  </div>

                  {/* Sets Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ex.sets.map((set, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 1fr 1fr 40px',
                          gap: 8,
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
                          #{set.setNumber}
                        </span>

                        <div>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="kg"
                            value={set.weightKg}
                            onChange={e => handleUpdateSet(exIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                            style={{ padding: '6px 8px' }}
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            placeholder="reps"
                            value={set.reps}
                            onChange={e => handleUpdateSet(exIdx, sIdx, 'reps', parseInt(e.target.value) || 1)}
                            style={{ padding: '6px 8px' }}
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="RPE (1-10)"
                            value={set.rpe || 8}
                            onChange={e => handleUpdateSet(exIdx, sIdx, 'rpe', parseFloat(e.target.value) || 8)}
                            style={{ padding: '6px 8px' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exIdx, sIdx)}
                          style={{ color: 'var(--color-danger)', fontSize: 14, cursor: 'pointer', textAlign: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add another exercise row */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select
                value={selectedExId}
                onChange={e => setSelectedExId(e.target.value)}
                style={{ flex: 1 }}
              >
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.muscleGroup})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddExerciseToSession}
                className="btn btn-secondary"
              >
                ＋ Add Exercise to Workout
              </button>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Session Reflection & Notes
              </label>
              <textarea
                rows={2}
                placeholder="RPE highlights, pump quality, personal records..."
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Save & Complete Workout Session
              </button>
              <button type="button" onClick={() => setIsCreatingWorkout(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Workout History Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="card-title">
          <span>📊</span> Workout Session History
        </h3>

        {workouts.map(wo => (
          <div key={wo.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{wo.title}</h4>
                  <span className="badge badge-emerald">{wo.splitType}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  📅 {wo.date} • ⏱️ {wo.durationMinutes} min • ⚡ Energy: {'★'.repeat(wo.energyLevel)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Volume Load</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>
                    {wo.totalVolumeKg.toLocaleString()} kg
                  </div>
                </div>

                <button
                  onClick={() => deleteWorkout(wo.id)}
                  style={{ color: 'var(--text-subtle)', fontSize: 14, cursor: 'pointer', padding: 6 }}
                  title="Delete workout log"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Exercises breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 12 }}>
              {wo.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card-elevated)',
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#fff' }}>{ex.exerciseName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{ex.targetMuscle}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {ex.sets.map((s, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>Set {s.setNumber}:</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {s.weightKg} kg × {s.reps} reps {s.isPR && <span className="badge badge-amber" style={{ fontSize: 8, padding: '1px 4px' }}>PR 🏆</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {wo.notes && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Notes: </strong>{wo.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
