import React from 'react';

const pageTitles = {
  overview:     { title: 'Overview', sub: 'Real-time payment intelligence' },
  transactions: { title: 'Transactions', sub: 'All payment records' },
  analytics:    { title: 'Analytics', sub: 'Revenue & growth insights' },
  audit:        { title: 'Audit Logs', sub: 'System activity trail' },
};

const TopBar = ({ page, onMenuToggle, lastUpdated }) => {
  const info = pageTitles[page] || pageTitles.overview;

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 'var(--sidebar-w)', right: 0,
      height: 'var(--header-h)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px',
      zIndex: 50,
      gap: 16,
    }}>
      {/* Mobile hamburger */}
      <button onClick={onMenuToggle} style={{
        display: 'none', background: 'none', border: 'none',
        color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer',
        padding: 4,
      }} className="mobile-menu-btn">☰</button>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {info.title}
        </h1>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          {info.sub}
        </p>
      </div>

      {/* Live indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 99,
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        fontSize: '0.72rem', fontWeight: 600, color: '#10b981',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: '#10b981',
          animation: 'pulse-dot 1.5s ease-in-out infinite',
        }} />
        Live
      </div>

      {lastUpdated && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>↻</span>
          {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default TopBar;
