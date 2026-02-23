#ifndef MONITORING_AGENT_H
#define MONITORING_AGENT_H

#include "MetricCollector.h"
#include "ThreadSafeQueue.h"
#include "DatadogSender.h"
#include "AnomalyDetector.h"
#include <thread>
#include <atomic>
#include <memory>

class MonitoringAgent {
private:
    std::unique_ptr<MetricCollector> collector;
    std::unique_ptr<DatadogSender> sender;
    std::unique_ptr<AnomalyDetector> anomalyDetector;
    
    std::thread samplerThread;
    std::thread dispatcherThread;
    
    ThreadSafeQueue<MetricCollector::SystemMetrics> dataQueue;
    
    std::atomic<bool> running;
    
    // Collection loop (runs in sampler thread)
    void collectLoop();
    
    // Sending loop (runs in dispatcher thread)
    void sendLoop();

public:
    MonitoringAgent();
    ~MonitoringAgent();
    
    // Start the monitoring agent
    void start();
    
    // Stop the monitoring agent
    void stop();
    
    // Check if agent is running
    bool isRunning() const;
    
    // Get queue size
    size_t getQueueSize() const;
};

#endif // MONITORING_AGENT_H
