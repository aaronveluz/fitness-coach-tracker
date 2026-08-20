// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/components/RolePasswordModal.tsx
// Secure Password / PIN Verification Modal for Switching Roles & Accessing Admin
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useFitnessStore } from '../../app/store';

export default function RolePasswordModal() {
  const {
    isRolePasswordModalOpen,
    closeRolePasswordModal,
    targetRoleToSwitch,
    targetUserToSwitch,
    verifyAndSwitchRole,
  } = useFitnessStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isRolePasswordModalOpen || !targetRoleToSwitch) return null;

  const roleTitle =
    targetRoleToSwitch === 'coach'
      ? 'Head Coach & Admin (Coach Pat)'
      : targetRoleToSwitch === 'staff'
      ? 'Staff Trainer (Sarah Lin / Staff)'
      : 'Athlete / Client Mode';

  const defaultHint =
    targetRoleToSwitch === 'coach' ? 'coach123' : targetRoleToSwitch === 'staff' ? 'staff123' : 'fitness123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the password to switch roles.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = verifyAndSwitchRole(password);
      setIsVerifying(false);

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setPassword('');
      }
    }, 200);
  };

  const handleUseHint = (hint: string) => {
    setPassword(hint);
    setErrorMsg('');
  };

  return (
    <div className="modal-backdrop" onClick={closeRolePasswordModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background:
                  targetRoleToSwitch === 'coach'
                    ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                    : targetRoleToSwitch === 'staff'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 0 16px rgba(0,0,0,0.3)',
              }}
            >
              🔒
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Role Authentication</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Password verification required</p>
            </div>
          </div>
          <button onClick={closeRolePasswordModal} className="btn-icon" style={{ width: 32, height: 32 }}>
            ✕
          </button>
        </div>

        {/* Target Role Banner */}
        <div
          style={{
            background: 'var(--bg-card-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {targetUserToSwitch?.avatar && (
            <img
              src={targetUserToSwitch.avatar}
              alt="Target user"
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Switching Account To:
            </div>
            <strong style={{ fontSize: 15, color: 'var(--text-main)' }}>
              {targetUserToSwitch ? targetUserToSwitch.name : roleTitle}
            </strong>
            <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
              {targetUserToSwitch?.roleTitle || roleTitle}
            </div>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              Account Password or Security PIN
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter account password..."
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: 12,
                color: '#fca5a5',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={closeRolePasswordModal}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {isVerifying ? 'Verifying...' : '🔓 Verify & Access Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
