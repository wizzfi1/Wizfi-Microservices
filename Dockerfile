FROM ubuntu:22.04

# Install required packages
RUN apt-get update && apt-get install -y \
    curl unzip tar sudo git gnupg2 software-properties-common ca-certificates apt-transport-https lsb-release


# ----------------------------
# Install kubectl
# ----------------------------
ENV KUBECTL_VERSION=v1.30.1

RUN curl -LO https://dl.k8s.io/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl && \
    chmod +x kubectl && mv kubectl /usr/local/bin/kubectl

# ----------------------------
# Install AWS CLI v2
# ----------------------------
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# ----------------------------
# Install Helm
# ----------------------------
ENV HELM_VERSION=v3.14.4

RUN curl -LO https://get.helm.sh/helm-$HELM_VERSION-linux-amd64.tar.gz && \
    tar -zxvf helm-$HELM_VERSION-linux-amd64.tar.gz && \
    mv linux-amd64/helm /usr/local/bin/helm && \
    rm -rf helm-$HELM_VERSION-linux-amd64.tar.gz linux-amd64

# ----------------------------
# Verify installs
# ----------------------------
RUN kubectl version --client && aws --version && helm version
