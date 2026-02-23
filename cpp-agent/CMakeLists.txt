cmake_minimum_required(VERSION 3.20)
project(IoTAgent VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(CURL REQUIRED)
find_package(Threads REQUIRED)
find_package(OpenSSL REQUIRED)

# Include nlohmann/json library (header-only)
include(FetchContent)
FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz
)
FetchContent_MakeAvailable(json)

# Include directories
include_directories(
    ${PROJECT_SOURCE_DIR}/include
    ${CURL_INCLUDE_DIRS}
    ${OPENSSL_INCLUDE_DIR}
)

# Source files
set(SOURCES
    src/main.cpp
    src/MetricCollector.cpp
    src/MonitoringAgent.cpp
    src/DatadogSender.cpp
    src/AnomalyDetector.cpp
    src/ConfigLoader.cpp
    src/ThreadSafeQueue.cpp
)

# Create executable
add_executable(iot-agent ${SOURCES})

# Link libraries
target_link_libraries(iot-agent
    PRIVATE
        ${CURL_LIBRARIES}
        Threads::Threads
        OpenSSL::SSL
        OpenSSL::Crypto
        nlohmann_json::nlohmann_json
)

# Compiler options
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(iot-agent PRIVATE
        -Wall
        -Wextra
        -Wpedantic
        -O2
    )
endif()

# Installation
install(TARGETS iot-agent DESTINATION bin)
install(FILES config/config.json DESTINATION etc/iot-agent)

# Enable testing
enable_testing()
add_subdirectory(tests)
