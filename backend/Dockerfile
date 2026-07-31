FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Expose Express server port
EXPOSE 9000

CMD ["node", "server.js"]