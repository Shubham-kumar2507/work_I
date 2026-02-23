#ifndef CONFIG_LOADER_H
#define CONFIG_LOADER_H

#include <string>
#include <chrono>

struct Config {
    std::chrono::milliseconds samplingIntervalMs;
    std::string datadogHost;
    int datadogPort;
    std::string agentId;
    std::string apiKey;
    bool enableAnomalyDetection;
    size_t anomalyWindowSize;
    double anomalyThreshold;
    bool useHttpApi;
    
    Config()
        : samplingIntervalMs(1000),
          datadogHost("localhost"),
          datadogPort(8125),
          agentId("agent-001"),
          apiKey(""),
          enableAnomalyDetection(true),
          anomalyWindowSize(100),
          anomalyThreshold(3.0),
          useHttpApi(false) {}
};

class ConfigLoader {
public:
    // Load configuration from JSON file
    static Config loadFromFile(const std::string& path);
    
    // Save configuration to JSON file
    static bool saveToFile(const std::string& path, const Config& config);
    
    // Load from environment variables (fallback)
    static Config loadFromEnv();
};

#endif // CONFIG_LOADER_H
