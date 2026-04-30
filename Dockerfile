# Install dependencies only when needed
FROM node:22-alpine AS deps
WORKDIR /app

# Install canvas dependencies
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    libc6-compat \
    openssl \
    gcompat

# Set environment variables for Prisma
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=library
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Install dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts

# Generate Prisma client manually
RUN npx prisma generate

# Rebuild the source code only when needed
FROM node:22-alpine AS builder
WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=library

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate
# Build the Next.js app
RUN npm run build

# Production image, copy all necessary files
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the output of the build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npx", "next", "start"]