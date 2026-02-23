# C++ Monitoring Agent

A lightweight C++ agent for collecting metrics from IoT devices and transmitting them to the control plane.

## Features

- Real-time metric collection
- Low resource footprint
- Secure data transmission (HTTPS)
- Configurable monitoring intervals
- Support for custom metrics

## Prerequisites

- CMake 3.20+
- GCC 9+ or Clang 10+
- libcurl (for HTTP requests)
- Boost libraries
- OpenSSL

## Building

```bash
mkdir build
cd build
cmake ..
make
```

## Configuration

Create a `config.json` file:

```json
{
  "device_id": "device-001",
  "api_endpoint": "https://your-dashboard.com/api/metrics",
  "api_key": "your-api-key",
  "collection_interval_ms": 5000,
  "metrics": [
    "cpu_usage",
    "memory_usage",
    "temperature",
    "network_stats"
  ]
}
```

## Running

```bash
./iot-agent --config config.json
```

## Project Structure

```
cpp-agent/
├── CMakeLists.txt          # CMake build configuration
├── src/                    # Source files
│   ├── main.cpp
│   ├── agent.cpp
│   ├── metrics/            # Metric collectors
│   └── network/            # Network communication
├── include/                # Header files
├── tests/                  # Unit tests
└── config/                 # Configuration templates
```

## Next Steps

1. Implement metric collection modules
2. Set up HTTP client for API communication
3. Add configuration parser
4. Implement logging system
5. Write unit tests
