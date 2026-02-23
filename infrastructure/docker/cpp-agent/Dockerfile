# Multi-stage build for C++ Agent
# Stage 1: Build environment
FROM gcc:11 AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    libcurl4-openssl-dev \
    libboost-all-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Build the agent
RUN mkdir -p build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    cmake --build . && \
    strip iot-agent

# Stage 2: Runtime environment (distroless for minimal attack surface)
FROM gcr.io/distroless/cc-debian11

# Copy the binary from builder
COPY --from=builder /app/build/iot-agent /usr/local/bin/iot-agent

# Copy configuration template
COPY --from=builder /app/config/config.json /etc/iot-agent/config.json

# Runtime user (non-root)
USER nonroot:nonroot

# Entry point
ENTRYPOINT ["/usr/local/bin/iot-agent"]
CMD ["--config", "/etc/iot-agent/config.json"]
