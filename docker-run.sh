#!/bin/bash

# Scheduler Docker Setup Script
# This script sets up and runs the Lumus + Umbra containerized application

set -e

echo "🐳 Setting up Scheduler Docker Environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to display usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo "Commands:"
    echo "  up      - Start the application"
    echo "  down    - Stop the application"
    echo "  build   - Build containers"
    echo "  logs    - Show logs"
    echo "  restart - Restart the application"
    echo "  clean   - Clean up containers and volumes"
    echo "  help    - Show this help message"
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking service status..."
    
    # Check if lumus is responding
    if curl -s "http://localhost:3001/api/auth/health" > /dev/null; then
        echo "✅ Lumus API is running at http://localhost:3001"
    else
        echo "❌ Lumus API is not responding"
    fi
    
    # Check if umbra is responding
    if curl -s "http://localhost:7070" > /dev/null; then
        echo "✅ Umbra Frontend is running at http://localhost:7070"
    else
        echo "❌ Umbra Frontend is not responding"
    fi
}

# Main command handling
case "${1:-up}" in
    up)
        echo "🚀 Starting Scheduler application..."
        docker compose up -d
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        check_services
        echo ""
        echo "🎉 Scheduler is now running!"
        echo "📊 API: http://localhost:3001"
        echo "🌐 Frontend: http://localhost:7070"
        ;;
    down)
        echo "🛑 Stopping Scheduler application..."
        docker compose down
        echo "✅ Application stopped"
        ;;
    build)
        echo "🔨 Building containers..."
        docker compose build
        echo "✅ Build completed"
        ;;
    logs)
        echo "📋 Showing application logs..."
        docker compose logs -f
        ;;
    restart)
        echo "🔄 Restarting Scheduler application..."
        docker compose restart
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        check_services
        ;;
    clean)
        echo "🧹 Cleaning up containers and volumes..."
        docker compose down -v --remove-orphans
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    help)
        usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        usage
        exit 1
        ;;
esac
