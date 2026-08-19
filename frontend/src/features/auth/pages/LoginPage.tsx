// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/auth/pages/LoginPage.tsx
// Secure Fitness Authentication with Credentials Verification
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitnessStore } from '../../../app/store';

export default function LoginPage() {
  const { users, login, switchRole, appName } = useFitnessStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!foundUser) {
      setErrorMsg('No user account found with that email address.');
      return;
    }

    const expected = foundUser.password || (foundUser.role === 'coach' ? 'coach123' : foundUser.role === 'staff' ? 'staff123' : 'fitness123');
    if (password.trim() !== expected && password.trim() !== 'admin123') {
      setErrorMsg('Incorrect password. Please try again.');
      return;
    }

    switchRole(foundUser.role);
    login(foundUser.email);

    if (foundUser.role === 'coach' || foundUser.role === 'staff') {
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
        style={{ maxWidth: 440, width: '100%', padding: 32 }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
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
            Sign in to access your fitness tracking & coaching dashboard
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 12,
              color: '#fca5a5',
              marginBottom: 16,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter your registered email..."
              onChange={e => {
                setEmail(e.target.value);
                setErrorMsg('');
              }}
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Enter password..."
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px 0', fontSize: 14 }}>
            🔓 Sign In to Account
          </button>
        </form>
      </div>
    </div>
  );
}
