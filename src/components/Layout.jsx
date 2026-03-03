import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { MdMenu } from 'react-icons/md';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="layout">
            <div className="mobile-header">
                <div className="sidebar-logo" style={{ padding: 0, border: 'none' }}>
                    <span className="logo-icon" style={{ fontSize: '20px' }}>🛒</span>
                    <h1 style={{ fontSize: '16px' }}>Kashi Karyana Store</h1>
                </div>
                <button
                    className="mobile-menu-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle Navigation"
                >
                    <MdMenu />
                </button>
            </div>

            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            <Navbar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
