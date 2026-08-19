// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/exercises/pages/ExerciseLibraryPage.tsx
// Comprehensive Gym & Minimal Equipment Exercise Library + Custom Exercise Creator
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { MuscleGroup, EquipmentType, ExerciseDefinition } from '../../../types/fitness';

export default function ExerciseLibraryPage() {
  const { exercises, addCustomExercise } = useFitnessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'minimal' | 'gym'>('all');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);

  // Custom Exercise Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customEquipment, setCustomEquipment] = useState<EquipmentType>('Minimal / Home (Dumbbells)');
  const [customDifficulty, setCustomDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customTips, setCustomTips] = useState('');

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    // Search match
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());

    // Equipment match
    let matchesEquipment = true;
    if (equipmentFilter === 'minimal') matchesEquipment = ex.isMinimalEquipment;
    if (equipmentFilter === 'gym') matchesEquipment = !ex.isMinimalEquipment;

    // Muscle match
    let matchesMuscle = true;
    if (muscleFilter !== 'all') matchesMuscle = ex.muscleGroup === muscleFilter;

    return matchesSearch && matchesEquipment && matchesMuscle;
  });

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const instructionsArr = customInstructions
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const tipsArr = customTips
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newEx = addCustomExercise({
      name: customName.trim(),
      muscleGroup: customMuscle,
      secondaryMuscles: [],
      equipment: customEquipment,
      isMinimalEquipment: customEquipment.includes('Minimal'),
      difficulty: customDifficulty,
      instructions: instructionsArr.length > 0 ? instructionsArr : ['Perform repetition under controlled tempo.'],
      tips: tipsArr.length > 0 ? tipsArr : ['Focus on deep muscle stretch and peak contraction.'],
    });

    setIsModalOpen(false);
    setSelectedExercise(newEx);
    // Reset form
    setCustomName('');
    setCustomInstructions('');
    setCustomTips('');
  };

  const muscleCategories: MuscleGroup[] = [
    'Chest',
    'Back',
    'Shoulders',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Biceps',
    'Triceps',
    'Core',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Exercise Library & Minimal Equipment</span>
            <span style={{ fontSize: 24 }}>📚</span>
          </h1>
          <p className="page-subtitle">
            Accurate exercises available for full commercial gyms and minimal home setups
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <span>＋</span> Add Custom Exercise
        </button>
      </div>

      {/* ── Filters & Search Bar ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          {/* Search Bar */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search exercise by name, muscle, or equipment..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Equipment Category Buttons */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setEquipmentFilter('all')}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: equipmentFilter === 'all' ? 'var(--color-primary)' : 'transparent',
                color: equipmentFilter === 'all' ? '#fff' : 'var(--text-muted)',
              }}
            >
              All ({exercises.length})
            </button>
            <button
              onClick={() => setEquipmentFilter('minimal')}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: equipmentFilter === 'minimal' ? 'var(--color-cyan)' : 'transparent',
                color: equipmentFilter === 'minimal' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🏠 Minimal / Home ({exercises.filter(e => e.isMinimalEquipment).length})
            </button>
            <button
              onClick={() => setEquipmentFilter('gym')}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: equipmentFilter === 'gym' ? 'var(--color-amber)' : 'transparent',
                color: equipmentFilter === 'gym' ? '#fff' : 'var(--text-muted)',
              }}
            >
              🏋️ Full Gym ({exercises.filter(e => !e.isMinimalEquipment).length})
            </button>
          </div>
        </div>

        {/* Muscle Filter Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setMuscleFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 700,
              background: muscleFilter === 'all' ? 'rgba(255,255,255,0.15)' : 'var(--bg-card-elevated)',
              border: '1px solid var(--border-subtle)',
              color: muscleFilter === 'all' ? '#fff' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            All Muscles
          </button>
          {muscleCategories.map(m => (
            <button
              key={m}
              onClick={() => setMuscleFilter(m)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 700,
                background: muscleFilter === m ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card-elevated)',
                border: muscleFilter === m ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                color: muscleFilter === m ? '#34d399' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Exercises Grid ─────────────────────────────────────────────────── */}
      <div className="grid-3">
        {filteredExercises.map(ex => (
          <div
            key={ex.id}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span
                  className={`badge ${
                    ex.isMinimalEquipment ? 'badge-cyan' : 'badge-amber'
                  }`}
                  style={{ fontSize: 10 }}
                >
                  {ex.isMinimalEquipment ? '🏠 Minimal Equipment' : '🏋️ Commercial Gym'}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: 9 }}>{ex.difficulty}</span>
              </div>

              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {ex.name}
              </h4>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 8 }}>
                Target: {ex.muscleGroup} {ex.secondaryMuscles.length > 0 && `(+ ${ex.secondaryMuscles.join(', ')})`}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 14 }}>
                {ex.instructions[0]}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{ex.equipment}</span>
              <button
                onClick={() => setSelectedExercise(ex)}
                className="btn btn-secondary btn-sm"
              >
                View Guide →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal: Exercise Detail Guide ────────────────────────────────────── */}
      {selectedExercise && (
        <div className="modal-backdrop" onClick={() => setSelectedExercise(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: 10, marginBottom: 4 }}>
                  {selectedExercise.equipment}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                  {selectedExercise.name}
                </h3>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>
                  Step-by-Step Instructions:
                </h4>
                <ol style={{ paddingLeft: 18, fontSize: 13, color: '#fff', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedExercise.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>
                  💡 Coach Pat's Technique Tips:
                </h4>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedExercise.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedExercise(null)}
                className="btn btn-primary"
                style={{ marginTop: 8 }}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Custom Exercise Creator ──────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Create Custom Exercise</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attach custom movements to your gym routine</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Exercise Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bulgarian Split Squat on Bench"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Primary Muscle
                  </label>
                  <select value={customMuscle} onChange={e => setCustomMuscle(e.target.value as MuscleGroup)}>
                    {muscleCategories.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Equipment Type
                  </label>
                  <select value={customEquipment} onChange={e => setCustomEquipment(e.target.value as EquipmentType)}>
                    <option value="Minimal / Home (Bodyweight)">Minimal (Bodyweight)</option>
                    <option value="Minimal / Home (Dumbbells)">Minimal (Dumbbells)</option>
                    <option value="Minimal / Home (Resistance Bands)">Minimal (Resistance Bands)</option>
                    <option value="Minimal / Home (Kettlebell)">Minimal (Kettlebell)</option>
                    <option value="Gym (Barbell)">Gym (Barbell)</option>
                    <option value="Gym (Cable Machine)">Gym (Cable Machine)</option>
                    <option value="Gym (Weight Machine)">Gym (Weight Machine)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Instructions (1 step per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Step 1: Set stance&#10;Step 2: Lower slowly&#10;Step 3: Drive up"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Technique Tips
                </label>
                <textarea
                  rows={2}
                  placeholder="Keep spine straight, pause at bottom..."
                  value={customTips}
                  onChange={e => setCustomTips(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Save Custom Exercise
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
