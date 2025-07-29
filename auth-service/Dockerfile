# Use Node LTS
FROM node:18-alpine

# Set working dir
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

# Expose and run
EXPOSE 3000
CMD ["npm", "start"]
