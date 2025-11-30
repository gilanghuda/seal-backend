FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY . .
ARG RUN_BUILD=false
RUN if [ "$RUN_BUILD" = "true" ]; then npm run build; else echo "Skipping build (RUN_BUILD != true)"; fi

FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs -G nodejs

COPY --from=builder /app /app

RUN npm ci --only=production && npm cache clean --force

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- --timeout=2 http://localhost:3333/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/server.js"]
