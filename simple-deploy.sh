#!/bin/bash

echo "🚀 Deploying Smart Campus Portal..."

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Extract project
echo "📂 Extracting project..."
rm -rf ~/smart-campus-portal
mkdir ~/smart-campus-portal
cd ~/smart-campus-portal
unzip -q ~/smart-campus-portal.zip

# Build and run
echo "🔨 Building container..."
sudo docker-compose down 2>/dev/null
sudo docker-compose up -d --build

# Check status
sleep 10
if sudo docker ps | grep -q "smart-campus"; then
    echo "✅ Success! App running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
else
    echo "❌ Failed. Logs:"
    sudo docker-compose logs
fi