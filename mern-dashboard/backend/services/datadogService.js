const axios = require('axios');

class DatadogService {
    constructor() {
        this.apiKey = process.env.DATADOG_API_KEY;
        this.appKey = process.env.DATADOG_APP_KEY;
        this.site = process.env.DATADOG_SITE || 'datadoghq.com';
        this.baseUrl = `https://api.${this.site}/api/v1`;
    }

    /**
     * Fetch metrics from Datadog for a specific device
     * @param {Object} params - Query parameters
     * @param {string} params.deviceId - Device ID
     * @param {string} params.metric - Metric name (e.g., 'system.cpu.usage')
     * @param {number} params.from - Start timestamp (Unix seconds)
     * @param {number} params.to - End timestamp (Unix seconds)
     * @returns {Promise<Object>} Metric data
     */
    async fetchMetrics({ deviceId, metric, from, to }) {
        if (!this.apiKey || !this.appKey) {
            console.warn('Datadog API keys not configured');
            return this.getMockData(metric, from, to);
        }

        try {
            const query = `avg:${metric}{device:${deviceId}}`;

            const response = await axios.get(`${this.baseUrl}/query`, {
                params: {
                    query,
                    from,
                    to
                },
                headers: {
                    'DD-API-KEY': this.apiKey,
                    'DD-APPLICATION-KEY': this.appKey
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching Datadog metrics:', error.message);
            // Return mock data as fallback
            return this.getMockData(metric, from, to);
        }
    }

    /**
     * Fetch multiple metrics at once
     * @param {Object} params - Query parameters
     * @param {string} params.deviceId - Device ID
     * @param {number} params.from - Start timestamp
     * @param {number} params.to - End timestamp
     * @returns {Promise<Object>} All metrics
     */
    async fetchAllMetrics({ deviceId, from, to }) {
        const metrics = [
            'system.cpu.usage',
            'system.memory.usage',
            'system.disk.usage',
            'system.network.io'
        ];

        try {
            const results = await Promise.all(
                metrics.map(metric =>
                    this.fetchMetrics({ deviceId, metric, from, to })
                )
            );

            return {
                cpu: results[0],
                memory: results[1],
                disk: results[2],
                network: results[3]
            };
        } catch (error) {
            console.error('Error fetching all metrics:', error.message);
            throw error;
        }
    }

    /**
     * Get time-series data for dashboard charts
     * @param {Object} params - Query parameters
     * @param {string} params.deviceId - Device ID
     * @param {string} params.timeRange - Time range ('1h', '24h', '7d', '30d')
     * @returns {Promise<Object>} Time series data
     */
    async getTimeSeries({ deviceId, timeRange = '1h' }) {
        const now = Math.floor(Date.now() / 1000);
        const ranges = {
            '1h': 3600,
            '24h': 86400,
            '7d': 604800,
            '30d': 2592000
        };

        const from = now - (ranges[timeRange] || 3600);
        const to = now;

        return this.fetchAllMetrics({ deviceId, from, to });
    }

    /**
     * Generate mock data for development/testing
     */
    getMockData(metric, from, to) {
        const points = [];
        const duration = to - from;
        const interval = Math.max(duration / 100, 60); // Max 100 points

        for (let timestamp = from; timestamp <= to; timestamp += interval) {
            let value;

            // Generate realistic mock values based on metric type
            if (metric.includes('cpu')) {
                value = 30 + Math.random() * 40; // 30-70%
            } else if (metric.includes('memory')) {
                value = 40 + Math.random() * 30; // 40-70%
            } else if (metric.includes('disk')) {
                value = 50 + Math.random() * 20; // 50-70%
            } else if (metric.includes('network')) {
                value = Math.random() * 100; // 0-100 MB
            } else {
                value = Math.random() * 100;
            }

            points.push([timestamp, value]);
        }

        return {
            status: 'ok',
            series: [{
                metric,
                points,
                scope: `device:${deviceId}`,
                unit: metric.includes('network') ? 'MB' : '%'
            }]
        };
    }

    /**
     * Submit a custom metric to Datadog (for API-based submission)
     * @param {Object} metric - Metric data
     */
    async submitMetric(metric) {
        if (!this.apiKey) {
            console.warn('Datadog API key not configured, skipping metric submission');
            return;
        }

        try {
            await axios.post(`${this.baseUrl}/series`, {
                series: [metric]
            }, {
                headers: {
                    'DD-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error submitting metric to Datadog:', error.message);
        }
    }
}

module.exports = new DatadogService();
