# BOT_M Production Dockerfile
# Use Debian-based image for Prisma OpenSSL compatibility (libssl.so.1.1)
FROM node:20-slim

# Install ALL required system dependencies
# - Puppeteer/Chromium deps: libnss3, libatk, libcups2, etc.
# - Sharp (image processing): libvips
# - Tesseract (OCR): tesseract-ocr
# - General build: python3, make, g++
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    openssl \
    ca-certificates \
    wget \
    curl \
    gnupg \
    # Puppeteer/Chromium dependencies
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
    # Sharp image processing dependencies
    libvips-dev \
    # Tesseract OCR
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./
COPY server/package.json server/
COPY collector/package.json collector/
COPY frontend/package.json frontend/

# Install dependencies
RUN cd server && yarn install --production=false
RUN cd collector && yarn install --production=false
RUN cd frontend && yarn install

# Copy source code
COPY . .

# Generate Prisma client for linux target
RUN cd server && npx prisma generate

# Build frontend
RUN cd frontend && yarn build

# Copy built frontend to server/public (where server expects it)
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Create storage directories
RUN mkdir -p server/storage/documents server/storage/vector-cache server/storage/lancedb

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV STORAGE_DIR=/app/server/storage

# Start script - runs all services
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
