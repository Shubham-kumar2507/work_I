#include "AnomalyDetector.h"
#include <cmath>
#include <numeric>
#include <algorithm>
#include <cstdlib>

AnomalyDetector::AnomalyDetector(size_t winSize, double thresh)
    : windowSize(winSize), threshold(thresh) {
}

double AnomalyDetector::calculateMean() const {
    if (slidingWindow.empty()) {
        return 0.0;
    }
    
    double sum = std::accumulate(slidingWindow.begin(), slidingWindow.end(), 0.0);
    return sum / slidingWindow.size();
}

double AnomalyDetector::calculateStdDev() const {
    if (slidingWindow.size() < 2) {
        return 0.0;
    }
    
    double mean = calculateMean();
    double sumSquaredDiff = 0.0;
    
    for (double value : slidingWindow) {
        double diff = value - mean;
        sumSquaredDiff += diff * diff;
    }
    
    double variance = sumSquaredDiff / slidingWindow.size();
    return std::sqrt(variance);
}

bool AnomalyDetector::isAnomaly(double value) {
    // Add value to sliding window
    slidingWindow.push_back(value);
    
    // Remove oldest value if window exceeds size
    if (slidingWindow.size() > windowSize) {
        slidingWindow.pop_front();
    }
    
    // Need at least a few samples to detect anomalies
    if (slidingWindow.size() < 10) {
        return false;
    }
    
    // Calculate statistics
    double mean = calculateMean();
    double stdDev = calculateStdDev();
    
    // Avoid division by zero
    if (stdDev < 0.001) {
        return false;
    }
    
    // 3-sigma rule: value is anomalous if it's more than 3 std deviations from mean
    double deviation = std::fabs(value - mean);
    return deviation > (threshold * stdDev);
}

void AnomalyDetector::addValue(double value) {
    slidingWindow.push_back(value);
    
    if (slidingWindow.size() > windowSize) {
        slidingWindow.pop_front();
    }
}

void AnomalyDetector::reset() {
    slidingWindow.clear();
}

size_t AnomalyDetector::getWindowSize() const {
    return windowSize;
}

void AnomalyDetector::setWindowSize(size_t size) {
    windowSize = size;
    
    // Trim window if necessary
    while (slidingWindow.size() > windowSize) {
        slidingWindow.pop_front();
    }
}

double AnomalyDetector::getThreshold() const {
    return threshold;
}

void AnomalyDetector::setThreshold(double thresh) {
    threshold = thresh;
}
