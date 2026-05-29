import React, { useState, useCallback, useEffect, useRef } from 'react';
import StatusBadge from '../components/StatusBadge';
import adminAPI from '../utils/api';
import { formatKESFull, formatDateTime, formatPhone, shortId, methodLabel } from '../utils/format';
import { exportCSV, exportPDF } from '../utils/export';

const LIMIT = 20;

const isSuspicious = (loan) => {
  if (loan.payment_status === 'failed' && loan.mpesa_result_code && loan.mpesa_result_code !== '1032') return true;
  return false;
};

const Th = ({ children, sortKey, sortBy, sortDir, onSort }) => {
  const active = sortBy === sortKey;
  return (
    <th onClick={() => sortKey && onSort(sortKey)} style={{
      padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem',
      fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-muted)',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      whiteSpace: 'nowrap', cursor: sortKey ? 'pointer' : 'default',
      userSelect: 'none', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
    }}>
      {children}{active ? (sortDir === 'DESC' ? ' ↓' : ' ↑') : ''}
    </th>
  );
};

const TransactionsPage = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('activity_at');
  const [sortDir, setSortDir] = useState('DESC');

  const [selected, setSelected] = useState(null);
  const searchTimer = useRef(null);

  const params = { page, limit: LIMIT, search, status, dateFrom, dateTo, sortBy, sortDir };

  const load = useCallback(async (p = params) => {
    setLoading(true);
    try {
      const data = await adminAPI.getTransactions(p);
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      load({ ...params, page: 1 });
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search, status, dateFrom, dateTo, sortBy, sortDir]); // eslint-disable-line

  useEffect(() => {
    load(params);
  }, [page]); // eslint-disable-line

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'DESC' ? 'ASC' : 'DESC');
    else { setSortBy(key); setSortDir('DESC'); }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const data = await adminAPI.exportTransactions({ search, status, dateFrom, dateTo });
      exportCSV(data, `loanvia-transactions-${Date.now()}.csv`);
    } finally { setExporting(false); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const data = await adminAPI.exportTransactions({ search, status, dateFrom, dateTo });
      await exportPDF(data, `loanvia-transactions-${Date.now()}.pdf`);
    } finally { setExporting(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const inputStyle = {
    padding: '8px 12px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none',
    transition: 'border-color var(--transition)',
  };

  const btnStyle = (variant = 'default') => ({
    padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    transition: 'all var(--transition)',
    ...(variant === 'primary' ? {
      background: 'var(--accent)', color: '#fff',
      boxShadow: '0 2px 8px var(--accent-glow)',
    } : {
      background: 'var(--bg-card)', color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    }),
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Filters bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '16px 20px',
        marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>⌕</span>
          <input
            type="text" placeholder="Search name, phone, receipt, ID…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: 30 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Status filter */}
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...inputStyle, minWidth: 140 }}>
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="not_initiated">Not Initiated</option>
        </select>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{ ...inputStyle, minWidth: 140 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{ ...inputStyle, minWidth: 140 }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Clear */}
        {(search || status || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); }}
            style={{ ...btnStyle(), color: 'var(--accent-danger)' }}>
            Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleExportCSV} disabled={exporting} style={btnStyle()}>
            {exporting ? '…' : '↓ CSV'}
          </button>
          <button onClick={handleExportPDF} disabled={exporting} style={btnStyle()}>
            {exporting ? '…' : '↓ PDF'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {total.toLocaleString()} record{total !== 1 ? 's' : ''} found
        </span>
        {loading && <span className="spinner" />}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <Th sortKey="id" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}>ID</Th>
                <Th sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}>Customer</Th>
                <Th>Phone</Th>
                <Th sortKey="paid_amount" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}>Paid</Th>
                <Th sortKey="payment_status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}>Status</Th>
                <Th>Receipt</Th>
                <Th>Method</Th>
                <Th sortKey="activity_at" sortBy={sortBy} sortDir={sortDir} onSort={handleSort}>Date</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading && !rows.length ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                        <div className="skeleton" style={{ height: 12, width: j === 1 ? '80%' : '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                rows.map((loan) => {
                  const suspicious = isSuspicious(loan);
                  return (
                    <tr key={loan.id}
                      onClick={() => setSelected(loan)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background var(--transition)',
                        background: suspicious ? 'rgba(245,158,11,0.03)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = suspicious ? 'rgba(245,158,11,0.03)' : 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {shortId(loan.id)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                          }}>
                            {(loan.name || loan.first_name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {loan.name || `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || '—'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              ID: {loan.id_number || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {formatPhone(loan.mpesa_phone || loan.phone)}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.85rem', color: loan.payment_status === 'paid' ? '#10b981' : 'var(--text-primary)' }}>
                        {formatKESFull(loan.paid_amount)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge status={loan.payment_status} />
                          {suspicious && <span title="Anomaly detected" style={{ fontSize: '0.75rem' }}>⚠</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {loan.mpesa_receipt_number || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {methodLabel(loan)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(loan.payment_received_at || loan.mpesa_requested_at || loan.created_at)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>View →</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.8rem', color: 'var(--text-muted)',
          }}>
            <span>Page {page} of {totalPages} · {total} records</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={{ ...btnStyle(), padding: '5px 10px', opacity: page === 1 ? 0.4 : 1 }}>«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ ...btnStyle(), padding: '5px 10px', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ ...btnStyle(p === page ? 'primary' : 'default'), padding: '5px 10px', minWidth: 32 }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ ...btnStyle(), padding: '5px 10px', opacity: page === totalPages ? 0.4 : 1 }}>›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ ...btnStyle(), padding: '5px 10px', opacity: page === totalPages ? 0.4 : 1 }}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} className="animate-fade" style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 18, padding: '28px 32px', maxWidth: 520, width: '100%',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Transaction Detail</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'monospace' }}>{shortId(selected.id)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {[
              ['Customer', selected.name || `${selected.first_name || ''} ${selected.last_name || ''}`.trim()],
              ['ID Number', selected.id_number],
              ['Phone', formatPhone(selected.phone)],
              ['M-PESA Phone', formatPhone(selected.mpesa_phone)],
              ['Loan Amount', formatKESFull(selected.amount)],
              ['Paid Amount', formatKESFull(selected.paid_amount)],
              ['Payment Status', <StatusBadge status={selected.payment_status} />],
              ['App Status', selected.status],
              ['Receipt No.', selected.mpesa_receipt_number || '—'],
              ['Checkout ID', selected.mpesa_checkout_request_id || '—'],
              ['Method', methodLabel(selected)],
              ['Result', selected.mpesa_result_desc || '—'],
              ['Requested At', formatDateTime(selected.mpesa_requested_at)],
              ['Paid At', formatDateTime(selected.payment_received_at)],
              ['Created At', formatDateTime(selected.created_at)],
              ['SMS Status', selected.approval_sms_status || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: '1px solid var(--border)',
                fontSize: '0.82rem',
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all', fontFamily: typeof v === 'string' && v.startsWith('ws') ? 'monospace' : 'inherit' }}>{v || '—'}</span>
              </div>
            ))}

            {isSuspicious(selected) && (
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ⚠ Anomaly detected — failed with non-standard result code {selected.mpesa_result_code}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
