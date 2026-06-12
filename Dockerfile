FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install dependencies deterministically from lockfile
RUN npm ci

# Copy framework files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Run as non-root user for security
RUN groupadd --gid 1001 appuser && useradd --uid 1001 --gid appuser --shell /bin/bash --create-home appuser \
    && chown -R appuser:appuser /app
USER appuser

# Default command
CMD ["npx", "playwright", "test"]