# Use an official Node.js image as the base
FROM node:18-bullseye-slim

# Install poppler-utils
RUN apt-get update && apt-get install -y poppler-utils && apt-get clean

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]