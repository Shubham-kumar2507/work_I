#ifndef METRIC_COLLECTOR_H
#define METRIC_COLLECTOR_H

#include <chrono>
#include <memory>
#include <cstdint>

class MetricCollector {
public:
    struct SystemMetrics {
        double cpuUsage;
        double memoryUsage;
        double diskUsage;
        double networkIO;
        uint64_t timestamp;
        
        SystemMetrics() 
            : cpuUsage(0.0), memoryUsage(0.0), diskUsage(0.0), 
              networkIO(0.0), timestamp(0) {}
    };

private:
    std::chrono::milliseconds samplingInterval;
    
    // CPU monitoring helpers
    struct CpuStats {
        long long user;
        long long nice;
        long long system;
        long long idle;
        long long iowait;
        long long irq;
        long long softirq;
        
        long long getTotal() const {
            return user + nice + system + idle + iowait + irq + softirq;
        }
        
        long long getIdle() const {
            return idle + iowait;
        }
    };
    
    CpuStats previousCpuStats;
    bool hasPreviousStats;
    
    // Private metric collection methods
    CpuStats readCpuStats();
    double calculateCpuUsage(const CpuStats& current);
    double getMemoryUsage();
    double getDiskUsage();
    double getNetworkIO();

public:
    MetricCollector(std::chrono::milliseconds interval = std::chrono::milliseconds(1000));
    ~MetricCollector();
    
    // Collect all system metrics
    SystemMetrics collectMetrics();
    
    // Start continuous collection
    void startCollection();
    
    // Stop collection
    void stopCollection();
    
    // Get sampling interval
    std::chrono::milliseconds getSamplingInterval() const;
    
    // Set sampling interval
    void setSamplingInterval(std::chrono::milliseconds interval);
};

#endif // METRIC_COLLECTOR_H
