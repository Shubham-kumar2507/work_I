# MERN Dashboard - Control Plane

The web-based control plane for monitoring and managing IoT devices.

## Tech Stack

- **Frontend**: React 18+ with modern hooks
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Real-time**: Socket.io for live updates
- **Monitoring**: Datadog integration

## Features

- Real-time device monitoring dashboard
- Interactive data visualization (charts, graphs)
- Device management and configuration
- Alert configuration and notifications
- User authentication and authorization
- Historical data analysis

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/iot-dashboard
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iot-dashboard

# JWT Secret
JWT_SECRET=your-secret-key-here

# Datadog
DATADOG_API_KEY=your-datadog-api-key
DATADOG_APP_KEY=your-datadog-app-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Running

**Development Mode:**
```bash
# Run backend
npm run server

# Run frontend (in separate terminal)
npm run client

# Run both concurrently
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## Project Structure

```
mern-dashboard/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # Context providers
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── server.js           # Entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `POST /api/devices` - Register new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### Metrics
- `GET /api/metrics/:deviceId` - Get device metrics
- `POST /api/metrics` - Submit metrics (used by agent)

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert rule
- `PUT /api/alerts/:id` - Update alert rule
- `DELETE /api/alerts/:id` - Delete alert rule

## Next Steps

1. Initialize React app in `client/`
2. Set up Express server in `server/`
3. Create MongoDB schemas
4. Implement authentication
5. Build dashboard UI components
6. Integrate with Datadog
7. Implement real-time updates with Socket.io
