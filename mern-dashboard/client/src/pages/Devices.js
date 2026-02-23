import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { devicesAPI } from '../services/api';
import { onDeviceStatus, onDevicesStatusUpdated } from '../services/socket';
import DeviceCard from '../components/DeviceCard';
import './Devices.css';

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'iot',
        location: { address: '' }
    });

    const fetchDevices = async () => {
        try {
            const response = await devicesAPI.getAll();
            setDevices(response.data);
            setFilteredDevices(response.data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();

        const unsubscribeStatus = onDeviceStatus((data) => {
            setDevices(prev => prev.map(device =>
                device.deviceId === data.deviceId
                    ? { ...device, status: data.status, lastHeartbeat: data.lastHeartbeat }
                    : device
            ));
        });

        const unsubscribeUpdated = onDevicesStatusUpdated(() => {
            fetchDevices();
        });

        return () => {
            unsubscribeStatus();
            unsubscribeUpdated();
        };
    }, []);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredDevices(devices);
        } else {
            setFilteredDevices(devices.filter(d => d.status === filter));
        }
    }, [filter, devices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await devicesAPI.register(formData);
            setShowModal(false);
            setFormData({ name: '', type: 'iot', location: { address: '' } });
            fetchDevices();
        } catch (error) {
            console.error('Error registering device:', error);
            alert('Failed to register device');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading devices...</p>
            </div>
        );
    }

    return (
        <div className="devices-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Devices</h1>
                    <p className="page-subtitle">Manage your IoT devices</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Add Device
                </button>
            </header>

            <div className="filters-bar glass-card">
                <FiFilter className="filter-icon" />
                <div className="filter-buttons">
                    {['all', 'online', 'offline', 'warning', 'pending'].map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3">
                {filteredDevices.map((device) => (
                    <DeviceCard key={device.deviceId} device={device} />
                ))}
            </div>

            {filteredDevices.length === 0 && (
                <div className="empty-state glass-card">
                    <h3>No devices found</h3>
                    <p>Try adjusting your filters or add a new device</p>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal glass-card scale-in" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Register New Device</h2>
                        <form onSubmit={handleSubmit} className="device-form">
                            <div className="form-group">
                                <label>Device Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="My IoT Device"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Device Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="iot">IoT Device</option>
                                    <option value="server">Server</option>
                                    <option value="edge">Edge Device</option>
                                    <option value="gateway">Gateway</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={formData.location.address}
                                    onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
                                    placeholder="Building A, Floor 2"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Register Device
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Devices;
