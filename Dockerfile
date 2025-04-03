# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start command
CMD ["npm", "start"]