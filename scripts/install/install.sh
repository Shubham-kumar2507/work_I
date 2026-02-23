#!/bin/bash
# One-click installer for IoT Agent
# Usage: curl -sL https://your-domain.com/install.sh | bash -s <DEVICE_ID> <API_KEY>

set -e

DEVICE_ID=$1
API_KEY=$2
DASHBOARD_URL=${3:-"https://your-domain.com"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Validate arguments
if [ -z "$DEVICE_ID" ] || [ -z "$API_KEY" ]; then
    log_error "Usage: $0 <DEVICE_ID> <API_KEY> [DASHBOARD_URL]"
    exit 1
fi

log_info "Installing IoT Agent for device: ${DEVICE_ID}"

# Detect OS and architecture
OS=""
ARCH=$(uname -m)

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

case $ARCH in
    x86_64)
        ARCH="amd64"
        ;;
    aarch64)
        ARCH="arm64"
        ;;
    armv7l)
        ARCH="armhf"
        ;;
    *)
        log_error "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

log_info "Detected OS: ${OS}, Architecture: ${ARCH}"

# Download and install based on OS
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    log_info "Installing Debian package..."
    
    PACKAGE_URL="${DASHBOARD_URL}/packages/iot-agent_1.0.0_${ARCH}.deb"
    TEMP_DEB="/tmp/iot-agent.deb"
    
    wget -q "${PACKAGE_URL}" -O "${TEMP_DEB}" || {
        log_error "Failed to download package from ${PACKAGE_URL}"
        exit 1
    }
    
    dpkg -i "${TEMP_DEB}" || {
        log_warn "Dependency issues detected, fixing..."
        apt-get install -f -y
    }
    
    rm -f "${TEMP_DEB}"
    
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    log_info "Installing RPM package..."
    
    PACKAGE_URL="${DASHBOARD_URL}/packages/iot-agent-1.0.0.${ARCH}.rpm"
    TEMP_RPM="/tmp/iot-agent.rpm"
    
    wget -q "${PACKAGE_URL}" -O "${TEMP_RPM}" || {
        log_error "Failed to download package from ${PACKAGE_URL}"
        exit 1
    }
    
    rpm -i "${TEMP_RPM}" || yum install -y "${TEMP_RPM}"
    
    rm -f "${TEMP_RPM}"
    
else
    log_error "Unsupported OS: ${OS}"
    log_info "Please install manually from ${DASHBOARD_URL}/downloads"
    exit 1
fi

# Configure agent
log_info "Configuring agent..."

cat > /etc/iot-agent/config.json << EOF
{
    "sampling_interval_ms": 1000,
    "datadog_host": "localhost",
    "datadog_port": 8125,
    "agent_id": "${DEVICE_ID}",
    "api_key": "${API_KEY}",
    "api_endpoint": "${DASHBOARD_URL}/api/metrics",
    "enable_anomaly_detection": true,
    "anomaly_window_size": 100,
    "anomaly_threshold": 3.0,
    "use_http_api": false
}
EOF

chown iot-agent:iot-agent /etc/iot-agent/config.json
chmod 600 /etc/iot-agent/config.json

# Start and enable service
log_info "Starting service..."
systemctl daemon-reload
systemctl enable iot-agent
systemctl start iot-agent

# Wait for service to start
sleep 2

# Check status
if systemctl is-active --quiet iot-agent; then
    log_info "✅ Agent installed and started successfully!"
    echo ""
    echo "========================================="
    echo "  Device ID: ${DEVICE_ID}"
    echo "  Status: Running"
    echo "  Dashboard: ${DASHBOARD_URL}"
    echo "========================================="
    echo ""
    echo "Useful commands:"
    echo "  Status:  sudo systemctl status iot-agent"
    echo "  Logs:    sudo journalctl -u iot-agent -f"
    echo "  Restart: sudo systemctl restart iot-agent"
    echo "  Stop:    sudo systemctl stop iot-agent"
    echo ""
else
    log_error "Failed to start agent"
    log_info "Check logs: sudo journalctl -u iot-agent -n 50"
    exit 1
fi
