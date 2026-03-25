# Development Environment Setup

This guide covers the complete development environment setup for the IoT Monitoring Dashboard project.

## Table of Contents
1. [C++ Development Environment](#cpp-development-environment)
2. [MERN Stack Environment](#mern-stack-environment)
3. [Infrastructure Tools](#infrastructure-tools)
4. [Datadog Integration](#datadog-integration)
5. [Cross-Platform Testing](#cross-platform-testing)

---

## C++ Development Environment

### Required Tools

#### 1. **CMake (3.20 or higher)**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install cmake

# Verify installation
cmake --version
```

#### 2. **Compiler: GCC or Clang**
```bash
# GCC
sudo apt-get install build-essential g++

# Clang (alternative)
sudo apt-get install clang

# Verify
g++ --version
# or
clang++ --version
```

#### 3. **Development Libraries**

**libcurl-dev** (for HTTP requests):
```bash
sudo apt-get install libcurl4-openssl-dev
```

**boost-dev** (Boost C++ libraries):
```bash
sudo apt-get install libboost-all-dev
```

**openssl-dev** (for secure communications):
```bash
sudo apt-get install libssl-dev
```

### Build Tools Setup
```bash
# Create build directory in cpp-agent
cd cpp-agent
mkdir build
cd build

# Generate build files
cmake ..

# Build the project
make
```

---

## MERN Stack Environment

### Required Tools

#### 1. **Node.js (v18 or higher)**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify
node --version
npm --version
```

#### 2. **MongoDB**

**Option A: Local Installation**
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string

#### 3. **React & Dependencies**
```bash
# Navigate to mern-dashboard
cd mern-dashboard

# Install dependencies (after project initialization)
npm install
```

---

## Infrastructure Tools

### 1. **Docker**

**Windows (WSL2 recommended):**
- Download Docker Desktop from https://www.docker.com/products/docker-desktop
- Enable WSL2 integration

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
```

### 2. **Docker Compose**
```bash
# Usually included with Docker Desktop
# For Linux:
sudo apt-get install docker-compose

# Verify
docker-compose --version
```

### 3. **Kubernetes (Optional)**

**Minikube (for local development):**
```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

---

## Datadog Integration

### Setup Steps

1. **Create Datadog Account**
   - Sign up at https://www.datadoghq.com/
   - Choose the free tier to start

2. **Get API Keys**
   - Navigate to Organization Settings → API Keys
   - Create a new API key
   - Create a new Application key

3. **Store Credentials Securely**
   ```bash
   # Create .env file in project root
   cat > .env << EOF
   DATADOG_API_KEY=your_api_key_here
   DATADOG_APP_KEY=your_app_key_here
   DATADOG_SITE=datadoghq.com
   EOF
   
   # Add .env to .gitignore
   echo ".env" >> .gitignore
   ```

4. **Install Datadog Agent (Optional - for local testing)**
   ```bash
   DD_API_KEY=your_api_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
   ```

---

## Cross-Platform Testing

### For Windows Users

#### Option 1: WSL2 (Recommended)
```powershell
# Enable WSL2
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu

# Set WSL2 as default
wsl --set-default-version 2
```

Then follow Linux instructions within WSL2.

#### Option 2: Linux VM
- Install VirtualBox or VMware
- Create Ubuntu VM
- Configure port forwarding for development

### For macOS Users

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools via Homebrew
brew install cmake gcc boost openssl curl node mongodb-community docker
```

---

## Verification Checklist

After setup, verify your environment:

### C++ Environment
- [ ] CMake is installed (version 3.20+)
- [ ] GCC or Clang compiler is available
- [ ] libcurl-dev is installed
- [ ] boost-dev is installed
- [ ] openssl-dev is installed
- [ ] Can build a simple CMake project

### MERN Environment
- [ ] Node.js is installed (v18+)
- [ ] npm is available
- [ ] MongoDB is running (local or Atlas connection works)
- [ ] Can create and run a basic React app

### Infrastructure
- [ ] Docker is installed and running
- [ ] Docker Compose is available
- [ ] (Optional) Kubernetes cluster is accessible

### Datadog
- [ ] Datadog account created
- [ ] API key obtained
- [ ] Application key obtained
- [ ] Keys stored securely in .env file

---

## Troubleshooting

### Common Issues

**CMake not found:**
```bash
# Add CMake to PATH or reinstall
export PATH=/usr/local/bin:$PATH
```

**MongoDB connection failed:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

**Docker permission denied:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

**Node version conflicts:**
```bash
# Use nvm to manage Node versions
nvm list
nvm use 18
```

---

## Next Steps

1. Initialize the C++ agent project in `cpp-agent/`
2. Set up MERN dashboard in `mern-dashboard/`
3. Configure Docker containers in `infrastructure/`
4. Set up CI/CD pipelines in `scripts/`

For component-specific setup, refer to the README in each directory.
