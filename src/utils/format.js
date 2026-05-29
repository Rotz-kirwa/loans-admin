export const formatKES = (value) => {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`;
  return `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
};

export const formatKESFull = (value) =>
  `KES ${Number(value || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
};

export const formatTimeAgo = (value) => {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return formatDate(value);
};

export const formatPhone = (value) => {
  if (!value) return '—';
  const d = `${value}`.replace(/\D/g, '');
  if (d.startsWith('254') && d.length === 12) {
    return `+254 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  }
  return value;
};

export const statusLabel = (status) => {
  const map = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    not_initiated: 'Not Initiated',
  };
  return map[status] || status || '—';
};

export const statusColor = (status) => {
  const map = {
    paid: 'success',
    pending: 'warn',
    failed: 'danger',
    not_initiated: 'muted',
  };
  return map[status] || 'muted';
};

export const methodLabel = (loan) => {
  if (loan.mpesa_checkout_request_id) return 'M-PESA STK Push';
  if (loan.mpesa_receipt_number) return 'M-PESA Paybill';
  return 'M-PESA';
};

export const shortId = (id) => `#${String(id).padStart(5, '0')}`;
