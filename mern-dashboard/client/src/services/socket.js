import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event listeners
export const onDeviceStatus = (callback) => {
    const s = getSocket();
    s.on('device:status', callback);
    return () => s.off('device:status', callback);
};

export const onDevicesStatusUpdated = (callback) => {
    const s = getSocket();
    s.on('devices:status:updated', callback);
    return () => s.off('devices:status:updated', callback);
};

export const subscribeToDevice = (deviceId) => {
    const s = getSocket();
    s.emit('subscribe:device', deviceId);
};

export const unsubscribeFromDevice = (deviceId) => {
    const s = getSocket();
    s.emit('unsubscribe:device', deviceId);
};

export default { initSocket, getSocket, disconnectSocket };
