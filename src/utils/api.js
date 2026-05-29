const isLocalDevelopment =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalDevelopment
  ? 'http://localhost:5000/api'
  : 'https://loans-rx7r.onrender.com/api';

const getToken = () => localStorage.getItem('loanvia_admin_token') || '';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Server returned an unexpected response (HTTP ${res.status}). Make sure the backend is running on port 5000.`);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
};

export const adminAPI = {
  getStats: () => apiFetch('/stats'),
  getDailyAnalytics: () => apiFetch('/analytics/daily'),
  getHourlyAnalytics: () => apiFetch('/analytics/hourly'),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return apiFetch(`/transactions${qs ? `?${qs}` : ''}`);
  },
  exportTransactions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return apiFetch(`/transactions/export${qs ? `?${qs}` : ''}`);
  },
  getAuditLogs: () => apiFetch('/audit-logs'),
  getSettings: () => apiFetch('/settings'),
  updateSettings: (settings) => apiFetch('/settings', { method: 'POST', body: JSON.stringify(settings) }),
};

export default adminAPI;
