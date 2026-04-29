import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts';
import { fetchAdminStats } from '../services/admin.api';
// import './admin.scss';
import '../styles/admin.scss';

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 1200, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setValue(target); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return value;
}

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, prefix = '', suffix = '', trend, trendLabel, color, delay = 0, icon }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animated = useCountUp(typeof value === 'number' ? value : 0, 1200, inView);

  return (
    <motion.div
      ref={ref}
      className="admin-metric-card"
      style={{ '--accent': color }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="amc-top">
        <span className="amc-label">{label}</span>
        <span className="amc-icon">{icon}</span>
      </div>
      <div className="amc-value">
        {prefix}
        {typeof value === 'number' ? animated.toLocaleString() : value}
        {suffix}
      </div>
      {trend !== undefined && (
        <div className={`amc-trend ${trend >= 0 ? 'up' : 'down'}`}>
          <span className="amc-trend-arrow">{trend >= 0 ? '↑' : '↓'}</span>
          {Math.abs(trend)}% {trendLabel}
        </div>
      )}
      <div className="amc-bar-track">
        <motion.div
          className="amc-bar-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: '100%' } : {}}
          transition={{ duration: 1.4, delay: delay + 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ label, title, action }) {
  return (
    <div className="admin-section-header">
      <div>
        <div className="admin-section-label">{label}</div>
        <h2 className="admin-section-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-tooltip">
      <div className="admin-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="admin-tooltip-row">
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ── Feature Usage Rows ─────────────────────────────────────────────────────
function FeatureUsageRow({ name, count, max, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;

  return (
    <motion.div
      ref={ref}
      className="admin-feature-row"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <span className="admin-feature-name">{name}</span>
      <div className="admin-feature-bar-wrap">
        <motion.div
          className="admin-feature-bar"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.1, delay: delay + 0.2, ease: 'easeOut' }}
        />
      </div>
      <span className="admin-feature-count">{count.toLocaleString()}</span>
      <span className="admin-feature-pct">{pct}%</span>
    </motion.div>
  );
}

// ── Onboarding Funnel Row ──────────────────────────────────────────────────
function FunnelRow({ step, count, pct, index, prevPct }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const dropoff = index > 0 ? prevPct - pct : 0;

  const stateColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e';
  const stateBg    = pct >= 70 ? 'rgba(16,185,129,0.1)' : pct >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)';

  return (
    <motion.div
      ref={ref}
      className="admin-funnel-row"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="afr-index" style={{ background: stateBg, color: stateColor }}>
        {index + 1}
      </div>
      <div className="afr-content">
        <div className="afr-top">
          <span className="afr-label">{step}</span>
          <div className="afr-right">
            {dropoff > 0 && (
              <span className="afr-dropoff">-{dropoff}%</span>
            )}
            <span className="afr-pct" style={{ color: stateColor }}>{pct}%</span>
          </div>
        </div>
        <div className="afr-track">
          <motion.div
            className="afr-fill"
            style={{ background: stateColor }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : {}}
            transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
          />
        </div>
        <div className="afr-count">{count.toLocaleString()} users</div>
      </div>
    </motion.div>
  );
}

// ── Application Pipeline ───────────────────────────────────────────────────
function PipelineCard({ pipeline }) {
  if (!pipeline) return null;
  const stages = [
    { label: 'Pending',    count: pipeline.pending,           color: '#6366f1', pct: Math.round((pipeline.pending / pipeline.total) * 100) },
    { label: 'Shortlisted',count: pipeline.shortlisted,       color: '#10b981', pct: Math.round((pipeline.shortlisted / pipeline.total) * 100) },
    { label: 'Interview',  count: pipeline.interviewScheduled,color: '#f59e0b', pct: Math.round((pipeline.interviewScheduled / pipeline.total) * 100) },
    { label: 'Rejected',   count: pipeline.rejected,          color: '#f43f5e', pct: Math.round((pipeline.rejected / pipeline.total) * 100) },
  ];

  return (
    <div className="admin-pipeline">
      {stages.map((s, i) => (
        <motion.div
          key={s.label}
          className="admin-pipeline-stage"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <div className="aps-bar-wrap">
            <motion.div
              className="aps-bar"
              style={{ background: s.color }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(s.pct, 4)}%` }}
              transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
            />
          </div>
          <div className="aps-count" style={{ color: s.color }}>{s.count.toLocaleString()}</div>
          <div className="aps-label">{s.label}</div>
          <div className="aps-pct">{s.pct}%</div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Recent Upgrades ────────────────────────────────────────────────────────
function RecentUpgrade({ user, delay }) {
  const initials = user.username?.slice(0, 2).toUpperCase() || 'HB';
  const colors = ['#EEEDFE:#3C3489', '#E1F5EE:#085041', '#FAEEDA:#633806', '#FBEAF0:#4B1528'];
  const [bg, tc] = colors[user.username?.charCodeAt(0) % 4 || 0].split(':');
  const plan = user.subscriptionId?.includes('annual') ? 'Pro Annual' : 'Pro Monthly';
  const since = user.planStartDate
    ? new Date(user.planStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Recently';

  return (
    <motion.div
      className="admin-upgrade-row"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <div className="aur-avatar" style={{ background: bg, color: tc }}>{initials}</div>
      <div className="aur-info">
        <div className="aur-name">{user.username}</div>
        <div className="aur-email">{user.email}</div>
      </div>
      <div className="aur-right">
        <span className={`aur-plan ${plan.includes('Annual') ? 'annual' : 'monthly'}`}>{plan}</span>
        <div className="aur-since">{since}</div>
      </div>
    </motion.div>
  );
}

// ── Plan Donut Legend ──────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#7c3aed', '#c4b5fd'];
const PIE_LABELS = ['Pro monthly', 'Pro annual', 'Free'];

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchAdminStats()
      .then(res => {
        setStats(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load stats');
        setLoading(false);
      });
  }, [refreshKey]);

  const d = stats;

  const pieData = d ? [
    { name: 'Pro monthly', value: d.planDistribution.proMonthly },
    { name: 'Pro annual',  value: d.planDistribution.proAnnual  },
    { name: 'Free',        value: d.planDistribution.free       },
  ] : [];

  const FEATURE_COLORS = [
    '#4f46e5','#7c3aed','#10b981','#f59e0b','#f43f5e','#0ea5e9','#8b5cf6'
  ];

  const tabs = ['Overview', 'Features', 'Users', 'Pipeline'];

  return (
    <div className="admin-dashboard">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-logo-mark">H</div>
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">HireBot v2.0 · Real-time SaaS metrics</p>
          </div>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-live-badge">● Live</span>
          <motion.button
            className="admin-refresh-btn"
            onClick={() => setRefreshKey(k => k + 1)}
            whileTap={{ scale: 0.95 }}
          >
            ↻ Refresh
          </motion.button>
        </div>
      </div>

      {/* ── Nav tabs ──────────────────────────────────────────── */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <motion.div className="admin-tab-indicator" layoutId="tabIndicator" />
            )}
          </button>
        ))}
      </div>

      {/* ── Loading / Error ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            className="admin-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="admin-spinner" />
            <span>Loading platform metrics…</span>
          </motion.div>
        )}
        {error && (
          <motion.div key="error" className="admin-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ───────────────────────────────────────────── */}
      {!loading && !error && d && (
        <motion.div
          className="admin-content"
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          {/* ════════════════ OVERVIEW ════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Metric cards row */}
              <div className="admin-metrics-grid">
                <MetricCard
                  label="Monthly Recurring Revenue"
                  value={d.overview.mrr}
                  prefix="₹"
                  trend={23}
                  trendLabel="vs last month"
                  color="#4f46e5"
                  delay={0}
                  icon="₹"
                />
                <MetricCard
                  label="Total active users"
                  value={d.overview.totalUsers}
                  trend={d.overview.newUsersLastMonth > 0
                    ? Math.round(((d.overview.newUsersThisMonth - d.overview.newUsersLastMonth) / d.overview.newUsersLastMonth) * 100)
                    : null}
                  trendLabel="new this month"
                  color="#10b981"
                  delay={0.08}
                  icon="👥"
                />
                <MetricCard
                  label="Pro subscribers"
                  value={d.overview.proUsers}
                  suffix={` / ${d.overview.totalUsers}`}
                  trend={Math.round((d.overview.proUsers / d.overview.totalUsers) * 100)}
                  trendLabel="conversion"
                  color="#7c3aed"
                  delay={0.16}
                  icon="★"
                />
                <MetricCard
                  label="Churn rate"
                  value={d.overview.churnRate}
                  suffix="%"
                  trend={-0.3}
                  trendLabel="vs last month"
                  color="#f43f5e"
                  delay={0.24}
                  icon="↩"
                />
              </div>

              {/* MRR + Plan split */}
              <div className="admin-charts-row">
                <motion.div
                  className="admin-chart-card admin-chart-card--wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <SectionHeader
                    label="Revenue trend"
                    title="MRR growth · last 8 months"
                  />
                  <div className="admin-chart-legend">
                    <span><span className="legend-dot" style={{ background: '#4f46e5' }} />MRR (₹)</span>
                    <span><span className="legend-dot" style={{ background: '#10b981' }} />New subscribers</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={d.mrrTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="subsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="mrr" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="subs" orientation="right" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip prefix="₹" />} />
                      <Area yAxisId="mrr" type="monotone" dataKey="mrr" name="MRR" stroke="#4f46e5" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: '#4f46e5' }} />
                      <Area yAxisId="subs" type="monotone" dataKey="newSubs" name="New subs" stroke="#10b981" strokeWidth={2} fill="url(#subsGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  className="admin-chart-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.38 }}
                >
                  <SectionHeader label="Plan split" title="Subscribers by plan" />
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={48} outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={300}
                        animationDuration={900}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name) => [v.toLocaleString(), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="admin-pie-legend">
                    {PIE_LABELS.map((l, i) => (
                      <div key={l} className="admin-pie-legend-row">
                        <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                        <span className="apl-label">{l}</span>
                        <span className="apl-val">{pieData[i]?.value?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* User growth */}
              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.44 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <SectionHeader label="User growth" title="New registrations · last 8 months" />
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={d.userGrowthTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="newUsers" name="New users" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Recent upgrades */}
              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <SectionHeader label="Conversions" title="Recent Pro upgrades" />
                <div className="admin-upgrades-list">
                  {d.recentUpgrades.length === 0 && (
                    <p className="admin-empty">No upgrades yet.</p>
                  )}
                  {d.recentUpgrades.map((u, i) => (
                    <RecentUpgrade key={u._id || i} user={u} delay={i * 0.06} />
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* ════════════════ FEATURES ════════════════ */}
          {activeTab === 'features' && (
            <>
              <div className="admin-metrics-grid">
                <MetricCard label="Resume analyses (30d)" value={d.featureUsage.find(f => f.name === 'Resume analysis')?.count || 0} color="#4f46e5" delay={0} icon="📄" />
                <MetricCard label="Interview preps (30d)"  value={d.featureUsage.find(f => f.name === 'Interview prep')?.count  || 0} color="#7c3aed" delay={0.08} icon="🎤" />
                <MetricCard label="Applications (30d)"    value={d.featureUsage.find(f => f.name === 'Job applications')?.count || 0} color="#10b981" delay={0.16} icon="📨" />
                <MetricCard label="PDF exports (30d)"     value={d.featureUsage.find(f => f.name === 'PDF exports')?.count     || 0} color="#f59e0b" delay={0.24} icon="📑" />
              </div>

              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <SectionHeader label="Usage" title="Feature usage · last 30 days" />
                <div className="admin-feature-list">
                  {d.featureUsage.map((f, i) => (
                    <FeatureUsageRow
                      key={f.name}
                      name={f.name}
                      count={f.count}
                      max={d.featureUsage[0]?.count || 1}
                      color={FEATURE_COLORS[i % FEATURE_COLORS.length]}
                      delay={i * 0.07}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Feature usage bar chart */}
              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SectionHeader label="Visualisation" title="Feature events breakdown" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={d.featureUsage}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8888b0' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Events" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {d.featureUsage.map((_, i) => (
                        <Cell key={i} fill={FEATURE_COLORS[i % FEATURE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}

          {/* ════════════════ USERS ════════════════ */}
          {activeTab === 'users' && (
            <>
              <div className="admin-metrics-grid">
                <MetricCard label="Total users"          value={d.overview.totalUsers}       color="#4f46e5" delay={0}    icon="👤" />
                <MetricCard label="Pro subscribers"      value={d.overview.proUsers}          color="#7c3aed" delay={0.08} icon="★" />
                <MetricCard label="Free users"           value={d.overview.freeUsers}         color="#10b981" delay={0.16} icon="◯" />
                <MetricCard label="New this month"       value={d.overview.newUsersThisMonth} color="#f59e0b" delay={0.24} icon="+" />
              </div>

              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <SectionHeader label="Activation" title="Onboarding funnel · all-time" />
                <div className="admin-funnel-list">
                  {d.onboardingFunnel.map((row, i) => (
                    <FunnelRow
                      key={row.step}
                      step={row.step}
                      count={row.count}
                      pct={row.pct}
                      index={i}
                      prevPct={i > 0 ? d.onboardingFunnel[i - 1].pct : 100}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SectionHeader label="Conversions" title="Recent Pro upgrades" />
                <div className="admin-upgrades-list">
                  {d.recentUpgrades.map((u, i) => (
                    <RecentUpgrade key={u._id || i} user={u} delay={i * 0.06} />
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* ════════════════ PIPELINE ════════════════ */}
          {activeTab === 'pipeline' && (
            <>
              <div className="admin-metrics-grid">
                <MetricCard label="Total applications"   value={d.applicationPipeline.total}             color="#4f46e5" delay={0}    icon="📥" />
                <MetricCard label="Shortlisted"          value={d.applicationPipeline.shortlisted}        color="#10b981" delay={0.08} icon="✓" />
                <MetricCard label="Interview scheduled"  value={d.applicationPipeline.interviewScheduled} color="#f59e0b" delay={0.16} icon="📅" />
                <MetricCard label="Avg match score"      value={d.applicationPipeline.avgMatchScore}      suffix="%" color="#7c3aed" delay={0.24} icon="%" />
              </div>

              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <SectionHeader label="Recruiter pipeline" title="Application status breakdown" />
                <PipelineCard pipeline={d.applicationPipeline} />
              </motion.div>

              <motion.div
                className="admin-chart-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SectionHeader label="Jobs" title="Job listing overview" />
                <div className="admin-jobs-overview">
                  <div className="ajo-stat">
                    <div className="ajo-val" style={{ color: '#10b981' }}>{d.overview.activeJobs}</div>
                    <div className="ajo-label">Active listings</div>
                  </div>
                  <div className="ajo-divider" />
                  <div className="ajo-stat">
                    <div className="ajo-val">{d.overview.totalJobs}</div>
                    <div className="ajo-label">Total listings</div>
                  </div>
                  <div className="ajo-divider" />
                  <div className="ajo-stat">
                    <div className="ajo-val" style={{ color: '#f43f5e' }}>{d.overview.totalJobs - d.overview.activeJobs}</div>
                    <div className="ajo-label">Closed listings</div>
                  </div>
                  <div className="ajo-divider" />
                  <div className="ajo-stat">
                    <div className="ajo-val" style={{ color: '#f59e0b' }}>{d.overview.notificationsSent}</div>
                    <div className="ajo-label">Notifications (30d)</div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

        </motion.div>
      )}
    </div>
  );
}