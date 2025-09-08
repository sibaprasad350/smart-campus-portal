#!/bin/bash

# Quick deployment script for EC2
echo "🚀 Quick Deploy Smart Campus Portal"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and deploy
echo "📦 Building application..."
docker-compose down 2>/dev/null
docker-compose up -d --build

# Wait for container to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if container is running
if docker ps | grep -q "smart-campus-app"; then
    echo "✅ Application is running!"
    echo "🌐 Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost')"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
else
    echo "❌ Application failed to start. Check logs:"
    docker-compose logs
fi