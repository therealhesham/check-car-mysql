# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate
# Build the Next.js app
RUN npm run build

# Install `serve` to serve the app
RUN npm install -g serve

# Production image, copy all necessary files
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy only the output of the build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npx", "next", "start"]
