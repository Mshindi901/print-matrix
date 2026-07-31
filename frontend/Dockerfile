# Stage 1: Build React (TypeScript) app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve compiled static files using lightweight Nginx container
FROM nginx:alpine

# Copy built files (dist or build folder)
COPY --from=builder /app/dist /usr/share/nginx/html 
# Note: If your build output is inside build/ instead of dist/, change /app/dist to /app/build above

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]