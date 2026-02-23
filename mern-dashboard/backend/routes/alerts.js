const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { body, validationResult } = require('express-validator');

// @route   GET /api/alerts
// @desc    Get all alerts or alerts for a specific device
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { deviceId } = req.query;

        const query = deviceId ? { deviceId } : {};
        const alerts = await Alert.find(query).sort({ createdAt: -1 });

        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/alerts
// @desc    Create a new alert rule
// @access  Public
router.post('/', [
    body('name').notEmpty().withMessage('Alert name is required'),
    body('deviceId').notEmpty().withMessage('Device ID is required'),
    body('metricType').isIn(['cpu', 'memory', 'disk', 'network', 'heartbeat', 'custom'])
        .withMessage('Invalid metric type'),
    body('condition.operator').isIn(['gt', 'lt', 'eq', 'gte', 'lte', 'ne'])
        .withMessage('Invalid operator'),
    body('condition.threshold').isNumeric().withMessage('Threshold must be numeric')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const alert = new Alert(req.body);
        await alert.save();

        res.status(201).json({
            alert,
            message: 'Alert rule created successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/alerts/:id
// @desc    Update an alert rule
// @access  Public
router.put('/:id', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        // Update fields
        const updatableFields = ['name', 'description', 'condition', 'severity',
            'enabled', 'notifications'];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                alert[field] = req.body[field];
            }
        });

        await alert.save();
        res.json({ alert, message: 'Alert updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete an alert rule
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json({ message: 'Alert deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/alerts/:id/resolve
// @desc    Resolve the latest triggered alert
// @access  Public
router.post('/:id/resolve', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        await alert.resolveLatest();
        res.json({ alert, message: 'Alert resolved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
