#include "MonitoringAgent.h"
#include <iostream>
#include <chrono>

MonitoringAgent::MonitoringAgent()
    : collector(std::make_unique<MetricCollector>()),
      sender(std::make_unique<DatadogSender>()),
      anomalyDetector(std::make_unique<AnomalyDetector>()),
      running(false) {
}

MonitoringAgent::~MonitoringAgent() {
    stop();
}

void MonitoringAgent::collectLoop() {
    std::cout << "Collector thread started" << std::endl;
    
    while (running) {
        try {
            // Collect metrics
            auto metrics = collector->collectMetrics();
            
            // Check for anomalies
            if (anomalyDetector->isAnomaly(metrics.cpuUsage)) {
                std::cout << "ANOMALY DETECTED: CPU usage = " << metrics.cpuUsage << "%" << std::endl;
            }
            
            // Push to queue for dispatcher
            dataQueue.push(metrics);
            
            // Sleep for sampling interval
            std::this_thread::sleep_for(collector->getSamplingInterval());
            
        } catch (const std::exception& e) {
            std::cerr << "Error in collect loop: " << e.what() << std::endl;
        }
    }
    
    std::cout << "Collector thread stopped" << std::endl;
}

void MonitoringAgent::sendLoop() {
    std::cout << "Dispatcher thread started" << std::endl;
    
    while (running) {
        try {
            // Pop metrics from queue (blocking)
            auto metricsOpt = dataQueue.pop();
            
            if (metricsOpt.has_value()) {
                auto& metrics = metricsOpt.value();
                
                // Send metrics to Datadog
                sender->sendMetrics(metrics);
                
                // Log metrics
                std::cout << "Sent metrics - CPU: " << metrics.cpuUsage 
                         << "%, Memory: " << metrics.memoryUsage 
                         << "%, Disk: " << metrics.diskUsage 
                         << "%, Network IO: " << metrics.networkIO << " MB" << std::endl;
            }
            
        } catch (const std::exception& e) {
            std::cerr << "Error in send loop: " << e.what() << std::endl;
        }
    }
    
    std::cout << "Dispatcher thread stopped" << std::endl;
}

void MonitoringAgent::start() {
    if (running) {
        std::cout << "Agent is already running" << std::endl;
        return;
    }
    
    running = true;
    
    // Start sampler thread
    samplerThread = std::thread(&MonitoringAgent::collectLoop, this);
    
    // Start dispatcher thread
    dispatcherThread = std::thread(&MonitoringAgent::sendLoop, this);
    
    std::cout << "Monitoring agent started" << std::endl;
}

void MonitoringAgent::stop() {
    if (!running) {
        return;
    }
    
    std::cout << "Stopping monitoring agent..." << std::endl;
    
    running = false;
    
    // Shutdown the queue to unblock dispatcher
    dataQueue.shutdown();
    
    // Wait for threads to finish
    if (samplerThread.joinable()) {
        samplerThread.join();
    }
    
    if (dispatcherThread.joinable()) {
        dispatcherThread.join();
    }
    
    std::cout << "Monitoring agent stopped" << std::endl;
}

bool MonitoringAgent::isRunning() const {
    return running;
}

size_t MonitoringAgent::getQueueSize() const {
    return dataQueue.size();
}
