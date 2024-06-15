# Stage 1: Build
#####################
FROM node:20.13.1-alpine AS build

# Set environment variables for the build stage
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Stage 2: Production
#####################
FROM node:20.13.1-alpine AS production

LABEL maintainer="Liam Toye <lctoye@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set environment variables for the runtime stage
ENV PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy only the necessary files from the build stage and set correct ownership
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules

# Copy source files to /app/
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Use a non-root user
USER node

# Use a lightweight init system with signals support
ENTRYPOINT ["dumb-init", "--"]

# Expose port 8080
EXPOSE 8080

# Start the container by running our server
CMD ["node", "src/index.js"]
