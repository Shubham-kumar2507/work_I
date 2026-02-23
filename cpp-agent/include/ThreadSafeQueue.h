#ifndef THREAD_SAFE_QUEUE_H
#define THREAD_SAFE_QUEUE_H

#include <queue>
#include <mutex>
#include <condition_variable>
#include <optional>

template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    mutable std::mutex mutex;
    std::condition_variable condVar;
    bool shutdownFlag;

public:
    ThreadSafeQueue() : shutdownFlag(false) {}
    
    // Push item to queue
    void push(const T& item) {
        std::lock_guard<std::mutex> lock(mutex);
        queue.push(item);
        condVar.notify_one();
    }
    
    void push(T&& item) {
        std::lock_guard<std::mutex> lock(mutex);
        queue.push(std::move(item));
        condVar.notify_one();
    }
    
    // Pop item from queue (blocking)
    std::optional<T> pop() {
        std::unique_lock<std::mutex> lock(mutex);
        condVar.wait(lock, [this] { return !queue.empty() || shutdownFlag; });
        
        if (shutdownFlag && queue.empty()) {
            return std::nullopt;
        }
        
        T item = std::move(queue.front());
        queue.pop();
        return item;
    }
    
    // Try to pop without blocking
    std::optional<T> tryPop() {
        std::lock_guard<std::mutex> lock(mutex);
        if (queue.empty()) {
            return std::nullopt;
        }
        
        T item = std::move(queue.front());
        queue.pop();
        return item;
    }
    
    // Check if queue is empty
    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.empty();
    }
    
    // Get queue size
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.size();
    }
    
    // Shutdown the queue
    void shutdown() {
        std::lock_guard<std::mutex> lock(mutex);
        shutdownFlag = true;
        condVar.notify_all();
    }
    
    // Clear the queue
    void clear() {
        std::lock_guard<std::mutex> lock(mutex);
        std::queue<T> empty;
        std::swap(queue, empty);
    }
};

#endif // THREAD_SAFE_QUEUE_H
