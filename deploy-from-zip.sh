#!/bin/bash

echo "🚀 Deploying Smart Campus Portal from ZIP..."

# Update system and install dependencies
sudo yum update -y
sudo yum install -y docker unzip
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Extract project
echo "📂 Extracting project files..."
rm -rf ~/smart-campus-portal
mkdir -p ~/smart-campus-portal
cd ~/smart-campus-portal
unzip -q ~/smart-campus-portal.zip

# Make scripts executable
chmod +x *.sh

# Build and deploy
echo "🔨 Building Docker container..."
sudo docker-compose down 2>/dev/null
sudo docker-compose up -d --build

# Wait for container to start
echo "⏳ Waiting for application to start..."
sleep 15

# Check status
if sudo docker ps | grep -q "smart-campus"; then
    echo "✅ Application deployed successfully!"
    echo "🌐 Access at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo ""
    echo "📊 Container Status:"
    sudo docker-compose ps
else
    echo "❌ Deployment failed. Checking logs..."
    sudo docker-compose logs
fi

# Clean up
rm ~/smart-campus-portal.zip