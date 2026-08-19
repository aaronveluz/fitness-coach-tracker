// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/auth/pages/LoginPage.tsx
// High-Energy Dark Fitness Authentication with 1-Click Role Logins
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../../app/store';

export default function LoginPage() {
  const { login, switchRole, appName } = useFitnessStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.rivers@fitness.app');
  const [password, setPassword] = useState('fitness123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/dashboard');
  };

  const handleQuickDemoLogin = (role: 'client' | 'coach' | 'staff', userEmail: string) => {
    switchRole(role);
    login(userEmail);
    if (role === 'coach' || role === 'staff') {
      navigate('/coach-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 60%), var(--bg-main)',
        padding: 20,
      }}
    >
      <div
        className="card card-glass card-glow-emerald"
        style={{ maxWidth: 460, width: '100%', padding: 32 }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.5)',
              marginBottom: 12,
            }}
          >
            ⚡
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {appName}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Next-Gen Fitness Tracking & Coach Pat Monitoring
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
            1-Click Demo Login Roles:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('client', 'alex.rivers@fitness.app')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏃</span>
                <strong>Alex Rivers (Athlete)</strong>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: 9 }}>Client Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('coach', 'coach.pat@fitness.app')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👑</span>
                <strong>Coach Pat (Head Coach)</strong>
              </span>
              <span className="badge badge-rose" style={{ fontSize: 9 }}>Coach Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('staff', 'sarah.lin@fitness.app')}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🛡️</span>
                <strong>Sarah Lin (Staff Trainer)</strong>
              </span>
              <span className="badge badge-amber" style={{ fontSize: 9 }}>Staff Mode</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-subtle)', margin: '14px 0', position: 'relative' }}>
          <span>or sign in with credentials</span>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px 0' }}>
            Sign In to Fitness Tracker
          </button>
        </form>
      </div>
    </div>
  );
}
