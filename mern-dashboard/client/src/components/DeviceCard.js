import React from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiHardDrive, FiActivity } from 'react-icons/fi';
import './DeviceCard.css';

const DeviceCard = ({ device }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'online';
            case 'offline': return 'offline';
            case 'warning': return 'warning';
            default: return 'pending';
        }
    };

    const getHealthColor = (score) => {
        if (score >= 80) return 'var(--color-online)';
        if (score >= 50) return 'var(--color-warning)';
        return 'var(--color-offline)';
    };

    const formatLastSeen = (date) => {
        if (!date) return 'Never';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <Link to={`/devices/${device.deviceId}`} className="device-card-link">
            <div className="device-card glass-card scale-in">
                <div className="device-card-header">
                    <div className="device-info">
                        <h3 className="device-name">{device.name}</h3>
                        <span className="device-type">{device.type}</span>
                    </div>
                    <div className={`badge badge-${getStatusColor(device.status)}`}>
                        <div className={`status-dot ${getStatusColor(device.status)}`}></div>
                        {device.status}
                    </div>
                </div>

                <div className="device-metrics">
                    <div className="metric-item">
                        <FiCpu className="metric-icon" />
                        <div className="metric-content">
                            <span className="metric-label">CPU</span>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${device.metrics?.current?.cpuUsage || 0}%`,
                                        background: device.metrics?.current?.cpuUsage > 80 ? 'var(--color-offline)' : 'var(--gradient-primary)'
                                    }}
                                ></div>
                            </div>
                            <span className="metric-value">{device.metrics?.current?.cpuUsage || 0}%</span>
                        </div>
                    </div>

                    <div className="metric-item">
                        <FiHardDrive className="metric-icon" />
                        <div className="metric-content">
                            <span className="metric-label">Memory</span>
                            <div className="metric-bar">
                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${device.metrics?.current?.memoryUsage || 0}%`,
                                        background: device.metrics?.current?.memoryUsage > 80 ? 'var(--color-offline)' : 'var(--gradient-success)'
                                    }}
                                ></div>
                            </div>
                            <span className="metric-value">{device.metrics?.current?.memoryUsage || 0}%</span>
                        </div>
                    </div>
                </div>

                <div className="device-card-footer">
                    <div className="health-score">
                        <FiActivity className="health-icon" style={{ color: getHealthColor(device.healthScore) }} />
                        <span>Health: {device.healthScore}/100</span>
                    </div>
                    <span className="last-seen">{formatLastSeen(device.lastHeartbeat)}</span>
                </div>
            </div>
        </Link>
    );
};

export default DeviceCard;
