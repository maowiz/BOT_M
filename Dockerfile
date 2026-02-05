# BOT_M Production Dockerfile
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

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

# Generate Prisma client
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
