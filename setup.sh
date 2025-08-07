#!/bin/bash

set -euo pipefail

echo "[1/8] Installing Docker..."
sudo apt-get update -y
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

echo "[2/8] Installing K3s..."
curl -sfL https://get.k3s.io | sh -

echo "[3/8] Configuring kubectl access..."
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config

echo "[4/8] Installing Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

echo "[5/8] Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx

echo "[6/8] Waiting for Ingress Controller to be ready..."
kubectl wait --namespace default \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "[7/8] Installing Cert-Manager..."
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

echo "[8/8] Cloning project and deploying manifests..."
git clone https://github.com/wizzfi1/Wizfi-Microservices.git
cd Wizfi-Microservices

kubectl apply -f k8s/
[ -d monitoring ] && kubectl apply -f monitoring/ || echo "monitoring/ folder not found, skipping..."

echo "DONE: All services deployed. SSL will be provisioned via cert-manager."
