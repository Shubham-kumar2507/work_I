#include "DatadogSender.h"
#include <iostream>
#include <sstream>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <cstring>

DatadogSender::DatadogSender(const std::string& host, int port)
    : datadogHost(host), datadogPort(port), agentId("agent-001"), curl(nullptr) {
    
    // Get hostname
    char hostnameBuffer[256];
    if (gethostname(hostnameBuffer, sizeof(hostnameBuffer)) == 0) {
        hostname = hostnameBuffer;
    } else {
        hostname = "unknown";
    }
    
    initCurl();
}

DatadogSender::~DatadogSender() {
    cleanupCurl();
}

void DatadogSender::initCurl() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();
}

void DatadogSender::cleanupCurl() {
    if (curl) {
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

std::string DatadogSender::formatMetric(const std::string& name, double value,
                                       const std::string& type, const std::string& tags) {
    std::ostringstream oss;
    oss << name << ":" << value << "|" << type;
    if (!tags.empty()) {
        oss << "|#" << tags;
    }
    return oss.str();
}

void DatadogSender::sendMetrics(const MetricCollector::SystemMetrics& metrics) {
    // Create UDP socket for DogStatsD
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        std::cerr << "Failed to create socket" << std::endl;
        return;
    }
    
    struct sockaddr_in servaddr;
    memset(&servaddr, 0, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_port = htons(datadogPort);
    servaddr.sin_addr.s_addr = inet_addr(datadogHost.c_str());
    
    // Prepare tags
    std::string metricTags = "host:" + hostname + ",agent:" + agentId + ",env:production";
    
    // Format and send metrics
    std::string cpuMetric = formatMetric("system.cpu.usage", metrics.cpuUsage, "g", metricTags);
    std::string memMetric = formatMetric("system.memory.usage", metrics.memoryUsage, "g", metricTags);
    std::string diskMetric = formatMetric("system.disk.usage", metrics.diskUsage, "g", metricTags);
    std::string netMetric = formatMetric("system.network.io", metrics.networkIO, "g", metricTags);
    
    // Send each metric via UDP
    sendto(sockfd, cpuMetric.c_str(), cpuMetric.length(), 0,
           (const struct sockaddr*)&servaddr, sizeof(servaddr));
    
    sendto(sockfd, memMetric.c_str(), memMetric.length(), 0,
           (const struct sockaddr*)&servaddr, sizeof(servaddr));
    
    sendto(sockfd, diskMetric.c_str(), diskMetric.length(), 0,
           (const struct sockaddr*)&servaddr, sizeof(servaddr));
    
    sendto(sockfd, netMetric.c_str(), netMetric.length(), 0,
           (const struct sockaddr*)&servaddr, sizeof(servaddr));
    
    close(sockfd);
}

void DatadogSender::sendGauge(const std::string& metricName, double value, const std::string& tags) {
    int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        std::cerr << "Failed to create socket" << std::endl;
        return;
    }
    
    struct sockaddr_in servaddr;
    memset(&servaddr, 0, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_port = htons(datadogPort);
    servaddr.sin_addr.s_addr = inet_addr(datadogHost.c_str());
    
    std::string metric = formatMetric(metricName, value, "g", tags);
    
    sendto(sockfd, metric.c_str(), metric.length(), 0,
           (const struct sockaddr*)&servaddr, sizeof(servaddr));
    
    close(sockfd);
}

bool DatadogSender::sendViaHttpApi(const std::string& apiKey, 
                                  const MetricCollector::SystemMetrics& metrics) {
    if (!curl) {
        std::cerr << "CURL not initialized" << std::endl;
        return false;
    }
    
    // Prepare JSON payload
    std::ostringstream jsonPayload;
    jsonPayload << "{"
                << "\"series\": ["
                << "  {\"metric\":\"system.cpu.usage\", \"points\":[[" 
                << metrics.timestamp / 1000 << "," << metrics.cpuUsage << "]], "
                << "   \"type\":\"gauge\", \"host\":\"" << hostname << "\"},"
                << "  {\"metric\":\"system.memory.usage\", \"points\":[[" 
                << metrics.timestamp / 1000 << "," << metrics.memoryUsage << "]], "
                << "   \"type\":\"gauge\", \"host\":\"" << hostname << "\"},"
                << "  {\"metric\":\"system.disk.usage\", \"points\":[[" 
                << metrics.timestamp / 1000 << "," << metrics.diskUsage << "]], "
                << "   \"type\":\"gauge\", \"host\":\"" << hostname << "\"},"
                << "  {\"metric\":\"system.network.io\", \"points\":[[" 
                << metrics.timestamp / 1000 << "," << metrics.networkIO << "]], "
                << "   \"type\":\"gauge\", \"host\":\"" << hostname << "\"}"
                << "]"
                << "}";
    
    std::string payload = jsonPayload.str();
    
    // Set up CURL request
    curl_easy_setopt(curl, CURLOPT_URL, "https://api.datadoghq.com/api/v1/series");
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
    
    // Set headers
    struct curl_slist* headers = nullptr;
    std::string apiHeader = "DD-API-KEY: " + apiKey;
    headers = curl_slist_append(headers, apiHeader.c_str());
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    
    // Perform request
    CURLcode res = curl_easy_perform(curl);
    
    curl_slist_free_all(headers);
    
    if (res != CURLE_OK) {
        std::cerr << "CURL error: " << curl_easy_strerror(res) << std::endl;
        return false;
    }
    
    return true;
}

void DatadogSender::setAgentId(const std::string& id) {
    agentId = id;
}
