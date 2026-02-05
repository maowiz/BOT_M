#!/bin/sh

echo "Starting BOT_M..."

# Run database migrations
cd /app/server
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init

# Start collector in background
cd /app/collector
node index.js &

# Start server (serves both API and built frontend)
cd /app/server
node index.js
