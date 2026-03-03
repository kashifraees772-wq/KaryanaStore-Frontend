import { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
    MdDashboard, MdInventory2, MdPointOfSale,
    MdBarChart, MdSettings, MdLogout, MdClose
} from 'react-icons/md';
import { AuthContext } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/items', icon: <MdInventory2 />, label: 'Items / Inventory' },
    { to: '/sales', icon: <MdPointOfSale />, label: 'Record Sale' },
    { to: '/reports', icon: <MdBarChart />, label: 'Reports' },
];

export default function Navbar({ isOpen, onClose }) {
    const { logout } = useContext(AuthContext);

    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="logo-icon">🛒</span>
                    <h1>Kashi Karyana Store</h1>
                </div>
                <button
                    className="mobile-menu-btn close-btn"
                    onClick={onClose}
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Close Navigation"
                >
                    <MdClose />
                </button>
            </div>

            <div className="sidebar-nav">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        {icon}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '12px 16px', color: 'var(--text-muted)' }}
                >
                    <MdSettings /> <span>Settings</span>
                </NavLink>
                <button
                    className="nav-link"
                    onClick={() => { onClose(); logout(); }}
                    style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '12px 16px', color: '#ef4444' }}
                >
                    <MdLogout /> <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}
