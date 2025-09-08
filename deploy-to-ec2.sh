#!/bin/bash

# Smart Campus Portal - EC2 Deployment Script
echo "🚀 Deploying Smart Campus Portal to EC2..."

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/smart-campus-portal
cd /opt/smart-campus-portal

# Clone or copy your project files here
# git clone <your-repo-url> .

# Build and run the application
sudo docker-compose up -d --build

# Configure firewall (if needed)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"