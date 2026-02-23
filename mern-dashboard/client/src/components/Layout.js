import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiServer, FiBell, FiActivity } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: FiHome, label: 'Dashboard' },
        { path: '/devices', icon: FiServer, label: 'Devices' },
        { path: '/alerts', icon: FiBell, label: 'Alerts' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="layout">
            <aside className="sidebar glass-card">
                <div className="sidebar-header">
                    <FiActivity className="logo-icon" />
                    <h1 className="logo-text">IoT Monitor</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="connection-status">
                        <div className="status-dot online"></div>
                        <span>Connected</span>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="content-wrapper fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
