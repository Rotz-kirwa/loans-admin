import React from 'react';
import { statusLabel } from '../utils/format';

const styles = {
  paid:         { background: 'var(--success-bg)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' },
  pending:      { background: 'var(--pending-bg)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' },
  failed:       { background: 'var(--failed-bg)',   color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' },
  not_initiated:{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(148,163,184,0.2)' },
};

const dots = { paid: '#10b981', pending: '#f59e0b', failed: '#ef4444', not_initiated: '#64748b' };

const StatusBadge = ({ status, size = 'md' }) => {
  const s = styles[status] || styles.not_initiated;
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';
  const padding = size === 'sm' ? '2px 7px' : '3px 10px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize, fontWeight: 600, padding, borderRadius: 99,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
      ...s,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: dots[status] || '#64748b',
        flexShrink: 0,
        animation: status === 'pending' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
      }} />
      {statusLabel(status)}
    </span>
  );
};

export default StatusBadge;
