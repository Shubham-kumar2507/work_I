#include "ThreadSafeQueue.h"
#include "MetricCollector.h"

// Explicit template instantiation for SystemMetrics
template class ThreadSafeQueue<MetricCollector::SystemMetrics>;
