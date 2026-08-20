// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/users/pages/UsersPage.tsx
// User Management Center for Admin (Coach Pat) & Staff Trainers
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { UserProfile, AppRole } from '../../../types/fitness';

export default function UsersPage() {
  const {
    currentUser,
    users,
    addUser,
    updateUser,
    deleteUser,
    openRolePasswordModal,
  } = useFitnessStore();

  const isAdminOrStaff = currentUser.role === 'coach' || currentUser.role === 'staff';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'staff' | 'coach'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AppRole>('client');
  const [formRoleTitle, setFormRoleTitle] = useState('Athlete / Client');
  const [formPassword, setFormPassword] = useState('fitness123');
  const [formPhone, setFormPhone] = useState('+1 (555) 000-0000');
  const [formHeight, setFormHeight] = useState(175);
  const [formWeight, setFormWeight] = useState(75);
  const [formGoalWeight, setFormGoalWeight] = useState(78);
  const [formCalories, setFormCalories] = useState(2500);
  const [formProtein, setFormProtein] = useState(170);
  const [formCarbs, setFormCarbs] = useState(280);
  const [formFat, setFormFat] = useState(65);
  const [formWorkouts, setFormWorkouts] = useState(5);
  const [formCoach, setFormCoach] = useState('Coach Pat');
  const [formTier, setFormTier] = useState<'basic' | 'pro' | 'elite'>('elite');
  const [toastMsg, setToastMsg] = useState('');

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAthletes = users.filter(u => u.role === 'client').length;
  const totalStaff = users.filter(u => u.role === 'staff' || u.role === 'coach').length;
  const eliteSubscriptions = users.filter(u => u.activeTier === 'elite').length;

  const handleOpenAddModal = (presetRole: AppRole = 'client') => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormRole(presetRole);
    setFormRoleTitle(presetRole === 'client' ? 'Athlete / Client' : 'Staff Strength Trainer');
    setFormPassword(presetRole === 'client' ? 'fitness123' : 'staff123');
    setFormPhone('+1 (555) 000-0000');
    setFormHeight(175);
    setFormWeight(75);
    setFormGoalWeight(78);
    setFormCalories(presetRole === 'client' ? 2500 : 2800);
    setFormProtein(presetRole === 'client' ? 170 : 190);
    setFormCarbs(280);
    setFormFat(65);
    setFormWorkouts(5);
    setFormCoach('Coach Pat');
    setFormTier('elite');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username || u.name.toLowerCase().replace(/\s+/g, ''));
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormRoleTitle(u.roleTitle);
    setFormPassword(u.password || 'fitness123');
    setFormPhone(u.phone || '+1 (555) 000-0000');
    setFormHeight(u.heightCm);
    setFormWeight(u.currentWeightKg);
    setFormGoalWeight(u.goalWeightKg);
    setFormCalories(u.targetCalories);
    setFormProtein(u.targetProteinG);
    setFormCarbs(u.targetCarbsG);
    setFormFat(u.targetFatG);
    setFormWorkouts(u.targetWorkoutsPerWeek);
    setFormCoach(u.assignedCoach);
    setFormTier(u.activeTier);
    setIsAddModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const finalUsername = formUsername.trim().replace(/^@/, '') || formName.trim().toLowerCase().replace(/\s+/g, '');

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formName.trim(),
        username: finalUsername,
        email: formEmail.trim(),
        role: formRole,
        roleTitle: formRoleTitle,
        password: formPassword,
        phone: formPhone,
        heightCm: Number(formHeight),
        currentWeightKg: Number(formWeight),
        goalWeightKg: Number(formGoalWeight),
        targetCalories: Number(formCalories),
        targetProteinG: Number(formProtein),
        targetCarbsG: Number(formCarbs),
        targetFatG: Number(formFat),
        targetWorkoutsPerWeek: Number(formWorkouts),
        assignedCoach: formCoach,
        activeTier: formTier,
      });
      setToastMsg(`User ${formName} (@${finalUsername}) updated successfully!`);
    } else {
      const avatarMap =
        formRole === 'coach'
          ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80'
          : formRole === 'staff'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      addUser({
        name: formName.trim(),
        username: finalUsername,
        email: formEmail.trim(),
        role: formRole,
        roleTitle: formRoleTitle,
        avatar: avatarMap,
        password: formPassword,
        phone: formPhone,
        heightCm: Number(formHeight),
        startingWeightKg: Number(formWeight),
        currentWeightKg: Number(formWeight),
        goalWeightKg: Number(formGoalWeight),
        targetCalories: Number(formCalories),
        targetProteinG: Number(formProtein),
        targetCarbsG: Number(formCarbs),
        targetFatG: Number(formFat),
        targetFiberG: 35,
        targetWaterMl: 3500,
        targetWorkoutsPerWeek: Number(formWorkouts),
        assignedCoach: formCoach,
        activeTier: formTier,
        subscriptionExpiry: '2027-12-31',
        status: 'active',
        joinedDate: new Date().toISOString().slice(0, 10),
      });
      setToastMsg(`New ${formRole === 'client' ? 'Athlete' : 'Staff'} ${formName} (@${finalUsername}) registered!`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleStatus = (u: UserProfile) => {
    const newStatus = u.status === 'inactive' ? 'active' : 'inactive';
    updateUser(u.id, { status: newStatus });
    setToastMsg(`${u.name} status set to ${newStatus}`);
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>User & Athlete Management</span>
            <span style={{ fontSize: 24 }}>👥</span>
          </h1>
          <p className="page-subtitle">
            Admin access for Coach Pat & Staff — Register athletes, manage coaches, assign nutrition & training splits
          </p>
        </div>

        {isAdminOrStaff && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAddModal('staff')}>
              <span>🛡️</span> ＋ Add Staff Trainer
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenAddModal('client')}>
              <span>🏃</span> ＋ Add New Athlete
            </button>
          </div>
        )}
      </div>

      {/* Non-Admin Warning Banner (if client visits) */}
      {!isAdminOrStaff && (
        <div
          className="card card-glow-amber"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-amber)', fontSize: 15 }}>
              🔒 Admin & Staff Restricted View
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              You are currently viewing as Athlete <strong>{currentUser.name}</strong>. Switch to Coach Pat with password (<code>coach123</code>) to manage roster.
            </div>
          </div>
          <button
            onClick={() => openRolePasswordModal('coach')}
            className="btn btn-primary btn-sm"
          >
            <span>👑</span> Authenticate as Coach Pat
          </button>
        </div>
      )}

      {/* ── KPI Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid-4">
        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-primary)' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Total Athletes</div>
            <div className="stat-value">{totalAthletes} Active</div>
            <div className="stat-sub">Under Coach Pat roster</div>
          </div>
          <div className="stat-icon">🏃</div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-rose)' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Coaching Staff</div>
            <div className="stat-value">{totalStaff} Trainers</div>
            <div className="stat-sub">Head Coach & Specialists</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-rose-light)', color: 'var(--color-rose)' }}>
            👑
          </div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-cyan)' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Elite 1-on-1 Clients</div>
            <div className="stat-value">{eliteSubscriptions} Athletes</div>
            <div className="stat-sub">Bi-weekly physical meetups</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-cyan-light)', color: 'var(--color-cyan)' }}>
            ⭐
          </div>
        </div>

        <div className="stat-widget" style={{ '--accent-bar': 'var(--color-amber)' } as React.CSSProperties}>
          <div>
            <div className="stat-label">Security Role Checks</div>
            <div className="stat-value">Password Protected</div>
            <div className="stat-sub">Coach PIN required</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-amber-light)', color: 'var(--color-amber)' }}>
            🔒
          </div>
        </div>
      </div>

      {toastMsg && (
        <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '10px 16px', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>
          ✓ {toastMsg}
        </div>
      )}

      {/* ── Search & Filter Controls ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search user by name, email, or role title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setRoleFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: roleFilter === 'all' ? 'var(--color-primary)' : 'transparent',
                color: roleFilter === 'all' ? '#fff' : 'var(--text-muted)',
              }}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('client')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: roleFilter === 'client' ? 'var(--color-cyan)' : 'transparent',
                color: roleFilter === 'client' ? '#fff' : 'var(--text-muted)',
              }}
            >
              Athletes ({totalAthletes})
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: roleFilter === 'staff' ? 'var(--color-amber)' : 'transparent',
                color: roleFilter === 'staff' ? '#fff' : 'var(--text-muted)',
              }}
            >
              Staff ({users.filter(u => u.role === 'staff').length})
            </button>
            <button
              onClick={() => setRoleFilter('coach')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 700,
                background: roleFilter === 'coach' ? 'var(--color-rose)' : 'transparent',
                color: roleFilter === 'coach' ? '#fff' : 'var(--text-muted)',
              }}
            >
              Head Coach ({users.filter(u => u.role === 'coach').length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Users Table ──────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span>📋</span> Registered Members & Coaching Staff Directory
          </h3>
          <span className="badge badge-emerald">{filteredUsers.length} Records</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>User / Member</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Target Calories</th>
                <th style={{ padding: '12px' }}>Macros (P/C/F)</th>
                <th style={{ padding: '12px' }}>Tier / Coach</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {/* User Profile */}
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>
                            {u.name}
                          </span>
                          <span className="badge badge-purple" style={{ fontSize: 9, padding: '2px 6px' }}>
                            @{u.username || u.name.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        {u.phone && <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{u.phone}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '14px 12px' }}>
                    <span
                      className={`badge ${
                        u.role === 'coach'
                          ? 'badge-rose'
                          : u.role === 'staff'
                          ? 'badge-amber'
                          : 'badge-emerald'
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {u.role === 'coach' ? '👑 Head Coach' : u.role === 'staff' ? '🛡️ Staff Trainer' : '🏃 Athlete'}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {u.roleTitle}
                    </div>
                  </td>

                  {/* Calories & Weight */}
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                      {u.targetCalories} kcal
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {u.currentWeightKg} kg ➔ Goal: {u.goalWeightKg} kg
                    </div>
                  </td>

                  {/* Macros */}
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{u.targetProteinG}g P</span>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{u.targetCarbsG}g C</span>
                      <span style={{ color: '#fb7185', fontWeight: 700 }}>{u.targetFatG}g F</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {u.targetWorkoutsPerWeek} workouts/wk
                    </div>
                  </td>

                  {/* Tier */}
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                      {u.activeTier.toUpperCase()}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Coach: <strong>{u.assignedCoach}</strong>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`badge ${u.status === 'inactive' ? 'badge-amber' : 'badge-emerald'}`}
                      style={{ cursor: 'pointer', fontSize: 10 }}
                    >
                      {u.status === 'inactive' ? '⏸ Inactive' : '✓ Active'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openRolePasswordModal(u.role, u)}
                        className="btn btn-secondary btn-sm"
                        title="Switch into this user's account"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                      >
                        🔑 Switch
                      </button>

                      {isAdminOrStaff && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="btn btn-primary btn-sm"
                            title="Edit user goals & targets"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                          >
                            ✏️ Edit
                          </button>

                          {u.id !== 'coach_pat' && u.id !== currentUser.id && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '4px 8px', color: 'var(--color-rose)' }}
                              title="Delete user"
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add / Edit User ───────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                  {editingUser ? `Edit ${editingUser.name}` : `Register New ${formRole === 'client' ? 'Athlete' : 'Staff'}`}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Admin User Management • Configured by Head Coach Pat
                </p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Username (@handle)
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="e.g. jordansmith"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="jordan.smith@fitness.app"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    User Role
                  </label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value as AppRole)}>
                    <option value="client">Athlete / Client</option>
                    <option value="staff">Staff Trainer</option>
                    <option value="coach">Head Coach (Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Account Password
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Subscription Tier
                  </label>
                  <select value={formTier} onChange={e => setFormTier(e.target.value as 'basic' | 'pro' | 'elite')}>
                    <option value="elite">Elite 1-on-1 Coaching</option>
                    <option value="pro">Pro Athlete Tracker</option>
                    <option value="basic">Basic Membership</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Role Title / Specialty
                  </label>
                  <input
                    type="text"
                    value={formRoleTitle}
                    onChange={e => setFormRoleTitle(e.target.value)}
                    placeholder="e.g. Athlete / Hypertrophy Split"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Assigned Coach
                  </label>
                  <input
                    type="text"
                    value={formCoach}
                    onChange={e => setFormCoach(e.target.value)}
                    placeholder="Coach Pat"
                  />
                </div>
              </div>

              {/* Physical Targets */}
              <div style={{ background: 'var(--bg-card-elevated)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  🎯 Physical Metrics & Macronutrient Targets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formHeight}
                      onChange={e => setFormHeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formWeight}
                      onChange={e => setFormWeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                      Goal (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formGoalWeight}
                      onChange={e => setFormGoalWeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                      Workouts/Wk
                    </label>
                    <input
                      type="number"
                      value={formWorkouts}
                      onChange={e => setFormWorkouts(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--color-primary)', display: 'block', marginBottom: 2 }}>
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={formCalories}
                      onChange={e => setFormCalories(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#38bdf8', display: 'block', marginBottom: 2 }}>
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={formProtein}
                      onChange={e => setFormProtein(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#fbbf24', display: 'block', marginBottom: 2 }}>
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={formCarbs}
                      onChange={e => setFormCarbs(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#fb7185', display: 'block', marginBottom: 2 }}>
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      value={formFat}
                      onChange={e => setFormFat(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingUser ? 'Save User Changes' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
