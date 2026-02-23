const express = require('express');
const router = express.Router();
const datadogService = require('../services/datadogService');

// @route   GET /api/datadog/metrics/:deviceId
// @desc    Get metrics from Datadog for a device
// @access  Public
router.get('/metrics/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { timeRange = '1h' } = req.query;

        const data = await datadogService.getTimeSeries({ deviceId, timeRange });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch metrics from Datadog' });
    }
});

// @route   GET /api/datadog/metric/:deviceId/:metricName
// @desc    Get a specific metric from Datadog
// @access  Public
router.get('/metric/:deviceId/:metricName', async (req, res) => {
    try {
        const { deviceId, metricName } = req.params;
        const { from, to } = req.query;

        const fromTimestamp = from ? parseInt(from) : Math.floor((Date.now() - 3600000) / 1000);
        const toTimestamp = to ? parseInt(to) : Math.floor(Date.now() / 1000);

        const data = await datadogService.fetchMetrics({
            deviceId,
            metric: metricName,
            from: fromTimestamp,
            to: toTimestamp
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch metric from Datadog' });
    }
});

module.exports = router;
