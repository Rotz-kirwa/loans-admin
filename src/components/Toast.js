import React, { useState, useEffect, useCallback, useRef } from 'react';

let _addToast = null;

export const toast = {
  success: (msg) => _addToast?.({ type: 'success', msg }),
  error: (msg) => _addToast?.({ type: 'error', msg }),
  info: (msg) => _addToast?.({ type: 'info', msg }),
};

const icons = { success: '✓', error: '✕', info: 'ℹ' };
const colors = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  color: '#ef4444' },
  info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#6366f1' },
};

const Toast = ({ id, type, msg, onRemove }) => {
  const c = colors[type] || colors.info;
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <div className="animate-fade" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-secondary)',
      border: `1px solid ${c.border}`,
      boxShadow: 'var(--shadow)',
      minWidth: 260, maxWidth: 360,
      marginBottom: 8,
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
      }}>{icons[type]}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1 }}>{msg}</span>
      <button onClick={() => onRemove(id)} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: '0.9rem', padding: 2,
      }}>✕</button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback(({ type, msg }) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, type, msg }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 9999, display: 'flex', flexDirection: 'column-reverse',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
};
