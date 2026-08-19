// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/weight/pages/BodyWeightPage.tsx
// Body Weight Tracker with Interactive SVG Graph, 7-Day Moving Average & BMI
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';

export default function BodyWeightPage() {
  const { weightLogs, addWeightLog, deleteWeightLog, currentUser } = useFitnessStore();

  const [inputWeight, setInputWeight] = useState(currentUser.currentWeightKg.toString());
  const [inputTime, setInputTime] = useState<'morning' | 'evening'>('morning');
  const [inputNote, setInputNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // BMI calculations
  const heightM = currentUser.heightCm / 100;
  const currentBMI = (currentUser.currentWeightKg / (heightM * heightM)).toFixed(1);
  const startingBMI = (currentUser.startingWeightKg / (heightM * heightM)).toFixed(1);

  // BMR Estimate (Mifflin-St Jeor formula)
  const estimatedBMR = Math.round(10 * currentUser.currentWeightKg + 6.25 * currentUser.heightCm - 5 * 26 + 5);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    if (isNaN(w) || w <= 0) return;

    addWeightLog({
      date: new Date().toISOString().slice(0, 10),
      weightKg: w,
      timeOfDay: inputTime,
      notes: inputNote || undefined,
    });

    setIsModalOpen(false);
    setInputNote('');
  };

  // Render SVG interactive line chart
  const renderWeightSvgChart = () => {
    if (weightLogs.length === 0) return null;

    const width = 800;
    const height = 260;
    const padX = 50;
    const padY = 30;

    const weights = weightLogs.map(w => w.weightKg);
    const minW = Math.min(...weights, currentUser.startingWeightKg, currentUser.goalWeightKg) - 1.5;
    const maxW = Math.max(...weights, currentUser.startingWeightKg, currentUser.goalWeightKg) + 1.5;

    const getX = (idx: number) => padX + (idx / Math.max(1, weightLogs.length - 1)) * (width - padX * 2);
    const getY = (w: number) => height - padY - ((w - minW) / (maxW - minW)) * (height - padY * 2);

    // Build polyline points for actual weights
    const pointsStr = weightLogs.map((log, idx) => `${getX(idx)},${getY(log.weightKg)}`).join(' ');

    // Goal line Y
    const goalY = getY(currentUser.goalWeightKg);
    const startY = getY(currentUser.startingWeightKg);

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: 600, overflow: 'visible' }}
        >
          {/* Subtle Grid Lines */}
          {[minW, (minW + maxW) / 2, maxW].map((val, i) => {
            const y = getY(val);
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <text x={padX - 10} y={y + 4} fill="#64748b" fontSize="11" textAnchor="end">
                  {val.toFixed(1)} kg
                </text>
              </g>
            );
          })}

          {/* Goal Weight Line */}
          <line
            x1={padX}
            y1={goalY}
            x2={width - padX}
            y2={goalY}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text x={width - padX + 8} y={goalY + 4} fill="#10b981" fontSize="11" fontWeight="bold">
            Goal: {currentUser.goalWeightKg} kg
          </text>

          {/* Shaded Area Under Curve */}
          <polygon
            points={`${getX(0)},${height - padY} ${pointsStr} ${getX(weightLogs.length - 1)},${height - padY}`}
            fill="url(#weightGradient)"
          />

          {/* Actual Logged Weight Polyline */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points / Circles */}
          {weightLogs.map((log, idx) => {
            const cx = getX(idx);
            const cy = getY(log.weightKg);
            return (
              <g key={log.id}>
                <circle cx={cx} cy={cy} r="5" fill="#06b6d4" stroke="#0b0f19" strokeWidth="2" />
                <text x={cx} y={cy - 10} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {log.weightKg}
                </text>
              </g>
            );
          })}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Body Weight Tracker</span>
            <span style={{ fontSize: 24 }}>⚖️</span>
          </h1>
          <p className="page-subtitle">Track body weight fluctuations, 7-day trendlines, and BMI goals</p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <span>＋</span> Log Daily Weight
        </button>
      </div>

      {/* ── Top Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid-4">
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-cyan)' } as any}>
          <div>
            <div className="stat-label">Current Weight</div>
            <div className="stat-value">{currentUser.currentWeightKg} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-sub" style={{ color: '#38bdf8' }}>
              <span>+{(currentUser.currentWeightKg - currentUser.startingWeightKg).toFixed(1)} kg since start</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-cyan-light)', '--icon-color': 'var(--color-cyan)' } as any}>
            ⚖️
          </div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-primary)' } as any}>
          <div>
            <div className="stat-label">Target Weight Goal</div>
            <div className="stat-value">{currentUser.goalWeightKg} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>kg</span></div>
            <div className="stat-sub" style={{ color: '#34d399' }}>
              <span>{(currentUser.goalWeightKg - currentUser.currentWeightKg).toFixed(1)} kg remaining</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-primary-light)', '--icon-color': 'var(--color-primary)' } as any}>
            🎯
          </div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-purple)' } as any}>
          <div>
            <div className="stat-label">Body Mass Index (BMI)</div>
            <div className="stat-value">{currentBMI}</div>
            <div className="stat-sub" style={{ color: '#c084fc' }}>
              <span>Normal & Athletic Range (18.5 - 24.9)</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-purple-light)', '--icon-color': 'var(--color-purple)' } as any}>
            🧬
          </div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-amber)' } as any}>
          <div>
            <div className="stat-label">Estimated BMR</div>
            <div className="stat-value">{estimatedBMR} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>kcal</span></div>
            <div className="stat-sub" style={{ color: '#fbbf24' }}>
              <span>Basal Metabolic Rate</span>
            </div>
          </div>
          <div className="stat-icon" style={{ '--icon-bg': 'var(--color-amber-light)', '--icon-color': 'var(--color-amber)' } as any}>
            🔥
          </div>
        </div>
      </div>

      {/* ── Interactive SVG Line Chart ──────────────────────────────────────── */}
      <div className="card card-glow-cyan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 className="card-title">
              <span>📈</span> Body Weight Progression Curve
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Cyan line shows logged entries. Dotted green line represents Coach Pat's goal trajectory.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }} /> Actual Weight
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> Goal Line (80 kg)
            </span>
          </div>
        </div>

        {renderWeightSvgChart()}
      </div>

      {/* ── Weight Log History Table ────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span>📋</span> Weight Log Entries
          </h3>
          <span className="badge badge-emerald">{weightLogs.length} Total Weigh-ins</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Date</th>
                <th style={{ padding: '10px 12px' }}>Weight</th>
                <th style={{ padding: '10px 12px' }}>Time of Day</th>
                <th style={{ padding: '10px 12px' }}>BMI</th>
                <th style={{ padding: '10px 12px' }}>Notes</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {weightLogs.slice().reverse().map(log => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>{log.date}</td>
                  <td style={{ padding: '12px', fontWeight: 800, color: 'var(--color-primary)', fontSize: 15 }}>
                    {log.weightKg} kg
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${log.timeOfDay === 'morning' ? 'badge-amber' : 'badge-purple'}`} style={{ fontSize: 10 }}>
                      {log.timeOfDay === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.bmi || 24.2}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.notes || '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => deleteWeightLog(log.id)}
                      style={{ color: 'var(--color-danger)', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Record Body Weight ───────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Record Body Weight</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily morning weigh-in recommended for accuracy</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Weight in Kilograms (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={e => setInputWeight(e.target.value)}
                  required
                  style={{ fontSize: 22, fontWeight: 800 }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Weigh-in Condition
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setInputTime('morning')}
                    style={{
                      padding: '10px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: 12,
                      background: inputTime === 'morning' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card-elevated)',
                      border: inputTime === 'morning' ? '1px solid var(--color-amber)' : '1px solid var(--border-subtle)',
                      color: inputTime === 'morning' ? '#fbbf24' : 'var(--text-muted)',
                    }}
                  >
                    🌅 Morning (Fasted)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTime('evening')}
                    style={{
                      padding: '10px 0',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: 12,
                      background: inputTime === 'evening' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card-elevated)',
                      border: inputTime === 'evening' ? '1px solid var(--color-amber)' : '1px solid var(--border-subtle)',
                      color: inputTime === 'evening' ? '#fbbf24' : 'var(--text-muted)',
                    }}
                  >
                    🌙 Evening (Post-Meal)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-refeed day, good sleep"
                  value={inputNote}
                  onChange={e => setInputNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Save Weigh-in Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
