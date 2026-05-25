# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build || npx tsc

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Cài đặt Tectonic, fontconfig và bộ Microsoft Core Fonts (bao gồm Times New Roman)
RUN apk add --no-cache tectonic msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Expose port
EXPOSE 5000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
