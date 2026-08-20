// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/form-correction/pages/FormCorrectionPage.tsx
// Exercise Form Correction with Vector Drawings, Correct Form vs Mistakes & Cues
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useFitnessStore } from '../../../app/store';

export default function FormCorrectionPage() {
  const { formGuides } = useFitnessStore();
  const [selectedGuideId, setSelectedGuideId] = useState(formGuides[0]?.id || 'guide_squat');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const activeGuide = formGuides.find(g => g.id === selectedGuideId) || formGuides[0];

  const toggleChecklistItem = (item: string) => {
    setChecklistState(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Render SVG Anatomical Vector Illustrations for each lift
  const renderExerciseVectorSvg = (type: string) => {
    switch (type) {
      case 'squat':
        return (
          <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Floor */}
            <line x1="20" y1="180" x2="220" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />

            {/* Lifter Body in Deep Parallel Squat */}
            {/* Head & Neck */}
            <circle cx="105" cy="55" r="14" fill="#06b6d4" stroke="#fff" strokeWidth="2" />

            {/* Torso Spine Line (Neutral Flat Back 55 deg) */}
            <line x1="105" y1="69" x2="80" y2="125" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
            <line x1="105" y1="69" x2="80" y2="125" stroke="#34d399" strokeWidth="2" strokeDasharray="2 2" />

            {/* Femur / Thigh (Parallel to Floor) */}
            <line x1="80" y1="125" x2="140" y2="128" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />

            {/* Shin / Tibia (Angled over foot) */}
            <line x1="140" y1="128" x2="125" y2="180" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />

            {/* Foot Tripod on Floor */}
            <line x1="110" y1="180" x2="145" y2="180" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

            {/* Barbell Across Traps */}
            <line x1="60" y1="65" x2="150" y2="65" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="65" cy="65" r="12" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            <circle cx="145" cy="65" r="12" fill="#ef4444" stroke="#fff" strokeWidth="2" />

            {/* Vector Force Arrow & Hip crease indicator */}
            <line x1="105" y1="65" x2="105" y2="180" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="80" cy="125" r="4" fill="#fbbf24" />
            <text x="50" y="145" fill="#fbbf24" fontSize="10" fontWeight="bold">Hip Below Knee</text>

            <circle cx="140" cy="128" r="4" fill="#38bdf8" />
            <text x="150" y="130" fill="#38bdf8" fontSize="10" fontWeight="bold">Knee Tracks Out</text>
          </svg>
        );

      case 'deadlift':
        return (
          <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="180" x2="220" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />

            {/* Lifter in Starting Pull Position */}
            <circle cx="95" cy="60" r="14" fill="#06b6d4" stroke="#fff" strokeWidth="2" />

            {/* Flat Neutral Spine Line */}
            <line x1="95" y1="74" x2="65" y2="120" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />

            {/* Femur & Hip Wedge */}
            <line x1="65" y1="120" x2="115" y2="140" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />

            {/* Shins touching Bar */}
            <line x1="115" y1="140" x2="112" y2="180" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />

            {/* Arms Vertical to Bar */}
            <line x1="95" y1="76" x2="115" y2="150" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />

            {/* Barbell on Floor over Mid-foot */}
            <line x1="80" y1="150" x2="150" y2="150" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="115" cy="150" r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />

            {/* Vertical Bar Path Guide */}
            <line x1="115" y1="40" x2="115" y2="180" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
            <text x="125" y="50" fill="#10b981" fontSize="10" fontWeight="bold">Vertical Bar Path</text>
            <text x="35" y="105" fill="#34d399" fontSize="10" fontWeight="bold">Rigid Spine</text>
          </svg>
        );

      case 'bench_press':
        return (
          <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bench Pad */}
            <rect x="40" y="110" width="160" height="16" rx="4" fill="#1e293b" stroke="rgba(255,255,255,0.2)" />
            <rect x="70" y="126" width="12" height="54" fill="#334155" />
            <rect x="160" y="126" width="12" height="54" fill="#334155" />

            {/* Head on Bench */}
            <circle cx="65" cy="100" r="12" fill="#06b6d4" stroke="#fff" strokeWidth="2" />

            {/* Arched Torso with Scapular Retraction */}
            <path d="M 75 106 Q 105 85 135 110" stroke="#10b981" strokeWidth="10" fill="none" strokeLinecap="round" />

            {/* Legs on Ground (Leg Drive) */}
            <line x1="135" y1="110" x2="165" y2="140" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <line x1="165" y1="140" x2="165" y2="180" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />

            {/* Arms holding Bar with 60 deg Elbow Tuck */}
            <line x1="90" y1="95" x2="90" y2="55" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" />

            {/* Barbell at Lower Sternum */}
            <line x1="30" y1="55" x2="150" y2="55" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="90" cy="55" r="14" fill="#ef4444" stroke="#fff" strokeWidth="2" />

            <text x="100" y="45" fill="#38bdf8" fontSize="10" fontWeight="bold">J-Curve Path</text>
            <text x="95" y="80" fill="#fbbf24" fontSize="9" fontWeight="bold">Scapulae Pinned</text>
          </svg>
        );

      default:
        return (
          <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="60" r="18" fill="#06b6d4" stroke="#fff" strokeWidth="2" />
            <line x1="120" y1="78" x2="120" y2="135" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
            <line x1="120" y1="135" x2="105" y2="180" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <line x1="120" y1="135" x2="135" y2="180" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
            <line x1="80" y1="90" x2="160" y2="90" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
            <text x="120" y="195" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">Precision Alignment</text>
          </svg>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Exercise Form Correction Guide</span>
            <span style={{ fontSize: 24 }}>🎯</span>
          </h1>
          <p className="page-subtitle">Visual anatomical cues, angle checkpoints, and injury-prevention checklists</p>
        </div>

        <span className="badge badge-emerald" style={{ fontSize: 13, padding: '6px 12px' }}>
          ✓ Verified by Coach Pat (CSCS)
        </span>
      </div>

      {/* ── Exercise Selector Horizontal Scroller ───────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'thin',
        }}
      >
        {formGuides.map(guide => (
          <button
            key={guide.id}
            onClick={() => {
              setSelectedGuideId(guide.id);
              setChecklistState({});
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: selectedGuideId === guide.id ? 'var(--color-primary)' : 'var(--bg-card-elevated)',
              border: selectedGuideId === guide.id ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              color: selectedGuideId === guide.id ? '#fff' : 'var(--text-muted)',
              fontWeight: selectedGuideId === guide.id ? 800 : 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
          >
            <span>{guide.exerciseName}</span>
            <span
              className={`badge ${selectedGuideId === guide.id ? 'badge-cyan' : 'badge-emerald'}`}
              style={{ fontSize: 9, padding: '1px 5px' }}
            >
              {guide.muscleGroup}
            </span>
          </button>
        ))}
      </div>

      {/* ── Main Form Guide Display ─────────────────────────────────────────── */}
      <div className="grid-2">
        {/* Left Column: Visual Anatomical Illustration & Correct Form */}
        <div className="form-card correct">
          {/* Visual Vector SVG Header */}
          <div className="form-illustration-box">
            {renderExerciseVectorSvg(activeGuide.svgVisualType)}
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>
                  Optimal Form & Execution
                </h3>
              </div>
              <span className="badge badge-emerald">SAFE & POWERFUL</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {activeGuide.summary}
            </p>

            {/* Key Form Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {activeGuide.correctFormPoints.map((pt, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                  <span style={{ color: 'var(--text-main)' }}>{pt}</span>
                </div>
              ))}
            </div>

            {/* Joint Angle Checkpoints */}
            <div style={{ background: 'var(--bg-card-elevated)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8', marginBottom: 8 }}>
                📐 Joint Angle Checkpoints:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activeGuide.jointAngleCheckpoints.map((chk, i) => (
                  <div key={i} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{chk.joint}:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{chk.optimalAngle}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Breathing & Bracing Pattern */}
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                borderLeft: '3px solid var(--color-cyan)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                color: '#38bdf8',
              }}
            >
              <strong>🫁 Valsalva Bracing Cue: </strong>
              {activeGuide.breathingCue}
            </div>
          </div>
        </div>

        {/* Right Column: Dangerous Mistakes & Pre-Lift Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Dangerous Mistakes Card */}
          <div className="form-card warning" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-danger)' }}>
                  Common Dangerous Mistakes
                </h3>
              </div>
              <span className="badge badge-rose">INJURY RISKS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeGuide.dangerousMistakes.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 14,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#fb7185' }}>
                    ❌ {m.mistake}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <strong>Risk: </strong>{m.risk}
                  </div>
                  <div style={{ fontSize: 12, color: '#34d399', marginTop: 4, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Correction: </strong>{m.correction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Pre-Lift Checklist */}
          <div className="card card-glow-emerald" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="card-title">
                <span>📋</span> Pre-Lift Self-Audit Checklist
              </h3>
              <span className="badge badge-emerald">MENTAL CUES</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeGuide.preLiftChecklist.map((item, i) => {
                const isChecked = checklistState[item];
                return (
                  <div
                    key={i}
                    onClick={() => toggleChecklistItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isChecked ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-elevated)',
                      border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => {}}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: isChecked ? 700 : 500, color: isChecked ? '#34d399' : '#fff' }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
