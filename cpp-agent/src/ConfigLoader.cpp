#include "ConfigLoader.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>
#include <cstdlib>

using json = nlohmann::json;

Config ConfigLoader::loadFromFile(const std::string& path) {
    Config config;
    
    try {
        std::ifstream file(path);
        if (!file.is_open()) {
            std::cerr << "Failed to open config file: " << path << std::endl;
            std::cerr << "Using default configuration" << std::endl;
            return config;
        }
        
        json j = json::parse(file);
        
        // Parse configuration
        if (j.contains("sampling_interval_ms")) {
            config.samplingIntervalMs = std::chrono::milliseconds(
                j["sampling_interval_ms"].get<int>()
            );
        }
        
        if (j.contains("datadog_host")) {
            config.datadogHost = j["datadog_host"].get<std::string>();
        }
        
        if (j.contains("datadog_port")) {
            config.datadogPort = j["datadog_port"].get<int>();
        }
        
        if (j.contains("agent_id")) {
            config.agentId = j["agent_id"].get<std::string>();
        }
        
        if (j.contains("api_key")) {
            config.apiKey = j["api_key"].get<std::string>();
        }
        
        if (j.contains("enable_anomaly_detection")) {
            config.enableAnomalyDetection = j["enable_anomaly_detection"].get<bool>();
        }
        
        if (j.contains("anomaly_window_size")) {
            config.anomalyWindowSize = j["anomaly_window_size"].get<size_t>();
        }
        
        if (j.contains("anomaly_threshold")) {
            config.anomalyThreshold = j["anomaly_threshold"].get<double>();
        }
        
        if (j.contains("use_http_api")) {
            config.useHttpApi = j["use_http_api"].get<bool>();
        }
        
        std::cout << "Configuration loaded from: " << path << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error parsing config file: " << e.what() << std::endl;
        std::cerr << "Using default configuration" << std::endl;
    }
    
    return config;
}

bool ConfigLoader::saveToFile(const std::string& path, const Config& config) {
    try {
        json j;
        
        j["sampling_interval_ms"] = config.samplingIntervalMs.count();
        j["datadog_host"] = config.datadogHost;
        j["datadog_port"] = config.datadogPort;
        j["agent_id"] = config.agentId;
        j["api_key"] = config.apiKey;
        j["enable_anomaly_detection"] = config.enableAnomalyDetection;
        j["anomaly_window_size"] = config.anomalyWindowSize;
        j["anomaly_threshold"] = config.anomalyThreshold;
        j["use_http_api"] = config.useHttpApi;
        
        std::ofstream file(path);
        if (!file.is_open()) {
            std::cerr << "Failed to create config file: " << path << std::endl;
            return false;
        }
        
        file << j.dump(4); // Pretty print with 4 spaces
        std::cout << "Configuration saved to: " << path << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "Error saving config file: " << e.what() << std::endl;
        return false;
    }
}

Config ConfigLoader::loadFromEnv() {
    Config config;
    
    if (const char* interval = std::getenv("IOT_SAMPLING_INTERVAL")) {
        config.samplingIntervalMs = std::chrono::milliseconds(std::atoi(interval));
    }
    
    if (const char* host = getenv("DATADOG_HOST")) {
        config.datadogHost = host;
    }
    
    if (const char* port = std::getenv("DATADOG_PORT")) {
        config.datadogPort = std::atoi(port);
    }
    
    if (const char* agentId = std::getenv("IOT_AGENT_ID")) {
        config.agentId = agentId;
    }
    
    if (const char* apiKey = std::getenv("DATADOG_API_KEY")) {
        config.apiKey = apiKey;
    }
    
    std::cout << "Configuration loaded from environment variables" << std::endl;
    return config;
}
