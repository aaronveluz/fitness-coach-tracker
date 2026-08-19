// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/food/pages/FoodTrackerPage.tsx
// Comprehensive Food Tracker with Macro/Micro Breakdown & Searchable Database
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
    addCustomFood,
    waterIntakeTodayMl,
    logWater,
  } = useFitnessStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeModalMeal, setActiveModalMeal] = useState<MealCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);

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

  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood = addCustomFood({
      name: customName.trim(),
      brand: customBrand.trim() || 'Custom',
      servingSize: Number(customServingSize),
      servingUnit: customServingUnit,
      calories: Number(customCalories),
      protein: Number(customProtein),
      carbs: Number(customCarbs),
      fat: Number(customFat),
      fiber: Number(customFiber),
    });

    setIsCustomFoodModalOpen(false);
    setSelectedFood(newFood);
    // Reset form
    setCustomName('');
    setCustomBrand('');
  };

  const filteredFoods = foodDatabase.filter(
    f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Header & Date Bar ────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Food & Daily Nutrition</span>
            <span style={{ fontSize: 24 }}>🥗</span>
          </h1>
          <p className="page-subtitle">Track meals, macronutrient distribution, and hydration</p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, padding: 0, width: 'auto' }}
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '4px 8px' }}
          >
            Today
          </button>
        </div>
      </div>

      {/* ── Macro Summary Card with Dynamic Gauges ──────────────────────────── */}
      <div className="card card-glow-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="card-title">
            <span>⚡</span> Daily Macronutrient Breakdown
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsCustomFoodModalOpen(true)}>
              <span>＋</span> Custom Food Creator
            </button>
          </div>
        </div>

        {/* 4 Big Macro Pill Badges */}
        <div className="grid-4" style={{ marginBottom: 18 }}>
          {/* Calories */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calories</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
              {totalCalories} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetCalories} kcal</span>
            </div>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.round((totalCalories / currentUser.targetCalories) * 100))}%`, background: '#10b981' }}
              />
            </div>
          </div>

          {/* Protein */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: '#38bdf8' }}>Protein (4 kcal/g)</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
              {totalProtein}g <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetProteinG}g</span>
            </div>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.round((totalProtein / currentUser.targetProteinG) * 100))}%`, background: '#06b6d4' }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: '#fbbf24' }}>Carbs (4 kcal/g)</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>
              {totalCarbs}g <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetCarbsG}g</span>
            </div>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.round((totalCarbs / currentUser.targetCarbsG) * 100))}%`, background: '#f59e0b' }}
              />
            </div>
          </div>

          {/* Fat */}
          <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: '#fb7185' }}>Fats (9 kcal/g)</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#fb7185', marginTop: 2 }}>
              {totalFat}g <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/ {currentUser.targetFatG}g</span>
            </div>
            <div className="progress-bar-track" style={{ marginTop: 8 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.round((totalFat / currentUser.targetFatG) * 100))}%`, background: '#f43f5e' }}
              />
            </div>
          </div>
        </div>

        {/* Micronutrients row */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          <div>🌾 Fiber: <strong style={{ color: '#fff' }}>{totalFiber}g</strong> / {currentUser.targetFiberG}g</div>
          <div>💧 Water: <strong style={{ color: '#38bdf8' }}>{waterIntakeTodayMl} ml</strong> / {currentUser.targetWaterMl} ml</div>
          <div>🧂 Sodium: <strong style={{ color: '#fff' }}>~1,840 mg</strong></div>
          <div>🍌 Potassium: <strong style={{ color: '#fff' }}>~2,950 mg</strong></div>
        </div>
      </div>

      {/* ── Meal Categories Logs ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mealCategories.map(cat => {
          const catLogs = logsForDate.filter(f => f.mealCategory === cat.key);
          const catCalories = catLogs.reduce((sum, f) => sum + f.totalCalories, 0);
          const catProtein = catLogs.reduce((sum, f) => sum + f.totalProtein, 0).toFixed(1);
          const catCarbs = catLogs.reduce((sum, f) => sum + f.totalCarbs, 0).toFixed(1);
          const catFat = catLogs.reduce((sum, f) => sum + f.totalFat, 0).toFixed(1);

          return (
            <div key={cat.key} className="card">
              {/* Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{cat.label}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {catCalories} kcal • P: {catProtein}g • C: {catCarbs}g • F: {catFat}g
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setActiveModalMeal(cat.key);
                    setSelectedFood(null);
                    setSearchQuery('');
                  }}
                >
                  <span>＋</span> Add Food
                </button>
              </div>

              {/* Logged items list */}
              {catLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {catLogs.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>
                          {item.food.name}
                          {item.food.brand && item.food.brand !== 'Generic' && (
                            <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>
                              ({item.food.brand})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.servings} serving ({item.food.servingSize * item.servings} {item.food.servingUnit}) •{' '}
                          <span style={{ color: '#38bdf8' }}>P: {item.totalProtein}g</span> •{' '}
                          <span style={{ color: '#fbbf24' }}>C: {item.totalCarbs}g</span> •{' '}
                          <span style={{ color: '#fb7185' }}>F: {item.totalFat}g</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, color: 'var(--color-primary)' }}>
                          {item.totalCalories} kcal
                        </span>
                        <button
                          onClick={() => deleteFoodLog(item.id)}
                          style={{ color: 'var(--color-danger)', fontSize: 14, padding: 4, cursor: 'pointer' }}
                          title="Delete food entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
                  No items logged for {cat.label.toLowerCase()} yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Modal: Add Food from Database ────────────────────────────────────── */}
      {activeModalMeal && (
        <div className="modal-backdrop" onClick={() => setActiveModalMeal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                  Add to {activeModalMeal.toUpperCase()}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choose from 40+ verified fitness food items or search</p>
              </div>
              <button onClick={() => setActiveModalMeal(null)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            {/* Search input */}
            <input
              type="text"
              placeholder="Search chicken breast, oats, whey, salmon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ marginBottom: 14 }}
              autoFocus
            />

            {!selectedFood ? (
              /* Search Results List */
              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredFoods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{food.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Per {food.servingSize} {food.servingUnit} • P: {food.protein}g, C: {food.carbs}g, F: {food.fat}g
                      </div>
                    </div>

                    <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)' }}>
                      {food.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Servings Configuration */
              <form onSubmit={handleAddFoodToMeal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{selectedFood.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Base Serving: {selectedFood.servingSize} {selectedFood.servingUnit} ({selectedFood.calories} kcal)
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                    Number of Servings (e.g. 1.5 = {selectedFood.servingSize * (servings || 1)} {selectedFood.servingUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={servings}
                    onChange={e => setServings(parseFloat(e.target.value) || 1)}
                    required
                    style={{ fontSize: 18, fontWeight: 800 }}
                  />
                </div>

                {/* Macro calculated breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Calories</div>
                    <div style={{ fontWeight: 800, color: '#10b981' }}>{Math.round(selectedFood.calories * servings)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#38bdf8' }}>Protein</div>
                    <div style={{ fontWeight: 800, color: '#38bdf8' }}>{(selectedFood.protein * servings).toFixed(1)}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#fbbf24' }}>Carbs</div>
                    <div style={{ fontWeight: 800, color: '#fbbf24' }}>{(selectedFood.carbs * servings).toFixed(1)}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#fb7185' }}>Fat</div>
                    <div style={{ fontWeight: 800, color: '#fb7185' }}>{(selectedFood.fat * servings).toFixed(1)}g</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Add to {activeModalMeal}
                  </button>
                  <button type="button" onClick={() => setSelectedFood(null)} className="btn btn-secondary">
                    Back to List
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Custom Food Creator ───────────────────────────────────────── */}
      {isCustomFoodModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCustomFoodModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Create Custom Food Item</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add custom items to your personal nutritional library</p>
              </div>
              <button onClick={() => setIsCustomFoodModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Food Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Homemade Protein Shake"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Serving Size
                  </label>
                  <input
                    type="number"
                    value={customServingSize}
                    onChange={e => setCustomServingSize(parseFloat(e.target.value) || 100)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={customServingUnit}
                    onChange={e => setCustomServingUnit(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Calories
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={e => setCustomCalories(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 4, display: 'block' }}>
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={e => setCustomProtein(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', marginBottom: 4, display: 'block' }}>
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={e => setCustomCarbs(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#fb7185', marginBottom: 4, display: 'block' }}>
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={e => setCustomFat(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Save Custom Food Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
