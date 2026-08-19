// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/coach/pages/CoachDashboardPage.tsx
// Coach Pat & Staff Monitoring Center, Assigned Workouts, Log Reviews & Meet-ups
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../../app/store';
import type { BiWeeklyMeetup, AssignedTask } from '../../../types/fitness';

export default function CoachDashboardPage() {
  const {
    currentUser,
    users,
    meetups,
    coachClients,
    assignedTasks,
    workouts,
    foodLogs,
    weightLogs,
    physiqueLogs,
    addAssignedTask,
    updateAssignedTask,
    deleteAssignedTask,
    toggleTaskCompleted,
    addLogComment,
    updateLogCoachReview,
    scheduleBiWeeklyMeetup,
    updateMeetup,
    updateClientMetricsByStaff,
    openRolePasswordModal,
  } = useFitnessStore();

  const navigate = useNavigate();

  const isStaffOrCoach = currentUser.role === 'coach' || currentUser.role === 'staff';

  // Client Selection
  const [selectedClientId, setSelectedClientId] = useState<string>(
    isStaffOrCoach ? coachClients[0]?.clientId || 'user_alex' : currentUser.id
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'workouts' | 'food' | 'physique' | 'metrics' | 'meetups'>('tasks');

  // Add Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<'workout' | 'nutrition' | 'habit' | 'meetup' | 'recovery'>('workout');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Remark Inputs
  const [workoutRemarks, setWorkoutRemarks] = useState<{ [id: string]: string }>({});
  const [foodRemarks, setFoodRemarks] = useState<{ [id: string]: string }>({});
  const [taskRemarks, setTaskRemarks] = useState<{ [id: string]: string }>({});

  // Scheduler Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [meetupDate, setMeetupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [meetupTime, setMeetupTime] = useState('10:00 AM - 11:00 AM');
  const [meetupLocation, setMeetupLocation] = useState('Metro Elite Strength Gym — Assessment Room B');
  const [meetupAgendaText, setMeetupAgendaText] = useState(
    'InBody Scan Review\nSquat & Deadlift Form Audit\nCycle Macro Adjustments\nMobility Screen'
  );

  // InBody Modal State
  const [isInBodyModalOpen, setIsInBodyModalOpen] = useState(false);
  const [inBodyWeight, setInBodyWeight] = useState(76.8);
  const [inBodyMuscle, setInBodyMuscle] = useState(38.2);
  const [inBodyBF, setInBodyBF] = useState(15.1);
  const [inBodyVisceral, setInBodyVisceral] = useState(4);
  const [screeningNotes, setScreeningNotes] = useState('');

  // Selected Client Details
  const activeClientRecord = coachClients.find(c => c.clientId === selectedClientId) || coachClients[0];
  const activeUser = users.find(u => u.id === selectedClientId) || currentUser;

  // Staff Prescriptions Form State
  const [adjCalories, setAdjCalories] = useState(activeClientRecord?.targetCalories || 2650);
  const [adjProtein, setAdjProtein] = useState(activeClientRecord?.targetProteinG || 175);
  const [adjCarbs, setAdjCarbs] = useState(activeClientRecord?.targetCarbsG || 300);
  const [adjFat, setAdjFat] = useState(activeClientRecord?.targetFatG || 70);
  const [adjWorkouts, setAdjWorkouts] = useState(activeClientRecord?.targetWorkoutsPerWeek || 5);
  const [adjProgram, setAdjProgram] = useState(activeClientRecord?.assignedWorkoutProgram || '5-Day Hypertrophy Split');
  const [adjNotes, setAdjNotes] = useState(activeClientRecord?.coachNotes || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Filter tasks & logs for the active client
  const clientTasks = assignedTasks.filter(t => t.clientId === selectedClientId || !t.clientId);
  const clientWorkouts = workouts; // In single-athlete active session or multi-user
  const clientFoodLogs = foodLogs;
  const clientPhysique = physiqueLogs;
  const clientWeight = weightLogs;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addAssignedTask({
      clientId: selectedClientId,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      category: taskCategory,
      dueDate: taskDueDate,
      assignedBy: currentUser.role === 'coach' ? 'Coach Pat' : 'Staff Trainer',
      completed: false,
      priority: taskPriority,
    });

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

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

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agendaArr = meetupAgendaText.split('\n').filter(Boolean);

    scheduleBiWeeklyMeetup({
      clientId: selectedClientId,
      clientName: activeClientRecord ? activeClientRecord.clientName : activeUser.name,
      clientAvatar: activeClientRecord ? activeClientRecord.avatar : activeUser.avatar,
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

  const handleSaveInBodyScan = (e: React.FormEvent) => {
    e.preventDefault();
    const latestMeetup = meetups[0];
    if (latestMeetup) {
      updateMeetup(latestMeetup.id, {
        status: 'Completed',
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
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Coach Monitoring & Athlete Command Center</span>
            <span style={{ fontSize: 24 }}>🏆</span>
          </h1>
          <p className="page-subtitle">
            Admin access for Coach Pat & Staff — Review client workouts, food logs, assign tasks, and schedule meet-ups
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>
            <span>👥</span> Manage Roster & Staff
          </button>

          {/* Role Switcher Pill */}
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

      {/* ── Athlete Profile Bar & Selector ───────────────────────────────────── */}
      <div className="card card-glow-emerald" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Athlete Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={activeClientRecord?.avatar || activeUser.avatar}
              alt={activeClientRecord?.clientName || activeUser.name}
              style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
            />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Athlete Monitored:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  style={{ fontSize: 15, fontWeight: 800, padding: '6px 12px', background: 'var(--bg-card-elevated)', borderRadius: 'var(--radius-md)' }}
                >
                  {users.filter(u => u.role === 'client').map(u => (
                    <option key={u.id} value={u.id}>
                      🏃 {u.name} ({u.activeTier.toUpperCase()})
                    </option>
                  ))}
                </select>
                <span className="badge badge-emerald" style={{ fontSize: 10 }}>
                  {activeClientRecord?.adherenceScorePercent || 96}% Adherence
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Calories</div>
              <strong style={{ fontSize: 16, color: 'var(--color-primary)' }}>
                {activeClientRecord?.targetCalories || activeUser.targetCalories} kcal
              </strong>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Macros (P/C/F)</div>
              <strong style={{ fontSize: 15, color: '#38bdf8' }}>
                {activeClientRecord?.targetProteinG || activeUser.targetProteinG}g P
              </strong>{' '}
              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                / {activeClientRecord?.targetCarbsG || activeUser.targetCarbsG}g C / {activeClientRecord?.targetFatG || activeUser.targetFatG}g F
              </span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Next Meet-up</div>
              <strong style={{ fontSize: 15, color: 'var(--color-rose)' }}>
                {activeClientRecord?.nextMeetupDate || '2 Weeks'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-medium)', paddingBottom: 6, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>📋</span> Assigned Tasks ({clientTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`btn ${activeTab === 'workouts' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>🏋️‍♂️</span> Logged Workouts ({clientWorkouts.length})
        </button>
        <button
          onClick={() => setActiveTab('food')}
          className={`btn ${activeTab === 'food' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>🥗</span> Food Logs Review ({clientFoodLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('physique')}
          className={`btn ${activeTab === 'physique' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>📸</span> Physique & InBody
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`btn ${activeTab === 'metrics' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>🎯</span> Prescribe Macros & Program
        </button>
        <button
          onClick={() => setActiveTab('meetups')}
          className={`btn ${activeTab === 'meetups' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span>🏆</span> Bi-Weekly Meet-ups ({meetups.length})
        </button>
      </div>

      {/* ── TAB 1: Assigned Tasks & Workouts ─────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                📋 Assigned Tasks & Workouts for {activeUser.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Direct programming tasks assigned by Coach Pat. Tag completed or add feedback.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsTaskModalOpen(true)}>
              <span>＋</span> Assign New Task / Workout
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {clientTasks.map(task => (
              <div
                key={task.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${task.completed ? 'var(--color-primary)' : task.priority === 'high' ? 'var(--color-rose)' : 'var(--color-cyan)'}`,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className={`badge ${
                        task.category === 'workout'
                          ? 'badge-cyan'
                          : task.category === 'nutrition'
                          ? 'badge-emerald'
                          : task.category === 'meetup'
                          ? 'badge-rose'
                          : 'badge-purple'
                      }`}
                      style={{ fontSize: 9, textTransform: 'uppercase', marginBottom: 4 }}
                    >
                      {task.category}
                    </span>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{task.title}</h4>
                  </div>

                  <span
                    className={`badge ${task.completed ? 'badge-emerald' : 'badge-amber'}`}
                    style={{ fontSize: 10 }}
                  >
                    {task.completed ? '✓ Completed' : '⏳ In Progress'}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {task.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-subtle)', borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span>Due: <strong>{task.dueDate}</strong></span>
                  <span>Assigned by: <strong>{task.assignedBy}</strong></span>
                </div>

                {task.coachRemarks && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--color-primary)', fontSize: 11, color: '#a7f3d0' }}>
                    <strong>Coach Pat:</strong> {task.coachRemarks}
                  </div>
                )}

                {/* Coach Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Coach feedback remark..."
                    value={taskRemarks[task.id] || ''}
                    onChange={e => setTaskRemarks({ ...taskRemarks, [task.id]: e.target.value })}
                    style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                  />
                  <button
                    onClick={() => {
                      toggleTaskCompleted(task.id, taskRemarks[task.id]);
                      setTaskRemarks({ ...taskRemarks, [task.id]: '' });
                    }}
                    className={`btn ${task.completed ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    {task.completed ? 'Mark Incomplete' : '✓ Tag Completed'}
                  </button>
                  <button
                    onClick={() => deleteAssignedTask(task.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px', color: 'var(--color-rose)' }}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: Logged Workouts Review ───────────────────────────────────── */}
      {activeTab === 'workouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                🏋️‍♂️ Workouts Logged by {activeUser.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Review sets, weights, RPE, volume, and tag workouts as verified by Coach Pat
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {clientWorkouts.map(session => (
              <div key={session.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🏋️‍♂️</span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{session.title}</h4>
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>{session.splitType} Split</span>
                      {session.coachStatus === 'completed' && (
                        <span className="badge badge-emerald" style={{ fontSize: 10 }}>✓ Verified by Coach Pat</span>
                      )}
                      {session.coachStatus === 'reviewed' && (
                        <span className="badge badge-rose" style={{ fontSize: 10 }}>Reviewed by Coach</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Date: {session.date} • Duration: {session.durationMinutes} mins • Volume: <strong>{session.totalVolumeKg.toLocaleString()} kg</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Energy: {'⚡'.repeat(session.energyLevel)}</span>
                  </div>
                </div>

                {/* Exercises List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 12 }}>
                  {session.exercises.map((ex, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-card-elevated)', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{ex.exerciseName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {ex.sets.map((s, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>Set {s.setNumber}: {s.weightKg} kg × {s.reps} reps</span>
                            {s.rpe && <span style={{ color: '#fbbf24' }}>RPE {s.rpe}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coach Pat Remarks on Workout */}
                {session.coachRemarks && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.12)', borderLeft: '3px solid var(--color-rose)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, color: '#fda4af', marginBottom: 10 }}>
                    <strong>Coach Pat Remark:</strong> {session.coachRemarks}
                  </div>
                )}

                {/* Coach Action Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  <input
                    type="text"
                    placeholder="Write Coach Pat remarks (e.g. Great squat depth, increase load next session)..."
                    value={workoutRemarks[session.id] || ''}
                    onChange={e => setWorkoutRemarks({ ...workoutRemarks, [session.id]: e.target.value })}
                    style={{ flex: 1, padding: '6px 10px', fontSize: 12 }}
                  />
                  <button
                    onClick={() => {
                      const remark = workoutRemarks[session.id] || 'Workout reviewed by Coach Pat.';
                      updateLogCoachReview('workout', session.id, 'reviewed', remark);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => {
                      const remark = workoutRemarks[session.id] || 'Verified & approved by Coach Pat. Excellent form & intensity.';
                      updateLogCoachReview('workout', session.id, 'completed', remark);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    ✓ Tag Verified
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: Food Logs Review ─────────────────────────────────────────── */}
      {activeTab === 'food' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                🥗 Food & Nutrition Logs for {activeUser.name}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Review athlete daily caloric adherence and provide nutritional feedback remarks
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clientFoodLogs.map(log => (
              <div key={log.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{log.food.name}</strong>
                      <span className="badge badge-cyan" style={{ fontSize: 9 }}>{log.mealCategory.toUpperCase()}</span>
                      {log.coachStatus === 'completed' && <span className="badge badge-emerald" style={{ fontSize: 9 }}>✓ Verified by Coach</span>}
                      {log.coachStatus === 'reviewed' && <span className="badge badge-rose" style={{ fontSize: 9 }}>Reviewed</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {log.servings} × {log.food.servingSize}{log.food.servingUnit} • Date: {log.date}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 14 }}>
                      {log.totalCalories} kcal
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                      {log.totalProtein}g P | {log.totalCarbs}g C | {log.totalFat}g F
                    </div>
                  </div>
                </div>

                {log.coachRemarks && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.12)', borderLeft: '2px solid var(--color-rose)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#fda4af', marginTop: 8 }}>
                    <strong>Coach Pat:</strong> {log.coachRemarks}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, borderTop: '1px dashed var(--border-subtle)', paddingTop: 8 }}>
                  <input
                    type="text"
                    placeholder="Coach nutrition remark (e.g. Good protein timing)..."
                    value={foodRemarks[log.id] || ''}
                    onChange={e => setFoodRemarks({ ...foodRemarks, [log.id]: e.target.value })}
                    style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
                  />
                  <button
                    onClick={() => {
                      const remark = foodRemarks[log.id] || 'Nutritional review completed.';
                      updateLogCoachReview('food', log.id, 'completed', remark);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 10, padding: '4px 8px' }}
                  >
                    ✓ Tag Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: Physique & InBody Scans ──────────────────────────────────── */}
      {activeTab === 'physique' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                📸 Physique Assessments & InBody Composition
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Compare athlete weekly progress photos and view InBody scanner data
              </p>
            </div>
            <button className="btn btn-rose btn-sm" onClick={() => setIsInBodyModalOpen(true)}>
              <span>⚡</span> Log InBody Scan Data
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {clientPhysique.map(entry => (
              <div key={entry.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <strong style={{ fontSize: 15 }}>Week {entry.weekNumber} Photo Set</strong>
                  <span className="badge badge-emerald">{entry.weightKg} kg</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                  <div>
                    <img src={entry.frontPhoto} alt="Front" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-muted)', marginTop: 2 }}>Front</div>
                  </div>
                  <div>
                    <img src={entry.sidePhoto} alt="Side" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-muted)', marginTop: 2 }}>Side</div>
                  </div>
                  <div>
                    <img src={entry.backPhoto} alt="Back" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-muted)', marginTop: 2 }}>Back</div>
                  </div>
                </div>

                {entry.coachFeedback && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.12)', borderLeft: '3px solid var(--color-rose)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 11, color: '#fda4af' }}>
                    <strong>Coach Pat:</strong> {entry.coachFeedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: Prescribe Macros & Program ───────────────────────────────── */}
      {activeTab === 'metrics' && (
        <form onSubmit={handleStaffSaveMetrics} className="card card-glow-rose" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 className="card-title">
              <span>🎯</span> Prescribe Macronutrients & Training Split for {activeUser.name}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Staff & Coach Pat adjustments directly update athlete daily dashboards and targets.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: 4 }}>
                Daily Calories (kcal)
              </label>
              <input type="number" value={adjCalories} onChange={e => setAdjCalories(parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: 4 }}>
                Protein Target (g)
              </label>
              <input type="number" value={adjProtein} onChange={e => setAdjProtein(parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', display: 'block', marginBottom: 4 }}>
                Carbohydrates (g)
              </label>
              <input type="number" value={adjCarbs} onChange={e => setAdjCarbs(parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#fb7185', display: 'block', marginBottom: 4 }}>
                Fats (g)
              </label>
              <input type="number" value={adjFat} onChange={e => setAdjFat(parseFloat(e.target.value) || 0)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Workouts Target Per Week
              </label>
              <input type="number" value={adjWorkouts} onChange={e => setAdjWorkouts(parseInt(e.target.value) || 1)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Assigned Workout Program
              </label>
              <input type="text" value={adjProgram} onChange={e => setAdjProgram(e.target.value)} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Coach Pat Notes & Directives
            </label>
            <textarea rows={3} value={adjNotes} onChange={e => setAdjNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="submit" className="btn btn-rose">
              Save Prescriptions to Athlete Dashboard
            </button>
            {saveSuccessMsg && (
              <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 }}>
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── TAB 6: Bi-Weekly Meet-ups ────────────────────────────────────────── */}
      {activeTab === 'meetups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                🏆 Bi-Weekly Physical Meet-up Schedule
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Every 2 weeks physical meet-ups with Coach Pat at Metro Elite Strength Gym
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsScheduleModalOpen(true)}>
              <span>＋</span> Schedule Physical Meet-up
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {meetups.map(meetup => (
              <div key={meetup.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🏆</span>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Cycle #{meetup.cycleNumber} Assessment — {meetup.clientName}</h4>
                      <span className={`badge ${meetup.status === 'Completed' ? 'badge-emerald' : 'badge-rose'}`}>
                        {meetup.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      📅 {meetup.date} at {meetup.time} • 📍 {meetup.location}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {meetup.status !== 'Completed' && (
                      <button
                        onClick={() => {
                          updateMeetup(meetup.id, { status: 'Completed' });
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {meetup.agenda && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-subtle)' }}>
                    <strong>Agenda:</strong> {meetup.agenda.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Assign New Task ───────────────────────────────────────────── */}
      {isTaskModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTaskModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Assign New Task to {activeUser.name}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5x5 Heavy Squats & Depth Audit"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Category
                  </label>
                  <select value={taskCategory} onChange={e => setTaskCategory(e.target.value as any)}>
                    <option value="workout">🏋️ Workout</option>
                    <option value="nutrition">🥗 Nutrition</option>
                    <option value="habit">💧 Habit</option>
                    <option value="meetup">🏆 Meetup</option>
                    <option value="recovery">🧘 Recovery</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Due Date
                  </label>
                  <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Priority
                  </label>
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Task Instructions & Specific Directives
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Work up to 135kg for 5x5 with 1-second pause. Upload video for Coach Pat form review."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Assign Task to Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Schedule Bi-Weekly Meetup ─────────────────────────────────── */}
      {isScheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Schedule Physical Meet-up with Coach Pat</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Meet-up Date
                  </label>
                  <input type="date" value={meetupDate} onChange={e => setMeetupDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Time Window
                  </label>
                  <input type="text" value={meetupTime} onChange={e => setMeetupTime(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Gym Location
                </label>
                <input type="text" value={meetupLocation} onChange={e => setMeetupLocation(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Agenda (One per line)
                </label>
                <textarea rows={3} value={meetupAgendaText} onChange={e => setMeetupAgendaText(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Confirm Physical Meet-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: InBody Scan Data ─────────────────────────────────────────── */}
      {isInBodyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsInBodyModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Record InBody 570 Composition Scan</h3>
              <button onClick={() => setIsInBodyModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>✕</button>
            </div>

            <form onSubmit={handleSaveInBodyScan} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Weight (kg)</label>
                  <input type="number" step="0.1" value={inBodyWeight} onChange={e => setInBodyWeight(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-primary)', display: 'block', marginBottom: 2 }}>Muscle (kg)</label>
                  <input type="number" step="0.1" value={inBodyMuscle} onChange={e => setInBodyMuscle(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-rose)', display: 'block', marginBottom: 2 }}>Body Fat %</label>
                  <input type="number" step="0.1" value={inBodyBF} onChange={e => setInBodyBF(parseFloat(e.target.value) || 0)} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#fbbf24', display: 'block', marginBottom: 2 }}>Visceral Level</label>
                  <input type="number" value={inBodyVisceral} onChange={e => setInBodyVisceral(parseInt(e.target.value) || 1)} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Coach Physical Screening & Mobility Notes
                </label>
                <textarea rows={3} value={screeningNotes} onChange={e => setScreeningNotes(e.target.value)} placeholder="Squat depth assessed, thoracic mobility 8/10..." />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsInBodyModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Save Scan Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
