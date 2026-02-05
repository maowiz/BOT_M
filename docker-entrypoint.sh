#!/bin/sh

echo "==================================="
echo "🚀 Starting BOT_M Full Stack..."
echo "==================================="

# Activate Python virtual environment
export PATH="/app/venv/bin:$PATH"

# Run database migrations
echo "[1/4] Running database migrations..."
cd /app/server
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
echo "[1/4] ✅ Database migrations complete."

# Start Crawl4AI Python service in background
echo "[2/4] Starting Crawl4AI web crawler service..."
cd /app
python3 crawl_service.py &
CRAWLER_PID=$!
echo "[2/4] Crawl4AI started with PID: $CRAWLER_PID"

# Wait for crawler to be ready
echo "[2/4] Waiting for Crawl4AI to initialize..."
sleep 5

# Check if crawler is running
if kill -0 $CRAWLER_PID 2>/dev/null; then
    # Test health endpoint
    curl -s http://127.0.0.1:11235/health > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "[2/4] ✅ Crawl4AI is running and healthy."
    else
        echo "[2/4] ⚠️ Crawl4AI started but health check failed (may still be initializing)."
    fi
else
    echo "[2/4] ❌ WARNING: Crawl4AI may have crashed!"
fi

# Start document collector in background
echo "[3/4] Starting document collector..."
cd /app/collector
node index.js &
COLLECTOR_PID=$!
echo "[3/4] Collector started with PID: $COLLECTOR_PID"

# Wait for collector
sleep 3
if kill -0 $COLLECTOR_PID 2>/dev/null; then
    echo "[3/4] ✅ Collector is running."
else
    echo "[3/4] ❌ WARNING: Collector may have crashed!"
fi

# Start main server
echo "[4/4] Starting main server on port 3001..."
echo "==================================="
echo "🎉 BOT_M is ready!"
echo "   - Main App: http://localhost:3001"
echo "   - Crawler:  http://localhost:11235"
echo "==================================="
cd /app/server
node index.js
