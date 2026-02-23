const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { body, validationResult } = require('express-validator');

// @route   POST /api/metrics
// @desc    Submit metrics from agent
// @access  Public
router.post('/', [
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('cpuUsage').isNumeric().withMessage('CPU usage must be numeric'),
    body('memoryUsage').isNumeric().withMessage('Memory usage must be numeric'),
    body('diskUsage').isNumeric().withMessage('Disk usage must be numeric'),
    body('networkIO').isNumeric().withMessage('Network IO must be numeric')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { deviceId, cpuUsage, memoryUsage, diskUsage, networkIO } = req.body;

        // Find device and update metrics
        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Update metrics
        device.metrics.current = {
            cpuUsage,
            memoryUsage,
            diskUsage,
            networkIO
        };
        device.metrics.lastUpdated = new Date();
        device.lastHeartbeat = new Date();
        device.status = 'online';

        // Update health score
        device.updateHealthScore();

        await device.save();

        // Check alerts
        await checkAlerts(device);

        res.json({
            message: 'Metrics received',
            healthScore: device.healthScore
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/metrics/:deviceId
// @desc    Get metrics for a device
// @access  Public
router.get('/:deviceId', async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.deviceId });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json({
            deviceId: device.deviceId,
            metrics: device.metrics,
            healthScore: device.healthScore,
            status: device.status
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to check and trigger alerts
async function checkAlerts(device) {
    try {
        const alerts = await Alert.getActiveAlerts(device.deviceId);

        for (const alert of alerts) {
            let currentValue;

            // Get current value based on metric type
            switch (alert.metricType) {
                case 'cpu':
                    currentValue = device.metrics.current.cpuUsage;
                    break;
                case 'memory':
                    currentValue = device.metrics.current.memoryUsage;
                    break;
                case 'disk':
                    currentValue = device.metrics.current.diskUsage;
                    break;
                case 'network':
                    currentValue = device.metrics.current.networkIO;
                    break;
                default:
                    continue;
            }

            // Check if alert should trigger
            if (alert.shouldTrigger(currentValue)) {
                await alert.trigger(currentValue);
                console.log(`Alert triggered: ${alert.name} for device ${device.deviceId}`);

                // Emit socket event (will be handled by server.js)
                if (global.io) {
                    global.io.emit('alert:triggered', {
                        deviceId: device.deviceId,
                        alert: alert.name,
                        value: currentValue,
                        severity: alert.severity
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error checking alerts:', err);
    }
}

module.exports = router;
