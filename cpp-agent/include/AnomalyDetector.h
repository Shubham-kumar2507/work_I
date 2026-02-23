#ifndef ANOMALY_DETECTOR_H
#define ANOMALY_DETECTOR_H

#include <deque>
#include <cstddef>

class AnomalyDetector {
private:
    std::deque<double> slidingWindow;
    size_t windowSize;
    double threshold; // Number of standard deviations
    
    // Calculate mean of sliding window
    double calculateMean() const;
    
    // Calculate standard deviation of sliding window
    double calculateStdDev() const;

public:
    AnomalyDetector(size_t winSize = 100, double thresh = 3.0);
    
    // Check if value is anomalous
    bool isAnomaly(double value);
    
    // Add value to window without checking
    void addValue(double value);
    
    // Clear the sliding window
    void reset();
    
    // Get current window size
    size_t getWindowSize() const;
    
    // Set window size
    void setWindowSize(size_t size);
    
    // Get threshold
    double getThreshold() const;
    
    // Set threshold
    void setThreshold(double thresh);
};

#endif // ANOMALY_DETECTOR_H
