import React, { useState, useEffect } from 'react';
import { FiServer, FiCheckCircle, FiXCircle, FiActivity } from 'react-icons/fi';
import { devicesAPI } from '../services/api';
import { onDeviceStatus, onDevicesStatusUpdated } from '../services/socket';
import StatsCard from '../components/StatsCard';
import DeviceCard from '../components/DeviceCard';
import './Dashboard.css';

const Dashboard = () => {
    const [devices, setDevices] = useState([]);
    const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, averageHealthScore: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [devicesRes, statsRes] = await Promise.all([
                devicesAPI.getAll(),
                devicesAPI.getStats()
            ]);
            setDevices(devicesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Real-time updates
        const unsubscribeStatus = onDeviceStatus((data) => {
            setDevices(prev => prev.map(device =>
                device.deviceId === data.deviceId
                    ? { ...device, status: data.status, lastHeartbeat: data.lastHeartbeat }
                    : device
            ));
        });

        const unsubscribeUpdated = onDevicesStatusUpdated(() => {
            fetchData();
        });

        return () => {
            unsubscribeStatus();
            unsubscribeUpdated();
        };
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Real-time IoT device monitoring</p>
                </div>
            </header>

            <section className="stats-section">
                <div className="grid grid-cols-4">
                    <StatsCard
                        icon={FiServer}
                        label="Total Devices"
                        value={stats.total}
                        gradient="var(--gradient-primary)"
                    />
                    <StatsCard
                        icon={FiCheckCircle}
                        label="Online"
                        value={stats.online}
                        gradient="var(--gradient-success)"
                    />
                    <StatsCard
                        icon={FiXCircle}
                        label="Offline"
                        value={stats.offline}
                        gradient="var(--gradient-warning)"
                    />
                    <StatsCard
                        icon={FiActivity}
                        label="Avg Health"
                        value={`${Math.round(stats.averageHealthScore)}/100`}
                        gradient="var(--gradient-info)"
                    />
                </div>
            </section>

            <section className="devices-section">
                <div className="section-header">
                    <h2 className="section-title">Active Devices</h2>
                    <a href="/devices" className="btn btn-primary">View All Devices</a>
                </div>

                {devices.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FiServer className="empty-icon" />
                        <h3>No devices registered</h3>
                        <p>Register your first IoT device to start monitoring</p>
                        <a href="/devices" className="btn btn-primary">Register Device</a>
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {devices.slice(0, 6).map((device) => (
                            <DeviceCard key={device.deviceId} device={device} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
