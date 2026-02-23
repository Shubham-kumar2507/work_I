# Infrastructure Configuration

Docker and Kubernetes configurations for deploying the IoT monitoring system.

## Contents

- Docker configurations
- Docker Compose for local development
- Kubernetes manifests for production
- CI/CD pipeline configurations

## Docker

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services

- **cpp-agent**: C++ monitoring agent container
- **dashboard-backend**: Node.js Express API
- **dashboard-frontend**: React application (nginx)
- **mongodb**: MongoDB database
- **datadog-agent**: Datadog monitoring agent

## Kubernetes

### Prerequisites

- kubectl configured
- Access to Kubernetes cluster (or Minikube for local)

### Deployment

```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n iot-monitoring

# View service endpoints
kubectl get svc -n iot-monitoring
```

### Components

- **Deployments**: Application workloads
- **Services**: Network access to pods
- **ConfigMaps**: Configuration data
- **Secrets**: Sensitive data (API keys, passwords)
- **Ingress**: External access routing

## Directory Structure

```
infrastructure/
├── docker/
│   ├── cpp-agent/
│   │   └── Dockerfile
│   ├── dashboard/
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.frontend
│   └── docker-compose.yml
├── k8s/
│   ├── namespace.yaml
│   ├── deployments/
│   ├── services/
│   ├── configmaps/
│   ├── secrets/
│   └── ingress/
└── ci-cd/
    ├── .github/
    │   └── workflows/
    └── gitlab-ci.yml
```

## Environment Variables

Configuration is managed through:
- `.env` files for Docker Compose
- ConfigMaps for non-sensitive Kubernetes config
- Secrets for sensitive data in Kubernetes

## Next Steps

1. Create Dockerfiles for each component
2. Write docker-compose.yml for local development
3. Create Kubernetes manifests
4. Set up CI/CD pipelines
5. Configure monitoring and logging
