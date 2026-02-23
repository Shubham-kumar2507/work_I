#ifndef DATADOG_SENDER_H
#define DATADOG_SENDER_H

#include "MetricCollector.h"
#include <string>
#include <curl/curl.h>

class DatadogSender {
private:
    std::string datadogHost;
    int datadogPort;
    std::string hostname;
    std::string agentId;
    CURL* curl;
    
    // Initialize curl
    void initCurl();
    
    // Cleanup curl
    void cleanupCurl();
    
    // Format metric for DogStatsD
    std::string formatMetric(const std::string& name, double value, 
                            const std::string& type, const std::string& tags);

public:
    DatadogSender(const std::string& host = "localhost", int port = 8125);
    ~DatadogSender();
    
    // Send metrics to Datadog via DogStatsD
    void sendMetrics(const MetricCollector::SystemMetrics& metrics);
    
    // Send individual metric
    void sendGauge(const std::string& metricName, double value, 
                   const std::string& tags = "");
    
    // Send via HTTP API (alternative to DogStatsD)
    bool sendViaHttpApi(const std::string& apiKey, 
                       const MetricCollector::SystemMetrics& metrics);
    
    // Set agent ID
    void setAgentId(const std::string& id);
};

#endif // DATADOG_SENDER_H
