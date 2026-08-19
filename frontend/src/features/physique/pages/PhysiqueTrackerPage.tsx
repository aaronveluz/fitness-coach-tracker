// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/physique/pages/PhysiqueTrackerPage.tsx
// Interactive Before/After Split-Screen Slider & Weekly Physique Photo Timeline
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';

export default function PhysiqueTrackerPage() {
  const { physiqueLogs, addPhysiqueLog, currentUser } = useFitnessStore();

  // Slider comparison state
  const [beforeIndex, setBeforeIndex] = useState(0); // Oldest / Week 1
  const [afterIndex, setAfterIndex] = useState(physiqueLogs.length - 1); // Latest / Week 8
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 percent
  const [selectedPose, setSelectedPose] = useState<'front' | 'side' | 'back'>('front');

  // Check-in Modal State
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinWeight, setCheckinWeight] = useState(currentUser.currentWeightKg);
  const [checkinBodyFat, setCheckinBodyFat] = useState(15.0);
  const [checkinChest, setCheckinChest] = useState(105);
  const [checkinWaist, setCheckinWaist] = useState(83);
  const [checkinHips, setCheckinHips] = useState(97);
  const [checkinArms, setCheckinArms] = useState(36.8);
  const [checkinThighs, setCheckinThighs] = useState(59.0);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [checkinPhoto, setCheckinPhoto] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80');

  const beforeLog = physiqueLogs[beforeIndex] || physiqueLogs[0];
  const afterLog = physiqueLogs[afterIndex] || physiqueLogs[physiqueLogs.length - 1];

  const getPhotoForPose = (log: typeof beforeLog, pose: 'front' | 'side' | 'back') => {
    if (pose === 'side') return log.sidePhoto;
    if (pose === 'back') return log.backPhoto;
    return log.frontPhoto;
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleSaveCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    addPhysiqueLog({
      date: new Date().toISOString().slice(0, 10),
      frontPhoto: checkinPhoto,
      sidePhoto: checkinPhoto,
      backPhoto: checkinPhoto,
      weightKg: checkinWeight,
      bodyFatPercent: checkinBodyFat,
      measurements: {
        chestCm: checkinChest,
        waistCm: checkinWaist,
        hipsCm: checkinHips,
        leftArmCm: checkinArms,
        rightArmCm: checkinArms,
        leftThighCm: checkinThighs,
        rightThighCm: checkinThighs,
      },
      notes: checkinNotes || 'Weekly progress update.',
      reviewedByCoach: false,
    });

    setIsCheckinModalOpen(false);
    setAfterIndex(physiqueLogs.length);
  };

  // Deltas between before and after
  const weightDelta = (afterLog.weightKg - beforeLog.weightKg).toFixed(1);
  const chestDelta = (afterLog.measurements.chestCm - beforeLog.measurements.chestCm).toFixed(1);
  const waistDelta = (afterLog.measurements.waistCm - beforeLog.measurements.waistCm).toFixed(1);
  const armDelta = (afterLog.measurements.rightArmCm - beforeLog.measurements.rightArmCm).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Physique Tracker & Comparison</span>
            <span style={{ fontSize: 24 }}>📸</span>
          </h1>
          <p className="page-subtitle">Visual transformation timeline, circumference measurements & coach feedback</p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsCheckinModalOpen(true)}>
          <span>＋</span> New Weekly Check-in
        </button>
      </div>

      {/* ── Interactive Before/After Split Comparison Slider ────────────────── */}
      <div className="card card-glow-cyan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="card-title">
              <span>⚡</span> Interactive Transformation Comparison
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Drag the center slider horizontally across the photos to compare physique changes
            </p>
          </div>

          {/* Pose Selector Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            {(['front', 'side', 'back'] as const).map(pose => (
              <button
                key={pose}
                onClick={() => setSelectedPose(pose)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: selectedPose === pose ? 'var(--color-cyan)' : 'transparent',
                  color: selectedPose === pose ? '#fff' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {pose} Pose
              </button>
            ))}
          </div>
        </div>

        {/* Date Selectors for Before vs After */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Before Reference:
            </label>
            <select
              value={beforeIndex}
              onChange={e => setBeforeIndex(parseInt(e.target.value))}
              style={{ width: '100%' }}
            >
              {physiqueLogs.map((log, idx) => (
                <option key={log.id} value={idx}>
                  Week {log.weekNumber} ({log.date}) — {log.weightKg} kg ({log.bodyFatPercent}% BF)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              After Reference:
            </label>
            <select
              value={afterIndex}
              onChange={e => setAfterIndex(parseInt(e.target.value))}
              style={{ width: '100%' }}
            >
              {physiqueLogs.map((log, idx) => (
                <option key={log.id} value={idx}>
                  Week {log.weekNumber} ({log.date}) — {log.weightKg} kg ({log.bodyFatPercent}% BF)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Split Screen Slider Canvas */}
        <div
          className="before-after-container"
          onMouseMove={e => e.buttons === 1 && handleSliderMove(e)}
          onClick={handleSliderMove}
          onTouchMove={handleSliderMove}
        >
          {/* AFTER Image (Background) */}
          <img
            src={getPhotoForPose(afterLog, selectedPose)}
            alt="After transformation"
            className="before-after-img"
          />

          {/* After Label */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(6, 182, 212, 0.85)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.04em',
              zIndex: 5,
            }}
          >
            AFTER: Week {afterLog.weekNumber} ({afterLog.weightKg} kg)
          </div>

          {/* BEFORE Image (Clipped Overlay) */}
          <div
            className="before-after-clip"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={getPhotoForPose(beforeLog, selectedPose)}
              alt="Before transformation"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                minWidth: '100%',
              }}
            />

            {/* Before Label */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(16, 185, 129, 0.85)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              BEFORE: Week {beforeLog.weekNumber} ({beforeLog.weightKg} kg)
            </div>
          </div>

          {/* Center Draggable Handle */}
          <div
            className="before-after-handle"
            style={{ left: `${sliderPosition}%` }}
          >
            ↔
          </div>
        </div>

        {/* Transformation Measurement Deltas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weight Delta</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: Number(weightDelta) >= 0 ? '#34d399' : '#fb7185' }}>
              {Number(weightDelta) >= 0 ? `+${weightDelta}` : weightDelta} kg
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Chest Circumference</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>
              {Number(chestDelta) >= 0 ? `+${chestDelta}` : chestDelta} cm
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waist Taper</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: Number(waistDelta) <= 0 ? '#34d399' : '#fbbf24' }}>
              {Number(waistDelta) >= 0 ? `+${waistDelta}` : waistDelta} cm
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Arm Growth</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#c084fc' }}>
              {Number(armDelta) >= 0 ? `+${armDelta}` : armDelta} cm
            </div>
          </div>
        </div>
      </div>

      {/* ── Weekly Photo Check-in History Cards ──────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="card-title">
          <span>📅</span> Weekly Check-in Log History
        </h3>

        {physiqueLogs.map(log => (
          <div key={log.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  W{log.weekNumber}
                </span>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                    Week {log.weekNumber} Check-In
                  </h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📅 {log.date} • ⚖️ {log.weightKg} kg • 🧬 {log.bodyFatPercent}% Body Fat
                  </div>
                </div>
              </div>

              {log.reviewedByCoach && (
                <span className="badge badge-emerald">
                  ✓ Verified by Coach Pat
                </span>
              )}
            </div>

            {/* Photos Preview 3-column */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              <div>
                <img
                  src={log.frontPhoto}
                  alt="Front pose"
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>Front Pose</div>
              </div>
              <div>
                <img
                  src={log.sidePhoto}
                  alt="Side pose"
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>Side Profile</div>
              </div>
              <div>
                <img
                  src={log.backPhoto}
                  alt="Back pose"
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>Back Pose</div>
              </div>
            </div>

            {/* Circumference measurements grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 8,
                background: 'var(--bg-card-elevated)',
                padding: 10,
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              <div>Chest: <strong>{log.measurements.chestCm} cm</strong></div>
              <div>Waist: <strong>{log.measurements.waistCm} cm</strong></div>
              <div>Hips: <strong>{log.measurements.hipsCm} cm</strong></div>
              <div>Arms: <strong>{log.measurements.rightArmCm} cm</strong></div>
              <div>Thighs: <strong>{log.measurements.rightThighCm} cm</strong></div>
            </div>

            {/* Notes & Coach Feedback */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Athlete Notes: </strong>
                <span>{log.notes}</span>
              </div>
              {log.coachFeedback && (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderLeft: '3px solid var(--color-primary)',
                    color: '#34d399',
                  }}
                >
                  <strong>Coach Pat: </strong>
                  <span>{log.coachFeedback}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal: New Weekly Check-in ───────────────────────────────────────── */}
      {isCheckinModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCheckinModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Weekly Physique Check-in</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Log measurements and photo progress</p>
              </div>
              <button onClick={() => setIsCheckinModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCheckin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={checkinWeight}
                    onChange={e => setCheckinWeight(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Est. Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={checkinBodyFat}
                    onChange={e => setCheckinBodyFat(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Chest (cm)</label>
                  <input type="number" step="0.5" value={checkinChest} onChange={e => setCheckinChest(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Waist (cm)</label>
                  <input type="number" step="0.5" value={checkinWaist} onChange={e => setCheckinWaist(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Hips (cm)</label>
                  <input type="number" step="0.5" value={checkinHips} onChange={e => setCheckinHips(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Arms (cm)</label>
                  <input type="number" step="0.5" value={checkinArms} onChange={e => setCheckinArms(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Thighs (cm)</label>
                  <input type="number" step="0.5" value={checkinThighs} onChange={e => setCheckinThighs(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Photo URL / Preset
                </label>
                <input
                  type="text"
                  value={checkinPhoto}
                  onChange={e => setCheckinPhoto(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Check-in Notes for Coach Pat
                </label>
                <textarea
                  rows={2}
                  value={checkinNotes}
                  onChange={e => setCheckinNotes(e.target.value)}
                  placeholder="Recovery state, joint tightness, diet adherence..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Save Weekly Check-in
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
