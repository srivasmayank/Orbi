# Stage 1: Build the React app
FROM node:18-alpine as build

WORKDIR /app

# Copy frontend package files and install dependencies (using --legacy-peer-deps if needed)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend source code and build the app
COPY . .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:stable-alpine

# Copy the built files to Nginx's html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
