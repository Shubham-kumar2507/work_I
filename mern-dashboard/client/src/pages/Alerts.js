import React, { useState, useEffect } from 'react';
import { FiPlus, FiBell, FiEdit, FiTrash2 } from 'react-icons/fi';
import { alertsAPI } from '../services/api';
import AlertBadge from '../components/AlertBadge';
import './Alerts.css';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const response = await alertsAPI.getAll();
            setAlerts(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading alerts...</p>
            </div>
        );
    }

    return (
        <div className="alerts-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Alerts</h1>
                    <p className="page-subtitle">Configure alert rules for your devices</p>
                </div>
                <button className="btn btn-primary">
                    <FiPlus /> Create Alert
                </button>
            </header>

            {alerts.length === 0 ? (
                <div className="empty-state glass-card">
                    <FiBell className="empty-icon" />
                    <h3>No alerts configured</h3>
                    <p>Create alert rules to get notified about device issues</p>
                    <button className="btn btn-primary">
                        <FiPlus /> Create Your First Alert
                    </button>
                </div>
            ) : (
                <div className="alerts-grid">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="alert-card glass-card">
                            <div className="alert-header">
                                <div>
                                    <h3 className="alert-name">{alert.name}</h3>
                                    <p className="alert-condition">{alert.condition?.type}</p>
                                </div>
                                <AlertBadge severity={alert.severity} />
                            </div>

                            <div className="alert-body">
                                <div className="alert-info">
                                    <span className="alert-label">Metric</span>
                                    <span className="alert-value">{alert.metric}</span>
                                </div>
                                <div className="alert-info">
                                    <span className="alert-label">Threshold</span>
                                    <span className="alert-value">{alert.condition?.threshold}</span>
                                </div>
                                <div className="alert-info">
                                    <span className="alert-label">Status</span>
                                    <span className={`badge ${alert.enabled ? 'badge-online' : 'badge-offline'}`}>
                                        {alert.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>

                            <div className="alert-actions">
                                <button className="action-btn">
                                    <FiEdit /> Edit
                                </button>
                                <button className="action-btn danger">
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
