import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import useData from '../hooks/useData';
import adminAPI from '../utils/api';
import { formatDateTime, formatPhone, formatKESFull, shortId } from '../utils/format';

const eventType = (loan) => {
  if (loan.payment_status === 'paid') return { label: 'Payment Confirmed', color: '#10b981', icon: '✓' };
  if (loan.payment_status === 'pending') return { label: 'STK Push Sent', color: '#f59e0b', icon: '⟳' };
  if (loan.payment_status === 'failed') return { label: 'Payment Failed', color: '#ef4444', icon: '✕' };
  if (loan.status === 'application_submitted') return { label: 'Application Submitted', color: '#6366f1', icon: '✎' };
  return { label: loan.status || 'Activity', color: '#64748b', icon: '·' };
};

const smsLabel = (s) => {
  if (!s) return null;
  const map = { sent: { label: 'SMS Sent', color: '#10b981' }, failed: { label: 'SMS Failed', color: '#ef4444' }, sending: { label: 'SMS Sending', color: '#f59e0b' }, not_configured: { label: 'SMS Not Configured', color: '#64748b' } };
  return map[s] || null;
};

const AuditPage = () => {
  const { data: logs, loading, refetch } = useData(adminAPI.getAuditLogs, { interval: 20000 });
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = (logs || []).filter(l => {
    if (filter && l.payment_status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (l.name || '').toLowerCase().includes(s) ||
        (l.phone || '').includes(s) ||
        (l.mpesa_phone || '').includes(s) ||
        (l.mpesa_receipt_number || '').includes(s) ||
        String(l.id).includes(s)
      );
    }
    return true;
  });

  const inputStyle = {
    padding: '8px 12px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none',
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '16px 20px',
        marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>⌕</span>
          <input type="text" placeholder="Search name, phone, receipt…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: 30 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
          <option value="">All Events</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="not_initiated">Not Initiated</option>
        </select>
        <button onClick={refetch} style={{
          padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.8rem',
          fontWeight: 600, cursor: 'pointer',
        }}>↻ Refresh</button>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
        {loading && <span className="spinner" />}
      </div>

      {/* Timeline */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        {loading && !logs ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 10, width: '30%' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No audit events found
          </div>
        ) : (
          filtered.map((log, i) => {
            const ev = eventType(log);
            const sms = smsLabel(log.approval_sms_status);
            return (
              <div key={log.id} className="animate-fade" style={{
                animationDelay: `${Math.min(i * 20, 300)}ms`,
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', gap: 14, alignItems: 'flex-start',
                transition: 'background var(--transition)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Event icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: `${ev.color}18`,
                  border: `1px solid ${ev.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: ev.color, fontWeight: 700,
                }}>
                  {ev.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: ev.color }}>{ev.label}</span>
                    <StatusBadge status={log.payment_status} size="sm" />
                    {sms && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px',
                        borderRadius: 99, background: `${sms.color}15`, color: sms.color,
                        border: `1px solid ${sms.color}25`,
                      }}>{sms.label}</span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: 'auto' }}>
                      {shortId(log.id)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>
                      {log.name || `${log.first_name || ''} ${log.last_name || ''}`.trim() || 'Unknown'}
                    </span>
                    <span>{formatPhone(log.mpesa_phone || log.phone)}</span>
                    {log.paid_amount > 0 && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{formatKESFull(log.paid_amount)}</span>
                    )}
                    {log.mpesa_receipt_number && (
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.mpesa_receipt_number}</span>
                    )}
                  </div>

                  {log.mpesa_result_desc && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                      "{log.mpesa_result_desc}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.payment_received_at || log.mpesa_requested_at || log.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AuditPage;
