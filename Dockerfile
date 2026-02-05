# BOT_M Production Dockerfile v2.1
# Full deployment with Crawl4AI integration
# REBUILD: 2026-02-05-v3 (forces Render to rebuild everything)
FROM node:20-slim

# Install ALL required system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    make \
    g++ \
    git \
    openssl \
    ca-certificates \
    wget \
    curl \
    gnupg \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxshmfence1 \
    libvips-dev \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python crawler service
COPY crawl_service.py /app/crawl_service.py

# Create Python venv and install Crawl4AI
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir crawl4ai fastapi uvicorn pydantic

# Install Playwright browsers
RUN crawl4ai-setup

# Copy ALL source code FIRST (not just package.json)
# This forces a fresh npm install every time source changes
COPY . .

# Install Node.js dependencies (fresh install)
RUN cd server && rm -rf node_modules && yarn install --production=false
RUN cd collector && rm -rf node_modules && yarn install --production=false
RUN cd frontend && rm -rf node_modules && yarn install

# Generate Prisma client
RUN cd server && npx prisma generate

# Build frontend
RUN cd frontend && yarn build

# Copy built frontend to server/public
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Create storage directories
RUN mkdir -p server/storage/documents server/storage/vector-cache server/storage/lancedb
RUN mkdir -p collector/hotdir collector/storage/tmp

# Create placeholder files to prevent crash
RUN echo "# Hotdir placeholder" > collector/hotdir/__HOTDIR__.md
RUN touch collector/storage/tmp/.placeholder

# Expose ports
EXPOSE 3001 11235

# Environment variables
ENV NODE_ENV=production
ENV STORAGE_DIR=/app/server/storage
ENV PATH="/app/venv/bin:$PATH"

# Start script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
