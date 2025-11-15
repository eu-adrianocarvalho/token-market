FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the entire project
COPY . .

# Create uploads directory
RUN mkdir -p ./public/uploads

# Build the application
RUN pnpm build

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]
