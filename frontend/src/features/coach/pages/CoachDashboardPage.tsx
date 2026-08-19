// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/coach/pages/CoachDashboardPage.tsx
// Coach Pat & Staff Monitoring Center, Bi-Weekly Meet-up Scheduler & Metric Input
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../../app/store';
import type { BiWeeklyMeetup } from '../../../types/fitness';

export default function CoachDashboardPage() {
  const {
    currentUser,
    meetups,
    coachClients,
    scheduleBiWeeklyMeetup,
    updateMeetup,
    updateClientMetricsByStaff,
    openRolePasswordModal,
  } = useFitnessStore();

  const navigate = useNavigate();

  const isStaffOrCoach = currentUser.role === 'coach' || currentUser.role === 'staff';

  // Client Selection for Staff Input
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isStaffOrCoach ? coachClients[0]?.clientId || 'user_alex' : currentUser.id
  );

  // Scheduler Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [meetupDate, setMeetupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks out by default
    return d.toISOString().slice(0, 10);
  });
  const [meetupTime, setMeetupTime] = useState('10:00 AM - 11:00 AM');
  const [meetupLocation, setMeetupLocation] = useState('Metro Elite Strength Gym — Assessment Room B');
  const [meetupAgendaText, setMeetupAgendaText] = useState(
    'InBody Scan Review\nSquat & Deadlift Form Audit\nCycle Macro Adjustments\nMobility Screen'
  );

  // Staff Client Adjustment Form State
  const activeClient = coachClients.find(c => c.clientId === selectedClientId) || coachClients[0];
  const [adjCalories, setAdjCalories] = useState(activeClient?.targetCalories || 2650);
  const [adjProtein, setAdjProtein] = useState(activeClient?.targetProteinG || 175);
  const [adjCarbs, setAdjCarbs] = useState(activeClient?.targetCarbsG || 300);
  const [adjFat, setAdjFat] = useState(activeClient?.targetFatG || 70);
  const [adjWorkouts, setAdjWorkouts] = useState(activeClient?.targetWorkoutsPerWeek || 5);
  const [adjProgram, setAdjProgram] = useState(activeClient?.assignedWorkoutProgram || '5-Day Hypertrophy Split');
  const [adjNotes, setAdjNotes] = useState(activeClient?.coachNotes || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Physical Assessment / InBody Logging State
  const [isInBodyModalOpen, setIsInBodyModalOpen] = useState(false);
  const [inBodyWeight, setInBodyWeight] = useState(76.8);
  const [inBodyMuscle, setInBodyMuscle] = useState(38.2);
  const [inBodyBF, setInBodyBF] = useState(15.1);
  const [inBodyVisceral, setInBodyVisceral] = useState(4);
  const [screeningNotes, setScreeningNotes] = useState('');

  // Handle Staff Save Changes
  const handleStaffSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientMetricsByStaff(selectedClientId, {
      targetCalories: Number(adjCalories),
      targetProteinG: Number(adjProtein),
      targetCarbsG: Number(adjCarbs),
      targetFatG: Number(adjFat),
      targetWorkoutsPerWeek: Number(adjWorkouts),
      assignedWorkoutProgram: adjProgram,
      coachNotes: adjNotes,
    });

    setSaveSuccessMsg('Client targets & prescriptions updated successfully by Staff!');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Handle Schedule Bi-Weekly Meetup
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agendaArr = meetupAgendaText.split('\n').filter(Boolean);

    scheduleBiWeeklyMeetup({
      clientId: selectedClientId,
      clientName: activeClient ? activeClient.clientName : currentUser.name,
      clientAvatar: activeClient ? activeClient.avatar : currentUser.avatar,
      coachId: 'coach_pat',
      coachName: 'Coach Pat',
      date: meetupDate,
      time: meetupTime,
      location: meetupLocation,
      cycleNumber: meetups.length + 1,
      agenda: agendaArr.length > 0 ? agendaArr : ['Bi-Weekly Physical Assessment', 'Progress Review'],
    });

    setIsScheduleModalOpen(false);
  };

  // Handle Log InBody Scan
  const handleSaveInBody = (e: React.FormEvent) => {
    e.preventDefault();
    const latestMeetup = meetups[0];
    if (latestMeetup) {
      updateMeetup(latestMeetup.id, {
        inBodyScan: {
          weightKg: Number(inBodyWeight),
          skeletalMuscleKg: Number(inBodyMuscle),
          bodyFatPercent: Number(inBodyBF),
          visceralFatLevel: Number(inBodyVisceral),
          waterPercent: 62.5,
        },
        physicalScreeningNotes: screeningNotes || 'Physical screening passed with optimal mobility.',
      });
    }
    setIsInBodyModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header & Quick Role Simulator ───────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Coach Monitoring & Bi-Weekly Meet-ups</span>
            <span style={{ fontSize: 24 }}>🏆</span>
          </h1>
          <p className="page-subtitle">
            Every 2 weeks physical meet-up scheduling with Coach Pat, staff metric entry, and InBody tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>
            <span>👥</span> Manage Athletes & Staff
          </button>

          {/* Demo Switcher Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Role:</span>
            <button
              onClick={() => openRolePasswordModal('client')}
              className={`btn btn-sm ${currentUser.role === 'client' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              Athlete
            </button>
            <button
              onClick={() => openRolePasswordModal('coach')}
              className={`btn btn-sm ${currentUser.role === 'coach' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              Coach Pat (Admin)
            </button>
            <button
              onClick={() => openRolePasswordModal('staff')}
              className={`btn btn-sm ${currentUser.role === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              Staff
            </button>
          </div>
        </div>
      </div>

      {/* ── Bi-Weekly Meet-up Schedule Management ───────────────────────────── */}
      <div className="card card-glow-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-rose">2-WEEK RECURRING CYCLE</span>
              <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 700 }}>In-Person Physical Check-ins</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              Physical Meet-ups with Coach Pat & Staff
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {isStaffOrCoach && (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsInBodyModalOpen(true)}>
                <span>🧬</span> Log InBody Scan
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setIsScheduleModalOpen(true)}>
              <span>📅</span> Schedule Next 2-Week Meet-up
            </button>
          </div>
        </div>

        {/* Meetups List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {meetups.map(m => (
            <div
              key={m.id}
              style={{
                background: 'var(--bg-card-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: 18,
                border: m.status === 'Scheduled' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={m.clientAvatar}
                    alt={m.clientName}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                        {m.clientName} & {m.coachName}
                      </h4>
                      <span className={`badge ${m.status === 'Scheduled' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                        {m.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      📍 {m.location}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: '#38bdf8' }}>
                    {m.date}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.time}</div>
                </div>
              </div>

              {/* Agenda items */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Meet-up Agenda & Protocols:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {m.agenda.map((ag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: '#fff',
                      }}
                    >
                      • {ag}
                    </span>
                  ))}
                </div>
              </div>

              {/* InBody Scan results if available */}
              {m.inBodyScan && (
                <div
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Scan Weight</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{m.inBodyScan.weightKg} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Skeletal Muscle</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#34d399' }}>{m.inBodyScan.skeletalMuscleKg} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Body Fat</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#38bdf8' }}>{m.inBodyScan.bodyFatPercent}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Visceral Fat</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#fbbf24' }}>Level {m.inBodyScan.visceralFatLevel} (Optimal)</div>
                  </div>
                </div>
              )}

              {/* Coach Notes */}
              {m.coachNotes && (
                <div style={{ fontSize: 12, color: '#34d399', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Coach Pat's Note: </strong>{m.coachNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Staff / Coach Client Metric Input Portal ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="card-title">
              <span>🛡️</span> Staff Metric Input & Athlete Management
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Coaches & Staff Trainers can adjust client targets, assign programs, and write assessment feedback
            </p>
          </div>

          {/* Client Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select Athlete:</span>
            <select
              value={selectedClientId}
              onChange={e => {
                const id = e.target.value;
                setSelectedClientId(id);
                const c = coachClients.find(client => client.clientId === id);
                if (c) {
                  setAdjCalories(c.targetCalories);
                  setAdjProtein(c.targetProteinG);
                  setAdjCarbs(c.targetCarbsG);
                  setAdjFat(c.targetFatG);
                  setAdjWorkouts(c.targetWorkoutsPerWeek);
                  setAdjProgram(c.assignedWorkoutProgram);
                  setAdjNotes(c.coachNotes);
                }
              }}
              style={{ width: 'auto', minWidth: 180 }}
            >
              {coachClients.map(c => (
                <option key={c.clientId} value={c.clientId}>
                  {c.clientName} ({c.currentPhase})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Input Form */}
        <form onSubmit={handleStaffSaveMetrics} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Target Macros Grid */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8, display: 'block' }}>
              Prescribed Daily Macronutrient Targets for {activeClient?.clientName}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  Daily Calories (kcal)
                </label>
                <input
                  type="number"
                  value={adjCalories}
                  onChange={e => setAdjCalories(parseFloat(e.target.value) || 0)}
                  style={{ fontWeight: 800 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#38bdf8', display: 'block', marginBottom: 2 }}>
                  Protein Target (g)
                </label>
                <input
                  type="number"
                  value={adjProtein}
                  onChange={e => setAdjProtein(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#fbbf24', display: 'block', marginBottom: 2 }}>
                  Carbs Target (g)
                </label>
                <input
                  type="number"
                  value={adjCarbs}
                  onChange={e => setAdjCarbs(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#fb7185', display: 'block', marginBottom: 2 }}>
                  Fats Target (g)
                </label>
                <input
                  type="number"
                  value={adjFat}
                  onChange={e => setAdjFat(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#34d399', display: 'block', marginBottom: 2 }}>
                  Workouts / Week
                </label>
                <input
                  type="number"
                  value={adjWorkouts}
                  onChange={e => setAdjWorkouts(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Assigned Program */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Assigned Training Program Split
            </label>
            <input
              type="text"
              value={adjProgram}
              onChange={e => setAdjProgram(e.target.value)}
              placeholder="e.g. 5-Day Upper/Lower Strength Split"
            />
          </div>

          {/* Coach Notes */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Coach Pat / Staff Assessment Notes & Feedback
            </label>
            <textarea
              rows={3}
              value={adjNotes}
              onChange={e => setAdjNotes(e.target.value)}
              placeholder="Input coaching observations, recovery feedback, or form cues..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              💾 Save & Push Updates to Athlete
            </button>
            {saveSuccessMsg && (
              <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ── Modal: Schedule Next 2-Week Meet-up ──────────────────────────────── */}
      {isScheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Schedule Bi-Weekly Meet-up</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>2-week recurring check-in with Coach Pat</p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Meet-up Date (Every 2 Weeks)
                </label>
                <input
                  type="date"
                  value={meetupDate}
                  onChange={e => setMeetupDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Time Slot
                </label>
                <input
                  type="text"
                  value={meetupTime}
                  onChange={e => setMeetupTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Physical Location / Gym Branch
                </label>
                <input
                  type="text"
                  value={meetupLocation}
                  onChange={e => setMeetupLocation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Agenda (1 item per line)
                </label>
                <textarea
                  rows={3}
                  value={meetupAgendaText}
                  onChange={e => setMeetupAgendaText(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Confirm Meet-up Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: InBody Body Composition Scan ─────────────────────────────── */}
      {isInBodyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsInBodyModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Record InBody Scan Data</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Staff input for bi-weekly body composition screen</p>
              </div>
              <button onClick={() => setIsInBodyModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInBody} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    Scan Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inBodyWeight}
                    onChange={e => setInBodyWeight(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    Skeletal Muscle Mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inBodyMuscle}
                    onChange={e => setInBodyMuscle(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    Body Fat Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inBodyBF}
                    onChange={e => setInBodyBF(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    Visceral Fat (Level 1-20)
                  </label>
                  <input
                    type="number"
                    value={inBodyVisceral}
                    onChange={e => setInBodyVisceral(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  Physical Screening / Mobility Notes
                </label>
                <textarea
                  rows={2}
                  value={screeningNotes}
                  onChange={e => setScreeningNotes(e.target.value)}
                  placeholder="Shoulder impingement tests, ankle dorsiflexion, squat symmetry..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Save InBody Assessment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
