# Production Multi-Stage Dockerfile for SpeakWise AI
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies for both server and client
RUN npm run install:all

# Copy source code
COPY . .

# Build Vite frontend
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy application artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Expose default port
EXPOSE 5000

# Start SpeakWise AI production server
CMD ["node", "server/index.js"]
