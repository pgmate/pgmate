# Stage 1: Build the React app
FROM node:20-alpine as build

# Set working directory
WORKDIR /app


# Copy package.json
COPY package.json ./

# Install dependencies
ENV NODE_ENV=development
RUN npm install

RUN npm install && \
    if [ "$(uname -s)" = "Linux" ] && [ "$(uname -m)" = "x86_64" ]; then \
      npm install @rollup/rollup-linux-x64-musl --save-dev; \
    fi

# Copy the rest of the application
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Install curl
RUN apk --no-cache add curl

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

# Expose port 80
EXPOSE 8080

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
