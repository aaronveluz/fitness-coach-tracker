// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/settings/pages/SettingsPage.tsx
// Profile Configuration, Theme Mode, App Name Branding & QR Donation Settings
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { ThemeMode } from '../../../types/fitness';

export default function SettingsPage() {
  const {
    appName,
    setAppName,
    theme,
    setTheme,
    currentUser,
    updateCurrentUser,
    switchRole,
    coachPatQrConfig,
    updateCoachPatQrConfig,
    openDonateModal,
    donations,
  } = useFitnessStore();

  // Branding & Theme state
  const [customAppName, setCustomAppName] = useState(appName);

  // Profile Form state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [heightCm, setHeightCm] = useState(currentUser.heightCm);
  const [targetWeightKg, setTargetWeightKg] = useState(currentUser.goalWeightKg);
  const [targetCalories, setTargetCalories] = useState(currentUser.targetCalories);
  const [targetProtein, setTargetProtein] = useState(currentUser.targetProteinG);
  const [targetWater, setTargetWater] = useState(currentUser.targetWaterMl);
  const [targetWorkouts, setTargetWorkouts] = useState(currentUser.targetWorkoutsPerWeek);
  const [profileSuccessToast, setProfileSuccessToast] = useState(false);

  // Coach Pat QR Config State
  const [payeeName, setPayeeName] = useState(coachPatQrConfig.payeeName);
  const [gcash, setGcash] = useState(coachPatQrConfig.gcashNumber);
  const [promptPay, setPromptPay] = useState(coachPatQrConfig.promptPayId);
  const [venmo, setVenmo] = useState(coachPatQrConfig.venmoTag);
  const [cashApp, setCashApp] = useState(coachPatQrConfig.cashAppTag);
  const [upi, setUpi] = useState(coachPatQrConfig.upiId);
  const [paypal, setPaypal] = useState(coachPatQrConfig.paypalEmail);
  const [qrNote, setQrNote] = useState(coachPatQrConfig.note);
  const [qrSuccessToast, setQrSuccessToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      heightCm: Number(heightCm),
      goalWeightKg: Number(targetWeightKg),
      targetCalories: Number(targetCalories),
      targetProteinG: Number(targetProtein),
      targetWaterMl: Number(targetWater),
      targetWorkoutsPerWeek: Number(targetWorkouts),
    });

    setProfileSuccessToast(true);
    setTimeout(() => setProfileSuccessToast(false), 2500);
  };

  const handleSaveAppName = (e: React.FormEvent) => {
    e.preventDefault();
    setAppName(customAppName.trim() || 'Build with Pat');
  };

  const handleSaveQrConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoachPatQrConfig({
      payeeName,
      gcashNumber: gcash,
      promptPayId: promptPay,
      venmoTag: venmo,
      cashAppTag: cashApp,
      upiId: upi,
      paypalEmail: paypal,
      note: qrNote,
    });

    setQrSuccessToast(true);
    setTimeout(() => setQrSuccessToast(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Settings & App Configuration</span>
            <span style={{ fontSize: 24 }}>⚙️</span>
          </h1>
          <p className="page-subtitle">Configure app branding, theme appearance, athlete profile, and Coach Pat QR details</p>
        </div>
      </div>

      {/* ── App Name & Theme Appearance Card ─────────────────────────────────── */}
      <div className="card card-glow-emerald">
        <h3 className="card-title" style={{ marginBottom: 14 }}>
          <span>🎨</span> App Branding & Theme Appearance
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* App Name Configurator */}
          <form onSubmit={handleSaveAppName} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                App Name in UI (Default: "Build with Pat")
              </label>
              <input
                type="text"
                value={customAppName}
                onChange={e => setCustomAppName(e.target.value)}
                placeholder="e.g. Build with Pat"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
              Update App Name
            </button>
          </form>

          {/* Theme Selector (DARK / LIGHT / AUTO) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
              Interface Theme:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(
                [
                  { mode: 'dark', icon: '🌙', title: 'DARK', desc: 'Sleek neon dark aesthetics' },
                  { mode: 'light', icon: '☀️', title: 'LIGHT', desc: 'Clean high-contrast daytime mode' },
                  { mode: 'auto', icon: '💻', title: 'AUTO', desc: 'Sync with system OS theme' },
                ] as const
              ).map(t => (
                <button
                  key={t.mode}
                  type="button"
                  onClick={() => setTheme(t.mode as ThemeMode)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: theme === t.mode ? 'var(--color-primary-light)' : 'var(--bg-card-elevated)',
                    border: theme === t.mode ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <strong style={{ fontSize: 14, color: theme === t.mode ? 'var(--color-primary)' : 'var(--text-main)' }}>
                      {t.title}
                    </strong>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Coach Pat QR Donation Settings ──────────────────────────────────── */}
      <form onSubmit={handleSaveQrConfig} className="card card-glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="card-title">
              <span>💖</span> Coach Pat QR & Donation Details
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Configure direct QR payment handles shown on the "Donate / Tip Coach Pat" modal
            </p>
          </div>

          <button
            type="button"
            onClick={openDonateModal}
            className="btn btn-donate btn-sm"
          >
            Preview Donate QR Modal ➔
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Payee Display Name
            </label>
            <input type="text" value={payeeName} onChange={e => setPayeeName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              GCash Mobile Number
            </label>
            <input type="text" value={gcash} onChange={e => setGcash(e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              PromptPay ID
            </label>
            <input type="text" value={promptPay} onChange={e => setPromptPay(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Venmo Handle
            </label>
            <input type="text" value={venmo} onChange={e => setVenmo(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Cash App ($Cashtag)
            </label>
            <input type="text" value={cashApp} onChange={e => setCashApp(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              UPI VPA Address
            </label>
            <input type="text" value={upi} onChange={e => setUpi(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              PayPal Email
            </label>
            <input type="email" value={paypal} onChange={e => setPaypal(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
            Coach Pat Appreciation Note
          </label>
          <textarea rows={2} value={qrNote} onChange={e => setQrNote(e.target.value)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" className="btn btn-cyan">
            Save QR Donation Config
          </button>
          {qrSuccessToast && (
            <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>
              ✓ Coach Pat QR details updated!
            </span>
          )}
        </div>
      </form>

      {/* ── Role Switcher Card ──────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 10 }}>
          <span>👥</span> Demo Role Switcher
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Toggle between athlete and coaching staff views to test multi-role features.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <button
            type="button"
            onClick={() => switchRole('client')}
            className={`btn ${currentUser.role === 'client' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '12px 14px', justifyContent: 'flex-start' }}
          >
            <span>🏃</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Athlete (Alex Rivers)</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Self-tracking view</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => switchRole('coach')}
            className={`btn ${currentUser.role === 'coach' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '12px 14px', justifyContent: 'flex-start' }}
          >
            <span>👑</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Head Coach (Coach Pat)</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Monitoring & meetups</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => switchRole('staff')}
            className={`btn ${currentUser.role === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '12px 14px', justifyContent: 'flex-start' }}
          >
            <span>🛡️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700 }}>Staff Trainer (Sarah)</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Metric input portal</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Profile & Targets Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSaveProfile} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="card-title">
          <span>👤</span> Athlete Profile & Target Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Full Name
            </label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Email Address
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Height (cm)
            </label>
            <input type="number" value={heightCm} onChange={e => setHeightCm(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Goal Weight (kg)
            </label>
            <input type="number" step="0.1" value={targetWeightKg} onChange={e => setTargetWeightKg(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Workouts / Week
            </label>
            <input type="number" value={targetWorkouts} onChange={e => setTargetWorkouts(parseInt(e.target.value) || 1)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Daily Calories (kcal)
            </label>
            <input type="number" value={targetCalories} onChange={e => setTargetCalories(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', marginBottom: 4, display: 'block' }}>
              Protein Target (g)
            </label>
            <input type="number" value={targetProtein} onChange={e => setTargetProtein(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', marginBottom: 4, display: 'block' }}>
              Water Target (ml)
            </label>
            <input type="number" value={targetWater} onChange={e => setTargetWater(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          {profileSuccessToast && (
            <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>
              ✓ Profile settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
