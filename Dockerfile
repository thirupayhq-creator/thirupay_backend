# ==========================================
# TIRU PAY - Production Dockerfile
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Build application
RUN npm run build


# ==========================================
# Production Image
# ==========================================

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy generated Prisma Client and Prisma runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Application port
EXPOSE 5000

# Start TIRU PAY
CMD ["node", "dist/server.js"]