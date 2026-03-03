import { useState, useEffect, useRef } from 'react';
import {
    MdAdd, MdDelete, MdReceipt, MdPointOfSale,
    MdClose, MdCheck, MdPrint, MdList, MdGridView
} from 'react-icons/md';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import api from '../api/axios';

/* ── Bill Preview / Reprint Modal ───────────────────────────────────────────── */
function BillModal({ cart, items, date, note, billNumber, onClose, onConfirm, loading, isReprint }) {
    const billRef = useRef(null);
    const grandTotal = cart.reduce((acc, c) => acc + c.salePrice * c.qty, 0);

    const handleSaveImage = async () => {
        if (!billRef.current) return;
        try {
            toast.loading('Saving bill image...', { id: 'saving' });
            const canvas = await html2canvas(billRef.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
            const link = document.createElement('a');
            const dateStr = new Date(date).toISOString().split('T')[0];
            const bnStr = billNumber ? `${billNumber}-` : '';
            link.download = `Kashi-Karyana-Store-${bnStr}${dateStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Bill saved as image!', { id: 'saving' });
        } catch { toast.error('Failed to save image', { id: 'saving' }); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <h3 className="modal-title">🧾 {isReprint ? 'Reprint Bill' : 'Sale Bill — Preview'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div ref={billRef} style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px dashed #cbd5e1' }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>🛒 Kashi Karyana Store</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Stock Sale Receipt</div>
                        {billNumber && (
                            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f1f5f9', borderRadius: 6, padding: '4px 16px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Bill #</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', letterSpacing: 1 }}>{billNumber}</span>
                            </div>
                        )}
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                            📅 {new Date(date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>#</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Item</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Qty</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Price</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((c, i) => {
                                const itemName = items ? items.find(it => it._id === c.itemId)?.name : c.itemName;
                                return (
                                    <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{i + 1}</td>
                                        <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1e293b' }}>{itemName || c.itemName}</td>
                                        <td style={{ padding: '9px 12px', textAlign: 'right', color: '#475569' }}>{c.qty}</td>
                                        <td style={{ padding: '9px 12px', textAlign: 'right', color: '#475569' }}>Rs {c.salePrice?.toLocaleString()}</td>
                                        <td style={{ padding: '9px 12px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>
                                            Rs {(c.qty * c.salePrice).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ borderTop: '2px dashed #cbd5e1', marginBottom: 14 }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>
                            Grand Total ({cart.length} item{cart.length > 1 ? 's' : ''})
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>Rs {grandTotal.toLocaleString()}</span>
                    </div>

                    {note && <p style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'center' }}>📝 Note: {note}</p>}

                    <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px dashed #cbd5e1', fontSize: 12, color: '#64748b' }}>
                        شکریہ — Thank you for your purchase!
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}><MdClose /> Close</button>
                    <button className="btn btn-secondary" onClick={handleSaveImage}><MdPrint /> Save as Image</button>
                    {!isReprint && (
                        <button className="btn btn-success" onClick={onConfirm} disabled={loading}>
                            {loading ? 'Processing...' : <><MdCheck /> Confirm Sale</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Bill-wise History Row ──────────────────────────────────────────────────── */
function BillRow({ bill, onReprint }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr
                style={{ cursor: 'pointer', background: expanded ? 'rgba(99,102,241,0.06)' : undefined }}
                onClick={() => setExpanded(e => !e)}
            >
                <td style={{ fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'monospace', fontSize: 14 }}>
                    {expanded ? '▼' : '▶'} {bill.billNumber || bill.billId?.slice(0, 8).toUpperCase()}
                </td>
                <td><span className="badge badge-blue">{bill.items.length} item{bill.items.length > 1 ? 's' : ''}</span></td>
                <td>{bill.totalUnits}</td>
                <td style={{ color: 'var(--secondary)', fontWeight: 700 }}>Rs {bill.totalAmount?.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(bill.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={e => { e.stopPropagation(); onReprint(bill); }}
                    >
                        🖨️ Reprint
                    </button>
                </td>
            </tr>
            {expanded && bill.items.map((item, i) => (
                <tr key={item._id} style={{ background: 'rgba(99,102,241,0.03)' }}>
                    <td style={{ paddingLeft: 32, color: 'var(--text-muted)', fontSize: 13 }}>↳ {item.itemName}</td>
                    <td></td>
                    <td style={{ fontSize: 13 }}>{item.quantitySold}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rs {item.salePrice?.toLocaleString()}</td>
                    <td style={{ fontSize: 13, color: 'var(--secondary)' }}>Rs {item.totalAmount?.toLocaleString()}</td>
                    <td></td>
                </tr>
            ))}
        </>
    );
}

/* ── Main Sales Page ───────────────────────────────────────────────────────── */
export default function Sales() {
    const [items, setItems] = useState([]);
    const [sales, setSales] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [previewBillNumber, setPreviewBillNumber] = useState('');
    const [reprintBill, setReprintBill] = useState(null);
    const [historyView, setHistoryView] = useState('bill');

    const [cart, setCart] = useState([]);
    const [row, setRow] = useState({ itemId: '', qty: '', salePrice: '' });
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    const fetchData = async () => {
        try {
            const [itemsRes, salesRes, billsRes] = await Promise.all([
                api.get('/api/items'),
                api.get('/api/sales'),
                api.get('/api/sales/bills'),
            ]);
            setItems(itemsRes.data.data);
            setSales(salesRes.data.data);
            setBills(billsRes.data.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleItemChange = e => {
        const id = e.target.value;
        const found = items.find(i => i._id === id);
        setRow(r => ({ ...r, itemId: id, salePrice: found ? found.price : '' }));
    };

    const addToCart = () => {
        if (!row.itemId || !row.qty || !row.salePrice) return toast.error('Select item, quantity and price');
        const found = items.find(i => i._id === row.itemId);
        if (!found) return;
        if (Number(row.qty) < 1) return toast.error('Quantity must be at least 1');
        if (Number(row.qty) > found.stock) return toast.error(`Only ${found.stock} ${found.unit} in stock`);
        const existing = cart.findIndex(c => c.itemId === row.itemId);
        if (existing !== -1) {
            const updated = [...cart];
            updated[existing] = { ...updated[existing], qty: Number(row.qty), salePrice: Number(row.salePrice) };
            setCart(updated);
            toast.success(`Updated: ${found.name}`);
        } else {
            setCart(c => [...c, { itemId: row.itemId, qty: Number(row.qty), salePrice: Number(row.salePrice) }]);
            toast.success(`Added: ${found.name}`);
        }
        setRow({ itemId: '', qty: '', salePrice: '' });
    };

    const removeFromCart = (itemId) => setCart(c => c.filter(r => r.itemId !== itemId));

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const res = await api.post('/api/sales/bulk', {
                items: cart.map(c => ({ itemId: c.itemId, quantitySold: c.qty, salePrice: c.salePrice })),
                date: saleDate, note,
            });
            const bn = res.data.billNumber || '';
            toast.success(`✅ Sale confirmed! ${bn ? `Bill ${bn}` : ''} — ${cart.length} item(s) sold.`);
            setCart([]);
            setRow({ itemId: '', qty: '', salePrice: '' });
            setNote('');
            setShowBill(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error recording sale');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale? Stock will be restored.')) return;
        try {
            await api.delete(`/api/sales/${id}`);
            toast.success('Sale deleted and stock restored');
            fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const handleReprint = (bill) => {
        const reprintCart = bill.items.map(item => ({
            itemId: item._id,
            itemName: item.itemName,
            qty: item.quantitySold,
            salePrice: item.salePrice,
        }));
        setReprintBill({ cart: reprintCart, date: bill.date, note: bill.note, billNumber: bill.billNumber || null });
    };

    const handleOpenBillPreview = async () => {
        try {
            const res = await api.get('/api/sales/next-bill-number');
            setPreviewBillNumber(res.data.billNumber || '');
        } catch {
            setPreviewBillNumber('');
        }
        setShowBill(true);
    };

    const grandTotal = cart.reduce((acc, c) => acc + c.qty * c.salePrice, 0);
    const selectedItem = items.find(i => i._id === row.itemId);
    const cartItemIds = cart.map(c => c.itemId);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">🧾 Record Sale</h2>
                    <p className="page-subtitle">Add multiple items, then confirm all at once</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, alignItems: 'start' }}>
                {/* Left: Add Item */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-title"><MdPointOfSale /> Add Item to Sale</div>
                        <div className="form-group">
                            <label className="form-label">Select Item *</label>
                            <select className="form-select" value={row.itemId} onChange={handleItemChange}>
                                <option value="">-- Choose Item --</option>
                                {items.filter(i => i.stock > 0).map(i => (
                                    <option key={i._id} value={i._id}>
                                        {cartItemIds.includes(i._id) ? '✓ ' : ''}{i.name} ({i.stock} {i.unit})
                                    </option>
                                ))}
                            </select>
                            {selectedItem && (
                                <span style={{ fontSize: 12, color: 'var(--secondary)' }}>
                                    Stock: {selectedItem.stock} {selectedItem.unit} | Price: Rs {selectedItem.price}
                                </span>
                            )}
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Quantity *</label>
                                <input type="number" className="form-input" value={row.qty}
                                    onChange={e => setRow(r => ({ ...r, qty: e.target.value }))}
                                    placeholder="0" min="1" max={selectedItem?.stock} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sale Price (Rs) *</label>
                                <input type="number" className="form-input" value={row.salePrice}
                                    onChange={e => setRow(r => ({ ...r, salePrice: e.target.value }))}
                                    placeholder="0" min="0" />
                            </div>
                        </div>
                        {row.qty && row.salePrice && (
                            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '8px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Line Total</span>
                                <strong style={{ color: 'var(--primary-light)' }}>Rs {(Number(row.qty) * Number(row.salePrice)).toLocaleString()}</strong>
                            </div>
                        )}
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addToCart}>
                            <MdAdd /> Add to Sale
                        </button>
                    </div>

                    <div className="card">
                        <div className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label">Sale Date</label>
                            <input type="date" className="form-input" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Note (optional)</label>
                            <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Cash payment..." />
                        </div>
                    </div>
                </div>

                {/* Right: Cart + History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Cart */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-title" style={{ marginBottom: 0 }}>
                                🛒 Current Sale
                                {cart.length > 0 && (
                                    <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, marginLeft: 10 }}>
                                        {cart.length} item{cart.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <button className="btn btn-success" onClick={handleOpenBillPreview}>
                                    <MdReceipt /> View Bill & Confirm
                                </button>
                            )}
                        </div>
                        {cart.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">🛒</div><p>Add items above to begin a sale.</p></div>
                        ) : (
                            <>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Item</th><th>Stock Left</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>
                                        <tbody>
                                            {cart.map(c => {
                                                const item = items.find(i => i._id === c.itemId);
                                                return (
                                                    <tr key={c.itemId}>
                                                        <td style={{ fontWeight: 600 }}>{item?.name}</td>
                                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item?.stock} {item?.unit}</td>
                                                        <td><span className="badge badge-blue">{c.qty}</span></td>
                                                        <td>Rs {c.salePrice.toLocaleString()}</td>
                                                        <td style={{ color: 'var(--secondary)', fontWeight: 700 }}>Rs {(c.qty * c.salePrice).toLocaleString()}</td>
                                                        <td><button className="btn btn-danger btn-sm" onClick={() => removeFromCart(c.itemId)}><MdDelete /></button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.06)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Grand Total</span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)' }}>Rs {grandTotal.toLocaleString()}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sales History */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-title" style={{ marginBottom: 0 }}>🕐 Sales History</div>
                            {/* Toggle buttons */}
                            <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                                <button onClick={() => setHistoryView('bill')}
                                    style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: historyView === 'bill' ? 'var(--primary)' : 'transparent', color: historyView === 'bill' ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                                    <MdGridView /> Bill-wise
                                </button>
                                <button onClick={() => setHistoryView('item')}
                                    style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: historyView === 'item' ? 'var(--primary)' : 'transparent', color: historyView === 'item' ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                                    <MdList /> Item-wise
                                </button>
                            </div>
                        </div>

                        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
                            <>
                                {/* ── Bill-wise View ── */}
                                {historyView === 'bill' && (
                                    bills.length === 0
                                        ? <div className="empty-state"><div className="empty-icon">🧾</div><p>No sales yet.</p></div>
                                        : (
                                            <div className="table-wrapper">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Bill #</th>
                                                            <th>Items</th>
                                                            <th>Total Units</th>
                                                            <th>Total Amount</th>
                                                            <th>Date</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bills.map(bill => (
                                                            <BillRow key={bill.billId} bill={bill} onReprint={handleReprint} />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                )}

                                {/* ── Item-wise View ── */}
                                {historyView === 'item' && (
                                    sales.length === 0
                                        ? <div className="empty-state"><div className="empty-icon">🧾</div><p>No sales yet.</p></div>
                                        : (
                                            <div className="table-wrapper">
                                                <table>
                                                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th><th></th></tr></thead>
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
                                                                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}><MdDelete /></button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* New Sale Bill Modal (pre-confirm preview) */}
            {showBill && (
                <BillModal
                    cart={cart} items={items} date={saleDate} note={note}
                    billNumber={previewBillNumber}
                    onClose={() => setShowBill(false)}
                    onConfirm={handleConfirm}
                    loading={submitting}
                    isReprint={false}
                />
            )}


            {/* Reprint Bill Modal */}
            {reprintBill && (
                <BillModal
                    cart={reprintBill.cart}
                    items={null}
                    date={reprintBill.date}
                    note={reprintBill.note}
                    billNumber={reprintBill.billNumber}
                    onClose={() => setReprintBill(null)}
                    onConfirm={null}
                    loading={false}
                    isReprint={true}
                />
            )}
        </div>
    );
}
