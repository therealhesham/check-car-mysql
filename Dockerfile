# Stage 1: Dependencies
FROM node:22-slim AS deps
WORKDIR /app

# Install essential build tools for native modules like bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:22-slim AS builder
WORKDIR /app

# Install openssl for prisma generate
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Ensure Prisma uses the correct binary for Debian
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000

# Use npm start to trigger the server.js as defined in package.json
CMD ["npm", "start"]