// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/food/pages/FoodTrackerPage.tsx
// Comprehensive Food Tracker with Macro/Micro Breakdown & Searchable/Editable Database
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { MealCategory, FoodItem } from '../../../types/fitness';

export default function FoodTrackerPage() {
  const {
    currentUser,
    foodLogs,
    foodDatabase,
    addFoodLog,
    deleteFoodLog,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    addCustomFood,
    addLogComment,
    updateLogCoachReview,
    waterIntakeTodayMl,
    logWater,
  } = useFitnessStore();

  const isCoachOrStaff = currentUser.role === 'coach' || currentUser.role === 'staff';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeModalMeal, setActiveModalMeal] = useState<MealCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);

  // Food Database Management Modal State
  const [isDbManagerOpen, setIsDbManagerOpen] = useState(false);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [editingDbFood, setEditingDbFood] = useState<FoodItem | null>(null);

  // Custom Food Form State
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customServingSize, setCustomServingSize] = useState(100);
  const [customServingUnit, setCustomServingUnit] = useState('g');
  const [customCalories, setCustomCalories] = useState(200);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCarbs, setCustomCarbs] = useState(15);
  const [customFat, setCustomFat] = useState(5);
  const [customFiber, setCustomFiber] = useState(3);

  // Active Comment Thread state
  const [activeCommentLogId, setActiveCommentLogId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [coachRemarkInput, setCoachRemarkInput] = useState<{ [logId: string]: string }>({});

  // Filter logs by selected date
  const logsForDate = foodLogs.filter(f => f.date === selectedDate);

  // Macro calculations
  const totalCalories = logsForDate.reduce((sum, f) => sum + f.totalCalories, 0);
  const totalProtein = Number(logsForDate.reduce((sum, f) => sum + f.totalProtein, 0).toFixed(1));
  const totalCarbs = Number(logsForDate.reduce((sum, f) => sum + f.totalCarbs, 0).toFixed(1));
  const totalFat = Number(logsForDate.reduce((sum, f) => sum + f.totalFat, 0).toFixed(1));
  const totalFiber = Number(logsForDate.reduce((sum, f) => sum + f.totalFiber, 0).toFixed(1));

  // Category filters
  const mealCategories: { key: MealCategory; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { key: 'lunch', label: 'Lunch', icon: '🥗' },
    { key: 'dinner', label: 'Dinner', icon: '🥩' },
    { key: 'snack', label: 'Snacks & Supplements', icon: '🍎' },
  ];

  const handleAddFoodToMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood || !activeModalMeal) return;

    addFoodLog({
      date: selectedDate,
      mealCategory: activeModalMeal,
      food: selectedFood,
      servings: Number(servings),
      totalCalories: Math.round(selectedFood.calories * servings),
      totalProtein: Number((selectedFood.protein * servings).toFixed(1)),
      totalCarbs: Number((selectedFood.carbs * servings).toFixed(1)),
      totalFat: Number((selectedFood.fat * servings).toFixed(1)),
      totalFiber: Number((selectedFood.fiber * servings).toFixed(1)),
    });

    setSelectedFood(null);
    setActiveModalMeal(null);
    setServings(1);
    setSearchQuery('');
  };

  const handleSaveDbFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    if (editingDbFood) {
      updateFoodItem(editingDbFood.id, {
        name: customName.trim(),
        brand: customBrand.trim() || 'Generic',
        servingSize: Number(customServingSize),
        servingUnit: customServingUnit,
        calories: Number(customCalories),
        protein: Number(customProtein),
        carbs: Number(customCarbs),
        fat: Number(customFat),
        fiber: Number(customFiber),
      });
      setEditingDbFood(null);
    } else {
      addFoodItem({
        name: customName.trim(),
        brand: customBrand.trim() || 'Custom / Verified',
        servingSize: Number(customServingSize),
        servingUnit: customServingUnit,
        calories: Number(customCalories),
        protein: Number(customProtein),
        carbs: Number(customCarbs),
        fat: Number(customFat),
        fiber: Number(customFiber),
      });
    }

    setIsCustomFoodModalOpen(false);
    setCustomName('');
    setCustomBrand('');
  };

  const handleOpenEditDbFood = (food: FoodItem) => {
    setEditingDbFood(food);
    setCustomName(food.name);
    setCustomBrand(food.brand || '');
    setCustomServingSize(food.servingSize);
    setCustomServingUnit(food.servingUnit);
    setCustomCalories(food.calories);
    setCustomProtein(food.protein);
    setCustomCarbs(food.carbs);
    setCustomFat(food.fat);
    setCustomFiber(food.fiber);
    setIsCustomFoodModalOpen(true);
  };

  const handleAddComment = (logId: string) => {
    if (!newCommentText.trim()) return;
    addLogComment('food', logId, newCommentText);
    setNewCommentText('');
  };

  const handleCoachTagReview = (logId: string, status: 'reviewed' | 'completed') => {
    const remark = coachRemarkInput[logId] || (status === 'completed' ? 'Verified by Coach Pat. Macros on target.' : 'Reviewed by Coach Pat.');
    updateLogCoachReview('food', logId, status, remark);
  };

  const filteredFoods = foodDatabase.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDbFoods = foodDatabase.filter(
    f =>
      f.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(dbSearchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header & Actions ─────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Food & Daily Nutrition</span>
            <span style={{ fontSize: 24 }}>🥗</span>
          </h1>
          <p className="page-subtitle">Track daily meals, adjust calorie & macro databases, and review coach remarks</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: 'auto' }}
          />

          <button className="btn btn-secondary btn-sm" onClick={() => setIsDbManagerOpen(true)}>
            <span>⚙️</span> Manage Food & Calorie Database
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingDbFood(null);
              setCustomName('');
              setCustomBrand('');
              setCustomServingSize(100);
              setCustomServingUnit('g');
              setCustomCalories(200);
              setCustomProtein(20);
              setCustomCarbs(20);
              setCustomFat(5);
              setCustomFiber(3);
              setIsCustomFoodModalOpen(true);
            }}
          >
            <span>＋</span> Create Custom Food
          </button>
        </div>
      </div>

      {/* ── Daily Macro Progress Overview ─────────────────────────────────────── */}
      <div className="card card-glow-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Daily Calorie & Macro Target Progress
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>
              {totalCalories} <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}>/ {currentUser.targetCalories} kcal</span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calorie Remaining</div>
              <strong style={{ fontSize: 18, color: currentUser.targetCalories - totalCalories >= 0 ? 'var(--color-primary)' : 'var(--color-rose)' }}>
                {currentUser.targetCalories - totalCalories} kcal
              </strong>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {/* Protein */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>🍗 Protein</span>
              <strong>{totalProtein}g / {currentUser.targetProteinG}g</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (totalProtein / currentUser.targetProteinG) * 100)}%`, background: '#38bdf8' }} />
            </div>
          </div>

          {/* Carbs */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>🍚 Carbs</span>
              <strong>{totalCarbs}g / {currentUser.targetCarbsG}g</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (totalCarbs / currentUser.targetCarbsG) * 100)}%`, background: '#fbbf24' }} />
            </div>
          </div>

          {/* Fat */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#fb7185', fontWeight: 700 }}>🥑 Fats</span>
              <strong>{totalFat}g / {currentUser.targetFatG}g</strong>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, (totalFat / currentUser.targetFatG) * 100)}%`, background: '#fb7185' }} />
            </div>
          </div>

          {/* Water */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>💧 Hydration</span>
              <strong>{(waterIntakeTodayMl / 1000).toFixed(1)}L / {(currentUser.targetWaterMl / 1000).toFixed(1)}L</strong>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
              <button onClick={() => logWater(250)} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: 11 }}>+250ml</button>
              <button onClick={() => logWater(500)} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: 11 }}>+500ml</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Meal Logs List ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mealCategories.map(cat => {
          const mealLogs = logsForDate.filter(f => f.mealCategory === cat.key);
          const mealCals = mealLogs.reduce((sum, f) => sum + f.totalCalories, 0);

          return (
            <div key={cat.key} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{cat.label}</h3>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {mealLogs.length} items logged • {mealCals} kcal
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModalMeal(cat.key);
                    setSelectedFood(null);
                    setServings(1);
                    setSearchQuery('');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  <span>＋</span> Add Food
                </button>
              </div>

              {/* Logged items */}
              {mealLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-subtle)', fontSize: 12, borderTop: '1px dashed var(--border-subtle)' }}>
                  No food items logged for {cat.label.toLowerCase()} yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  {mealLogs.map(log => (
                    <div
                      key={log.id}
                      style={{
                        background: 'var(--bg-card-elevated)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>{log.food.name}</strong>
                            {log.food.brand && <span className="badge badge-cyan" style={{ fontSize: 9 }}>{log.food.brand}</span>}
                            {log.coachStatus === 'completed' && (
                              <span className="badge badge-emerald" style={{ fontSize: 9 }}>✓ Verified by Coach Pat</span>
                            )}
                            {log.coachStatus === 'reviewed' && (
                              <span className="badge badge-rose" style={{ fontSize: 9 }}>Reviewed by Coach</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            {log.servings} × {log.food.servingSize}{log.food.servingUnit} • Logged at {log.loggedAt}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 15 }}>
                              {log.totalCalories} kcal
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                              {log.totalProtein}g P | {log.totalCarbs}g C | {log.totalFat}g F
                            </div>
                          </div>

                          <button
                            onClick={() => deleteFoodLog(log.id)}
                            className="btn-icon"
                            style={{ width: 28, height: 28, color: 'var(--color-rose)', fontSize: 13 }}
                            title="Delete log entry"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Coach Pat Remarks */}
                      {log.coachRemarks && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(244, 63, 94, 0.12)',
                            borderLeft: '3px solid var(--color-rose)',
                            fontSize: 12,
                            color: '#fda4af',
                          }}
                        >
                          <strong>Coach Pat Remark:</strong> {log.coachRemarks}
                        </div>
                      )}

                      {/* Coach Action Buttons for Coach/Staff */}
                      {isCoachOrStaff && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, borderTop: '1px dashed var(--border-subtle)', paddingTop: 8 }}>
                          <input
                            type="text"
                            placeholder="Add Coach remark (e.g. Great protein pacing)..."
                            value={coachRemarkInput[log.id] || ''}
                            onChange={e => setCoachRemarkInput({ ...coachRemarkInput, [log.id]: e.target.value })}
                            style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                          />
                          <button
                            onClick={() => handleCoachTagReview(log.id, 'reviewed')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 10, padding: '4px 8px' }}
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleCoachTagReview(log.id, 'completed')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 10, padding: '4px 8px' }}
                          >
                            ✓ Tag Completed
                          </button>
                        </div>
                      )}

                      {/* Comments Thread */}
                      {log.comments && log.comments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingLeft: 10, borderLeft: '2px solid var(--border-medium)' }}>
                          {log.comments.map(c => (
                            <div key={c.id} style={{ fontSize: 11 }}>
                              <strong style={{ color: c.authorRole === 'coach' ? 'var(--color-rose)' : 'var(--color-primary)' }}>
                                {c.authorName}:
                              </strong>{' '}
                              <span style={{ color: 'var(--text-muted)' }}>{c.text}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-subtle)', marginLeft: 6 }}>({c.createdAt})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment trigger */}
                      <div style={{ marginTop: 8 }}>
                        {activeCommentLogId === log.id ? (
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <input
                              type="text"
                              placeholder="Write a comment / question..."
                              value={newCommentText}
                              onChange={e => setNewCommentText(e.target.value)}
                              style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                handleAddComment(log.id);
                                setActiveCommentLogId(null);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              Post
                            </button>
                            <button
                              onClick={() => setActiveCommentLogId(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveCommentLogId(log.id);
                              setNewCommentText('');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                          >
                            💬 Comment on meal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal: Add Food to Log ────────────────────────────────────────────── */}
      {activeModalMeal && (
        <div className="modal-backdrop" onClick={() => setActiveModalMeal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, textTransform: 'capitalize' }}>
                Add to {activeModalMeal}
              </h3>
              <button onClick={() => setActiveModalMeal(null)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <form onSubmit={handleAddFoodToMeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <input
                  type="text"
                  placeholder="Search food database (e.g. Chicken, Whey, Rice)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Food List Selection */}
              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredFoods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedFood?.id === food.id ? 'var(--color-primary-light)' : 'var(--bg-card-elevated)',
                      border: selectedFood?.id === food.id ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{food.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {food.servingSize}{food.servingUnit} • {food.protein}g P | {food.carbs}g C | {food.fat}g F
                      </div>
                    </div>
                    <strong style={{ fontSize: 14, color: 'var(--color-primary)' }}>{food.calories} kcal</strong>
                  </div>
                ))}
              </div>

              {selectedFood && (
                <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Selected: {selectedFood.name}</strong>
                    <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 700 }}>
                      {Math.round(selectedFood.calories * servings)} kcal Total
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Servings:</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={servings}
                      onChange={e => setServings(parseFloat(e.target.value) || 1)}
                      style={{ width: 80 }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      = {Math.round(selectedFood.servingSize * servings)}{selectedFood.servingUnit}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setActiveModalMeal(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={!selectedFood} className="btn btn-primary" style={{ flex: 2 }}>
                  Log Food to {activeModalMeal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Manage Master Food & Calorie Database (Edit/Delete/Add) ───── */}
      {isDbManagerOpen && (
        <div className="modal-backdrop" onClick={() => setIsDbManagerOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 840, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>
                  <span>⚙️</span> Food & Calorie Database Manager
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Admin & user database control — Edit food macro values, adjust calorie counts, or delete items
                </p>
              </div>
              <button onClick={() => setIsDbManagerOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <input
                type="text"
                placeholder="Search food database to edit or delete..."
                value={dbSearchQuery}
                onChange={e => setDbSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => {
                  setEditingDbFood(null);
                  setCustomName('');
                  setCustomBrand('');
                  setCustomServingSize(100);
                  setCustomServingUnit('g');
                  setCustomCalories(200);
                  setCustomProtein(20);
                  setCustomCarbs(20);
                  setCustomFat(5);
                  setCustomFiber(3);
                  setIsCustomFoodModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <span>＋</span> Add New Master Food
              </button>
            </div>

            {/* Foods Table */}
            <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-elevated)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 10 }}>Food Name</th>
                    <th style={{ padding: 10 }}>Serving</th>
                    <th style={{ padding: 10 }}>Calories</th>
                    <th style={{ padding: 10 }}>Macros (P/C/F)</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDbFoods.map(food => (
                    <tr key={food.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <strong>{food.name}</strong>
                        {food.brand && <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{food.brand}</div>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{food.servingSize} {food.servingUnit}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {food.calories} kcal
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11 }}>
                        <span style={{ color: '#38bdf8' }}>{food.protein}g P</span> |{' '}
                        <span style={{ color: '#fbbf24' }}>{food.carbs}g C</span> |{' '}
                        <span style={{ color: '#fb7185' }}>{food.fat}g F</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditDbFood(food)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            title="Edit calories and macros"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${food.name} from the database?`)) {
                                deleteFoodItem(food.id);
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px', color: 'var(--color-rose)' }}
                            title="Delete food from database"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setIsDbManagerOpen(false)} className="btn btn-secondary">
                Close Database Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Create / Edit Custom Food ─────────────────────────────────── */}
      {isCustomFoodModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCustomFoodModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {editingDbFood ? `Edit ${editingDbFood.name}` : 'Create New Food Item'}
              </h3>
              <button onClick={() => setIsCustomFoodModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <form onSubmit={handleSaveDbFood} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Grass-Fed Ribeye Steak"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Brand / Producer
                  </label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={e => setCustomBrand(e.target.value)}
                    placeholder="e.g. Butcher's Choice"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Serving Size
                  </label>
                  <input
                    type="number"
                    value={customServingSize}
                    onChange={e => setCustomServingSize(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Serving Unit
                  </label>
                  <input
                    type="text"
                    value={customServingUnit}
                    onChange={e => setCustomServingUnit(e.target.value)}
                    placeholder="g, ml, oz, scoop"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-primary)', display: 'block', marginBottom: 2 }}>
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={e => setCustomCalories(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#38bdf8', display: 'block', marginBottom: 2 }}>
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customProtein}
                    onChange={e => setCustomProtein(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#fbbf24', display: 'block', marginBottom: 2 }}>
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#fb7185', display: 'block', marginBottom: 2 }}>
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customFat}
                    onChange={e => setCustomFat(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsCustomFoodModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingDbFood ? 'Save Food Changes' : 'Add Food to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
