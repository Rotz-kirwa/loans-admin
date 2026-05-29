import React from 'react';
import StatusBadge from './StatusBadge';
import { formatTimeAgo, formatKES, formatPhone, shortId } from '../utils/format';

const ActivityFeed = ({ loans = [], loading }) => {
  const recent = loans.slice(0, 12);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Activity</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Most recent transactions</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.7rem', color: '#10b981', fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block' }} />
          Real-time
        </div>
      </div>

      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {loading && !recent.length ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '40%' }} />
              </div>
            </div>
          ))
        ) : recent.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No transactions yet
          </div>
        ) : (
          recent.map((loan, i) => (
            <div key={loan.id} className="animate-fade" style={{
              animationDelay: `${i * 30}ms`,
              padding: '11px 20px',
              borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'background var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: loan.payment_status === 'paid'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : loan.payment_status === 'pending'
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#fff',
              }}>
                {(loan.name || loan.first_name || '?')[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {loan.name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Unknown'}
                  </span>
                  <StatusBadge status={loan.payment_status} size="sm" />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                  <span>{formatPhone(loan.mpesa_phone || loan.phone)}</span>
                  <span>·</span>
                  <span>{shortId(loan.id)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: loan.payment_status === 'paid' ? '#10b981' : 'var(--text-primary)' }}>
                  {formatKES(loan.paid_amount || loan.amount)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {formatTimeAgo(loan.payment_received_at || loan.mpesa_requested_at || loan.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
