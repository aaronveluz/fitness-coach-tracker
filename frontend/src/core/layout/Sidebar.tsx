// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/layout/Sidebar.tsx
// Responsive Sidebar with Configurable App Name, Nav Groups & Direct Donate Trigger
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom';
import { useFitnessStore } from '../../app/store';
import { navigationItems, type NavItem } from '../../navigation.config';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentUser, appName, openDonateModal } = useFitnessStore();

  // Group nav items by group
  const grouped = navigationItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group ?? 'Menu';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#fff' }}>
              {appName}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Fitness Coach Tracker
            </div>
          </div>
        )}
      </div>

      {/* User Mini Profile Banner */}
      {!sidebarCollapsed && (
        <div
          style={{
            margin: '12px 14px 4px 14px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
              {currentUser.role === 'coach' ? 'Head Coach' : currentUser.role === 'staff' ? 'Staff Trainer' : 'Active Member'}
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {!sidebarCollapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px 8px 10px',
                }}
              >
                {group}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    padding: sidebarCollapsed ? '10px 0' : '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.05) 100%)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`badge ${
                        item.badgeColor === 'rose'
                          ? 'badge-rose'
                          : item.badgeColor === 'amber'
                          ? 'badge-amber'
                          : item.badgeColor === 'purple'
                          ? 'badge-purple'
                          : item.badgeColor === 'cyan'
                          ? 'badge-cyan'
                          : 'badge-emerald'
                      }`}
                      style={{ fontSize: 9, padding: '2px 6px' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Collapse Toggle */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {!sidebarCollapsed && <span>Collapse Sidebar</span>}
          <span>{sidebarCollapsed ? '➔' : '⬅'}</span>
        </button>
      </div>
    </aside>
  );
}
