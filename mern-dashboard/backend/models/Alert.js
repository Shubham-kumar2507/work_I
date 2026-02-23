const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    metricType: {
        type: String,
        enum: ['cpu', 'memory', 'disk', 'network', 'heartbeat', 'custom'],
        required: true
    },
    condition: {
        operator: {
            type: String,
            enum: ['gt', 'lt', 'eq', 'gte', 'lte', 'ne'],
            required: true
        },
        threshold: {
            type: Number,
            required: true
        },
        duration: {
            type: Number, // Duration in seconds
            default: 60
        }
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'warning'
    },
    enabled: {
        type: Boolean,
        default: true
    },
    notifications: {
        email: {
            enabled: { type: Boolean, default: false },
            recipients: [String]
        },
        webhook: {
            enabled: { type: Boolean, default: false },
            url: String
        },
        slack: {
            enabled: { type: Boolean, default: false },
            webhookUrl: String
        }
    },
    history: [{
        triggeredAt: {
            type: Date,
            default: Date.now
        },
        value: Number,
        resolved: {
            type: Boolean,
            default: false
        },
        resolvedAt: Date
    }],
    lastTriggered: {
        type: Date
    },
    triggerCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to check if alert should trigger
alertSchema.methods.shouldTrigger = function (currentValue) {
    const { operator, threshold } = this.condition;

    switch (operator) {
        case 'gt': return currentValue > threshold;
        case 'lt': return currentValue < threshold;
        case 'eq': return currentValue === threshold;
        case 'gte': return currentValue >= threshold;
        case 'lte': return currentValue <= threshold;
        case 'ne': return currentValue !== threshold;
        default: return false;
    }
};

// Method to trigger alert
alertSchema.methods.trigger = function (value) {
    this.history.push({
        triggeredAt: new Date(),
        value: value,
        resolved: false
    });
    this.lastTriggered = new Date();
    this.triggerCount += 1;
    return this.save();
};

// Method to resolve latest alert
alertSchema.methods.resolveLatest = function () {
    if (this.history.length > 0) {
        const latest = this.history[this.history.length - 1];
        if (!latest.resolved) {
            latest.resolved = true;
            latest.resolvedAt = new Date();
            return this.save();
        }
    }
    return Promise.resolve(this);
};

// Get active alerts for a device
alertSchema.statics.getActiveAlerts = function (deviceId) {
    return this.find({
        deviceId: deviceId,
        enabled: true
    });
};

// Index for efficient queries
alertSchema.index({ deviceId: 1, enabled: 1 });
alertSchema.index({ severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
