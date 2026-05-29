import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { id: 'overview',     icon: '⬡', label: 'Overview' },
  { id: 'transactions', icon: '⇄', label: 'Transactions' },
  { id: 'analytics',   icon: '◈', label: 'Analytics' },
  { id: 'audit',       icon: '◎', label: 'Audit Logs' },
  { id: 'settings',    icon: '⚙', label: 'Settings' },
];

const Sidebar = ({ active, onNav, mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 99, backdropFilter: 'blur(4px)',
        }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-w)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform var(--transition)',
      }}>
        {/* Logo */}
        <a href={process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000'} target="_blank" rel="noopener noreferrer" style={{
          padding: '0 24px',
          height: 'var(--header-h)',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          textDecoration: 'none',
          color: 'inherit'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}>L</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Loanvia</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Console</div>
          </div>
        </a>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>
            Navigation
          </div>
          {NAV.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => { onNav(item.id); onClose?.(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: isActive ? `var(--accent)18` : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500, fontSize: '0.875rem',
                  cursor: 'pointer', marginBottom: 2,
                  transition: 'all var(--transition)',
                  borderLeft: isActive ? `2px solid var(--accent)` : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
              >
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {isActive && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
            cursor: 'pointer', marginBottom: 4,
            transition: 'all var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{theme === 'dark' ? '☀' : '☾'}</span>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(user || 'A')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user || 'Admin'}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Administrator</div>
            </div>
            <button onClick={logout} title="Sign out" style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.9rem', padding: 4, borderRadius: 4,
              transition: 'color var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >⏻</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
