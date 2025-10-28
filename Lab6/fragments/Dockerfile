# Fragments microservice Dockerfile
# Author: Diba Makki
# Purpose: package the Node.js fragments API into a reusable container

# Stage 1: Build stage
FROM node:22.12.0 AS build

LABEL maintainer="Diba Makki <sdmakki@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app

# Use BuildKit's cache mount for npm dependencies to speed up the install process
RUN --mount=type=cache,target=/root/.npm npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080

# Stage 2: Production stage (lighter runtime image)
FROM node:22.12.0 AS production

# Set environment variables for runtime (optional)
ENV PORT=8080

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

# Expose the necessary port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

