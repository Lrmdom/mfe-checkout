# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Install corepack and enable pnpm globally for this stage
RUN corepack enable pnpm

# Install dependencies, including dev dependencies for dev mode
# We use 'base' here because we want all dependencies for dev mode
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (production and development) for dev mode
# --frozen-lockfile is good for reproducibility
RUN pnpm install


# No separate 'builder' stage needed for dev mode, as we're not building for production output
# We just need to copy the source and run it directly.

# Production image - this will now be your "dev mode" image
FROM base AS runner
WORKDIR /app

# Set NODE_ENV to development
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"



# Copy all source code from the initial context
# This is crucial for dev mode as it needs all source files
COPY . .

# Copy ALL node_modules from the 'deps' stage (including dev deps)
COPY --from=deps /app/node_modules ./node_modules

# Ensure public assets are available
# If not copied with COPY ., this might be needed. Adjust based on your COPY . behavior
# COPY public ./public



EXPOSE 3000

# --- THE KEY CHANGE FOR DEV MODE ---
# Run your dev command. Ensure this command actually starts a server that listens on $PORT
CMD ["pnpm", "start"]