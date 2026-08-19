// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/components/QuickAddModal.tsx
// Unified Quick Logging Modal for Food, Workouts, Body Weight, and Physique
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../app/store';
import type { MealCategory, SplitType } from '../../types/fitness';

export function QuickAddModal() {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    activeQuickAddTab,
    setActiveQuickAddTab,
    foodDatabase,
    addFoodLog,
    addWeightLog,
    addWorkout,
    addPhysiqueLog,
    currentUser,
    exercises,
  } = useFitnessStore();

  // ── Food State ──────────────────────────────────────────────────────────────
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>('lunch');
  const [selectedFoodId, setSelectedFoodId] = useState(foodDatabase[0]?.id || '');
  const [servings, setServings] = useState(1);
  const [foodSearch, setFoodSearch] = useState('');

  // ── Weight State ────────────────────────────────────────────────────────────
  const [weightValue, setWeightValue] = useState(currentUser.currentWeightKg.toString());
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [weightNote, setWeightNote] = useState('');

  // ── Workout State ───────────────────────────────────────────────────────────
  const [workoutTitle, setWorkoutTitle] = useState('Strength Session');
  const [splitType, setSplitType] = useState<SplitType>('Push');
  const [duration, setDuration] = useState(60);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [workoutExId, setWorkoutExId] = useState(exercises[0]?.id || 'ex_bench');
  const [workoutWeight, setWorkoutWeight] = useState(80);
  const [workoutReps, setWorkoutReps] = useState(8);
  const [workoutSetsCount, setWorkoutSetsCount] = useState(4);

  // ── Physique State ──────────────────────────────────────────────────────────
  const [physiqueWeight, setPhysiqueWeight] = useState(currentUser.currentWeightKg);
  const [bodyFat, setBodyFat] = useState(15.2);
  const [chestCm, setChestCm] = useState(104);
  const [waistCm, setWaistCm] = useState(83);
  const [armsCm, setArmsCm] = useState(36.5);
  const [physiqueNotes, setPhysiqueNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80');

  const [toastMessage, setToastMessage] = useState('');

  if (!isQuickAddOpen) return null;

  const showSuccessToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
      closeQuickAdd();
    }, 1200);
  };

  // Submit Food
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    const foodItem = foodDatabase.find(f => f.id === selectedFoodId) || foodDatabase[0];
    if (!foodItem) return;

    addFoodLog({
      date: new Date().toISOString().slice(0, 10),
      mealCategory: selectedMeal,
      food: foodItem,
      servings: Number(servings),
      totalCalories: Math.round(foodItem.calories * servings),
      totalProtein: Number((foodItem.protein * servings).toFixed(1)),
      totalCarbs: Number((foodItem.carbs * servings).toFixed(1)),
      totalFat: Number((foodItem.fat * servings).toFixed(1)),
      totalFiber: Number((foodItem.fiber * servings).toFixed(1)),
    });

    showSuccessToast(`Logged ${servings}x ${foodItem.name}!`);
  };

  // Submit Weight
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const numWeight = parseFloat(weightValue);
    if (isNaN(numWeight) || numWeight <= 0) return;

    addWeightLog({
      date: new Date().toISOString().slice(0, 10),
      weightKg: numWeight,
      timeOfDay,
      notes: weightNote || undefined,
    });

    showSuccessToast(`Logged weight: ${numWeight} kg!`);
  };

  // Submit Workout
  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const exObj = exercises.find(ex => ex.id === workoutExId) || exercises[0];
    const sets = Array.from({ length: workoutSetsCount }, (_, i) => ({
      setNumber: i + 1,
      weightKg: workoutWeight,
      reps: workoutReps,
      rpe: 8,
      completed: true,
    }));

    const totalVol = workoutWeight * workoutReps * workoutSetsCount;

    addWorkout({
      date: new Date().toISOString().slice(0, 10),
      title: workoutTitle,
      splitType,
      durationMinutes: duration,
      energyLevel,
      completed: true,
      totalVolumeKg: totalVol,
      totalSets: workoutSetsCount,
      totalReps: workoutReps * workoutSetsCount,
      exercises: [
        {
          exerciseId: exObj.id,
          exerciseName: exObj.name,
          targetMuscle: exObj.muscleGroup,
          sets,
        },
      ],
      notes: 'Quick logged workout session.',
    });

    showSuccessToast(`Logged workout: ${workoutTitle}!`);
  };

  // Submit Physique
  const handleAddPhysique = (e: React.FormEvent) => {
    e.preventDefault();
    addPhysiqueLog({
      date: new Date().toISOString().slice(0, 10),
      frontPhoto: photoUrl,
      sidePhoto: photoUrl,
      backPhoto: photoUrl,
      weightKg: physiqueWeight,
      bodyFatPercent: bodyFat,
      measurements: {
        chestCm,
        waistCm,
        hipsCm: 97,
        leftArmCm: armsCm,
        rightArmCm: armsCm,
        leftThighCm: 58.5,
        rightThighCm: 58.5,
      },
      notes: physiqueNotes || 'Weekly progress update check-in.',
      reviewedByCoach: false,
    });

    showSuccessToast('Physique check-in saved!');
  };

  const filteredFoods = foodDatabase.filter(f =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
    (f.brand && f.brand.toLowerCase().includes(foodSearch.toLowerCase()))
  );

  return (
    <div className="modal-backdrop" onClick={closeQuickAdd}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              ＋
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Quick Log Entry</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fast record your daily fitness metrics</p>
            </div>
          </div>
          <button
            onClick={closeQuickAdd}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card-elevated)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            gap: 4,
          }}
        >
          <button
            onClick={() => setActiveQuickAddTab('food')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              color: activeQuickAddTab === 'food' ? '#fff' : 'var(--text-muted)',
              background: activeQuickAddTab === 'food' ? 'var(--color-primary)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            🥗 Food
          </button>
          <button
            onClick={() => setActiveQuickAddTab('workout')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              color: activeQuickAddTab === 'workout' ? '#fff' : 'var(--text-muted)',
              background: activeQuickAddTab === 'workout' ? 'var(--color-cyan)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            🏋️ Workout
          </button>
          <button
            onClick={() => setActiveQuickAddTab('weight')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              color: activeQuickAddTab === 'weight' ? '#fff' : 'var(--text-muted)',
              background: activeQuickAddTab === 'weight' ? 'var(--color-amber)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            ⚖️ Weight
          </button>
          <button
            onClick={() => setActiveQuickAddTab('physique')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 700,
              color: activeQuickAddTab === 'physique' ? '#fff' : 'var(--text-muted)',
              background: activeQuickAddTab === 'physique' ? 'var(--color-purple)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            📸 Photo
          </button>
        </div>

        {/* Tab 1: Food Log */}
        {activeQuickAddTab === 'food' && (
          <form onSubmit={handleAddFood} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Meal Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map(meal => (
                  <button
                    type="button"
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background: selectedMeal === meal ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card-elevated)',
                      border: selectedMeal === meal ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      color: selectedMeal === meal ? '#34d399' : 'var(--text-muted)',
                    }}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Select Food Item
              </label>
              <input
                type="text"
                placeholder="Search food item..."
                value={foodSearch}
                onChange={e => setFoodSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <select
                value={selectedFoodId}
                onChange={e => setSelectedFoodId(e.target.value)}
                style={{ width: '100%' }}
              >
                {filteredFoods.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.calories} kcal | P: {f.protein}g, C: {f.carbs}g, F: {f.fat}g per {f.servingSize}{f.servingUnit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Servings ({foodDatabase.find(f => f.id === selectedFoodId)?.servingSize || 100} {foodDatabase.find(f => f.id === selectedFoodId)?.servingUnit || 'g'} each)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                value={servings}
                onChange={e => setServings(parseFloat(e.target.value) || 1)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
              Log Meal Entry
            </button>
          </form>
        )}

        {/* Tab 2: Workout Log */}
        {activeQuickAddTab === 'workout' && (
          <form onSubmit={handleAddWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Workout Split
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
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Exercise Lift
              </label>
              <select value={workoutExId} onChange={e => setWorkoutExId(e.target.value)}>
                {exercises.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.equipment})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={workoutWeight}
                  onChange={e => setWorkoutWeight(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Reps
                </label>
                <input
                  type="number"
                  value={workoutReps}
                  onChange={e => setWorkoutReps(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Sets
                </label>
                <input
                  type="number"
                  value={workoutSetsCount}
                  onChange={e => setWorkoutSetsCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-cyan" style={{ marginTop: 8 }}>
              Record Workout Session
            </button>
          </form>
        )}

        {/* Tab 3: Body Weight */}
        {activeQuickAddTab === 'weight' && (
          <form onSubmit={handleAddWeight} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightValue}
                onChange={e => setWeightValue(e.target.value)}
                required
                style={{ fontSize: 20, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Weigh-in Time
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setTimeOfDay('morning')}
                  style={{
                    padding: '10px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 600,
                    background: timeOfDay === 'morning' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card-elevated)',
                    border: timeOfDay === 'morning' ? '1px solid var(--color-amber)' : '1px solid var(--border-subtle)',
                    color: timeOfDay === 'morning' ? '#fbbf24' : 'var(--text-muted)',
                  }}
                >
                  🌅 Morning Fasted
                </button>
                <button
                  type="button"
                  onClick={() => setTimeOfDay('evening')}
                  style={{
                    padding: '10px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 600,
                    background: timeOfDay === 'evening' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card-elevated)',
                    border: timeOfDay === 'evening' ? '1px solid var(--color-amber)' : '1px solid var(--border-subtle)',
                    color: timeOfDay === 'evening' ? '#fbbf24' : 'var(--text-muted)',
                  }}
                >
                  🌙 Evening
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Post-carb day, well hydrated"
                value={weightNote}
                onChange={e => setWeightNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-amber" style={{ marginTop: 8 }}>
              Save Weight Entry
            </button>
          </form>
        )}

        {/* Tab 4: Physique Progress */}
        {activeQuickAddTab === 'physique' && (
          <form onSubmit={handleAddPhysique} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={physiqueWeight}
                  onChange={e => setPhysiqueWeight(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Est. Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={e => setBodyFat(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Chest (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={chestCm}
                  onChange={e => setChestCm(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Waist (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={e => setWaistCm(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Arms (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={armsCm}
                  onChange={e => setArmsCm(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Photo URL / Sample Preset
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Progress Notes
              </label>
              <textarea
                rows={2}
                placeholder="How do you feel? Energy, vascularity, pumps..."
                value={physiqueNotes}
                onChange={e => setPhysiqueNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn" style={{ background: 'var(--color-purple)', color: '#fff', marginTop: 8 }}>
              Save Physique Log
            </button>
          </form>
        )}

        {/* Toast confirmation */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              background: '#10b981',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 14,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.6)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            ✓ {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
