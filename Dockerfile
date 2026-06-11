FROM mcr.microsoft.com/playwright:v1.60.0-jammy

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy framework files (It copies all files and folders from you local computer's current directory (where the Dockerfile is located) directly into the current working directory of the Docker container.)
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Default command
CMD ["npx", "playwright", "test"]