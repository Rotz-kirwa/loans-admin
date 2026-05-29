import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useData from '../hooks/useData';
import adminAPI from '../utils/api';
import { formatKES, formatDate } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {p.name.toLowerCase().includes('revenue') ? formatKES(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const ChartCard = ({ title, sub, children, loading }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px 20px 12px',
  }}>
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
    {loading ? <div className="skeleton" style={{ height: 220 }} /> : children}
  </div>
);

const AnalyticsPage = () => {
  const { data: daily, loading: dailyLoading } = useData(adminAPI.getDailyAnalytics, { interval: 60000 });
  const { data: hourly, loading: hourlyLoading } = useData(adminAPI.getHourlyAnalytics, { interval: 30000 });
  const { data: stats } = useData(adminAPI.getStats, { interval: 30000 });

  const dailyData = (daily || []).map(d => ({
    date: formatDate(d.date).replace(/\d{4}/, '').trim().replace(/,$/, ''),
    Revenue: Number(d.revenue || 0),
    Transactions: Number(d.transactions || 0),
    Paid: Number(d.paid || 0),
    Failed: Number(d.failed || 0),
    Pending: Number(d.pending || 0),
  }));

  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const hStr = String(h).padStart(2, '0');
    const found = (hourly || []).find(x => x.hour === hStr);
    return {
      hour: `${hStr}:00`,
      Revenue: Number(found?.revenue || 0),
      Transactions: Number(found?.transactions || 0),
    };
  });

  // Weekly aggregation from daily
  const weeklyData = (() => {
    if (!daily || daily.length === 0) return [];
    const weeks = {};
    daily.forEach(d => {
      const dt = new Date(d.date);
      const weekStart = new Date(dt);
      weekStart.setDate(dt.getDate() - dt.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: `W/E ${formatDate(key)}`, Revenue: 0, Paid: 0, Failed: 0 };
      weeks[key].Revenue += Number(d.revenue || 0);
      weeks[key].Paid += Number(d.paid || 0);
      weeks[key].Failed += Number(d.failed || 0);
    });
    return Object.values(weeks).slice(-8);
  })();

  const statCards = stats ? [
    { label: 'This Week Revenue', value: formatKES(stats.weekRevenue), color: '#6366f1' },
    { label: 'This Month Revenue', value: formatKES(stats.monthRevenue), color: '#10b981' },
    { label: 'Total Applications', value: stats.totalApplications?.toLocaleString(), color: '#06b6d4' },
    { label: 'Success Rate', value: `${stats.successRate}%`, color: '#f59e0b' },
  ] : [];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Stat pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} className="animate-fade" style={{
            animationDelay: `${i * 60}ms`,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 20px',
            flex: '1 1 160px',
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hourly today */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="Today's Hourly Activity" sub="Transactions and revenue by hour" loading={hourlyLoading}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={10}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatKES(v)} width={55} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="Revenue" fill="url(#hourGrad)" radius={[3, 3, 0, 0]} name="Revenue" />
              <Bar yAxisId="right" dataKey="Transactions" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Transactions" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Daily revenue + transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="Daily Revenue" sub="Last 30 days" loading={dailyLoading}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="dailyRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatKES(v)} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#dailyRevGrad)" dot={false} activeDot={{ r: 4 }} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Transaction Volume" sub="Paid vs Failed last 30 days" loading={dailyLoading}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="Paid" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Failed" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Weekly */}
      <ChartCard title="Weekly Revenue Summary" sub="Revenue and transaction counts by week" loading={dailyLoading}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatKES(v)} width={55} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} />
            <Bar yAxisId="left" dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar yAxisId="right" dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} name="Paid" opacity={0.8} />
            <Bar yAxisId="right" dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default AnalyticsPage;
