import { useState, useEffect } from 'react';
import { MdInventory2, MdPointOfSale, MdWarning, MdTrendingUp, MdRemoveShoppingCart } from 'react-icons/md';
import api from '../api/axios';
import { ToggleViewTable } from '../components/SalesView';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState(null); // null | 'low' | 'out'

    useEffect(() => {
        api.get('/api/reports/summary')
            .then(r => setSummary(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading-center"><div className="spinner" /></div>
    );

    const handleStatClick = (key) => {
        setActivePanel(prev => prev === key ? null : key); // toggle
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">📊 Dashboard</h2>
                    <p className="page-subtitle">Welcome back! Here's your store overview.</p>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: 20 }}>

                {/* Total Items */}
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <MdInventory2 style={{ fontSize: 26, color: '#818cf8' }} />
                    </div>
                    <div>
                        <div className="stat-value">{summary?.totalItems ?? 0}</div>
                        <div className="stat-label">Total Items</div>
                    </div>
                </div>

                {/* Today Sales */}
                <div className="stat-card">
                    <div className="stat-icon green">
                        <MdPointOfSale style={{ fontSize: 26, color: '#10b981' }} />
                    </div>
                    <div>
                        <div className="stat-value">{summary?.todaySalesCount ?? 0}</div>
                        <div className="stat-label">Today's Sales</div>
                    </div>
                </div>

                {/* Today Revenue */}
                <div className="stat-card">
                    <div className="stat-icon yellow">
                        <MdTrendingUp style={{ fontSize: 26, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <div className="stat-value">Rs {(summary?.todayRevenue ?? 0).toLocaleString()}</div>
                        <div className="stat-label">Today's Revenue</div>
                    </div>
                </div>

                {/* Low Stock — clickable */}
                <div
                    className="stat-card"
                    onClick={() => handleStatClick('low')}
                    style={{
                        cursor: 'pointer',
                        border: activePanel === 'low'
                            ? '1.5px solid #f59e0b'
                            : '1px solid var(--border)',
                        background: activePanel === 'low' ? 'rgba(245,158,11,0.07)' : undefined,
                        transition: 'all 0.2s',
                    }}
                >
                    <div className="stat-icon yellow">
                        <MdWarning style={{ fontSize: 26, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: '#f59e0b' }}>
                            {summary?.lowStockItems?.length ?? 0}
                        </div>
                        <div className="stat-label">Low Stock</div>
                        <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
                            {activePanel === 'low' ? '▲ Hide items' : '▼ Show items'}
                        </div>
                    </div>
                </div>

                {/* Out of Stock — clickable */}
                <div
                    className="stat-card"
                    onClick={() => handleStatClick('out')}
                    style={{
                        cursor: 'pointer',
                        border: activePanel === 'out'
                            ? '1.5px solid #ef4444'
                            : '1px solid var(--border)',
                        background: activePanel === 'out' ? 'rgba(239,68,68,0.07)' : undefined,
                        transition: 'all 0.2s',
                    }}
                >
                    <div className="stat-icon red">
                        <MdRemoveShoppingCart style={{ fontSize: 26, color: '#ef4444' }} />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: '#ef4444' }}>
                            {summary?.outOfStockItems?.length ?? 0}
                        </div>
                        <div className="stat-label">Out of Stock</div>
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                            {activePanel === 'out' ? '▲ Hide items' : '▼ Show items'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Inline Items Panel ── */}
            {activePanel === 'low' && (
                <div className="card" style={{
                    border: '1.5px solid rgba(245,158,11,0.4)',
                    background: 'rgba(245,158,11,0.04)',
                    marginBottom: 20,
                    padding: 0,
                }}>
                    <div style={{
                        padding: '14px 24px',
                        borderBottom: '1px solid rgba(245,158,11,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div className="card-title" style={{ marginBottom: 0, color: '#f59e0b' }}>
                            ⚠️ Low Stock Items — ({summary?.lowStockItems?.length ?? 0})
                        </div>
                        <button
                            onClick={() => setActivePanel(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                            ×
                        </button>
                    </div>
                    {summary?.lowStockItems?.length === 0 ? (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>✅ No low stock items!</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Item Name</th><th>Category</th><th>Stock</th><th>Unit</th></tr>
                                </thead>
                                <tbody>
                                    {summary.lowStockItems.map((item, i) => (
                                        <tr key={item._id}>
                                            <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                                            <td><span className="badge badge-blue">{item.category}</span></td>
                                            <td><span className="badge badge-yellow">{item.stock}</span></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activePanel === 'out' && (
                <div className="card" style={{
                    border: '1.5px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.04)',
                    marginBottom: 20,
                    padding: 0,
                }}>
                    <div style={{
                        padding: '14px 24px',
                        borderBottom: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div className="card-title" style={{ marginBottom: 0, color: '#ef4444' }}>
                            ❌ Out of Stock Items — ({summary?.outOfStockItems?.length ?? 0})
                        </div>
                        <button
                            onClick={() => setActivePanel(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                            ×
                        </button>
                    </div>
                    {summary?.outOfStockItems?.length === 0 ? (
                        <div className="empty-state" style={{ padding: 24 }}>
                            <p>✅ All items are in stock!</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Item Name</th><th>Category</th><th>Stock</th><th>Unit</th></tr>
                                </thead>
                                <tbody>
                                    {summary.outOfStockItems.map((item, i) => (
                                        <tr key={item._id}>
                                            <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                                            <td><span className="badge badge-blue">{item.category}</span></td>
                                            <td><span className="badge badge-red">Out</span></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Recent Sales ── */}
            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div className="card-title" style={{ marginBottom: 0 }}>🕐 Recent Sales</div>
                </div>
                <ToggleViewTable sales={summary?.recentSales || []} compact />
            </div>
        </div>
    );
}
