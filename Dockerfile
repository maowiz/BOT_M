# BOT_M Production Dockerfile
# Full deployment with Crawl4AI integration
FROM node:20-slim

# Install ALL required system dependencies
# - Python for Crawl4AI
# - Chromium/Playwright deps for web crawling
# - Sharp/Tesseract for document processing
RUN apt-get update && apt-get install -y \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    # Build tools
    make \
    g++ \
    git \
    # SSL/Crypto
    openssl \
    ca-certificates \
    # Utilities
    wget \
    curl \
    gnupg \
    # Chromium/Playwright dependencies
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
    # Sharp image processing
    libvips-dev \
    # Tesseract OCR
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python crawler service first
COPY crawl_service.py /app/crawl_service.py

# Create Python virtual environment and install Crawl4AI
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir crawl4ai fastapi uvicorn pydantic

# Install Playwright browsers for Crawl4AI
RUN crawl4ai-setup

# Copy Node.js package files
COPY package.json yarn.lock* ./
COPY server/package.json server/
COPY collector/package.json collector/
COPY frontend/package.json frontend/

# Install Node.js dependencies
RUN cd server && yarn install --production=false
RUN cd collector && yarn install --production=false
RUN cd frontend && yarn install

# Copy source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build frontend
RUN cd frontend && yarn build

# Copy built frontend to server/public
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Create storage directories
RUN mkdir -p server/storage/documents server/storage/vector-cache server/storage/lancedb

# Expose ports (3001 for app, 11235 for crawler)
EXPOSE 3001 11235

# Environment variables
ENV NODE_ENV=production
ENV STORAGE_DIR=/app/server/storage
ENV PATH="/app/venv/bin:$PATH"

# Start script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
