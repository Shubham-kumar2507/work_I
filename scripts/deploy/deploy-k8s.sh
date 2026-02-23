#!/bin/bash
# Deploy to Kubernetes cluster

set -e

NAMESPACE="iot-monitoring"
CONTEXT=${1:-"default"}

echo "Deploying IoT Dashboard to Kubernetes..."
echo "Context: ${CONTEXT}"
echo "Namespace: ${NAMESPACE}"

# Switch context
kubectl config use-context "${CONTEXT}"

# Create namespace
kubectl apply -f infrastructure/k8s/namespace.yaml

# Apply ConfigMaps
echo "Applying ConfigMaps..."
kubectl apply -f infrastructure/k8s/configmaps/

# Apply Secrets (should be encrypted in production!)
echo "Applying Secrets..."
kubectl apply -f infrastructure/k8s/secrets/

# Apply Deployments
echo "Deploying applications..."
kubectl apply -f infrastructure/k8s/deployments/

# Wait for MongoDB to be ready
echo "Waiting for MongoDB..."
kubectl wait --for=condition=ready pod -l app=mongodb -n ${NAMESPACE} --timeout=300s

# Apply Services
echo "Creating services..."
kubectl apply -f infrastructure/k8s/services/

# Apply Ingress
echo "Configuring ingress..."
kubectl apply -f infrastructure/k8s/ingress/

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/dashboard-backend -n ${NAMESPACE}
kubectl rollout status deployment/dashboard-frontend -n ${NAMESPACE}

echo ""
echo "Deployment complete!"
echo ""
echo "Services:"
kubectl get svc -n ${NAMESPACE}
echo ""
echo "Pods:"
kubectl get pods -n ${NAMESPACE}
echo ""
echo "Ingress:"
kubectl get ingress -n ${NAMESPACE}
echo ""
echo "Access dashboard at the ingress URL shown above"
