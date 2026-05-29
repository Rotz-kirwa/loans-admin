import React, { useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import ActivityFeed from '../components/ActivityFeed';
import { toast } from '../components/Toast';
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
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? formatKES(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const OverviewPage = () => {
  const { data: stats, loading: statsLoading } = useData(adminAPI.getStats, { interval: 30000 });
  const { data: daily, loading: dailyLoading } = useData(adminAPI.getDailyAnalytics, { interval: 60000 });
  const { data: txData } = useData(
    () => adminAPI.getTransactions({ limit: 20, sortBy: 'activity_at', sortDir: 'DESC' }),
    { interval: 15000 }
  );

  const prevPaidRef = useRef(null);

  useEffect(() => {
    if (!stats) return;
    if (prevPaidRef.current !== null && stats.totalPaid > prevPaidRef.current) {
      toast.success(`New payment received! Total: ${stats.totalPaid} transactions`);
    }
    prevPaidRef.current = stats.totalPaid;
  }, [stats]);

  const loans = txData?.rows || [];

  const pieData = stats ? [
    { name: 'Paid', value: stats.totalPaid },
    { name: 'Pending', value: stats.totalPending },
    { name: 'Failed', value: stats.totalFailed },
    { name: 'Not Initiated', value: Math.max(0, stats.totalApplications - stats.totalPaid - stats.totalPending - stats.totalFailed) },
  ].filter(d => d.value > 0) : [];

  const chartData = (daily || []).map(d => ({
    date: formatDate(d.date).replace(/\d{4}/, '').trim().replace(/,$/, ''),
    Revenue: d.revenue,
    Transactions: d.transactions,
    Paid: d.paid,
    Failed: d.failed,
  }));

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Metrics grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        <MetricCard icon="💰" label="Total Revenue" accent="#10b981"
          rawValue={Math.round(stats?.totalRevenue || 0)}
          value={formatKES(stats?.totalRevenue || 0)} prefix="KES " delay={0}
          trendLabel="All-time collected" />
        <MetricCard icon="✓" label="Successful Payments" accent="#6366f1"
          rawValue={stats?.totalPaid || 0} delay={60}
          trendLabel={`${stats?.successRate || 0}% success rate`} />
        <MetricCard icon="📅" label="Today's Revenue" accent="#06b6d4"
          rawValue={Math.round(stats?.todayRevenue || 0)}
          value={formatKES(stats?.todayRevenue || 0)} prefix="KES " delay={120}
          trendLabel={`${stats?.todayTransactions || 0} transactions today`} />
        <MetricCard icon="📊" label="This Month" accent="#f59e0b"
          rawValue={Math.round(stats?.monthRevenue || 0)}
          value={formatKES(stats?.monthRevenue || 0)} prefix="KES " delay={180}
          trendLabel="Last 30 days" />
        <MetricCard icon="⏳" label="Pending" accent="#f59e0b"
          rawValue={stats?.totalPending || 0} delay={240}
          trendLabel="Awaiting confirmation" />
        <MetricCard icon="⚡" label="Avg. Transaction" accent="#8b5cf6"
          rawValue={Math.round(stats?.avgTransactionValue || 0)}
          value={formatKES(stats?.avgTransactionValue || 0)} prefix="KES " delay={300}
          trendLabel="Per successful payment" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 20px 10px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Revenue Trend</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Last 30 days daily revenue</div>
          </div>
          {dailyLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => formatKES(v)} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Payment Status</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Distribution</div>
          </div>
          {statsLoading ? (
            <div className="skeleton" style={{ flex: 1, minHeight: 160 }} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {stats && (
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{stats.successRate}%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Success Rate</div>
            </div>
          )}
        </div>
      </div>

      {/* Bar chart + Activity feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 20px 10px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Daily Transactions</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Paid vs Failed per day</div>
          </div>
          {dailyLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={8} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Paid" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <ActivityFeed loans={loans} loading={!txData} />
      </div>
    </div>
  );
};

export default OverviewPage;
