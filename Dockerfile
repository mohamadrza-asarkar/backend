# Node.js Express REST API Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build step if needed or run with tsx / node
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npx", "tsx", "server.ts"]
