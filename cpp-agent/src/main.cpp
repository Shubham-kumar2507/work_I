#include "MonitoringAgent.h"
#include "ConfigLoader.h"
#include <iostream>
#include <csignal>
#include <atomic>
#include <thread>

// Global flag for graceful shutdown
std::atomic<bool> shutdownRequested(false);

void signalHandler(int signal) {
    if (signal == SIGINT || signal == SIGTERM) {
        std::cout << "\nShutdown signal received..." << std::endl;
        shutdownRequested = true;
    }
}

int main(int argc, char* argv[]) {
    std::cout << "=== IoT Monitoring Agent ===" << std::endl;
    std::cout << "Version 1.0.0" << std::endl;
    std::cout << std::endl;
    
    // Set up signal handlers
    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);
    
    // Load configuration
    std::string configPath = "config/config.json";
    if (argc > 1) {
        configPath = argv[1];
    }
    
    Config config = ConfigLoader::loadFromFile(configPath);
    
    // Display configuration
    std::cout << "Configuration:" << std::endl;
    std::cout << "  Agent ID: " << config.agentId << std::endl;
    std::cout << "  Sampling Interval: " << config.samplingIntervalMs.count() << " ms" << std::endl;
    std::cout << "  Datadog Host: " << config.datadogHost << std::endl;
    std::cout << "  Datadog Port: " << config.datadogPort << std::endl;
    std::cout << "  Anomaly Detection: " << (config.enableAnomalyDetection ? "Enabled" : "Disabled") << std::endl;
    std::cout << "  Use HTTP API: " << (config.useHttpApi ? "Yes" : "No (DogStatsD)") << std::endl;
    std::cout << std::endl;
    
    try {
        // Create and start monitoring agent
        MonitoringAgent agent;
        
        std::cout << "Starting monitoring agent..." << std::endl;
        agent.start();
        
        // Main loop - wait for shutdown signal
        while (!shutdownRequested && agent.isRunning()) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            
            // Print queue size every 10 seconds
            static int counter = 0;
            if (++counter >= 10) {
                std::cout << "Queue size: " << agent.getQueueSize() << std::endl;
                counter = 0;
            }
        }
        
        // Graceful shutdown
        std::cout << "Shutting down agent..." << std::endl;
        agent.stop();
        
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
    
    std::cout << "Agent stopped. Goodbye!" << std::endl;
    return 0;
}
