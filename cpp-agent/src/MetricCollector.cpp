#include "MetricCollector.h"
#include <fstream>
#include <sstream>
#include <string>
#include <sys/sysinfo.h>
#include <sys/statvfs.h>
#include <chrono>
#include <iostream>

MetricCollector::MetricCollector(std::chrono::milliseconds interval)
    : samplingInterval(interval), hasPreviousStats(false) {
    // Initialize previous CPU stats
    previousCpuStats = readCpuStats();
}

MetricCollector::~MetricCollector() {
    stopCollection();
}

MetricCollector::CpuStats MetricCollector::readCpuStats() {
    CpuStats stats = {};
    std::ifstream statFile("/proc/stat");
    
    if (!statFile.is_open()) {
        std::cerr << "Failed to open /proc/stat" << std::endl;
        return stats;
    }
    
    std::string line;
    std::getline(statFile, line);
    
    // Parse the first line (cpu aggregate)
    std::istringstream iss(line);
    std::string cpu;
    iss >> cpu >> stats.user >> stats.nice >> stats.system >> stats.idle
        >> stats.iowait >> stats.irq >> stats.softirq;
    
    return stats;
}

double MetricCollector::calculateCpuUsage(const CpuStats& current) {
    if (!hasPreviousStats) {
        previousCpuStats = current;
        hasPreviousStats = true;
        return 0.0;
    }
    
    long long prevIdle = previousCpuStats.getIdle();
    long long idle = current.getIdle();
    
    long long prevTotal = previousCpuStats.getTotal();
    long long total = current.getTotal();
    
    long long totald = total - prevTotal;
    long long idled = idle - prevIdle;
    
    double cpuPercentage = 0.0;
    if (totald > 0) {
        cpuPercentage = (1.0 - static_cast<double>(idled) / totald) * 100.0;
    }
    
    previousCpuStats = current;
    return cpuPercentage;
}

double MetricCollector::getMemoryUsage() {
    struct sysinfo memInfo;
    
    if (sysinfo(&memInfo) != 0) {
        std::cerr << "Failed to get memory info" << std::endl;
        return 0.0;
    }
    
    long long totalMemory = memInfo.totalram * memInfo.mem_unit;
    long long freeMemory = memInfo.freeram * memInfo.mem_unit;
    long long usedMemory = totalMemory - freeMemory;
    
    return (static_cast<double>(usedMemory) / totalMemory) * 100.0;
}

double MetricCollector::getDiskUsage() {
    struct statvfs diskInfo;
    
    if (statvfs("/", &diskInfo) != 0) {
        std::cerr << "Failed to get disk info" << std::endl;
        return 0.0;
    }
    
    unsigned long long totalSpace = diskInfo.f_blocks * diskInfo.f_frsize;
    unsigned long long freeSpace = diskInfo.f_bfree * diskInfo.f_frsize;
    unsigned long long usedSpace = totalSpace - freeSpace;
    
    return (static_cast<double>(usedSpace) / totalSpace) * 100.0;
}

double MetricCollector::getNetworkIO() {
    // Read network statistics from /proc/net/dev
    std::ifstream netFile("/proc/net/dev");
    
    if (!netFile.is_open()) {
        std::cerr << "Failed to open /proc/net/dev" << std::endl;
        return 0.0;
    }
    
    std::string line;
    // Skip header lines
    std::getline(netFile, line);
    std::getline(netFile, line);
    
    unsigned long long totalBytes = 0;
    
    while (std::getline(netFile, line)) {
        // Skip loopback interface
        if (line.find("lo:") != std::string::npos) {
            continue;
        }
        
        std::istringstream iss(line);
        std::string iface;
        unsigned long long rxBytes, txBytes;
        
        iss >> iface >> rxBytes;
        
        // Skip 7 columns to get to transmit bytes
        for (int i = 0; i < 7; ++i) {
            unsigned long long temp;
            iss >> temp;
        }
        iss >> txBytes;
        
        totalBytes += (rxBytes + txBytes);
    }
    
    // Return total bytes in MB
    return static_cast<double>(totalBytes) / (1024.0 * 1024.0);
}

MetricCollector::SystemMetrics MetricCollector::collectMetrics() {
    SystemMetrics metrics;
    
    // Get current timestamp in milliseconds since epoch
    auto now = std::chrono::system_clock::now();
    auto duration = now.time_since_epoch();
    metrics.timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
    
    // Collect CPU usage
    CpuStats currentCpuStats = readCpuStats();
    metrics.cpuUsage = calculateCpuUsage(currentCpuStats);
    
    // Collect memory usage
    metrics.memoryUsage = getMemoryUsage();
    
    // Collect disk usage
    metrics.diskUsage = getDiskUsage();
    
    // Collect network I/O
    metrics.networkIO = getNetworkIO();
    
    return metrics;
}

void MetricCollector::startCollection() {
    std::cout << "Starting metric collection..." << std::endl;
    // This method will be called by MonitoringAgent
    // The actual continuous collection loop is in MonitoringAgent
}

void MetricCollector::stopCollection() {
    std::cout << "Stopping metric collection..." << std::endl;
}

std::chrono::milliseconds MetricCollector::getSamplingInterval() const {
    return samplingInterval;
}

void MetricCollector::setSamplingInterval(std::chrono::milliseconds interval) {
    samplingInterval = interval;
}
