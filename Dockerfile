# ---- Base ----
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only (uses package-lock.json for reproducible builds)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY --chown=node:node . .

# Run as the built-in non-root user
USER node

# Default port (overridable via the PORT env var)
EXPOSE 3000

CMD ["node", "server.js"]
