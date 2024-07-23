# Stage 1: Build
#####################

# Use big image for build stage in case tools like gcc are needed to compile packages
FROM node:20.13.1 AS build

# Update and set up dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init=1.2.5-2

# Set environment variables for the build stage
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production


# Stage 2: Production
#####################

# Use a smaller image for the production stage, but avoid alpine in case it causes issues
FROM node:20.13.1-bullseye-slim AS production

LABEL maintainer="Liam Toye <lctoye@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set environment variables for the runtime stage
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy dumb-init from the build stage
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

# Copy only the necessary files from the build stage and set correct ownership
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules

# Copy source files to /app/
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# We have to run as root to use port 80
# hadolint ignore=DL3002
USER root

# Start the container by running our server
CMD ["dumb-init", "node", "src/index.js"]

# Expose port 8080/whatever is defined in the PORT environment variable
EXPOSE ${PORT}

# Define a healthcheck command
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost/ || exit 1
