const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['server', 'iot', 'edge', 'gateway'],
        default: 'iot'
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'warning', 'pending'],
        default: 'pending'
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    agentVersion: {
        type: String,
        default: '1.0.0'
    },
    healthScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    configuration: {
        samplingInterval: {
            type: Number,
            default: 1000
        },
        enableAnomalyDetection: {
            type: Boolean,
            default: true
        },
        datadogHost: {
            type: String,
            default: 'localhost'
        },
        datadogPort: {
            type: Number,
            default: 8125
        }
    },
    metrics: {
        current: {
            cpuUsage: { type: Number, default: 0 },
            memoryUsage: { type: Number, default: 0 },
            diskUsage: { type: Number, default: 0 },
            networkIO: { type: Number, default: 0 }
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Virtual for checking if device is online (heartbeat within last 2 minutes)
deviceSchema.virtual('isOnline').get(function() {
    if (!this.lastHeartbeat) return false;
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return this.lastHeartbeat > twoMinutesAgo;
});

// Method to update health score
deviceSchema.methods.updateHealthScore = function() {
    let score = 100;
    
    // Deduct points based on metrics
    if (this.metrics.current.cpuUsage > 80) score -= 20;
    else if (this.metrics.current.cpuUsage > 60) score -= 10;
    
    if (this.metrics.current.memoryUsage > 90) score -= 20;
    else if (this.metrics.current.memoryUsage > 70) score -= 10;
    
    if (this.metrics.current.diskUsage > 90) score -= 15;
    else if (this.metrics.current.diskUsage > 75) score -= 8;
    
    // Check heartbeat
    if (!this.isOnline) score -= 50;
    
    this.healthScore = Math.max(0, score);
    return this.healthScore;
};

// Static method to get online devices
deviceSchema.statics.getOnlineDevices = function() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    return this.find({ lastHeartbeat: { $gte: twoMinutesAgo } });
};

// Index for efficient queries
deviceSchema.index({ status: 1, lastHeartbeat: -1 });
deviceSchema.index({ type: 1 });

module.exports = mongoose.model('Device', deviceSchema);
