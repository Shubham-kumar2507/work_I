const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// @route   GET /api/devices
// @desc    Get all devices
// @access  Public
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find().sort({ lastHeartbeat: -1 });
        res.json(devices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/devices/stats/summary
// @desc    Get dashboard statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Device.countDocuments();
        const online = await Device.getOnlineDevices().countDocuments();
        const offline = total - online;

        const avgHealthScore = await Device.aggregate([
            { $group: { _id: null, avgHealth: { $avg: '$healthScore' } } }
        ]);

        res.json({
            total,
            online,
            offline,
            averageHealthScore: avgHealthScore[0]?.avgHealth || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/devices/:id
// @desc    Get device by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.id });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json(device);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/devices/register
// @desc    Register a new device
// @access  Public
router.post('/register', [
    body('name').notEmpty().withMessage('Device name is required'),
    body('type').isIn(['server', 'iot', 'edge', 'gateway']).withMessage('Invalid device type')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, type, location, metadata } = req.body;

        // Generate unique device ID
        const deviceId = 'device-' + crypto.randomBytes(8).toString('hex');

        const device = new Device({
            deviceId,
            name,
            type,
            location,
            metadata,
            status: 'pending'
        });

        await device.save();

        // Generate installation script
        const installScript = generateInstallScript(deviceId);

        res.status(201).json({
            device,
            installScript,
            message: 'Device registered successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/devices/:id
// @desc    Update device configuration
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.id });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const { name, type, configuration, location, metadata } = req.body;

        if (name) device.name = name;
        if (type) device.type = type;
        if (configuration) device.configuration = { ...device.configuration, ...configuration };
        if (location) device.location = location;
        if (metadata) device.metadata = metadata;

        await device.save();
        res.json({ device, message: 'Device updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/devices/:id
// @desc    Delete a device
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findOneAndDelete({ deviceId: req.params.id });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to generate installation script
function generateInstallScript(deviceId) {
    return `#!/bin/bash
# IoT Agent Installation Script
# Device ID: ${deviceId}

echo "Installing IoT Agent..."

# Download agent
wget https://your-server.com/agent/iot-agent-linux-amd64 -O /tmp/iot-agent

# Make executable
chmod +x /tmp/iot-agent

# Create config
cat > /etc/iot-agent/config.json << EOF
{
    "agent_id": "${deviceId}",
    "api_endpoint": "https://your-dashboard.com/api/metrics",
    "sampling_interval_ms": 1000,
    "datadog_host": "localhost",
    "datadog_port": 8125
}
EOF

# Start agent
/tmp/iot-agent --config /etc/iot-agent/config.json

echo "Agent installed and started!"
`;
}

module.exports = router;
