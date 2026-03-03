import { useState, useRef } from 'react';
import { MdGridView, MdList, MdPrint } from 'react-icons/md';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { groupByBill } from '../utils/salesUtils';

export { groupByBill };

/* ── Mini Bill Reprint Modal ───────────────────────────────────────────────── */
function ReprintModal({ bill, onClose }) {
    const billRef = useRef(null);
    const billLabel = bill.billNumber || bill.billId?.slice(0, 8).toUpperCase() || '—';

    const handleSaveImage = async () => {
        try {
            toast.loading('Saving...', { id: 'rp' });
            const canvas = await html2canvas(billRef.current, { backgroundColor: '#ffffff', scale: 2 });
            const link = document.createElement('a');
            const d = new Date(bill.date).toISOString().split('T')[0];
            const bnStr = bill.billNumber ? `${bill.billNumber}-` : '';
            link.download = `Kashi-Karyana-Store-${bnStr}${d}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Saved!', { id: 'rp' });
        } catch { toast.error('Failed', { id: 'rp' }); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <h3 className="modal-title">🧾 Reprint — {billLabel}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div ref={billRef} style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px dashed #cbd5e1' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>🛒 Kashi Karyana Store</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Stock Sale Receipt</div>
                        {/* Bill Number Badge */}
                        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f1f5f9', borderRadius: 6, padding: '4px 16px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Bill #</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>{billLabel}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                            📅 {new Date(bill.date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 14 }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '7px 10px', textAlign: 'left', color: '#475569' }}>#</th>
                                <th style={{ padding: '7px 10px', textAlign: 'left', color: '#475569' }}>Item</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>Qty</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>Price</th>
                                <th style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((s, i) => (
                                <tr key={s._id || i} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{i + 1}</td>
                                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e293b' }}>{s.itemName}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#475569' }}>{s.quantitySold}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#475569' }}>Rs {s.salePrice?.toLocaleString()}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>Rs {s.totalAmount?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderTop: '2px dashed #cbd5e1', marginBottom: 12 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Grand Total ({bill.items.length} item{bill.items.length > 1 ? 's' : ''})</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>Rs {bill.totalAmount?.toLocaleString()}</span>
                    </div>
                    {bill.note && <p style={{ marginTop: 10, fontSize: 12, color: '#64748b', textAlign: 'center' }}>📝 {bill.note}</p>}
                    <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed #cbd5e1', fontSize: 11, color: '#94a3b8' }}>شکریہ — Thank you!</div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-secondary" onClick={handleSaveImage}><MdPrint /> Save as Image</button>
                </div>
            </div>
        </div>
    );
}

/* ── Expandable Bill Row ────────────────────────────────────────────────────── */
function BillRow({ bill, onReprint }) {
    const [expanded, setExpanded] = useState(false);
    const billLabel = bill.billNumber || (typeof bill.billId === 'string' ? bill.billId.slice(0, 8).toUpperCase() : '—');
    return (
        <>
            <tr style={{ cursor: 'pointer', background: expanded ? 'rgba(99,102,241,0.06)' : undefined }}
                onClick={() => setExpanded(e => !e)}>
                <td style={{ fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'monospace', fontSize: 14 }}>
                    {expanded ? '▼' : '▶'} {billLabel}
                </td>
                <td><span className="badge badge-blue">{bill.items.length} item{bill.items.length > 1 ? 's' : ''}</span></td>
                <td>{bill.totalUnits}</td>
                <td style={{ color: 'var(--secondary)', fontWeight: 700 }}>Rs {bill.totalAmount?.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(bill.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="print-hide">
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); onReprint(bill); }}>
                        🖨️ Reprint
                    </button>
                </td>
            </tr>
            {expanded && bill.items.map((s, i) => (
                <tr key={s._id || i} style={{ background: 'rgba(99,102,241,0.03)' }}>
                    <td style={{ paddingLeft: 32, color: 'var(--text-muted)', fontSize: 13 }}>↳ {s.itemName}</td>
                    <td></td>
                    <td style={{ fontSize: 13 }}>{s.quantitySold}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rs {s.salePrice?.toLocaleString()}</td>
                    <td style={{ fontSize: 13, color: 'var(--secondary)' }}>Rs {s.totalAmount?.toLocaleString()}</td>
                    <td className="print-hide"></td>
                </tr>
            ))}
        </>
    );
}

/* ── ToggleViewTable — reusable for Dashboard & Reports ─────────────────────── */
export function ToggleViewTable({ sales, compact = false }) {
    const [view, setView] = useState('bill');
    const [reprintBill, setReprintBill] = useState(null);
    const bills = groupByBill(sales);

    const toggleBtn = (key, label, icon) => (
        <button onClick={() => setView(key)}
            style={{ padding: '6px 14px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, background: view === key ? 'var(--primary)' : 'transparent', color: view === key ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
            {icon} {label}
        </button>
    );

    return (
        <>
            {/* Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: compact ? '10px 20px 4px' : '0 0 14px' }}>
                <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {toggleBtn('bill', 'Bill-wise', <MdGridView />)}
                    {toggleBtn('item', 'Item-wise', <MdList />)}
                </div>
            </div>

            {/* Bill-wise */}
            {view === 'bill' && (
                bills.length === 0
                    ? <div className="empty-state"><div className="empty-icon">🧾</div><p>No sales yet.</p></div>
                    : <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Bill #</th><th>Items</th><th>Units</th><th>Total</th><th>Date</th><th className="print-hide">Actions</th></tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => <BillRow key={bill.billId} bill={bill} onReprint={setReprintBill} />)}
                            </tbody>
                        </table>
                    </div>
            )}

            {/* Item-wise */}
            {view === 'item' && (
                !sales?.length
                    ? <div className="empty-state"><div className="empty-icon">🧾</div><p>No sales yet.</p></div>
                    : <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr></thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s._id}>
                                        <td style={{ fontWeight: 600 }}>{s.itemName}</td>
                                        <td>{s.quantitySold}</td>
                                        <td>Rs {s.salePrice?.toLocaleString()}</td>
                                        <td><span className="badge badge-green">Rs {s.totalAmount?.toLocaleString()}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {new Date(s.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
            )}

            {reprintBill && <ReprintModal bill={reprintBill} onClose={() => setReprintBill(null)} />}
        </>
    );
}
