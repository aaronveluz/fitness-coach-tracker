// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/layout/Topbar.tsx
// Top Navigation Bar with Configurable App Name, Theme Mode, Donate & Role Switcher
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useFitnessStore } from '../../app/store';
import type { ThemeMode } from '../../types/fitness';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const {
    appName,
    theme,
    setTheme,
    currentUser,
    switchRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    restTimerSeconds,
    isRestTimerRunning,
    pauseRestTimer,
    resetRestTimer,
    openQuickAdd,
    openPaymentModal,
    openDonateModal,
    openRolePasswordModal,
    logout,
  } = useFitnessStore();

  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format rest timer seconds MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-topbar">
      {/* Left: Configurable Brand Name & Quick Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'transparent' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {appName}
          </span>
        </button>

        {/* Active Role Tag */}
        <span
          className={`badge ${
            currentUser.role === 'coach'
              ? 'badge-rose'
              : currentUser.role === 'staff'
              ? 'badge-amber'
              : 'badge-emerald'
          }`}
          style={{ fontSize: 11, padding: '3px 8px' }}
        >
          {currentUser.role === 'coach'
            ? '👑 Head Coach'
            : currentUser.role === 'staff'
            ? '🛡️ Staff Trainer'
            : '🏃 Athlete'}
        </span>
      </div>

      {/* Right: Actions, Theme Switcher, Donate, Timer, Notifications & Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Active Rest Timer Pill (if active) */}
        {restTimerSeconds > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              animation: isRestTimerRunning ? 'pulse 2s infinite' : 'none',
            }}
          >
            <span style={{ fontSize: 14 }}>⏱️</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary)', fontSize: 14 }}>
              {formatTime(restTimerSeconds)}
            </span>
            <button
              onClick={pauseRestTimer}
              style={{ color: 'var(--text-main)', fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}
            >
              {isRestTimerRunning ? '⏸' : '▶'}
            </button>
            <button
              onClick={resetRestTimer}
              style={{ color: 'var(--text-muted)', fontSize: 11 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Log Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={openQuickAdd}
          style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
        >
          <span>＋</span>
          <span>Log</span>
        </button>

        {/* Theme Switcher Dropdown (DARK / LIGHT / AUTO) */}
        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button
            className="btn-icon"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title={`Current Theme: ${theme.toUpperCase()}`}
          >
            <span>{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}</span>
          </button>

          {showThemeMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 170,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: 6,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: 10, color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                Theme Mode:
              </div>

              {(['dark', 'light', 'auto'] as ThemeMode[]).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: theme === t ? 'var(--color-primary-light)' : 'transparent',
                    color: theme === t ? 'var(--color-primary)' : 'var(--text-main)',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{t === 'auto' ? 'Auto (System)' : `${t} Mode`}</span>
                  </span>
                  {theme === t && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* QR Payment Shortcut */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => openPaymentModal()}
          style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
          title="Payment & Subscriptions"
        >
          <span>💳</span>
        </button>

        {/* User Manual / Knowledge Center Quick Trigger */}
        <button
          className="btn-icon"
          onClick={() => navigate('/manual')}
          title="User Manual & Coaching Guides"
          style={{ position: 'relative' }}
        >
          <span>📖</span>
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{ position: 'relative' }}
            title="Notifications"
          >
            <span>🔔</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-rose)',
                  boxShadow: '0 0 8px var(--color-rose)',
                }}
              />
            )}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 320,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: 14,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    style={{ fontSize: 11, color: 'var(--color-primary)', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.linkUrl) navigate(n.linkUrl);
                      setShowNotifMenu(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: n.read ? 'transparent' : 'var(--color-primary-light)',
                      borderLeft: n.read ? '2px solid transparent' : '2px solid var(--color-primary)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, color: n.read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                      {n.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Role Switcher */}
        <div style={{ position: 'relative' }} ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-card-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px 4px 4px',
              cursor: 'pointer',
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {currentUser.role === 'coach' ? 'Coach Pat' : currentUser.role === 'staff' ? 'Staff' : 'Athlete'} ▾
              </span>
            </div>
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 46,
                width: 240,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: 10,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>
                Switch Simulation Role:
              </div>

              <button
                onClick={() => {
                  openRolePasswordModal('client');
                  setShowRoleMenu(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: currentUser.role === 'client' ? 'var(--color-primary-light)' : 'transparent',
                  color: currentUser.role === 'client' ? 'var(--color-primary)' : 'var(--text-main)',
                  textAlign: 'left',
                  marginBottom: 4,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>🏃</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Athlete / Client</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Alex Rivers (Self-tracking)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  openRolePasswordModal('coach');
                  setShowRoleMenu(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: currentUser.role === 'coach' ? 'var(--color-rose-light)' : 'transparent',
                  color: currentUser.role === 'coach' ? 'var(--color-rose)' : 'var(--text-main)',
                  textAlign: 'left',
                  marginBottom: 4,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>👑</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Head Coach (Admin)</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Coach Pat (Management & Review)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  openRolePasswordModal('staff');
                  setShowRoleMenu(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: currentUser.role === 'staff' ? 'var(--color-amber-light)' : 'transparent',
                  color: currentUser.role === 'staff' ? 'var(--color-amber)' : 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>🛡️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Staff Trainer</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Sarah Lin (Performance Specialist)</div>
                </div>
              </button>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  logout();
                  setShowRoleMenu(false);
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: 'var(--color-rose)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <span>🚪</span>
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
