# Deployment Guide - IoT Monitoring Dashboard

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Kubernetes cluster (for production)
- kubectl configured
- Node.js 18+ (for local development)
- GCC/CMake (for C++ agent development)

### Required Accounts
- Datadog account with API keys
- Container registry access (Docker Hub, GitHub Container Registry, etc.)
- Domain name (for production deployment)

---

## Local Development with Docker Compose

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/your-org/iot-dashboard.git
cd iot-dashboard
```

2. **Configure environment variables**
```bash
cp mern-dashboard/backend/.env.example mern-dashboard/backend/.env
# Edit .env with your Datadog API keys and MongoDB URI
```

3. **Start all services**
```bash
cd infrastructure/docker
docker-compose up -d
```

4. **Access the dashboard**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

5. **View logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Start with Datadog Agent

```bash
docker-compose --profile monitoring up -d
```

### Start with Demo C++ Agent

```bash
docker-compose --profile demo up -d
```

---

## Production Deployment to Kubernetes

### Step 1: Prepare Secrets

Create a secrets file (keep this secure!):

```bash
# Create from template
cp infrastructure/k8s/secrets/app-secrets.yaml infrastructure/k8s/secrets/app-secrets-prod.yaml

# Edit with actual values
nano infrastructure/k8s/secrets/app-secrets-prod.yaml
```

**Important**: Use [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) or external secret management in production!

### Step 2: Build and Push Images

```bash
# Build C++ Agent
cd cpp-agent
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
cd ../..

# Build and push Docker images
docker build -t your-registry/iot-agent:latest -f infrastructure/docker/cpp-agent/Dockerfile cpp-agent
docker build -t your-registry/iot-backend:latest -f infrastructure/docker/dashboard/Dockerfile.backend mern-dashboard
docker build -t your-registry/iot-frontend:latest -f infrastructure/docker/dashboard/Dockerfile.frontend mern-dashboard

docker push your-registry/iot-agent:latest
docker push your-registry/iot-backend:latest
docker push your-registry/iot-frontend:latest
```

### Step 3: Update Kubernetes Manifests

Edit `infrastructure/k8s/deployments/dashboard.yaml` to use your image registry:

```yaml
image: your-registry/iot-backend:latest
image: your-registry/iot-frontend:latest
```

Edit `infrastructure/k8s/ingress/ingress.yaml` with your domain:

```yaml
host: your-domain.com
host: api.your-domain.com
```

### Step 4: Deploy

Use the automated script:

```bash
chmod +x scripts/deploy/deploy-k8s.sh
./scripts/deploy/deploy-k8s.sh production
```

Or manually:

```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmaps/
kubectl apply -f infrastructure/k8s/secrets/app-secrets-prod.yaml
kubectl apply -f infrastructure/k8s/deployments/
kubectl apply -f infrastructure/k8s/services/
kubectl apply -f infrastructure/k8s/ingress/
```

### Step 5: Verify Deployment

```bash
# Check pods
kubectl get pods -n iot-monitoring

# Check services
kubectl get svc -n iot-monitoring

# Check ingress
kubectl get ingress -n iot-monitoring

# View logs
kubectl logs -f deployment/dashboard-backend -n iot-monitoring
```

---

## Installing Agents on IoT Devices

### Method 1: One-Click Install (Recommended)

From the dashboard, click "Add Device" to get a custom install command:

```bash
curl -sL https://your-domain.com/install.sh | sudo bash -s device-xyz api-key-123
```

### Method 2: Manual Installation

#### Debian/Ubuntu
```bash
wget https://your-domain.com/packages/iot-agent_1.0.0_amd64.deb
sudo dpkg -i iot-agent_1.0.0_amd64.deb

# Configure
sudo nano /etc/iot-agent/config.json

# Start
sudo systemctl start iot-agent
sudo systemctl enable iot-agent
```

#### From Source
```bash
git clone https://github.com/your-org/iot-dashboard.git
cd iot-dashboard/cpp-agent
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
sudo make install
```

---

## CI/CD with GitHub Actions

The repository includes a complete GitHub Actions workflow for automated builds and deployments.

### Setup

1. **Add secrets to GitHub repository**:
   - `GITHUB_TOKEN` (automatically provided)
   - `KUBECONFIG` (base64-encoded kubeconfig file)
   - `DATADOG_API_KEY`
   - `DATADOG_APP_KEY`

2. **Push to main branch** triggers:
   - Multi-arch Docker builds (amd64, arm64)
   - Package creation (.deb files)
   - Push to container registry
   - Automatic Kubernetes deployment

### Workflow File

Located at `.github/workflows/build-deploy.yml`

---

## Monitoring & Observability

### Health Checks

**Backend**:
```bash
curl http://your-domain.com/api/health
```

**Kubernetes**:
```bash
kubectl get pods -n iot-monitoring
kubectl describe pod <pod-name> -n iot-monitoring
```

### View Logs

**Docker Compose**:
```bash
docker-compose logs -f backend
```

**Kubernetes**:
```bash
kubectl logs -f deployment/dashboard-backend -n iot-monitoring
kubectl logs -f deployment/dashboard-frontend -n iot-monitoring
```

**Agent Logs** (on device):
```bash
sudo journalctl -u iot-agent -f
```

### Datadog Integration

All metrics are automatically sent to Datadog. View them at:
https://app.datadoghq.com/

---

## Scaling

### Horizontal Pod Autoscaling (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dashboard-backend-hpa
  namespace: iot-monitoring
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dashboard-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

For production, use MongoDB Atlas or a managed MongoDB cluster with replica sets.

---

## Backup & Recovery

### MongoDB Backup

```bash
kubectl exec -it mongodb-0 -n iot-monitoring -- mongodump --out /backup
kubectl cp iot-monitoring/mongodb-0:/backup ./mongodb-backup
```

### Restore

```bash
kubectl cp ./mongodb-backup iot-monitoring/mongodb-0:/restore
kubectl exec -it mongodb-0 -n iot-monitoring -- mongorestore /restore
```

---

## Troubleshooting

### Agent Not Connecting

1. Check agent logs: `sudo journalctl -u iot-agent -n 50`
2. Verify network connectivity to dashboard
3. Check API key configuration
4. Ensure Datadog agent is running (if using DogStatsD)

### Backend Not Starting

1. Check MongoDB connection: `kubectl logs deployment/mongodb -n iot-monitoring`
2. Verify secrets are correct: `kubectl get secret dashboard-secrets -n iot-monitoring -o yaml`
3. Check resource limits: `kubectl describe pod <pod-name> -n iot-monitoring`

### Ingress Not Working

1. Check ingress controller is installed: `kubectl get pods -n ingress-nginx`
2. Verify DNS records point to ingress IP
3. Check TLS certificates: `kubectl describe ingress dashboard-ingress -n iot-monitoring`

---

## Security Best Practices

1. **Use secrets management**: Sealed Secrets, HashiCorp Vault, or cloud provider secrets
2. **Enable TLS**: Use cert-manager with Let's Encrypt
3. **Network policies**: Restrict pod-to-pod communication
4. **RBAC**: Limit Kubernetes permissions
5. **Regular updates**: Keep dependencies updated
6. **Security scanning**: Use tools like Trivy for container scanning

---

## Performance Optimization

### Database Indexes

Ensure MongoDB indexes are created:
```javascript
db.devices.createIndex({ "deviceId": 1 }, { unique: true })
db.devices.createIndex({ "status": 1, "lastHeartbeat": -1 })
db.alerts.createIndex({ "deviceId": 1, "enabled": 1 })
```

### Frontend Caching

Nginx is configured with aggressive caching for static assets (1 year).

### Backend Optimization

- Connection pooling enabled by default
- Resource limits prevent memory leaks
- Health checks ensure quick recovery

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/iot-dashboard/issues
- Documentation: https://docs.your-domain.com
- Email: support@your-domain.com
