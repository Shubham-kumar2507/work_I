import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Devices API
export const devicesAPI = {
    getAll: () => api.get('/devices'),
    getById: (id) => api.get(`/devices/${id}`),
    getStats: () => api.get('/devices/stats/summary'),
    register: (deviceData) => api.post('/devices/register', deviceData),
    update: (id, deviceData) => api.put(`/devices/${id}`, deviceData),
    delete: (id) => api.delete(`/devices/${id}`)
};

// Metrics API
export const metricsAPI = {
    getByDevice: (deviceId, params) => api.get(`/metrics/${deviceId}`, { params }),
    submit: (metricData) => api.post('/metrics', metricData)
};

// Alerts API
export const alertsAPI = {
    getAll: () => api.get('/alerts'),
    getById: (id) => api.get(`/alerts/${id}`),
    create: (alertData) => api.post('/alerts', alertData),
    update: (id, alertData) => api.put(`/alerts/${id}`, alertData),
    delete: (id) => api.delete(`/alerts/${id}`)
};

// Datadog API
export const datadogAPI = {
    getMetrics: (query) => api.get('/datadog/metrics', { params: query })
};

// Health check
export const healthCheck = () => axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/health`);

export default api;
