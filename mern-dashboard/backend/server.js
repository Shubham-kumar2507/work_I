const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const devicesRouter = require('./routes/devices');
const metricsRouter = require('./routes/metrics');
const alertsRouter = require('./routes/alerts');
const datadogRouter = require('./routes/datadog');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Make io available globally for routes
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot-dashboard';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/devices', devicesRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/datadog', datadogRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Agent heartbeat
    socket.on('agent:heartbeat', async (data) => {
        try {
            const Device = require('./models/Device');
            const device = await Device.findOne({ deviceId: data.deviceId });

            if (device) {
                device.lastHeartbeat = new Date();
                device.status = 'online';
                await device.save();

                // Broadcast to all connected clients
                io.emit('device:status', {
                    deviceId: data.deviceId,
                    status: 'online',
                    lastHeartbeat: device.lastHeartbeat
                });
            }
        } catch (err) {
            console.error('Error handling heartbeat:', err);
        }
    });

    // Client requesting device status updates
    socket.on('subscribe:device', (deviceId) => {
        socket.join(`device:${deviceId}`);
        console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
    });

    socket.on('unsubscribe:device', (deviceId) => {
        socket.leave(`device:${deviceId}`);
        console.log(`Client ${socket.id} unsubscribed from device ${deviceId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Periodic task to mark offline devices
setInterval(async () => {
    try {
        const Device = require('./models/Device');
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        const result = await Device.updateMany(
            {
                lastHeartbeat: { $lt: twoMinutesAgo },
                status: { $ne: 'offline' }
            },
            { status: 'offline' }
        );

        if (result.modifiedCount > 0) {
            console.log(`Marked ${result.modifiedCount} devices as offline`);

            // Notify clients
            io.emit('devices:status:updated');
        }
    } catch (err) {
        console.error('Error updating offline devices:', err);
    }
}, 30000); // Check every 30 seconds

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n=== IoT Dashboard Backend ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB: ${MONGODB_URI}`);
    console.log(`\nAPI Endpoints:`);
    console.log(`  GET  /health`);
    console.log(`  GET  /api/devices`);
    console.log(`  POST /api/devices/register`);
    console.log(`  POST /api/metrics`);
    console.log(`  GET  /api/alerts`);
    console.log(`\nWebSocket server ready on port ${PORT}`);
    console.log(`===========================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
