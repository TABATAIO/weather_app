#!/bin/bash
echo "Starting weather app services..."
echo "================================"

#コンポーズ確認
if ! command -v docker &> /dev/null; then
    echo "Docker could not be found. Please install Docker to proceed."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "Docker Compose could not be found. Please install Docker Compose to proceed."
    exit 1
fi

echo "Docker and Docker Compose are installed."

#既存コンテナの停止と削除
echo "Stopping and removing existing containers..."
docker compose down --remove-orphans 2>/dev/null

#イメージのビルドと開始
echo "Building and starting containers..."
docker compose up --build -d

#起動待機
echo "Waiting for services to start..."
sleep 15

#ステータス確認
echo "Checking container status..."
if curl -s http://localhost:3001/ &> /dev/null; then
    echo "Weather app services started successfully!"
else
    echo "Failed to start weather app services. Please check the logs for more details."
    exit 1
fi

echo "All services are up and running."
echo "================================"
echo "main demo: http://localhost:3001/demo.html"
echo "frontend: http://localhost:8080/index.html"
echo "admin panel: http://localhost:8000"
echo "API endpoint: http://localhost:3001/api"
echo "================================"
echo "useful commands:"
echo "status: docker compose ps"
echo "logs: docker compose logs -f"
echo "stop services: docker compose down"
echo "stop completely: docker compose down --rmi all --remove-orphans"
echo "================================"