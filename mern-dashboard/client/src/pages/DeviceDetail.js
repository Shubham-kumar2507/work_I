import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import { devicesAPI } from '../services/api';
import { subscribeToDevice, unsubscribeFromDevice, onDeviceStatus } from '../services/socket';
import MetricChart from '../components/MetricChart';
import './DeviceDetail.css';

const DeviceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const response = await devicesAPI.getById(id);
                setDevice(response.data);
                generateMockChartData();
            } catch (error) {
                console.error('Error fetching device:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevice();
        subscribeToDevice(id);

        const unsubscribe = onDeviceStatus((data) => {
            if (data.deviceId === id) {
                setDevice(prev => ({ ...prev, status: data.status, lastHeartbeat: data.lastHeartbeat }));
            }
        });

        return () => {
            unsubscribeFromDevice(id);
            unsubscribe();
        };
    }, [id]);

    const generateMockChartData = () => {
        const data = [];
        for (let i = 24; i >= 0; i--) {
            data.push({
                time: `${i}h ago`,
                cpu: Math.floor(Math.random() * 40) + 30,
                memory: Math.floor(Math.random() * 30) + 50,
                disk: Math.floor(Math.random() * 20) + 60,
                network: Math.floor(Math.random() * 50) + 20
            });
        }
        setChartData(data);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await devicesAPI.delete(id);
                navigate('/devices');
            } catch (error) {
                console.error('Error deleting device:', error);
                alert('Failed to delete device');
            }
        }
    };

    const downloadInstallScript = () => {
        const script = `#!/bin/bash
# IoT Agent Installation Script for ${device.name}
# Device ID: ${device.deviceId}

echo "Installing IoT Agent..."
# Add installation commands here
`;
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `install-${device.deviceId}.sh`;
        a.click();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading device details...</p>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="error-container">
                <h2>Device not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/devices')}>
                    Back to Devices
                </button>
            </div>
        );
    }

    return (
        <div className="device-detail-page">
            <div className="detail-header">
                <button className="btn btn-secondary" onClick={() => navigate('/devices')}>
                    <FiArrowLeft /> Back
                </button>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={downloadInstallScript}>
                        <FiDownload /> Install Script
                    </button>
                    <button className="btn btn-secondary">
                        <FiEdit /> Edit
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>

            <div className="device-info-card glass-card">
                <div className="info-header">
                    <div>
                        <h1 className="device-title">{device.name}</h1>
                        <p className="device-id">ID: {device.deviceId}</p>
                    </div>
                    <div className={`badge badge-${device.status}`}>
                        <div className={`status-dot ${device.status}`}></div>
                        {device.status}
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Type</span>
                        <span className="info-value">{device.type}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Health Score</span>
                        <span className="info-value">{device.healthScore}/100</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Location</span>
                        <span className="info-value">{device.location?.address || 'Not set'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Agent Version</span>
                        <span className="info-value">{device.agentVersion}</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <MetricChart
                    data={chartData}
                    dataKey="cpu"
                    title="CPU Usage"
                    color="var(--accent-purple)"
                    type="area"
                />
                <MetricChart
                    data={chartData}
                    dataKey="memory"
                    title="Memory Usage"
                    color="var(--accent-blue)"
                    type="area"
                />
                <MetricChart
                    data={chartData}
                    dataKey="disk"
                    title="Disk Usage"
                    color="var(--accent-cyan)"
                    type="line"
                />
                <MetricChart
                    data={chartData}
                    dataKey="network"
                    title="Network I/O"
                    color="var(--accent-pink)"
                    type="line"
                />
            </div>
        </div>
    );
};

export default DeviceDetail;
