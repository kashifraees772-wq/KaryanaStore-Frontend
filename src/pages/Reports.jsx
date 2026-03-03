import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MdBarChart, MdCalendarMonth, MdToday, MdPrint } from 'react-icons/md';
import api from '../api/axios';
import { ToggleViewTable } from '../components/SalesView';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
                {payload.map(p => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {p.dataKey === 'revenue' ? `Rs ${p.value?.toLocaleString()}` : p.value}
                        <span style={{ color: '#64748b', marginLeft: 6 }}>{p.name}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Reports() {
    const [tab, setTab] = useState('daily');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setData(null);
        api.get(`/api/reports/${tab}`)
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tab]);

    const tabConfig = [
        { key: 'daily', label: 'Daily', icon: <MdToday />, chartLabel: "Today's Sales by Hour" },
        { key: 'weekly', label: 'Weekly', icon: <MdBarChart />, chartLabel: 'Last 7 Days' },
        { key: 'monthly', label: 'Monthly', icon: <MdCalendarMonth />, chartLabel: 'This Month' },
        { key: 'yearly', label: 'Yearly', icon: <MdBarChart />, chartLabel: 'This Year' },
    ];

    const currentTab = tabConfig.find(t => t.key === tab);

    return (
        <div id="report-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">📈 Reports</h2>
                    <p className="page-subtitle">
                        {tab === 'daily' ? `Daily Sales — ${data?.date}`
                            : tab === 'weekly' ? 'Weekly Sales (Last 7 Days)'
                                : tab === 'monthly' ? 'Monthly Sales'
                                    : `Yearly Sales (${data?.date})`}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => {
                    document.documentElement.style.setProperty('--print-header-content', `'Kashi Karyana Store — ${tab === 'daily' ? data?.date : tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'Yearly'} Report'`);
                    window.print();
                }}
                    style={{ gap: 8 }}>
                    <MdPrint style={{ fontSize: 18 }} /> Print Report
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabConfig.map(t => (
                    <button
                        key={t.key}
                        className={`tab ${tab === t.key ? 'active' : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        <span style={{ marginRight: 6, verticalAlign: 'middle', display: 'inline-flex' }}>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="stats-grid" style={{ marginBottom: 20 }}>
                        <div className="stat-card">
                            <div className="stat-icon green">💰</div>
                            <div>
                                <div className="stat-value">Rs {data?.totalRevenue?.toLocaleString() ?? 0}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue">🛍️</div>
                            <div>
                                <div className="stat-value">{data?.totalSales ?? 0}</div>
                                <div className="stat-label">Units Sold</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellow">📋</div>
                            <div>
                                <div className="stat-value">{data?.sales?.length ?? 0}</div>
                                <div className="stat-label">Items</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card">
                        <div className="card-title">📊 {currentTab?.chartLabel} — Revenue Chart</div>
                        {data?.chartData?.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
                                        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue (Rs)"
                                            stroke="#6366f1" strokeWidth={2.5}
                                            fill="url(#colorRevenue)"
                                            dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Area type="monotone" dataKey="sales" name="Units Sold"
                                            stroke="#10b981" strokeWidth={2.5}
                                            fill="url(#colorSales)"
                                            dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <p>No sales data for this period.</p>
                            </div>
                        )}
                    </div>



                    {/* Transactions */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div className="card-title" style={{ marginBottom: 0 }}>
                                🧾 Items —{' '}
                                {tab === 'daily' ? data?.date : tab === 'weekly' ? 'Last 7 Days' : tab === 'monthly' ? 'This Month' : tab === 'yearly' ? 'This Year' : `Year ${data?.date}`}
                            </div>
                        </div>
                        <ToggleViewTable sales={data?.sales || []} compact />
                    </div>
                </>
            )}
        </div>
    );
}
