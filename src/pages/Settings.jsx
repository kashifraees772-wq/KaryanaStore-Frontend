import { useState, useContext } from 'react';
import { MdSave } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
    const { admin } = useContext(AuthContext);
    const [email, setEmail] = useState(admin?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { email, currentPassword };
            if (newPassword) payload.newPassword = newPassword;

            const res = await api.put('/api/auth/update', payload);
            if (res.data.success) {
                toast.success('Settings updated successfully');
                setCurrentPassword('');
                setNewPassword('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="header">
                <h2>⚙️ Admin Settings</h2>
            </div>

            <div className="card" style={{ maxWidth: 600, margin: '20px auto' }}>
                <form onSubmit={handleSubmit} style={{ padding: 10 }}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">Current Password <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                            type="password"
                            className="form-input"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">New Password <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>(Leave empty to keep current)</span></label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', marginTop: 30 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 20px' }}>
                            <MdSave style={{ marginRight: 8 }} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
