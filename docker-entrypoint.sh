#!/bin/sh

echo "==================================="
echo "Starting BOT_M..."
echo "==================================="

# Run database migrations
echo "[1/3] Running database migrations..."
cd /app/server
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
echo "[1/3] Database migrations complete."

# Start collector in background
echo "[2/3] Starting document collector..."
cd /app/collector
node index.js &
COLLECTOR_PID=$!
echo "[2/3] Collector started with PID: $COLLECTOR_PID"

# Wait a moment and check if collector is still running
sleep 3
if kill -0 $COLLECTOR_PID 2>/dev/null; then
    echo "[2/3] Collector is running."
else
    echo "[2/3] WARNING: Collector may have crashed!"
fi

# Start server (serves both API and built frontend)
echo "[3/3] Starting main server..."
cd /app/server
node index.js
