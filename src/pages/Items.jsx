import { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdDelete, MdEdit } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = ['General', 'Rice & Grains', 'Flour & Dough', 'Oil & Ghee', 'Spices', 'Pulses', 'Sugar & Salt', 'Dairy', 'Beverages', 'Snacks', 'Cleaning', 'Other'];
const UNITS = ['kg', 'g', 'liter', 'ml', 'piece', 'dozen', 'pack', 'bottle', 'bag', 'box'];

function ItemModal({ item, onClose, onSave }) {
    const isEdit = !!item?._id;
    const [form, setForm] = useState({
        name: item?.name || '',
        category: item?.category || 'General',
        price: item?.price || '',
        stock: item?.stock || '',
        unit: item?.unit || 'piece',
        store: item?.store || 'Main Store',
        date: item?.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.price || form.stock === '') return toast.error('Please fill all required fields');
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/api/items/${item._id}`, form);
                toast.success('Item updated!');
            } else {
                await api.post('/api/items', form);
                toast.success('Item added!');
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">{isEdit ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Item Name *</label>
                            <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="e.g. Basmati Rice" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Price (Rs) *</label>
                            <input name="price" type="number" className="form-input" value={form.price} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stock *</label>
                            <input name="stock" type="number" className="form-input" value={form.stock} onChange={handleChange} placeholder="0" min="0" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select name="unit" className="form-select" value={form.unit} onChange={handleChange}>
                                {UNITS.map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Store</label>
                            <input name="store" className="form-input" value={form.store} onChange={handleChange} placeholder="Main Store" />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 4 }}>
                        <label className="form-label">Date Added</label>
                        <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} />
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Auto-filled today's date. You can change it.</span>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const FILTERS = [
    { key: 'all', label: '📦 All', color: 'var(--primary-light)' },
    { key: 'instock', label: '✅ In Stock', color: '#10b981' },
    { key: 'low', label: '⚠️ Low Stock', color: '#f59e0b' },
    { key: 'out', label: '❌ Out of Stock', color: '#ef4444' },
];

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchItems = () => {
        setLoading(true);
        api.get('/api/items')
            .then(r => setItems(r.data.data))
            .catch(() => toast.error('Failed to load items'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchItems(); }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            await api.delete(`/api/items/${id}`);
            toast.success('Item deleted');
            fetchItems();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const getStockStatus = (stock) => {
        if (stock <= 0) return 'out';
        if (stock <= 5) return 'low';
        return 'instock';
    };

    const counts = {
        all: items.length,
        instock: items.filter(i => i.stock > 5).length,
        low: items.filter(i => i.stock > 0 && i.stock <= 5).length,
        out: items.filter(i => i.stock <= 0).length,
    };

    const filtered = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.category?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = stockFilter === 'all' || getStockStatus(i.stock) === stockFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">📦 Items / Inventory</h2>
                    <p className="page-subtitle">{items.length} total items in stock</p>
                </div>
                <button className="btn btn-primary" id="add-item-btn" onClick={() => { setEditItem(null); setShowModal(true); }}>
                    <MdAdd /> Add Item
                </button>
            </div>

            <div className="card" style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
                        <MdSearch />
                        <input placeholder="Search items by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStockFilter(f.key)}
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: 8,
                                    border: stockFilter === f.key ? `1.5px solid ${f.color}` : '1.5px solid var(--border)',
                                    background: stockFilter === f.key ? `${f.color}18` : 'transparent',
                                    color: stockFilter === f.key ? f.color : 'var(--text-muted)',
                                    fontFamily: 'var(--font)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                {f.label}
                                <span style={{
                                    background: stockFilter === f.key ? f.color : 'var(--border)',
                                    color: stockFilter === f.key ? '#fff' : 'var(--text-muted)',
                                    borderRadius: 20,
                                    padding: '1px 7px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}>
                                    {counts[f.key]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>{search ? 'No items match your search.' : 'No items yet. Add your first item!'}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Unit</th>
                                    <th>Store</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, i) => (
                                    <tr key={item._id}>
                                        <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td><span className="badge badge-blue">{item.category}</span></td>
                                        <td style={{ color: '#10b981' }}>Rs {item.price?.toLocaleString()}</td>
                                        <td style={{ fontWeight: 600 }}>{item.stock}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{item.store}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {new Date(item.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.stock <= 0 ? 'badge-red' : item.stock <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                                                {item.stock <= 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(item); setShowModal(true); }}>
                                                    <MdEdit />
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id, item.name)}>
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <ItemModal
                    item={editItem}
                    onClose={() => setShowModal(false)}
                    onSave={fetchItems}
                />
            )}
        </div>
    );
}
