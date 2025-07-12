# Build stage
FROM node:20.19-alpine as builder

WORKDIR /app

# Install system dependencies
RUN apk update && apk add --no-cache python3 make g++ \
    && rm -rf /var/cache/apk/* \
    && corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --immutable

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Runtime stage
FROM node:20.19-alpine as runtime

WORKDIR /app

# Install system dependencies including wget for health check
RUN apk update && apk add --no-cache wget \
    && rm -rf /var/cache/apk/* \
    && corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (Vite preview needs dev dependencies for config)
RUN yarn install --immutable

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.node.json ./

# Create non-root user
RUN adduser -D -s /bin/sh appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 7070

# Environment variables (can be overridden by Docker Compose)
ENV VITE_API_URL=http://lumus:3001
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7070/ || exit 1

# Start the application
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "7070"]
