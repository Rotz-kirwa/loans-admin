import React, { useEffect, useRef, useState } from 'react';

const useCountUp = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

const MetricCard = ({ icon, label, value, rawValue, trend, trendLabel, accent, delay = 0, prefix = '', suffix = '' }) => {
  const animated = useCountUp(rawValue ?? 0);
  const displayValue = rawValue != null ? `${prefix}${animated.toLocaleString()}${suffix}` : value;

  return (
    <div className="animate-fade" style={{
      animationDelay: `${delay}ms`,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color var(--transition), box-shadow var(--transition), transform var(--transition)',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent || 'var(--accent)';
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent || 'var(--accent)'}22, var(--shadow)`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: accent || 'var(--accent)',
        opacity: 0.06, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${accent || 'var(--accent)'}18`,
          border: `1px solid ${accent || 'var(--accent)'}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem',
        }}>
          {icon}
        </div>
        {trend != null && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px',
            borderRadius: 99,
            background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: trend >= 0 ? '#10b981' : '#ef4444',
            border: `1px solid ${trend >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {displayValue}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 5, fontWeight: 500 }}>
        {label}
      </div>
      {trendLabel && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {trendLabel}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
